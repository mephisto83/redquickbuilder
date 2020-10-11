import { ComponentTypeKeys } from '../../constants/componenttypes';
import AddComponent from '../AddComponent';
import AddEvent from '../AddEvent';
import {
	GetNodeByProperties,
	NodeProperties,
	LinkProperties,
	$addComponentApiNodes,
	ComponentApiKeys,
	GetNodeProp,
	GetComponentExternalApiNode,
	AddLinkBetweenNodes,
	CreateNewNode
} from '../../actions/uiactions';
import { DataChainTypeNames } from '../../constants/datachain';
import NavigateToRoute from '../datachain/NavigateToRoute';
import { uuidv4 } from '../../utils/array';
import MenuDataSource from '../datachain/MenuDataSource';
import {
	LinkPropertyKeys,
	NodeTypes,
	UIActionMethodParameterTypes,
	UIActionMethods,
	UITypes
} from '../../constants/nodetypes';
import { Node } from '../../methods/graph_types';
export default function AddMenuComponent(args: any = {}) {
	// node0,node1

	// menu_name, menu_name, index, menu_name, navigate_function
	if (!args.navigate_function) {
		throw new Error('missing navigate_function argument');
	}
	if (!args.menuGeneration) {
		throw new Error('missing menuGeneration argument');
	}
	if (!args.component) {
		throw new Error('missing component arguments');
	} else if (!args.buildMethod) {
		throw new Error('missing buildMethod');
	} else if (!args.eventType) {
		args.eventType =
			GetNodeProp(args.component, NodeProperties.UIType) === UITypes.ReactNative ? 'onPress' : 'onClick';
		args.uiType = args.uiType || GetNodeProp(args.component, NodeProperties.UIType);
	}
	if (!args.eventType) {
		throw new Error('missing eventType');
	}
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};
	const result = [];
	const context = { ...args };
	result.push(
		...AddComponent({
			component: args.component,
			viewPackages,
			uiType: args.uiType,
			componentName: args.componentName,
			componentType: ComponentTypeKeys.Menu,
			callback: (menuContext: { entry: any }) => {
				context.menu = menuContext.entry;
			}
		}),
		() =>
			AddEvent({
				component: context.menu,
				eventType: args.eventType,
				eventTypeHandler: false,
				reverse: true,
				viewPackages,
				skipProperty: false,
				callback: (eventContext: { eventTypeInstanceNode: any }) => {
					context.eventTypeInstanceNode = eventContext.eventTypeInstanceNode;
				}
			}),
		() => {
			return [
				() => {
					let uiMethodNode: Node = GetNodeByProperties({
						[NodeProperties.UIActionMethod]: UIActionMethods.NavigateToRoute,
						[NodeProperties.NODEType]: NodeTypes.UIMethod
					});
					let res: any[] = [];
					if (!uiMethodNode) {
						res.push(() => {
							return CreateNewNode(
								{
									[NodeProperties.UIActionMethod]: UIActionMethods.NavigateToRoute,
									[NodeProperties.UIText]: UIActionMethods.NavigateToRoute,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								},
								(node: Node) => {
									uiMethodNode = node;
								}
							);
						});
					}
					res.push(() => {
						return AddLinkBetweenNodes(context.eventTypeInstanceNode, uiMethodNode.id, {
							...LinkProperties.UIMethod,
							parameters: [
								{
									type: UIActionMethodParameterTypes.FunctionParameter,
									value: 'a'
								},
								{
									type: UIActionMethodParameterTypes.Navigate
								},
								{
									type: UIActionMethodParameterTypes.Routes
								}
							]
						});
					});

					return res;
				}
			];
		},
		// () => {
		// 	const dataChain = GetNodeByProperties({
		// 		[NodeProperties.DataChainTypeName]: DataChainTypeNames.NavigateToRoute,
		// 		[NodeProperties.UIType]: args.uiType
		// 	});
		// 	if (dataChain) {
		// 		return [
		// 			{
		// 				operation: 'ADD_LINK_BETWEEN_NODES',
		// 				options: {
		// 					source: context.eventTypeInstanceNode,
		// 					target: dataChain.id,
		// 					properties: { ...LinkProperties.DataChainLink }
		// 				}
		// 			}
		// 		];
		// 	}
		// 	return NavigateToRoute({
		// 		menunavigate: `Navigate To Route`,
		// 		viewPackages,
		// 		uiType: args.uiType,
		// 		callback: (navigcontext: { entry: any }) => {
		// 			context.navigateDataChain = navigcontext.entry;
		// 		}
		// 	});
		// },
		// () => {
		// 	if (context.navigateDataChain) {
		// 		return [
		// 			{
		// 				operation: 'ADD_LINK_BETWEEN_NODES',
		// 				options: {
		// 					source: context.eventTypeInstanceNode,
		// 					target: context.navigateDataChain,
		// 					properties: { ...LinkProperties.DataChainLink }
		// 				}
		// 			}
		// 		];
		// 	}

		// 	return [];
		// },
		// (graph: any) => {
		// 	const buildMethodDataChain = GetNodeByProperties(
		// 		{
		// 			[NodeProperties.DataChainTypeName]: context.buildMethod,
		// 			[NodeProperties.UIType]: args.uiType
		// 		},
		// 		graph
		// 	);
		// 	if (!buildMethodDataChain) {
		// 		return MenuDataSource({
		// 			uiType: args.uiType,
		// 			buildMethod: context.buildMethod,
		// 			menu_name: `${context.buildMethod} ${args.uiType}`,
		// 			menuGeneration: context.menuGeneration,
		// 			navigate_function: context.navigate_function,
		// 			component: context.component,
		// 			callback: (menuDataSourceContext: { entry: any; }) => {
		// 				context.menuDataSourceContext = menuDataSourceContext.entry;
		// 			}
		// 		});
		// 	}
		// 	context.menuDataSourceContext = buildMethodDataChain.id;
		// 	return [];
		// },
		(gg: any) => {
			const valueApi = GetComponentExternalApiNode(ComponentApiKeys.Value, context.menu, gg);
			if (valueApi) {
				context.externalApi = valueApi.id;
				return [];
			}
			return $addComponentApiNodes(
				context.menu,
				ComponentApiKeys.Value,
				null,
				viewPackages,
				(apiNodeContext: { externalApi: any }) => {
					context.externalApi = apiNodeContext.externalApi;
				}
			);
		},
		() => {
			return [
				() => {
					let uiMethodNode: Node = GetNodeByProperties({
						[NodeProperties.UIActionMethod]: UIActionMethods.GetMenuDataSource,
						[NodeProperties.NODEType]: NodeTypes.UIMethod
					});
					let res: any[] = [];
					if (!uiMethodNode) {
						res.push(() => {
							return CreateNewNode(
								{
									[NodeProperties.UIActionMethod]: UIActionMethods.GetMenuDataSource,
									[NodeProperties.UIText]: UIActionMethods.GetMenuDataSource,
									[NodeProperties.NODEType]: NodeTypes.UIMethod
								},
								(node: Node) => {
									uiMethodNode = node;
								}
							);
						});
					}
					res.push(() => {
						return AddLinkBetweenNodes(context.externalApi, uiMethodNode.id, {
							...LinkProperties.UIMethod,
							parameters: [
								{
									type: UIActionMethodParameterTypes.GetMenuSource
								},
								{
									type: UIActionMethodParameterTypes.RedGraph
								}
							]
						});
					});

					return res;
				}
			];
		},
		// () => [
		// 	{
		// 		operation: 'ADD_LINK_BETWEEN_NODES',
		// 		options: {
		// 			source: context.externalApi,
		// 			target: context.menuDataSourceContext,
		// 			properties: { ...LinkProperties.DataChainLink }
		// 		}
		// 	}
		// ],
		() => {
			if (args.callback) {
				context.entry = context.menu;
				args.callback(context);
			}
			return [];
		}
	);

	return result;
}
