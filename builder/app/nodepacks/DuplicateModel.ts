import {
	graphOperation,
	ADD_NEW_NODE,
	GetNodeProp,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeById
} from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import { NodeProperties } from '../constants/nodetypes';

export default function DuplicateModel(args: any) {
	let { model, mapTargetName } = args;

	graphOperation([
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: GetNodeProp(model, NodeProperties.NODEType),
					properties: {
						...GetNodeById(model).properties,
						[NodeProperties.Groups]: null,
						[NodeProperties.UIText]: `${GetNodeProp(model, NodeProperties.UIText)} ${mapTargetName}`
					},
					callback: (node: Node) => {
						if (args.callback) {
							args.callback(node);
						}
					}
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
}
