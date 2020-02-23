import { addValidatator } from "../methods/graph_methods";
import { uuidv4 } from "../utils/array";
import { ExecutorRules, ExecutorUI, NodeProperties } from "../constants/nodetypes";
import { CHANGE_NODE_PROPERTY } from "../actions/uiactions";

function AddCopyPropertiesToExecutor(args = { executor, currentNode }) {
  let { executor, currentNode } = args;
  if (executor && executor.properties) {
    Object.keys(executor.properties).map(key => {
      executor = addValidatator(executor, {
        id: key,
        validator: uuidv4(),
        validatorArgs: {
          type: ExecutorRules.Copy,
          ...ExecutorUI[ExecutorRules.Copy]
        }
      });
    });
    return [
      {
        operations: CHANGE_NODE_PROPERTY,
        options: {
          id: currentNode.id,
          prop: NodeProperties.Executor,
          value: executor
        }
      }
    ];
  }
  return [];
}

AddCopyPropertiesToExecutor.title = 'Add Copy Command';
AddCopyPropertiesToExecutor.description = 'Adds a copy command to each property in the executor'
export default AddCopyPropertiesToExecutor;
