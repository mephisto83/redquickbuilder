import { GetNodesLinkedTo } from "../methods/graph_methods";
import * as UIA from "../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkProperties,
  NodeTypes
} from "../constants/nodetypes";

export default function CopyPermissionConditions(args = { permission }) {
  let { permission } = args;
  const { node } = args;

  const conditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: permission,
    link: LinkType.Condition
  }).map(v => UIA.GetNodeProp(v, NodeProperties.Condition));
  const method = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: permission,
    link: LinkType.FunctionOperator
  }).find(x => x);
  const currentConditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: node,
    link: LinkType.Condition
  });
  const currentNodeMethod = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: node,
    link: LinkType.FunctionOperator
  }).find(x => x);
  const functionType = UIA.GetNodeProp(method, NodeProperties.FunctionType);
  const currentNodeMethodFunctionType = UIA.GetNodeProp(
    currentNodeMethod,
    NodeProperties.FunctionType
  );
  const result = [];
  currentConditions.forEach(cc => {
    result.push({
      operation: UIA.REMOVE_NODE,
      options() {
        return {
          id: cc.id
        };
      }
    });
  });
  conditions.forEach(condition => {
    result.push({
      operation: UIA.ADD_NEW_NODE,
      options() {
        const temp = JSON.parse(JSON.stringify(condition));
        temp.methods[currentNodeMethodFunctionType] =
          temp.methods[functionType];
        if (functionType !== currentNodeMethodFunctionType)
          delete temp.methods[functionType];
        return {
          nodeType: NodeTypes.Condition,
          properties: {
            [NodeProperties.Condition]: temp,
            [NodeProperties.Pinned]: false
          },
          parent: node,
          groupProperties: {},
          linkProperties: {
            properties: {
              ...LinkProperties.ConditionLink
            }
          }
        };
      }
    });
  });

  return result;
}
