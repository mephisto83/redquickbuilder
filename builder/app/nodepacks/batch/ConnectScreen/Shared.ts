import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty,
	GetComponentApiNodes,
	GetNodeById,
	GetNodeTitle,
	ADD_NEW_NODE
} from '../../../actions/uiactions';
import {
	GetNodesLinkedTo,
	GetNodeProp,
	GetCellCount,
	SetCellsLayout,
	GetLastCell,
	SetLayoutCell,
	GetChildren,
	GetFirstCell,
	SOURCE,
	Paused,
	SetPause
} from '../../../methods/graph_methods';
import { LinkType, NodeProperties, NodeTypes, LinkProperties } from '../../../constants/nodetypes';
import SetupApiBetweenComponent from '../../../nodepacks/SetupApiBetweenComponents';
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
	}).filter((component: Node) => {
		return GetNodeProp(component, NodeProperties.Layout);
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

export function SetupApi(parent: Node, paramName: string, child: Node, skipFirst?: boolean) {
	console.log(`setup api :${paramName}`);
	graphOperation(
		SetupApiBetweenComponent({
			component_a: {
				id: parent.id,
				external: paramName,
				internal: paramName,
				skipExternal: skipFirst
			},
			component_b: {
				id: child.id,
				external: paramName,
				internal: paramName
			}
		})
	)(GetDispatchFunc(), GetStateFunc());
}

export function AddApiToButton(args: { button: string; component: string }) {
	let nodes = GetComponentApiNodes(args.component);
	nodes.forEach((node: Node) => {
		SetupApi(GetNodeById(args.component), GetNodeTitle(node), GetNodeById(args.button));
	});
}

export function SetupApiValueDownToTheBottomComponent(screen: Node, paramName: string) {
	let graph = GetCurrentGraph();
	let screenOptions = GetNodesLinkedTo(graph, {
		id: screen.id,
		link: LinkType.ScreenOptions
	});
	let seen: string[] = [];
	let paused = Paused();
	SetPause(true);
	screenOptions.forEach((screenOption: Node) => {
		SetupApiToBottom(screenOption, paramName, seen);
	});
	SetPause(paused);
}

export function SetupApiToBottom(parent: Node, paramName: string, seen: string[], skipFirst?: boolean) {
	let graph = GetCurrentGraph();
	seen.push(parent.id);
	let components: Node[] = GetNodesLinkedTo(graph, {
		id: parent.id,
		componentType: NodeTypes.ComponentNode,
		direction: SOURCE
	});

	components
		.filter((component: Node) => {
			return seen.indexOf(component.id) === -1;
		})
		.forEach((component: Node) => {
			SetupApi(parent, paramName, component, skipFirst);
			SetupApiToBottom(component, paramName, seen);
		});
}

export function AddInternalComponentApi(componentB: string, b_internal_id: string): string {
	let result: any[] = [];
	let ret: any = null;
	result.push({
		operation: ADD_NEW_NODE,
		options: function() {
			return {
				nodeType: NodeTypes.ComponentApi,
				parent: componentB,
				groupProperties: {},
				properties: {
					[NodeProperties.UIText]: b_internal_id
				},
				linkProperties: {
					properties: { ...LinkProperties.ComponentInternalApi }
				},
				callback: (node: any) => {
					ret = node.id;
				}
			};
		}
	});

	graphOperation(result)(GetDispatchFunc(), GetStateFunc());
	return ret;
}
