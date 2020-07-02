import { Node, Graph } from '../../../methods/graph_types';
import { Effect, EffectProps, EffectDescription } from '../../../interface/methodprops';
import { SetupInformation } from './SetupInformation';
import { GetNodesLinkedTo, GetNodeProp } from '../../../methods/graph_methods';
import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeTitle,
	GetNodeById
} from '../../../actions/uiactions';
import { LinkType, NodeProperties } from '../../../constants/nodetypes';
import AddButtonToComponent from '../../AddButtonToComponent';
import GetModelObjectFromSelector from '../../GetModelObjectFromSelector';

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
		let { eventInstance, button } = AddButtonToSubComponent(screenOption);
		let { modelDataChain } = SetupModelObjectSelector(effectDescription, screenOption, screen, information);
	});
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
	eventInstance: string;
} {
	let result: string = '';
	let eventInstance: string = '';
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
			callback: (context: { entry: string; eventInstance: string }) => {
				button = context.entry;
				eventInstance = context.eventInstance;
			}
		});
		graphOperation(steps)(GetDispatchFunc(), GetStateFunc());
		result = button;
	});

	return {
		button: result,
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
