import config from '../config';
import fs, { existsSync } from 'fs';
import path from 'path';
import { NodesByType, GetCurrentGraph, GetDispatchFunc, UIC, GRAPHS } from '../actions/uiactions';
import { NodeTypes } from '../constants/nodetypes';
import { uuidv4 } from '../utils/array';
import { Node, Graph } from '../methods/graph_types';
import prune from '../methods/prune';
import NameService from './nameservice';
import mergeGraph from '../methods/mergeGraph';

export default class JobService {
	static async getAgents() {
		const agentFolder = path.join(config.distributionPath, AGENTS_FOLDER);
		if (fs.existsSync(agentFolder)) {
			let agents = getDirectories(agentFolder);
			return agents;
		}

		return [];
	}
	static async getAgentProjects(): Promise<any> {
		const agentFolder = path.join(config.distributionPath, AGENTS_FOLDER);
		const agents = await JobService.getAgents();
		const projects: any = [];
		agents.forEach((agent) => {
			projects.push(...getDirectories(path.join(agentFolder, agent)));
		});
		return projects;
	}

	static async getAgentDirectories(): Promise<string[]> {
		const agentFolder = path.join(config.distributionPath, AGENTS_FOLDER);
		const agents = await JobService.getAgents();
		const projects: any = [];
		agents.forEach((agent) => {
			projects.push(
				...getDirectories(path.join(agentFolder, agent)).map((dir) => path.join(agentFolder, agent, dir))
			);
		});
		return projects;
	}

	static async BreakFile(relPath: string, fileName: string, chunkFolder: string, chunkName: string, content: string) {
		let chunks: string[] = content.split('').chunk(Math.pow(2, 20));
		await ensureDirectory(path.join(relPath, chunkFolder));
		let files: string[] = [];
		await chunks.forEachAsync(async (chunk: string[], i: number) => {
			let chunkPath = path.join(relPath, chunkFolder, chunkName + i);
			files.push(path.join(chunkFolder, chunkName + i));
			fs.writeFileSync(chunkPath, chunk.join(''), 'utf8');
		});
		let jobContent: JobOutput = {
			files
		};
		fs.writeFileSync(path.join(relPath, fileName), JSON.stringify(jobContent), 'utf8');
	}
	static async JoinFile(relPath: string, fileName: string): Promise<string> {
		let fileContents: string = fs.readFileSync(path.join(relPath, fileName), 'utf8');
		let parsedResult = JSON.parse(fileContents);
		if (parsedResult && (parsedResult.workspace || parsedResult.version)) {
			return fileContents;
		}
		let fileDetails: JobOutput = parsedResult;
		let contents: string = '';
		fileDetails.files.forEach((file) => {
			contents = contents + fs.readFileSync(path.join(relPath, file));
		});

		return contents;
	}
	static async CanJoinFiles(relPath: string, fileName: string): Promise<boolean> {
		let fileContents: string = fs.readFileSync(path.join(relPath, fileName), 'utf8');
		let fileDetails: JobOutput = JSON.parse(fileContents);
		let contents: boolean = true;
		fileDetails.files.forEach((file) => {
			if (contents) {
				contents = contents && fs.existsSync(path.join(relPath, file));
				if (contents) {
					let guts = fs.readFileSync(path.join(relPath, file), 'utf8');
					contents = contents && !!guts.length;
				}
			}
		});

		return contents;
	}
	static async copyFiles(srcFolder: string, outFolder: string) {
		let filesToCopy = getFiles(srcFolder);
		await filesToCopy.forEachAsync(async (file: string) => {
			await ensureDirectory(outFolder);
			fs.copyFileSync(path.join(srcFolder, file), path.join(outFolder, file));
		});
	}

	static deleteFolder(folder: string) {
		if (fs.existsSync(folder)) {
			let files = getFiles(folder);
			files.forEach((file) => {
				fs.unlinkSync(path.join(folder, file));
			});
			let dirs = getDirectories(folder);
			dirs.forEach((dir) => {
				JobService.deleteFolder(path.join(folder, dir));
			});
		}
	}

	static async StartJob(command: string, currentJobFile: JobFile, batchSize: number = 1): Promise<Job> {
		let job = await JobService.CreateJob(command, batchSize);
		job = await JobService.DistributeJobs(job);
		currentJobFile.jobPath = path.join(JOB_PATH, job.name, JOB_NAME);
		return job;
	}

