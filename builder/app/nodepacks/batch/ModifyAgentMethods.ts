import { NodesByType, GetNodesByProperties } from '../../methods/graph_methods';
import { NodeTypes, NodeProperties } from '../../constants/nodetypes';
import { GetCurrentGraph } from '../../actions/uiActions';
import { FunctionTypes } from '../../constants/functiontypes';
import { Node } from '../../methods/graph_types';
import AddMethodFilterToMethod from '../method/AddFilterToModelFilter';

export default function ModifyAgentMethods(progressFunc: any) {
	let graph = GetCurrentGraph();

	let methods = GetNodesByProperties(
		{
			[NodeProperties.MethodType]: FunctionTypes.Get_Default_Object_For_Agent,
			[NodeProperties.NODEType]: NodeTypes.Method
		},
		graph
	);

	methods.forEach((method: Node) => {
		AddMethodFilterToMethod({ method: method.id });
	});
}
