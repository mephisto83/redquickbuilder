import * as UIA from '../actions/uiactions';
import { NodeProperties, LinkEvents } from '../constants/nodetypes';
import { addValidatator, createEventProp, createExecutor } from '../methods/graph_methods';

export default function AddAllPropertiesToExecutor(args: any = {}) {
	let { currentNode } = args;

	var propertyNodes = UIA.GetModelPropertyChildren(UIA.GetNodeProp(currentNode, UIA.NodeProperties.ExecutorModel), {
		skipLogicalChildren: true
	}).toNodeSelect();

	return addProperty(
		propertyNodes.filter((x: any) => !UIA.GetNodeProp(x.value, NodeProperties.IsDefaultProperty)).map((t: any) => {
			return t.value;
		}),
		currentNode
	);
}

AddAllPropertiesToExecutor.description = 'Add all properties to executor (execpt default properties)';

let addProperty = (values: any, currentNode: any) => {
	let executor = UIA.GetNodeProp(currentNode, NodeProperties.Executor) || createExecutor();
	var operation = values
		.map((value: any) => {
			var id = currentNode.id;
			executor = addValidatator(executor, { id: value });

			return [
				{
					operation: UIA.CHANGE_NODE_PROPERTY,
					options: function() {
						return {
							id: currentNode.id,
							prop: NodeProperties.Executor,
							value: executor,
							callback: (_updatedExecutor: any) => {
								executor = _updatedExecutor;
							}
						};
					}
				},
				{
					operation: UIA.ADD_LINK_BETWEEN_NODES,
					options: function() {
						return {
							target: value,
							source: id,
							properties: {
								...UIA.LinkProperties.ExecutorModelLink,
								...createEventProp(LinkEvents.Remove, {
									function: 'OnRemoveExecutorPropConnection'
								})
							}
						};
					}
				}
			];
		})
		.flatten();
	return operation;
};