	static async WaitForJob(command: string, currentJobFile: JobFile) {
		let complete = false;
		console.log('wait for job completion');
		do {
			let job = await JobService.loadJob(currentJobFile.jobPath);
			complete = await JobService.IsComplete(job);
			await sleep();
		} while (!complete);
	}

	static async CollectForJob(currentJobFile: JobFile) {
		// Collect the job parts into a graph again.
		await sleep(5 * 1000);
		let currentJob: Job = await JobService.loadJob(currentJobFile.jobPath);
		console.log('collecting job results');
		await JobService.CollectJobResults(currentJob);
		console.log('merge job results');
		let graph = await JobService.MergeCompletedJob(currentJob);
		if (graph) {
			await setCurrentGraph(graph);
			await writeGraphToFile(graph, currentJobFile.graphPath);
		} else {
			throw new Error('graph shouldnt be null, CollectForJob, jobservice.ts');
		}
		// Save the new graph, and continue with the job.
	}

	static async loadJob(filePath: string | undefined): Promise<Job> {
		if (filePath) {
			let fileContents = fs.readFileSync(filePath, 'utf8');
			let job: Job = JSON.parse(fileContents);
			return job;
		} else {
			throw new Error('no job to load: jobservice.ts');
		}
	}

	static async CreateJob(command: string, batchSize: number = 1): Promise<Job> {
		let models: string[] = NodesByType(null, NodeTypes.Model).map((x: Node) => x.id);
		// let targets = await JobService.getAgentDirectories();
		let graph = GetCurrentGraph();
		let chunks = models.chunk(batchSize || 1);
		if (!fs.existsSync(JOB_PATH)) {
			fs.mkdirSync(JOB_PATH);
		}

		const jobName = `job_${uuidv4().split('-')[0]}`;
		if (!fs.existsSync(path.join(JOB_PATH, jobName))) {
			fs.mkdirSync(path.join(JOB_PATH, jobName));
		}

		JobService.BreakFile(
			path.join(JOB_PATH, jobName),
			GRAPH_FILE,
			GRAPH_FOLDER,
			GRAPH_FILE_PARTS,
			JSON.stringify(prune(graph))
		);

		let jobparts: string[] = [];
		await chunks.forEachAsync(async (chunk: any) => {
			let temp: JobConfigContract = {
				filter: { models: chunk },
				complete: false,
				updated: Date.now(),
				command,
				distributed: false
			};

			let jobpart = `part_${uuidv4().split('-')[0]}`;

			await ensureDirectory(path.join(JOB_PATH, jobName, jobpart));
			fs.writeFileSync(path.join(JOB_PATH, jobName, jobpart, INPUT), JSON.stringify(temp), 'utf8');
			jobparts.push(jobpart);
		});

		let job: Job = {
			name: jobName,
			nickName: NameService.superHeroName(),
			parts: jobparts,
			assignments: null,
			complete: false,
			updated: Date.now(),
			configAbsolutePath: '',
			jobInstancePath: '',
			absolutePath: ''
		};
		fs.writeFileSync(path.join(JOB_PATH, jobName, JOB_NAME), JSON.stringify(job), 'utf8');
		return job;
	}
	static async getJobs(jpath: string = ''): Promise<Job[]> {
		let results: Job[] = [];
		if (fs.existsSync(jpath || JOB_PATH)) {
			let jobs = getDirectories(jpath || JOB_PATH);
			jobs.map((job) => {
				if (fs.existsSync(path.join(jpath || JOB_PATH, job, JOB_NAME))) {
					let content = fs.readFileSync(path.join(jpath || JOB_PATH, job, JOB_NAME), 'utf8');
					let config: Job = JSON.parse(content);
					results.push(config);
				}
			});
		}
		return results;
	}
	static async SetJobPartComplete(jobPartPath: string) {
		let inputPath: string = path.join(jobPartPath, INPUT);
		if (fs.existsSync(path.join(jobPartPath, INPUT))) {
			let jobInput: JobConfigContract = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
			jobInput.complete = true;
			fs.writeFileSync(inputPath, JSON.stringify(jobInput), 'utf8');
		}
	}
	static getJobItemLocalPath(jobItem: JobItem): string {
		return path.join(JOB_PATH, jobItem.job, jobItem.file, INPUT);
	}
	static async getJobItems(): Promise<JobItem[]> {
		let results: JobItem[] = [];
		if (fs.existsSync(JOB_PATH)) {
			let jobs = getDirectories(JOB_PATH);
			jobs.map((job) => {
				getDirectories(path.join(JOB_PATH, job)).map((fileDir) => {
					if (fs.existsSync(path.join(JOB_PATH, job, fileDir, INPUT))) {
						let content = fs.readFileSync(path.join(JOB_PATH, job, fileDir, INPUT), 'utf8');
						let config: JobConfigContract = JSON.parse(content);
						results.push({
							job,
							file: fileDir,
							distributed: config.distributed,
							config
						});
					}
				});
			});
		}
		return results;
	}
	static async getUndistributedJobItems(): Promise<JobItem[]> {
		let jobs = await JobService.getJobItems();
		return jobs.filter((x: JobItem) => !x.distributed);
	}
	static async getDistributedJobItems(): Promise<JobItem[]> {
		let jobs = await JobService.getJobItems();
		return jobs.filter((x: JobItem) => !x.distributed);
	}

