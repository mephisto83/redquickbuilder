import { NodeProperties, NodeTypes } from "../constants/nodetypes";
import {
  GetNodeProp,
  NodesByType,
  GetComponentApiNode,
  CHANGE_NODE_PROPERTY
} from "../actions/uiactions";
import {
  ComponentApiTypes,
  ComponentTypeKeys
} from "../constants/componenttypes";

let func = function() {
  // node0,node1
  //
  let result = [];

  let lists = NodesByType(null, NodeTypes.ComponentNode).filter(x =>
    [
      ComponentTypeKeys.List,
      ComponentTypeKeys.MultiSelectList,
      ComponentTypeKeys.SingleSelect
    ].some(v => v === GetNodeProp(x, NodeProperties.ComponentType))
  );

  if (lists && lists.length) {
    lists.map(list => {
      let valueApiNode = GetComponentApiNode(ComponentApiTypes.Value, list.id);
      if (valueApiNode) {
        result.push({
          operation: CHANGE_NODE_PROPERTY,
          options: {
            id: valueApiNode.id,
            prop: NodeProperties.AsLocalContext,
            value: true
          }
        });
      }
    });
  }

  return result;
};
func.description =
  "Sets the inner api component value to use the local context.";
export default func;
