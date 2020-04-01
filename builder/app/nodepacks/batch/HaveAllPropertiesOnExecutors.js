import { NodesByType } from "../../actions/uiactions";
import { NodeTypes } from "../../constants/nodetypes";
import AddAllPropertiesToExecutor from "../AddAllPropertiesToExecutor";

export default function HaveAllPropertiesOnExecutors() {
  const executors = NodesByType(null, NodeTypes.Executor);
  const result = [];
  executors.forEach(executor => {
    const steps = AddAllPropertiesToExecutor({
      currentNode: executor
    });
    result.push(...steps);
  });

  return result;
}
