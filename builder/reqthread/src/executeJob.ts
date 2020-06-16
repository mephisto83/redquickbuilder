import fs from 'fs';
import path from 'path';
import CreateComponentAll from '../../app/nodepacks/batch/CreateComponentAll';
import { GetCurrentGraph } from '../../app/actions/uiactions';
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
import {
	Create_Component_All,
	Connect_Screens,
	Add_Component_To_Screen_Options
} from '../../app/nodepacks/batch/BuildAllDistributed';

import * as BAD from '../../app/nodepacks/batch/BuildAllDistributed';

import ConnectScreens from '../../app/nodepacks/batch/ConnectScreens';
import AddComponentsToScreenOptions from '../../app/nodepacks/batch/AddComponentsToScreenOptions';
import {
	CollectionScreenWithoutDatachainDistributed,
	CollectionComponentNodes,
	CollectionScreenNodes,
	CollectionConnectDataChainCollection
} from '../../app/nodepacks/CollectionDataChainsIntoCollections';
import { SetPause } from '../../app/methods/graph_methods';
import ApplyTemplates from '../../app/nodepacks/permission/ApplyTemplates';
import ApplyValidationFromProperties from '../../app/nodepacks/permission/ApplyValidationFromProperties';
import SetupViewTypes from '../../app/nodepacks/batch/SetupViewTypes';
import BuildDashboards from '../../app/nodepacks/screens/dashboard/BuildDashboards';
import ConnectDashboards from '../../app/nodepacks/screens/dashboard/ConnectDashboards';
import ChangeInputToSelect from '../../app/nodepacks/screens/ChangeInputToSelect';

let app_state;

async function sleep(ms: number = 5 * 1000) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
export default async function executeJob(
	jobConfig: Job,
	options: { folderPath: string; agentName: string; projectName: string; fileName: string },
	onChange: Function,
	onProgress: Function
) {
	let jobInstancePath = path.join(options.folderPath, options.agentName, options.projectName, options.fileName);
	SetPause(true);
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
					await CreateComponentAll(onProgress, (model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					console.log('CreateComponentAll completed');

					break;
				case BAD.Setup_View_Types:
					await SetupViewTypes(onProgress, (model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.Connect_Dashboards:
					await ConnectDashboards((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					}, onProgress);
					break;
				case BAD.Build_Dashboards:
					await BuildDashboards((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.ApplyTemplates:
					await ApplyTemplates((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.ApplyValidationFromProperties:
					await ApplyValidationFromProperties((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.CollectionScreenWithoutDatachainDistributed:
					await CollectionScreenWithoutDatachainDistributed((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.ChangeInputToSelects:
					await ChangeInputToSelect((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.CollectionComponentNodes:
					await CollectionComponentNodes((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.CollectionScreenNodes:
					await CollectionScreenNodes((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case BAD.CollectionConnectDataChainCollection:
					await CollectionConnectDataChainCollection((model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case Create_Component_All:
					await CreateComponentAll(onProgress, (model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					console.log('CreateComponentAll completed');

					break;
				case Connect_Screens:
					await ConnectScreens(onProgress, (model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				case Add_Component_To_Screen_Options:
					await AddComponentsToScreenOptions(onProgress, (model: any) => {
						return filter && filter.models.indexOf(model.id) !== -1;
					});
					break;
				default:
					jobConfig.complete = true;
					console.log('-------------invalid job----------------');
					console.log(jobPart);
					console.log(partPath);
					console.log(command);
					console.log('-----------------------------');
					throw new Error('unknown job');
			}
			if (!jobConfig.complete) {
				await storeOutput(path.join(jobInstancePath));
				if (onChange) {
					await onChange({ ...options, jobInstancePath });
				}
			}
			if (onProgress) {
				await onProgress(1);
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
	SetPause(false);

	return jobConfig;
}

async function storeOutput(partFolder: string) {
	return new Promise(async (resolve, fail) => {
		try {
			let currentGraph = GetCurrentGraph();
			// let savecontent = JSON.stringify(prune(currentGraph));
			await JobService.BreakFile(
				partFolder,
				JobServiceConstants.OUTPUT,
				JobServiceConstants.OUTPUT_FOLDER,
				JobServiceConstants.OUTPUT,
				currentGraph
			);
			resolve();
		} catch (e) {
			fail(e);
		}
	});
}
