import {
	GetNodeByProperties,
	graphOperation,
	GetNodeTitle,
	GetNodeProp,
	NodesByType,
	GetDispatchFunc,
	GetStateFunc
} from '../../actions/uiactions';
import { NodeTypes, NodeProperties } from '../../constants/nodetypes';
import CreateStandardClaimService from '../CreateStandardClaimService';
import AddCopyPropertiesToExecutor from '../AddCopyPropertiesToExecutor';

export default function CreateClaimService() {
	const claimService = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.ClaimService
	});
	if (!claimService) {
		let claimServiceExecutor: any = null;
		const agent = NodesByType(null, NodeTypes.Model)
			.sort((b: Node, a: Node) => {
				let defaultAgent = GetNodeProp(a, NodeProperties.DefaultAgent);
				if (defaultAgent) {
					return 1;
				}
				defaultAgent = GetNodeProp(b, NodeProperties.DefaultAgent);
				if (defaultAgent) {
					return -1;
				}
				return 0;
			})
			.find((x: any) => GetNodeProp(x, NodeProperties.IsAgent) && !GetNodeProp(x, NodeProperties.IsUser));

		graphOperation(
			[
				...CreateStandardClaimService({
					modelName: GetNodeTitle(agent),
					model: agent.id,
					user: GetNodeProp(agent, NodeProperties.UIUser),
					callback: (claimServiceContext: any) => {
						claimServiceExecutor = claimServiceContext.executor;
					}
				}),
				(currentGraph: any) => {
					const steps = AddCopyPropertiesToExecutor({
						currentNode: claimServiceExecutor,
						executor: GetNodeProp(claimServiceExecutor, NodeProperties.Executor, currentGraph)
					});
					return steps;
				}
			],
			null,
			'standard-claim-service'
		)(GetDispatchFunc(), GetStateFunc());
	}
}
