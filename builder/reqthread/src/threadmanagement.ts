import fs from 'fs';
import path from 'path';
import os from 'os';
import NameService from './nameservice';
import SpawnCmd from './spawncmd';
import ChildProcess, { ChildProcessOptions } from './childprocess';
import { DistrConfig } from './distrconfig';
import { DistrThread } from './distrthread';
import CommunicationTower, {
	RedQuickDistributionCommand,
	RedQuickDistributionMessage
} from '../../app/jobs/communicationTower';
import { ProgressTracking } from './progressTracking';
import { AgentProjects, AgentProject } from '../../app/jobs/interfaces';
import JobService, { JobServiceConstants, getFiles, ensureDirectory } from '../../app/jobs/jobservice';
import { uuidv4 } from '../../app/utils/array';
import { fs_existsSync } from '../../app/generators/modelgenerators';
let oneHour = 1000 * 60 * 60;

export default class ThreadManagement {
	configuration: DistrConfig;
	threads: { [key: string]: DistrThread };
	communicationTower: CommunicationTower;
	progressTracking: ProgressTracking;
	runJobHandler: Function;
	ipAddress: any;
	onReady: any;
	ready: boolean;
	async start(config: DistrConfig, options: ChildProcessOptions, $runJobHandler: any, onReady: any) {
		this.configuration = config;
		this.configuration.agentName = options.agentName;
		this.configuration.agentProject = options.projectName;
		console.log(options);
		console.log(config);
		console.log(`starting thread management ${this.configuration.agentName} ${this.configuration.agentProject}`);
		this.onReady = onReady;
		this.threads = {};
		this.runJobHandler = $runJobHandler;
		await ensureDirectory(this.configuration.workingDirectory);

		this.communicationTower = new CommunicationTower();
		this.communicationTower.init({
			agentName: config.agentName,
			baseFolder: config.baseFolder,
			topDirectory: config.folder,
			serverPort: 0
		});
		this.ipAddress = this.communicationTower.getIpaddress().hostname;
		console.log('start listening');
		await this.listen();
	}

