import path from 'path';
import { DistrConfig } from './distrconfig';
import child_process from 'child_process';
import { DistrThread } from './distrthread';
import { Operations } from './thread';
import { RedQuickDistributionMessage } from '../../app/jobs/communicationTower';
let callbackChain = Promise.resolve();
export default class ChildProcess implements DistrThread {
	commandQueue: Command[];
	threadResponse: ChildProcessThread;
	completedFunc: (arg: any) => void;
	errorFunc: (arg: any) => void;
	changeFunc: (arg: any) => Promise<void>;
	constructor(
		public options: ChildProcessOptions,
		public config: DistrConfig,
		callback: (response: string) => Promise<void>
	) {
		console.log('starting thread @ ' + (config.entryPath || path.join('./dist/thread.js')));
		const thread = child_process.fork(config.entryPath || path.join('./dist/thread.js'));
		thread.on('message', (message: ThreadMessage) => {
			let { id, response, complete, changed } = message;
			if (this.threadResponse) {
				this.threadResponse.used = false;
				try {
					callbackChain = callbackChain
						.then(async () => {
							await callback(response);
						})
						.catch((e) => {
							console.log(e);
						});
					// probably can go away
					if (changed) {
						this.changeFunc(message);
					}
					if (complete) {
						this.completed(message);
					}
					// to here
				} catch (e) {
					console.error(e);
					this.errored(message);
				}
				if (this.commandQueue && this.commandQueue.length) {
					let command = this.commandQueue.shift();
					this.threadResponse.used = true;
					this.threadResponse.thread.send({
						...command
					});
				}
			}
		});
		let initialCommand: Command = {
			message: {
				options,
				config,
				command: Operations.INIT
			},
			id: 'initial'
		};
		thread.send(initialCommand);
		this.threadResponse = {
			used: false,
			thread
		};
	}
	send(message: RedQuickDistributionMessage) {
		this.threadResponse.thread.send(message);
	}
	onChange(args0: (arg: any) => Promise<void>) {
		this.changeFunc = args0;
	}
	changed(arg: any) {
		console.log('changed');
		if (this.changeFunc) {
			console.log('changed called');
			this.changeFunc(arg);
		}
	}
	completed(arg: any) {
		if (this.completedFunc) {
			this.completedFunc(arg);
		}
	}
	errored(arg: any) {
		if (this.errorFunc) {
			this.errorFunc(arg);
		}
	}
	onComplete(arg0: (arg: any) => void) {
		this.completedFunc = arg0;
	}
	onError(arg0: (arg: any) => void) {
		this.errorFunc = arg0;
	}
	static async init(
		config: DistrConfig,
		childProcessOptions: ChildProcessOptions,
		callback: (response: string) => Promise<void>
	): Promise<ChildProcess> {
		let childProces = new ChildProcess(childProcessOptions, config, callback);

		return childProces;
	}
}
export interface ChildProcessOptions {
	projectName: string;
	folderPath: string;
	agentName: string;
}
export interface ThreadMessage {
	id: string;
	response: any;
	complete: any;
	changed: any;
}
export interface Command {
	id: string;
	message: any;
}
export interface ChildProcessThread {
	thread: child_process.ChildProcess;
	used: boolean;
}
