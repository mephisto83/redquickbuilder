import { ADD_NEW_NODE, GetNodeTitle } from '../actions/uiActions';
import { NodeTypes, NodeProperties, LinkProperties } from '../constants/nodetypes';

export default function(args: any = {}) {
	let { node, viewPackages } = args;
	return [
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.LifeCylceMethodInstance,
					parent: node,
					linkProperties: {
						properties: { ...LinkProperties.LifeCylceMethodInstance }
					},
					groupProperties: {},
					properties: {
						[NodeProperties.UIText]: `${GetNodeTitle(node)} Instance`,
						[NodeProperties.AutoDelete]: {
							properties: {
								[NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
							}
						},
						...viewPackages
					},
					callback: (contextNode: any) => {
						if (args.callback) {
							args.callback(contextNode);
						}
					}
				};
			}
		}
	];
}
