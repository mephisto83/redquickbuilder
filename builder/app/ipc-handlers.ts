// In main process.
const { ipcMain } = require('electron');
import { HandlerEvents } from './ipc/handler-events';
import fs from 'fs';
import path from 'path';
import CommunicationTower, { RedQuickDistributionCommand } from './jobs/communicationTower';
import { JobServiceConstants, sleep } from './jobs/jobservice';
var child_process = require('child_process'),
	spawn = child_process.spawn;

const { Menu, MenuItem } = require('electron');

const letters = 'wpsonmgqeyl1k234x'.split('');
const MenuItems: any = {
	w: {
		label: 'Clear Pinned'
	},
	p: {
		label: 'Toggle Pinned'
	},
	y: {
		label: 'Publish'
	},
	s: {
		label: 'Save'
	},
	o: {
		label: 'Open'
	},
	n: {
		label: 'New'
	},
	m: {
		label: 'New Node'
	},
	l: {
		label: 'Layout Menu'
	},
	k: {
		label: 'Context Menu'
	},
	x: {
		label: 'Remove Current Node',
		shift: true
	},
	g: {
		label: 'Toggle Groups',
		shift: true
	},
	q: {
		label: 'Mark Node'
	},
	e: {
		label: 'Component Mode'
	},
	1: { label: 'Menu 1' },
	2: { label: 'Menu 2' },
	3: { label: 'Menu 3' },
	4: { label: 'Menu 4' }
};
export default class IPCHandlers {
	static setup(mainWindow: any) {
		let submenu: any = [];
		ipcMain.on('message', (event, arg) => {
			console.log(arg); // prints "ping"
			let msg = JSON.parse(arg);
			handle(msg)
				.then((res) => {
					event.sender.send(
						'message-reply',
						JSON.stringify({
							id: msg.id,
							body: res
						})
					);
				})
				.catch((v) => {
					console.log(v);
				});
		});
		ipcMain.on('load-configs', (event, args) => {
			console.log('load-configs');
			console.log(args);
			let res = loadApplicationConfig();
			event.sender.send(
				'load-configs-reply',
				JSON.stringify({
					body: res,
					folder: getAppConfigPath()
				})
			);
		});
		ipcMain.on('save-config', (event, arg) => {
			console.log('save-config');
			console.log(arg);
			let { folder, key } = JSON.parse(arg);
			storeApplicationConfig(folder, key).then((res) => {
				console.log('config update');
				event.sender.send('config-update', JSON.stringify({ body: res }));
			});
		});
		let submenu2 = new Menu();
		letters.map((x) => {
			let handler = throttle(
				() => {
					console.log('send command ' + x);
					mainWindow.webContents.send(
						'commands',
						JSON.stringify({
							args: x
						})
					);
				},
				undefined,
				this
			);
			submenu2.append(
				new MenuItem({
					label: MenuItems[x] ? MenuItems[x].label : 'Unknown',
					accelerator:
						MenuItems[x] && MenuItems[x].shift
							? 'CmdOrCtrl+Shift+' + x.toUpperCase()
							: 'CmdOrCtrl+' + x.toUpperCase(),
					click: () => {
						console.log('command execute');
						handler();
					}
				})
			);
		});
		console.log('setup communication tower');
		setupCommunicationTower(() => mainWindow);
		const menu2 = new Menu();
		menu2.append(
			new MenuItem({
				label: 'Red Quick 2',
				submenu: submenu2
			})
		);

		Menu.setApplicationMenu(menu2);
	}
	static tearDown() {}
}

export function ensureDirectorySync(dir: any) {
	if (!fs.existsSync(dir)) {
		console.log(`doesnt exist : ${dir}`);
	} else {
	}
	const _dir_parts = dir.split(path.sep);
	_dir_parts.map((_: any, i: number) => {
		if (i > 1 || _dir_parts.length - 1 === i) {
			let tempDir = path.join(..._dir_parts.subset(0, i + 1));
			if (dir.startsWith(path.sep)) {
				tempDir = `${path.sep}${tempDir}`;
			}
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir);
			}
		}
	});
}

