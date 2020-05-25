/* eslint-disable camelcase */
/* eslint-disable compat/compat */
/* eslint-disable promise/param-names */
import CreateViewTypes from './CreateViewTypes';
import AddAgentMethods from './AddAgentMethods';
import CreateComponentAll from './CreateComponentAll';
import { setFlag, Flags, SetPause } from '../../methods/graph_methods';
import {
	GetDispatchFunc,
	GetStateFunc,
	graphOperation,
	executeGraphOperation,
	setVisual,
	BuildAllProgress,
	NodeTypes,
	clearPinned
} from '../../actions/uiactions';
import SelectAllOnModelFilters from './SelectAllOnModelFilters';
import AddFiltersToGetAll from '../method/AddFiltersToGetAll';
import UpdateScreenUrls from '../screens/UpdateScreenUrls';
import HaveAllPropertiesOnExecutors from './HaveAllPropertiesOnExecutors';
import AddCopyCommandToExecutors from './AddCopyCommandToExecutors';
import CreateDashboard from '../CreateDashboard_1';
import { AuthorizedDashboard } from '../../components/titles';
import { CreateLoginModels, ListRequiredModels, addTitleService } from '../../constants/nodepackages';
import { UITypes, MAIN_CONTENT, PROGRESS_VIEW } from '../../constants/nodetypes';
import AddChainToNavigateNextScreens from './AddChainToNavigateNextScreens';
import CreateConfiguration from '../CreateConfiguration';
import CreateFetchServiceIdempotently from '../CreateFetchServiceIdempotently';
import ConnectScreens from './ConnectScreens';
import CreateClaimService from './CreateClaimService';
import SetupViewTypes from './SetupViewTypes';
import AddComponentsToScreenOptions from './AddComponentsToScreenOptions';
import ApplyLoginValidations from './ApplyLoginValidations';
import CollectionDataChainsIntoCollections, { CollectionSharedReference } from '../CollectionDataChainsIntoCollections';
import JobService, { Job, JobFile } from '../../jobs/jobservice';
import ModifyUpdateLinks from '../ModifyUpdateLinks';

interface BuildStep {
	progress?: number;
	estimateRemaining?: number;
	totalTime?: number;
	name?: string;
	activate?: boolean;
	complete?: boolean;
}
export async function pause() {
	return new Promise((res) => {
		setTimeout(() => {
			res();
		}, 30);
	});
}

function activate(array: BuildStep[], name: string) {
	const item = array.find((v) => v.name === name);
	if (item) {
		item.activate = true;
	}
}

function complete(array: BuildStep[], name: string) {
	const item = array.find((v) => v.name === name);
	if (item) {
		item.activate = false;
		item.complete = true;
	}
}
function setProgress(array: BuildStep[], name: string, progress: number, estimateRemaining: number, totalTime: number) {
	const item = array.find((v) => v.name === name);
	if (item) {
		item.progress = progress * 50;
		item.estimateRemaining = estimateRemaining;
		item.totalTime = totalTime;
	}
}

const buildAllConfig = {
	command: ''
};
function setCommandToRun(command: string) {
	buildAllConfig.command = command;
}
function wait(name: string) {
	return `wait_for_${name}`;
}
function collect(name: String) {
	return `collect_for_${name}`;
}
function waiting(name: string) {
	return [
		{
			name
		},
		{
			name: wait(name)
		},
		{
			name: collect(name)
		}
	];
}
async function threadRun(
	array: BuildStep[],
	name: string,
	currentJobFile: JobFile,
	nodeTypes: string[] | string,
	chunkSize: number = 12
) {
	await run(array, name, async (progresFunc: any) => {
		await JobService.StartJob(name, currentJobFile, chunkSize, nodeTypes);
		//     await ConnectScreens(progresFunc);
	});

	await run(array, wait(name), async (progresFunc: (arg0: number) => any) => {
		await JobService.WaitForJob(wait(name), currentJobFile);
	});

	await run(array, collect(name), async (progresFunc: (arg0: number) => any) => {
		await JobService.CollectForJob(currentJobFile);
	});
}
async function run(array: BuildStep[], name: string, func: Function) {
	if (name !== buildAllConfig.command) {
		return;
	}
	activate(array, name);
	const times = [ Date.now() ];
	await func(async (progressValue: number) => {
		times.push(Date.now());
		let totalTime = 0;
		times.forEach((_item, index) => {
			if (index) {
				totalTime += times[index] - times[index - 1];
			}
		});
		const A = 1 - progressValue;
		const estimation = totalTime * A / progressValue;
		setProgress(array, name, progressValue, estimation, totalTime);
		setVisual(BuildAllProgress, [ ...array ])(GetDispatchFunc(), GetStateFunc());
		await pause();
	});
	complete(array, name);
	setVisual(BuildAllProgress, [ ...array ])(GetDispatchFunc(), GetStateFunc());
	await pause();
}

