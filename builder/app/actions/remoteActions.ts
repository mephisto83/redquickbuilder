/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import {
	createGraph,
	updateWorkSpace,
	updateGraphTitle,
	updateGraphProperty,
	setupCache
} from '../methods/graph_methods';
import {
	SaveApplication,
	SaveGraph,
	CURRENT_GRAPH,
	GetRootGraph,
	Visual,
	toggleVisual,
	CONTEXT_MENU_VISIBLE,
	setVisual,
	CONTEXT_MENU_MODE,
	GetDispatchFunc,
	GetStateFunc,
	GetCurrentGraph,
	ApplicationConfig,
	clearPinned
} from './uiactions';
import { processRecording } from '../utils/utilservice';
import prune from '../methods/prune';
import unprune from '../methods/unprune';
const BUILDER_BACK_UP = '.builder';
const path = require('path');
import fs from 'fs';
import JobService, { ensureDirectory, JobServiceConstants } from '../jobs/jobservice';
import StoreGraph, { LoadGraph } from '../methods/storeGraph';
import { Graph } from '../methods/graph_types';
import { NodeProperties } from '../constants/nodetypes';
const { ipcRenderer } = require('electron');
const remote = require('electron').remote;

export function openGraph() {
	openRedQuickBuilderGraph()(_dispatch, _getState);
}

