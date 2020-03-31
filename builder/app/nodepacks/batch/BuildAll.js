import CreateViewTypes from "./CreateViewTypes";
import AddAgentMethods from "./AddAgentMethods";
import CreateComponentAll from "./CreateComponentAll";
import { setFlag, Flags } from "../../methods/graph_methods";
import { NO_OP, GetDispatchFunc, GetStateFunc, graphOperation } from "../../actions/uiactions";

export default function BuildAll() {

  const result = [];
  setFlag(true, 'hide_new_nodes', Flags.HIDE_NEW_NODES)

  result.push(...CreateViewTypes());

  graphOperation(result)(GetDispatchFunc(), GetStateFunc())

  AddAgentMethods();

  CreateComponentAll();
  setFlag(false, 'hide_new_nodes', Flags.HIDE_NEW_NODES);
  return [];
}

BuildAll.title = 'Build All';
