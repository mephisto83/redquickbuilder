import {
	GetCurrentGraph,
	GetDispatchFunc,
	GetNodeByProperties,
	GetNodeTitle,
	GetStateFunc,
	graphOperation,
	updateComponentProperty
} from '../../actions/uiactions';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import * as Titles from '../../components/titles';
import { InstanceTypes } from '../../constants/componenttypes';
import { FunctionTypes } from '../../constants/functiontypes';
import { NodeProperties, NodeTypes } from '../../constants/nodetypes';
import {
	GetLinkedNodes,
	GetNodeProp,
	GetNodesByProperties,
	GetNodesLinkedTo,
	NodesByType
} from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
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

	graph = setupAuthRelatedButton(screenOptions, screen, method, graph);
}
function setupAuthRelatedButton(screenOptions: any, screen: any, method: any, graph: any) {
	screenOptions.forEach((screenOption: Node) => {
		let { button, event, subcomponent, eventInstance } = AddButtonToSubComponent(screenOption);
		AddApiToButton({ button, component: subcomponent });
		updateComponentProperty(button, NodeProperties.UIText, Titles.Register || GetNodeTitle(button));

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
				SetupPostMethod({
					eventInstance,
					method: method.id
				});
				SetupValidations({ screenOption, methodId: method.id });
			}
		}
		//	let cellId =
		AddButtonToComponentLayout({ button, component: subcomponent });
		// AddComponentAutoStyles(subcomponent, effectDescription, cellId);
	});
	return graph;
}
