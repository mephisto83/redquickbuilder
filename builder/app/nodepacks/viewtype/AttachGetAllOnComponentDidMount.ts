import StoreModelArrayStandard from '../StoreModelArrayStandard';
import {
	GetViewTypeModel,
	GetNodeTitle,
	ADD_LINK_BETWEEN_NODES,
	GetNodeByProperties,
	AddLinkBetweenNodes,
	GetNodeProp,
	CreateNewNode
} from '../../actions/uiactions';
import AddComponentDidMountToViewTypeComponent from './AddComponentDidMountToViewTypeComponent';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import {
	LinkProperties,
	LinkPropertyKeys,
	NodeProperties,
	NodeTypes,
	UIActionMethodParameterTypes,
	UIActionMethods
} from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';

export default function AttachGetAllOnComponentDidMount(args: any = {}) {
	const result = [];
	const { node, functionToLoadModels, viewPackages, uiType } = args;
	const model = GetViewTypeModel(node);
	let storeModelArrayDC: any = null;
	let didMountContext: any = null;

	if (!model) {
		throw new Error('execpted model missing?');
	}

	result.push(
		// ...StoreModelArrayStandard({
		// 	model,
		// 	uiType,
		// 	viewPackages,
		// 	modelText: `${GetNodeTitle(model)} State`,
		// 	state_key: `${GetNodeTitle(model)} State`,
		// 	callback: (storeModelArrayContext: any) => {
		// 		storeModelArrayDC = storeModelArrayContext.entry;
		// 	}
		// }),

		...AddComponentDidMountToViewTypeComponent({
			...args,
			callback: (didMountContextArgs: any) => {
				didMountContext = didMountContextArgs;
			}
		}),
		(graph: any) => {
			if (!didMountContext.skip) {
				return ConnectLifecycleMethod({
					target: functionToLoadModels,
					source: didMountContext.lifeCycleInstance.id,
					graph
				});
			}
			return [];
		},
		() => {
			return [
				() => {
					let uiMethodNode: Node = GetNodeByProperties({
						[NodeProperties.UIActionMethod]: UIActionMethods.StoreModelArray,
						[NodeProperties.NODEType]: NodeTypes.UIMethod
					});
          let stateKey: Node = GetNodeByProperties({
            [NodeProperties.NODEType]: NodeTypes.StateKey,
            [NodeProperties.StateKey]: GetNodeProp(node, NodeProperties.Model)
          });
          let res: any[] = [];
          if (!stateKey) {
            res.push(() => {
              return CreateNewNode(
                {
                  [NodeProperties.StateKey]: GetNodeProp(node, NodeProperties.Model),
                  [NodeProperties.UIText]: `${GetNodeTitle(
                    GetNodeProp(node, NodeProperties.Model)
                  )} State`,
                  [NodeProperties.NODEType]: NodeTypes.StateKey
                },
                (node: Node) => {
                  stateKey = node;
                }
              );
            });
          }

					if (!uiMethodNode) {
						res.push(() => {
							return CreateNewNode(
								{
									[NodeProperties.UIActionMethod]: UIActionMethods.StoreModelArray,
									[NodeProperties.UIText]: UIActionMethods.StoreModelArray,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								},
								(node: Node) => {
									uiMethodNode = node;
								}
							);
						});
					}
					res.push(() => {
						return AddLinkBetweenNodes(didMountContext.lifeCycleInstance.id, uiMethodNode.id, {
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
									type: UIActionMethodParameterTypes.StateKey,
									value: stateKey.id
								}
							]
						});
					});
          res.push(() => {
            return AddLinkBetweenNodes(didMountContext.lifeCycleInstance.id, uiMethodNode.id, {
              ...LinkProperties.StateKey,
              stateKey: stateKey.id
            });
          });
					return res;
				}
			];
		}//,
		// () => {
		// 	const newLocal = {
		// 		operation: ADD_LINK_BETWEEN_NODES,
		// 		options() {
		// 			return {
		// 				target: storeModelArrayDC,
		// 				source: didMountContext.lifeCycleInstance.id,
		// 				properties: { ...LinkProperties.DataChainLink }
		// 			};
		// 		}
		// 	};
		// 	return [ newLocal ];
		// }
	);
	return result;
}
