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
import { setupJob } from './threadutil';

const Create_Component_All = 'Create Component All';
let app_state;

async function sleep(ms: number = 30 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export default async function executeJob(jobConfig: Job, onChange: Function) {
	let { parts, jobInstancePath } = jobConfig;
	if (!parts) throw new Error('no parts found in job');
	await parts.forEachAsync(async (part: string) => {
		const partPath = path.join(jobInstancePath, part, JobServiceConstants.INPUT);
		if (partPath && fs.existsSync(partPath)) {
			const partContent: string = fs.readFileSync(partPath, 'utf8');
			if (partContent) {
				const jobPart: JobConfigContract = JSON.parse(partContent);
				const { command, filter } = jobPart;
				app_state = await setupJob(jobInstancePath);

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
						if (onChange) {
							onChange();
						}
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
