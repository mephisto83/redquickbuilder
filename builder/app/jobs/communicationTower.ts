import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import fetch from 'node-fetch';
import net from 'net';
import { AgentProject, AgentProjects } from './interfaces';
import { sleep, path_join } from './jobservice';

export interface RedQuickDistributionMessage {
	success?: any;
	agentProjects?: AgentProjects;
	hostname?: string | null;
	projects?: any;
	fileName?: any;
	filePath?: any;
	error?: boolean;
	errorMessage?: string;
	relativePath?: string;
	targetHost?: string;
	targetPort?: number;
	noPort?: boolean;
	progress?: number;
	projectName?: any;
	agentProject?: any;
	agentName?: any;
	command?: RedQuickDistributionCommand;
	port?: number;
	fileInfo?: FileInfo;
}
export interface FileInfo {
	files: { name: string; size: number }[];
}
export interface CommunicationTowerConfig {
	serverPort: number;
	agentName: string;
	baseFolder: string;
	topDirectory: string;
}
export interface ListenerReply {}
export enum RedQuickDistributionCommand {
	RUN_JOB = 'RUN_JOB',
	SendFile = 'SendFile',
	ConfirmFile = 'ConfirmFile',
	RaisingHand = 'RaisingHand',
	SetAgentProjects = 'SetAgentProjects',
	Progress = 'Progress',
	RaisingAgentProjectReady = 'RaisingAgentProjectReady',
	RaisingAgentProjectProgress = 'RaisingAgentProjectProgress',
	RaisingAgentProjectBusy = 'RaisingAgentProjectBusy',
	CompletedJobItem = 'CompletedJobItem',
	SetCommandCenter = 'SetCommandCenter',
	UpdateCommandCenter = 'UpdateCommandCenter',
	RaisingAgentProjectError = 'RaisingAgentProjectError',
	CanReturnResults = 'CanReturnResults'
}
export type CommunicationTowerListen = { [key in RedQuickDistributionCommand]: Function } | null;
export default class CommunicationTower {
	topDirectory: string;
	ports: { [port: number]: boolean };
	agentName: string;
	listeners: CommunicationTowerListen;
	baseFolder: string;
	serverPort: any;
	ctPort: any;
	receivingFile: boolean;
	constructor() {
		this.topDirectory = '';
		this.ports = {};
		this.listeners = null;
		this.agentName = '';
		this.receivingFile = false;

		this.baseFolder = '';
	}
	async send(agentProject: AgentProject, arg1: string, command: RedQuickDistributionCommand, options = {}) {
		let body = {
			...agentProject,
			...options,
			command,
			agentName: agentProject.agent,
			agentProject: agentProject.name,
			filePath: arg1.split(path.sep)
		};

		// console.debug(`http://${agentProject.host}:${agentProject.port}`);

		return await fetch(`http://${agentProject.host}:${agentProject.port}`, {
			method: 'POST',
			body: JSON.stringify(body)
		})
			.then((response: any) => {
				return response.json((res: any) => {
					if (res.body && res.body.error) {
						console.error(res);
						throw new Error(res.error);
					}
					return res;
				});
			})
			.catch((err: any) => {
				console.log(err);
				throw err;
			});
	}
	async transferFile(agentProject: AgentProject, outFolder: string, localPath: string) {
		let maxattempts = true;
		do {
			try {
				await this.sendFile(
					{
						agentName: agentProject.agent,
						agentProject: agentProject.name,
						command: RedQuickDistributionCommand.SendFile,
						relativePath: outFolder,
						targetHost: agentProject.host,
						targetPort: agentProject.port
					},
					localPath
				);

				maxattempts = false;
			} catch (e) {
				console.log(e);
				console.log(`failed to send file : attempts left`);
				await sleep(60 * 1000 + Math.random() * 100000);
			}

			try {
				await sleep(1000);

				let res = await this.confirmFile(
					{
						agentName: agentProject.agent,
						agentProject: agentProject.name,
						command: RedQuickDistributionCommand.ConfirmFile,
						relativePath: outFolder,
						targetHost: agentProject.host,
						targetPort: agentProject.port
					},
					localPath
				);
				let { body } = res;
				if (!body.success) {
					maxattempts = true;
					throw new Error('file size not confirmed');
				}
			} catch (e) {}
		} while (maxattempts);
	}
	init(config: CommunicationTowerConfig) {
		this.topDirectory = config.topDirectory;
		this.baseFolder = config.baseFolder;
		this.agentName = config.agentName;
		this.serverPort = config.serverPort;
		this.ports = {};
	}
	async start(listeners: CommunicationTowerListen) {
		this.listeners = listeners;
		let error = false;
		do {
			error = false;
			try {
				await this.startServers();
			} catch (e) {
				error = true;
				await this.wait();
				console.log(e);
			}
		} while (error);
	}
	async wait() {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, 10000);
		});
	}
	handleRequest(request: http.IncomingMessage, response: http.ServerResponse): Promise<void> {
		const { headers, method, url } = request;
		let body: any[] = [];
		let stringResult = '';
		return new Promise((resolve, fail) => {
			if (method === 'POST') {
				request
					.on('error', (err) => {
						console.error(err);
						fail();
					})
					.on('data', (chunk) => {
						body.push(chunk);
					})
					.on('end', async () => {
						stringResult = Buffer.concat(body).toString();
						let replyObject = await this.processRequest(stringResult);
						response.on('error', (err: any) => {
							console.error(err);
						});
						response.statusCode = 200;
						response.setHeader('Content-Type', 'application/json');
						// Note: the 2 lines above could be replaced with this next one:
						// response.writeHead(200, {'Content-Type': 'application/json'})
						const responseBody = { headers, method, url, body: replyObject };
						response.write(JSON.stringify(responseBody));
						response.end();
						resolve();
						// At this point, we have the headers, method, url and body, and can now
						// do whatever we need to in order to respond to this request.
					});
			} else {
				response.statusCode = 200;
				response.setHeader('Content-Type', 'application/json');
				const responseBody = { headers, method, url, body: 'noop' };
				response.write(JSON.stringify(responseBody));
				response.end();
				resolve();
			}
		});
	}
	async processRequest(strinResult: string) {
		let parsed = JSON.parse(strinResult);
		let reply: RedQuickDistributionMessage = {
			port: 0,
			error: false,
			noPort: false,
			hostname: ''
		};

		let address = this.getIpaddress();
		switch (parsed.command) {
			case RedQuickDistributionCommand.SendFile:
				reply.hostname = address.hostname;
				await this.receiveFile(parsed);
				break;
			case RedQuickDistributionCommand.ConfirmFile:
				reply.hostname = address.hostname;
				await this.checkFile(parsed, reply);
				break;
			default:
				let res = await this.onHandleReceivedMessage(parsed);
				if (res) {
					reply.error = !res.error;
					reply.errorMessage = res.error;
					reply.success = res.success;
				}
				break;
		}
		if (!reply.port) {
			reply.error = true;
			reply.noPort = true;
		}

		return reply;
	}
	async onHandleReceivedMessage(message: RedQuickDistributionMessage) {
		let progressListeners = this.listeners && message.command ? this.listeners[message.command] : null;
		if (progressListeners) {
			return await progressListeners(message);
		}
		throw new Error('no handler for ' + message.command);
	}
	async confirmFile(message: AgentProject, localFilePath: string) {
		var stats = fs.statSync(localFilePath);
		var fileSizeInBytes = stats['size'];
		let filePathArray = message.relativePath ? message.relativePath.split(path.sep) : [];
		let address: any = this.getIpaddress();
		message.hostname = address.hostname;
		console.log(`confirming file size is ${fileSizeInBytes}`);
		return await fetch(`http://${message.targetHost}:${message.targetPort}`, {
			method: 'POST',
			body: JSON.stringify({
				...message,
				fileSizeInBytes: fileSizeInBytes,
				command: RedQuickDistributionCommand.ConfirmFile,
				agentName: this.agentName,
				filePath: filePathArray
			})
		}).then((res: any) => {
			return res.json().then((rt: any) => {
				return rt;
			});
		});
	}
	async sendFile(message: AgentProject, localFilePath: string) {
		let server: net.Server,
			istream = fs.createReadStream(localFilePath);
		let filePathArray = message.relativePath ? message.relativePath.split(path.sep) : [];
		let address: any = this.getIpaddress();
		message.hostname = address.hostname;
		return await new Promise((resolve, fail) => {
			server = net.createServer((socket) => {
				socket.pipe(process.stdout);
				istream.on('readable', function() {
					let data;
					while ((data = this.read())) {
						socket.write(data);
					}
				});
				istream.on('end', function() {
					socket.end();
				});
				socket.on('end', () => {
					server.close(() => {
						console.log('\nTransfer is done!');
					});
					resolve(true);
				});
				socket.on('close', () => {
					socket.destroy();
					resolve(true);
				});
				socket.on('error', (er) => {
					console.log(er);
					fail(false);
				});
			});
			server.listen(0, address.hostname, () => {
				console.log('trying to send a file');
				let address: any = server.address();
				let port = address && address.port ? address.port : null;
				if (port) {
					console.log(`using port: ${port}`);
					console.log(`http://${message.targetHost}:${message.targetPort}`);
					fetch(`http://${message.targetHost}:${message.targetPort}`, {
						method: 'POST',
						body: JSON.stringify({
							...message,
							port,
							command: RedQuickDistributionCommand.SendFile,
							agentName: this.agentName,
							filePath: filePathArray
						})
					}).catch((e: any) => {
						console.log(e);
						fail(e);
					});
				} else {
					throw new Error('no port found');
				}
			});
		});
	}
	static receiveQueue: Promise<boolean> = Promise.resolve(true);
	async checkFile(req: any, reply: any) {
		console.log(`checking file`);
		let res = await Promise.resolve().then(() => {
			let requestedPath = path.join(this.baseFolder, this.agentName || '', (req.filePath || []).join(path.sep));
			if (fs.existsSync(requestedPath)) {
				console.log(`file exists at location ${requestedPath}`);
				let stats = fs.statSync(requestedPath);
				var fileSizeInBytes = stats['size'];
				return {
					port: -1,
					success: fileSizeInBytes === req.fileSizeInBytes,
					error: fileSizeInBytes !== req.fileSizeInBytes,
					errorMessage: `file size doesnt match ${fileSizeInBytes} === ${req.fileSizeInBytes}`
				};
			} else {
				console.log(`file doesnt exists at location ${requestedPath}`);
				return {
					error: true,
					port: -1,
					file: requestedPath,
					errorMessage: 'file doesnt exist here'
				};
			}
		});

		Object.assign(reply, res);
	}
	async receiveFile(req: any) {
		this.receivingFile = true;
		let res = await new Promise(async (resolve, fail) => {
			let requestedPath = path.join(this.baseFolder, this.agentName || '', (req.filePath || []).join(path.sep));
			await ensureDirectory(path.resolve(path.dirname(requestedPath)));
			console.log(`writing to: ${requestedPath}`);
			let socket: net.Socket;
			socket = net.connect(req.port, req.hostname);
			let ostream = fs.createWriteStream(requestedPath);
			let size = 0,
				elapsed = 0;
			let startTime = Date.now();

			socket.on('error', (err) => {
				console.log(err);
				process.stdout.write(`\r${err.message}`);
				socket.destroy(err);
				fail(false);
				this.receivingFile = false;
			});
			socket.on('data', (chunk) => {
				size += chunk.length;
				elapsed = Date.now() - startTime;
				socket.write(
					`\r${(size / (1024 * 1024)).toFixed(2)} MB of data was sent. Total elapsed time is ${elapsed /
						1000} s : ${requestedPath}`
				);
				process.stdout.write(
					`\r${(size / (1024 * 1024)).toFixed(2)} MB of data was sent. Total elapsed time is ${elapsed /
						1000} s : ${requestedPath}`
				);
				ostream.write(chunk);
			});
			socket.on('end', () => {
				elapsed = Date.now() - startTime;
				console.log(
					`\nFinished getting file. speed was: ${(size / (1024 * 1024) / (elapsed / 1000)).toFixed(
						2
					)} MB/s to : ${requestedPath}`
				);
				socket.destroy();
				ostream.close();
				resolve(true);
				this.receivingFile = false;
			});
			ostream.on('error', (err) => {
				console.log('ostream error');
				console.log(err);
				fail(err);
				this.receivingFile = false;
			});
			ostream.on('ready', () => {});
		});
		if (res) {
			return true;
		}
		return false;
	}
	async getAvailbePort() {
		return await this.getFreePort();
	}
	async startServers() {
		let address: any = this.getIpaddress();
		await this.setupPorts();
		let port = this.serverPort;
		await new Promise((resolve, fail) => {
			const server = http.createServer((request, res) => {
				this.handleRequest(request, res);
			});
			server.on('clientError', (err, socket) => {
				socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
			});
			server.on('error', (err) => {
				fail(err);
			});
			server.listen(port, address.hostname, () => {
				let portAddr: any = server.address();
				let port = portAddr && portAddr.port ? portAddr.port : null;
				this.setPort(port);
				console.log(`Server running at http://${address.hostname}:${port}/`);
				resolve();
			});
		});
	}
	setPort(port: any) {
		this.ctPort = port;
	}
	getPort() {
		return this.ctPort;
	}
	getIpaddress() {
		var ifaces = os.networkInterfaces();
		let addressLib: { [key: string]: string | null } = { hostname: null };
		Object.keys(ifaces).forEach(function(ifname) {
			var alias = 0;
			ifaces[ifname].forEach(function(iface) {
				if ('IPv4' !== iface.family || iface.internal !== false) {
					// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
					return;
				}

				addressLib[ifname] = iface.address;
				addressLib.hostname = iface.address;
				++alias;
			});
		});
		return addressLib;
	}
	async setupPorts() {
		// let ports = await this.getPorts();
		this.ports = {};
		// ports.forEach((port) => {
		// 	this.ports[port] = false;
		// });
	}
	async getFreePort() {
		var portrange = 3000 + Math.floor(Math.random() * 50000);
		let newport: number = await new Promise((resolve) => {
			function getPort() {
				console.log('get port');
				var port = portrange;
				portrange += 1;
				var server = net.createServer();
				server.listen(port, () => {
					console.log('port: ' + port);
					server.once('close', function() {
						setTimeout(() => {
							resolve(port);
						}, 1000);
					});
					server.close();
				});
				server.on('error', function(err) {
					console.log(err);
					console.log(`port ${port} is busy`);
					getPort();
				});
			}
			getPort();
		});
		console.log(`free port is : ${newport}`);
		return newport;
	}
	async getPorts() {
		let result: number[] = [];
		var portrange = 45032;
		for (let i = 0; i < 500; i++) {
			let newport: number = await new Promise((resolve, fail) => {
				function getPort() {
					var port = portrange;
					portrange += 1;
					var server = net.createServer();
					server.listen(port, () => {
						server.once('close', function() {
							resolve(port);
						});
						server.close();
					});
					server.on('error', function(err) {
						getPort();
					});
				}
				getPort();
			});
			result.push(newport);
		}
		return result;
	}
}

