import {
	GetCurrentGraph,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty,
	GetComponentApiNodes,
	GetNodeById,
	GetNodeTitle,
	ADD_NEW_NODE,
	GetNodeByProperties,
	AddLinkBetweenNodes
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
	SetPause,
	GetCellProperties
} from '../../../methods/graph_methods';
import { LinkType, NodeProperties, NodeTypes, LinkProperties } from '../../../constants/nodetypes';
import SetupApiBetweenComponent from '../../../nodepacks/SetupApiBetweenComponents';
import AddButtonToComponent from '../../AddButtonToComponent';
import { Node, ComponentLayoutContainer } from '../../../methods/graph_types';
import CreateHideComponentStyle from '../../screens/CreateHideComponentStyle';
import { CreateComponentStyle } from '../../../components/componentstyle';
import { RouteDescription } from '../../../interface/methodprops';
import { ViewTypes } from '../../../constants/viewtypes';

export function AddButtonToSubComponent(
	screenOption: Node,
	options?: { onItemSelection: boolean }
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
	let viewType = GetNodeProp(screenOption, NodeProperties.ViewType);
	let components: Node[] = [];
	if (viewType === ViewTypes.GetAll && !(options && options.onItemSelection)) {
		components = [ screenOption ];
	} else {
		components = GetNodesLinkedTo(graph, {
			id: screenOption.id,
			link: LinkType.Component
		}).filter((component: Node) => {
			return GetNodeProp(component, NodeProperties.Layout);
		});
	}

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

export function GetHideStyle(): Node {
	let hideNode = GetNodeByProperties({
		[NodeProperties.HideStyle]: true
	});
	if (!hideNode) {
		let hideStyle = CreateHideComponentStyle({
			callback: (_node: Node) => {
				hideNode = _node;
			}
		});
		graphOperation(hideStyle)(GetDispatchFunc(), GetStateFunc());
	}

	return hideNode;
}

export function AddComponentAutoStyles(subcomponent: string, routeDescription: { agent: string }, cellId: string) {
	let layout: ComponentLayoutContainer = GetNodeProp(subcomponent, NodeProperties.Layout);
	let hiddenNode = GetHideStyle();
	graphOperation(AddLinkBetweenNodes(subcomponent, hiddenNode.id, LinkProperties.Style))(
		GetDispatchFunc(),
		GetStateFunc()
	);
	GetNodesLinkedTo(GetCurrentGraph(), {
		id: subcomponent,
		componentType: NodeTypes.ComponentApi
	})
		.filter((component: Node) => {
			return (
				GetNodeProp(component, NodeProperties.UserOfAgent) &&
				GetNodeProp(component, NodeProperties.Model) === routeDescription.agent
			);
		})
		.forEach((internalApi: Node) => {
			let cellProperties = GetCellProperties(layout, cellId);
			if (cellProperties) {
				cellProperties.cellStyleArray = cellProperties.cellStyleArray || [];
				cellProperties.cellStyleArray.push(CreateComponentStyle(internalApi.id, hiddenNode.id, true));
			}
		});

	updateComponentProperty(subcomponent, NodeProperties.Layout, layout);
}

export function AddButtonToComponentLayout(args: { button: string; component: string }): string {
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
	if (GetNodeProp(component, NodeProperties.NODEType) === NodeTypes.ScreenOption) {
		layout = SetCellsLayout(layout, cellCount + 2, root);
	} else {
		layout = SetCellsLayout(layout, cellCount + 1, root);
	}
	let lastCell = GetLastCell(layout, root ? root : null);
	if (!lastCell) {
		throw new Error('couldnt get the last cell: Setup Effect');
	}
	SetLayoutCell(layout, lastCell, button);
	updateComponentProperty(component, NodeProperties.Layout, layout);
	// can add more properties to cell later.
	return lastCell;
}

export function SetupApi(parent: Node, paramName: string, child: Node, skipFirst?: boolean): SetupApiResult {
	console.log(`setup api :${paramName}`);
	let result: SetupApiResult = {
		external: [],
		internal: []
	};
	graphOperation(
		SetupApiBetweenComponent(
			{
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
			},
			(res: SetupApiResult) => {
				result = res;
			}
		)
	)(GetDispatchFunc(), GetStateFunc());

	return result;
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
export interface SetupApiResult {
	internal: string[];
	external: string[];
}
export function SetupApiToBottom(parent: Node, paramName: string, seen: string[], skipFirst?: boolean): SetupApiResult {
	let graph = GetCurrentGraph();
	let result: SetupApiResult = {
		internal: [],
		external: []
	};
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
			let temp = SetupApi(parent, paramName, component, skipFirst);
			result.external.push(...temp.external);
			result.internal.push(...temp.internal);
			temp = SetupApiToBottom(component, paramName, seen);
			result.external.push(...temp.external);
			result.internal.push(...temp.internal);
		});

	return result;
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
