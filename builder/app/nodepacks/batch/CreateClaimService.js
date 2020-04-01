import { GetNodeByProperties, graphOperation, GetNodeTitle, GetNodeProp, NodesByType, GetDispatchFunc, GetStateFunc } from "../../actions/uiactions";
import { NodeTypes, NodeProperties } from "../../constants/nodetypes";
import CreateStandardClaimService from "../CreateStandardClaimService";
import AddCopyPropertiesToExecutor from "../AddCopyPropertiesToExecutor";

export default function CreateClaimService() {
  const claimService = GetNodeByProperties({
    [NodeProperties.NODEType]: NodeTypes.ClaimService
  });
  if (!claimService) {
    let claimServiceExecutor = null;
    const agent = NodesByType(null, NodeTypes.Model).find(x => GetNodeProp(x, NodeProperties.IsAgent) && !GetNodeProp(x, NodeProperties.IsUser))

    graphOperation(
      [...CreateStandardClaimService({
        modelName: GetNodeTitle(agent),
        model: agent.id,
        user: GetNodeProp(agent, NodeProperties.UIUser),
        callback: (claimServiceContext) => {
          claimServiceExecutor = claimServiceContext.executor;
        }
      }), (currentGraph) => {
        const steps = AddCopyPropertiesToExecutor({
          currentNode: claimServiceExecutor,
          executor: GetNodeProp(claimServiceExecutor, NodeProperties.Executor, currentGraph)
        });
        return steps;
      }], null, 'standard-claim-service'
    )(GetDispatchFunc(), GetStateFunc());;
  }
}
