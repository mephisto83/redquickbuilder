import { NodesByType } from "../../actions/uiactions";
import { NodeTypes } from "../../constants/nodetypes";
import CreateViewTypes from "./CreateViewTypes";
import AddAgentMethods from "./AddAgentMethods";

export default function BuildAll() {
  let models = NodesByType(null, NodeTypes.Model);
  const result = [];

  result.push(...CreateViewTypes());

  result.push(...AddAgentMethods());

  return result;
}

BuildAll.title = 'Build All';
