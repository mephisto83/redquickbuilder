import fs from 'fs';
import path from 'path';
import { sleep, setupJob, saveCurrentGraphTo } from './threadutil';
import JobService, {
	JobServiceConstants,
	getFiles,
	JobFile,
	getDirectories,
	ensureDirectory,
	path_join,
	JobItem,
	Job,
	CurrentJobInformation
} from '../../app/jobs/jobservice';
import BuildAllDistributed, { BuildAllInfo } from '../../app/nodepacks/batch/BuildAllDistributed';
import { GetCurrentGraph } from '../../app/actions/uiactions';
import CommunicationTower, {
	RedQuickDistributionCommand,
	RedQuickDistributionMessage,
	ListenerReply
} from '../../app/jobs/communicationTower';
import { RunnerContext, CommandCenter } from '../../app/jobs/interfaces';
import StoreGraph from '../../app/methods/storeGraph';
let communicationTower: CommunicationTower;
let runnerContext: RunnerContext = {
	agents: {},
	commandCenters: [],
	commandCenter: {
		commandCenterPort: null,
		commandCenterHost: null
	},
	jobCompletionList: Promise.resolve()
};
(async function runner() {
	try {
		communicationTower = new CommunicationTower();
		communicationTower.init({
			agentName: null,
			baseFolder: JobServiceConstants.JobPath(),
			serverPort: 7972,
			topDirectory: '../../jobrunner'
		});

		await communicationTower.start({
			[RedQuickDistributionCommand.RaisingHand]: handleHandRaising,
			[RedQuickDistributionCommand.SetAgentProjects]: setAgentProjects,
			[RedQuickDistributionCommand.Progress]: noOp,
			[RedQuickDistributionCommand.RUN_JOB]: noOp,
			[RedQuickDistributionCommand.SendFile]: noOp,
			[RedQuickDistributionCommand.RaisingAgentProjectReady]: handleAgentProjectReady,
			[RedQuickDistributionCommand.RaisingAgentProjectBusy]: handleAgentProjectBusy,
			[RedQuickDistributionCommand.CompletedJobItem]: handleCompltedJobItem,
			[RedQuickDistributionCommand.SetCommandCenter]: setCommandCenter,
			[RedQuickDistributionCommand.RaisingAgentProjectProgress]: handleAgentProjectProgress,
			[RedQuickDistributionCommand.UpdateCommandCenter]: noOp,
			[RedQuickDistributionCommand.CanReturnResults]: canReturnResults,
			[RedQuickDistributionCommand.ConfirmFile]: noOp,
			[RedQuickDistributionCommand.RaisingAgentProjectError]: handleAgentProjectError
		});
		JobService.SetComunicationTower(communicationTower);
		while (true) {
			await createJobs();
			await processJobs();
			await tellCommandCenter();
			await sleep();
		}
	} catch (e) {
		console.error(e);
	} finally {
	}
})();
async function setCommandCenter(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	let msg: any = message;
	// console.debug('set command center');
	if (msg) {
		runnerContext.commandCenter = { ...runnerContext.commandCenter, ...msg };
		runnerContext.commandCenters = runnerContext.commandCenters || [];
		runnerContext.commandCenters.push(msg);
		runnerContext.commandCenters = runnerContext.commandCenters.unique(
			(v: CommandCenter) => `${v.commandCenterHost} ${v.commandCenterPort}`
		);
	}
	// console.debug(runnerContext.commandCenter);
	return { success: true };
}
async function noOp(): Promise<ListenerReply> {
	return { error: 'this operation is handled by the runner.' };
}

