import {
	GetModelPropertyChildren,
	graphOperation,
	ADD_NEW_NODE,
	GetCurrentGraph,
	GetNodeProp,
	GetDispatchFunc,
  GetStateFunc
} from '../actions/uiActions';
import { GraphLink, Node } from '../methods/graph_types';
import { GetLinkBetween } from '../methods/graph_methods';
import { NodeProperties, LinkProperties } from '../constants/nodetypes';

export default function DuplicateModelsProperties(args: any) {
	let { model, currentNodeId } = args;
	let children = GetModelPropertyChildren(model, {
		skipLogicalChildren: true
	});
	graphOperation(
		children.map((child: Node) => {
			return {
				operation: ADD_NEW_NODE,
				options() {
					let link: GraphLink = GetLinkBetween(model, child.id, GetCurrentGraph());
					return {
						nodeType: GetNodeProp(child, NodeProperties.NODEType),
						linkProperties: {
							properties: {
								...link ? link.properties : LinkProperties.PropertyLink
							}
						},
						parent: currentNodeId,
						properties: {
							[NodeProperties.UIText]: GetNodeProp(child, NodeProperties.UIText)
						},
						groupProperties: {}
					};
				}
			};
		})
	)(GetDispatchFunc(), GetStateFunc());
}
