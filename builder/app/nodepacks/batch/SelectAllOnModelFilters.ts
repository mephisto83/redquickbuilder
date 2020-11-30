import {
	NodesByType,
	GetNodeProp,
	GetModelPropertyChildren,
	CHANGE_NODE_PROPERTY,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeById
} from '../../actions/uiActions';
import { NodeTypes, NodeProperties } from '../../constants/nodetypes';

export default async function SelectAllOnModelFilters(progresFunc: any) {
	const filters = NodesByType(null, NodeTypes.ModelFilter);
	await filters.forEachAsync(async (filter: any, index: any, length: any) => {
		const model = GetNodeProp(filter, NodeProperties.FilterModel);
		const propnodes = GetModelPropertyChildren(model);
		const fprops = GetNodeProp(filter, NodeProperties.FilterPropreties) || {};
		propnodes.forEach((node: any) => {
			fprops[node.id] = true;
		});
		graphOperation([
			{
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.FilterPropreties,
					id: filter.id,
					value: fprops
				}
			}
		])(GetDispatchFunc(), GetStateFunc());
		await progresFunc(index / length);
	});
}

export async function SelectPropertiesOnModelFilter(args: { modelFilter: string }) {
	const filters = [ GetNodeById(args.modelFilter) ];
	await filters.forEachAsync(async (filter: any, index: any, length: any) => {
		const model = GetNodeProp(filter, NodeProperties.FilterModel);
		const propnodes = GetModelPropertyChildren(model);
		const fprops = GetNodeProp(filter, NodeProperties.FilterPropreties) || {};
		propnodes.forEach((node: any) => {
			fprops[node.id] = true;
		});
		graphOperation([
			{
				operation: CHANGE_NODE_PROPERTY,
				options: {
					prop: NodeProperties.FilterPropreties,
					id: filter.id,
					value: fprops
				}
			}
		])(GetDispatchFunc(), GetStateFunc());
	});
}
