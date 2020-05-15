/* eslint-disable react/sort-comp */
// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { platform } from 'os';
import { currentId } from 'async_hooks';
import routes from '../constants/routes';
import { UIConnect } from '../utils/utils';
import DashboardLogo from './dashboardlogo';
import Header from './header';
import DashboardNavBar from './dashboardnavbar';
import SidebarToggle from './sidebartoggle';
import * as UIA from '../actions/uiactions';
import NavBarMenu from './navbarmenu';
import MainSideBar from './mainsidebar';
import BatchMenu from './batchmenu';
import SelectorActivityMenu from './selectoractivitymenu';
import SideBarHeader from './sidebarheader';
import ViewModelActivityMenu from './viewmodelactivitymenu';
import QuickMethods from './quickmethods';
import ServiceIntefaceMenu from './serviceinterfacemenu';
import * as Titles from './titles';
import SideBarMenu from './sidebarmenu';
import EventHandlerActivityMenu from './eventhandleractivitymenu';
import TreeViewMenu from './treeviewmenu';
import Content from './content';
import NavigationParameterMenu from './navigationparametermenu';
import ScreenActivityMenu from './screenactivitymenu';
import SideBar from './sidebar';
import DataSourceActivityMenu from './datasourceactivitymenu';
import SideBarTabs from './sidebartabs';
import SideBarTab from './sidebartab';
import ScreenOptionsActivityMenu from './screenoptionsactivitymenu';
import ServiceActivityMenu from './serviceactivitymenu';
import SideBarContent from './sidebarcontent';
import NavBarButton from './navbarbutton';
import ConditionFilterMenu from './conditionfiltermenu';
import CheckBox from './checkbox';
import * as VC from '../constants/visual';
import MindMap from './mindmap';
import ModelActivityMenu from './modelactivitymenu';
import FunctionActivityMenu from './functionactivitymenu';
import PropertyActivityMenu from './propertyactivitymenu';
import DataChainActvityMenu from './datachainactivitymenu';
import AfterEffectsActivityMenu from './aftereffectsactivitymenu';
import AttributeFormControl from './attributeformcontrol';
import PermissionMenu from './permissionmenu';
import ChoiceActivityMenu from './choiceactivitymenu';
import TreeViewItemContainer from './treeviewitemcontainer';
import UIParameters from './uiparameters';
import ComponentActivityMenu from './componentactivitymenu';
import ComponentPropertyMenu from './componentpropertymenu';
import ModelFilterActivityMenu from './modelfilteractivitymenu';
import ComponentAPIMenu from './componentapimenu';
import ValidationActivityMenu from './validationactivitymenu';
import ValidationItemFormControl from './validationitemactivitymenu';
import ValidatorActivityMenu from './validatoractivitymenu';
import OptionActivityMenu from './optionactivitymenu';
import ExecutorPropertyMenu from './executorpropertymenu';
import ConfigurationActivityMenu from './configurationactivitymenu';
import ConditionActivityMenu from './conditionactivitymenu';
import ParameterActivityMenu from './parameteractivitymenu';
import OptionItemFormControl from './optionitemformcontrol';
import ExecutorPropertyActivityMenu from './executorpropertyactivitymenu';
import ExecutorActivityMenu from './executoractivitymenu';
import ValidatorPropertyMenu from './validatorpropertymenu';
import ValidatorPropertyActivityMenu from './validatorpropertyactivitymenu';
import ExtensionListActivityMenu from './ExtensionListActivityMenu';
import PermissionActivityMenu from './permissionsactivitymenu';
import ReferenceActivityMenu from './referenceactivitymenu';
import { GooMenuSVG } from './goomenu';
import ChoiceListItemActivityMenu from './choicelistitemactivitymenu';
import GooMenu from './goomenu';
import FormControl from './formcontrol';
import AgentAccessProperties from './agentaccessproperties';
import ModelFilterMenu from './modelfiltermenu';
import TextInput from './textinput';
import SelectInput from './selectinput';
import DataChainOperator from './datachainoperator';
import ThemeProperties from './themeproperties';
import CurrentNodeProperties from './currentnodeproperties';
import Slider from './slider';
import SideMenuContainer from './sidemenucontainer';
import ExtensionDefinitionMenu from './extensiondefinitionmenu';
import MethodActivityMenu from './methodactivitymenu';
import MethodPropertyMenu from './methodpropertymenu';
import MaestroDetailsMenu from './maestrodetailsmenu';
import NodeManagement from './nodemanagement';
import MethodParameterMenu from './methodparameteremenu';
import CommonActivityMenu from './commonactivitymenu';
import ModelFilterItemActivityMenu from './modelfilteritemactivitymenu';
import ModelRelationshipMenu from './modelrelationshipmenu';
import DepthChoice from './depthchoice';
import MaestroActivityMenu from './maestroactivitymenu';
import ContextMenu from './contextmenu';
import SidebarButton from './sidebarbutton';
import ControllerDetailsMenu from './controllerdetailsmenu';
import ControllerActivityMenu from './controlleractivitymenu';
import PermissionDependencyActivityMenu from './permissionsdependentactivitymenu';
import GraphMenu from './graphmenu';
import SectionList from './sectionlist';
import EnumerationActivityMenu from './enumerationactivitymenu';
import SectionEdit from './sectionedit';
import {
	NotSelectableNodeTypes,
	NodeProperties,
	NodeTypes,
	LinkType,
	LinkProperties,
	ExcludeDefaultNode,
	FilterUI,
	MAIN_CONTENT,
	MIND_MAP,
	CODE_VIEW,
	LAYOUT_VIEW,
	LinkEvents,
	NavigateTypes,
	LinkPropertyKeys,
	THEME_VIEW,
	TRANSLATION_VIEW,
	PROGRESS_VIEW,
	AGENT_ACCESS_VIEW,
	CODE_EDITOR
} from '../constants/nodetypes';
import CodeView from './codeview';
import LayoutView from './layoutview';
import ThemeView from './themeview';
import AgentAccessView from './agentaccessview';
import TranslationView from './translationview';
import ProgressView from './progressview';
import {
	getLinkInstance,
	createEventProp,
	getNodesByLinkType,
	SOURCE,
	GetNodesLinkedTo,
	Paused
} from '../methods/graph_methods';
import { DataChainContextMethods } from '../constants/datachain';
import StyleMenu from './stylemenu';
import { ViewTypes } from '../constants/viewtypes';
import { JobServiceConstants } from '../jobs/jobservice';
import CodeEditor from './codeeditor';

const { clipboard } = require('electron');

const SIDE_PANEL_OPEN = 'side-panel-open';
const NODE_MENU = 'NODE_MENU';
const CONNECTING_NODE = 'CONNECTING_NODE';
const LINK_DISTANCE = 'LINK_DISTANCE';
class Dashboard extends Component<any, any> {
	componentDidMount() {
		this.props.setState();
		this.props.setRemoteState();
		this.props.setVisual(UIA.NODE_COST, 1);
		this.props.setVisual(UIA.NODE_CONNECTION_COST, 0.2);
		this.props.loadApplicationConfig();
	}

