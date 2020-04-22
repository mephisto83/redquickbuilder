import { GetNodesLinkedTo } from '../methods/graph_methods';
import * as UIA from '../actions/uiactions';
import { LinkType, NodeProperties, LinkProperties, NodeTypes } from '../constants/nodetypes';

export default function CopyPermissionConditions(args: any = {}) {
	let { permission } = args;
	const { node } = args;

	const conditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
		id: permission,
		link: LinkType.Condition
	}).map((v: any) => UIA.GetNodeProp(v, NodeProperties.Condition));
	const method = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
		id: permission,
		link: LinkType.FunctionOperator
	}).find((x: any) => x);
	const currentConditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
		id: node,
		link: LinkType.Condition
	});
	const currentNodeMethod = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
		id: node,
		link: LinkType.FunctionOperator
	}).find((x: any) => x);
	const functionType = UIA.GetNodeProp(method, NodeProperties.FunctionType);
	const currentNodeMethodFunctionType = UIA.GetNodeProp(currentNodeMethod, NodeProperties.FunctionType);
	const result: { operation: string; options: (() => { id: any; }) | (() => { nodeType: string; properties: { [x: string]: any; }; parent: any; groupProperties: {}; linkProperties: { properties: any; }; }); }[] = [];
	currentConditions.forEach((cc: { id: any; }) => {
		result.push({
			operation: UIA.REMOVE_NODE,
			options() {
				return {
					id: cc.id
				};
			}
		});
	});
	conditions.forEach((condition: any) => {
		result.push({
			operation: UIA.ADD_NEW_NODE,
			options() {
				const temp = JSON.parse(JSON.stringify(condition));
				temp.methods[currentNodeMethodFunctionType] = temp.methods[functionType];
				if (functionType !== currentNodeMethodFunctionType) delete temp.methods[functionType];
				return {
					nodeType: NodeTypes.Condition,
					properties: {
						[NodeProperties.Condition]: temp,
						[NodeProperties.Pinned]: false
					},
					parent: node,
					groupProperties: {},
					linkProperties: {
						properties: {
							...LinkProperties.ConditionLink
						}
					}
				};
			}
		});
	});

	return result;
}