async function handleAgentProjectReady(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	return await handleAgentProjectStateChange(message, true);
}
async function handleAgentProjectProgress(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	if (runnerContext.agents[message.agentName]) {
		if (runnerContext.agents[message.agentName].projects[message.agentProject]) {
			runnerContext.agents[message.agentName].projects[message.agentProject].updated = Date.now();
			runnerContext.agents[message.agentName].projects[message.agentProject].progress = message.progress;
			await tellCommandCenter();
		}
	}
	return { success: true };
}
async function handleAgentProjectError(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	if (message.agentName) {
		if (runnerContext.agents[message.agentName]) {
			if (runnerContext.agents[message.agentName].projects[message.agentProject]) {
				runnerContext.agents[message.agentName].projects[message.agentProject].error = true;
				runnerContext.agents[message.agentName].projects[message.agentProject].errorMessage =
					message.errorMessage;
			}
		}
	}
	return { success: true };
}
async function handleAgentProjectStateChange(
	message: RedQuickDistributionMessage,
	ready: boolean
): Promise<ListenerReply> {
	if (message.agentName) {
		if (runnerContext.agents[message.agentName]) {
			if (runnerContext.agents[message.agentName].projects[message.agentProject]) {
				runnerContext.agents[message.agentName].projects[message.agentProject].ready = ready;

				await JobService.UpdateReadyAgents(
					runnerContext.agents[message.agentName].projects[message.agentProject]
				);
				// console.debug(`updating ready to ${ready} for ${message.agentProject}.`);
				return {
					success: true
				};
			}
			return { error: 'no agent with that project' };
		}
		return { error: 'no agent with that name' };
	}
	return {
		error: 'agentName is not set'
	};
}
async function handleAgentProjectBusy(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	return await handleAgentProjectStateChange(message, false);
}
async function tellCommandCenter() {
	// console.debug('tell command center');
	let { commandCenters } = runnerContext;
	await commandCenters.forEachAsync(async (commandCenter: CommandCenter) => {
		if (commandCenter && commandCenter.commandCenterPort && commandCenter.commandCenterHost) {
			try {
				let jobs = await JobService.getJobs();
				await jobs.forEachAsync(async (job: Job) => {
					let parts = [];
					await job.parts.forEachAsync(async (part: string) => {
						parts.push(await JobService.loadJobItem(job.name, part, JobServiceConstants.JobPath()));
					});
					currentJobInformation.jobs = currentJobInformation.jobs || {};
					currentJobInformation.jobs[job.name] = { job: job, parts };
				});

				await communicationTower.send(
					{
						host: commandCenter.commandCenterHost,
						port: commandCenter.commandCenterPort
					},
					'',
					RedQuickDistributionCommand.UpdateCommandCenter,
					{
						agents: JobService.agentProjects,
						currentJobInformation: GetCurrentJobInformation()
					}
				);
			} catch (e) {}
		}
	});
}
async function pullCompletedJobItemTogether(message: RedQuickDistributionMessage): Promise<void> {
	let relativePath = path_join(
		JobServiceConstants.JobPath(),
		communicationTower.agentName || '',
		message.projectName,
		message.fileName
	);
	if (await JobService.CanJoinFiles(relativePath, JobServiceConstants.OUTPUT)) {
		console.debug(relativePath);
		let content = await JobService.JoinFile(relativePath, JobServiceConstants.OUTPUT);
		await StoreGraph(content, path_join(relativePath, JobServiceConstants.OUTPUT_GRAPH));
		let completed = await JobService.SetJobPartComplete(relativePath);
		// await JobService.SetJobPartComplete(relativePath);

		if (!completed) {
			throw new Error('job was not set to completed');
		}
		// fs.writeFileSync(path_join(relativePath, JobServiceConstants.OUTPUT), content, 'utf8');
		let temp: any = message;
		console.log('completed');
		console.log(message);
		if (
			temp.agent &&
			runnerContext.agents &&
			temp.name &&
			runnerContext.agents[temp.agent] &&
			runnerContext.agents[temp.agent].projects[temp.name]
		) {
			console.log('updating progress to 1');
			runnerContext.agents[temp.agent].projects[temp.name].workingOnFile = '';
			runnerContext.agents[temp.agent].projects[temp.name].workingOnJob = '';
			runnerContext.agents[temp.agent].projects[temp.name].progress = 1;
			runnerContext.agents[temp.agent].projects[temp.name].updated = Date.now();
		}
		console.log(JSON.stringify(runnerContext.agents, null, 4));
		await tellCommandCenter();
	}
}
function AppendToJobCompletedList(promise: any) {
	runnerContext.jobCompletionList = runnerContext.jobCompletionList
		.then(promise)
		.catch((e) => {
			console.log(e);
		})
		.then(async () => {
			console.log('completed job from completed list');
			await tellCommandCenter();
		});
}
async function checkTransferredFile(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	// console.debug('CompletedJobItem');
	// console.debug('handing completed job item');
	if (message.projectName) {
		if (message.fileName) {
			// console.debug(communicationTower.agentName || '');
			let relativePath = path_join(
				JobServiceConstants.JobPath(),
				communicationTower.agentName || '',
				message.projectName,
				message.fileName
			);
			if (fs.existsSync(path_join(relativePath, JobServiceConstants.OUTPUT))) {
				if (await JobService.CanJoinFiles(relativePath, JobServiceConstants.OUTPUT)) {
					console.debug(relativePath);
					AppendToJobCompletedList(async () => {
						return pullCompletedJobItemTogether(message);
					});
					await tellCommandCenter();
					return {
						success: true
					};
				} else {
					return {
						error: 'cant join output'
					};
				}
			}
			return {
				error: 'missing graph file'
			};
		}
		return {
			error: 'no file name'
		};
	}
	return {
		error: 'no project name'
	};
}
async function handleCompltedJobItem(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	// console.debug('CompletedJobItem');
	// console.debug('handing completed job item');
	if (message.projectName) {
		if (message.fileName) {
			// console.debug(communicationTower.agentName || '');
			let relativePath = path_join(
				JobServiceConstants.JobPath(),
				communicationTower.agentName || '',
				message.projectName,
				message.fileName
			);
			if (fs.existsSync(path_join(relativePath, JobServiceConstants.OUTPUT))) {
				if (await JobService.CanJoinFiles(relativePath, JobServiceConstants.OUTPUT)) {
					console.debug(relativePath);
					AppendToJobCompletedList(async () => {
						return pullCompletedJobItemTogether(message);
					});
					// let content = await JobService.JoinFile(relativePath, JobServiceConstants.OUTPUT);
					// await StoreGraph(content, path_join(relativePath, JobServiceConstants.OUTPUT_GRAPH));
					// let completed = await JobService.SetJobPartComplete(relativePath);
					// // await JobService.SetJobPartComplete(relativePath);

					// if (!completed) {
					// 	throw new Error('job was not set to completed');
					// }
					// // fs.writeFileSync(path_join(relativePath, JobServiceConstants.OUTPUT), content, 'utf8');
					// let temp: any = message;
					// if (
					// 	temp.agent &&
					// 	runnerContext.agents &&
					// 	temp.name &&
					// 	runnerContext.agents[temp.agent] &&
					// 	runnerContext.agents[temp.agent].projects[temp.name]
					// ) {
					// 	runnerContext.agents[temp.agent].projects[temp.name].workingOnFile = '';
					// 	runnerContext.agents[temp.agent].projects[temp.name].workingOnJob = '';
					// }
					await tellCommandCenter();
					return {
						success: true
					};
				} else {
					return {
						error: 'cant join output'
					};
				}
			}
			return {
				error: 'missing graph file'
			};
		}
		return {
			error: 'no file name'
		};
	}
	return {
		error: 'no project name'
	};
}
async function canReturnResults(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	if (message.agentName) {
		if (!communicationTower.receivingFile) {
			console.log('can send a file ');
		} else {
			console.log('cant send a file');
		}
		console.log(message);
		return {
			success: !communicationTower.receivingFile,
			error: communicationTower.receivingFile
		};
	}
	console.log('missing agentName');
	return {
		error: true
	};
}
async function handleHandRaising(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	if (message.agentName) {
		let temp: any = message;
		runnerContext.agents[message.agentName] = runnerContext.agents[message.agentName] || <any>{};
		runnerContext.agents[message.agentName].projects = runnerContext.agents[message.agentName].projects || <any>{};
		runnerContext.agents[message.agentName].projects[temp.project.agentProject] =
			runnerContext.agents[message.agentName].projects[temp.project.agentProject] || <any>{};
		if (temp.project) {
			runnerContext.agents[message.agentName].projects[temp.project.agentProject].port = temp.project.port;
			runnerContext.agents[message.agentName].projects[temp.project.agentProject].host = temp.project.host;
			runnerContext.agents[message.agentName].projects[temp.project.agentProject].agent = message.agentName;
			runnerContext.agents[message.agentName].projects[temp.project.agentProject].agentName = message.agentName;
			runnerContext.agents[message.agentName].projects[temp.project.agentProject].agentProject =
				temp.project.agentProject;
			runnerContext.agents[message.agentName].projects[temp.project.agentProject].name =
				temp.project.agentProject;
		}
		// console.debug(message);
		Object.keys(runnerContext.agents[message.agentName].projects).forEach((agentProject) => {
			JobService.UpdateReadyAgents(runnerContext.agents[message.agentName].projects[agentProject]);
		});
		// console.debug('hand raised');
		// console.debug(runnerContext.agents);
		await tellCommandCenter();
		return {
			success: true
		};
	}

	return {
		error: 'agentName was not set'
	};
}
async function setAgentProjects(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	if (message.agentName) {
		runnerContext.agents[message.agentName].projects = message.agentProjects;
	}
	return {
		error: 'agentName was not set'
	};
}