// var RedQuickDistributionCommand;
// (function(RedQuickDistributionCommand) {
// 	RedQuickDistributionCommand['SendFile'] = 'SendFile';
// 	RedQuickDistributionCommand['RUN_JOB'] = 'RUN_JOB';
// 	RedQuickDistributionCommand['Progress'] = 'Progress';
// 	RedQuickDistributionCommand['RaisingHand'] = 'RaisingHand';
// 	RedQuickDistributionCommand['SetAgentProjects'] = 'SetAgentProjects';
// 	RedQuickDistributionCommand['RaisingAgentProjectReady'] = 'RaisingAgentProjectReady';
// 	RedQuickDistributionCommand['RaisingAgentProjectBusy'] = 'RaisingAgentProjectBusy';
// 	RedQuickDistributionCommand['CompletedJobItem'] = 'CompletedJobItem';
// })((RedQuickDistributionCommand = exports.RedQuickDistributionCommand || (exports.RedQuickDistributionCommand = {})));

export async function ensureDirectory(dir: string) {
	if (!fs.existsSync(dir)) {
		console.log(`doesnt exist : ${dir}`);
	} else {
	}
	const _dir_parts = dir.split(path.sep);
	_dir_parts.map((_, i) => {
		if (i > 1 || _dir_parts.length - 1 === i) {
			let tempDir = path_join(..._dir_parts.slice(0, i + 1));
			if (dir.startsWith(path.sep)) {
				tempDir = `${path.sep}${tempDir}`;
			}
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir);
			}
		}
	});
}