const Create_View_Types = 'Create View Types';
const Add_Agent_Methods = 'Add Agent Methods';
export const Create_Component_All = 'Create Component All';
const Wait_For_Create_Component_All_Completion = 'Wait_For_Create_Component_All_Completion';
const Select_All_On_Model_Filters = 'Select All On Model Filters';
const Add_Filters_To_Get_All = 'Add Filters to Get All';
const Create_Dashboard = 'Create Dashboard';
const Create_Login_Models = 'Create Login Models';
const ListRequiredModelTitles = 'ListRequiredModelTitles';
const AddTitleService = 'AddTitleService';
const Add_Chain_To_Navigate_Next_Screens = 'Add Chain to Navigate Next Screens';
const Create_Configuration = 'Create Configuration';
const Create_Fetch_Service = 'Create Fetch Service';
const Create_Claim_Service = 'Create Claim Service';
export const Connect_Screens = 'Connect_Screens';
const Wait_For_Screen_Connect = 'Wait_For_Screen_Connect';
const Update_Screen_Urls = 'Update_Screen_Urls';
const Collect_Screen_Connect_Into_Graph = 'Collect_Screen_Connect_Into_Graph';
const Modify_Update_Links = 'Modify_Update_Links';
const Setup_View_Types = 'Setup_View_Types';
const Have_All_Properties_On_Executors = 'HaveAllPropertiesOnExecutors';
export const Add_Component_To_Screen_Options = 'Add Component To Screen Options';
const Add_Copy_Command_To_Executors = 'Add_Copy_Command_To_Executors';
const CollectionSharedReferenceTo = 'Add Collections Shared Refs';
export const CollectionScreenWithoutDatachainDistributed = 'CollectionScreenWithoutDatachainDistributed';
export const ApplyTemplates = 'ApplyTemplates';
export const ApplyValidationFromProperties = 'ApplyValidationFromProperties';
export const CollectionComponentNodes = 'CollectionComponentNodes';
export const CollectionScreenNodes = 'CollectionScreenNodes';
export const CollectionConnectDataChainCollection = 'CollectionConnectDataChainCollection';
const Collect_Into_Graph = 'Collect_Into_Graph';
const COMPLETED_BUILD = 'COMPLETED_BUILD';

