/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
import {
	createGraph,
	updateWorkSpace,
	updateGraphTitle,
	updateGraphProperty,
	setupCache,
	getNodeLinks,
	SOURCE,
	NodesByType,
	GetLinkBetween
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
	clearPinned,
	VISUAL_GRAPH,
	UIC,
	setPinned,
	GetLinkProperty,
	GetLink,
	GetCssName,
	GetState,
	pinConnectedNodesByLinkType,
	GetNodeById
} from './uiactions';
import { processRecording } from '../utils/utilservice';
import prune from '../methods/prune';
import unprune from '../methods/unprune';
const BUILDER_BACK_UP = '.builder';
const path = require('path');
import fs from 'fs';
import JobService, { ensureDirectory, JobServiceConstants, ensureDirectorySync } from '../jobs/jobservice';
import StoreGraph, { LoadGraph } from '../methods/storeGraph';
import { Graph, GraphLink, Node, QuickAccess } from '../methods/graph_types';
import { NodeProperties, LinkType, LinkPropertyKeys } from '../constants/nodetypes';
import { Link } from 'react-router-dom';
import { IfFalse } from '../components/titles';
import { platform } from 'os';
import { NodeTypeColors } from '../constants/nodetypes';
import { HandlerEvents } from '../ipc/handler-events';
import { SELECTED_LINK } from '../../visi_blend/dist/app/actions/uiactions';
// import { loadConfigs } from './ipcActions';
// import { loadConfigs } from './ipcActions';
const ipcRenderer = require('electron').ipcRenderer;
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
				filters: [{ name: 'Red Quick Builder', extensions: [RED_QUICK_FILE_EXT$] }],
				properties: ['openFile']
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
					dispatch(UIC(VISUAL_GRAPH, opened_graph.id, createGraph()));
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
				filters: [{ name: 'Red Quick Builder', extensions: [RED_QUICK_FILE_THEME_EXT$] }],
				properties: ['openFile']
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
					filters: [{ name: 'Red Quick Builder', extensions: [RED_QUICK_FILE_EXT$] }]
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

