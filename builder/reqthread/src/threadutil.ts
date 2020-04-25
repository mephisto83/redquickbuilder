import fs from 'fs';
import path from 'path';
import uiReducer, { updateUI, makeDefaultState } from '../../app/reducers/uiReducer';
import {
	UIC,
	GRAPHS,
	GetDispatchFunc,
	APPLICATION,
	CURRENT_GRAPH,
	setTestDispatch,
	setTestGetState,
	SaveApplication,
	SaveGraph,
	GetCurrentGraph
} from '../../app/actions/uiactions';
import JobService, { JobServiceConstants } from '../../app/jobs/jobservice';
import { setupCache, createGraph } from '../../app/methods/graph_methods';
import { Graph } from '../../app/methods/graph_types';
import unprune from '../../app/methods/unprune';
import prune from '../../app/methods/prune';

export interface AgentDirectories {
	[id: string]: AgentDirectory;
}
export interface AgentDirectory {
	[id: string]: {};
}
export function getAgentTrees(folder: string): AgentDirectories {
	if (fs.existsSync(folder)) {
		let agentDirectories = getDirectories(folder);
		let result: AgentDirectories = {};
		agentDirectories.forEach((agent) => {
			result[agent] = {};
			let projects = getDirectories(path.join(folder, agent));
			projects.map((project) => {
				result[agent][project] = JSON.parse(
					fs.readFileSync(path.join(folder, agent, project, 'config.json'), 'utf8')
				);
			});
		});
		return result;
	}

	throw new Error('folder doesnt exist');
}
export function sleep(ms: number = 30 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const isDirectory = (source) => fs.lstatSync(source).isDirectory();
export const getDirectories = (source) => fs.readdirSync(source).filter((name) => isDirectory(path.join(source, name)));

export async function setupJob(graphFolder: string) {
	let graph = await openFile(path.join(graphFolder, JobServiceConstants.GRAPH_FILE), GetDispatchFunc());
	let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph));
	state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
	let app_state = { uiReducer: state };
	console.log('setting dispatch');
	setTestDispatch((args) => {
    console.log('here');
		app_state = uiReducer(app_state, args);
	});

	console.log('setting getState');
	setTestGetState(() => {
		return app_state;
	});
	console.log('saving application');
	SaveApplication(graph.id, CURRENT_GRAPH, GetDispatchFunc());
  console.log('saving graph');
  console.log(graph.version);
	SaveGraph(graph, GetDispatchFunc());
	console.log('setup cache');
	setupCache(graph);
	console.log('setup complete');
	return app_state;
}
export async function saveCurrentGraphTo(filePath) {
	console.log(`saving to : ${filePath}`);
  let currentGraph = GetCurrentGraph();
  console.log(currentGraph.version);
	let savecontent = JSON.stringify(prune(currentGraph));
	fs.writeFileSync(filePath, savecontent, 'utf8');
}

export async function openFile(fileName: string, dispatch: any): Promise<Graph> {
	try {
		let dirPath = path.dirname(fileName);
		let res = await JobService.JoinFile(dirPath, path.basename(fileName));
		let opened_graph: Graph = JSON.parse(res);
		if (opened_graph) {
			opened_graph = unprune(opened_graph);
			const default_graph = createGraph();
			opened_graph = { ...default_graph, ...opened_graph };

			return opened_graph;
		}
	} catch (e) {
		console.log('failed to open the file');
		throw e;
	}
}