	static async saveJobItem(jobItem: JobItem) {
		let jobItemPath: string = JobService.getJobItemLocalPath(jobItem);
		fs.writeFileSync(jobItemPath, JSON.stringify(jobItem));
	}
	static async DistributeJobs(jobToDistribute: Job): Promise<Job> {
		let directories: string[] = await JobService.getAgentDirectories();
		if (!directories.length) {
			throw new Error('no agents in system');
		}
		let directoryIndex = 0;
		let jobs: JobItem[] = await JobService.getUndistributedJobItems();
		let jobAssignments: JobAssignments = {};
		await jobs
			.filter((jobItem: JobItem) => {
				if (jobToDistribute) {
					return jobToDistribute.name === jobItem.job;
				}
				return true;
			})
			.forEachAsync(async (jobItem: JobItem) => {
				let dir = directories[directoryIndex];
				let relativeFolder = path.join(dir, jobItem.job, jobItem.file);
				jobItem.distributed = true;
				await JobService.saveJobItem(jobItem);
				let absoluteFolder = path.resolve(relativeFolder);
				await ensureDirectory(absoluteFolder);

				if (!fs.existsSync(path.join(dir, jobItem.job, GRAPH_FILE))) {
					fs.copyFileSync(
						path.join(JOB_PATH, jobItem.job, GRAPH_FILE),
						path.join(dir, jobItem.job, GRAPH_FILE)
					);
					await JobService.copyFiles(
						path.join(JOB_PATH, jobItem.job, GRAPH_FOLDER),
						path.join(dir, jobItem.job, GRAPH_FOLDER)
					);
					fs.copyFileSync(path.join(JOB_PATH, jobItem.job, JOB_NAME), path.join(dir, jobItem.job, JOB_NAME));
				}

				fs.copyFileSync(
					path.join(JOB_PATH, jobItem.job, jobItem.file, INPUT),
					path.join(dir, jobItem.job, jobItem.file, INPUT)
				);
				jobAssignments[jobItem.job] = jobAssignments[jobItem.job] || {};
				jobAssignments[jobItem.job][dir] = jobAssignments[jobItem.job][dir] || [];
				jobAssignments[jobItem.job][dir].push(jobItem);
				directoryIndex++;
				directoryIndex = directoryIndex % directories.length;
			});

		Object.keys(jobAssignments).forEach((job) => {
			let configContent = fs.readFileSync(path.join(JOB_PATH, job, JOB_NAME), 'utf8');
			if (configContent) {
				let config: Job = JSON.parse(configContent);
				config.assignments = jobAssignments[job];
				fs.writeFileSync(path.join(JOB_PATH, job, JOB_NAME), JSON.stringify(config), 'utf8');
				jobToDistribute = config;
			} else {
				throw new Error('no config content found');
			}
		});
		return jobToDistribute;
	}

