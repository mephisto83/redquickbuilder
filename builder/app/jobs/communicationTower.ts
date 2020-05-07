import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import fetch from 'node-fetch';
import net from 'net';
import { AgentProject, AgentProjects } from './interfaces';
import { sleep, path_join } from './jobservice';
import { OnFailureLink } from '../components/titles';

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
	projectName?: any;
	agentProject?: any;
	agentName?: any;
	command?: RedQuickDistributionCommand;
	port?: number;
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
	RaisingHand = 'RaisingHand',
	SetAgentProjects = 'SetAgentProjects',
	Progress = 'Progress',
	RaisingAgentProjectReady = 'RaisingAgentProjectReady',
	RaisingAgentProjectBusy = 'RaisingAgentProjectBusy',
	CompletedJobItem = 'CompletedJobItem',
	SetCommandCenter = 'SetCommandCenter',
	UpdateCommandCenter = 'UpdateCommandCenter'
}
export type CommunicationTowerListen = { [key in RedQuickDistributionCommand]: Function } | null;
export default class CommunicationTower {
	topDirectory: string;
	ports: { [port: number]: boolean };
	sockets: net.Socket[];
	agentName: string;
	listeners: CommunicationTowerListen;
	baseFolder: string;
	serverPort: any;
	ctPort: any;
	constructor() {
		this.topDirectory = '';
		this.ports = {};
		this.sockets = [];
		this.listeners = null;
		this.agentName = '';

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
					if (res.error) {
						console.error(res);
						throw new Error(res.error);
					}
				});
			})
			.catch((err: any) => {
				console.log(err);
				throw err;
			});
	}
	static NetworkDrive: string = os.platform() =='linux'?'/run/user/1000/gvfs/smb-share:server=mephistowa,share=public/tmp/': '\\192.168.1.113\\Public\\tmp\\';

	getNetworkFilePath(requestedPath: string): fs.PathLike {
		return `\\${path_join(CommunicationTower.NetworkDrive, requestedPath)}`;
	}
	async writeToDrive(agentProject: AgentProject, outFolder: string, localFilePath: string) {
		return new Promise(async (resolve, fail) => {
			try {
				await ensureDirectory(`\\${path.dirname(path_join(CommunicationTower.NetworkDrive, outFolder))}`);
				console.log(
					`write to : \\${path_join(CommunicationTower.NetworkDrive, outFolder)} <= from ${localFilePath}`
				);
				fs.copyFileSync(localFilePath, `\\${path_join(CommunicationTower.NetworkDrive, outFolder)}`);
				resolve();
			} catch (e) {
				console.log(e);
				fail(e);
			}
		});
	}
	async transferFile(agentProject: AgentProject, outFolder: string, localPath: string) {
		let maxattempts = 10;
		do {
			let success;
			try {
				await this.writeToDrive(agentProject, outFolder, localPath);
				success = await this.sendFile(
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
				if (success) {
					maxattempts = 0;
				}
			} catch (e) {
				console.log(`failed to send file : ${maxattempts} attemps left`);
			}

			if (!success) {
				await sleep(30 * 1000 + Math.random() * 100000);
			}
		} while (maxattempts);
	}
	init(config: CommunicationTowerConfig) {
		this.topDirectory = config.topDirectory;
		this.baseFolder = config.baseFolder;
		this.agentName = config.agentName;
		this.serverPort = config.serverPort;
		this.sockets = [];
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
			}
		} while (error);
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
		console.debug('process request');
		let parsed = JSON.parse(strinResult);
		let reply: RedQuickDistributionMessage = {
			port: 0,
			error: false,
			noPort: false,
			hostname: ''
		};
		console.debug(parsed.command);
		switch (parsed.command) {
			case RedQuickDistributionCommand.SendFile:
				reply.port = await this.getAvailbePort();
				let address = this.getIpaddress();
				reply.hostname = address.hostname;
				await this.receiveFile(parsed);
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
		console.debug('finished request');

		return reply;
	}
	async onHandleReceivedMessage(message: RedQuickDistributionMessage) {
		let progressListeners = this.listeners && message.command ? this.listeners[message.command] : null;
		if (progressListeners) {
			console.debug(`handle received message`);
			return await progressListeners(message);
		}
		throw new Error('no handler for ' + message.command);
	}
	async sendFile(message: AgentProject, localFilePath: string) {
		// let server: net.Server,
		// 	istream = fs.createReadStream(localFilePath);
		let filePathArray = message.relativePath ? message.relativePath.split(path.sep) : [];
		let address: any = this.getIpaddress();
		message.hostname = address.hostname;
		return await new Promise((resolve, fail) => {
			// server = net.createServer((socket) => {
			// 	socket.pipe(process.stdout);
			// 	istream.on('readable', function() {
			// 		let data;
			// 		while ((data = this.read())) {
			// 			socket.write(data);
			// 		}
			// 	});
			// 	istream.on('end', function() {
			// 		socket.end();
			// 	});
			// 	socket.on('end', () => {
			// 		server.close(() => {
			// 			console.log('\nTransfer is done!');
			// 		});
			// 	});
			// 	socket.on('close', () => {
			// 		resolve(true);
			// 	});
			// 	socket.on('error', () => {
			// 		fail(false);
			// 	});
			// });
			// server.listen(0, address.hostname, () => {
			// 	console.log('trying to send a file');
			// 	let address: any = server.address();
			// 	let port = address && address.port ? address.port : null;
			// 	if (port) {
			// 		console.log(`using port: ${port}`);

			// 	} else {
			// 		throw new Error('no port found');
			// 	}
			// });
			fetch(`http://${message.targetHost}:${message.targetPort}`, {
				method: 'POST',
				body: JSON.stringify({
					...message,
					port: 0,
					command: RedQuickDistributionCommand.SendFile,
					agentName: this.agentName,
					filePath: filePathArray
				})
			})
				.then((e: any) => resolve())
				.catch((e: any) => fail(e));
		});
	}
	static receiveQueue: Promise<boolean> = Promise.resolve(true);
	async receiveFile(req: any) {
		CommunicationTower.receiveQueue = CommunicationTower.receiveQueue.then(async () => {
			let res = await new Promise(async (resolve, fail) => {
				let requestedPath = path.join(
					this.baseFolder,
					this.agentName || '',
					(req.filePath || []).join(path.sep)
				);
				try {
					await ensureDirectory(path.resolve(path.dirname(requestedPath)));
					this.copyFileFromNetwork(requestedPath);
					console.log(`writing to: ${requestedPath}`);
					resolve();
				} catch (e) {
					fail(e);
				}
				// let socket: net.Socket;
				// socket = net.connect(req.port, req.hostname);
				// let ostream = fs.createWriteStream(requestedPath);
				// let size = 0,
				// 	elapsed = 0;
				// // this.sockets.push(socket);
				// socket.on('error', (err) => {
				// 	process.stdout.write(`\r${err.message}`);
				// 	socket.destroy(err);
				// 	this.sockets = [ ...this.sockets.filter((s) => s !== socket) ];
				// 	fail(false);
				// });
				// socket.on('data', (chunk) => {
				// 	size += chunk.length;
				// 	socket.write(
				// 		`\r${(size / (1024 * 1024)).toFixed(2)} MB of data was sent. Total elapsed time is ${elapsed /
				// 			1000} s : ${requestedPath}`
				// 	);
				// 	process.stdout.write(
				// 		`\r${(size / (1024 * 1024)).toFixed(2)} MB of data was sent. Total elapsed time is ${elapsed /
				// 			1000} s : ${requestedPath}`
				// 	);
				// 	ostream.write(chunk);
				// });
				// socket.on('end', () => {
				// 	console.log(
				// 		`\nFinished getting file. speed was: ${(size / (1024 * 1024) / (elapsed / 1000)).toFixed(
				// 			2
				// 		)} MB/s to : ${requestedPath}`
				// 	);
				// 	socket.destroy();
				// 	resolve(true);
				// });
				// ostream.on('error', (err) => {
				// 	console.log('ostream error');
				// 	console.log(err);
				// 	fail(err);
				// });
				// ostream.on('ready', () => {});
			});
			if (res) {
				return true;
			}
			return false;
		});
		return CommunicationTower.receiveQueue;
	}
	copyFileFromNetwork(requestedPath: string) {
		fs.copyFileSync(requestedPath, this.getNetworkFilePath(requestedPath));
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
				if (alias >= 1) {
					// this single interface has multiple ipv4 addresses
					console.log(ifname + ':' + alias, iface.address);
				} else {
					// this interface has only one ipv4 adress
					console.log(ifname, iface.address);
				}
				addressLib[ifname] = iface.address;
				addressLib.hostname = iface.address;
				++alias;
			});
		});
		return addressLib;
	}
	async setupPorts() {
		let ports = await this.getPorts();
		this.ports = {};
		ports.forEach((port) => {
			this.ports[port] = false;
		});
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
			if (dir.startsWith(`${path.sep}${path.sep}`)) {
				tempDir = `${path.sep}${path.sep}${tempDir}`;
			} else if (dir.startsWith(path.sep)) {
				tempDir = `${path.sep}${tempDir}`;
			}
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir);
			}
		}
	});
}