export function getAppConfigPath($folder?: string) {
	const app = require('electron').app;
	const homedir = app.getPath('home');
	const folder = $folder ? path.join(homedir, '.rqb', $folder) : path.join(homedir, '.rqb');
	ensureDirectorySync(folder);
	return folder;
}
export function getAppConfigPathSync($folder?: string) {
	const app = require('electron').app;
	const homedir = app.getPath('home');
	const folder = $folder ? path.join(homedir, '.rqb', $folder) : path.join(homedir, '.rqb');
	return folder;
}
async function storeApplicationConfig(folder: string, key: string) {
	console.log('store application config');
	// let application = 'applicationConfig.json';
	// let applicationPathReq = path.join(getAppConfigPath('reqthread'), application);
	// let applicationPath = path.join(getAppConfigPath(), application);
	// if (!fs.existsSync(applicationPath)) {
	// 	fs.writeFileSync(applicationPath, JSON.stringify({}), 'utf8');
	// }
	// let file_contents = fs.readFileSync(applicationPath, 'utf8');
	// let applicationConfiguration: any = JSON.parse(file_contents);
	// if (applicationConfiguration) {
	// 	applicationConfiguration[key] = folder;
	// }

	// fs.writeFileSync(applicationPathReq, JSON.stringify(applicationConfiguration), 'utf8');
	// fs.writeFileSync(applicationPath, JSON.stringify(applicationConfiguration), 'utf8');

	// return applicationConfiguration;
	// setVisual(ApplicationConfig, applicationConfiguration)(dispatch, getState);
}

export function loadApplicationConfig() {
	console.log('load application config');
	let application = 'applicationConfig.json';
	let applicationPath = path.join(getAppConfigPath(), application);
	if (fs.existsSync(applicationPath)) {
		let applicationConfiguration: any = JSON.parse(fs.readFileSync(applicationPath, 'utf8'));

		fs.writeFileSync(applicationPath, JSON.stringify(applicationConfiguration), 'utf8');

		return applicationConfiguration;
  }
  return {};
	// setVisual(ApplicationConfig, applicationConfiguration)(dispatch, getState);
}

