import config from '../config';
import fs from 'fs';
import path from 'path';
import { NodesByType, GetCurrentGraph } from '../actions/uiactions';
import { NodeTypes } from '../constants/nodetypes';
import { uuidv4 } from '../utils/array';
import { Node } from '../methods/graph_types';

export default class JobService {
	static async getAgents() {
		const agentFolder = path.join(config.distributionPath, 'agent');
		if (fs.existsSync(agentFolder)) {
			let agents = getDirectories(agentFolder);
			return agents;
		}

		return [];
	}
	static async getAgentProjects(): Promise<any> {
		const agentFolder = path.join(config.distributionPath, 'agent');
		const agents = await JobService.getAgents();
		const projects: any = [];
		agents.forEach((agent) => {
			projects.push(...getDirectories(path.join(agentFolder, agent)));
		});
		return projects;
	}

	static async getAgentDirectories(): Promise<string[]> {
		const agentFolder = path.join(config.distributionPath, 'agent');
		const agents = await JobService.getAgents();
		const projects: any = [];
		agents.forEach((agent) => {
			projects.push(
				...getDirectories(path.join(agentFolder, agent)).map((dir) => path.join(agentFolder, agent, dir))
			);
		});
		return projects;
	}

	static async CreateJob(command: string, batchSize: number = 10) {
		let models: string[] = NodesByType(null, NodeTypes.Model).map((x: Node) => x.id);
		// let targets = await JobService.getAgentDirectories();
		let graph = GetCurrentGraph();
		let chunks = models.chunk(batchSize || 10);
		if (!fs.existsSync(JOB_PATH)) {
			fs.mkdirSync(JOB_PATH);
		}

		const jobName = `job_${uuidv4()}`;
		if (!fs.existsSync(path.join(JOB_PATH, jobName))) {
			fs.mkdirSync(path.join(JOB_PATH, jobName));
		}

		fs.writeFileSync(path.join(JOB_PATH, jobName, GRAPH_FILE), JSON.stringify(graph), 'utf8');
		let jobparts: string[] = [];
		chunks.forEach((chunk: any) => {
			let temp: JobConfigContract = {
				filter: { models: chunk },
				complete: false,
				updated: Date.now(),
				command,
				distributed: false
			};
			let jobpart = `part_${uuidv4()}.rqjp`;
			fs.writeFileSync(path.join(JOB_PATH, jobName, jobpart), JSON.stringify(temp), 'utf8');
			jobparts.push(jobpart);
		});
		let job: Job = { parts: jobparts, assignments: null };
		fs.writeFileSync(path.join(JOB_PATH, jobName, JOB_NAME), JSON.stringify(job), 'utf8');
	}
	static async getJobs(): Promise<Job[]> {
		let results: Job[] = [];
		if (!fs.existsSync(JOB_PATH)) {
			let jobs = getDirectories(JOB_PATH);
			jobs.map((job) => {
				let content = fs.readFileSync(path.join(JOB_PATH, job, JOB_NAME), 'utf8');
				let config: Job = JSON.parse(content);
				results.push(config);
			});
		}
		return results;
	}
	static async getJobItems(): Promise<JobItem[]> {
		let results: JobItem[] = [];
		if (!fs.existsSync(JOB_PATH)) {
			let jobs = getDirectories(JOB_PATH);
			jobs.map((job) => {
				getFiles(path.join(JOB_PATH, job))
					.filter((x: any) => ![ JOB_NAME, GRAPH_FILE ].some((v) => v === x))
					.map((file) => {
						let content = fs.readFileSync(path.join(JOB_PATH, job, file), 'utf8');
						let config: JobConfigContract = JSON.parse(content);
						results.push({
							job,
							file,
							distributed: config.distributed,
							config
						});
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
		jobs.forEach((job: JobItem) => {
			let dir = directories[directoryIndex];
			fs.copyFileSync(path.join(JOB_PATH, job.job, job.file), path.join(dir, job.job, job.file));
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
						if (fs.existsSync(path.join(assignmentDir, job.job, job.file))) {
							fs.unlinkSync(path.join(assignmentDir, job.job, job.file));
						}
					});
					fs.unlinkSync(path.join(assignmentDir, jobFolder));
				});
			}
		}
	}
	static MoveCompletedJob(job: Job) {
		let { assignments } = job;
		if (assignments) {
			let remoteDirectories = Object.keys(assignments);
			if (remoteDirectories.length) {
				return remoteDirectories.forEach((assignmentDir) => {
					let jobAssignment = assignments ? assignments[assignmentDir] : [];
					return jobAssignment.forEach((job) => {
						const outputDir = path.join(assignmentDir, OUTPUT_FOLDER, job.job);
						if (fs.existsSync(outputDir)) {
							let filesToCopy = getFiles(outputDir);
							if (!fs.existsSync(path.join(JOB_OUTPUT_PATH, job.job))) {
								fs.mkdirSync(path.join(JOB_OUTPUT_PATH, job.job));
							}
							filesToCopy.forEach((fileToCopy) => {
								fs.copyFileSync(
									path.join(outputDir, fileToCopy),
									path.join(JOB_OUTPUT_PATH, job.job, fileToCopy)
								);
							});
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
						if (fs.existsSync(path.join(assignmentDir, job.job, job.file))) {
							let content = fs.readFileSync(path.join(assignmentDir, job.job, job.file), 'utf');
							let config: JobConfigContract = JSON.parse(content);
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
const JOB_NAME = `job.json`;
const JOB_PATH = './job_service_jobs';
const JOB_OUTPUT_PATH = './job_service_jobs_output';
const GRAPH_FILE = `graph.json`;
const OUTPUT_FOLDER = 'output';
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
	assignments: JobAssignment | null;
	parts: string[];
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
const isDirectory = (source: any) => fs.lstatSync(source).isDirectory();
export const getDirectories = (source: any) =>
	fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));
export const getFiles = (source: any) => fs.readdirSync(source).filter((name) => !isDirectory(path.join(source, name)));