	async listen() {
		await this.communicationTower.start({
			[RedQuickDistributionCommand.ConfirmFile]: noOp,
			[RedQuickDistributionCommand.Progress]: async (message: RedQuickDistributionMessage) => {
				return {
					progress: this.progressTracking,
					succes: true
				};
			},
			[RedQuickDistributionCommand.RUN_JOB]: async (message: RedQuickDistributionMessage) => {
				console.log('run job here');
				if (!message.agentProject) {
					return {
						error: 'no agentProject set'
					};
				}
				console.debug(`${message.agentProject} === ${this.configuration.agentProject}`);
				if (message.agentProject === this.configuration.agentProject) {
					this.runJob(message);
					await sleep(1000);
					console.log('running job here');
					return {
						error: null,
						success: true
					};
				}
				console.log('error trying to run');
				return {
					error: 'No agent'
				};
			},
			[RedQuickDistributionCommand.CanReturnResults]: noOp,
			[RedQuickDistributionCommand.RaisingAgentProjectBusy]: noOp,
			[RedQuickDistributionCommand.RaisingAgentProjectReady]: noOp,
			[RedQuickDistributionCommand.RaisingAgentProjectProgress]: noOp,
			[RedQuickDistributionCommand.RaisingAgentProjectError]: noOp,
			[RedQuickDistributionCommand.RaisingHand]: noOp,
			[RedQuickDistributionCommand.SetCommandCenter]: noOp,
			[RedQuickDistributionCommand.UpdateCommandCenter]: noOp,
			[RedQuickDistributionCommand.SendFile]: noOp,
			[RedQuickDistributionCommand.SetAgentProjects]: noOp,
			[RedQuickDistributionCommand.CompletedJobItem]: noOp
		});
		let ctPort = this.communicationTower.getPort();
		if (ctPort) {
			this.raiseHand({
				agentName: this.configuration.agentName,
				agentProject: this.configuration.agentProject,
				port: ctPort,
				host: this.ipAddress
			});
		} else {
			throw new Error(`ctPort is not valid ${ctPort}`);
		}

		this.ready = true;
		console.log('ready to call onReady');
		if (this.onReady) {
			console.log('called on ready');
			this.onReady();
		}
	}
	runJob(message: RedQuickDistributionMessage) {
		setTimeout(() => {
			this.runJobHandler(message);
		}, 100);
	}
	async sendBackResults(completedJobItem: {
		folderPath: string;
		agentName: string;
		projectName: string;
		fileName: string;
		jobInstancePath: string;
	}) {
		let canReturnFiles: any = false;
		do {
			try {
				console.log('can i return files');
				canReturnFiles = await this.communicationTower.send(
					{
						agent: completedJobItem.agentName,
						name: completedJobItem.projectName,
						host: this.configuration.remoteServerHost,
						port: this.configuration.remoteServerPort
					},
					'',
					RedQuickDistributionCommand.CanReturnResults,
					{
						projectName: completedJobItem.projectName,
						fileName: completedJobItem.fileName
					}
				);
				// console.log(canReturnFiles);
				if (!canReturnFiles.body.success) {
					canReturnFiles = false;
				}
			} catch (e) {
				await sleep(10 * 1000);
				canReturnFiles = false;
			}
		} while (!canReturnFiles);
		await this.send({
			response: RedQuickDistributionCommand.RaisingAgentProjectProgress,
			command: RedQuickDistributionCommand.RaisingAgentProjectProgress,
			progress: 0
		});
		console.log('now i can');
		// let attempts = 3;
		// do {
		// 	attempts--;
		// 	try {
		let files = getFiles(path.join(completedJobItem.jobInstancePath, JobServiceConstants.OUTPUT_FOLDER));
		await files.forEachAsync(async (outputGraphFile, index, end) => {
			await this.communicationTower.transferFile(
				{
					agent: completedJobItem.agentName,
					name: completedJobItem.projectName,
					host: this.configuration.remoteServerHost,
					port: this.configuration.remoteServerPort
				},
				path.join(
					completedJobItem.projectName,
					completedJobItem.fileName,
					JobServiceConstants.OUTPUT_FOLDER,
					outputGraphFile
				),
				path.join(completedJobItem.jobInstancePath, JobServiceConstants.OUTPUT_FOLDER, outputGraphFile)
			);
			await this.send({
				response: RedQuickDistributionCommand.RaisingAgentProjectProgress,
				command: RedQuickDistributionCommand.RaisingAgentProjectProgress,
				progress: index / end
			});
		});

		await this.communicationTower.transferFile(
			{
				agent: completedJobItem.agentName,
				name: completedJobItem.projectName,
				host: this.configuration.remoteServerHost,
				port: this.configuration.remoteServerPort
			},
			path.join(completedJobItem.projectName, completedJobItem.fileName, JobServiceConstants.OUTPUT),
			path.join(completedJobItem.jobInstancePath, JobServiceConstants.OUTPUT)
		);

		await this.send({
			response: RedQuickDistributionCommand.RaisingAgentProjectProgress,
			command: RedQuickDistributionCommand.RaisingAgentProjectProgress,
			progress: 1
		});
		let result = false;
		do {
			try {
				result = await this.communicationTower.send(
					{
						agent: completedJobItem.agentName,
						name: completedJobItem.projectName,
						host: this.configuration.remoteServerHost,
						port: this.configuration.remoteServerPort
					},
					'',
					RedQuickDistributionCommand.CompletedJobItem,
					{
						projectName: completedJobItem.projectName,
						fileName: completedJobItem.fileName
					}
				);
			} catch (e) {
				console.log(e);
				await sleep(10 * 1000);
				result = false;
			}
		} while (!result);

		// await sleep(10 * 1000);
		let jobFolder = path.join(
			this.configuration.baseFolder,
			this.getAgentName(),
			completedJobItem.projectName,
			completedJobItem.fileName
		);
		if (fs_existsSync(jobFolder)) {
			await JobService.deleteFolder(jobFolder);
		}
		// 	} catch (e) {
		// 		console.error('error transferring files back');
		// 	}
		// } while (attempts);
	}
	async send(arg: any) {
		await this.communicationTower.send(
			{
				...arg,
				agent: this.configuration.agentName,
				name: this.configuration.agentProject,
				host: this.configuration.remoteServerHost,
				port: this.configuration.remoteServerPort
			},
			'',
			arg.command
		);
	}
	async raiseHand(project: AgentProject) {
		let command = RedQuickDistributionCommand.RaisingHand;
		let agentName = this.getAgentName();
		do {
			// console.log(project);
			let completed = false;
			try {
				// console.log(
				// 	`calling ${this.configuration.remoteServerHost}:${this.configuration
				// 		.remoteServerPort} to ${command}`
				// );
				let res = await this.communicationTower
					.send(
						{
							agent: agentName,
							host: this.configuration.remoteServerHost,
							port: this.configuration.remoteServerPort
						},
						'',
						command,
						{ project }
					)
					.catch((e) => {
						console.log('couldnt raise hand');
						return {
							error: 'threw error'
						};
					});
				if (res && res.error) {
					console.log('didnt get ack without error');
				} else {
					completed = true;
				}
				if (completed) {
					await sleep(120 * 1000);
				} else {
					await sleep(this.configuration.checkWait || 10 * 1000);
				}
			} catch (e) {}
		} while (true);
		console.log('successfully raised hand');
	}

	getAgentName() {
		return `${os.hostname()}_${os.platform()}`;
	}
}
interface LocalDev {
	cpuCount: number;
	agent: string;
	threads: number;
	updated: number;
	lastCommit: number;
	projects: AgentProjects;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function noOp() {
	return {
		error: 'no operation for this client'
	};
}
