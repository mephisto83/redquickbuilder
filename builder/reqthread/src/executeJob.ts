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
import {
	Job,
	JobOutput,
	JobConfigContract,
	JobServiceConstants,
	ensureDirectory,
	JobItem
} from '../../app/jobs/jobservice';
import JobService from '../../app/jobs/jobservice';
import { Graph } from '../../app/methods/graph_types';
import { setupJob } from './threadutil';
import { Create_Component_All, Connect_Screens } from '../../app/nodepacks/batch/BuildAllDistributed';
import ConnectScreens from '../../app/nodepacks/batch/ConnectScreens';

let app_state;

async function sleep(ms: number = 5 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export default async function executeJob(
	jobConfig: Job,
	options: { folderPath: string; agentName: string; projectName: string; fileName: string },
	onChange: Function
) {
	let jobInstancePath = path.join(options.folderPath, options.agentName, options.projectName, options.fileName);
	const partPath = path.join(jobInstancePath, JobServiceConstants.INPUT);
	if (partPath && fs.existsSync(partPath)) {
		const partContent: string = fs.readFileSync(partPath, 'utf8');
		if (partContent) {
			const jobPart: JobItem = JSON.parse(partContent);
			const { config } = jobPart;
			const { command, filter } = config;
			app_state = await setupJob(jobInstancePath);

			jobConfig.updated = Date.now();
			switch (command) {
				case Create_Component_All:
					await CreateComponentAll(
						() => {},
						(model: any) => {
							return filter && filter.models.indexOf(model.id) !== -1;
						}
          );
          console.log('CreateComponentAll completed');
					await storeOutput(path.join(jobInstancePath));
					if (onChange) {
						onChange({ ...options, jobInstancePath });
					}
					break;
				case Connect_Screens:
					await ConnectScreens(
						() => {},
						(model: any) => {
							return filter && filter.models.indexOf(model.id) !== -1;
						}
					);
					await storeOutput(path.join(jobInstancePath));
					if (onChange) {
						onChange({ ...options, jobInstancePath });
					}
					break;
				default:
					jobConfig.complete = true;
					console.log(jobPart);
					console.log(partPath);
					console.log(command);
					throw new Error('unknown job');
			}

			jobConfig.complete = true;
		}
	} else {
		console.log(jobConfig);
		console.log(options);
		throw new Error('missing partPath');
	}
	if (fs.existsSync(partPath)) {
		await sleep();
	}

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
