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
import { Job, JobOutput, JobConfigContract, JobServiceConstants, ensureDirectory } from '../../app/jobs/jobservice';
import JobService from '../../app/jobs/jobservice';
import { Graph } from '../../app/methods/graph_types';

const Create_Component_All = 'Create Component All';
let app_state;

async function sleep(ms: number = 30 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export default async function executeJob(jobConfig: Job) {
	let { parts, jobInstancePath } = jobConfig;
	if (!parts) throw new Error('no parts found in job');
	await parts.forEachAsync(async (part: string) => {
		const partPath = path.join(jobInstancePath, part, JobServiceConstants.INPUT);
		if (partPath && fs.existsSync(partPath)) {
			const partContent: string = fs.readFileSync(partPath, 'utf8');
			if (partContent) {
				const jobPart: JobConfigContract = JSON.parse(partContent);
				const { command, filter } = jobPart;
				await setupJob(jobInstancePath);

				switch (command) {
					case Create_Component_All:
						jobConfig.updated = Date.now();
						await CreateComponentAll(
							() => {},
							(model: any) => {
								return filter && filter.models.indexOf(model.id) !== -1;
							}
						);
						await storeOutput(path.join(jobInstancePath, part));
						await JobService.SetJobPartComplete(path.join(jobInstancePath, part));
						break;
					default:
						jobConfig.complete = true;
						throw new Error('unknown job');
				}

				jobConfig.complete = true;
			}
		}
		if (fs.existsSync(partPath)) {
			await sleep();
		}
	});

	return jobConfig;
}
async function setupJob(jobInstancePath) {
	let graph = await openFile(path.join(jobInstancePath, JobServiceConstants.GRAPH_FILE), GetDispatchFunc());
	let state = updateUI(makeDefaultState(), UIC(GRAPHS, graph.id, graph));
	state = updateUI(state, UIC(APPLICATION, CURRENT_GRAPH, graph.id));
	app_state = { uiReducer: state };
	console.log('setting dispatch');
	setTestDispatch((args) => {
		app_state = uiReducer(app_state, args);
	});

	console.log('setting getState');
	setTestGetState(() => {
		return app_state;
	});
	console.log('saving application');
	SaveApplication(graph.id, CURRENT_GRAPH, GetDispatchFunc());
	console.log('saving graph');
	SaveGraph(graph, GetDispatchFunc());
	console.log('setup cache');
	setupCache(graph);
	console.log('setup complete');
}

async function storeOutput(partFolder: string) {
	return new Promise(async (resolve, fail) => {
		try {
			let currentGraph = GetCurrentGraph();
			let savecontent = JSON.stringify(prune(currentGraph));
			await JobService.BreakFile(
				partFolder,
				JobServiceConstants.OUTPUT,
				JobServiceConstants.OUTPUT_FOLDER,
				JobServiceConstants.OUTPUT,
				savecontent
			);
			resolve();
		} catch (e) {
			fail(e);
		}
	});
}
async function openFile(fileName: string, dispatch: any): Promise<Graph> {
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