export function dashboardShot(folder) {
	return (dispatch: Function, getState: Function) => {
		takeDashboardShot(folder);
	};
}
let browserWindow: Electron.BrowserView;
export async function takeDashboardShot(folder: any, name?: string, getNodes?: any, ops?: any) {
	const remote = require('electron').remote;
	let win = browserWindow || remote.BrowserWindow.getFocusedWindow();
	if (win) {
		// browserWindow = win;
		let svg = document.querySelector('.content-wrapper svg');
		if (svg) {
			let bbox = svg.getBoundingClientRect();
			if (ops) {
				ops.MapControls.stopMap();
			}
			await win.webContents
				.capturePage({
					x: bbox.x || 0,
					y: bbox.y || 0,
					width: bbox.width || 800,
					height: bbox.height || 600
				})
				.then(async (img: any) => {
					console.log('image captured');
					await ensureDirectory(path.join(folder));
					fs.writeFileSync(path.join(folder, name || 'image.jpeg'), img.toPNG(), 'base64');
				});
			let nodese = getNodes ? getNodes() : null;
			await wait(5000);
			if (nodese) {
				let projectJson: any = {};
				let temppath = path.join(folder, 'project.json');
				if (fs.existsSync(temppath)) {
					projectJson = JSON.parse(fs.readFileSync(temppath, 'utf8'));
				}
				if (name) {
					projectJson[name] = nodese.map((v: any) => ({
						bounds: v.bounds,
						properties: v.properties,
						color: NodeTypeColors[v.properties.nodeType],
						id: v.id
					}));
					fs.writeFileSync(temppath, JSON.stringify(projectJson), 'utf8');
				}
			}
			if (ops) {
				ops.MapControls.startMap();
			}
		}
	}
}
export function getMindMapBounds() {
	let svgs = document.querySelectorAll('.content-wrapper svg div[data-id]');
	let bounds = { xmax: -10000000000000, xmin: 10000000000000, ymax: -10000000000000, ymin: 10000000000000 };
	for (var i = 0; i < svgs.length; i++) {
		let bbox = svgs[i].getBoundingClientRect();
		bounds.xmin = Math.min(bounds.xmin, bbox.left);
		bounds.xmax = Math.max(bounds.xmax, bbox.right);
		bounds.ymin = Math.min(bounds.ymin, bbox.top);
		bounds.ymax = Math.max(bounds.ymax, bbox.bottom);
	}

	return bounds;
}
export async function runSequence(
	nodeType: string | string[],
	getNodes: Function,
	ops: {
		exclusiveLinkTypes: string[];
		centerMindMap?: Function;
		level1?: string;
		reset: Function;
		level2?: string[];
		prefix: string;
		MapControls?: any;
	}
) {
	let nodes: Node[] = NodesByType(GetCurrentGraph(), nodeType);

	await nodes.forEachAsync(async (node: Node) => {
		await startSequence(node.id, getNodes, ops);
	});
}
export async function startSequence(
	modelId: string,
	getNodes: Function,
	ops: {
		exclusiveLinkTypes: string[];
		level1?: string;
		level2?: string[];
		reset: Function;
		centerMindMap?: Function;
		prefix: string;
	}
) {
	const root = GetCurrentGraph();
	const workspace = root.workspaces ? root.workspaces[platform()] || root.workspace : root.workspace;
	let doesntfit = true;
	const maxi = 3;
	let maxattempts = maxi;
	do {
		setVisual('LINK_DISTANCE', 125)(GetDispatchFunc(), GetStateFunc());
		clearPinned();
		setPinned(modelId, true);
		await populate(modelId, ops);
		let bounds = getMindMapBounds();
		doesntfit = !doesItFit(bounds, ops.centerMindMap || (() => { }));
		console.log(bounds);
		maxattempts--;
	} while (doesntfit && maxattempts);
	await takeDashboardShot(
		path.join(workspace, root.title, 'mindmaps'),
		`${ops.prefix}-${GetCssName(modelId)}.jpeg`,
		getNodes,
		ops
	);
	ops.reset();
}
export function doesItFit(bounds: { xmax: number; xmin: number; ymin: number; ymax: number }, centerMindMap: Function) {
	let svg = document.querySelector('.content-wrapper svg');
	if (svg) {
		let bbox = svg.getBoundingClientRect();
		if (bbox.height >= bounds.ymax - bounds.ymin) {
			if (bbox.width >= bounds.xmax - bounds.xmin) {
				if (
					bbox.top <= bounds.ymin &&
					bbox.bottom >= bounds.ymax &&
					bbox.left <= bounds.xmin &&
					bbox.right >= bounds.xmax
				) {
					return true;
				} else {
					let centerY = (bounds.ymax - bounds.ymin) / 2;
					let centerX = (bounds.xmax - bounds.xmin) / 2;
					if (false && centerMindMap) {
						centerMindMap({ x: -centerX, y: -centerY });
						return true;
					}
				}
			}
		}
	}
	return false;
}
export async function populate(
	modelId: string,
	ops: { exclusiveLinkTypes: string[]; level1?: string; level2?: string[] }
) {
	let links: GraphLink[] = getNodeLinks(GetCurrentGraph(), modelId);
	let typesToSkip: string[] = ops && ops.exclusiveLinkTypes.length ? [] : [LinkType.PropertyLink];
	let doesntfit = false;
	let sorted = links
		.unique((link: GraphLink) => GetLinkProperty(link, LinkPropertyKeys.TYPE))
		.filter((link: GraphLink) => typesToSkip.indexOf(GetLinkProperty(link, LinkPropertyKeys.TYPE)) === -1)
		.filter(
			(link: GraphLink) =>
				ops && ops.exclusiveLinkTypes.length
					? ops.exclusiveLinkTypes.indexOf(GetLinkProperty(link, LinkPropertyKeys.TYPE)) !== -1
					: true
		)
		.sort((a: GraphLink, b: GraphLink) => {
			if (GetLinkProperty(a, LinkPropertyKeys.TYPE) === LinkType.GeneralLink) {
				return 1;
			}
			if (GetLinkProperty(b, LinkPropertyKeys.TYPE) === LinkType.GeneralLink) {
				return -1;
			}
			return 0;
		});
	await sorted.forEachAsync(async (link: GraphLink) => {
		let maxtimes = 5;
		do {
			let pinned: string[] = [];
			let added = pinConnectedNodesByLinkType(modelId, GetLinkProperty(link, LinkPropertyKeys.TYPE))(
				GetDispatchFunc(),
				GetStateFunc()
			);
			pinned.push(...added);
			await wait(4500);
			added = await nextLevel(
				link,
				added,
				pinned,
				ops.level1 || LinkType.ModelTypeLink,
				ops.level2 || LinkType.PropertyLink
			);
			let bounds = getMindMapBounds();
			doesntfit = !doesItFit(bounds, () => { });
			maxtimes--;
			if (doesntfit) {
				setPinned(pinned, false);
			}
		} while (doesntfit && maxtimes);
	});

	async function nextLevel(
		link: GraphLink,
		added: string[],
		pinned: string[],
		level1: string,
		level2: string | string[]
	) {
		if (GetLinkProperty(link, LinkPropertyKeys.TYPE) === level1) {
			await getNodeLinks(GetCurrentGraph(), modelId)
				.filter((v) => GetLinkProperty(v, LinkPropertyKeys.TYPE) === level1)
				.forEachAsync(async (c: GraphLink) => {
					if ((c.target === modelId || ops.level1) && ops && (!ops.exclusiveLinkTypes.length || ops.level1)) {
						added = pinConnectedNodesByLinkType(c.target === modelId ? c.source : c.target, level2)(
							GetDispatchFunc(),
							GetStateFunc()
						);
						pinned.push(...added);
						if (added.length) await wait(4500);
					}
				});
		}
		return added;
	}
}

