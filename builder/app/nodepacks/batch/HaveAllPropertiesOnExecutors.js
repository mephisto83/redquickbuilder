import { NodesByType, graphOperation, GetDispatchFunc, GetStateFunc } from "../../actions/uiactions";
import { NodeTypes } from "../../constants/nodetypes";
import AddAllPropertiesToExecutor from "../AddAllPropertiesToExecutor";

export default async function HaveAllPropertiesOnExecutors(progresFunc) {
  const executors = NodesByType(null, NodeTypes.Executor);
  await executors.forEachAsync(async (executor, index, total) => {
    const result = [];
    const steps = AddAllPropertiesToExecutor({
      currentNode: executor
    });
    result.push(...steps);

    graphOperation(result)(GetDispatchFunc(), GetStateFunc());
    await progresFunc(index / total);
  });

}
