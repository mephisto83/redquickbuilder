import fs from 'fs';
import path from 'path';
import { sleep, setupJob, saveCurrentGraphTo } from './threadutil';
import JobService, {
	JobServiceConstants,
	getFiles,
	JobFile,
	getDirectories,
	ensureDirectory,
  path_join
} from '../../app/jobs/jobservice';
import BuildAllDistributed, { BuildAllInfo } from '../../app/nodepacks/batch/BuildAllDistributed';
import { GetCurrentGraph } from '../../app/actions/uiactions';
import CommunicationTower, {
	RedQuickDistributionCommand,
	RedQuickDistributionMessage,
	ListenerReply
} from '../../app/jobs/communicationTower';
import { RunnerContext } from '../../app/jobs/interfaces';
let communicationTower: CommunicationTower;
let runnerContext: RunnerContext = {
	agents: {},
	commandCenter: {
		commandCenterPort: null,
		commandCenterHost: null
	}
};
(async function runner() {
	try {
		communicationTower = new CommunicationTower();
		communicationTower.init({
			agentName: null,
			baseFolder: JobServiceConstants.JobPath(),
			serverPort: 7979,
			topDirectory: '../../jobrunner'
		});

		communicationTower.start({
			[RedQuickDistributionCommand.RaisingHand]: handleHandRaising,
			[RedQuickDistributionCommand.SetAgentProjects]: setAgentProjects,
			[RedQuickDistributionCommand.Progress]: noOp,
			[RedQuickDistributionCommand.RUN_JOB]: noOp,
			[RedQuickDistributionCommand.SendFile]: noOp,
			[RedQuickDistributionCommand.SetAgentProjects]: setAgentProjects,
			[RedQuickDistributionCommand.RaisingAgentProjectReady]: handleAgentProjectReady,
			[RedQuickDistributionCommand.RaisingAgentProjectBusy]: handleAgentProjectBusy,
			[RedQuickDistributionCommand.CompletedJobItem]: handleCompltedJobItem,
			[RedQuickDistributionCommand.SetCommandCenter]: setCommandCenter,
			[RedQuickDistributionCommand.UpdateCommandCenter]: noOp
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
	console.log('set command center');
	if (msg) {
		runnerContext.commandCenter = { ...runnerContext.commandCenter, ...msg };
	}
	console.log(runnerContext.commandCenter);
	return { success: true };
}
async function noOp(): Promise<ListenerReply> {
	return { error: 'this operation is handled by the runner.' };
}

async function handleAgentProjectReady(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	return await handleAgentProjectStateChange(message, true);
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
				console.log(`updating ready to ${ready} for ${message.agentProject}.`);
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
	console.log('tell command center');
	if (
		runnerContext.commandCenter &&
		runnerContext.commandCenter.commandCenterPort &&
		runnerContext.commandCenter.commandCenterHost
	) {
		try {
			await communicationTower.send(
				{
					host: runnerContext.commandCenter.commandCenterHost,
					port: runnerContext.commandCenter.commandCenterPort
				},
				'',
				RedQuickDistributionCommand.UpdateCommandCenter
			);
			console.log('told command center');
		} catch (e) {
			console.log(e);
		}
	}
}
async function handleCompltedJobItem(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	await sleep(10 * 1000);
	console.log('CompletedJobItem');
	console.log('handing completed job item');
	if (message.projectName) {
		if (message.fileName) {
			console.log(communicationTower.agentName || '');
			let relativePath = path_join(
				JobServiceConstants.JobPath(),
				communicationTower.agentName || '',
				message.projectName,
				message.fileName
			);
			console.log(relativePath);
			if (fs.existsSync(path_join(relativePath, JobServiceConstants.OUTPUT))) {
				if (await JobService.CanJoinFiles(relativePath, JobServiceConstants.OUTPUT)) {
					let content = await JobService.JoinFile(relativePath, JobServiceConstants.OUTPUT);
					let completed = await JobService.SetJobPartComplete(relativePath);
					await JobService.SetJobPartComplete(relativePath);
					if (!completed) {
						throw new Error('job was not set to completed');
					}
					fs.writeFileSync(path_join(relativePath, JobServiceConstants.OUTPUT), content, 'utf8');

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
async function handleHandRaising(message: RedQuickDistributionMessage): Promise<ListenerReply> {
	if (message.agentName) {
		// The ready value shouldn't be effected by the hand raising
		if (runnerContext.agents[message.agentName]) {
			let tempProjects = runnerContext.agents[message.agentName].projects;
			if (tempProjects) {
				Object.keys(tempProjects).forEach((v) => {
					if (message.projects && message.projects[v]) {
						message.projects[v].ready = tempProjects[v].ready;
					}
				});
			}
		}
		runnerContext.agents[message.agentName] = {
			...runnerContext.agents[message.agentName] || { projects: {} },
			projects: message.projects || {},
			name: message.agentName,
			host: message.hostname,
			port: message.port,
			lastUpdated: Date.now()
		};
		Object.keys(runnerContext.agents[message.agentName].projects).forEach((agentProject) => {
			JobService.UpdateReadyAgents(runnerContext.agents[message.agentName].projects[agentProject]);
		});
		console.log('hand raised');
		console.log(runnerContext.agents);
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
	console.log('read job file path');
	console.log(jobFilePath);
	let jobConfigContents = fs.readFileSync(jobFilePath, 'utf8');
	let jobConfig: JobFile = JSON.parse(jobConfigContents);
	if (!jobConfig.error && !jobConfig.completed) {
		try {
			let graphPath = jobConfig.graphPath;
			console.log('get next command');
			let currentStep = BuildAllInfo.Commands.findIndex((v) => v.name === jobConfig.step);
			console.log('setup job');
			console.log(graphPath);
			await setupJob(path.dirname(graphPath));
			let step = BuildAllInfo.Commands[currentStep + 1];
			console.log(`step: ${step.name}`);
			console.log(`currentStep: ${currentStep + 1}`);

			console.log('build all distributed');
			await BuildAllDistributed(step.name, jobConfig);
			let cg = GetCurrentGraph();
			console.log(`version to save : ${JSON.stringify(cg.version, null, 4)}`);

			console.log('save current graph to');
			delete jobConfig.updatedGraph;
			await saveCurrentGraphTo(graphPath, cg);
			await ensureDirectory(path_join(path.dirname(graphPath), 'stages'));
			await saveCurrentGraphTo(path_join(path.dirname(graphPath), 'stages', `${step.name}.rqb`), cg);
			jobConfig.step = step.name;
			console.log(jobConfig.step);
		} catch (e) {
			console.log(e);
			console.log(jobConfig);
			jobConfig.error = `${e}`;
		} finally {
			await JobService.saveJobFile(jobFilePath, jobConfig);
		}
	} else if (jobConfig.error) {
		console.log('job has an error, skipping');
	}
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
						console.log('createJobs: file doesnt exist');
					}
				} else {
					console.log('no file path');
				}
			} catch (e) {
				console.error(e);
			}
		});
	} else {
		console.log('no jobs folder');
	}
}
