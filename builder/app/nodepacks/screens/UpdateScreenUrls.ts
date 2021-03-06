import { convertToURLRoute, GetNodeProp } from '../../methods/graph_methods';
import { NodeTypes, NodeProperties } from '../../constants/nodetypes';
import {
	UPDATE_NODE_PROPERTY,
	GetNodeTitle,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	NodesByType,
	GetScreenUrl
} from '../../actions/uiActions';
import { Node } from '../../methods/graph_types';

export default async function UpdateScreenUrls(args: any = {}) {
	let screens = NodesByType(null, NodeTypes.Screen);

	const result = [
		...screens.filter((x: any) => !GetNodeProp(x, NodeProperties.IsHomeView)).map((screen: Node) => {
			return {
				operation: UPDATE_NODE_PROPERTY,
				options() {
					return {
						id: screen.id,
						properties: {
							[NodeProperties.HttpRoute]: GetScreenUrl(screen)
						}
					};
				}
			};
		})
	];

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
}
