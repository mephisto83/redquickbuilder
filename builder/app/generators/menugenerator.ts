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
	parent: string;
	shouldBeDisabled: string | null;
	shouldShowDataChain: string | null;
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
function createMenuItem(node: Node, graph: Graph, parent: string): MenuItem {
	let isScreen = GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.NavigationScreen;
	let screen: Node | null = null;
	let shouldShowDataChain = GraphMethods.GetNodeLinkedTo(graph, {
		id: node.id,
		link: LinkType.DataChainShouldShow
	});
	let shouldBeDisabled = GraphMethods.GetNodeLinkedTo(graph, {
		id: node.id,
		link: LinkType.DataChainIsDisabled
	});
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
		leaf: false,
		parent,
		shouldShowDataChain: shouldShowDataChain ? shouldShowDataChain.id : null,
		shouldBeDisabled: shouldBeDisabled ? shouldBeDisabled.id : null
	};
}
function createMenuChildren() {
	return {};
}
export default class MenuGenerator {
	static constructMenu(root: Node, menuObj: MenuObject, graph: Graph, parent: string): MenuObject {
		menuObj = menuObj || createMenuObj();

		if (!menuObj.items[root.id]) {
			menuObj.items[root.id] = createMenuItem(root, graph, parent);

			let submenuItems = GraphMethods.GetNodesLinkedTo(graph, {
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
				this.constructMenu(item, menuObj, graph, root.id);
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
	static convertToMenuCode(menuObj: MenuObject): string {
		let result = `
    let result = [];

{{code}}

    return result;
`;
		let code = Object.keys(menuObj.items)
			.map((item: string) => {
				let menuItem = menuObj.items[item];
				if (menuItem.shouldShowDataChain) {
				}
				let { parent } = menuObj.items[item];
				let disabledFunc = `false`;
				if (menuItem.shouldBeDisabled) {
					disabledFunc = `DC.${GetCodeName(menuItem.shouldBeDisabled)}({
            context: {
              getState,
              dispatch
            },
            screen: Screens.${GetCodeName(item)}
          })`;
				}
				let shouldShowPart1 = '';
				let shouldShowPart2 = '';
				if (menuItem.shouldShowDataChain) {
					shouldShowPart1 = `if(DC.${GetCodeName(menuItem.shouldShowDataChain)}({
            context: {
              getState,
              dispatch
            },
          })){`;
					shouldShowPart2 = '}';
				}
				return `
          ${shouldShowPart1}
            result.push({
              id: '${item}',
              disabled: ${disabledFunc},
              title: titleService.get('${item}', '${GetNodeTitle(item)}'),
              parent: ${parent ? `'${parent}'` : 'null'}
            });
          ${shouldShowPart2}
      `;
			})
			.join(NEW_LINE);

		return bindTemplate(result, {
			code
		});
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
			menuObj = this.constructMenu(topMenu, createMenuObj(), graphRoot, '');

			let menuGuts = this.convertToMenuCode(menuObj);
			let rel = '';
			const result: any = {
				id: 'menuSource.ts',
				name: 'menuSource.ts',
				menusource: {
					template: `
          import * as navigate from '../${rel}actions/navigationActions';
          import * as $service from '../${rel}util/service';
          import routes from '../${rel}constants/routes';
          import { titleService} from '../${rel}actions/util';
          import * as RedLists from '../${rel}actions/lists';
          import StateKeys from '../${rel}state_keys';
          import ModelKeys from '../${rel}model_keys';
          import ViewModelKeys from '../${rel}viewmodel_keys';
          import Models from '../${rel}model_keys';
          import RedObservable from '../${rel}actions/observable';
          import RedGraph from '../${rel}actions/redgraph';
          import { retrieveParameters, fetchModel } from '../${rel}actions/redutils';
          import * as DC from './${rel}data-chain';
          import * as DC from 'menusourceActions';
          import titleService from './titleService';

          export interface MenuItem {
            id: string;
            title: string;
            parent: string | null;
          }
          export function GetMenuSource(args: { getState: Function, dispatch: Function }) {
            ${menuGuts}
          }
        `
				}
			};
			return { [`menuSource.ts`]: result };
		}
		// models.map((model: { id: any }) => {
		// 	const res: any = {};
		// 	result[res.id] = res;
		// });
		return {};
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
