import { GetStateFunc, GetDispatchFunc, graphOperation, NodeTypes, NodesByType } from '../../actions/uiActions';
import ApplyAgentTemplates from './ApplyAgentTemplates';
import { GetNodeProp } from '../../methods/graph_methods';
import { NodeProperties } from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';

export default function ApplyTemplates(filter: any) {
	filter = filter || (() => true);
	let result: any = [];
	let models = NodesByType(null, NodeTypes.Model).filter((x: Node) => !GetNodeProp(x, NodeProperties.IsUser));
	let agents = models.filter((x: Node) => GetNodeProp(x, NodeProperties.IsAgent));
	agents.forEach((agent: Node) => {
		let agentId = agent.id;
		models.filter((x: Node) => x.id !== agent.id).filter(filter).forEach((model: Node) => {
      let modelId = model.id;

			result.push(...ApplyAgentTemplates({ agentId, modelId }));
		});
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
