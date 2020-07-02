import { Node, Graph } from '../../../methods/graph_types';
import { Effect, EffectProps, EffectDescription } from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import { GetNodesLinkedTo, GetNodeProp, getLinkInstance } from '../../../methods/graph_methods';
import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeTitle,
	GetNodeById,
	NodeTypes,
	GetNodeByProperties,
	UPDATE_LINK_PROPERTY,
	updateComponentProperty
} from '../../../actions/uiactions';
import { LinkType, NodeProperties, LinkPropertyKeys } from '../../../constants/nodetypes';
import AddButtonToComponent from '../../AddButtonToComponent';
import GetModelObjectFromSelector from '../../GetModelObjectFromSelector';
import ConnectLifecycleMethod from '../../../components/ConnectLifecycleMethod';
import { InstanceTypes } from '../../../constants/componenttypes';
import AppendPostMethod from '../../screens/AppendPostMethod';
import AppendValidations from '../../screens/AppendValidations';

export default function SetupEffect(screen: Node, effect: Effect, information: SetupInformation) {
	effect.effects.forEach((effectDescription: EffectDescription) => {
		SetupEffectDescription(effectDescription, screen, information);
	});
}

function SetupEffectDescription(effectDescription: EffectDescription, screen: Node, information: SetupInformation) {
	let graph = GetCurrentGraph();
	let setup_options = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	setup_options.forEach((screenOption: Node) => {
		let { eventInstance, event, button } = AddButtonToSubComponent(screenOption);
		let { modelSelectorNode } = GetModelSelectorNode(screen);
		let { modelDataChain } = SetupModelObjectSelector(effectDescription, screenOption, screen, information);

		if (eventInstance && effectDescription.methodDescription && effectDescription.methodDescription.methodId) {
			let connectSteps = ConnectLifecycleMethod({
				target: effectDescription.methodDescription.methodId,
				selectorNode: () => modelSelectorNode.id,
				dataChain: () => (modelDataChain ? modelDataChain.id : null),
				source: eventInstance,
				graph
			});
			graphOperation(connectSteps)(GetDispatchFunc(), GetStateFunc());
			updateComponentProperty(
				button,
				NodeProperties.ValidationMethodTarget,
				effectDescription.methodDescription.methodId
			);
			let instanceType = GetNodeProp(screen, NodeProperties.InstanceType);
			if (instanceType === InstanceTypes.ScreenInstance) {
				SetInstanceUpdateOnLlink({
					eventInstance,
					eventHandler: event
				});
				SetupPostMethod({
					eventInstance,
					method: effectDescription.methodDescription.methodId
				});
				SetupValidations({ screenOption, effectDescription });
			}
		}
	});
}
function SetupValidations(args: { screenOption: Node; effectDescription: EffectDescription }) {
	let { screenOption, effectDescription } = args;
	let graph = GetCurrentGraph();
	const components = GetNodesLinkedTo(graph, {
		id: screenOption.id,
		link: LinkType.Component
	});
	components.forEach((component: Node) => {
		const subcomponents = GetNodesLinkedTo(graph, {
			id: component.id,
			link: LinkType.Component
		});

		graphOperation(
			AppendValidations({
				subcomponents,
				component,
				InstanceUpdate: true,
				screen_option: screenOption,
				method: effectDescription.methodDescription ? effectDescription.methodDescription.methodId : null
			})
		)(GetDispatchFunc(), GetStateFunc());
	});
}
function SetupPostMethod(args: { eventInstance: string; method: string }) {
	let { method, eventInstance } = args;
	graphOperation(
		AppendPostMethod({
			method,
			handler: () => eventInstance
		})
	)(GetDispatchFunc(), GetStateFunc());
}
function SetInstanceUpdateOnLlink(args: { eventInstance: string; eventHandler: string }) {
	let { eventInstance, eventHandler } = args;
	graphOperation([
		{
			operation: UPDATE_LINK_PROPERTY,
			options(currentGraph: any) {
				const link = getLinkInstance(currentGraph, {
					target: eventInstance,
					source: eventHandler
				});
				if (link)
					return {
						id: link.id,
						prop: LinkPropertyKeys.InstanceUpdate,
						value: true
					};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
}
function GetModelSelectorNode(screen: Node): { modelSelectorNode: Node } {
	const modelSelectorNode = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.Selector,
		[NodeProperties.Model]: GetNodeProp(screen, NodeProperties.Model)
	});

	return { modelSelectorNode };
}
function SetupModelObjectSelector(
	effectDescription: EffectDescription,
	screenOption: Node,
	screen: Node,
	information: SetupInformation
): { modelDataChain: Node | null } {
	let modelDataChain: Node | null = null;
	graphOperation(
		GetModelObjectFromSelector({
			model: GetNodeTitle(screen),
			callback: (newContext: { entry: string }, tempGraph: Graph) => {
				modelDataChain = GetNodeById(newContext.entry, tempGraph);
			}
		})
	)(GetDispatchFunc(), GetStateFunc());
	return { modelDataChain };
}

function AddButtonToSubComponent(
	screenOption: Node
): {
	button: string;
	event: string;
	eventInstance: string;
} {
	let result: string = '';
	let eventInstance: string = '';
	let event: string = '';
	let graph = GetCurrentGraph();

	const components = GetNodesLinkedTo(graph, {
		id: screenOption.id,
		link: LinkType.Component
	});
	let button: string = '';
	components.subset(0, 1).forEach((component: Node) => {
		let steps = AddButtonToComponent({
			component: component.id,
			clearPinned: true,
			uiType: GetNodeProp(screenOption, NodeProperties.UIType),
			callback: (context: { entry: string; event: string; eventInstance: string }) => {
				button = context.entry;
				eventInstance = context.eventInstance;
				event = context.event;
			}
		});
		graphOperation(steps)(GetDispatchFunc(), GetStateFunc());
		updateComponentProperty(button, NodeProperties.ExecuteButton, true);
		result = button;
	});

	return {
		button: result,
		event,
		eventInstance
	};
}

export function GetEffect(effectProps: EffectProps, viewType: string): Effect | null {
	let temp: any = effectProps;
	if (temp && temp[viewType]) {
		return temp[viewType];
	}
	return null;
}
