/* eslint-disable camelcase */
/* eslint-disable compat/compat */
/* eslint-disable promise/param-names */
import CreateViewTypes from "./CreateViewTypes";
import AddAgentMethods from "./AddAgentMethods";
import CreateComponentAll from "./CreateComponentAll";
import { setFlag, Flags, SetPause } from "../../methods/graph_methods";
import { GetDispatchFunc, GetStateFunc, graphOperation, executeGraphOperation, setVisual } from "../../actions/uiactions";
import SelectAllOnModelFilters from "./SelectAllOnModelFilters";
import AddFiltersToGetAll from "../method/AddFiltersToGetAll";
import HaveAllPropertiesOnExecutors from "./HaveAllPropertiesOnExecutors";
import AddCopyCommandToExecutors from "./AddCopyCommandToExecutors";
import CreateDashboard from "../CreateDashboard_1";
import { AuthorizedDashboard } from "../../components/titles";
import { CreateLoginModels } from "../../constants/nodepackages";
import { UITypes, MAIN_CONTENT, PROGRESS_VIEW } from "../../constants/nodetypes";
import AddChainToNavigateNextScreens from "./AddChainToNavigateNextScreens";
import CreateConfiguration from "../CreateConfiguration";
import CreateFetchServiceIdempotently from "../CreateFetchServiceIdempotently";
import ConnectScreens from "./ConnectScreens";
import CreateClaimService from "./CreateClaimService";
import SetupViewTypes from "./SetupViewTypes";
import AddComponentsToScreenOptions from "./AddComponentsToScreenOptions";
import { BuildAllProgress } from "../../templates/electronio/v1/app/actions/uiActions";

export async function pause() {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, 30)
  });
}

function activate(array, name) {
  const item = array.find(v => v.name === name);
  item.activate = true;
}

function complete(array, name) {
  const item = array.find(v => v.name === name);
  item.activate = false;
  item.complete = true;
}
function setProgress(array, name, progress, estimateRemaining, totalTime) {
  const item = array.find(v => v.name === name);
  item.progress = progress * 50;
  item.estimateRemaining = estimateRemaining;
  item.totalTime = totalTime;
}
async function run(array, name, func) {

  activate(array, name);
  const times = [Date.now()];
  await func(async (progressValue) => {
    times.push(Date.now());
    let totalTime = 0;
    times.forEach((item, index) => {
      if (index) {
        totalTime += times[index] - times[index - 1];
      }
    });
    const A = 1 - progressValue;
    const estimation = (totalTime * A / progressValue);
    setProgress(array, name, progressValue, estimation, totalTime);
    setVisual(
      BuildAllProgress,
      [...array]
    )(GetDispatchFunc(), GetStateFunc());
    await pause();
  });
  complete(array, name);
  setVisual(
    BuildAllProgress,
    [...array]
  )(GetDispatchFunc(), GetStateFunc());
  await pause();
}

