import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import fetch from 'node-fetch';
import net from 'net';
import { AgentProject } from './interfaces_';

export enum RedQuickDistributionCommand {
  RUN_JOB
}

export default class CommunicationTower {
	topDirectory: string;
	ports: { [port: number]: boolean };
	sockets: net.Socket[];
	agentName: string;

	baseFolder: string;
	serverPort: any;
	constructor() {
		this.topDirectory = '';
		this.ports = {};
		this.sockets = [];
		this.agentName = '';

		this.baseFolder = '';
	}
	async send(agentProject: AgentProject, arg1: string, command, options = {}) {
		let body = {
			...agentProject,
			...options,
			command,
			agentName: agentProject.agent,
			agentProject: agentProject.name,
			filePath: arg1.split(path_1.default.sep)
		};
		return node_fetch_1
			.default(`http://${agentProject.host}:${agentProject.port}`, {
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then((res) => {
				if (res.error) {
					console.error(res);
					throw new Error(res.error);
				}
				return res;
			})
			.catch((err) => {
				console.log(err);
				throw err;
			});
	}
	async transferFile(agentProject, outFolder, localPath) {
		let maxattempts = 10;
		do {
			maxattempts--;
			try {
				let success = await this.sendFile(
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
				if (!success) {
					await jobservice_1.sleep(10 * 1000);
				} else {
					maxattempts = 0;
				}
			} catch (e) {
				console.log(`failed to send file : ${maxattempts} attemps left`);
			}
		} while (maxattempts);
	}
	init(config) {
		this.topDirectory = config.topDirectory;
		this.baseFolder = config.baseFolder;
		this.agentName = config.agentName;
		this.serverPort = config.serverPort || 8000;
		this.sockets = [];
		this.ports = {};
	}
	start(listeners) {
		this.listeners = listeners;
		this.startServers();
	}
	handleRequest(request, response) {
		const { headers, method, url } = request;
		let body = [];
		let stringResult = '';
		if (method === 'POST') {
			request
				.on('error', (err) => {
					console.error(err);
				})
				.on('data', (chunk) => {
					body.push(chunk);
				})
				.on('end', async () => {
					stringResult = Buffer.concat(body).toString();
					let replyObject = await this.processRequest(stringResult);
					response.on('error', (err) => {
						console.error(err);
					});
					response.statusCode = 200;
					response.setHeader('Content-Type', 'application/json');
					// Note: the 2 lines above could be replaced with this next one:
					// response.writeHead(200, {'Content-Type': 'application/json'})
					const responseBody = { headers, method, url, body: replyObject };
					response.write(JSON.stringify(responseBody));
					response.end();
					// At this point, we have the headers, method, url and body, and can now
					// do whatever we need to in order to respond to this request.
				});
		} else {
			response.statusCode = 200;
			response.setHeader('Content-Type', 'application/json');
			const responseBody = { headers, method, url, body: 'noop' };
			response.write(JSON.stringify(responseBody));
			response.end();
		}
	}
	async processRequest(strinResult) {
		let parsed = JSON.parse(strinResult);
		let reply = {
			port: 0,
			error: false,
			noPort: false,
			hostname: ''
		};
		switch (parsed.command) {
			case RedQuickDistributionCommand.SendFile:
				reply.port = this.getAvailbePort();
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
		return reply;
	}
	async onHandleReceivedMessage(message) {
		let progressListeners = this.listeners ? this.listeners[message.command] : null;
		if (progressListeners) {
			return await progressListeners(message);
		}
		return null;
	}
	async sendFile(message, localFilePath) {
		let server,
			istream = fs_1.default.createReadStream(localFilePath);
		let filePathArray = message.relativePath.split(path_1.default.sep);
		let port = await this.getAvailbePort();
		let address = this.getIpaddress();
		message.port = port;
		message.hostname = address.hostname;
		this.ports[port] = true;
		return await new Promise((resolve, fail) => {
			server = net_1.default.createServer((socket) => {
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
						this.ports[port] = true;
						resolve(true);
					});
				});
				socket.on('error', () => {
					this.ports[port] = true;
					fail(false);
				});
			});
			server.listen(port, address.hostname, () => {
				console.log('trying to send a file');
				node_fetch_1.default(`http://${message.targetHost}:${message.targetPort}`, {
					method: 'POST',
					body: JSON.stringify({
						...message,
						command: RedQuickDistributionCommand.SendFile,
						agentName: this.agentName,
						filePath: filePathArray
					})
				});
			});
		});
	}
	async receiveFile(req) {
		return await new Promise(async (resolve, fail) => {
			// console.log(this.baseFolder);
			// console.log(this.agentName);
			let requestedPath = path_1.default.join(
				'.' + path_1.default.sep,
				this.baseFolder,
				this.agentName || '',
				(req.filePath || []).join(path_1.default.sep)
			);
			await ensureDirectory(path_1.default.resolve(path_1.default.dirname(requestedPath)));
			console.log(`writing to: ${requestedPath}`);
			let socket;
			socket = net_1.default.connect(req.port, req.hostname);
			let ostream = fs_1.default.createWriteStream(requestedPath);
			let size = 0,
				elapsed = 0;
			this.sockets.push(socket);
			socket.on('error', (err) => {
				process.stdout.write(`\r${err.message}`);
				socket.destroy(err);
				this.sockets = [ ...this.sockets.filter((s) => s !== socket) ];
			});
			socket.on('data', (chunk) => {
				size += chunk.length;
				socket.write(
					`\r${(size / (1024 * 1024)).toFixed(2)} MB of data was sent. Total elapsed time is ${elapsed /
						1000} s`
				);
				process.stdout.write(
					`\r${(size / (1024 * 1024)).toFixed(2)} MB of data was sent. Total elapsed time is ${elapsed /
						1000} s`
				);
				ostream.write(chunk);
			});
			socket.on('end', () => {
				console.log(
					`\nFinished getting file. speed was: ${(size / (1024 * 1024) / (elapsed / 1000)).toFixed(2)} MB/s`
				);
				socket.destroy();
			});
			ostream.on('error', (err) => {
				console.log('ostream error');
				console.log(err);
				fail(err);
			});
			ostream.on('ready', () => {
				resolve(true);
			});
		});
	}
	getAvailbePort() {
		let res = Object.keys(this.ports).filter((key) => !this.ports[key]);
		return parseInt(res[Math.floor(Math.random() * res.length)] || '0', 10);
	}
	async startServers() {
		let address = this.getIpaddress();
		await this.setupPorts();
		let port = this.serverPort;
		const server = http_1.default.createServer((request, res) => {
			this.handleRequest(request, res);
		});
		server.on('clientError', (err, socket) => {
			socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
		});
		server.listen(port, address.hostname, () => {
			console.log(`Server running at http://${address.hostname}:${port}/`);
		});
	}
	getIpaddress() {
		var ifaces = os_1.default.networkInterfaces();
		let addressLib = { hostname: null };
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
	async getPorts() {
		let result = [];
		var portrange = 45032;
		for (let i = 0; i < 500; i++) {
			let newport = await new Promise((resolve, fail) => {
				function getPort() {
					var port = portrange;
					portrange += 1;
					var server = net_1.default.createServer();
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
exports.default = CommunicationTower;
var RedQuickDistributionCommand;
(function(RedQuickDistributionCommand) {
	RedQuickDistributionCommand['SendFile'] = 'SendFile';
	RedQuickDistributionCommand['RUN_JOB'] = 'RUN_JOB';
	RedQuickDistributionCommand['Progress'] = 'Progress';
	RedQuickDistributionCommand['RaisingHand'] = 'RaisingHand';
	RedQuickDistributionCommand['SetAgentProjects'] = 'SetAgentProjects';
	RedQuickDistributionCommand['RaisingAgentProjectReady'] = 'RaisingAgentProjectReady';
	RedQuickDistributionCommand['RaisingAgentProjectBusy'] = 'RaisingAgentProjectBusy';
	RedQuickDistributionCommand['CompletedJobItem'] = 'CompletedJobItem';
})((RedQuickDistributionCommand = exports.RedQuickDistributionCommand || (exports.RedQuickDistributionCommand = {})));
async function ensureDirectory(dir) {
	if (!fs_1.default.existsSync(dir)) {
		console.log(`doesnt exist : ${dir}`);
	} else {
	}
	const _dir_parts = dir.split(path_1.default.sep);
	_dir_parts.map((_, i) => {
		if (i > 1 || _dir_parts.length - 1 === i) {
			let tempDir = path_1.default.join(..._dir_parts.slice(0, i + 1));
			if (dir.startsWith(path_1.default.sep)) {
				tempDir = `${path_1.default.sep}${tempDir}`;
			}
			if (!fs_1.default.existsSync(tempDir)) {
				fs_1.default.mkdirSync(tempDir);
			}
		}
	});
}

exports.ensureDirectory = ensureDirectory;
//# sourceMappingURL=communicationTower.js.map