import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty
} from '../../../actions/uiactions';
import {
	GetNodesLinkedTo,
	GetNodeProp,
	GetCellCount,
	SetCellsLayout,
	GetLastCell,
	SetLayoutCell,
	GetChildren,
	GetFirstCell
} from '../../../methods/graph_methods';
import { LinkType, NodeProperties } from '../../../constants/nodetypes';
import AddButtonToComponent from '../../AddButtonToComponent';
import { Node, ComponentLayoutContainer } from '../../../methods/graph_types';

export function AddButtonToSubComponent(
	screenOption: Node
): {
	button: string;
	event: string;
	subcomponent: string;
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
			callback: (context: { newComponent: string; entry: string; event: string; eventInstance: string }) => {
				button = context.newComponent;
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
		subcomponent: components[0].id,
		event,
		eventInstance
	};
}

export function AddButtonToComponentLayout(args: { button: string; component: string }) {
	let { component, button } = args;
	let result: any[] = [];
	if (!component) {
		throw new Error('no component in setupeffect');
	}
	let layout: ComponentLayoutContainer = GetNodeProp(component, NodeProperties.Layout);
	if (!layout) {
		throw new Error('no layout found: Setup Effect');
	}
	let root = GetFirstCell(layout);
	let rootChildren = GetChildren(layout, root);
	let cellCount = rootChildren.length;
	layout = SetCellsLayout(layout, cellCount + 1, root);
	let lastCell = GetLastCell(layout, root ? root : null);
	if (!lastCell) {
		throw new Error('couldnt get the last cell: Setup Effect');
	}
	SetLayoutCell(layout, lastCell, button);
	updateComponentProperty(component, NodeProperties.Layout, layout);
	// can add more properties to cell later.
}
