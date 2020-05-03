import fs from 'fs';
import path, { parse } from 'path';
import task from './task';
import { getDirectories } from '../../app/jobs/jobservice';
import { sleep } from './threadutil';
import { RedQuickDistributionCommand } from '../../app/jobs/communicationTower';

process.on('message', (command: any) => {
	let { message } = command;

	let parsedMessage = message;
	console.log('received message from parent thread');
	console.log(command);
	if (parsedMessage) {
		switch (parsedMessage.command) {
			case Operations.INIT:
				context.options = parsedMessage.options;
				context.config = parsedMessage.config;
				console.log(context.options);
				process.send({ response: Operations.INIT });
				process.send({ response: 'starting loop' });
				process.send({
					response: RedQuickDistributionCommand.RaisingAgentProjectReady,
					command: RedQuickDistributionCommand.RaisingAgentProjectReady,
					changed: true,
					ready: true,
					agentName: context.options.agentName,
					agentProject: context.options.projectName
				});
				break;
			default:
				process.send({ response: Operations.NO_OP });
				break;
		}
	} else if (command.command) {
		switch (command.command) {
			case RedQuickDistributionCommand.RUN_JOB:
				let { filePath } = command;
				let { options } = context;
				console.log('Starting job --------- ');
				job({ ...options, projectName: filePath[0], fileName: filePath[1] });
				break;
		}
	}
});
let jobPromise = Promise.resolve();
async function job(options) {
	let { folderPath, agentName, projectName, fileName } = options;
	let jobPath = path.join(folderPath, agentName, projectName, fileName);
	console.log(`jobPath: ${jobPath}`);
	if (fs.existsSync(jobPath)) {
		let jobsIndirectories = getDirectories(jobPath);
		if (jobsIndirectories && jobsIndirectories.length) {
			process.send({
				response: RedQuickDistributionCommand.RaisingAgentProjectBusy,
				command: RedQuickDistributionCommand.RaisingAgentProjectBusy,
				changed: true,
				ready: false,
				agentName,
				agentProject: context.options.projectName
			});
			context.busy = true;
			try {
				await task(jobPath, options, (completedJobItem) => {
					process.send({ response: Operations.CHANGED, changed: true, completedJobItem });
				});
			} catch (e) {
				console.log(e);
			}
			context.busy = false;
			console.log('job completed');
			process.send({ response: Operations.COMPLETED_TASK });
			process.send({
				response: RedQuickDistributionCommand.RaisingAgentProjectReady,
				command: RedQuickDistributionCommand.RaisingAgentProjectReady,
				changed: true,
				ready: true,
				agentName,
				agentProject: context.options.projectName
			});
		}
	}
}

async function loop() {
	let noerror = true;
	do {
		try {
			process.send({ response: 'taking a nap' });
			await sleep();
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
			console.log('loop done');
			if (!context.busy) {
				console.log('not busy');
				process.send({
					response: RedQuickDistributionCommand.RaisingAgentProjectReady,
					command: RedQuickDistributionCommand.RaisingAgentProjectReady,
					changed: true,
					ready: true,
					agentName: context.options.agentName,
					agentProject: context.options.projectName
				});
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
			process.send({ response: 'couldnt update the agent file ' + projectName, completed: true });
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
	return await loop();
})();
