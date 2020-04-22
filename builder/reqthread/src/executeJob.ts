import { JobConfig } from './task';
import fs from 'fs';
import path from 'path';
import CreateComponentAll from '../../app/nodepacks/batch/CreateComponentAll';
import {
	GetDataChainEntryNodes,
	APPLICATION,
	CURRENT_GRAPH,
	GRAPHS,
	UIC,
	setTestGetState,
	GetDataChainFrom,
	GenerateDataChainMethod,
	GenerateChainFunction,
	GenerateChainFunctions,
	GetDataChainNextId,
	GetDataChainArgs,
	GetDataChainParts,
	SaveApplication,
	SaveGraph,
	setTestDispatch,
	GetDispatchFunc,
	GetCurrentGraph
} from '../../app/actions/uiactions';
import uiReducer, { makeDefaultState, updateUI } from '../../app/reducers/uiReducer';
import unprune from '../../app/methods/unprune';
import { createGraph, setupCache } from '../../app/methods/graph_methods';
import prune from '../../app/methods/prune';

const Create_Component_All = 'Create Component All';
let app_state;
export default async function executeJob(jobConfig: JobConfig) {
	setupJob(jobConfig);
	await openFile(jobConfig.absolutePath, GetDispatchFunc());

	switch (jobConfig.command) {
		case Create_Component_All:
			jobConfig.updated = Date.now();
			await CreateComponentAll(
				() => {},
				(model: any) => {
					return jobConfig.filter.model === model.id;
				}
			);
			await saveFile(jobConfig);
			break;
		default:
			jobConfig.complete = true;
			throw new Error('unknown job');
	}

	jobConfig.complete = true;
	return jobConfig;
}
function setupJob(jobConfig: JobConfig) {
	let graphFile = fs.readFileSync(jobConfig.absolutePath, 'utf8');
	let graph = JSON.parse(graphFile);
	let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph));
	state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
	app_state = { uiReducer: state };
	setTestGetState(() => {
		return app_state;
	});
	setTestDispatch((args) => {
		app_state = uiReducer(app_state, args);
	});
}
async function saveFile(jobConfig: JobConfig) {
	return new Promise((resolve, fail) => {
		try {
			let currentGraph = GetCurrentGraph();
			let fileName = jobConfig.absolutePath;
			let savecontent = JSON.stringify(prune(currentGraph));

			console.log(fileName);

			fs.writeFile(fileName, savecontent, (err) => {
				if (err) {
					console.error(`An error ocurred updating the file${err.message}`);
					console.log(err);
					fail(err);
					return;
				}
				resolve();
				console.warn('The file has been succesfully saved');
			});
		} catch (e) {
			fail(e);
		}
	});
}
async function openFile(fileName: string, dispatch: any) {
	return new Promise((resolve, fail) => {
		console.log(fileName);
		fs.readFile(fileName, { encoding: 'utf8' }, (err: { message: any }, res: string) => {
			if (err) {
				console.error(`An error ocurred updating the file${err.message}`);
				console.log(err);
				return;
			}
			try {
				let opened_graph = JSON.parse(res);
				if (opened_graph) {
					opened_graph = unprune(opened_graph);
					const default_graph = createGraph();
					opened_graph = { ...default_graph, ...opened_graph };
					SaveApplication(opened_graph.id, CURRENT_GRAPH, dispatch);
					SaveGraph(opened_graph, dispatch);
					setupCache(opened_graph);
					resolve();
				}
			} catch (e) {
				console.log(e);
				fail();
			}
			console.warn('The file has been succesfully saved');
		});
	});
}
