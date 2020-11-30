import { NodesByType, GetNodeProp, graphOperation, GetDispatchFunc, GetStateFunc } from "../../actions/uiActions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import AddCopyPropertiesToExecutor from "../AddCopyPropertiesToExecutor";

export default async function AddCopyCommandToExecutors(progresFunc:any) {

  const executors = NodesByType(null, NodeTypes.Executor);

  await executors.forEachAsync(async (executor:any, index:any, total:any) => {
    const result = [];
    const steps = AddCopyPropertiesToExecutor({
      currentNode: executor,
      executor: GetNodeProp(executor, NodeProperties.Executor)
    });
    result.push(...steps);
    graphOperation(result)(GetDispatchFunc(), GetStateFunc());
    await progresFunc(index / total);
  });

}
