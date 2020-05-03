import config from '../config';
import fs, { existsSync } from 'fs';
import path from 'path';
import {
	NodesByType,
	GetCurrentGraph,
	GetDispatchFunc,
	UIC,
	GRAPHS,
	GetState,
	Visual,
	ApplicationConfig
} from '../actions/uiactions';
import { NodeTypes } from '../constants/nodetypes';
import { uuidv4 } from '../utils/array';
import { Node, Graph } from '../methods/graph_types';
import prune from '../methods/prune';
import NameService from './nameservice';
import mergeGraph from '../methods/mergeGraph';
import { AgentProject, AgentProjects } from './interfaces';
import CommunicationTower, { RedQuickDistributionCommand } from './communicationTower';

export default class JobService {
	static communicationTower: CommunicationTower;
	static SetComunicationTower(communicationTower: CommunicationTower) {
		this.communicationTower = communicationTower;
	}
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
		await ensureDirectory(path.join(relPath, chunkFolder));
		let files: string[] = [];
		await content.stringView(async (chunk: string, i: number) => {
			let chunkPath = path.join(relPath, chunkFolder, chunkName + i);
			files.push(path.join(chunkFolder, chunkName + i));
			fs.writeFileSync(chunkPath, chunk, 'utf8');
		}, Math.pow(2, 23));
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
		console.log('can join');
		console.log(path.join(relPath, fileName));
		if (fileDetails && fileDetails.files) {
			fileDetails.files.forEach((file) => {
				if (contents) {
					contents = contents && fs.existsSync(path.join(relPath, file));
					if (contents) {
						let guts = fs.readFileSync(path.join(relPath, file), 'utf8');
						contents = contents && !!guts.length;
					}
				}
			});
		} else if (this.IsGraph(fileDetails)) {
		} else {
			console.log(fileDetails);
			throw new Error('invalid file');
		}
		return contents;
	}
	static IsGraph(parsedResult: any) {
		if (parsedResult && (parsedResult.workspace || parsedResult.version)) {
			return true;
		}
		return false;
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
			try {
				if (isDirectory(folder)) {
					let dirs = getDirectories(folder);
					dirs.forEach((dir) => {
						JobService.deleteFolder(path.join(folder, dir));
					});
					let files = getFiles(folder);
					files.forEach((file) => {
						fs.unlinkSync(path.join(folder, file));
					});
					if (isDirectory(folder)) {
						fs.rmdirSync(folder);
					}
				} else {
					fs.unlinkSync(folder);
				}
			} catch (e) {}
		}
	}
	static async StartJob(
		command: string,
		currentJobFile: JobFile,
		batchSize: number = 1,
		modelTypes?: string | string[]
	): Promise<Job> {
		let job = await JobService.CreateJob(command, batchSize, modelTypes);
		let distributedJob = await JobService.DistributeJobs(job, command);
		if (distributedJob) {
			currentJobFile.jobPath = path.join(JobPath(), distributedJob.name, JOB_NAME);
			return distributedJob;
		}
		throw new Error('job not distributed');
	}

	static async WaitForJob(command: string, currentJobFile: JobFile) {
		let complete = false;
		console.log('wait for job completion');
		do {
			let job = await JobService.loadJob(currentJobFile.jobPath);
			complete = await JobService.IsComplete(job, JobServiceConstants.JobPath());
			if (!complete) {
				await JobService.MakeSureAgentsAreWorking(job, command);
			}
			await sleep();
		} while (!complete);
	}

	static async MakeSureAgentsAreWorking(job: Job, command: string) {
		console.log('make sure agents are working');
		let availableProjects: AgentProject[] = await this.GetAvailableProjects();
		console.log(`there are ${availableProjects.length} available agentProjects`);
		let items = await this.getJobsItems(job);
		items.forEachAsync(async (item: JobItem) => {
			let isComplete = await this.IsJobItemComplete(item);
			if (!isComplete) {
				let notBusyProject = availableProjects.find(
					(v) => v.agentProject === item.assignedTo || v.name === item.assignedTo
				);
				if (notBusyProject && notBusyProject.ready) {
					console.log(
						`${notBusyProject.agentProject ||
							notBusyProject.name} isnt busy, but it hasnt finished the project.`
					);
					console.log('so telling it to begin job again');
					await this.moveJobItemFiles(notBusyProject, item);
					await this.beginJob(notBusyProject, item);
				} else {
					if (notBusyProject) {
						console.log(`${item.assignedTo} is still busy apparently`);
					} else {
						console.log(`${item.assignedTo} is still busy then.`);
					}
					if (!item.assignedTo && availableProjects.length) {
						item.assignedTo = availableProjects[0].agentProject || availableProjects[0].name;
						await this.saveJobItem(item);
						await this.moveJobItemFiles(availableProjects[0], item);
						await this.beginJob(availableProjects[0], item);
					}
				}
			}
		});
	}

	static async CollectForJob(currentJobFile: JobFile) {
		// Collect the job parts into a graph again.
		await sleep(5 * 1000);
		let currentJob: Job = await JobService.loadJob(currentJobFile.jobPath);
		console.log('collecting job results');
		// await JobService.CollectJobResults(currentJob);
		console.log('merge job results');
		let graph = await JobService.MergeCompletedJob(currentJob);
		if (graph) {
			await setCurrentGraph(graph);
			currentJobFile.updatedGraph = graph;
			currentJobFile.started = true;
			await writeGraphToFile(graph, currentJobFile.graphPath);
			if (currentJobFile.jobPath) {
				await JobService.deleteFolder(path.dirname(currentJobFile.jobPath));
			} else {
				throw new Error('currentJobFile.jobPath is empty');
			}
		} else {
			throw new Error('graph shouldnt be null, CollectForJob, jobservice.ts');
		}
		// Save the new graph, and continue with the job.
	}

	static async loadRemoteJob(filePath: string): Promise<Job> {
		return this.loadJob(path.join(filePath, JOB_NAME));
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

	static async CreateJob(
		command: string,
		batchSize: number = 1,
		modelTypes: string | string[] = NodeTypes.Model
	): Promise<Job> {
		if (!modelTypes) {
			throw new Error('node types to filter on');
		}
		let models: string[] = NodesByType(null, modelTypes).map((x: Node) => x.id);
		if (!models || !models.length) {
			throw new Error('nothing to filter for batching');
		}
		// let targets = await JobService.getAgentDirectories();
		let graph = GetCurrentGraph();
		let chunks = models.chunk(batchSize || 1);
		if (!fs.existsSync(JobPath())) {
			fs.mkdirSync(JobPath());
		}

		const jobName = `job_${uuidv4().split('-')[0]}`;
		if (!fs.existsSync(path.join(JobPath(), jobName))) {
			fs.mkdirSync(path.join(JobPath(), jobName));
		}

		JobService.BreakFile(
			path.join(JobPath(), jobName),
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

			let jobItem: JobItem = {
				job: jobName,
				distributed: false,
				file: jobpart,
				complete: false,
				config: temp
			};

			await ensureDirectory(path.join(JobPath(), jobName, jobpart));
			fs.writeFileSync(path.join(JobPath(), jobName, jobpart, INPUT), JSON.stringify(jobItem), 'utf8');
			jobparts.push(jobpart);
		});

		let job: Job = {
			name: jobName,
			nickName: NameService.superHeroName(),
			parts: jobparts,
			complete: false,
			updated: Date.now(),
			configAbsolutePath: '',
			jobInstancePath: '',
			absolutePath: ''
		};
		fs.writeFileSync(path.join(JobPath(), jobName, JOB_NAME), JSON.stringify(job), 'utf8');
		return job;
	}
	static async getJobs(jpath: string = ''): Promise<Job[]> {
		let results: Job[] = [];
		if (fs.existsSync(jpath || JobPath())) {
			let jobs = getDirectories(jpath || JobPath());
			jobs.map((job) => {
				if (fs.existsSync(path.join(jpath || JobPath(), job, JOB_NAME))) {
					let content = fs.readFileSync(path.join(jpath || JobPath(), job, JOB_NAME), 'utf8');
					let config: Job = JSON.parse(content);
					results.push(config);
				}
			});
		}
		return results;
	}

	static async GetJobFiles(): Promise<JobFile[]> {
		let result: JobFile[] = [];
		if (fs.existsSync(JobsFilePath())) {
			let jobsFilePaths = getDirectories(JobsFilePath());
			jobsFilePaths.forEach((jfp: string) => {
				if (fs.existsSync(path.join(JobsFilePath(), jfp, JOB_NAME))) {
					let content = fs.readFileSync(path.join(JobsFilePath(), jfp, JOB_NAME), 'utf8');
					let jobFile: JobFile = JSON.parse(content);
					result.push(jobFile);
				}
			});
		}
		return result;
	}
	static GetJobFileStages(jobFile: JobFile): string[] {
		if (jobFile.name) {
			return getDirectories(path.join(JobsFilePath(), jobFile.name, 'stages'));
		}
		return [];
	}
	static async SetJobPartComplete(jobPartPath: string) {
		let inputPath: string = path.join(jobPartPath, INPUT);
		if (fs.existsSync(path.join(jobPartPath, INPUT))) {
			let jobInput: JobItem = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
			jobInput.complete = true;
			jobInput.config.complete = true;
			fs.writeFileSync(inputPath, JSON.stringify(jobInput), 'utf8');
			return true;
		}
		return false;
	}
	static getJobItemLocalPath(jobItem: JobItem): string {
		return path.join(JobPath(), jobItem.job, jobItem.file, INPUT);
	}
	static async getJobItems(): Promise<JobItem[]> {
		let results: JobItem[] = [];
		if (fs.existsSync(JobPath())) {
			let jobs = getDirectories(JobPath());
			jobs.map((job) => {
				getDirectories(path.join(JobPath(), job)).map((fileDir) => {
					if (fs.existsSync(path.join(JobPath(), job, fileDir, INPUT))) {
						let content = fs.readFileSync(path.join(JobPath(), job, fileDir, INPUT), 'utf8');
						let jobItem: JobItem = JSON.parse(content);
						results.push({
							...jobItem
							// job,
							// file: fileDir,
							// distributed: jobItem.distributed,
							// config: jobItem.config
						});
					}
				});
			});
		}
		return results;
	}
	static async getJobsItems(jobObject: Job): Promise<JobItem[]> {
		let results: JobItem[] = [];
		let job: string = jobObject.name;
		if (fs.existsSync(JobPath())) {
			getDirectories(path.join(JobPath(), job)).map((fileDir) => {
				if (fs.existsSync(path.join(JobPath(), job, fileDir, INPUT))) {
					let content = fs.readFileSync(path.join(JobPath(), job, fileDir, INPUT), 'utf8');
					let config: JobItem = JSON.parse(content);
					results.push({
						...config
					});
				}
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
		fs.writeFileSync(jobItemPath, JSON.stringify(jobItem), 'utf8');
	}
	static agentProjects: AgentProject[] = [];
	static async UpdateReadyAgents(agentProject: AgentProject) {
		console.log('update ready');
		console.log(agentProject);
		JobService.agentProjects = [
			...JobService.agentProjects.filter((x) => x.name !== agentProject.name),
			agentProject
		];
	}
	static async GetAvailableProjects(): Promise<AgentProject[]> {
		return JobService.agentProjects.filter((x) => x.ready);
	}

	static async GetAvailableProject(): Promise<AgentProject> {
		let result: AgentProject | null = null;

		do {
			console.log(
				`there are ${JobService.agentProjects.length} agents and ${JobService.agentProjects.filter(
					(x) => x.ready
				).length} avaiable`
			);
			result = JobService.agentProjects.find((x) => x.ready) || null;
			if (!result) {
				console.log('looking for agent project');
				await sleep(3000);
			}
		} while (!result);
		console.log('found agentproject');
		console.log(result);
		return result;
	}
	static async DistributeJobs(jobToDistribute: Job, command: string): Promise<Job | null> {
		let result: Job | null = null;
		let jobItems: JobItem[] = await JobService.getUndistributedJobItems();
		jobItems = jobItems.filter((jobItem: JobItem) => {
			if (jobToDistribute) {
				return jobToDistribute.name === jobItem.job;
			}
			return true;
		});

		while (jobItems && jobItems.length) {
			let agentProject: AgentProject = await JobService.GetAvailableProject();
			let jobItem: JobItem | undefined = jobItems.shift();
			if (jobItem) {
				let dir = path.join(jobItem.job, jobItem.file);
				let configContent = fs.readFileSync(path.join(JobPath(), jobItem.job, JOB_NAME), 'utf8');
				if (configContent) {
					let config: Job = JSON.parse(configContent);
					result = config;
					fs.writeFileSync(path.join(JobPath(), jobItem.job, JOB_NAME), JSON.stringify(config), 'utf8');
				} else {
					throw new Error('no config content found');
				}

				jobItem.config.command = command;
				jobItem.distributed = true;
				jobItem.config.distributed = true;
				jobItem.assignedTo = agentProject.agentProject || agentProject.name;

				await JobService.saveJobItem(jobItem);

				await this.moveJobItemFiles(agentProject, jobItem);

				await this.beginJob(agentProject, jobItem);
				await sleep(2 * 1000);
			}
		}
		return result;
	}
	static async moveJobItemFiles(agentProject: AgentProject, jobItem: JobItem) {
		//Every agent gets a copy of the graph.
		let dir = path.join(jobItem.job, jobItem.file);
		await this.transferFile(
			agentProject,
			path.join(JobPath(), jobItem.job, GRAPH_FILE),
			path.join(dir, GRAPH_FILE)
		);

		await this.transferFiles(
			agentProject,
			path.join(JobPath(), jobItem.job, GRAPH_FOLDER),
			path.join(dir, GRAPH_FOLDER)
		);

		await this.transferFile(agentProject, path.join(JobPath(), jobItem.job, JOB_NAME), path.join(dir, JOB_NAME));
		await this.transferFile(
			agentProject,
			path.join(JobPath(), jobItem.job, jobItem.file, INPUT),
			path.join(dir, INPUT)
		);
	}
	static async beginJob(agentProject: AgentProject, jobItem: JobItem) {
		agentProject.ready = false;
		return await this.communicationTower.send(
			agentProject,
			path.join(jobItem.job, jobItem.file),
			RedQuickDistributionCommand.RUN_JOB
		);
	}
	static async transferFile(agentProject: AgentProject, srcFolder: string, outFolder: string) {
		return await this.communicationTower.transferFile(agentProject, outFolder, srcFolder);
	}

	static async transferFiles(agentProject: AgentProject, srcFolder: string, outFolder: string) {
		let filesToCopy = getFiles(srcFolder);
		await filesToCopy.forEachAsync(async (file: string) => {
			await this.transferFile(agentProject, path.join(srcFolder, file), path.join(outFolder, file));
		});
	}

	static async DistributeJobs_Old(jobToDistribute: Job): Promise<Job> {
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
						path.join(JobPath(), jobItem.job, GRAPH_FILE),
						path.join(dir, jobItem.job, GRAPH_FILE)
					);
					await JobService.copyFiles(
						path.join(JobPath(), jobItem.job, GRAPH_FOLDER),
						path.join(dir, jobItem.job, GRAPH_FOLDER)
					);
					fs.copyFileSync(path.join(JobPath(), jobItem.job, JOB_NAME), path.join(dir, jobItem.job, JOB_NAME));
				}

				fs.copyFileSync(
					path.join(JobPath(), jobItem.job, jobItem.file, INPUT),
					path.join(dir, jobItem.job, jobItem.file, INPUT)
				);
				jobAssignments[jobItem.job] = jobAssignments[jobItem.job] || {};
				jobAssignments[jobItem.job][dir] = jobAssignments[jobItem.job][dir] || [];
				jobAssignments[jobItem.job][dir].push(jobItem);
				directoryIndex++;
				directoryIndex = directoryIndex % directories.length;
			});

		Object.keys(jobAssignments).forEach((job) => {
			let configContent = fs.readFileSync(path.join(JobPath(), job, JOB_NAME), 'utf8');
			if (configContent) {
				let config: Job = JSON.parse(configContent);
				fs.writeFileSync(path.join(JobPath(), job, JOB_NAME), JSON.stringify(config), 'utf8');
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
				let isDone = await JobService.IsComplete(job, JobServiceConstants.JobPath());
				if (isDone) {
					// await JobService.CleanUpJob(job);
				}
			} catch (e) {}
		}
	}
	static CleanUpJob(job: Job) {
		let { parts } = job;
		if (parts) {
			JobService.deleteFolder(path.join(JobPath(), job.name));
		}
	}

	static async MergeCompletedJob(job: Job): Promise<Graph | null> {
		console.log('merging completed job');
		let intermedita: { [index: string]: Graph } = {};
		await job.parts.forEachAsync(async (part: string) => {
			let graphOutput = await JobService.JoinFile(path.join(JobPath(), job.name, part), OUTPUT);
			intermedita[part] = JSON.parse(graphOutput);
		});

		let mergedGraph: Graph | null = GetCurrentGraph(GetState());
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

	static async IsComplete(job: Job, relative: string) {
		let { parts } = job;
		if (parts) {
			if (parts.length) {
				let completed = true;
				for (let i = 0; i < parts.length; i++) {
					completed = completed && (await JobService.IsJobAssignmentComplete(job, parts[i], relative));
					if (!completed) {
						console.log('job not is completed');
						return false;
					}
				}
				console.log('job is completed');
				return true;
			}
			throw new Error('no parts assigned');
		}
		console.log('job not is completed: no parts');
		return false;
	}

	static async JobProgress(job: Job) {
		let { parts } = job;
		let result = { total: 0, complete: 0 };
		if (parts) {
			if (parts.length) {
				let completed = true;
				for (let i = 0; i < parts.length; i++) {
					completed = await JobService.IsJobAssignmentComplete(job, parts[i], JobServiceConstants.JobPath());
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
		await ensureDirectory(path.join(JobsFilePath(), projectName));
		jobFile.originalGraphPath = jobFile.graphPath;
		jobFile.name = projectName;
		jobFile.graphPath = path.resolve(path.join(JobsFilePath(), projectName, GRAPH_FILE));
		fs.writeFileSync(path.join(JobsFilePath(), projectName, JOB_NAME), JSON.stringify(jobFile), 'utf8');
		fs.writeFileSync(path.join(JobsFilePath(), projectName, GRAPH_FILE), graph, 'utf8');
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
			let isComplete = await JobService.IsJobItemComplete(job);
			completed = isComplete;
			if (completed) {
				result.complete++;
			}
			result.total++;
		}
		return result;
	}
	static async loadJobItem(jobId: string, partId: string, relative: string): Promise<JobItem | null> {
		let jobItemPath = path.join(relative, jobId, partId, INPUT);
		if (fs.existsSync(jobItemPath)) {
			let content = fs.readFileSync(jobItemPath, 'utf8');
			return JSON.parse(content);
		}
		return null;
	}
	static async IsJobAssignmentComplete(job: Job, partId: string, relative: string): Promise<boolean> {
		let jobItem: JobItem | null = await JobService.loadJobItem(job.name, partId, relative);
		if (!jobItem) {
			throw new Error('no assignments');
		}

		let isComplete = await JobService.IsJobItemComplete(jobItem);
		return isComplete;
	}

	static async IsJobItemComplete(jobItem: JobItem): Promise<boolean> {
		if (jobItem && jobItem.config) {
			if (jobItem.config.complete) {
				let res = this.loadJobItemOutput(jobItem);
				if (res) {
					return jobItem.config.complete;
				}
			}
		}
		return false;
	}
	static loadJobItemOutput(jobItem: JobItem) {
		try {
			let outputPath = path.join(
				JobServiceConstants.JobPath(),
				jobItem.job,
				jobItem.file,
				JobServiceConstants.OUTPUT
			);
			if (fs.existsSync(outputPath)) {
				let content = fs.readFileSync(outputPath, 'utf8');
				if (content.length) {
					try {
						let output: JobOutput | Graph = JSON.parse(content);
						return output;
					} catch (e) {
						console.log(e);
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
		return false;
	}
}
function getAppConfig() {
	let application = 'applicationConfig.json';
	let applicationPath = path.join('./', application);
	let applicationConfiguration: any = JSON.parse(fs.readFileSync(applicationPath, 'utf8'));
	return applicationConfiguration;
}
function JobPath() {
	let applicationConfig = getAppConfig();
	if (applicationConfig && applicationConfig[JOB_PATH]) {
		return applicationConfig[JOB_PATH];
	}
	return JOB_PATH;
}

function JobsFilePath() {
	let applicationConfig = getAppConfig();
	if (applicationConfig && applicationConfig[JOBS_FILE_PATH]) {
		return applicationConfig[JOBS_FILE_PATH];
	}
	return JOBS_FILE_PATH;
}

const JOB_NAME = `config.json`;
const JOB_PATH = path.join('D:/', 'temp', 'job_service_jobs');
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
	JobsFilePath,
	JobPath,
	OUTPUT_FOLDER,
	GRAPH_FILE_PARTS,
	JOB_PATH,
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
	assignedTo?: string;
	job: string;
	file: string;
	distributed: boolean;
	complete?: boolean;
	config: JobConfigContract;
}
export interface JobOutput {
	files: string[];
}
export interface JobFile {
	started?: boolean;
	completed?: boolean;
	name?: string;
	updated?: number;
	jobPath?: string;
	updatedGraph?: Graph;
	created: boolean;
	originalGraphPath?: string;
	graphPath: string;
	error?: string;
	step?: string;
	stages?: string[];
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
	console.log('the number of nodes in the graph');
	console.log(Object.keys(graph.nodeLib).length);
	dispatch(UIC(GRAPHS, graph.id, graph));
}
