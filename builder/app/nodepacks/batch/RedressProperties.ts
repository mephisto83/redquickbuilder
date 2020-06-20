import { NodesByType } from '../../methods/graph_methods';
import { NodeTypes, NodeProperties } from '../../constants/nodetypes';
import {
	GetCurrentGraph,
	graphOperation,
	UPDATE_NODE_DIRTY,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeProp,
	UPDATE_NODE_PROPERTY
} from '../../actions/uiactions';
import { Node } from '../../methods/graph_types';

export default function RedressProperties() {
	let graph = GetCurrentGraph();
	let result: any[] = [];
	let properties = [
		NodeProperties.HttpRoute,
		NodeProperties.Label,
		NodeProperties.AgentName,
		NodeProperties.CodeName,
		NodeProperties.UIText,
		NodeProperties.UIName,
		NodeProperties.ValueName
	];
	let models = NodesByType(graph, NodeTypes.Model);
	models.forEach((node: Node) => {
		properties.forEach((key) => {
			result.push(
				...[
					{
						operation: UPDATE_NODE_DIRTY,
						options: {
							id: node.id,
							prop: key,
							value: false
						}
					}
				]
			);
		});
		result.push({
			operation: UPDATE_NODE_PROPERTY,
			options: {
				id: node.id,
				properties: { [NodeProperties.UIText]: GetNodeProp(node, NodeProperties.UIText) }
			}
		});
	});
	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}

RedressProperties.description = 'Take text properties and reapply text chains';
