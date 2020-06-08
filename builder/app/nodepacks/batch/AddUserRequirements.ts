import {
	GetNodeByProperties,
	executeGraphOperations,
	GetNodeTitle,
	GetNodeById,
	GetDispatchFunc,
	GetStateFunc,
	graphOperation,
	ADD_NEW_NODE,
	NodeTypes,
	GetCurrentGraph,
	addInstanceFunc,
	ADD_LINK_BETWEEN_NODES
} from '../../actions/uiactions';
import { NodeProperties, LinkType, LinkProperties } from '../../constants/nodetypes';
import { MethodFunctions, FunctionTypes, HTTP_METHODS } from '../../constants/functiontypes';
import { CreateAgentFunction } from '../../constants/nodepackages';
import { GetNodesLinkedTo, GetNodeProp, GetNodeLinkedTo, GetNodesByProperties } from '../../methods/graph_methods';
import { SCREEN_COMPONENT_EVENTS, ComponentLifeCycleEvents } from '../../constants/componenttypes';
import StoreUserInDataLake from '../StoreUserInDataLake';
import { Node } from '../../methods/graph_types';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';

export default function AddUserRequirements() {
	let userModel = GetNodeByProperties({
		[NodeProperties.IsUser]: true
	});

	if (!userModel) {
		throw new Error('user Model is not found');
	}

	executeGraphOperations(
		[ userModel ].map((model) => {
			let functionName = MethodFunctions[FunctionTypes.Get_Object_User_Object].titleTemplate(
				GetNodeTitle(model),
				GetNodeTitle(model)
			);

			return {
				node: userModel,
				type: FunctionTypes.Get_Object_User_Object,
				method: {
					method: CreateAgentFunction({
						nodePackageType: functionName,
						methodType: MethodFunctions[FunctionTypes.Get_Object_User_Object].method,
						model: model,
						parentId: null,
						agent: userModel,
						httpMethod: HTTP_METHODS.GET,
						functionType: FunctionTypes.Get_Object_User_Object,
						functionName
					})
				},
				methodType: FunctionTypes.Get_Object_User_Object
			};
		})
	)(GetDispatchFunc(), GetStateFunc());
	let graph = GetCurrentGraph();

	let homeDashboard = GetNodeByProperties(
		{
			[NodeProperties.IsHomeLaunchView]: true,
			[NodeProperties.NODEType]: NodeTypes.Screen
		},
		graph
	);

	if (homeDashboard) {
		let screenOptions: Node[] = GetNodesLinkedTo(graph, {
			id: homeDashboard.id,
			componentType: NodeTypes.ScreenOption
		});
		screenOptions.forEach((node: Node) => {
			let componentDidMountNode: any;
			let dataChain: any;
			graphOperation(
				StoreUserInDataLake({
					user: GetNodeTitle(userModel),
					viewPackages: null,
					userId: userModel.id,
					callback: (res: { entry: string }) => {
						dataChain = res.entry;
					}
				})
			)(GetDispatchFunc(), GetStateFunc());

			graphOperation(
				SCREEN_COMPONENT_EVENTS.filter(
					(x) =>
						!GetNodesLinkedTo(graph, {
							id: node.id,
							link: LinkType.LifeCylceMethod
						}).find((_y: Node) => GetNodeProp(_y, NodeProperties.EventType) === x)
				).map((t) => ({
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.LifeCylceMethod,
							properties: {
								[NodeProperties.EventType]: t,
								[NodeProperties.Pinned]: false,
								[NodeProperties.UIText]: `${t}`
							},
							links: [
								{
									target: node.id,
									linkProperties: {
										properties: {
											...LinkProperties.LifeCylceMethod
										}
									}
								}
							],
							callback: (_new: Node) => {
								if (ComponentLifeCycleEvents.ComponentDidMount === t) {
									componentDidMountNode = _new;
								}
							}
						};
					}
				}))
			)(GetDispatchFunc(), GetStateFunc());
			if (componentDidMountNode) {
				let _instanceNode: any;
				graphOperation([
					{
						operation: ADD_NEW_NODE,
						options: addInstanceFunc(
							componentDidMountNode,
							(_instance: Node) => {
								_instanceNode = _instance;
							},
							{ lifeCycle: true }
						)
					}
				])(GetDispatchFunc(), GetStateFunc());

				if (_instanceNode) {
					let methods = GetNodesByProperties(
						{
							[NodeProperties.FunctionType]: FunctionTypes.Get_Object_User_Object,
							[NodeProperties.NODEType]: NodeTypes.Method
						},
						graph
					).filter((node: Node) => {
						let model = GetNodeLinkedTo(graph, {
							id: node.id,
							componentType: NodeTypes.Model,
							link: LinkType.FunctionOperator
						});
						return model.id === userModel.id;
					});
					if (methods && methods.length) {
						graphOperation(
							ConnectLifecycleMethod({
								properties: { ...LinkProperties.MethodCall },
								target: methods[0].id,
								source: _instanceNode.id
							})
						)(GetDispatchFunc(), GetStateFunc());

						graphOperation([
							{
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									return {
										properties: { ...LinkProperties.DataChainLink },
										target: dataChain,
										source: _instanceNode.id
									};
								}
							}
						])(GetDispatchFunc(), GetStateFunc());
					}
				}
			}
		});
	}
}
