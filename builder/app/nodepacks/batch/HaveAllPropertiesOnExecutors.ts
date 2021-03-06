import { NodesByType, graphOperation, GetDispatchFunc, GetStateFunc } from "../../actions/uiActions";
import { NodeTypes } from "../../constants/nodetypes";
import AddAllPropertiesToExecutor from "../AddAllPropertiesToExecutor";

export default async function HaveAllPropertiesOnExecutors(progresFunc: any) {
  const executors = NodesByType(null, NodeTypes.Executor);
  await executors.forEachAsync(async (executor: any, index: any, total: any) => {
    const result = [];
    const steps = AddAllPropertiesToExecutor({
      currentNode: executor
    });
    result.push(...steps);

    graphOperation(result)(GetDispatchFunc(), GetStateFunc());
    await progresFunc(index / total);
  });

}