async function processJobs() {
	if (fs.existsSync(JobServiceConstants.JobsFilePath())) {
		// Get jobs from ./jobs directory.
		let projectFolders = getDirectories(JobServiceConstants.JobsFilePath());
		await projectFolders.forEachAsync(async (projectFolder) => {
			let jobFilePath = path_join(
				JobServiceConstants.JobsFilePath(),
				projectFolder,
				JobServiceConstants.JOB_NAME
			);
			if (fs.existsSync(jobFilePath)) {
				await executeStep(jobFilePath);
			}
		});
	}
}

async function executeStep(jobFilePath: string) {
	// console.debug('read job file path');
	// console.debug(jobFilePath);
	// console.debug('execute step');
	let jobConfigContents = fs.readFileSync(jobFilePath, 'utf8');
	let jobConfig: JobFile = JSON.parse(jobConfigContents);
	if (!jobConfig.error && !jobConfig.completed) {
		try {
			let graphPath = jobConfig.graphPath;
			// console.debug('get next command');
			let currentStep = BuildAllInfo.Commands.findIndex((v) => v.name === jobConfig.step);
			console.debug('setup job');
			console.debug(graphPath);
			await setupJob(path.dirname(graphPath));
			let step = BuildAllInfo.Commands[currentStep + 1];
			// console.debug(`step: ${step.name}`);
			// console.debug(`currentStep: ${currentStep + 1}`);

			currentJobInformation.jobFile = jobConfig;

			JobService.NewJobCallback = async (updatedJob: Job) => {
				try {
					let loadedJob = updatedJob;
					if (loadedJob) {
						currentJobInformation.currentJobName = loadedJob.name;
						currentJobInformation.currentStep = step.name;
						await tellCommandCenter();
					}
				} catch (e) {}
			};
			// console.debug('build all distributed');
			await BuildAllDistributed(step.name, jobConfig);
			let cg = GetCurrentGraph();
			// console.debug(`version to save : ${JSON.stringify(cg.version, null, 4)}`);

			// console.debug('save current graph to');
			delete jobConfig.updatedGraph;
			await saveCurrentGraphTo(graphPath, cg);
			await ensureDirectory(path_join(path.dirname(graphPath), 'stages'));
			await saveCurrentGraphTo(path_join(path.dirname(graphPath), 'stages', `${step.name}.rqb`), cg);
			jobConfig.step = step.name;
			// console.debug(jobConfig.step);
			currentJobInformation.jobFile = jobConfig;
			// try {
			// 	let loadedJob = await JobService.loadJob(jobConfig.jobPath);
			// 	if (loadedJob) {
			// 		let parts = [];
			// 		await loadedJob.parts.forEachAsync(async (part: string) => {
			// 			parts.push(await JobService.loadJobItem(loadedJob.name, part, JobServiceConstants.JobPath()));
			// 		});
			// 		currentJobInformation.currentJobName = loadedJob.name;
			// 		currentJobInformation.jobs = currentJobInformation.jobs || {};
			// 		currentJobInformation.jobs[loadedJob.name] = { job: loadedJob, parts };
			// 	}
			// } catch (e) {}
			await tellCommandCenter();
		} catch (e) {
			// console.debug(e);
			// console.debug(jobConfig);
			jobConfig.error = `${e}`;
		} finally {
			await JobService.saveJobFile(jobFilePath, jobConfig);
		}
	} else if (jobConfig.error) {
		// console.debug('job has an error, skipping');
	}
}
let currentJobInformation: CurrentJobInformation = {};
function GetCurrentJobInformation() {
	return currentJobInformation;
}
async function createJobs() {
	if (fs.existsSync(JobServiceConstants.JobsFilePath())) {
		let jobFiles = getFiles(JobServiceConstants.JobsFilePath());
		await jobFiles.forEachAsync(async (jobFileName) => {
			try {
				let jobFilePath = path_join(JobServiceConstants.JobsFilePath(), jobFileName);
				let fileContents = fs.readFileSync(jobFilePath, 'utf8');
				let jobFile: JobFile = JSON.parse(fileContents);
				if (jobFile && jobFile.graphPath && !jobFile.created) {
					if (fs.existsSync(jobFile.graphPath)) {
						let graphFileContents = fs.readFileSync(jobFile.graphPath, 'utf8');
						try {
							jobFile.created = true;
							await JobService.WriteJob(jobFile, graphFileContents);
							await JobService.saveJobFile(jobFilePath, jobFile);
						} catch (e) {
							console.error('createJobs: failed while writing job');
							console.error(e);
						}
					} else {
						// console.debug('createJobs: file doesnt exist');
					}
				} else {
					// console.debug('no file path');
				}
			} catch (e) {
				console.error(e);
			}
		});
	} else {
		// console.debug('no jobs folder');
	}
}
