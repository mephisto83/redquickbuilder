import {
	GetCurrentGraph,
	GetDispatchFunc,
	GetNodeByProperties,
	GetNodeTitle,
	GetStateFunc,
	graphOperation,
	PerformGraphOperation,
	updateComponentProperty
} from '../../actions/uiactions';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import * as Titles from '../../components/titles';
import { InstanceTypes } from '../../constants/componenttypes';
import { FunctionTypes } from '../../constants/functiontypes';
import { LinkType, NodeProperties, NodeTypes } from '../../constants/nodetypes';
import {
	GetLinkedNodes,
	GetNodeLinkedTo,
	GetNodeProp,
	GetNodesByProperties,
	GetNodesLinkedTo,
	NodesByType
} from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import PostAuthenticate from '../PostAuthenticate';
import {
	GetModelSelectorNode,
	SetInstanceUpdateOnLlink,
	SetupModelObjectSelector,
	SetupModelObjectSelectorOnScreen,
	SetupPostMethod,
	SetupValidations
} from './ConnectScreen/SetupEffect';
import {
	AddApiToButton,
	AddButtonToComponentLayout,
	AddButtonToSubComponent,
	AddComponentAutoStyles
} from './ConnectScreen/Shared';

export default function SetupAuthenticationButtons() {
	let graph = GetCurrentGraph();
	let screens = NodesByType(graph, NodeTypes.Screen);
	graph = setupRegister(screens, graph);
	graph = setupAuthentication(screens, graph);
}
function setupRegister(screens: any, graph: any) {
	let screen = screens.find((s: Node) => GetNodeProp(s, NodeProperties.UIText).trim() === Titles.Register);

	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		componentType: NodeTypes.ScreenOption
	});

	let method = GetNodeByProperties(
		{
			[NodeProperties.FunctionType]: FunctionTypes.Register,
			[NodeProperties.NODEType]: NodeTypes.Method
		},
		graph
	);

	graph = setupAuthRelatedButton(screenOptions, screen, method, graph, `${Titles.Register} Button`);
	return graph;
}

function setupAuthentication(screens: any, graph: any) {
	let screen = screens.find((s: Node) => GetNodeProp(s, NodeProperties.UIText).trim() === 'Authenticate');
	let targetNavigationScreen = GetNodeByProperties(
		{
			[NodeProperties.IsHomeLaunchView]: true,
			[NodeProperties.NODEType]: NodeTypes.NavigationScreen
		},
		graph
	);
	let targetScreen: Node | null = null;
	if (targetNavigationScreen) {
		targetScreen = GetNodeLinkedTo(graph, {
			id: targetNavigationScreen.id,
			link: LinkType.NavigationScreenImplementation,
			componentType: NodeTypes.Screen
		});
	}
	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		componentType: NodeTypes.ScreenOption
	});

	let method = GetNodeByProperties(
		{
			[NodeProperties.FunctionType]: FunctionTypes.Login,
			[NodeProperties.NODEType]: NodeTypes.Method
		},
		graph
	);

	graph = setupAuthRelatedButton(
		screenOptions,
		screen,
		method,
		graph,
		`${Titles.Login} Button`,
		({ screenOption, eventInstance, method }: { screenOption: Node; eventInstance: string; method: Node }) => {
			let uiType = GetNodeProp(screenOption, NodeProperties.UIType);
			PerformGraphOperation([
				...PostAuthenticate({
					screen: targetScreen ? targetScreen.id : null,
					uiType,
					functionName: `Post Authenticate ${uiType}`,
					pressInstance: eventInstance
				})
			])(GetDispatchFunc(), GetStateFunc());
		}
	);
	return graph;
}

function setupAuthRelatedButton(
	screenOptions: any,
	screen: any,
	method: any,
	graph: any,
	title: string,
	alternatePost?: any
) {
	screenOptions.forEach((screenOption: Node) => {
		let { button, event, subcomponent, eventInstance } = AddButtonToSubComponent(screenOption);
		AddApiToButton({ button, component: subcomponent });
		updateComponentProperty(button, NodeProperties.UIText, title || GetNodeTitle(button));

		console.log('get model selector node');
		let { modelSelectorNode } = GetModelSelectorNode(screen);

		console.log('setup model object selector');
		let { modelDataChain } = SetupModelObjectSelectorOnScreen(screen);

		if (eventInstance && method && method.id) {
			console.log('connect lifecylce method');
			graph = GetCurrentGraph();
			let connectSteps = ConnectLifecycleMethod({
				target: method.id,
				selectorNode: () => modelSelectorNode.id,
				dataChain: () => (modelDataChain ? modelDataChain.id : null),
				source: eventInstance,
				graph
			});

			graphOperation(connectSteps)(GetDispatchFunc(), GetStateFunc());
			console.log('update component property');
			updateComponentProperty(button, NodeProperties.ValidationMethodTarget, method.id);
			let instanceType = GetNodeProp(screen, NodeProperties.InstanceType);
			if (instanceType === InstanceTypes.ScreenInstance) {
				SetInstanceUpdateOnLlink({
					eventInstance,
					eventHandler: event
				});
				if (alternatePost) {
					alternatePost({
						screenOption,
						eventInstance,
						method: method.id
					});
				} else {
					SetupPostMethod({
						eventInstance,
						method: method.id
					});
				}
				SetupValidations({ screenOption, methodId: method.id });
			}
		}
		//	let cellId =
		AddButtonToComponentLayout({ button, component: subcomponent });
		// AddComponentAutoStyles(subcomponent, effectDescription, cellId);
	});
	return graph;
}