const buildAllProgress = [
	{ name: Create_View_Types },
	{ name: AddTitleService },
	{ name: Add_Agent_Methods },
	{ name: ListRequiredModelTitles },
	{ name: Create_Component_All },
	{ name: Wait_For_Create_Component_All_Completion },
	{ name: Collect_Into_Graph },
	{ name: Select_All_On_Model_Filters },
	{ name: Add_Filters_To_Get_All },
	{ name: Create_Dashboard },
	{ name: Create_Login_Models },
	{ name: Update_Screen_Urls },
	{ name: Add_Chain_To_Navigate_Next_Screens },
	{ name: Create_Configuration },
	{ name: Create_Fetch_Service },
	{ name: Create_Claim_Service },
	{ name: Connect_Screens },
	{ name: Wait_For_Screen_Connect },
	{ name: Collect_Screen_Connect_Into_Graph },
	{ name: Modify_Update_Links },
	{ name: Setup_View_Types },
	{ name: Have_All_Properties_On_Executors },
	{ name: Add_Copy_Command_To_Executors },
	{ name: Add_Component_To_Screen_Options },
	{ name: wait(Add_Component_To_Screen_Options) },
  ...waiting(ApplyTemplates),
  ...waiting(ApplyValidationFromProperties),
	...waiting(CollectionScreenWithoutDatachainDistributed),
	{ name: CollectionSharedReferenceTo },
	...waiting(CollectionComponentNodes),
	...waiting(CollectionScreenNodes),
	...waiting(CollectionConnectDataChainCollection),
	{ name: COMPLETED_BUILD }
];
export const BuildAllInfo = {
	Commands: buildAllProgress,
	InitialStep: Create_View_Types
};
export function GetStepIndex(step: string) {
	return buildAllProgress.findIndex((x) => x.name === step) + 1;
}
export function GetStepCount() {
	return buildAllProgress.length;
}
export default async function BuildAllDistributed(command: string, currentJobFile: JobFile) {
  setCommandToRun(command);
  SetPause(true);
	const uiTypes = {
		[UITypes.ElectronIO]: true,
		[UITypes.ReactWeb]: true,
		[UITypes.ReactNative]: true
	};
	setVisual(MAIN_CONTENT, PROGRESS_VIEW)(GetDispatchFunc(), GetStateFunc());
	await pause();

	setFlag(true, 'hide_new_nodes', Flags.HIDE_NEW_NODES);
	try {
		await run(buildAllProgress, Create_View_Types, async (progresFunc: any) => {
			const res = await CreateViewTypes(progresFunc);
			graphOperation(res)(GetDispatchFunc(), GetStateFunc());
		});

		await run(buildAllProgress, AddTitleService, async (progressFunc: any) => {
			graphOperation([ addTitleService({ newItems: {} }) ])(GetDispatchFunc(), GetStateFunc());
		});

		await run(buildAllProgress, Add_Agent_Methods, async (progresFunc: any) => {
			await AddAgentMethods(progresFunc);
		});

		await run(buildAllProgress, Create_Dashboard, async (progresFunc: (arg0: number) => any) => {
			const count = Object.keys(uiTypes).length;
			await Object.keys(uiTypes).forEachAsync(async (uiType: any, uiIndex: number) => {
				graphOperation(
					CreateDashboard({
						name: AuthorizedDashboard,
						uiType
					})
				)(GetDispatchFunc(), GetStateFunc());
				await progresFunc(uiIndex / count);
			});
		});
		await run(buildAllProgress, ListRequiredModelTitles, async (progressFunc: any) => {
			ListRequiredModels();
		});
		await run(buildAllProgress, Create_Login_Models, async (progresFunc: (arg0: number) => any) => {
			await progresFunc(1 / 10);
			executeGraphOperation(null, CreateLoginModels, uiTypes)(GetDispatchFunc(), GetStateFunc());
			await progresFunc(2 / 10);

			await ApplyLoginValidations(progresFunc);
		});

		await run(buildAllProgress, Create_Component_All, async (progresFunc: (arg0: number) => any) => {
			await JobService.StartJob(Create_Component_All, currentJobFile, 1, NodeTypes.Model);
		});

		await run(
			buildAllProgress,
			Wait_For_Create_Component_All_Completion,
			async (progresFunc: (arg0: number) => any) => {
				await JobService.WaitForJob(Create_Component_All, currentJobFile);
			}
		);

		await run(buildAllProgress, Update_Screen_Urls, async (progressFunc: any) => {
			await UpdateScreenUrls(progressFunc);
		});

		await run(buildAllProgress, Collect_Into_Graph, async (progresFunc: (arg0: number) => any) => {
			await JobService.CollectForJob(currentJobFile);
		});

		await run(buildAllProgress, Add_Filters_To_Get_All, async (progresFunc: any) => {
			await AddFiltersToGetAll(progresFunc);
		});

		await run(buildAllProgress, Select_All_On_Model_Filters, async (progresFunc: any) => {
			await SelectAllOnModelFilters(progresFunc);
		});

		await run(buildAllProgress, Add_Chain_To_Navigate_Next_Screens, async (progresFunc: any) => {
			await AddChainToNavigateNextScreens(progresFunc);
		});

		await run(buildAllProgress, Create_Configuration, async (progresFunc: any) => {
			graphOperation(CreateConfiguration())(GetDispatchFunc(), GetStateFunc());
		});

		await run(buildAllProgress, Create_Fetch_Service, async (progresFunc: (arg0: number) => any) => {
			graphOperation(CreateFetchServiceIdempotently())(GetDispatchFunc(), GetStateFunc());
			await progresFunc(1 / 2);
			graphOperation(CreateFetchServiceIdempotently())(GetDispatchFunc(), GetStateFunc());
			await progresFunc(2 / 2);
		});

		await run(buildAllProgress, Create_Claim_Service, async (progresFunc: any) => {
			CreateClaimService();
		});

		await run(buildAllProgress, Connect_Screens, async (progresFunc: any) => {
			await JobService.StartJob(Connect_Screens, currentJobFile, 12, NodeTypes.Screen);
			//     await ConnectScreens(progresFunc);
		});

		await run(buildAllProgress, Wait_For_Screen_Connect, async (progresFunc: (arg0: number) => any) => {
			await JobService.WaitForJob(Wait_For_Screen_Connect, currentJobFile);
		});

		await run(buildAllProgress, Collect_Screen_Connect_Into_Graph, async (progresFunc: (arg0: number) => any) => {
			await JobService.CollectForJob(currentJobFile);
		});
		await run(buildAllProgress, Modify_Update_Links, async (progresFunc: (arg0: number) => any) => {
			await graphOperation(ModifyUpdateLinks())(GetDispatchFunc(), GetStateFunc());
		});
		await run(buildAllProgress, Setup_View_Types, async (progresFunc: any) => {
			await SetupViewTypes(progresFunc);
		});

		await run(buildAllProgress, Have_All_Properties_On_Executors, async (progresFunc: any) => {
			await HaveAllPropertiesOnExecutors(progresFunc);
		});

		await run(buildAllProgress, Add_Copy_Command_To_Executors, async (progresFunc: any) => {
			await AddCopyCommandToExecutors(progresFunc);
		});
		// await run(buildAllProgress, Add_Component_To_Screen_Options, async (progresFunc: any) => {
		// 	await AddComponentsToScreenOptions(progresFunc);
		// });

		await threadRun(buildAllProgress, Add_Component_To_Screen_Options, currentJobFile, NodeTypes.Screen);

		await run(buildAllProgress, CollectionSharedReferenceTo, async (progresFunc: any) => {
			const result = CollectionSharedReference(progresFunc);
			await graphOperation(result)(GetDispatchFunc(), GetStateFunc());
			// await progresFunc(1);
		});

		await threadRun(
			buildAllProgress,
			CollectionScreenWithoutDatachainDistributed,
			currentJobFile,
			NodeTypes.Screen
		);

		await threadRun(buildAllProgress, CollectionComponentNodes, currentJobFile, NodeTypes.ComponentNode, 50);
    await threadRun(buildAllProgress, ApplyTemplates, currentJobFile, NodeTypes.Model);
    await threadRun(buildAllProgress, ApplyValidationFromProperties, currentJobFile, NodeTypes.Model);

		await threadRun(buildAllProgress, CollectionScreenNodes, currentJobFile, NodeTypes.Screen);
		await threadRun(
			buildAllProgress,
			CollectionConnectDataChainCollection,
			currentJobFile,
			NodeTypes.ComponentNode,
			100
		);
		await run(buildAllProgress, COMPLETED_BUILD, async (progresFunc: any) => {
			currentJobFile.completed = true;
		});
	} catch (e) {
		console.log(e);
	}

  setFlag(false, 'hide_new_nodes', Flags.HIDE_NEW_NODES);
  SetPause(false);

}

BuildAllDistributed.title = 'Build All Distributed';

export async function DistributeBuildAllJobs() {
	// await JobService.DistributeJobs();
}
