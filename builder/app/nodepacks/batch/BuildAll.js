import CreateViewTypes from "./CreateViewTypes";
import AddAgentMethods from "./AddAgentMethods";
import CreateComponentAll from "./CreateComponentAll";
import { setFlag, Flags } from "../../methods/graph_methods";
import { GetDispatchFunc, GetStateFunc, graphOperation, executeGraphOperation } from "../../actions/uiactions";
import SelectAllOnModelFilters from "./SelectAllOnModelFilters";
import AddFiltersToGetAll from "../method/AddFiltersToGetAll";
import HaveAllPropertiesOnExecutors from "./HaveAllPropertiesOnExecutors";
import AddCopyCommandToExecutors from "./AddCopyCommandToExecutors";
import CreateDashboard from "../CreateDashboard_1";
import { AuthorizedDashboard } from "../../components/titles";
import { CreateLoginModels } from "../../constants/nodepackages";
import { UITypes } from "../../constants/nodetypes";
import AddChainToNavigateNextScreens from "./AddChainToNavigateNextScreens";
import CreateConfiguration from "../CreateConfiguration";
import CreateFetchServiceIdempotently from "../CreateFetchServiceIdempotently";
import ConnectScreens from "./ConnectScreens";
import CreateClaimService from "./CreateClaimService";
import SetupViewTypes from "./SetupViewTypes";
import AddComponentsToScreenOptions from "./AddComponentsToScreenOptions";

export default function BuildAll() {

  const result = [];
  setFlag(true, 'hide_new_nodes', Flags.HIDE_NEW_NODES)
  try {
    result.push(...CreateViewTypes());

    graphOperation(result)(GetDispatchFunc(), GetStateFunc())

    AddAgentMethods();

    CreateComponentAll();

    graphOperation(SelectAllOnModelFilters())(GetDispatchFunc(), GetStateFunc());

    graphOperation(AddFiltersToGetAll())(GetDispatchFunc(), GetStateFunc());


    graphOperation(CreateDashboard({
      name: AuthorizedDashboard
    }))(GetDispatchFunc(), GetStateFunc());

    executeGraphOperation(
      null,
      CreateLoginModels,
      {
        [UITypes.ElectronIO]: true,
        [UITypes.ReactNative]: true
      }
    )(GetDispatchFunc(), GetStateFunc());

    graphOperation(AddChainToNavigateNextScreens())(GetDispatchFunc(), GetStateFunc());

    graphOperation(CreateConfiguration())(GetDispatchFunc(), GetStateFunc());

    graphOperation(CreateFetchServiceIdempotently())(GetDispatchFunc(), GetStateFunc());

    graphOperation(CreateFetchServiceIdempotently())(GetDispatchFunc(), GetStateFunc());


    CreateClaimService();

    ConnectScreens();

    SetupViewTypes();

    graphOperation(HaveAllPropertiesOnExecutors())(GetDispatchFunc(), GetStateFunc());

    graphOperation(AddCopyCommandToExecutors())(GetDispatchFunc(), GetStateFunc());


    AddComponentsToScreenOptions();

  } catch (e) {
    console.log(e);
  }

  setFlag(false, 'hide_new_nodes', Flags.HIDE_NEW_NODES);

  return [];
}

BuildAll.title = 'Build All';
