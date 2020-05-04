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
let oneHour = 1000 * 60 * 60;

export default class ThreadManagement {
	configuration: DistrConfig;
	threads: { [key: string]: DistrThread };
	communicationTower: CommunicationTower;
	progressTracking: ProgressTracking;
	runJobHandler: Function;
	ipAddress: any;
	onReady: any;
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
		await new Promise(async (resolve, fail) => {
			await this.communicationTower.start({
				[RedQuickDistributionCommand.Progress]: async (message: RedQuickDistributionMessage) => {
					return {
						progress: this.progressTracking,
						succes: true
					};
				},
				[RedQuickDistributionCommand.RUN_JOB]: async (message: RedQuickDistributionMessage) => {
					let agentProject = this.threads[message.agentProject];
					if (!message.agentProject) {
						return {
							error: 'no agentProject set'
						};
					}

					if (message.agentProject === this.configuration.agentProject) {
						this.runJob(message);
						await sleep(1000);
						return {
							error: null,
							success: true
						};
					}
					return {
						error: 'No agent'
					};
				},
				[RedQuickDistributionCommand.RaisingAgentProjectBusy]: noOp,
				[RedQuickDistributionCommand.RaisingAgentProjectReady]: noOp,
				[RedQuickDistributionCommand.RaisingHand]: noOp,
				[RedQuickDistributionCommand.SetCommandCenter]: noOp,
				[RedQuickDistributionCommand.UpdateCommandCenter]: noOp,
				[RedQuickDistributionCommand.SendFile]: noOp,
				[RedQuickDistributionCommand.SetAgentProjects]: noOp,
				[RedQuickDistributionCommand.CompletedJobItem]: noOp
			});
			let ctPort = this.communicationTower.getPort();
			if (ctPort) {
				await this.raiseHand({
					agentName: this.configuration.agentName,
					agentProject: this.configuration.agentProject,
					port: ctPort,
					host: this.ipAddress
				});
			} else {
				throw new Error(`ctPort is not valid ${ctPort}`);
			}
		});

		this.onReady();
	}
	runJob(message: RedQuickDistributionMessage) {
		this.runJobHandler(message);
	}
	async sendBackResults(completedJobItem: {
		folderPath: string;
		agentName: string;
		projectName: string;
		fileName: string;
		jobInstancePath: string;
	}) {
		let attempts = 3;
		do {
			attempts--;
			try {
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

				await getFiles(
					path.join(completedJobItem.jobInstancePath, JobServiceConstants.OUTPUT_FOLDER)
				).forEachAsync(async (outputGraphFile) => {
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
				});
				let result = await this.communicationTower.send(
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

				await sleep(10 * 1000);
				if (result.success) {
					attempts = 0;
					let jobFolder = path.join(
						this.configuration.baseFolder,
						this.getAgentName(),
						completedJobItem.projectName
					);
					if (fs.existsSync(jobFolder)) {
						await JobService.deleteFolder(jobFolder);
					}
				}
			} catch (e) {
				console.error('error transferring files back');
			}
		} while (attempts);
	}
	async send(arg: any) {
		throw new Error('Method not implemented.');
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
			let completed = false;
			try {
				console.log(
					`calling ${this.configuration.remoteServerHost}:${this.configuration
						.remoteServerPort} to ${command}`
				);
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

	// async coordinateLocalThreads(localDev: LocalDev) {
	// 	await this.initThreads(localDev);
	// }
	// async initThreads(localDev: LocalDev) {
	// 	let projects = localDev.projects;
	// 	let promise = Promise.resolve();
	// 	Object.keys(projects).map((projectName) => {
	// 		promise = promise
	// 			.then(async () => {
	// 				this.threads[projectName] = await ChildProcess.init(this.configuration, {
	// 					projectName,
	// 					folderPath: path.resolve(this.configuration.workingDirectory),
	// 					agentName: this.getAgentName()
	// 				});
	// 			})
	// 			.catch(console.error);
	// 	});
	// 	return promise;
	// }

	// async writeAgentStrucuture(localDev: LocalDev) {
	// 	let agentPath = path.join(this.configuration.workingDirectory, './agents', this.getAgentName());
	// 	await ensureDirectory(agentPath);

	// 	// Object.keys(localDev.projects).forEach((pn) => {
	// 	// 	if (!fs.existsSync(path.join(agentPath, pn))) {
	// 	// 		fs.mkdirSync(path.join(agentPath, pn));
	// 	// 	}
	// 	// 	fs.writeFileSync(path.join(agentPath, pn, `config.json`), this.getProjectConfig(localDev, pn), 'utf8');
	// 	// });
	// }
	// ensureJob(localDev: LocalDev) {
	// 	if (!fs.existsSync(path.join(this.configuration.workingDirectory, './jobs'))) {
	// 		fs.mkdirSync(path.join(this.configuration.workingDirectory, './jobs'));
	// 	}
	// }
	// getProjectConfig(localDev: LocalDev, pn: string): string {
	// 	return JSON.stringify({
	// 		project: pn,
	// 		updated: Date.now()
	// 	});
	// }
	// async isOk() {
	// 	let ld: LocalDev = this.getLocalDev();
	// 	return ld.updated + oneHour < Date.now();
	// }
	// hasLocalDev() {
	// 	console.log('has local dev?');
	// 	return fs.existsSync(path.join(this.configuration.workingDirectory || './', './dev.local'));
	// }
	// storeLocalDev(ld: LocalDev) {
	// 	console.log('storing local dev');
	// 	fs.writeFileSync(
	// 		path.join(this.configuration.workingDirectory || './', './dev.local'),
	// 		JSON.stringify(ld, null, 4),
	// 		'utf8'
	// 	);
	// }
	// getLocalDev(): LocalDev {
	// 	console.log('get local dev');
	// 	let localDev = fs.readFileSync(path.join(this.configuration.workingDirectory || './', './dev.local'), 'utf8');
	// 	return JSON.parse(localDev);
	// }
	// initLocalDev(): LocalDev {
	// 	console.log('initialize local dev');
	// 	const cpuCount = os.cpus().length;
	// 	const threads = this.configuration.threads || Math.floor(cpuCount / 2 - 1) || 1;
	// 	const projectNames = [];

	// 	do {
	// 		let projectname = `${NameService.projectGenerator()}-${uuidv4().split('-')[0]}`;
	// 		if (projectNames.indexOf(projectname) === -1) {
	// 			projectNames.push(projectname);
	// 			console.log(projectname);
	// 		} else {
	// 			break;
	// 		}
	// 		if (projectNames.length >= threads) {
	// 			break;
	// 		}
	// 	} while (true);
	// 	let projects = {};
	// 	projectNames.forEach((pn) => {
	// 		console.log(pn);
	// 		projects[pn.trim()] = {};
	// 	});

	// 	let localDev: LocalDev = {
	// 		cpuCount,
	// 		agent: this.getAgentName(),
	// 		threads: Math.floor(cpuCount / 2 - 1) || 1,
	// 		projects,
	// 		lastCommit: 0,
	// 		updated: Date.now()
	// 	};

	// 	return localDev;
	// }
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