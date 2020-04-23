import fs from 'fs';
import path from 'path';
import task from './task';
import { getDirectories } from '../../app/jobs/jobservice';

process.on('message', (command: any) => {
	let { message } = command;

	let parsedMessage = message;
	console.log(command);
	switch (parsedMessage.command) {
		case Operations.INIT:
			context.options = parsedMessage.options;
			console.log(context.options);
			process.send({ response: Operations.INIT });
			process.send({ response: 'starting loop' });
			break;
		default:
			process.send({ response: Operations.NO_OP });
			break;
	}
});

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
				let jobPath = path.join(folderPath, 'agents', agentName, projectName);
				if (fs.existsSync(jobPath)) {
					let jobsIndirectories = getDirectories(jobPath);
					if (jobsIndirectories && jobsIndirectories.length) {
						process.send({ response: Operations.EXECUTING_TASK });
						await task(jobPath);
						process.send({ response: Operations.COMPLETED_TASK });
					}
				}
			} else {
				console.warn('no options yet');
			}
		} catch (e) {
			noerror = false;
			console.error(e);
		}
	} while (noerror);
}
function sleep(ms: number = 30 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
	options: null
};
export const Operations = {
	NO_OP: 'NO_OP',
	EXECUTING_TASK: 'EXECUTING_TASK',
	INIT: 'INIT',
	COMPLETED_TASK: 'COMPLETED_TASK'
};

(async function() {
	return await loop();
})();
