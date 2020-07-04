import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty
} from '../../../actions/uiactions';
import { GetNodesLinkedTo, GetNodeProp } from '../../../methods/graph_methods';
import { LinkType, NodeProperties } from '../../../constants/nodetypes';
import AddButtonToComponent from '../../AddButtonToComponent';
import { Node } from '../../../methods/graph_types';

export function AddButtonToSubComponent(
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
