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
} from '../actions/uiActions';
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
import { GetNodeLinkedTo } from '../methods/graph_methods';
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
	execute: string | null;
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
	let execute = GraphMethods.GetNodeLinkedTo(graph, {
		id: node.id,
		link: LinkType.DataChainLogout
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
		shouldBeDisabled: shouldBeDisabled ? shouldBeDisabled.id : null,
		execute: execute ? execute.id : null
	};
}
function createMenuChildren() {
	return {};
}
export default class MenuGenerator {
	static constructMenu(root: Node, menuObj: MenuObject, graph: Graph, parent: string): MenuObject {
		menuObj = menuObj || createMenuObj();

		if (menuObj.items && root && !menuObj.items[root.id]) {
			menuObj.items[root.id] = createMenuItem(root, graph, parent);

			let submenuItems = GraphMethods.GetNodesLinkedTo(graph, {
				id: root.id,
				link: LinkType.MenuLink,
				direction: GraphMethods.SOURCE,
				componentType: NodeTypes.MenuDataSource
			});

			menuObj.children[root.id] = menuObj.children[root.id] || createMenuChildren();
			if (submenuItems.length) {
				submenuItems.sort((a: Node, b: Node) => {
					let a_ = GetNodeProp(a, NodeProperties.Priority) || 1;
					let b_ = GetNodeProp(b, NodeProperties.Priority) || 1;
					return a_ - b_;
				}).map((item: Node) => {
					menuObj.children[root.id][item.id] = {};
					this.constructMenu(item, menuObj, graph, root.id);
				});
			}
			else {
				let screen = GraphMethods.GetNodeLinkedTo(graph, {
					id: root.id,
					link: LinkType.MenuLink,
					componentType: NodeTypes.NavigationScreen
				});
				if (screen) {
					menuObj.items[root.id].isScreen = true;
					menuObj.items[root.id].leaf = true;
					menuObj.items[root.id].screen = screen.id
				}
				else {
					console.warn('malformed menu, has no children, and no screen to connect')
				}
			}
		}

		return menuObj;
	}
	static convertToMenuCode(menuObj: MenuObject): string {
		let result = `
    let result: any[] = [];

{{code}}

    return result;
`;
		let code = Object.keys(menuObj.items)
			.map((item: string) => {
				let menuItem = menuObj.items[item];
				let screen = menuItem.screen;
				if (menuItem.shouldShowDataChain) {
				}
				let { parent } = menuObj.items[item];
				let disabledFunc = `false`;
				let execute = '';
				if (menuItem.execute) {
					execute = `execute: DC.${GetCodeName(menuItem.execute, { includeNameSpace: true })},`
				}
				if (menuItem.shouldBeDisabled) {
					disabledFunc = `MA.${GetCodeName(menuItem.shouldBeDisabled)}({
										context: {
										getState,
										dispatch
										},
										${screen ? `screen: Screens.${GetCodeName(screen)}` : ''}
									})`;
				}
				let shouldShowPart1 = '';
				let shouldShowPart2 = '';
				if (menuItem.shouldShowDataChain) {
					shouldShowPart1 = `if(MA.${GetCodeName(menuItem.shouldShowDataChain)}({
												context: {
												getState,
												dispatch
												},
												${screen ? `screen: Screens.${GetCodeName(screen)}` : ''}
											})){`;
					shouldShowPart2 = '}';
				}
				return `
						${shouldShowPart1}
							result.push({
							id: '${item}',
							disabled: ${disabledFunc},
							${execute}
							title: titleService.get(\`${item}\`, \`${GetNodeTitle(item)}\`),
							${screen ? `screen: Screens.${GetCodeName(screen)},` : ''}
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
			let topMenu = GetNodeByProperties({
				[NodeProperties.MenuRootNode]: true,
				[NodeProperties.NODEType]: NodeTypes.MenuDataSource
			});
			menuObj = this.constructMenu(topMenu, createMenuObj(), graphRoot, '');

			let menuGuts = this.convertToMenuCode(menuObj);
			let rel = '';
			const result: any = {
				id: 'menuSource.ts',
				name: 'menuSource.ts',
				relative: `./src/actions`,
				relativeFilePath: `./menuSource.ts`,
				template: `
          import * as navigate from '../${rel}actions/navigationActions';
          import * as $service from '../${rel}util/service';
          import routes from '../${rel}constants/routes';
          import { titleService, GUID} from '../${rel}actions/util';
          import * as RedLists from '../${rel}actions/lists';
          import StateKeys from '../${rel}state_keys';
		  import ModelKeys from '../${rel}model_keys';
		  import * as Screens from '../${rel}actions/screenInstances';
          import { ViewModelKeys } from '../${rel}viewmodel_keys';
          import Models from '../${rel}model_keys';
          import RedObservable from '../${rel}actions/observable';
          import RedGraph from '../${rel}actions/redgraph';
          import { retrieveParameters, fetchModel } from '../${rel}actions/redutils';
          import * as DC from './${rel}data-chain';
          import * as MA from './datachains/menuDataFunctions/menuDataFunctions';

          export interface MenuItem {
            id: string;
            title: string;
            parent: string | null;
          }
          export function GetMenuSource(args: { getState: Function, dispatch: Function }) {
            let { getState, dispatch } = args;
            ${menuGuts}
          }
        `
			};
			return { [`menuSource.ts`]: result };
		}

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
