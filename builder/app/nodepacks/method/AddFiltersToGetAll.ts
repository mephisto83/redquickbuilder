import {
	NodesByType,
	GetNodeProp,
	GetNodeTitle,
	NEW_MODEL_ITEM_FILTER,
	GetMethodNodeProp,
	UPDATE_NODE_PROPERTY,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc
} from '../../actions/uiactions';
import { MethodFunctions, FunctionTemplateKeys } from '../../constants/functiontypes';
import { NodeProperties, Methods, LinkType, LinkProperties, NodeTypes } from '../../constants/nodetypes';
import { GetNodeLinkedTo } from '../../methods/graph_methods';

export default async function AddFiltersToGetAll(progresFunc: any) {
	const methods = NodesByType(null, NodeTypes.Method)
		.filter((x: any) => (MethodFunctions[GetNodeProp(x, NodeProperties.FunctionType)] || {}).method === Methods.GetAll)
		.filter(
			(x: { id: any; }) =>
				!GetNodeLinkedTo(null, {
					id: x.id,
					link: LinkType.ModelItemFilter
				})
		);

	await methods.forEachAsync(async (method: any, index: any, length: any) => {
		const result = [];
		let nodeInstance: any = null;
		result.push(
			{
				operation: NEW_MODEL_ITEM_FILTER,
				options: {
					parent: method.id,
					groupProperties: {},
					linkProperties: {
						properties: { ...LinkProperties.ModelItemFilter }
					},
					callback: (node: any) => {
						nodeInstance = node;
					}
				}
			},
			() => ({
				operation: UPDATE_NODE_PROPERTY,
				options() {
					return {
						id: nodeInstance.id,
						properties: {
							[NodeProperties.UIText]: `${GetNodeTitle(method)} Filter`
						}
					};
				}
			})
		);

		graphOperation(result)(GetDispatchFunc(), GetStateFunc());

		await progresFunc(index / length);
	});
}

AddFiltersToGetAll.title = 'Add Filters to GetALL methods';
AddFiltersToGetAll.description = 'Adds default filters to all the get all methods';
