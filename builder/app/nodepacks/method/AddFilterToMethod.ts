import {
	GetNodeTitle,
	NEW_MODEL_ITEM_FILTER,
	UPDATE_NODE_PROPERTY,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeById
} from '../../actions/uiActions';
import { NodeProperties, LinkType, LinkProperties } from '../../constants/nodetypes';
import { GetNodeLinkedTo } from '../../methods/graph_methods';

export default async function AddFiltersToMethod(arg: { method: string }) {
	if (!arg.method) {
		return;
	}
	const methods = [ GetNodeById(arg.method) ].filter(
		(x: { id: any }) =>
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
	});
}

AddFiltersToMethod.title = 'Add Filters to methods';
AddFiltersToMethod.description = 'Adds default filters to all the methods';