export async function wait(time: number) {
	return Promise.resolve().then(() => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, time);
		});
	});
}

export function setJobFolder(key: string) {
	return (dispatch: Function, getState: () => any) => {
		// let currentGraph = GetRootGraph(getState());
		// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
		// if (currentGraph) {
		const remote = require('electron').remote;
		const dialog = remote.dialog;

		dialog
			.showOpenDialog(remote.getCurrentWindow(), {
				properties: ['openDirectory']
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
		// }
	};
}

let contextConfig: any = { $path: '', $applicationConfig: {} };
export function setAppConfigPath($path: string, $applicationConfig: any) {
	contextConfig.$path = $path;
	contextConfig.$applicationConfig = $applicationConfig;
	let dispatch = GetDispatchFunc();
	let getState = GetStateFunc();
	if (dispatch && getState) setVisual(ApplicationConfig, $applicationConfig)(dispatch, getState);
}
export function getApplicationConfig() {
	return contextConfig.$applicationConfig;
}
export function getAppConfigPath($folder?: string) {
	// const app = require('electron').app;
	// const homedir = app.getPath('home');
	// const folder = $folder ? path.join(homedir, '.rqb', $folder) : path.join(homedir, '.rqb');
	// ensureDirectorySync(folder);
	return contextConfig.$path;
}
export function getAppConfigPathSync($folder?: string) {
	// const app = require('electron').app;
	// const homedir = app.getPath('home');
	// const folder = $folder ? path.join(homedir, '.rqb', $folder) : path.join(homedir, '.rqb');
	// return folder;
	return contextConfig.$path;
}
async function storeApplicationConfig(folder: string, key: string, dispatch: any, getState: any) {
	const { ipcRenderer } = require('electron');
	ipcRenderer.send('save-config', JSON.stringify({ folder, key }));
	// setVisual(ApplicationConfig, applicationConfiguration)(dispatch, getState);
}
export function showViewer() {
	viewObject([], []);
}
export function remoteSelectNode(id: string) {
	const { ipcRenderer } = require('electron');
	ipcRenderer.send(
		'message',
		JSON.stringify({
			msg: HandlerEvents.remoteCommand.message,
			body: { id, command: 'select' }
		})
	);
	return () => { };
}
export function sendNode(id: string) {
	return (dispatch: Function, getState: Function) => {
		let node = GetNodeById(id);
		let othernodes: Node[] = [];
		let graph: Graph = GetCurrentGraph();
		let links = !graph.nodeLinkIds[id]
			? []
			: Object.entries(graph.nodeLinkIds[id]).map((v) => {
				let [key, value] = v;
				othernodes.push(GetNodeById(key));
				return graph.linkLib[value];
			});
		let state = getState();
		let selectedLink = Visual(state, SELECTED_LINK);

		let currentLink = selectedLink
			? GetLinkBetween(selectedLink.source, selectedLink.target, GetCurrentGraph())
			: null;

		viewObject([node, ...othernodes], links, {
			currentNode: id,
			currentLink: currentLink,
			nodeLinkIds: {
				[id]: graph.nodeLinkIds[id]
			},
			nodeConnections: {
				[id]: graph.nodeConnections[id]
			}
		});
	};
}
async function viewObject(
	nodes: Node[],
	links: GraphLink[],
	options?: {
		currentNode: string;
		currentLink: string;
		clear?: boolean;
		nodeLinkIds: QuickAccess<string>;
		nodeConnections?: QuickAccess<string>;
	}
) {
	const { ipcRenderer } = require('electron');
	ipcRenderer.send(
		'message',
		JSON.stringify({
			msg: HandlerEvents.viewWindow.message,
			body: { nodes, links, options }
		})
	);
}

export function viewCode(code: string) {
	const { ipcRenderer } = require('electron');
	ipcRenderer.send(
		'message',
		JSON.stringify({
			msg: HandlerEvents.codeWindowCommand.message,
			body: { code }
		})
	);
}

export function viewFlowCode(code: any) {
	const { ipcRenderer } = require('electron');
	ipcRenderer.send(
		'message',
		JSON.stringify({
			msg: HandlerEvents.flowCodeWindowCommand.message,
			body: { code }
		})
	)
}

export function updateConfig(applicationConfiguration: any) {
	if (GetDispatchFunc()) setVisual(ApplicationConfig, applicationConfiguration)(GetDispatchFunc(), GetStateFunc());
}

export function loadApplicationConfigUI() {
	return (dispatch: any, getState: any) => {
		//  loadConfigs();
		const { ipcRenderer } = require('electron');
		ipcRenderer.send('load-configs', 'ok');
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
						extensions: [RED_QUICK_FILE_RECORDING_EXT$]
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
						extensions: [RED_QUICK_FILE_THEME_EXT$]
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
						let fileName = path.basename(currentGraph.graphFile);
						let fileNumber = 0;
						files.forEach(function (file: string) {
							let parts = fileName.split('.');
							fileName = parts.subset(0, parts.length - 1).join('.');
							const split = file.split(`${fileName}.`);
							let num: any = split.join('').split('').filter((x: any) => !isNaN(x)).join('');
							if (!isNaN(num)) {
								num = parseInt(num, 10);
								if (num >= fileNumber) {
									fileNumber = num + 1;
								}
							}
						});
						let parts = path.basename(currentGraph.graphFile).split('.');
						fileName = parts.subset(0, parts.length - 1).join('.');
						fs.copyFileSync(
							currentGraph.graphFile,
							path.join(backupFolder, `${fileName}.${fileNumber}${RED_QUICK_FILE_EXT}`)
						);
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
					properties: ['openDirectory']
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
