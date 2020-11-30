import {
	GetNodeTitle,
	NEW_MODEL_ITEM_FILTER,
	UPDATE_NODE_PROPERTY,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeById,
	ADD_NEW_NODE,
	GetMethodPropNode,
	GetCurrentGraph,
	CHANGE_NODE_PROPERTY,
	GetMethodProps
} from '../../actions/uiActions';
import { NodeProperties, LinkType, LinkProperties, NodeTypes } from '../../constants/nodetypes';
import { GetNodeLinkedTo } from '../../methods/graph_methods';
import { FunctionTemplateKeys } from '../../constants/functiontypes';
import { SelectPropertiesOnModelFilter } from '../batch/SelectAllOnModelFilters';

export default async function AddMethodFilterToMethod(arg: { method: string }) {
	if (!arg.method) {
		return;
	}
	let graph = GetCurrentGraph();
	const methods = [ GetNodeById(arg.method) ].filter(
		(x: { id: any }) =>
			!GetNodeLinkedTo(null, {
				id: x.id,
				componentType: NodeTypes.ModelFilter
			})
	);

	await methods.forEachAsync(async (method: any, index: any, length: any) => {
		const result = [];
		let nodeInstance: any = null;
		let agent = GetMethodPropNode(graph, method, FunctionTemplateKeys.Agent);
		let model = GetMethodPropNode(graph, method, FunctionTemplateKeys.Model);
		result.push(
			{
				operation: ADD_NEW_NODE,
				options: () => {
					return {
						parent: method.id,
						nodeType: NodeTypes.ModelFilter,
						groupProperties: {},
						properties: {
							[NodeProperties.UIText]: `${GetNodeTitle(method)} Model Filter`,
							[NodeProperties.FilterAgent]: agent ? agent.id : null,
							[NodeProperties.FilterModel]: model ? model.id : null
						},
						linkProperties: {
							properties: { ...LinkProperties.FunctionOperator }
						},
						links: [
							{
								target: agent ? agent.id : null,
								linkProperties: {
									properties: { ...LinkProperties.AgentTypeLink }
								}
							},
							{
								target: model ? model.id : null,
								linkProperties: {
									properties: { ...LinkProperties.ModelTypeLink }
								}
							}
						],
						callback: (node: any) => {
							nodeInstance = node;
						}
					};
				}
			},
			() => {
				let methodProps = GetMethodProps(method) || {};
				methodProps[FunctionTemplateKeys.ModelFilter] = nodeInstance.id;
				return {
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: NodeProperties.MethodProps,
						id: method.id,
						value: methodProps
					}
				};
			}
		);

		graphOperation(result)(GetDispatchFunc(), GetStateFunc());
		SelectPropertiesOnModelFilter({ modelFilter: nodeInstance.id });
	});
}

AddMethodFilterToMethod.title = 'Add Model Filter to methods';
AddMethodFilterToMethod.description = 'Adds default model filters to all the methods';
