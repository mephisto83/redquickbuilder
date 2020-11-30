import {
	graphOperation,
	ADD_NEW_NODE,
	GetNodeTitle,
	CHANGE_NODE_PROPERTY,
	ADD_LINK_BETWEEN_NODES,
	GetDispatchFunc,
	GetStateFunc
} from '../actions/uiActions';
import { NodeTypes, LinkProperties, NodeProperties } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';

export default function AddMappingProperty(args: any) {
	let { newNodeId, mapTargetName, mapTarget } = args;
	let newModel1: any;
	graphOperation([
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.Property,
					linkProperties: {
						properties: {
							...LinkProperties.PropertyLink
						}
					},
					parent: newNodeId,
					properties: {
						[NodeProperties.UIText]: mapTargetName || GetNodeTitle(mapTarget)
					},
					groupProperties: {},
					callback(node: Node) {
						newModel1 = node.id;
					}
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				return {
					prop: NodeProperties.UIModelType,
					id: newModel1,
					value: mapTarget
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				return {
					prop: NodeProperties.UseModelAsType,
					id: newModel1,
					value: true
				};
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					target: mapTarget,
					source: newModel1,
					properties: { ...LinkProperties.ModelTypeLink }
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
}
