import fs from 'fs';
import path, { parse } from 'path';
import task from './task';
import { getDirectories } from '../../app/jobs/jobservice';
import { sleep } from './threadutil';
import { RedQuickDistributionCommand, RedQuickDistributionMessage } from '../../app/jobs/communicationTower';
import ThreadManagement from './threadmanagement';
import { ChildProcessOptions } from './childprocess';
import { DistrConfig } from './distrconfig';

let threadManagement: ThreadManagement = new ThreadManagement();
process.on(
	'message',
	(command: { message: { command: string; options: ChildProcessOptions; config: DistrConfig } }) => {
		let { message } = command;
		let { options, config } = message;

		console.log('received message from parent thread');
		console.log(command);
		if (message) {
			switch (message.command) {
				case Operations.INIT:
					threadManagement.start(
						message.config,
						options,
						(command: RedQuickDistributionMessage) => {
							let { filePath } = command;
							let { options } = context;
							console.log('Starting job --------- ');

							context.jobArgs = { ...options, projectName: filePath[0], fileName: filePath[1] };
						},
						() => {
							console.log('calling on ready-------------');
							context.options = message.options;
							context.config = message.config;
							console.log(context.options);
							console.log('starting loop');
							threadManagement.send({
								response: RedQuickDistributionCommand.RaisingAgentProjectReady,
								command: RedQuickDistributionCommand.RaisingAgentProjectReady,
								changed: true,
								ready: true
							});
						}
					);
					break;
				default:
					break;
			}
		}
	}
);
let jobPromise = Promise.resolve();
async function job(options) {
	let { folderPath, agentName, projectName, fileName } = options;
	let jobPath = path.join(folderPath, agentName, projectName, fileName);
	console.log(`jobPath: ${jobPath}`);
	if (fs.existsSync(jobPath)) {
		let jobsIndirectories = getDirectories(jobPath);
		if (jobsIndirectories && jobsIndirectories.length) {
			threadManagement.send({
				response: RedQuickDistributionCommand.RaisingAgentProjectBusy,
				command: RedQuickDistributionCommand.RaisingAgentProjectBusy,
				changed: true,
				ready: false,
				agentName,
				agentProject: context.options.projectName
			});
			context.busy = true;
			try {
				await task(jobPath, options, async (completedJobItem) => {
					await threadManagement.sendBackResults(completedJobItem);
				});
			} catch (e) {
				console.log(e);
			}
			context.busy = false;
			if (!context.jobArgs) {
				console.log('job completed');
				threadManagement.send({
					response: RedQuickDistributionCommand.RaisingAgentProjectReady,
					command: RedQuickDistributionCommand.RaisingAgentProjectReady,
					changed: true,
					ready: true
				});
			} else throw new Error('shouldnt start another job before saying that it is ready');
		} else {
			throw new Error(`no inDirectories in the job path : ${jobPath}`);
		}
	} else {
		throw new Error(`jobPath:${jobPath} doesnt exist`);
	}
}

async function loop() {
	let noerror = true;
	do {
		try {
			// console.log('taking a nap');
			if (context.busy) {
				await sleep(30 * 1000);
			} else {
				await sleep();
			}
			if (!threadManagement.ready) {
				if (context.config) console.log('not ready ' + context.config.agentProject);
				continue;
			}
			if (context.jobArgs) {
				let jobArgs = context.jobArgs;
				context.jobArgs = null;
				await sleep(10 * 1000);
				await job(jobArgs);
			}
			let { options } = context;
			if (options) {
				let { folderPath, agentName, projectName } = options;
				let success = await updateAgent(options);
				if (!success) {
					return false;
				}
			} else {
				console.warn('no options yet');
			}
			// console.log('loop done ' + context.config.agentProject);
			if (!context.busy) {
				// console.log('not busy' + context.config.agentProject);

				if (!context.jobArgs) {
					threadManagement.send({
						response: RedQuickDistributionCommand.RaisingAgentProjectReady,
						command: RedQuickDistributionCommand.RaisingAgentProjectReady,
						changed: true,
						ready: true
					});
				}
			} else {
				console.log('------------ is busy -----------------');
			}
		} catch (e) {
			noerror = false;
			console.error(e);
		}
	} while (noerror);
}

const updateAgent = async (options: any) => {
	let { folderPath, agentName, projectName } = options;
	let agentConfig = path.join(folderPath, 'agents', agentName, projectName, 'config.json');
	if (fs.existsSync(agentConfig)) {
		let fileContents = fs.readFileSync(agentConfig, 'utf8');
		try {
			let config = JSON.parse(fileContents);
			config.updated = Date.now();
			fs.writeFileSync(agentConfig, JSON.stringify(config, null, 4), 'utf8');
		} catch (e) {
			console.error(e);
			return false;
		}
	} else {
		return false;
	}
	return true;
};

const context: any = {
	options: null,
	busy: false,
	config: null
};
export const Operations = {
	NO_OP: 'NO_OP',
	EXECUTING_TASK: 'EXECUTING_TASK',
	INIT: 'INIT',
	RUN_JOB: 'RUN_JOB',
	CHANGED: 'CHANGED',
	COMPLETED_TASK: 'COMPLETED_TASK'
};

(async function() {
	await loop();
})();
