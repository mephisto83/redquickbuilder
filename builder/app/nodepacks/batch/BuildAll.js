import CreateViewTypes from "./CreateViewTypes";
import AddAgentMethods from "./AddAgentMethods";
import CreateComponentAll from "./CreateComponentAll";
import { setFlag, Flags } from "../../methods/graph_methods";
import { NO_OP } from "../../actions/uiactions";

export default function BuildAll() {

  const result = [];
  setFlag(true, 'hide_new_nodes', Flags.HIDE_NEW_NODES)

  result.push(...CreateViewTypes());


  result.push(() => {
    setTimeout(() => {

      AddAgentMethods();

      CreateComponentAll();
      setFlag(false, 'hide_new_nodes', Flags.HIDE_NEW_NODES);

    }, 1000);
    return {
      operation: NO_OP,
      options() {
      }
    }
  })
  return result;
}

BuildAll.title = 'Build All';
