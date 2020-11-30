import UpdateModelAndGoBack from '../UpdateModelAndGoBack';
import {
	GetMethodNodeProp,
	GetNodeById,
	ADD_LINK_BETWEEN_NODES,
	AddLinkBetweenNodes,
	CreateNewNode,
	GetNodeByProperties,
	GetNodeProp
} from '../../actions/uiActions';
import { FunctionTemplateKeys } from '../../constants/functiontypes';
import {
	LinkProperties,
	LinkPropertyKeys,
	NodeProperties,
	NodeTypes,
	UIActionMethodParameterTypes,
	UIActionMethods
} from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';

export default function AppendPostMethod(args: any = {}) {
	if (!args.method) {
		throw 'missing method for appending a post method';
	}
	if (!args.handler) {
		throw 'missing handler';
	}
	let model =
		GetMethodNodeProp(GetNodeById(args.method), FunctionTemplateKeys.Model) ||
		GetMethodNodeProp(GetNodeById(args.method), FunctionTemplateKeys.ModelOutput);
	return [
		() => {
			return [
				() => {
					let uiMethodNode: Node = GetNodeByProperties({
						[NodeProperties.UIActionMethod]: UIActionMethods.StoreResultInReducer,
						[NodeProperties.NODEType]: NodeTypes.UIMethod
					});
					let res: any[] = [];
					if (!uiMethodNode) {
						res.push(() => {
							return CreateNewNode(
								{
									[NodeProperties.UIActionMethod]: UIActionMethods.StoreResultInReducer,
									[NodeProperties.UIText]: UIActionMethods.StoreResultInReducer,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								},
								(node: Node) => {
									uiMethodNode = node;
								}
							);
						});
					}
					res.push(() => {
						return AddLinkBetweenNodes(args.handler(), uiMethodNode.id, {
							...LinkProperties.UIMethod,
							[LinkPropertyKeys.ModelKey]: model,
							parameters: [
								{
									type: UIActionMethodParameterTypes.FunctionParameter,
									value: 'a'
								},
								{
									type: UIActionMethodParameterTypes.ModelKey,
									value: model
								},
								{
									type: UIActionMethodParameterTypes.Navigate
								}
							]
						});
					});

					return res;
				}
			];
		}
		// ...UpdateModelAndGoBack({
		// 	viewPackages,
		// 	model: model,
		// 	callback: (updateContext: any) => {
		// 		dataChain = updateContext.entry;
		// 	}
		// }),
		// function() {
		// 	return {
		// 		operation: ADD_LINK_BETWEEN_NODES,
		// 		options: function() {
		// 			return {
		// 				source: args.handler(),
		// 				target: dataChain,
		// 				properties: { ...LinkProperties.DataChainLink }
		// 			};
		// 		}
		// 	};
		// }
	];
}