export default async function BuildAll(callback) {
  const Create_View_Types = 'Create View Types';
  const Add_Agent_Methods = 'Add Agent Methods';
  const Create_Component_All = 'Create Component All';
  const Select_All_On_Model_Filters = 'Select All On Model Filters';
  const Add_Filters_To_Get_All = 'Add Filters to Get All';
  const Create_Dashboard = 'Create Dashboard';
  const Create_Login_Models = 'Create Login Models';
  const Add_Chain_To_Navigate_Next_Screens = 'Add Chain to Navigate Next Screens';
  const Create_Configuration = 'Create Configuration';
  const Create_Fetch_Service = 'Create Fetch Service';
  const Create_Claim_Service = 'Create Claim Service';
  const Connect_Screens = 'Connect_Screens';
  const Setup_View_Types = 'Setup_View_Types';
  const Have_All_Properties_On_Executors = 'HaveAllPropertiesOnExecutors';
  const Add_Component_To_Screen_Options = 'Add Component To Screen Options';
  const Add_Copy_Command_To_Executors = 'Add_Copy_Command_To_Executors';
  SetPause(true);
  setVisual(MAIN_CONTENT, PROGRESS_VIEW)(GetDispatchFunc(), GetStateFunc());
  await pause();
  const buildAllProgress = [
    { name: Create_View_Types },
    { name: Add_Agent_Methods },
    { name: Create_Component_All },
    { name: Select_All_On_Model_Filters },
    { name: Add_Filters_To_Get_All },
    { name: Create_Dashboard },
    { name: Create_Login_Models },
    { name: Add_Chain_To_Navigate_Next_Screens },
    { name: Create_Configuration },
    { name: Create_Fetch_Service },
    { name: Create_Claim_Service },
    { name: Connect_Screens },
    { name: Setup_View_Types },
    { name: Have_All_Properties_On_Executors },
    { name: Add_Copy_Command_To_Executors },
    { name: Add_Component_To_Screen_Options }
  ];

  setFlag(true, 'hide_new_nodes', Flags.HIDE_NEW_NODES)
  try {
    await run(buildAllProgress, Create_View_Types, async (progresFunc) => {
      const res = await CreateViewTypes(progresFunc)
      graphOperation(res)(GetDispatchFunc(), GetStateFunc())
    });

    await run(buildAllProgress, Add_Agent_Methods, async (progresFunc) => {
      await AddAgentMethods(progresFunc);
    });

    await run(buildAllProgress, Create_Component_All, async (progresFunc) => {
      await CreateComponentAll(progresFunc);
    });


    await run(buildAllProgress, Select_All_On_Model_Filters, async (progresFunc) => {
      await SelectAllOnModelFilters(progresFunc);
    });


    await run(buildAllProgress, Add_Filters_To_Get_All, async (progresFunc) => {
      await AddFiltersToGetAll(progresFunc);
    });


    await run(buildAllProgress, Create_Dashboard, async (progresFunc) => {
      graphOperation(CreateDashboard({
        name: AuthorizedDashboard,
        progresFunc
      }))(GetDispatchFunc(), GetStateFunc());
    });


    await run(buildAllProgress, Create_Login_Models, async (progresFunc) => {
      executeGraphOperation(
        null,
        CreateLoginModels,
        {
          [UITypes.ElectronIO]: true,
          [UITypes.ReactNative]: true
        }
      )(GetDispatchFunc(), GetStateFunc());
    });


    await run(buildAllProgress, Add_Chain_To_Navigate_Next_Screens, async (progresFunc) => {
      await AddChainToNavigateNextScreens(progresFunc);
    });


    await run(buildAllProgress, Create_Configuration, async (progresFunc) => {
      graphOperation(CreateConfiguration())(GetDispatchFunc(), GetStateFunc());
    });


    await run(buildAllProgress, Create_Fetch_Service, async (progresFunc) => {
      graphOperation(CreateFetchServiceIdempotently())(GetDispatchFunc(), GetStateFunc());
      await progresFunc(1 / 2);
      graphOperation(CreateFetchServiceIdempotently())(GetDispatchFunc(), GetStateFunc());
      await progresFunc(2 / 2);
    });



    await run(buildAllProgress, Create_Claim_Service, async (progresFunc) => {
      CreateClaimService();
    });


    await run(buildAllProgress, Connect_Screens, async (progresFunc) => {
      await ConnectScreens(progresFunc);
    });



    await run(buildAllProgress, Setup_View_Types, async (progresFunc) => {
      await SetupViewTypes(progresFunc);
    });


    await run(buildAllProgress, Have_All_Properties_On_Executors, async (progresFunc) => {
      await HaveAllPropertiesOnExecutors(progresFunc);
    });

    await run(buildAllProgress, Add_Copy_Command_To_Executors, async (progresFunc) => {
      await AddCopyCommandToExecutors(progresFunc);
    });
    ;

    await run(buildAllProgress, Add_Component_To_Screen_Options, async (progresFunc) => {
      await AddComponentsToScreenOptions(progresFunc);
    });


  } catch (e) {
    console.log(e);
  }

  setFlag(false, 'hide_new_nodes', Flags.HIDE_NEW_NODES);
  if (callback) {
    callback();
  }
  SetPause(false);

  return [];
}

BuildAll.title = 'Build All';