	static async CollectJobResults(selectedJob?: Job) {
		let jobs: Job[] = await JobService.getJobs();
		if (selectedJob) {
			jobs = jobs.filter((x: Job) => x.name === selectedJob.name);
		}
		if (jobs.length === 0) {
			throw 'no jobs to collect results for';
		}
		for (let i: any = 0; i < jobs.length; i++) {
			let job = jobs[i];
			try {
				let isDone = await JobService.IsComplete(job);
				if (isDone) {
					await JobService.MoveCompletedJob(job);
					//	await JobService.CleanUpJob(job);
				}
			} catch (e) {}
		}
	}
	static CleanUpJob(job: Job) {
		let { assignments } = job;
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				return remoteDirectories.forEach((assignmentDir) => {
					let jobAssignment = assignments ? assignments[assignmentDir] : null;
					if (!jobAssignment) {
						throw new Error('no assignments');
					}
					jobAssignment.forEach((job) => {
						JobService.deleteFolder(path.join(assignmentDir, job.job));
					});
				});
			}
		}
	}
	static async MoveCompletedJob(job: Job): Promise<boolean> {
		let { assignments } = job;
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				return await remoteDirectories.forEachAsync(async (assignmentDir: string) => {
					let jobAssignment = assignments ? assignments[assignmentDir] : [];
					return await jobAssignment.forEachAsync(async (job: JobItem) => {
						let jobPartOutput: string = await JobService.JoinFile(
							path.join(assignmentDir, job.job, job.file),
							OUTPUT
						);
						if (jobPartOutput) {
							await ensureDirectory(path.join(JOB_PATH, job.job, job.file));
							fs.writeFileSync(path.join(JOB_PATH, job.job, job.file, OUTPUT), jobPartOutput, 'utf8');
							return true;
						}
						console.error(job);
						console.error(job.job);
						console.error(job.file);
						console.error(assignmentDir);
						console.error('cant move completed job back because of missing file.');
						throw new Error('missing job file');
					});
				});
			}
			return true;
		}
		return false;
	}

	static async MergeCompletedJob(job: Job): Promise<Graph | null> {
		console.log('merging completed job');
		let intermedita: { [index: string]: Graph } = {};
		job.parts.forEachAsync(async (part: string) => {
			let graphOutput = await JobService.JoinFile(path.join(JOB_PATH, job.name, part), OUTPUT);
			intermedita[part] = JSON.parse(graphOutput);
		});

		let mergedGraph: Graph | null = null;
		await job.parts.forEachAsync(async (part: string) => {
			if (!intermedita[part]) {
				throw new Error('intermedita[part] cant be falsy;');
			}
			mergedGraph = mergeGraph(mergedGraph, intermedita[part]);
			if (!mergedGraph) {
				throw new Error('graph should have been merged');
			}
		});

		console.log('merged completed job');

		return mergedGraph;
	}

	static async IsComplete(job: Job) {
		let { assignments } = job;
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				let completed = true;
				for (let i = 0; i < remoteDirectories.length; i++) {
					let assignmentDir = remoteDirectories[i];
					completed = completed && (await JobService.IsJobAssignmentComplete(assignments, assignmentDir));
					if (!completed) {
						console.log('job not is completed');
						return false;
					}
				}
				console.log('job is completed');
				return true;
			}
			throw new Error('no assignments assigned');
		}
		console.log('job not is completed: no assignments');
		return false;
	}

	static async JobProgress(job: Job) {
		let { assignments } = job;
		let result = { total: 0, complete: 0 };
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				let completed = true;
				for (let i = 0; i < remoteDirectories.length; i++) {
					let assignmentDir = remoteDirectories[i];
					completed = completed && (await JobService.IsJobAssignmentComplete(assignments, assignmentDir));
					if (completed) {
						result.complete++;
					}
					result.total++;
				}
				return result;
			}
			throw new Error('no assignments assigned');
		}
		return result;
	}
	static async WriteJob(jobFile: JobFile, graph: string) {
		let projectName = `${NameService.projectGenerator()}_${uuidv4().split('-')[0]}`;
		await ensureDirectory(path.join(JOBS_FILE_PATH, projectName));
		jobFile.originalGraphPath = jobFile.graphPath;
		jobFile.graphPath = path.resolve(path.join(JOBS_FILE_PATH, projectName, GRAPH_FILE));
		fs.writeFileSync(path.join(JOBS_FILE_PATH, projectName, JOB_NAME), JSON.stringify(jobFile), 'utf8');
		fs.writeFileSync(path.join(JOBS_FILE_PATH, projectName, GRAPH_FILE), graph, 'utf8');
	}
	static async saveJobFile(jobFilePath: string, jobFile: JobFile) {
		jobFile.updated = Date.now();
		fs.writeFileSync(jobFilePath, JSON.stringify(jobFile));
	}
	static async JobAssignmentProgress(assignments: JobAssignment, assignmentDir: string): Promise<Progress> {
		let jobAssignment: JobItem[] | null = assignments ? assignments[assignmentDir] : null;
		let result = { total: 0, complete: 0 };
		if (!jobAssignment) {
			throw new Error('no assignments');
		}
		//					return !jobAssignment.some((job: JobItem) => {
		let completed = true;
		for (let i = 0; i < jobAssignment.length; i++) {
			let job = jobAssignment[i];
			let isComplete = await JobService.IsJobItemComplete(job, assignmentDir);
			completed = completed && isComplete;
			if (completed) {
				result.complete++;
			}
			result.total++;
		}
		return result;
	}

	static async IsJobAssignmentComplete(assignments: JobAssignment, assignmentDir: string): Promise<boolean> {
		let jobAssignment: JobItem[] | null = assignments ? assignments[assignmentDir] : null;
		if (!jobAssignment) {
			throw new Error('no assignments');
		}
		//					return !jobAssignment.some((job: JobItem) => {
		let completed = true;
		for (let i = 0; i < jobAssignment.length; i++) {
			let job = jobAssignment[i];
			let isComplete = await JobService.IsJobItemComplete(job, assignmentDir);
			completed = completed && isComplete;
			if (!completed) {
				return false;
			}
		}
		return true;
	}

	static async IsJobItemComplete(jobItem: JobItem, assignmentDir: string): Promise<boolean> {
		if (fs.existsSync(path.join(assignmentDir, jobItem.job, jobItem.file, INPUT))) {
			let content = fs.readFileSync(path.join(assignmentDir, jobItem.job, jobItem.file, INPUT), 'utf8');
			let contract: JobConfigContract = JSON.parse(content);
			if (contract) {
				if (!contract.complete) {
					return false;
				}
				return await JobService.CanJoinFiles(path.join(assignmentDir, jobItem.job, jobItem.file), OUTPUT);
			}
		}
		return false;
	}
}
const JOB_NAME = `config.json`;
const JOB_PATH = './job_service_jobs';
const JOBS_FILE_PATH = './jobs';
const GRAPH_FILE = `graph.json`;
const GRAPH_FILE_PARTS = 'graph_part';
const GRAPH_FOLDER = 'graph';
const INPUT = 'input.json';
const AGENTS_FOLDER = 'agents';
const OUTPUT = 'output.json';
const OUTPUT_FOLDER = 'output';
const OUTPUT_CHUNK = 'output_chunk_';
export const JobServiceConstants = {
	INPUT,
	OUTPUT,
	GRAPH_FILE,
	OUTPUT_CHUNK,
	JOB_NAME,
	JOBS_FILE_PATH,
	OUTPUT_FOLDER,
	GRAPH_FILE_PARTS,
	GRAPH_FOLDER
};
export interface Progress {
	total: number;
	complete: number;
}
export interface JobConfigContract {
	complete: boolean;
	updated: number;
	command: string;
	distributed: boolean;
	filter: {
		models: string[];
	};
}
export interface Job {
	name: string;
	nickName: string;
	complete: boolean;
	assignments: JobAssignment | null;
	updated: number;
	parts: string[];
	absolutePath: string;
	configAbsolutePath: string;
	jobInstancePath: string;
}
export interface JobAssignments {
	[index: string]: JobAssignment;
}
export interface JobAssignment {
	[dir: string]: JobItem[];
}
export interface JobItem {
	job: string;
	file: string;
	distributed: boolean;
	config: JobConfigContract;
}
export interface JobOutput {
	files: string[];
}
export interface JobFile {
	updated?: number;
	jobPath?: string;
	created: boolean;
	originalGraphPath?: string;
	graphPath: string;
	error?: string;
	step?: string;
}

const isDirectory = (source: any) => fs.lstatSync(source).isDirectory();

export const getDirectories = (source: any) =>
	fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));

export const getFiles = (source: any) => fs.readdirSync(source).filter((name) => !isDirectory(path.join(source, name)));

export async function ensureDirectory(dir: any) {
	if (!fs.existsSync(dir)) {
		console.log(`doesnt exist : ${dir}`);
	} else {
	}
	const _dir_parts = dir.split(path.sep);
	_dir_parts.map((_: any, i: number) => {
		if (i > 1 || _dir_parts.length - 1 === i) {
			let tempDir = path.join(..._dir_parts.subset(0, i + 1));
			if (dir.startsWith(path.sep)) {
				tempDir = `${path.sep}${tempDir}`;
			}
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir);
			}
		}
	});
}

export function sleep(ms: number = 10 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function writeGraphToFile(currentGraph: Graph, filePath: string) {
	let savecontent = JSON.stringify(prune(currentGraph));
	fs.writeFileSync(filePath, savecontent, 'utf8');
}

async function setCurrentGraph(graph: Graph) {
	let dispatch = GetDispatchFunc();
	dispatch(UIC(GRAPHS, graph.id, graph));
}
