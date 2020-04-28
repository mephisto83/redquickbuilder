import fs from 'fs';
import path from 'path';
import os from 'os';
import NameService from './nameservice';
import SpawnCmd from './spawncmd';
import ChildProcess from './childprocess';
import { DistrConfig } from './distrconfig';
import { DistrThread } from './distrthread';
import CommunicationTower, {
	RedQuickDistributionCommand,
	RedQuickDistributionMessage
} from '../../app/jobs/communicationTower';
import { ProgressTracking } from './progressTracking';
import { AgentProjects } from '../../app/jobs/interfaces';
let oneHour = 1000 * 60 * 60;

export default class Distribution {
	configuration: DistrConfig;
	threads: { [key: string]: DistrThread };
	communicationTower: CommunicationTower;
	progressTracking: ProgressTracking;
	ipAddress: any;
	async start(config: DistrConfig) {
		let localDev: LocalDev;
		this.configuration = config;
		this.threads = {};
		if (this.hasLocalDev()) {
			localDev = this.getLocalDev();
		} else {
			localDev = this.initLocalDev();
			this.storeLocalDev(localDev);
		}
		this.communicationTower = new CommunicationTower();
		this.communicationTower.init({
			agentName: this.getAgentName(),
			baseFolder: config.baseFolder,
			topDirectory: config.folder,
			serverPort: config.serverPort
		});
		this.ipAddress = this.communicationTower.getIpaddress();
		this.setupLocalDev(localDev);

		localDev = await this.updateLocalDev(localDev);
	}

	setupLocalDev(localDev: LocalDev) {
		let agent = this.getAgentName();
		Object.keys(localDev.projects).forEach((project: string) => {
			localDev.projects[project].name = project;
			localDev.projects[project].agent = agent;
			localDev.projects[project].port = this.configuration.serverPort;
			localDev.projects[project].host = this.ipAddress.hostname;
			localDev.projects[project].ready = true;
		});
	}

