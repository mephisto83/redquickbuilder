import {
	graphOperation,
	ADD_NEW_NODE,
	CHANGE_NODE_PROPERTY,
	ADD_LINK_BETWEEN_NODES,
	GetDispatchFunc,
	GetStateFunc
} from '../actions/uiactions';
import { NodeTypes, NodeProperties, LinkProperties } from '../constants/nodetypes';
import { GetNodeProp } from '../methods/graph_methods';
import { Node } from '../methods/graph_types';

export default function BuildReferenceObject(args: any) {
	let { model, model2 } = args;
	let newModel: any;
	let newModel1: any;
	let newModel2: any;
	graphOperation([
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.Model,
					properties: {
						[NodeProperties.UIText]: `${GetNodeProp(model, NodeProperties.UIText)} to ${GetNodeProp(
							model2,
							NodeProperties.UIText
						)}`
					},
					groupProperties: {},
					callback: (node: Node) => {
						newModel = node.id;
					}
				};
			}
		},
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
					parent: newModel,
					properties: {
						[NodeProperties.UIText]: GetNodeProp(model, NodeProperties.UIText)
					},
					groupProperties: {},
					callback(node: Node) {
						newModel1 = node.id;
					}
				};
			}
		},
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
					parent: newModel,
					properties: {
						[NodeProperties.UIText]: GetNodeProp(model2, NodeProperties.UIText)
					},
					groupProperties: {},
					callback(node: Node) {
						newModel2 = node.id;
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
					value: model
				};
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					target: model,
					source: newModel1,
					properties: { ...LinkProperties.ModelTypeLink }
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				return {
					prop: NodeProperties.UIModelType,
					id: newModel2,
					value: model2
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				return {
					prop: NodeProperties.UseModelAsType,
					id: newModel2,
					value: true
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
					target: model2,
					source: newModel2,
					properties: { ...LinkProperties.ModelTypeLink }
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
}
