import { NodeProperties, NodeTypes } from "../constants/nodetypes";
import {
  GetNodeProp,
  NodesByType,
  GetComponentApiNode,
  CHANGE_NODE_PROPERTY
} from "../actions/uiActions";
import {
  ComponentApiTypes,
  ComponentTypeKeys
} from "../constants/componenttypes";

let func: any = function() {
  // node0,node1
  //
  let result: any = [];

  let lists = NodesByType(null, NodeTypes.ComponentNode).filter((x: any) =>
    [
      ComponentTypeKeys.List,
      ComponentTypeKeys.MultiSelectList,
      ComponentTypeKeys.SingleSelect
    ].some(v => v === GetNodeProp(x, NodeProperties.ComponentType))
  );

  if (lists && lists.length) {
    lists.map((list: { id: any; }) => {
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
