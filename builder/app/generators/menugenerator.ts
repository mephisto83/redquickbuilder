/* eslint-disable no-underscore-dangle */
import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	GetRootGraph,
	NodesByType,
	NodePropertyTypes,
	NEW_LINK,
	GetCurrentGraph,
	GetCodeName,
	GetModelPropertyChildren,
	GetLinkProperty,
	GetNodeType,
	GetJSCodeName,
	GetNodeByProperties,
	GetNodeTitle
} from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	Usings,
	ValidationRules,
	NameSpace,
	NodeTypes,
	STANDARD_CONTROLLER_USING,
	NEW_LINE,
	LinkProperties,
	LinkPropertyKeys
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import { Node, Graph } from '../methods/graph_types';
export interface MenuObject {
	items: { [str: string]: MenuItem };
	children: { [str: string]: MenuChildren };
}
export const MenuChildProperty = {
	Title: 'title',
	IsScreen: 'isScreen',
	Screen: 'screen',
	Leaf: 'Leaf'
};
export interface MenuItem {
	isScreen: boolean;
	title: string;
	screen: string | null;
	leaf: boolean;
}
export interface MenuChildren {
	[str: string]: MenuChildrenProperty;
}
export interface MenuChildrenProperty {
	[str: string]: any;
}
function createMenuObj(): MenuObject {
	return {
		items: {},
		children: {}
	};
}
function createMenuItem(node: Node): MenuItem {
	let isScreen = GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.NavigationScreen;
	let screen: Node | null = null;
	if (isScreen) {
		screen = GetNodeByProperties({
			[NodeProperties.Model]: GetNodeProp(node, NodeProperties.Model),
			[NodeProperties.Agent]: GetNodeProp(node, NodeProperties.Agent),
			[NodeProperties.ViewType]: GetNodeProp(node, NodeProperties.ViewType),
			[NodeProperties.NODEType]: NodeTypes.Screen
		});
	}

	return {
		isScreen: isScreen,
		title: `menu:${GetNodeTitle(node)}`,
		screen: screen ? GetCodeName(screen) : null,
		leaf: false
	};
}
function createMenuChildren() {
	return {};
}
export default class MenuGenerator {
	static constructMenu(root: Node, menuObj: MenuObject, graph: Graph): MenuObject {
		menuObj = menuObj || createMenuObj();

		if (!menuObj.items[root.id]) {
			menuObj.items[root.id] = createMenuItem(root);

			let submenuItems = GraphMethods.GetNodeLinkedTo(graph, {
				id: root.id,
				link: LinkType.MenuLink,
				direction: GraphMethods.SOURCE
			});

			menuObj.children[root.id] = menuObj.children[root.id] || createMenuChildren();

			submenuItems.map((item: Node) => {
				let isScreen = GetNodeProp(item, NodeProperties.NODEType) === NodeTypes.NavigationScreen;

				menuObj.children[root.id][item.id] = {
					[MenuChildProperty.IsScreen]: isScreen
				};
			});
			let menuItems = submenuItems.filter(
				(node: Node) => GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.MenuDataSource
			);
			//If there is just one menu item, and its a screen. Menuitem should be a direct link
			if (submenuItems.length === 1 && menuItems.length === 0) {
				menuObj.items[root.id].leaf = true;
			}
		}

		return menuObj;
	}
	static Generate(options: { state: any; key?: any; language?: any }) {
		const { state } = options;
		const graphRoot = GetRootGraph(state);
		const models: any[] = [];
		const topNavigationScreen = GetNodeByProperties({
			[NodeProperties.IsHomeLaunchView]: true,
			[NodeProperties.NODEType]: NodeTypes.NavigationScreen
		});
		let menuObj: MenuObject;
		if (topNavigationScreen) {
			let topMenu = GraphMethods.GetNodeLinkedTo(graphRoot, {
				id: topNavigationScreen.id,
				link: LinkType.MenuLink
			});
			menuObj = this.constructMenu(topMenu, createMenuObj(), graphRoot);
		}
		const result: any = {};
		models.map((model: { id: any }) => {
			const res: any = {};
			result[res.id] = res;
		});

		return result;
	}

	static tabs(c: number) {
		let res = '';
		const TAB = '\t';
		for (let i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}
}