export function toggleContextMenu(mode: string) {
	if (mode) {
		setVisual(CONTEXT_MENU_MODE, mode)(_dispatch, _getState);
		setVisual(CONTEXT_MENU_VISIBLE, true)(_dispatch, _getState);
	} else {
		toggleVisual(CONTEXT_MENU_VISIBLE)(_dispatch, _getState);
	}
}
export function toggleVisualKey(key: string) {
	toggleVisual(key)(_dispatch, _getState);
}
const SELECTED_TAB = 'SELECTED_TAB';
const DEFAULT_TAB = 'DEFAULT_TAB';
const PARAMETER_TAB = 'PARAMETER_TAB';
const SCOPE_TAB = 'SCOPE_TAB';
const QUICK_MENU = 'QUICK_MENU';
export function setRightMenuTab(num: any) {
	switch (num) {
		case '1':
			setVisual(SELECTED_TAB, DEFAULT_TAB)(_dispatch, _getState);
			break;
		case '2':
			setVisual(SELECTED_TAB, PARAMETER_TAB)(_dispatch, _getState);
			break;
		case '3':
			setVisual(SELECTED_TAB, SCOPE_TAB)(_dispatch, _getState);
			break;
		case '4':
			setVisual(SELECTED_TAB, QUICK_MENU)(_dispatch, _getState);
			break;
	}
}
export function openRedQuickBuilderGraph(unpruneGraph?: boolean, unpinned?: boolean) {
	return (dispatch: Function, getState: any) => {
		const remote = require('electron').remote;
		const dialog = remote.dialog;
		dialog
			.showOpenDialog(remote.getCurrentWindow(), {
				filters: [ { name: 'Red Quick Builder', extensions: [ RED_QUICK_FILE_EXT$ ] } ],
				properties: [ 'openFile' ]
			})
			.then(async (opts) => {
				let filePaths = opts.filePaths;
				console.log(opts.filePaths);
				let fileName: any = filePaths.find((x) => x);
				if (fileName === undefined) {
					console.log("You didn't save the file");
					return;
				}

				if (fileName.length && Array.isArray(fileName)) {
					fileName = fileName[0];
				}

				if (!fileName.endsWith(RED_QUICK_FILE_EXT)) {
					fileName = `${fileName}${RED_QUICK_FILE_EXT}`;
				}
				console.log(fileName);

				let opened_graph: Graph = await LoadGraph(fileName);
				if (opened_graph) {
					debugger;
					let pinnedCount = 0;
					Object.keys(opened_graph.nodeLib).forEach((key) => {
						let node = opened_graph.nodeLib[key];
						if (node.properties[NodeProperties.Pinned]) pinnedCount++;
						node.properties[NodeProperties.Pinned] = false;
					});
					console.log(`Pinned count ${pinnedCount}`);
					opened_graph = unprune(opened_graph);
					const default_graph = createGraph();
					opened_graph = { ...default_graph, ...opened_graph };
					SaveApplication(opened_graph.id, CURRENT_GRAPH, dispatch);
					SaveGraph(opened_graph, dispatch, true);
					setupCache(opened_graph);
					if (unpinned) {
						clearPinned();
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};
}
export function openRedQuickBuilderTheme() {
	return (dispatch: Function) => {
		const remote = require('electron').remote;
		const dialog = remote.dialog;
		dialog
			.showOpenDialog(remote.getCurrentWindow(), {
				filters: [ { name: 'Red Quick Builder', extensions: [ RED_QUICK_FILE_THEME_EXT$ ] } ],
				properties: [ 'openFile' ]
			})
			.then((opts) => {
				let fileName: any = opts.filePaths.find((x) => x);
				if (fileName === undefined) {
					console.log("You didn't save the file");
					return;
				}

				if (fileName.length && Array.isArray(fileName)) {
					fileName = fileName[0];
				}

				if (!fileName.endsWith(RED_QUICK_FILE_THEME_EXT)) {
					fileName = `${fileName}${RED_QUICK_FILE_THEME_EXT}`;
				}
				console.log(fileName);
				fs.readFile(fileName, { encoding: 'utf8' }, (err: { message: any }, res: string) => {
					if (err) {
						console.error(`An error ocurred updating the file${err.message}`);
						console.log(err);
						return;
					}
					try {
						let openedTheme = JSON.parse(res);
						if (openedTheme) {
							let defaultGraph = GetCurrentGraph();
							defaultGraph = { ...defaultGraph, ...openedTheme };
							SaveApplication(defaultGraph.id, CURRENT_GRAPH, dispatch);
							SaveGraph(defaultGraph, dispatch);
						}
					} catch (e) {
						console.log(e);
					}
					console.warn('The file has been succesfully saved');
				});
			});
	};
}
export function newRedQuickBuilderGraph() {
	return (dispatch: Function, getState: any) => {
		const default_graph = createGraph();
		const opened_graph = { ...default_graph };
		SaveApplication(opened_graph.id, CURRENT_GRAPH, dispatch);
		SaveGraph(opened_graph, dispatch);
	};
}
export function newGraph() {
	newRedQuickBuilderGraph()(GetDispatchFunc(), GetStateFunc());
}
ipcRenderer.on('save-graph-to-file-reply', (event, arg) => {
	console.log(arg); // prints "pong"
});
export const RED_QUICK_FILE_EXT = '.rqb';
export const RED_QUICK_FILE_EXT$ = 'rqb';
export const RED_QUICK_FILE_RECORDING_EXT = '.js';
export const RED_QUICK_FILE_RECORDING_EXT$ = 'js';
export const RED_QUICK_FILE_THEME_EXT = '.rqbt';
export const RED_QUICK_FILE_THEME_EXT$ = 'rqbt';
export function saveGraphToFile(pruneGraph?: boolean) {
	return (dispatch: any, getState: () => any) => {
		const currentGraph = GetRootGraph(getState());
		// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
		if (currentGraph) {
			const remote = require('electron').remote;
			const dialog = remote.dialog;
			dialog
				.showSaveDialog(remote.getCurrentWindow(), {
					filters: [ { name: 'Red Quick Builder', extensions: [ RED_QUICK_FILE_EXT$ ] } ]
				})
				.then(async (opts) => {
					let fileName = opts.filePath;
					if (fileName === undefined) {
						console.log("You didn't save the file");
						return;
					}

					if (!fileName.endsWith(RED_QUICK_FILE_EXT)) {
						fileName = `${fileName}${RED_QUICK_FILE_EXT}`;
					}
					console.log(fileName);

					updateGraphProperty(currentGraph, {
						prop: 'graphFile',
						value: fileName
					});

					await StoreGraph(prune(currentGraph), fileName);
				});
		}
	};
}

export function setJobFolder(key: string) {
	return (dispatch: Function, getState: () => any) => {
		let currentGraph = GetRootGraph(getState());
		// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
		if (currentGraph) {
			const remote = require('electron').remote;
			const dialog = remote.dialog;

			dialog
				.showOpenDialog(remote.getCurrentWindow(), {
					properties: [ 'openDirectory' ]
				})
				.then((opts) => {
					let fileName = opts.filePaths.find((x) => x);
					if (fileName === undefined) {
						console.log("You didn't save the file");
						return;
					}

					console.log(fileName);
					return storeApplicationConfig(fileName, key, dispatch, getState);
				});
		}
	};
}

async function storeApplicationConfig(folder: string, key: string, dispatch: any, getState: any) {
	if (!fs.existsSync(folder)) {
		await ensureDirectory(folder);
	}
	let application = 'applicationConfig.json';
	let applicationPathReq = path.join('./reqthread', application);
	let applicationPath = path.join('./', application);
	if (!fs.existsSync(applicationPath)) {
		fs.writeFileSync(applicationPath, JSON.stringify({}), 'utf8');
	}

	let applicationConfiguration: any = JSON.parse(fs.readFileSync(applicationPath, 'utf8'));
	if (applicationConfiguration) {
		applicationConfiguration[key] = folder;
	}

	fs.writeFileSync(applicationPathReq, JSON.stringify(applicationConfiguration), 'utf8');
	fs.writeFileSync(applicationPath, JSON.stringify(applicationConfiguration), 'utf8');

	setVisual(ApplicationConfig, applicationConfiguration)(dispatch, getState);
}

export function loadApplicationConfig() {
	return (dispatch: any, getState: any) => {
		let application = 'applicationConfig.json';
		let applicationPath = path.join('./', application);
		let applicationConfiguration: any = JSON.parse(fs.readFileSync(applicationPath, 'utf8'));

		fs.writeFileSync(applicationPath, JSON.stringify(applicationConfiguration), 'utf8');

		setVisual(ApplicationConfig, applicationConfiguration)(dispatch, getState);
	};
}

export function saveRecording(recording: any) {
	return (dispatch: any, getState: any) => {
		const remote = require('electron').remote;
		const dialog = remote.dialog;
		dialog
			.showSaveDialog(remote.getCurrentWindow(), {
				filters: [
					{
						name: 'Red Quick Builder Recording',
						extensions: [ RED_QUICK_FILE_RECORDING_EXT$ ]
					}
				]
			})
			.then((opts) => {
				let fileName = opts.filePath;
				if (fileName === undefined) {
					console.log("You didn't save the file");
					return;
				}

				if (!fileName.endsWith(RED_QUICK_FILE_RECORDING_EXT)) {
					fileName = `${fileName}${RED_QUICK_FILE_RECORDING_EXT}`;
				}
				console.log(fileName);
				let content = JSON.stringify(recording, null, 4);
				content = processRecording(content);
				fs.writeFile(fileName, content, (err: { message: any }) => {
					if (err) {
						console.error(`An error ocurred updating the file${err.message}`);
						console.log(err);
						return;
					}

					console.warn('The file has been succesfully saved');
				});
			});
	};
}

export function saveTheme(theme: any) {
	return (dispatch: any, getState: any) => {
		const remote = require('electron').remote;
		const dialog = remote.dialog;
		dialog
			.showSaveDialog(remote.getCurrentWindow(), {
				filters: [
					{
						name: 'Red Quick Builder Theme',
						extensions: [ RED_QUICK_FILE_THEME_EXT$ ]
					}
				]
			})
			.then((opts) => {
				let fileName = opts.filePath;
				if (fileName === undefined) {
					console.log("You didn't save the file");
					return;
				}

				if (!fileName.endsWith(RED_QUICK_FILE_THEME_EXT)) {
					fileName = `${fileName}${RED_QUICK_FILE_THEME_EXT}`;
				}
				console.log(fileName);
				const content = JSON.stringify(theme, null, 4);
				fs.writeFile(fileName, content, (err: { message: any }) => {
					if (err) {
						console.error(`An error ocurred updating the file${err.message}`);
						console.log(err);
						return;
					}

					console.warn('The file has been succesfully saved');
				});
			});
	};
}
let lastSavedDate: null = null;
export function saveGraph(graph: any) {
	return async (dispatch: any, getState: () => any) => {
		const currentGraph = GetRootGraph(getState());
		if (currentGraph && currentGraph.graphFile) {
			if (fs.existsSync(currentGraph.graphFile)) {
				if (lastSavedDate !== currentGraph.updated) {
					if (fs.existsSync(currentGraph.graphFile)) {
						const fileFolder = path.dirname(currentGraph.graphFile);
						const backupFolder = path.join(fileFolder, BUILDER_BACK_UP);
						if (!fs.existsSync(backupFolder)) {
							fs.mkdirSync(backupFolder);
						}
						const files = fs.readdirSync(backupFolder);
						const fileName = path.basename(currentGraph.graphFile);
						let fileNumber = 0;
						files.forEach(function(file: string) {
							const split = file.split(`${fileName}.`);
							let num: any = split[split.length - 1];
							if (!isNaN(num)) {
								num = parseInt(num, 10);
								if (num >= fileNumber) {
									fileNumber = num + 1;
								}
							}
						});
						fs.copyFileSync(currentGraph.graphFile, path.join(backupFolder, `${fileName}.${fileNumber}`));
					}
				}
				await StoreGraph(prune(currentGraph), currentGraph.graphFile);
				// fs.writeFileSync(currentGraph.graphFile, JSON.stringify(currentGraph));
			}
			lastSavedDate = currentGraph.updated;
		}
	};
}
let _dispatch: any = null;
let _getState: any = null;
export function setRemoteState() {
	return (dispatch: any, getState: any) => {
		_dispatch = dispatch;
		_getState = getState;
	};
}
export function saveCurrentGraph() {
	const state = _getState();
	saveGraph(GetRootGraph(state))(_dispatch, _getState);
}

export function setWorkingDirectory() {
	return (dispatch: Function, getState: () => any) => {
		let currentGraph = GetRootGraph(getState());
		// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
		if (currentGraph) {
			const remote = require('electron').remote;
			const dialog = remote.dialog;
			dialog
				.showOpenDialog(remote.getCurrentWindow(), {
					properties: [ 'openDirectory' ]
				})
				.then((opts) => {
					let fileName = opts.filePaths.find((x) => x);
					if (fileName === undefined) {
						console.log("You didn't save the file");
						return;
					}

					console.log(fileName);
					currentGraph = updateWorkSpace(currentGraph, {
						workspace: fileName
					});
					SaveGraph(currentGraph, dispatch);
				});
		}
	};
}
