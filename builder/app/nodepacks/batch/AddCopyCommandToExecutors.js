import { NodesByType, GetNodeProp } from "../../actions/uiactions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import AddCopyPropertiesToExecutor from "../AddCopyPropertiesToExecutor";

export default function AddCopyCommandToExecutors() {

  const executors = NodesByType(null, NodeTypes.Executor);
  const result = [];

  executors.forEach(executor => {
    const steps = AddCopyPropertiesToExecutor({
      currentNode: executor,
      executor: GetNodeProp(executor, NodeProperties.Executor)
    });
    result.push(...steps);
  });

  return result;
}
