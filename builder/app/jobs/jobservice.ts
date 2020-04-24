import config from '../config';
import fs, { existsSync } from 'fs';
import path from 'path';
import { NodesByType, GetCurrentGraph } from '../actions/uiactions';
import { NodeTypes } from '../constants/nodetypes';
import { uuidv4 } from '../utils/array';
import { Node } from '../methods/graph_types';
import prune from '../methods/prune';

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
		let fileDetails: JobOutput = JSON.parse(fileContents);
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
	static async CreateJob(command: string, batchSize: number = 1) {
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
			parts: jobparts,
			assignments: null,
			complete: false,
			updated: Date.now(),
			configAbsolutePath: '',
			jobInstancePath: '',
			absolutePath: ''
		};
		fs.writeFileSync(path.join(JOB_PATH, jobName, JOB_NAME), JSON.stringify(job), 'utf8');
	}
	static async getJobs(): Promise<Job[]> {
		let results: Job[] = [];
		if (!fs.existsSync(JOB_PATH)) {
			let jobs = getDirectories(JOB_PATH);
			jobs.map((job) => {
				if (fs.existsSync(path.join(JOB_PATH, job, JOB_NAME))) {
					let content = fs.readFileSync(path.join(JOB_PATH, job, JOB_NAME), 'utf8');
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
	static async DistributeJobs() {
		let directories: string[] = await JobService.getAgentDirectories();
		if (!directories.length) {
			throw new Error('no agents in system');
		}
		let directoryIndex = 0;
		let jobs: JobItem[] = await JobService.getUndistributedJobItems();
		let jobAssignments: JobAssignments = {};
		await jobs.forEachAsync(async (job: JobItem) => {
			let dir = directories[directoryIndex];
			let relativeFolder = path.join(dir, job.job, job.file);
			let absoluteFolder = path.resolve(relativeFolder);
			await ensureDirectory(absoluteFolder);

			if (!fs.existsSync(path.join(dir, job.job, GRAPH_FILE))) {
				fs.copyFileSync(path.join(JOB_PATH, job.job, GRAPH_FILE), path.join(dir, job.job, GRAPH_FILE));
				await JobService.copyFiles(
					path.join(JOB_PATH, job.job, GRAPH_FOLDER),
					path.join(dir, job.job, GRAPH_FOLDER)
				);
				fs.copyFileSync(path.join(JOB_PATH, job.job, JOB_NAME), path.join(dir, job.job, JOB_NAME));
			}

			fs.copyFileSync(path.join(JOB_PATH, job.job, job.file, INPUT), path.join(dir, job.job, job.file, INPUT));
			jobAssignments[job.job] = jobAssignments[job.job] || {};
			jobAssignments[job.job][dir] = jobAssignments[job.job][dir] || [];
			jobAssignments[job.job][dir].push(job);
			directoryIndex++;
			directoryIndex = directoryIndex % directories.length;
		});
		Object.keys(jobAssignments).forEach((job) => {
			let configContent = fs.readFileSync(path.join(JOB_PATH, job, JOB_NAME), 'utf8');
			if (configContent) {
				let config: Job = JSON.parse(configContent);
				config.assignments = jobAssignments[job];
				fs.writeFileSync(path.join(JOB_PATH, job, JOB_NAME), JSON.stringify(config), 'utf8');
			} else {
				throw new Error('no config content found');
			}
		});
	}
	static async CollectJobResults() {
		let jobs = await JobService.getJobs();
		for (let i: any = 0; i < 0; i++) {
			let job = jobs[i];
			try {
				let isDone = await JobService.IsComplete(job);
				if (isDone) {
					await JobService.MoveCompletedJob(job);
					await JobService.CleanUpJob(job);
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
					let jobFolder = '';
					jobAssignment.forEach((job) => {
						jobFolder = job.job;
						if (fs.existsSync(path.join(assignmentDir, job.job, job.file, INPUT))) {
							fs.unlinkSync(path.join(assignmentDir, job.job, job.file, INPUT));
						}
						if (fs.existsSync(path.join(assignmentDir, job.job, GRAPH_FILE))) {
							fs.unlinkSync(path.join(assignmentDir, job.job, GRAPH_FILE));
						}
						JobService.deleteFolder(path.join(assignmentDir, job.job, GRAPH_FOLDER));
						// if (fs.existsSync(path.join(assignmentDir, job.job, JOB_NAME))) {
						// 	fs.unlinkSync(path.join(assignmentDir, job.job, JOB_NAME));
						// }
					});
					// fs.unlinkSync(path.join(assignmentDir, jobFolder));
				});
			}
		}
	}
	static async MoveCompletedJob(job: Job) {
		let { assignments } = job;
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				return await remoteDirectories.forEachAsync(async (assignmentDir: string) => {
					let jobAssignment = assignments ? assignments[assignmentDir] : [];
					return await jobAssignment.forEachAsync(async (job: JobItem) => {
						const outputFile = path.join(assignmentDir, job.job, job.file, OUTPUT);
						if (fs.existsSync(outputFile)) {
							let filesToCopy = [ outputFile ];
							await ensureDirectory(path.join(JOB_PATH, job.job, job.file));

							filesToCopy.forEach((fileToCopy) => {
								fs.copyFileSync(
									path.join(outputFile, fileToCopy),
									path.join(JOB_PATH, job.job, job.file, OUTPUT)
								);
							});
							return;
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
	static async IsComplete(job: Job) {
		let { assignments } = job;
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				return remoteDirectories.some((assignmentDir) => {
					let jobAssignment = assignments ? assignments[assignmentDir] : null;
					if (!jobAssignment) {
						throw new Error('no assignments');
					}
					return !jobAssignment.some((job) => {
						if (fs.existsSync(path.join(assignmentDir, job.job, JOB_NAME))) {
							let content = fs.readFileSync(path.join(assignmentDir, job.job, JOB_NAME), 'utf');
							let config: Job = JSON.parse(content);
							if (config) {
								return !config.complete;
							}
						}
						console.error(job);
						console.error(job.job);
						console.error(job.file);
						console.error(assignmentDir);
						throw new Error('missing job file');
					});
				});
			}
			return true;
		}
		return false;
	}
}
const JOB_NAME = `config.json`;
const JOB_PATH = './job_service_jobs';
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
	OUTPUT_FOLDER,
	GRAPH_FILE_PARTS,
	GRAPH_FOLDER
};
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
