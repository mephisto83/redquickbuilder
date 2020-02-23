import { GetNodesLinkedTo } from "../methods/graph_methods";
import * as UIA from "../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkProperties,
  NodeTypes
} from "../constants/nodetypes";

export default function CopyPermissionConditions(args = { permission }) {
  let { permission, node } = args;

  let conditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: permission,
    link: LinkType.Condition
  }).map(v => UIA.GetNodeProp(v, NodeProperties.Condition));
  let method = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: permission,
    link: LinkType.FunctionOperator
  }).find(x => x);
  let currentConditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: node,
    link: LinkType.Condition
  });
  let currentNodeMethod = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
    id: node,
    link: LinkType.FunctionOperator
  }).find(x => x);
  let functionType = UIA.GetNodeProp(method, NodeProperties.FunctionType);
  let currentNodeMethodFunctionType = UIA.GetNodeProp(
    currentNodeMethod,
    NodeProperties.FunctionType
  );
  let result = [];
  currentConditions.map(cc => {
    result.push({
      operation: UIA.REMOVE_NODE,
      options: function() {
        return {
          id: cc.id
        };
      }
    });
  });
  conditions.map(condition => {
    result.push({
      operation: UIA.ADD_NEW_NODE,
      options: function() {
        let temp = JSON.parse(JSON.stringify(condition));
        temp.methods[currentNodeMethodFunctionType] =
          temp.methods[functionType];
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