	async run(debug: boolean = false) {
		let ok: any;
		let localDev: LocalDev = this.getLocalDev();

		try {
			await this.isOk();
			await this.coordinateLocalThreads(localDev);
			await this.updateLocalDev(localDev);
			if (!debug) {
				await this.waitForThreads(localDev);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async waitForThreads(localDev: LocalDev) {
		console.log('waiting for threads');
		let projects = localDev.projects;
		console.log(projects);
		return Promise.all([
			...Object.keys(projects).map((pn) => {
				return new Promise((resolve, fail) => {
					this.threads[pn].onComplete(() => {
						resolve();
					});
					this.threads[pn].onChange(async (arg: any) => {
						//	await this.updateLocalDev(localDev);
						if (this.configuration.remoteServerPort && this.configuration.remoteServerHost) {
							if (arg.command) {
								console.log(`${arg.command}`);
								this.communicationTower.send(
									{
										...arg,
										agent: arg.agentName,
										name: arg.agentProject,
										host: this.configuration.remoteServerHost,
										port: this.configuration.remoteServerPort
									},
									'',
									arg.command
								);
							}
						}
					});
					this.threads[pn].onError(() => {
						resolve();
					});
				});
			}),
			new Promise(async (resolve, fail) => {
				this.communicationTower.start({
					[RedQuickDistributionCommand.Progress]: async (message: RedQuickDistributionMessage) => {
						return {
							progress: this.progressTracking,
							succes: true
						};
					},
					[RedQuickDistributionCommand.RUN_JOB]: async (message: RedQuickDistributionMessage) => {
						let agentProject = this.threads[message.agentProject];
						if (agentProject) {
							if (!message.agentProject) {
								return {
									error: 'no agentProject set'
								};
							}
							agentProject.send(message);
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
					[RedQuickDistributionCommand.SendFile]: noOp,
					[RedQuickDistributionCommand.SetAgentProjects]: noOp
				});
				await this.raiseHand(projects);
			})
		]);
	}
	async raiseHand(projects: AgentProjects) {
		let completed = false;
		let command = RedQuickDistributionCommand.RaisingHand;
		let agentName = this.getAgentName();
		do {
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
						{ projects }
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
          console.log(res);
				}
				await sleep(this.configuration.checkWait || 10 * 1000);
			} catch (e) {}
		} while (!completed);
		console.log('successfully raised hand');
	}
	async coordinateLocalThreads(localDev: LocalDev) {
		await this.initThreads(localDev);
	}
	async initThreads(localDev: LocalDev) {
		let projects = localDev.projects;
		let promise = Promise.resolve();
		Object.keys(projects).map((projectName) => {
			promise = promise
				.then(async () => {
					this.threads[projectName] = await ChildProcess.init(
						this.configuration,
						{
							projectName,
							folderPath: path.resolve(this.configuration.workingDirectory),
							agentName: this.getAgentName()
						},
						async (res: any) => {
							console.log(`-----------${projectName}------------`);
							console.log(res);
							if (res === 'CHANGED') {
								await this.updateLocalDev(localDev).catch((e) => {
									console.log(e);
								});
							}
						}
					);
				})
				.catch(console.error);
		});
		return promise;
	}
	async updateLocalDev(localDev: LocalDev): Promise<LocalDev> {
		console.log('updat local dev');
		localDev.updated = Date.now();
		this.storeLocalDev(localDev);
		await this.writeAgentStrucuture(localDev);
		await this.ensureJob(localDev);
		return localDev;
	}
	writeAgentStrucuture(localDev: LocalDev) {
		if (!fs.existsSync(path.join(this.configuration.workingDirectory, './agents'))) {
			fs.mkdirSync(path.join(this.configuration.workingDirectory, './agents'));
		}
		let agentPath = path.join(this.configuration.workingDirectory, './agents', this.getAgentName());
		if (!fs.existsSync(agentPath)) {
			fs.mkdirSync(agentPath);
		}

		Object.keys(localDev.projects).forEach((pn) => {
			if (!fs.existsSync(path.join(agentPath, pn))) {
				fs.mkdirSync(path.join(agentPath, pn));
			}
			fs.writeFileSync(path.join(agentPath, pn, `config.json`), this.getProjectConfig(localDev, pn), 'utf8');
		});
	}
	ensureJob(localDev: LocalDev) {
		if (!fs.existsSync(path.join(this.configuration.workingDirectory, './jobs'))) {
			fs.mkdirSync(path.join(this.configuration.workingDirectory, './jobs'));
		}
	}
	getProjectConfig(localDev: LocalDev, pn: string): string {
		return JSON.stringify({
			project: pn,
			updated: Date.now()
		});
	}
	async isOk() {
		let ld: LocalDev = this.getLocalDev();
		return ld.updated + oneHour < Date.now();
	}
	hasLocalDev() {
		console.log('has local dev?');
		return fs.existsSync(path.join(this.configuration.workingDirectory || './', './dev.local'));
	}
	storeLocalDev(ld: LocalDev) {
		console.log('storing local dev');
		fs.writeFileSync(
			path.join(this.configuration.workingDirectory || './', './dev.local'),
			JSON.stringify(ld, null, 4),
			'utf8'
		);
	}
	getLocalDev(): LocalDev {
		console.log('get local dev');
		let localDev = fs.readFileSync(path.join(this.configuration.workingDirectory || './', './dev.local'), 'utf8');
		return JSON.parse(localDev);
	}
	initLocalDev(): LocalDev {
		console.log('initialize local dev');
		const cpuCount = os.cpus().length;
		const threads = this.configuration.threads || Math.floor(cpuCount / 2 - 1) || 1;
		const projectNames = [];

		do {
			let projectname = NameService.projectGenerator();
			if (projectNames.indexOf(projectname) === -1) {
				projectNames.push(projectname);
				console.log(projectname);
			} else {
				break;
			}
			if (projectNames.length >= threads) {
				break;
			}
		} while (true);
		let projects = {};
		projectNames.forEach((pn) => {
			console.log(pn);
			projects[pn.trim()] = {};
		});

		let localDev: LocalDev = {
			cpuCount,
			agent: this.getAgentName(),
			threads: Math.floor(cpuCount / 2 - 1) || 1,
			projects,
			lastCommit: 0,
			updated: Date.now()
		};

		return localDev;
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