const throttle: any = (func: any, limit: any, context: any) => {
	let inThrottle: any;
	return function() {
		const args = arguments;
		if (!inThrottle) {
			func.apply(context, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
};
let communicationTower: CommunicationTower;
function setupCommunicationTower(mainWindowFunc: any) {
	communicationTower = new CommunicationTower();
	communicationTower.init({
		agentName: 'RedQuickBuilder',
		baseFolder: JobServiceConstants.JobPath(),
		serverPort: 8001,
		topDirectory: '../../jobrunner'
	});

	communicationTower.start({
		[RedQuickDistributionCommand.RaisingHand]: noOp,
		[RedQuickDistributionCommand.SetAgentProjects]: noOp,
		[RedQuickDistributionCommand.Progress]: noOp,
		[RedQuickDistributionCommand.RUN_JOB]: noOp,
		[RedQuickDistributionCommand.SendFile]: noOp,
		[RedQuickDistributionCommand.SetAgentProjects]: noOp,
		[RedQuickDistributionCommand.RaisingAgentProjectReady]: noOp,
		[RedQuickDistributionCommand.RaisingAgentProjectBusy]: noOp,
		[RedQuickDistributionCommand.CompletedJobItem]: noOp,
		[RedQuickDistributionCommand.CanReturnResults]: noOp,
		[RedQuickDistributionCommand.ConfirmFile]: noOp,
		[RedQuickDistributionCommand.RaisingAgentProjectError]: noOp,
		[RedQuickDistributionCommand.RaisingAgentProjectProgress]: noOp,
		[RedQuickDistributionCommand.SetCommandCenter]: noOp,
		[RedQuickDistributionCommand.UpdateCommandCenter]: (args: any) => {
			// console.log('update command center');
			updateCommandCenter(mainWindowFunc, args);
		}
	});
	console.log('set command center');
	setCommandCenter(7972, 8001);
}
function setCommandCenter(targetPort: number, port: number) {
	return Promise.resolve()
		.then(async () => {
			if (communicationTower) {
				try {
					await communicationTower.send(
						{
							host: communicationTower.getIpaddress().hostname || '',
							port: targetPort
						},
						'',
						RedQuickDistributionCommand.SetCommandCenter,
						{
							commandCenterPort: port,
							commandCenterHost: communicationTower.getIpaddress().hostname
						}
					);
				} catch (e) {
					console.log('didnt set command center');
				}
			}
		})
		.then(async () => {
			await sleep(300000);
		})
		.then(() => {
			setCommandCenter(targetPort, port);
		});
}
function updateCommandCenter(mainWindowFunc: any, args: any) {
	let mainWindow = mainWindowFunc();
	if (mainWindow && mainWindow.webContents) {
		mainWindow.webContents.send('update-jobs', {
			args: 'update-jobs',
			package: args
		});
	} else if (mainWindow) {
		console.log('no webContents');
	} else {
		console.log('no mainWindow');
	}
}
function noOp() {}
function handle(msg: any) {
	let message = msg.msg;
	let result = Promise.resolve();

	switch (message) {
		case HandlerEvents.scaffold.message:
			result = Promise.resolve().then(() => {
				return scaffoldProject(msg.body);
			});
			console.log('handle .net core scaffolding');
			break;
		case HandlerEvents.reactnative.message:
			result = Promise.resolve().then(() => {
				return scaffoldProject(msg.body, 'ReactNative');
			});
			console.log('handle react native scaffolding');
			break;
		case HandlerEvents.reactweb.message:
			result = Promise.resolve().then(() => {
				return scaffoldProject(msg.body, 'ReactWeb');
			});
			console.log('handle react web scaffolding');
			break;
		case HandlerEvents.electron.message:
			result = Promise.resolve().then(() => {
				return scaffoldProject(msg.body, 'ElectronIO');
			});
			console.log('handle electrion scaffolding');
			break;
		default:
			console.log('did nothing');
			break;
	}

	return result.catch((e) => {
		console.log(e);
		return {
			error: true,
			errormessage: e
		};
	});
}

function scaffoldProject(body: any, target?: any): any {
	let { workspace, solutionName } = body;
	return ensureDirectory(workspace)
		.then(() => {
			return copyFile(`./app/cake/build.cake`, path.join(workspace, 'build.cake'));
		})
		.then(() => {
			return copyFile(`./app/cake/build.ps1`, path.join(workspace, 'build.ps1'));
		})
		.then(() => {
			return copyFile(`./app/cake/build.js`, path.join(workspace, 'build.js'));
		})
		.then(() => {
			return copyFile(`./app/cake/package.json`, path.join(workspace, 'package.json'));
		})
		.then(() => {
			return writeJsonToFile(body, path.join(workspace, 'workspace.json'));
		})
		.then(() => {
			return executeSpawnCmd(
				'powershell',
				[ './build.ps1', '-Target', target || 'CreateWorkSpace', '-verbosity=verbose' ],
				{ cwd: workspace }
			);
		})
		.then(() => {
			console.log('Scaffoled the project successfully: ' + target);
			return true;
		})
		.catch((e) => {
			console.log('Failed to scaffold');
			return false;
		});
}

function copyFile(source: any, destination: any) {
	return new Promise((resolve, fail) => {
		// destination.txt will be created or overwritten by default.
		console.log(`copying ${source} to ${destination}`);
		fs.copyFile(source, destination, (err) => {
			if (err) {
				console.log(err);
				fail(err);
			} else {
				resolve();
			}
			console.log('source.txt was copied to destination.txt');
		});
	});
}
function writeJsonToFile(json: any, destination: any) {
	var text = JSON.stringify(json);
	return Promise.resolve().then(() => {
		fs.writeFileSync(destination, text, 'utf8');
	});
}
function ensureDirectory(dir: any) {
	return new Promise(function(resolve, fail) {
		if (!fs.existsSync(dir)) {
			console.log('doesnt exist : ' + dir);
		} else {
			resolve();
		}

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			resolve();
		} else {
			fail();
		}
	});
}

function executeSpawnCmd(cmd: any, args: any, options: any) {
	console.log('execute spawn cmd');
	return new Promise(function(resolve, fail) {
		console.log(cmd);
		console.log(args);
		options = { ...options || {}, shell: false };
		var child: any;
		if (process.platform === 'win32') {
			child = spawn(cmd, args, options);
		} else {
			child = spawn('sudo', [ cmd, ...args ], options);
		}
		options._kill = function() {
			child.kill();
		};
		child.stdout.on('data', function(data: any) {
			// console.log('stdout: ' + data);
		});

		child.stderr.on('data', function(data: any) {
			console.log('stderr: ' + data);
		});
		child.on('error', function(err: any) {
			console.log(err);
			child.stdin.pause();
			child.kill();
			fail();
		});
		child.on('exit', function(code: any) {
			console.log('child process exited with code ' + code);
			child.stdin.pause();
			child.kill();
			if (code != 0) {
				console.log('Failed: ' + code);
				fail(code);
				return;
			}
			resolve();
		});
	});
}
