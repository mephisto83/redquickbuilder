import * as UIA from "../actions/uiactions";
import { NodeProperties, LinkEvents } from "../constants/nodetypes";
import {
  addValidatator,
  createEventProp,
  createExecutor
} from "../methods/graph_methods";

export default function ClearExecutor(args = { currentNode }) {
  let { currentNode } = args;

  var propertyNodes = UIA.GetModelPropertyChildren(
    UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel),
    { skipLogicalChildren: true }
  ).toNodeSelect();

  return addProperty(
    propertyNodes
      .filter(x => !UIA.GetNodeProp(x.value, NodeProperties.IsDefaultProperty))
      .map(t => {
        return t.value;
      }),
    currentNode
  );
}

ClearExecutor.description =
  "Clears all executors";

let addProperty = (values, currentNode) => {
  let executor =
    UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createExecutor();
  var operation = values
    .map(value => {
      var id = currentNode.id;
      executor = addValidatator(executor, { id: value });

      return [
        {
          operation: UIA.CHANGE_NODE_PROPERTY,
          options: function() {
            return {
              id: currentNode.id,
              prop: NodeProperties.Executor,
              value: null
            };
          }
        }
      ];
    })
    .flatten();
  return operation;
};