	minified() {
		const { state } = this.props;
		return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
	}

	nodeSelectionMenuItems() {
		const result = [];
		const { state } = this.props;
		if (UIA.Visual(state, UIA.SELECTED_NODE)) {
			const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
			switch (UIA.GetNodeProp(currentNode, NodeProperties.NODEType)) {
				case NodeTypes.DataChain:
					return this.getDataChainContext();
				case NodeTypes.Controller:
					result.push({
						onClick: () => {
							this.props.setVisual(CONNECTING_NODE, {
								...LinkProperties.MaestroLink,
								nodeTypes: [ NodeTypes.Maestro ]
							});
						},
						icon: 'fa  fa-music',
						title: Titles.AddMaestros
					});
					return result;
				case NodeTypes.Maestro:
					result.push({
						onClick: () => {
							this.props.setVisual(CONNECTING_NODE, {
								...LinkProperties.FunctionLink,
								nodeTypes: [ NodeTypes.Method ]
							});
						},
						icon: 'fa  fa-music',
						title: Titles.AddFunction
					});
					return result;
				case NodeTypes.Selector:
					result.push(...this.getSelectorContext());
					return result;
				case NodeTypes.Model:
				case NodeTypes.Property:
					result.push(...this.getModelContext());
					return result;
				case NodeTypes.ComponentNode:
					result.push(...this.getComponentContext());
					break;
				case NodeTypes.ViewType:
					result.push(...this.getViewTypeContext());
					return result;
				case NodeTypes.Permission:
					result.push(...this.getPermissionContext());
					return result;
				case NodeTypes.Executor:
					result.push(...this.getExecutorContext());
					return result;
				case NodeTypes.Validator:
					result.push(...this.getValidatorContext());
					return result;
				case NodeTypes.AgentAccessDescription:
					result.push(
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.AgentAccess,
									nodeTypes: [ NodeTypes.Model ],
									properties: {
										[NodeProperties.IsAgent]: true
									}
								});
							},
							icon: 'fa fa-user',
							title: Titles.AgentAccess
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.ModelAccess,
									nodeTypes: [ NodeTypes.Model ]
								});
							},
							icon: 'fa  fa-object-ungroup',
							title: Titles.ModelAccess
						}
					);
					break;
				case NodeTypes.ClaimService:
					return [
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.ClaimServiceAuthorizationMethod,
									nodeTypes: [ NodeTypes.Method ]
								});
							},
							icon: 'fa fa-gears',
							title: Titles.ClaimServiceRegistrationCalls
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.ClaimServiceUpdateUserMethod,
									nodeTypes: [ NodeTypes.Method ]
								});
							},
							icon: 'fa fa-truck',
							title: Titles.ClaimServiceUpdateUserMethod
						}
					];

				case NodeTypes.LifeCylceMethod:
					return this.getLifeCylcleMethods();
				case NodeTypes.EventMethod:
					return this.getEventMethods();
				case NodeTypes.EventMethodInstance:
					result.push(...this.getEventInstanceMethods(currentNode));
					return result;
				case NodeTypes.LifeCylceMethodInstance:
					result.push(...this.getLifeCylcleInstanceMethods());
					return result;
				case NodeTypes.ComponentApiConnector:
					result.push(...this.getComponentApiContextMenu());
					break;
				case NodeTypes.Method:
					result.push({
						onClick: () => {
							this.props.setVisual(CONNECTING_NODE, {
								...LinkProperties.DataChainLink,
								nodeTypes: [ NodeTypes.DataChain ]
							});
						},
						icon: 'fa fa-chain',
						title: Titles.DataChain
					});
					break;
				case NodeTypes.Action:
					result.push({
						onClick: () => {
							this.props.setVisual(CONNECTING_NODE, LinkProperties.ModelItemFilter);
						},
						icon: 'fa fa-filter',
						title: Titles.ConnectModelItemFilter
					});
					break;
				case NodeTypes.ScreenOption:
					result.push(
						{
							onClick: () => {
								this.props.addQueryMethodApi();
							},
							icon: 'fa fa-plus',
							title: Titles.AddQueryMethodApi
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.Style,
									nodeTypes: [ NodeTypes.Style ]
								});
							},
							icon: 'fa fa-css3',
							title: 'Style'
						},
						{
							onClick: () => {
								// this.props.setVisual(CONNECTING_NODE, {
								// 	autoConnectViewType: currentNode.id
								// });
							},
							icon: 'fa fa-plus',
							title: `${Titles.AddComponentApi}`
						}
					);
					break;
				case NodeTypes.MethodApiParameters:
					if (UIA.GetNodeProp(currentNode, NodeProperties.QueryParameterObjectExtendible)) {
						result.push({
							onClick: () => {
								this.props.addQueryMethodParameter();
							},
							icon: 'fa fa-plus',
							title: Titles.AddQueryMethodApi
						});
					}
					result.push({
						onClick: () => {
							this.props.setVisual(CONNECTING_NODE, {
								...LinkProperties.ComponentApiConnection,
								singleLink: true,
								nodeTypes: [ NodeTypes.DataChain ]
							});
						},
						icon: 'fa  fa-contao',
						title: Titles.Body
					});
					break;
				case NodeTypes.Style:
					return [
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.Style,
									singleLink: false,
									nodeTypes: [ NodeTypes.Style ]
								});
							},
							icon: 'fa fa-css3',
							title: Titles.Style
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.DataChainStyleLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.DataChain ]
								});
							},
							icon: 'fa fa-chain',
							title: Titles.DataChain
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.StyleArgument,
									singleLink: false,
									nodeTypes: [ NodeTypes.ComponentApi, NodeTypes.ComponentExternalApi ]
								});
							},
							icon: 'fa fa-th-large',
							title: Titles.DataChain
						}
					];
				case NodeTypes.Lists:
					return [
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.Lists,
									nodeTypes: [ NodeTypes.Screen ]
								});
							},
							icon: 'fa  fa-list',
							title: 'Add to list'
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.Lists,
									allOfType: true,
									nodeTypes: [ NodeTypes.Screen ]
								});
							},
							icon: 'fa fa-list',
							title: 'Add All of [Type] list'
						}
					];
				case NodeTypes.FetchService:
					result.push(
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.FetchService,
									nodeTypes: [ NodeTypes.Method ]
								});
							},
							icon: 'fa fa-bicycle',
							title: Titles.AddMethod
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.FetchServiceOuput,
									singleLink: true,
									nodeTypes: [ NodeTypes.Model ]
								});
							},
							icon: 'fa fa-plug',
							title: Titles.SetFetchServiceOutput
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.FetchSserviceAgent,
									singleLink: true,
									nodeTypes: [ NodeTypes.Model ],
									properties: {
										[NodeProperties.IsAgent]: true
									}
								});
							},
							icon: 'fa  fa-user-secret',
							title: Titles.SetFetchSericeAgent
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.DataChainLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.DataChain ]
								});
							},
							icon: 'fa fa-share-alt',
							title: Titles.DataChain
						}
					);
					return result;
				case NodeTypes.ComponentExternalApi:
					result.push(
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.DataChainLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.DataChain ]
								});
							},
							icon: 'fa fa-share-alt',
							title: Titles.DataChain
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.ComponentExternalConnection,
									nodeTypes: [ NodeTypes.ComponentApi ]
								});
							},
							icon: 'fa fa-external-link-square',
							title: Titles.ExternalApiConnection
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.ComponentInternalConnection,
									singleLink: true,
									nodeTypes: [ NodeTypes.ComponentApi ]
								});
							},
							icon: 'fa fa-search-plus',
							title: Titles.InternalApiConnection
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.SelectorLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.Selector ]
								});
							},
							icon: 'fa fa-reply',
							title: Titles.Selector
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.TitleServiceLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.TitleService ]
								});
							},
							icon: 'fa  fa-font',
							title: Titles.TitleService
						}
					);
					const graph = UIA.GetCurrentGraph(UIA.GetState());
					if (
						GetNodesLinkedTo(graph, {
							id: currentNode.id,
							link: LinkType.ComponentExternalApi
						}).some((v) => UIA.GetNodeProp(v, NodeProperties.NODEType) === NodeTypes.ScreenOption)
					) {
						result.push({
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.QueryLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.MethodApiParameters ]
								});
							},
							icon: 'fa fa-question',
							title: Titles.AddQueryMethodApi
						});
					}
					return result;
				case NodeTypes.ComponentApi:
					result.push(
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.DataChainLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.DataChain ]
								});
							},
							icon: 'fa fa-share-alt',
							title: Titles.DataChain
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.ComponentInternalConnection,
									singleLink: true,
									nodeTypes: [ NodeTypes.ComponentExternalApi ]
								});
							},
							icon: 'fa fa-search-plus',
							title: Titles.ExternalApiConnection
						},
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, {
									...LinkProperties.SelectorLink,
									singleLink: true,
									nodeTypes: [ NodeTypes.Selector ]
								});
							},
							icon: 'fa fa-reply',
							title: Titles.Selector
						}
					);
					return result;
				case NodeTypes.ScreenItem:
				case NodeTypes.ScreenCollection:
				case NodeTypes.ScreenContainer:
				case NodeTypes.Screen:
					result.push(
						{
							onClick: () => {
								this.props.setVisual(CONNECTING_NODE, LinkProperties.ChildLink);
							},
							icon: 'fa fa-share-alt',
							title: Titles.ChildLink
						},
						{
							onClick: () => {
								this.props.graphOperation([
									{
										operation: UIA.ADD_NEW_NODE,
										options() {
											return {
												nodeType: NodeTypes.ComponentApi,
												parent: currentNode.id,
												groupProperties: {},
												linkProperties: {
													properties: { ...LinkProperties.ComponentInternalApi }
												},
												properties: {
													[NodeProperties.UIText]: `value`
												}
											};
										}
									}
								]);
							},
							icon: 'fa fa-plus',
							title: `${Titles.AddComponentApi}`
						}
					);
					break;
				default:
					break;
			}
			result.push({
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, true);
				},
				icon: 'fa fa-plug',
				title: Titles.GenericLink
			});
		}
		return result;
	}

	getSelectorContext() {
		const result = [];

		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.SelectorLink
					});
				},
				icon: 'fa fa-font',
				title: `${Titles.Selector}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.SelectorInputLink
					});
				},
				icon: 'fa fa-exchange',
				title: `${Titles.SelectorInput}`
			}
		);
		return result;
	}

	getViewTypeContext() {
		const result = [];

		result.push({
			onClick: () => {
				this.props.setVisual(CONNECTING_NODE, {
					...LinkProperties.SharedComponent
				});
			},
			icon: 'fa fa-coffee',
			title: `${Titles.SharedControl}`
		});

		return result;
	}

	getPermissionContext() {
		const result = [];

		result.push({
			onClick: () => {
				this.props.setVisual(CONNECTING_NODE, {
					...LinkProperties.PermissionServiceMethod
				});
			},
			icon: 'fa fa-unlock-alt',
			title: `${Titles.PermissionServiceMethod}`
		});

		return result;
	}

	getExecutorContext() {
		const result = [];

		result.push({
			onClick: () => {
				this.props.setVisual(CONNECTING_NODE, {
					...LinkProperties.ExecutorServiceMethod
				});
			},
			icon: 'fa fa-rocket',
			title: `${Titles.ExecutorServiceMethod}`
		});

		return result;
	}

	getComponentApiContextMenu() {
		const result = [];

		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.ComponentApi,
						singleLink: true,
						nodeTypes: [ NodeTypes.ComponentApi ]
					});
				},
				icon: 'fa fa-genderless',
				title: `${Titles.InternalApiConnection}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.ComponentApiConnection
					});
				},
				icon: 'fa fa-rocket',
				title: `${Titles.ComponentApiConnection}`
			}
		);

		return result;
	}

	getEventMethods() {
		const result = [];
		const { state } = this.props;
		result.push({
			onClick: () => {
				const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

				this.props.graphOperation([
					{
						operation: UIA.ADD_NEW_NODE,
						options: UIA.addInstanceFunc(currentNode)
					}
				]);
			},
			icon: 'fa fa-plus',
			title: `${Titles.AddInstance}`
		});

		return result;
	}

	getLifeCylcleMethods() {
		const result = [];
		const { state } = this.props;
		result.push({
			onClick: () => {
				const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

				this.props.graphOperation([
					{
						operation: UIA.ADD_NEW_NODE,
						options() {
							return {
								nodeType: NodeTypes.LifeCylceMethodInstance,
								parent: currentNode.id,
								linkProperties: {
									properties: LinkProperties.LifeCylceMethodInstance
								},
								groupProperties: {},
								properties: {
									[NodeProperties.UIText]: `${UIA.GetNodeTitle(currentNode)} Instance`,
									[NodeProperties.AutoDelete]: {
										properties: {
											[NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
										}
									}
								}
							};
						}
					}
				]);
			},
			icon: 'fa fa-plus',
			title: `${Titles.AddInstance}`
		});

		return result;
	}

	getLifeCylcleInstanceMethods() {
		const result = [];

		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.LifeCylceMethod
					});
				},
				icon: 'fa fa-list-ol',
				title: `${Titles.ConnectLifeCylceMethods}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.ComponentApi,
						singleLink: true,
						nodeTypes: [ NodeTypes.ComponentApi ]
					});
				},
				icon: 'fa fa-genderless',
				title: `${Titles.InternalApiConnection}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						singleLink: true,
						nodeTypes: [ NodeTypes.DataChain ]
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.ConnectToDataChainResponseHandler}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.PreDataChainLink,
						singleLink: true,
						nodeTypes: [ NodeTypes.DataChain ]
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.ConnectToDataChainPrecallHandler}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.CallDataChainLink,
						singleLink: true,
						nodeTypes: [ NodeTypes.DataChain ]
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.ConnectToDataChainCaller}`
			}
		);

		return result;
	}

	getEventInstanceMethods(currentNode) {
		const result = [];

		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.EventMethod
					});
				},
				icon: 'fa fa-list-ol',
				title: `${Titles.ConnectEventMethods}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.NavigationMethod
					});
				},
				icon: 'fa fa-map-signs',
				title: `${Titles.NavigateTo}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.EventHandler,
						singleLink: true,
						nodeTypes: [ NodeTypes.EventHandler ]
					});
				},
				icon: 'fa fa-vimeo',
				title: `${Titles.ConnectEventHandler}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						singleLink: true,
						nodeTypes: [ NodeTypes.DataChain ]
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.DataChain}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.ComponentApi,
						singleLink: true,
						nodeTypes: [ NodeTypes.ComponentApi ]
					});
				},
				icon: 'fa fa-genderless',
				title: `${Titles.InternalApiConnection}`
			},
			{
				onClick: () => {
					if (currentNode) this.props.attachToNavigateNode(currentNode.id, NavigateTypes.Back);
				},
				icon: 'fa fa-backward',
				title: `${Titles.NavigateBack}`
			}
		);

		return result;
	}

	getValidatorContext() {
		const result = [];

		result.push({
			onClick: () => {
				this.props.setVisual(CONNECTING_NODE, {
					...LinkProperties.ValidatorServiceMethod
				});
			},
			icon: 'fa fa-rocket',
			title: `${Titles.ValidatorServiceMethod}`
		});

		return result;
	}

	getComponentContext() {
		const result = [];
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						autoConnectViewType: currentNode.id
					});
				},
				icon: 'fa fa-soccer-ball-o',
				title: `${Titles.All}`
			},
			{
				onClick: () => {
					this.props.graphOperation([
						{
							operation: UIA.ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.ComponentApi,
									parent: currentNode.id,
									linkProperties: {
										properties: { ...LinkProperties.ComponentInternalApi }
									},
									groupProperties: {},
									properties: {
										[NodeProperties.UIText]: `value`
									}
								};
							}
						}
					]);
				},
				icon: 'fa fa-plus',
				title: `${Titles.AddComponentApi}`
			},
			{
				onClick: () => {
					this.props.graphOperation([
						{
							operation: UIA.ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.ComponentExternalApi,
									parent: currentNode.id,

									linkProperties: {
										properties: { ...LinkProperties.ComponentExternalApi }
									},
									groupProperties: {},
									properties: {
										[NodeProperties.UIText]: `value`
									}
								};
							}
						}
					]);
				},
				icon: 'fa fa-plus-circle',
				title: `${Titles.AddComponentExtApi}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.Style,
						singleLink: false,
						nodeTypes: [ NodeTypes.Style ]
					});
				},
				icon: 'fa fa-css3',
				title: Titles.Style
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						singleLink: false,
						nodeTypes: [ NodeTypes.DataChain ]
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.DataChain}`
			}
		);

		return result;
	}

	getModelContext() {
		const result = [];

		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DefaultViewType,
						viewType: ViewTypes.Get
					});
				},
				icon: 'fa fa-get-pocket',
				title: `${ViewTypes.Get}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DefaultViewType,
						viewType: ViewTypes.GetAll
					});
				},
				icon: 'fa fa-reply-all',
				title: `${ViewTypes.GetAll}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DefaultViewType,
						viewType: ViewTypes.Create
					});
				},
				icon: 'fa fa-calendar-plus-o',
				title: `${ViewTypes.Create}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DefaultViewType,
						viewType: ViewTypes.Update
					});
				},
				icon: 'fa fa-fire',
				title: `${ViewTypes.Update}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DefaultViewType,
						viewType: ViewTypes.Delete
					});
				},
				icon: 'fa fa-remove',
				title: `${ViewTypes.Delete}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DefaultViewType,
						viewType: true,
						all: true
					});
				},
				icon: 'fa fa-soccer-ball-o',
				title: `${Titles.All}`
			}
		);

		return result;
	}

	getDataChainContext() {
		const result = [];
		result.push(
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						context: 'Input1'
					});
				},
				icon: 'fa fa-font',
				title: `${Titles.Input} 1`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						context: 'Value'
					});
				},
				icon: 'fa fa-money',
				title: `${Titles.Value}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						context: 'StandardLink'
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.StandardLink}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainInputLink,
						nodeTypes: [ NodeTypes.ComponentApi, NodeTypes.ComponentExternalApi ]
					});
				},
				icon: 'fa fa-chain',
				title: `${Titles.DataChainInput}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.DataChainLink,
						context: 'InsertDataChain'
					});
				},
				icon: 'fa fa-yc',
				title: `${Titles.Insert}`
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.Style,
						nodeTypes: [ NodeTypes.Style ]
					});
				},
				icon: 'fa fa-css3',
				title: 'Modify Style'
			},
			{
				onClick: () => {
					this.props.setVisual(CONNECTING_NODE, {
						...LinkProperties.SelectorLink,
						nodeTypes: [ NodeTypes.Selector ]
					});
				},
				icon: 'fa fa-fire',
				title: 'Selector Input'
			}
		);

		return result;
	}

	getCost() {
		const { state } = this.props;
		let cost = 0;
		const graph = UIA.GetCurrentGraph(state);
		const node_cost = UIA.Visual(state, UIA.NODE_COST) || 0;
		const node_connection_cost = UIA.Visual(state, UIA.NODE_CONNECTION_COST) || 0;

		if (graph) {
			cost =
				Object.keys(graph.linkLib || {}).length * node_connection_cost +
				Object.keys(graph.nodeLib || {}).length * node_cost;
		}
		return Dashboard.formatMoney(cost, 2, '.', ',');
	}

	static formatMoney(number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
	}

	render() {
		const { state } = this.props;
		const cost = this.getCost();
		const selectedNodeBB = UIA.Visual(state, UIA.SELECTED_NODE_BB);
		let menuLeft = 0;
		let menuTop = 0;
		if (selectedNodeBB) {
			menuLeft = selectedNodeBB.right;
			menuTop = selectedNodeBB.top;
		}
		const nodeSelectionMenuItems = this.nodeSelectionMenuItems();
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const graph = UIA.GetCurrentGraph(state);
		const rootGraph = UIA.GetRootGraph(state);
		const vgraph = UIA.GetVisualGraph(state);
		const mainContent = UIA.Visual(state, MAIN_CONTENT);
		let version = '0.0.0';
		let workspace = null;
		if (rootGraph) {
			version = `${rootGraph.version.major}.${rootGraph.version.minor}.${rootGraph.version.build}`;
			workspace = rootGraph.workspaces
				? rootGraph.workspaces[platform()] || rootGraph.workspace
				: rootGraph.workspace;
		}
		let hoveredLink = null;
		if (UIA.Visual(state, UIA.HOVERED_LINK)) {
			hoveredLink = getLinkInstance(rootGraph, UIA.Visual(state, UIA.HOVERED_LINK));
		}
		let applicationConfig = UIA.Visual(state, 'ApplicationConfig');

		return (
			<div
				className={`skin-red sidebar-mini skin-red ${this.minified()}`}
				style={{
					height: 'auto',
					minHeight: '100vh'
				}}
			>
				<div className="wrapper" style={{ height: '100vh' }}>
					<GooMenuSVG />
					<GooMenu
						visible={UIA.Visual(state, UIA.SELECTED_NODE)}
						left={menuLeft - 20}
						open={UIA.Visual(state, NODE_MENU)}
						onToggle={() => {
							this.props.toggleVisual(NODE_MENU);
						}}
						top={menuTop + 30}
						menuItems={nodeSelectionMenuItems}
					/>
					<div data-tid="container">
						<Header>
							<DashboardLogo />
							<DashboardNavBar>
								<SidebarToggle />

								<NavBarMenu>
									{UIA.Visual(state, UIA.SELECTED_LINK) ? (
										<NavBarButton
											icon="fa fa-cube"
											onClick={() => {
												this.props.graphOperation(
													UIA.REMOVE_LINK_BETWEEN_NODES,
													UIA.Visual(state, UIA.SELECTED_LINK)
												);
												this.props.setVisual(UIA.SELECTED_LINK, null);
											}}
										/>
									) : null}
									<GraphMenu />
									{/* <NavBarButton icon={'fa fa-asterisk'} onClick={() => {
										clipboard.writeText(UIA.generateDataSeeds());
									}} /> */}
									<NavBarButton
										icon="fa fa-asterisk"
										onClick={() => {
											this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
												source: currentNode.id,
												target: currentNode.id
											});
										}}
									/>
									<NavBarButton
										icon="fa fa-plus"
										onClick={() => {
											this.props.graphOperation(UIA.NEW_NODE, {});
											this.props.setVisual(SIDE_PANEL_OPEN, true);
											this.props.setVisual(SELECTED_TAB, DEFAULT_TAB);
										}}
									/>

									<NavBarButton
										icon="fa fa-minus"
										onClick={() => {
											this.props.graphOperation(UIA.REMOVE_NODE, {
												id: UIA.Visual(state, UIA.SELECTED_NODE)
											});
											this.props.setVisual(SIDE_PANEL_OPEN, false);
											this.props.setVisual(SELECTED_TAB, DEFAULT_TAB);
										}}
									/>
									<NavBarButton
										onClick={() => {
											this.props.toggleVisual('side-panel-open');
										}}
									/>
								</NavBarMenu>
								<NavBarMenu paddingRight={15}>
									<NavBarButton
										icon="fa fa-remove"
										title={Titles.ClearPinned}
										onClick={() => {
											this.props.graphOperation(
												UIA.GetNodes(state)
													.filter((x) => UIA.GetNodeProp(x, NodeProperties.Pinned))
													.map((node) => ({
														operation: UIA.CHANGE_NODE_PROPERTY,
														options: {
															prop: UIA.NodeProperties.Pinned,
															id: node.id,
															value: false
														}
													}))
											);
										}}
									/>
								</NavBarMenu>
								<NavBarMenu paddingRight={15} style={{ float: 'left' }}>
									<NavBarButton
										active
										hideArrow
										title={Titles.MindMap}
										icon="fa fa-map"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, MIND_MAP);
										}}
									/>
									<NavBarButton
										active={mainContent === CODE_VIEW}
										hideArrow
										title={Titles.CodeView}
										icon="fa fa-code"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, CODE_VIEW);
										}}
									/>
								</NavBarMenu>
								<NavBarMenu paddingRight={15} style={{ float: 'left' }}>
									<NavBarButton
										title={Titles.New}
										icon="fa fa-plus"
										onClick={() => {
											this.props.newRedQuickBuilderGraph();
										}}
									/>
									<NavBarButton
										title={'CODE_EDITOR'}
										icon="fa fa-code"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, CODE_EDITOR);
										}}
									/>
									<NavBarButton
										title={Titles.Open}
										icon="fa fa-folder-open"
										onClick={() => {
											this.props.openRedQuickBuilderGraph(
												true,
												UIA.Visual(state, 'clear_pinned_nodes')
											);
										}}
									/>
									<NavBarButton
										title={
											UIA.Visual(state, 'clear_pinned_nodes') ? 'without pinned' : 'with pinned'
										}
										onClick={() => {
											this.props.setVisual(
												'clear_pinned_nodes',
												!!!UIA.Visual(state, 'clear_pinned_nodes')
											);
										}}
									/>
									<NavBarButton
										title={`${Titles.Record} ${UIA.GetRecording().length}`}
										icon={UIA.Visual(state, UIA.RECORDING) ? 'fa fa-pause' : 'fa fa-play'}
										onClick={() => {
											this.props.toggleVisual(UIA.RECORDING);
										}}
									/>
									<NavBarButton
										title={`${Titles.Save} ${Titles.Record}`}
										icon="fa fa-save"
										onClick={() => {
											const recording = UIA.GetRecording();
											this.props.saveRecording(recording);
										}}
									/>
									{UIA.GetRecording().length ? (
										<NavBarButton
											title={`${Titles.Record} ${UIA.GetRecording().length}`}
											icon="fa fa-stop"
											onClick={() => {
												this.props.setVisual(UIA.RECORDING, false);
												this.props.clearRecording();
											}}
										/>
									) : null}
									{rootGraph ? (
										<NavBarButton
											title={Titles.SaveAs}
											icon="fa fa-cloud-upload"
											onClick={() => {
												this.props.saveGraphToFile();
											}}
										/>
									) : null}

									{rootGraph ? (
										<NavBarButton
											title={`${Titles.SaveAs} Pruned`}
											icon="fa fa-cloud-upload"
											onClick={() => {
												this.props.saveGraphToFile(true);
											}}
										/>
									) : null}
									{rootGraph && rootGraph.graphFile ? (
										<NavBarButton
											title={Titles.Save}
											icon="fa fa-save"
											onClick={() => {
												this.props.saveGraph();
											}}
										/>
									) : null}
									{rootGraph ? (
										<NavBarButton
											title={Titles.Scaffold}
											icon="fa fa-building"
											onClick={() => {
												if (confirm('Are you sure you want to scaffold the project'))
													this.props.scaffoldProject();
											}}
										/>
									) : null}
									{rootGraph ? (
										<NavBarButton
											title={Titles.PublishFiles}
											icon="fa fa-building-o"
											onClick={() => {
												this.props.scaffoldProject({ filesOnly: true });
											}}
										/>
									) : null}
									{rootGraph ? (
										<NavBarButton
											title={Titles.SetWorkingDirectory}
											icon="fa fa-folder-open"
											onClick={() => {
												this.props.setWorkingDirectory();
											}}
										/>
									) : null}
									{rootGraph ? <NavBarButton title={version} /> : null}
									{workspace ? <NavBarButton title={workspace} icon="fa fa-cog" /> : null}
									{rootGraph ? (
										<NavBarButton
											title={Titles.SaveThemeAs}
											icon="fa fa-paint-brush"
											secondaryicon="fa fa-save fa-x1"
											onClick={() => {
												const theme = UIA.GetCurrentTheme();
												this.props.saveTheme(theme);
											}}
										/>
									) : null}
									{rootGraph ? (
										<NavBarButton
											title={Titles.SelectThemeFromFile}
											icon="fa fa-paint-brush"
											secondaryicon="fa fa-folder-open-o"
											onClick={() => {
												this.props.openRedQuickBuilderTheme();
											}}
										/>
									) : null}
								</NavBarMenu>
							</DashboardNavBar>
						</Header>
						<MainSideBar overflow>
							<SideBarMenu>
								<SideBarHeader
									title={Titles.MainNavigation}
									onClick={() => {
										this.props.toggleVisual('MAIN_NAV');
									}}
								/>
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === MIND_MAP || !mainContent}
										hideArrow
										title={Titles.MindMap}
										icon="fa fa-map"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, MIND_MAP);
										}}
									/>
								) : null}
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === CODE_VIEW}
										title={Titles.CodeView}
										icon="fa fa-code"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, CODE_VIEW);
										}}
									/>
								) : null}
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === LAYOUT_VIEW}
										title={Titles.Layout}
										icon="fa fa-code"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
										}}
									/>
								) : null}
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === THEME_VIEW}
										title={Titles.Theme}
										icon="fa-paint-brush"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, THEME_VIEW);
										}}
									/>
								) : null}
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === TRANSLATION_VIEW}
										title={Titles.Titles}
										icon="fa fa-sort-alpha-asc"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, TRANSLATION_VIEW);
										}}
									/>
								) : null}
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === PROGRESS_VIEW}
										title={Titles.Progress}
										icon="fa  fa-industry"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, PROGRESS_VIEW);
										}}
									/>
								) : null}
								{UIA.Visual(state, 'MAIN_NAV') ? (
									<TreeViewMenu
										active={mainContent === AGENT_ACCESS_VIEW}
										title={Titles.AgentAccess}
										icon="fa   fa-user-secret"
										onClick={() => {
											this.props.setVisual(MAIN_CONTENT, AGENT_ACCESS_VIEW);
										}}
									/>
								) : null}

								{hoveredLink && hoveredLink.properties ? (
									<SideBarHeader title={hoveredLink.properties.type} />
								) : null}
								<SideBarHeader title={<h4>{cost}</h4>} onClick={() => {}} />

								<TreeViewMenu
									open={UIA.Visual(state, VC.ApplicationMenu)}
									active={UIA.Visual(state, VC.ApplicationMenu)}
									title={Titles.AppMenu}
									toggle={() => {
										this.props.toggleVisual(VC.ApplicationMenu);
									}}
								>
									<TreeViewMenu
										hideArrow
										title={Titles.New}
										icon="fa fa-plus"
										onClick={() => {
											this.props.newRedQuickBuilderGraph();
										}}
									/>
									<TreeViewMenu
										hideArrow
										title={Titles.Open}
										icon="fa fa-folder-open"
										onClick={() => {
											this.props.openRedQuickBuilderGraph();
										}}
									/>
									<TreeViewMenu
										open={UIA.Visual(state, 'job configs')}
										active={UIA.Visual(state, 'job configs')}
										title={Titles.JobConfigs}
										toggle={() => {
											this.props.toggleVisual('job configs');
										}}
									>
										<TreeViewMenu
											description={Titles.JobPath}
											title={
												applicationConfig ? (
													applicationConfig[JobServiceConstants.JOB_PATH] || Titles.JobPath
												) : (
													Titles.JobPath
												)
											}
											icon="fa fa-info"
											onClick={() => {
												this.props.setJobFolder(JobServiceConstants.JOB_PATH);
											}}
										/>
										<TreeViewMenu
											description={Titles.JobsFilePath}
											title={
												applicationConfig ? (
													applicationConfig[JobServiceConstants.JOBS_FILE_PATH] ||
													Titles.JobsFilePath
												) : (
													Titles.JobsFilePath
												)
											}
											icon="fa fa-info"
											onClick={() => {
												this.props.setJobFolder(JobServiceConstants.JOBS_FILE_PATH);
											}}
										/>
									</TreeViewMenu>
									{rootGraph ? (
										<TreeViewMenu
											hideArrow
											title={Titles.SaveAs}
											icon="fa fa-cloud-upload"
											onClick={() => {
												this.props.saveGraphToFile();
											}}
										/>
									) : null}
									{rootGraph && rootGraph.fileName ? (
										<TreeViewMenu
											hideArrow
											title={Titles.Save}
											icon="fa fa-save"
											onClick={() => {
												this.props.saveGraph();
											}}
										/>
									) : null}
									{rootGraph ? (
										<TreeViewMenu
											hideArrow
											title={Titles.Scaffold}
											icon="fa fa-building"
											onClick={() => {
												if (confirm('Are you sure you want to scaffold the project'))
													this.props.scaffoldProject();
											}}
										/>
									) : null}
									{rootGraph ? (
										<TreeViewMenu
											hideArrow
											title={Titles.PublishFiles}
											icon="fa fa-building-o"
											onClick={() => {
												this.props.scaffoldProject({ filesOnly: true });
											}}
										/>
									) : null}
									{rootGraph ? (
										<TreeViewMenu
											hideArrow
											title={Titles.SetWorkingDirectory}
											icon="fa fa-folder-open"
											onClick={() => {
												this.props.setWorkingDirectory();
											}}
										/>
									) : null}
									{rootGraph ? <TreeViewMenu title={version} hideArrow /> : null}
									{workspace ? <TreeViewMenu hideArrow title={workspace} icon="fa fa-cog" /> : null}
									<SectionEdit />
								</TreeViewMenu>
								<TreeViewMenu
									open={UIA.Visual(state, VC.GraphPropertiesMenu)}
									active={UIA.Visual(state, VC.GraphPropertiesMenu)}
									title={Titles.GraphPropertiesMenu}
									toggle={() => {
										this.props.toggleVisual(VC.GraphPropertiesMenu);
									}}
								>
									<TreeViewItemContainer>
										<Slider
											min={30}
											max={500}
											onChange={(value) => {
												this.props.setVisual(LINK_DISTANCE, value);
											}}
											value={UIA.Visual(state, LINK_DISTANCE)}
										/>
									</TreeViewItemContainer>
									<TreeViewItemContainer>
										<DepthChoice />
									</TreeViewItemContainer>
								</TreeViewMenu>
								<SectionList />
								<NodeManagement />
								{/* <MaestroDetailsMenu /> */}
								<ControllerDetailsMenu />
							</SideBarMenu>
						</MainSideBar>
						<Content>
							<CodeView active={UIA.Visual(state, MAIN_CONTENT) === CODE_VIEW} />
							<LayoutView active={UIA.Visual(state, MAIN_CONTENT) === LAYOUT_VIEW} />
							<ThemeView active={UIA.Visual(state, MAIN_CONTENT) === THEME_VIEW} />
							<AgentAccessView active={UIA.Visual(state, MAIN_CONTENT) === AGENT_ACCESS_VIEW} />
							<TranslationView active={UIA.Visual(state, MAIN_CONTENT) === TRANSLATION_VIEW} />
							<ProgressView active={UIA.Visual(state, MAIN_CONTENT) === PROGRESS_VIEW} />
							<CodeEditor active={UIA.Visual(state, MAIN_CONTENT) === CODE_EDITOR} />
							{mainContent === MIND_MAP || true ? (
								<MindMap
									linkDistance={UIA.Visual(state, LINK_DISTANCE)}
									onNodeClick={(nodeId, boundingBox) => {
										if (UIA.Visual(state, CONNECTING_NODE)) {
											const selectedId = UIA.Visual(state, UIA.SELECTED_NODE);
											console.log(`selectedId:${selectedId} => nodeId:${nodeId}`);
											const properties = UIA.Visual(state, CONNECTING_NODE);
											if (properties === true) {
												this.props.graphOperation(UIA.NEW_LINK, {
													target: nodeId,
													source: selectedId
												});
											} else if (properties && properties.type === LinkType.SharedComponent) {
												this.props.setSharedComponent({
													properties,
													target: nodeId,
													source: selectedId
												});
											} else if (
												properties &&
												properties.type === LinkType.ComponentApiConnection
											) {
												this.props.setComponentApiConnection({
													properties,
													target: nodeId,
													source: selectedId
												});
											} else if (
												properties &&
												[
													LinkType.LifeCylceMethod,
													LinkType.EventMethod,
													LinkType.NavigationMethod
												].some((v) => v === properties.type)
											) {
												this.props.connectLifeCycleMethod({
													properties,
													target: nodeId,
													source: selectedId
												});
											} else if (properties && properties.type === LinkType.ModelItemFilter) {
												this.props.graphOperation([
													{
														operation: UIA.CHANGE_NODE_PROPERTY,
														options: {
															id: selectedId,
															prop: NodeProperties.FilterModel,
															value: nodeId
														}
													},
													{
														operation: UIA.CHANGE_NODE_PROPERTY,
														options: {
															id: selectedId,
															prop: NodeProperties.ModelItemFilter,
															value: nodeId
														}
													}
												]);

												this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
													target: nodeId,
													source: selectedId,
													properties: {
														...UIA.LinkProperties.ModelItemFilter,
														...createEventProp(LinkEvents.Remove, {
															function: 'OnRemoveModelFilterPropConnection'
														})
													}
												});
											} else if (properties && properties.viewType) {
												this.props.setupDefaultViewType({
													properties,
													target: nodeId,
													source: selectedId
												});
												this.props.SelectedNode(null);
											} else if (properties && properties.allOfType) {
												this.props.addAllOfType({
													properties,
													target: nodeId,
													source: selectedId
												});
											} else if (properties && properties.autoConnectViewType) {
												let connectto = [];
												Object.values(ViewTypes).map((viewType) => {
													connectto = UIA.getViewTypeEndpointsForDefaults(
														viewType,
														null,
														nodeId
													);
													connectto.map((ct) => {
														this.props.setSharedComponent({
															properties: {
																...LinkProperties.DefaultViewType,
																viewType
															},
															source: ct.id,
															target: properties.autoConnectViewType
														});
													});
												});
											} else if (properties && properties.context) {
												switch (properties.type) {
													case LinkType.DataChainLink:
														const func = DataChainContextMethods[properties.context].bind(
															this
														);
														func(currentNode, nodeId);
														break;
													default:
														break;
												}
											} else {
												const targetNodeType = UIA.GetNodeProp(nodeId, NodeProperties.NODEType);
												if (
													properties.nodeTypes &&
													properties.nodeTypes.length &&
													!properties.nodeTypes.some((t) => targetNodeType === t)
												) {
												} else {
													let skip = false;
													if (
														properties &&
														properties.properties &&
														Object.keys(properties.properties)
															.map(
																(key) =>
																	UIA.GetNodeProp(nodeId, key) !==
																	properties.properties[key]
															)
															.find((x) => x)
													) {
														skip = true;
													}
													if (skip) {
													} else if (properties.singleLink) {
														this.props.graphOperation([
															...getNodesByLinkType(graph, {
																type: properties.type,
																direction: SOURCE,
																id: selectedId
															}).map((rm) => ({
																operation: UIA.REMOVE_LINK_BETWEEN_NODES,
																options: {
																	target: rm.id,
																	source: selectedId
																}
															})),
															{
																operation: UIA.NEW_LINK,
																options: {
																	target: nodeId,
																	source: selectedId,
																	properties
																}
															}
														]);
													} else {
														this.props.graphOperation(UIA.NEW_LINK, {
															target: nodeId,
															source: selectedId,
															properties
														});
													}
												}
											}
											this.props.setVisual(CONNECTING_NODE, false);
											this.props.setVisual(UIA.SELECTED_NODE, null);
										} else if ([ UIA.Visual(state, UIA.SELECTED_NODE) ].indexOf(nodeId) === -1) {
											// this.props.SelectedNode(nodeId);
											// this.props.setVisual(UIA.SELECTED_NODE_BB, boundingBox);
                      // this.props.setVisual(SIDE_PANEL_OPEN, true);
                      this.props.SelectNode(nodeId, boundingBox);
										} else {
											this.props.SelectedNode(null);
										}
									}}
									onLinkClick={(linkId, boundingBox) => {
										console.log(`link id : ${linkId}`);
										this.props.setVisual(UIA.SELECTED_LINK, linkId);

										this.props.setVisual(UIA.HOVERED_LINK, linkId);
									}}
									minimizeTypes={UIA.Minimized(state)}
									selectedColor={UIA.Colors.SelectedNode}
									markedColor={UIA.Colors.MarkedNode}
									selectedLinks={[ UIA.Visual(state, UIA.SELECTED_LINK) ].filter((x) => x)}
									selectedNodes={[ UIA.Visual(state, UIA.SELECTED_NODE) ].filter((x) => x)}
									markedNodes={graph ? graph.markedSelectedNodeIds : []}
									graph={vgraph || graph}
								/>
							) : null}{' '}
						</Content>
						<SideBar
							open={UIA.Visual(state, SIDE_PANEL_OPEN) && !Paused()}
							style={{ overflowY: 'auto', maxHeight: '100vh', height: '100vh' }}
							extraWide={UIA.IsCurrentNodeA(state, UIA.NodeTypes.ExtensionType)}
						>
							<SideBarTabs>
								<SideBarTab
									icon="fa fa-cog"
									active={UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB)}
									onClick={() => {
										this.props.setVisual(SELECTED_TAB, DEFAULT_TAB);
									}}
								/>
								<SideBarTab
									active={UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB)}
									onClick={() => {
										this.props.setVisual(SELECTED_TAB, PARAMETER_TAB);
									}}
								/>
								<SideBarTab
									active={UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB)}
									onClick={() => {
										this.props.setVisual(SELECTED_TAB, SCOPE_TAB);
									}}
								/>
								<SideBarTab
									icon="fa fa-institution"
									active={UIA.VisualEq(state, SELECTED_TAB, QUICK_MENU)}
									onClick={() => {
										this.props.setVisual(SELECTED_TAB, QUICK_MENU);
									}}
								/>
							</SideBarTabs>
							{currentNode &&
							!ExcludeDefaultNode[UIA.GetNodeProp(currentNode, NodeProperties.NODEType)] ? (
								<SideMenuContainer
									active
									tab={DEFAULT_TAB}
									key="node-properties"
									title={Titles.NodeProperties}
								>
									<FormControl>
										<SideBarMenu>
											<SideBarHeader
												onClick={() => {
													clipboard.writeText(UIA.Visual(state, UIA.SELECTED_NODE));
												}}
												title={UIA.Visual(state, UIA.SELECTED_NODE)}
											/>
										</SideBarMenu>
										<ChoiceListItemActivityMenu />
										{/* <ConditionActivityMenu /> */}
										<DataChainActvityMenu />
										<TextInput
											label={Titles.NodeLabel}
											value={currentNode.properties ? currentNode.properties.text : ''}
											onChange={(value) => {
												this.props.graphOperation(UIA.CHANGE_NODE_TEXT, {
													id: currentNode.id,
													value
												});
											}}
										/>
										{NotSelectableNodeTypes[
											currentNode.properties
												? UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType)
												: null
										] ? null : (
											<SelectInput
												disabled={!UIA.CanChangeType(currentNode)}
												label={Titles.NodeType}
												options={Object.keys(UIA.NodeTypes)
													.filter((x) => !NotSelectableNodeTypes[UIA.NodeTypes[x]])
													.sort((a, b) => a.localeCompare(b))
													.map((x) => ({
														value: UIA.NodeTypes[x],
														title: x
													}))}
												onChange={(value) => {
													this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
														prop: UIA.NodeProperties.NODEType,
														id: currentNode.id,
														value
													});
												}}
												value={
													currentNode.properties ? (
														UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType)
													) : null
												}
											/>
										)}
										<CheckBox
											label={Titles.Collapsed}
											value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Collapsed)}
											onChange={(value) => {
												this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
													prop: UIA.NodeProperties.Collapsed,
													id: currentNode.id,
													value
												});
											}}
										/>
										<CheckBox
											label={Titles.Pinned}
											title={Titles.PinnedShortCut}
											value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Pinned)}
											onChange={(value) => {
												this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
													prop: UIA.NodeProperties.Pinned,
													id: currentNode.id,
													value
												});
											}}
										/>
										<CheckBox
											label={Titles.Selected}
											title={Titles.SelectedShortCut}
											value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Selected)}
											onChange={(value) => {
												this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
													prop: UIA.NodeProperties.Selected,
													id: currentNode.id,
													value
												});
											}}
										/>
										{UIA.GetNodeProp(currentNode, NodeProperties.NODEType) ===
										UIA.NodeTypes.ComponentExternalApi ? (
											<CheckBox
												label={Titles.IsUrlParameter}
												title={Titles.IsUrlParameter}
												value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.IsUrlParameter)}
												onChange={(value) => {
													this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
														prop: UIA.NodeProperties.IsUrlParameter,
														id: currentNode.id,
														value
													});
												}}
											/>
										) : null}
										{UIA.GetNodeProp(currentNode, NodeProperties.NODEType) ===
										UIA.NodeTypes.ComponentApi ? (
											<CheckBox
												label={Titles.AsLocalContext}
												title={`${Titles.AsLocalContext}, usually for listitem.`}
												value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.AsLocalContext)}
												onChange={(value) => {
													this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
														prop: UIA.NodeProperties.AsLocalContext,
														id: currentNode.id,
														value
													});
												}}
											/>
										) : null}
									</FormControl>
								</SideMenuContainer>
							) : null}

							{UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (
								<ConditionFilterMenu methodDefinitionKey="validation" />
							) : null}
							{UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (
								<ConditionFilterMenu methodDefinitionKey="permission" />
							) : null}
							{UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (
								<ConditionFilterMenu methodDefinitionKey="filter" />
							) : null}
							{UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (
								<ConditionFilterMenu view="datasource" />
							) : null}
							<CommonActivityMenu />
							<ModelActivityMenu />
							{UIA.VisualEq(state, SELECTED_TAB, PARAMETER_TAB) ? (
								<SideBarContent>
									<ControllerActivityMenu />
									<ModelFilterItemActivityMenu />
									<DataSourceActivityMenu />
									<SelectorActivityMenu />
									<ViewModelActivityMenu />
									<FunctionActivityMenu />
									<ConfigurationActivityMenu />
									<MethodActivityMenu />
									<ComponentActivityMenu />
									<AttributeFormControl />
									<ParameterActivityMenu />
									<ValidatorActivityMenu />
									<ExecutorActivityMenu />
									<PropertyActivityMenu />
									<ValidationItemFormControl />
									<ChoiceActivityMenu />
									<MaestroActivityMenu />
									<ScreenActivityMenu />
									<ValidationActivityMenu />
									<OptionActivityMenu />
									<ExtensionListActivityMenu />
									<ScreenOptionsActivityMenu />
									<OptionItemFormControl />
									<PermissionActivityMenu />
									<ExtensionDefinitionMenu />
									<ModelFilterActivityMenu />
									<PermissionDependencyActivityMenu />
									<AfterEffectsActivityMenu />
									<EnumerationActivityMenu />
									<ServiceActivityMenu />
								</SideBarContent>
							) : null}
							<ComponentPropertyMenu />
							<ComponentAPIMenu />
							<EventHandlerActivityMenu />
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (
								<SideBarContent>
									<ValidatorPropertyMenu />
									<ReferenceActivityMenu />
									<ExecutorPropertyMenu />
									<ModelRelationshipMenu />
									<MethodPropertyMenu />
									<PermissionMenu />
									<ModelFilterMenu />
								</SideBarContent>
							) : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? <ValidatorPropertyActivityMenu /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? <ExecutorPropertyActivityMenu /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (
								<ExecutorPropertyActivityMenu
									ui={FilterUI}
									modelKey={NodeProperties.ModelItemFilter}
									nodeType={NodeTypes.ModelItemFilter}
									nodeProp={NodeProperties.FilterModel}
								/>
							) : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? (
								<ExecutorPropertyActivityMenu
									ui={FilterUI}
									modelKey={NodeProperties.Condition}
									nodeType={NodeTypes.Condition}
									nodeProp={NodeProperties.Condition}
								/>
							) : null}
							{UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB) ? <DataChainOperator /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB) ? <ServiceIntefaceMenu /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB) ? <StyleMenu /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? <UIParameters /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? <NavigationParameterMenu /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, SCOPE_TAB) ? <MethodParameterMenu /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, QUICK_MENU) ? <QuickMethods /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, QUICK_MENU) ? <CurrentNodeProperties /> : null}
							{UIA.VisualEq(state, SELECTED_TAB, DEFAULT_TAB) ? <ThemeProperties /> : null}
						</SideBar>
					</div>
				</div>
				<ContextMenu />
			</div>
		);
	}
}
export const SELECTED_TAB = 'SELECTED_TAB';
export const DEFAULT_TAB = 'DEFAULT_TAB';
export const PARAMETER_TAB = 'PARAMETER_TAB';
export const SCOPE_TAB = 'SCOPE_TAB';
export const QUICK_MENU = 'QUICK_MENU';
export default UIConnect(Dashboard);
