/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable compat/compat */
/* eslint-disable no-new */
/* eslint-disable no-constant-condition */
/* eslint-disable camelcase */
/* eslint-disable func-names */
import {
	MethodFunctions,
	FunctionTypes,
	FunctionTemplateKeys,
	HTTP_METHODS,
	QUERY_PARAMETER_KEYS
} from './functiontypes';
import {
	NodeTypes,
	LinkProperties,
	NodeProperties,
	Methods,
	UITypes,
	GroupProperties,
	LinkType,
	LinkPropertyKeys,
	SelectorPropertyKeys,
	ApiNodeKeys
} from './nodetypes';
import * as _ from '../methods/graph_types';
import {
	ADD_NEW_NODE,
	GetAgentNodes,
	GetUsers,
	GetNodeProp,
	GetNodeTitle,
	PerformGraphOperation,
	CHANGE_NODE_PROPERTY,
	ADD_LINK_BETWEEN_NODES,
	GetNodeById,
	ModelNotConnectedToFunction,
	GetCurrentGraph,
	GetStateFunc,
	GetDispatchFunc,
	NodePropertyTypes,
	Node,
	Visual,
	SELECTED_NODE,
	GetState,
	NEW_SCREEN_OPTIONS,
	NEW_COMPONENT_NODE,
	GetModelPropertyChildren,
	GetDataChainNextId,
	GetNodesByProperties,
	getViewTypeEndpointsForDefaults,
	NEW_DATA_SOURCE,
	GetNodeByProperties,
	getGroup,
	SelectedNode,
	GetCodeName,
	ADD_DEFAULT_PROPERTIES,
	GetSharedComponentFor,
	NodesByType,
	addInstanceFunc,
	GetComponentExternalApiNode,
	GetComponentInternalApiNode,
	ADD_LINKS_BETWEEN_NODES,
	NO_OP,
	addComponentTags,
	SetSharedComponent,
	ValidationPropName,
	GetGraphNode
} from '../actions/uiactions';
import {
	CreateLayout,
	SetCellsLayout,
	GetCellProperties,
	GetFirstCell,
	GetChildren,
	existsLinkBetween,
	GetNodesLinkedTo,
	setViewPackageStamp
} from '../methods/graph_methods';
import * as GraphMethods from '../methods/graph_methods';
import {
	ComponentTypes,
	InstanceTypes,
	ARE_BOOLEANS,
	ARE_HANDLERS,
	HandlerTypes,
	ARE_TEXT_CHANGE,
	ON_BLUR,
	ON_CHANGE,
	ON_CHANGE_TEXT,
	ON_FOCUS,
	SHARED_COMPONENT_API,
	GENERAL_COMPONENT_API,
	SCREEN_COMPONENT_EVENTS,
	PropertyApiList,
	ApiProperty,
	ComponentApiTypes,
	ComponentLifeCycleEvents,
	ComponentTags,
	ComponentTypeKeys
} from './componenttypes';
import * as Titles from '../components/titles';
import { createComponentApi, addComponentApi } from '../methods/component_api_methods';
import {
	DataChainFunctionKeys,
	SplitDataCommand,
	AddChainCommand,
	InsertNodeInbetween,
	DataChainName
} from './datachain';
import { uuidv4 } from '../utils/array';
import PostAuthenticate from '../nodepacks/PostAuthenticate';
import HomeView from '../nodepacks/HomeView';
import AddNavigateBackHandler from '../nodepacks/AddNavigateBackHandler';
import CreateSelectorToDataChainSelectorDC from '../nodepacks/CreateSelectorToDataChainSelectorDC';
import ConnectListViewModelToExternalViewModel from '../nodepacks/ConnectListViewModelToExternalViewModel';
import LoadModel from '../nodepacks/LoadModel';
import ConnectLifecycleMethodToDataChain from '../nodepacks/ConnectLifecycleMethodToDataChain';
import SetModelsApiLinkForInstanceUpdate from '../nodepacks/SetModelsApiLinkForInstanceUpdate';
import SetupViewModelOnScreen from '../nodepacks/SetupViewModelOnScreen';
import AppendGetIdsToDataChain from '../nodepacks/AppendGetIdsToDataChain';
import GetModelViewModelForUpdate from '../nodepacks/GetModelViewModelForUpdate';
import { ViewTypes } from './viewtypes';
import ConnectLifecycleMethod from '../components/ConnectLifecycleMethod';
import UpdateMethodParameters from '../nodepacks/method/UpdateMethodParameters';
import AttachMethodToMaestro from '../nodepacks/method/AttachMethodToMaestro';
import CreateGetObjectDataChain from '../nodepacks/CreateGetObjectDataChain';
import ContinueAsScreen from '../nodepacks/screens/ContinueAs';
import ForgotLogin from '../nodepacks/screens/ForgotLogin';
import ChangeUserPassword from '../nodepacks/screens/ChangeUserPassword';
import AddEventsToNavigateToScreen from '../nodepacks/AddEventsToNavigateToScreen';
import HomeViewCredentialLoading from '../nodepacks/HomeViewCredentialLoading';
import HomeViewContinueAsButtonStyle from '../nodepacks/HomeViewContinueAsButtonStyle';
import Anonymous from '../nodepacks/screens/Anonymous';
import AnonymousGuest from '../nodepacks/screens/AnonymousGuest';
import PostRegister from '../nodepacks/PostRegister';
import SetupApiBetweenComponents from '../nodepacks/SetupApiBetweenComponents';

export const GetSpecificModels = {
	type: 'get-specific-models',
	method: (args: { model: any; dispatch: any; getState: any }) => {
		const { model, dispatch, getState } = args;
		// Check for existing method of this type

		// if no methods exist, then create a new method.
		// graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
		const agents = GetAgentNodes();

		agents.map((agent) => {
			let methodProps: { [x: string]: any };

			if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type)) {
				const context: any = {};
				const outer_commands = [
					{
						operation: ADD_NEW_NODE,
						options: {
							nodeType: NodeTypes.Method,
							parent: model.id,
							groupProperties: {},
							properties: {
								[NodeProperties.NodePackage]: model.id,
								[NodeProperties.NodePackageType]: GetSpecificModels.type,
								[NodeProperties.NodePackageAgent]: agent.id,
								[NodeProperties.FunctionType]:
									FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific,
								[NodeProperties.MethodType]: Methods.GetAll,
								[NodeProperties.HttpMethod]: HTTP_METHODS.POST,
								[NodeProperties.UIText]: `${GetNodeTitle(model)} Get Specific Objects`
							},
							linkProperties: {
								properties: { ...LinkProperties.FunctionOperator }
							},
							callback: (methodNode: any) => {
								context.methodNode = methodNode;
							}
						}
					},
					function() {
						const { methodNode } = context;
						const { constraints } = MethodFunctions[
							FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
						];
						let perOrModelNode: any = null;
						let commands: any[] = [];
						Object.values(constraints).forEach((constraint: any) => {
							switch (constraint.key) {
								case FunctionTemplateKeys.Model:
								case FunctionTemplateKeys.Agent:
								case FunctionTemplateKeys.User:
								case FunctionTemplateKeys.ModelOutput:
									methodProps = {
										...methodProps,
										...GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}
									};
									if (constraint[NodeProperties.IsAgent]) {
										methodProps[constraint.key] = agent.id;
									} else if (constraint.key === FunctionTemplateKeys.User) {
										methodProps[constraint.key] =
											GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) ||
											GetUsers()[0].id;
									} else {
										methodProps[constraint.key] = model.id;
									}
									break;
								case FunctionTemplateKeys.Permission:
								case FunctionTemplateKeys.ModelFilter:
									PerformGraphOperation([
										{
											operation: ADD_NEW_NODE,
											options: {
												parent: methodNode.id,
												nodeType:
													constraint.key === FunctionTemplateKeys.Permission
														? NodeTypes.Permission
														: NodeTypes.ModelFilter,
												groupProperties: {},
												properties: {
													[NodeProperties.NodePackage]: model.id,
													[NodeProperties.NodePackageType]: GetSpecificModels.type,
													[NodeProperties.UIText]: `${GetNodeTitle(
														methodNode
													)} ${constraint.key === FunctionTemplateKeys.Permission
														? NodeTypes.Permission
														: NodeTypes.ModelFilter}`
												},
												linkProperties: {
													properties: {
														...LinkProperties.FunctionOperator
													}
												},
												callback: (newNode: { id: any }) => {
													methodProps = {
														...methodProps,
														...GetNodeProp(
															GetNodeById(methodNode.id),
															NodeProperties.MethodProps
														) || {}
													};
													methodProps[constraint.key] = newNode.id;
													perOrModelNode = newNode;
												}
											}
										}
									])(dispatch, getState);
									if (constraint.key === FunctionTemplateKeys.ModelFilter) {
										commands = [
											...commands,
											{
												operation: CHANGE_NODE_PROPERTY,
												options: {
													prop: NodeProperties.FilterAgent,
													id: perOrModelNode.id,
													value: agent.id
												}
											},
											{
												operation: CHANGE_NODE_PROPERTY,
												options: {
													prop: NodeProperties.FilterModel,
													id: perOrModelNode.id,
													value: model.id
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options: {
													target: model.id,
													source: perOrModelNode.id,
													properties: {
														...LinkProperties.ModelTypeLink
													}
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options: {
													target: agent.id,
													source: perOrModelNode.id,
													properties: {
														...LinkProperties.AgentTypeLink
													}
												}
											}
										];
									}
									break;
								default:
									break;
							}
							commands = [
								...commands,
								...[
									{
										operation: CHANGE_NODE_PROPERTY,
										options: {
											prop: NodeProperties.MethodProps,
											id: methodNode.id,
											value: methodProps
										}
									},
									{
										operation: ADD_LINK_BETWEEN_NODES,
										options: {
											target: methodProps[constraint.key],
											source: methodNode.id,
											properties: {
												...LinkProperties.FunctionOperator
											}
										}
									}
								]
							];
						});
						if (
							ModelNotConnectedToFunction(
								agent.id,
								model.id,
								GetSpecificModels.type,
								NodeTypes.Controller
							)
						) {
							const subcontext: any = {};
							commands.push(
								{
									operation: ADD_NEW_NODE,
									options: {
										nodeType: NodeTypes.Controller,
										properties: {
											[NodeProperties.NodePackage]: model.id,
											[NodeProperties.NodePackageType]: GetSpecificModels.type,
											[NodeProperties.NodePackageAgent]: agent.id,
											[NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(
												agent
											)} Controller`
										},
										linkProperties: {
											properties: { ...LinkProperties.FunctionOperator }
										},
										callback: (controllerNode: any) => {
											subcontext.controllerNode = controllerNode;
										}
									}
								},
								() => {
									const { controllerNode } = context;
									if (
										ModelNotConnectedToFunction(
											agent.id,
											model.id,
											GetSpecificModels.type,
											NodeTypes.Maestro
										)
									) {
										return PerformGraphOperation([
											{
												operation: ADD_NEW_NODE,
												options: {
													nodeType: NodeTypes.Maestro,
													parent: controllerNode.id,

													properties: {
														[NodeProperties.NodePackage]: model.id,
														[NodeProperties.NodePackageType]: GetSpecificModels.type,
														[NodeProperties.NodePackageAgent]: agent.id,
														[NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(
															agent
														)} Maestro`
													},
													linkProperties: {
														properties: {
															...LinkProperties.MaestroLink
														}
													},
													callback: (maestroNode: any) => {
														subcontext.maestroNode = maestroNode;
													}
												}
											}
										]);
									}
								},
								() => {
									const { maestroNode } = subcontext;
									return [
										{
											operation: ADD_LINK_BETWEEN_NODES,
											options: {
												target: methodNode.id,
												source: maestroNode.id,
												properties: {
													...LinkProperties.FunctionLink
												}
											}
										}
									];
								}
							);
						}
						PerformGraphOperation(commands)(dispatch, getState);
					}
				];
				PerformGraphOperation(outer_commands)(dispatch, getState);
			}
		});
	},
	methodType: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
};

export const GetAllModels = {
	type: 'get-all-models',
	method: CreateFunction({
		nodePackageType: 'get-all-models',
		methodType: Methods.GetAll,
		httpMethod: HTTP_METHODS.GET,
		functionType: FunctionTypes.Get_Agent_Value__IListObject,
		functionName: `Get All`
	}),
	methodType: FunctionTypes.Get_Agent_Value__IListObject
};

export const CreateLoginModels = {
	type: 'Build Login',
	methodType: 'Login Models',
	method: (args: any = {}) => {
		// let currentGraph = GetCurrentGraph(GetStateFunc()());
		// currentGraph = newNode(currentGraph);
		const nodePackageType = 'login-models';
		const nodePackage = 'login-models';
		const viewPackage = {
			[NodeProperties.ViewPackage]: uuidv4(),
			[NodeProperties.NodePackage]: nodePackage,
			[NodeProperties.NodePackageType]: nodePackageType
		};
		const newStuff: any = {};
		const uiTypeConfig = {
			[UITypes.ReactNative]: args[UITypes.ReactNative] || false,
			[UITypes.ElectronIO]: args[UITypes.ElectronIO] || false,
			[UITypes.VR]: args[UITypes.VR] || false,
			[UITypes.ReactWeb]: args[UITypes.ReactWeb] || false
		};
		setViewPackageStamp(viewPackage, 'create-login-models');
		PerformGraphOperation([
			{
				operation: ADD_NEW_NODE,
				options: {
					nodeType: NodeTypes.Model,
					// groupProperties: {},
					properties: {
						...viewPackage,
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.Pinned]: false,
						[NodeProperties.UIText]: `Red Anonymous Register Login Model`
					},
					callback: (newNode: { id: any }) => {
						newStuff.anonymousRegisterLoginModel = newNode.id;
					}
				}
			},
			{
				operation: ADD_NEW_NODE,
				options: {
					nodeType: NodeTypes.Model,
					// groupProperties: {},
					properties: {
						...viewPackage,
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.Pinned]: false,
						[NodeProperties.UIText]: `Red Login Model`
					},
					callback: (newNode: { id: any }) => {
						newStuff.loginModel = newNode.id;
					}
				}
			},
			function() {
				return [
					{ propName: 'User Name' },
					{ propName: 'Password', componentType: ComponentTypeKeys.Password },
					{ propName: 'Remember Me', componentType: ComponentTypeKeys.CheckBox }
				].map((v) => {
					const { propName, componentType = ComponentTypeKeys.Input } = v;
					return {
						operation: ADD_NEW_NODE,
						options: {
							nodeType: NodeTypes.Property,
							linkProperties: {
								properties: { ...LinkProperties.PropertyLink }
							},
							groupProperties: {},
							parent: newStuff.loginModel,
							properties: {
								...viewPackage,
								[NodeProperties.Pinned]: false,
								[NodeProperties.ComponentType]: componentType,
								[NodeProperties.UIAttributeType]: NodePropertyTypes.STRING,
								[NodeProperties.UIText]: propName
							}
						}
					};
				});
			},
			{
				operation: ADD_NEW_NODE,
				options: {
					nodeType: NodeTypes.Model,
					// groupProperties: {},
					properties: {
						...viewPackage,
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.UIText]: `Red Register View Model`,
						[NodeProperties.Pinned]: false
					},
					callback: (newNode: { id: any }) => {
						// methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
						// methodProps[constraint.key] = newNode.id;
						// perOrModelNode = newNode;
						newStuff.registerModel = newNode.id;
					}
				}
			},
			function() {
				return [
					{ propName: 'User Name', validationProp: ValidationPropName.UserName },
					{ propName: 'Email', propType: NodePropertyTypes.EMAIL, validationProp: ValidationPropName.Email },
					{
						propName: 'Password',
						componentType: ComponentTypeKeys.Password,
						validationProp: ValidationPropName.Password
					},
					{
						propName: 'Confirm Password',
						componentType: ComponentTypeKeys.Password,
						validationProp: ValidationPropName.PasswordConfirm
					}
				].map((v) => {
					const { propName, propType, validationProp, componentType = ComponentTypeKeys.Input } = v;
					return {
						operation: ADD_NEW_NODE,
						options: {
							nodeType: NodeTypes.Property,
							linkProperties: {
								properties: { ...LinkProperties.PropertyLink }
							},
							groupProperties: {},
							parent: newStuff.registerModel,
							properties: {
								[NodeProperties.NodePackage]: nodePackage,
								[NodeProperties.UIAttributeType]: propType || NodePropertyTypes.STRING,
								[NodeProperties.Pinned]: false,
								[NodeProperties.NodePackageType]: nodePackageType,
								[NodeProperties.UIText]: propName,
								[NodeProperties.ComponentType]: componentType,
								[NodeProperties.ValidationPropertyName]: validationProp
							}
						}
					};
				});
			},
			{
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.Controller,
						properties: {
							...viewPackage,
							[NodeProperties.ExcludeFromGeneration]: true,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIText]: 'Authorization'
						},
						callback: (node: { id: any }) => {
							newStuff.controller = node.id;
						}
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.Maestro,
						parent: newStuff.controller,
						linkProperties: {
							properties: {
								...LinkProperties.MaestroLink
							}
						},
						properties: {
							...viewPackage,
							[NodeProperties.ExcludeFromGeneration]: true,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIText]: 'Authorization Maestro'
						},
						callback: (node: { id: any }) => {
							newStuff.maestro = node.id;
						}
					};
				}
			},
			function(graph: any) {
				newStuff.graph = graph;
				return [];
			}
		])(GetDispatchFunc(), GetStateFunc());
		const regsterResult = CreateAgentFunction({
			viewPackage,
			model: GetNodeById(newStuff.registerModel, newStuff.graph),
			agent: {},
			maestro: newStuff.maestro,
			nodePackageType: 'register-user',
			methodType: Methods.Create,
			user: NodesByType(GetState(), NodeTypes.Model).find((x: any) => GetNodeProp(x, NodeProperties.IsUser)),
			httpMethod: HTTP_METHODS.POST,
			functionType: FunctionTypes.Register,
			functionName: `Register`
		})({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });

		const loginResult = CreateAgentFunction({
			viewPackage,
			model: GetNodeById(newStuff.loginModel, newStuff.graph),
			agent: {},
			maestro: newStuff.maestro,
			nodePackageType: 'login-user',
			methodType: Methods.Create,
			user: NodesByType(GetState(), NodeTypes.Model).find((x: any) => GetNodeProp(x, NodeProperties.IsUser)),
			httpMethod: HTTP_METHODS.POST,
			functionType: FunctionTypes.Login,
			functionName: `Authenticate User`
		})({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });
		args = args || {};
		let chosenChildren = GetModelPropertyChildren(newStuff.loginModel).map((x: { id: any }) => x.id);
		let viewName = 'Authenticate';

		let method_results = CreateDefaultView.method({
			viewName,
			dispatch: GetDispatchFunc(),
			getState: GetStateFunc(),
			model: GetNodeById(newStuff.loginModel, newStuff.graph),
			isSharedComponent: false,
			isDefaultComponent: false,
			isPluralComponent: false,
			uiTypes: uiTypeConfig,
			chosenChildren,
			viewType: ViewTypes.Create
		});
		const authenticateScreenResults = method_results;
		Object.keys(uiTypeConfig).forEach((key) => {
			if (uiTypeConfig[key]) {
				addInstanceEventsToForms({
					method_results,
					uiType: key,
					targetMethod: loginResult.methodNode.id
				});
			}
		});
		if (method_results.instanceFunc) {
			Object.keys(uiTypeConfig).forEach((uiType) => {
				if (uiTypeConfig[uiType]) {
					if (!method_results.uiTypes[uiType]) {
						throw new Error('missing uiType in anonymous guest');
					}

					PerformGraphOperation([
						...PostAuthenticate({
							screen: null,
							uiType,
							functionName: `Post Authenticate ${uiType}`,
							pressInstance:
								uiType === UITypes.ReactNative
									? method_results.uiTypes[uiType].instanceFunc.onPress
									: method_results.uiTypes[uiType].instanceFunc.onClick
						})
					])(GetDispatchFunc(), GetStateFunc());
				}
			});
		}
		viewName = 'Register';
		chosenChildren = GetModelPropertyChildren(newStuff.registerModel).map((x: { id: any }) => x.id);
		method_results = CreateDefaultView.method({
			dispatch: GetDispatchFunc(),
			getState: GetStateFunc(),
			model: GetNodeById(newStuff.registerModel, newStuff.graph),
			isSharedComponent: false,
			isDefaultComponent: false,
			isPluralComponent: false,
			uiTypes: uiTypeConfig,
			chosenChildren,
			viewName: `${viewName}`,
			viewType: ViewTypes.Create
		});
		Object.keys(uiTypeConfig).forEach((key) => {
			if (uiTypeConfig[key]) {
				addInstanceEventsToForms({
					method_results,
					uiType: key,
					targetMethod: regsterResult.methodNode.id
				});
			}
		});
		const anonymous_method_results = AnonymousGuest({
			...args,
			uiTypeConfig,
			maestro: newStuff.maestro,
			graph: newStuff.graph,
			viewPackage
		});
		const continueAsResult = ContinueAsScreen({
			...args,
			uiTypeConfig,
			maestro: newStuff.maestro,
			graph: newStuff.graph,
			viewPackage
		});
		const forgotLogin = ForgotLogin({
			...args,
			uiTypeConfig,
			maestro: newStuff.maestro,
			graph: newStuff.graph,
			viewPackage
		});

		const registerScreen = method_results.screenNodeId;
		if (method_results.instanceFunc) {
			Object.keys(uiTypeConfig).forEach((uiType) => {
				if (uiTypeConfig[uiType]) {
					if (!method_results.uiTypes[uiType]) {
						throw new Error('missing uiType in anonymous guest');
					}

					PerformGraphOperation([
						...PostRegister({
							screen: authenticateScreenResults.uiTypes[uiType].screenNodeId,
							uiType,
							functionName: `Post Register ${uiType}`,
							name: `Post Register ${uiType}`,
							pressInstance:
								uiType === UITypes.ReactNative
									? method_results.uiTypes[uiType].instanceFunc.onPress
									: method_results.uiTypes[uiType].instanceFunc.onClick
						})
					])(GetDispatchFunc(), GetStateFunc());
				}
			});
		}
		const titleService = GetNodeByProperties({
			[NodeProperties.NODEType]: NodeTypes.TitleService
		});

		Object.keys(uiTypeConfig).forEach((uiType) => {
			if (uiTypeConfig[uiType]) {
				const anonymousScreen = anonymous_method_results.uiTypes[uiType].screenNodeId;
				const continueAsScreen = continueAsResult.uiTypes[uiType].screenNodeId;
				const forgotLoginScreen = forgotLogin.uiTypes[uiType].screenNodeId;

				let anonymousButton: any;
				let continueAsButton: any;
				let forgotLoginButton: any;
				let homeViewScreenOption: any;
				PerformGraphOperation([
					...HomeView({
						titleService: titleService.id,
						registerForm: registerScreen,
						authenticateForm: authenticateScreenResults.uiTypes[uiType].screenNodeId,
						anonymousForm: anonymousScreen,
						continueAsForm: continueAsScreen,
						forgotForm: forgotLoginScreen,
						uiType,
						callback(homeViewContext: {
							anonymousButton: any;
							continueAsButton: any;
							forgotLoginButton: any;
							screenOption: any;
						}) {
							anonymousButton = homeViewContext.anonymousButton;
							continueAsButton = homeViewContext.continueAsButton;
							forgotLoginButton = homeViewContext.forgotLoginButton;
							homeViewScreenOption = homeViewContext.screenOption;
						}
					}),
					function() {
						return HomeViewContinueAsButtonStyle({ component: continueAsButton });
					},
					function() {
						return Anonymous({ screen: anonymousScreen, uiType });
					},
					function() {
						return HomeViewCredentialLoading({ component: homeViewScreenOption });
					},
					function() {
						return AddEventsToNavigateToScreen({
							titleService: titleService.id,
							uiType,
							component: anonymousButton,
							screen: anonymousScreen
						});
					},
					function() {
						return AddEventsToNavigateToScreen({
							titleService: titleService.id,
							uiType,
							component: continueAsButton,
							screen: continueAsScreen
						});
					},
					function() {
						return AddEventsToNavigateToScreen({
							titleService: titleService.id,
							uiType,
							component: forgotLoginButton,
							screen: forgotLoginScreen
						});
					}
				])(GetDispatchFunc(), GetStateFunc());
			}
		});
		setViewPackageStamp(null, 'create-login-models');
	}
};

export function addTitleService(args: { newItems: any }) {
	const { newItems } = args;
	return {
		operation: ADD_NEW_NODE,
		options(graph: any) {
			const $node = GetNodeByProperties(
				{
					[NodeProperties.UIText]: `Title Service`,
					[NodeProperties.NODEType]: NodeTypes.TitleService
				},
				graph
			);
			if ($node) {
				newItems.titleService = $node.id;
				return false;
			}
			return {
				nodeType: NodeTypes.TitleService,
				properties: {
					[NodeProperties.Pinned]: false,
					[NodeProperties.UIText]: `Title Service`
				},

				callback: (res: { id: any }) => {
					newItems.titleService = res.id;
				}
			};
		}
	};
}

export function addInstanceEventsToForms(args: { method_results: any; uiType: any; targetMethod: any }) {
	const { method_results, targetMethod, uiType } = args;
	if (!uiType) {
		throw new Error('no uiType set');
	}
	let createDataChainCallback: any = null;
	if (method_results && method_results.uiTypes && method_results.uiTypes[uiType].formButton) {
		PerformGraphOperation([
			{
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						prop: NodeProperties.Pinned,
						value: false,
						id: method_results.uiTypes[uiType].formButton
					};
				}
			}
		])(GetDispatchFunc(), GetStateFunc());
		if (method_results.uiTypes[uiType].formButtonApi) {
			const context: any = { evts: {} };
			const getObjectDataChain = GetNodeByProperties({
				[NodeProperties.DataChainName]: DataChainName.GetObject
			});

			PerformGraphOperation(
				[
					...Object.keys(method_results.uiTypes[uiType].formButtonApi).map((evt) => {
						return {
							operation: ADD_NEW_NODE,
							options(graph: any) {
								const currentNode = GetNodeById(
									method_results.uiTypes[uiType].formButtonApi[evt],
									graph
								);

								return addInstanceFunc(currentNode, (instanceFuncNode: any) => {
									context.evts[evt] = {};
									context.evts[evt].instanceFuncNode = instanceFuncNode;
								})();
							}
						};
					}),
					...(getObjectDataChain
						? []
						: CreateGetObjectDataChain({
								callback: ($createDataChainCallback: any) => {
									createDataChainCallback = $createDataChainCallback;
								}
							})),
					function(graph: any) {
						return Object.keys(context.evts).map((evt) => {
							const { instanceFuncNode } = context.evts[evt];
							method_results.instanceFunc = method_results.instanceFunc || {};
							method_results.uiTypes = method_results.uiTypes || {};
							method_results.uiTypes[uiType] = method_results.uiTypes[uiType] || {};
							method_results.uiTypes[uiType].instanceFunc =
								method_results.uiTypes[uiType].instanceFunc || {};
							method_results.instanceFunc[evt] = instanceFuncNode.id;
							method_results.uiTypes[uiType].instanceFunc[evt] = instanceFuncNode.id;

							const source = instanceFuncNode.id;
							const target = targetMethod;
							return ConnectLifecycleMethod({
								target,
								source,
								graph,
								dataChain: () =>
									getObjectDataChain ? getObjectDataChain.id : createDataChainCallback.entry
							});
						});
					}
				].filter((x) => x)
			)(GetDispatchFunc(), GetStateFunc());
		}
	}
}

export const AddAgentUser = {
	type: 'add-agent-user',
	methodType: 'Add User Agent',
	method: () => {
		let userId: null = null;
		PerformGraphOperation([
			{
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.Model,
						callback: (node: { id: any }) => {
							userId = node.id;
						},
						properties: {
							[NodeProperties.UIText]: `User`,
							[NodeProperties.IsUser]: true,
							[NodeProperties.IsAgent]: true
						}
					};
				}
			},
			{
				operation: CHANGE_NODE_PROPERTY,
				options() {
					return {
						id: userId,
						prop: NodeProperties.UIUser,
						value: userId
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.Model,
						properties: {
							[NodeProperties.UIText]: `Agent`,
							[NodeProperties.IsAgent]: true,
							[NodeProperties.UIUser]: userId
						},
						links: [
							{
								target: userId,
								linkProperties: {
									properties: { ...LinkProperties.UserLink }
								}
							}
						]
					};
				}
			}
		])(GetDispatchFunc(), GetStateFunc());
	}
};

export function CreatePagingSkipDataChains() {
	const result: any = {};
	let skipResult = false;
	let arrayLengthNode: any = null;
	let defaultPagingValue: null = null;
	PerformGraphOperation([
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.IsDataChainPagingSkip]: true,
						[NodeProperties.NODEType]: NodeTypes.DataChain,
						[NodeProperties.EntryPoint]: true
					},
					graph
				);
				if (model) {
					result.pagingSkip = model.id;
					skipResult = true;
					return false;
				}
				return {
					nodeType: NodeTypes.DataChain,
					callback: (node: { id: any }) => {
						result.pagingSkip = node.id;
					},

					properties: {
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
						[NodeProperties.UIText]: 'Paging Skip',
						[NodeProperties.Pinned]: false,
						[NodeProperties.IsDataChainPagingSkip]: true,
						[NodeProperties.EntryPoint]: true
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				if (skipResult) {
					return false;
				}
				const temp = SplitDataCommand(
					GetNodeById(result.pagingSkip, graph),
					(split: { id: any }) => {
						result.pagingSkipOuput = split.id;
					},
					{
						[NodeProperties.Pinned]: false,
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
						[NodeProperties.UIText]: 'Paging Skip Ouput',
						[NodeProperties.AsOutput]: true
					}
				);

				return temp.options;
			}
		},
		function(graph: any) {
			if (skipResult) {
				return false;
			}
			return InsertNodeInbetween(
				GetNodeById(result.pagingSkip, graph),
				result.pagingSkipOuput,
				graph,
				(insertedNode: { id: any }) => {
					arrayLengthNode = insertedNode.id;
				},
				{
					[NodeProperties.Pinned]: false
				}
			);
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipResult) {
					return false;
				}
				return {
					prop: NodeProperties.DataChainFunctionType,
					value: DataChainFunctionKeys.ArrayLength,
					id: arrayLengthNode
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipResult) {
					return false;
				}
				return {
					prop: NodeProperties.UIText,
					value: `Paging ${DataChainFunctionKeys.ArrayLength}`,
					id: arrayLengthNode
				};
			}
		},
		function(graph: any) {
			if (skipResult) {
				return false;
			}

			return InsertNodeInbetween(
				GetNodeById(arrayLengthNode, graph),
				result.pagingSkipOuput,
				graph,
				(insertedNode: { id: any }) => {
					defaultPagingValue = insertedNode.id;
				},
				{
					[NodeProperties.Pinned]: false
				}
			);
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipResult) {
					return false;
				}
				return {
					prop: NodeProperties.DataChainFunctionType,
					value: DataChainFunctionKeys.NumericalDefault,
					id: defaultPagingValue
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipResult) {
					return false;
				}
				return {
					prop: NodeProperties.UIText,
					value: `Paging ${DataChainFunctionKeys.NumericalDefault}`,
					id: defaultPagingValue
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipResult) {
					return false;
				}
				return {
					prop: NodeProperties.NumberParameter,
					value: '0',
					id: defaultPagingValue
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
	return result;
}

export function CreatePagingTakeDataChains() {
	const result: any = {};
	let skipTake = false;
	let defaultPagingValue: null = null;
	PerformGraphOperation([
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.IsDataChainPagingTake]: true,
						[NodeProperties.EntryPoint]: true,
						[NodeProperties.NODEType]: NodeTypes.DataChain
					},
					graph
				);
				if (model) {
					result.pagingTake = model.id;
					skipTake = true;
					return false;
				}
				return {
					nodeType: NodeTypes.DataChain,
					callback: (node: { id: any }) => {
						result.pagingTake = node.id;
					},

					properties: {
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
						[NodeProperties.UIText]: 'Paging Take',
						[NodeProperties.Pinned]: false,
						[NodeProperties.IsDataChainPagingTake]: true,
						[NodeProperties.EntryPoint]: true
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				if (skipTake) {
					return false;
				}

				const temp = SplitDataCommand(
					GetNodeById(result.pagingTake, graph),
					(split: { id: any }) => {
						result.pagingTakeOuput = split.id;
					},
					{
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
						[NodeProperties.Pinned]: false,
						[NodeProperties.UIText]: 'Paging Take Ouput',
						[NodeProperties.AsOutput]: true
					}
				);

				return temp.options;
			}
		},
		function(graph: any) {
			if (skipTake) {
				return false;
			}

			return InsertNodeInbetween(
				GetNodeById(result.pagingTake, graph),
				result.pagingTakeOuput,
				graph,
				(insertedNode: { id: any }) => {
					defaultPagingValue = insertedNode.id;
				}
			);
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipTake) {
					return false;
				}
				return {
					prop: NodeProperties.DataChainFunctionType,
					value: DataChainFunctionKeys.NumericalDefault,
					id: defaultPagingValue
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipTake) {
					return false;
				}
				return {
					prop: NodeProperties.UIText,
					value: `Paging ${DataChainFunctionKeys.NumericalDefault}`,
					id: defaultPagingValue
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipTake) {
					return false;
				}
				return {
					prop: NodeProperties.NumberParameter,
					value: '50',
					id: defaultPagingValue
				};
			}
		},
		{
			operation: CHANGE_NODE_PROPERTY,
			options() {
				if (skipTake) {
					return false;
				}
				return {
					prop: NodeProperties.Pinned,
					value: false,
					id: defaultPagingValue
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
	return result;
}

export function CreateScreenModel(viewModel: any, options = { isList: true }) {
	const result: any = {};
	let pageModelId: null = null;
	let skip = false;
	PerformGraphOperation([
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const $node = GetNodeByProperties(
					{
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.UIText]: `${viewModel} Model`,
						[NodeProperties.NODEType]: NodeTypes.Model,
						[NodeProperties.IsViewModel]: true
					},
					graph
				);
				if ($node) {
					pageModelId = $node.id;
					result.model = pageModelId;
					skip = true;
					return false;
				}
				return {
					nodeType: NodeTypes.Model,
					callback: (pageModel: { id: any }) => {
						pageModelId = pageModel.id;
						result.model = pageModelId;
					},

					properties: {
						[NodeProperties.Pinned]: false,
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.UIText]: `${viewModel} Model`,
						[NodeProperties.IsViewModel]: true
					}
				};
			}
		},
		options && options.isList
			? {
					operation: ADD_NEW_NODE,
					options() {
						if (skip) {
							return false;
						}
						return {
							nodeType: NodeTypes.Property,
							callback: (skipModel: { id: any }) => {
								result.list = skipModel.id;
							},
							parent: pageModelId,
							groupProperties: {},
							linkProperties: {
								properties: { ...LinkProperties.PropertyLink }
							},
							properties: {
								[NodeProperties.Pinned]: false,
								[NodeProperties.UIText]: Titles.List
							}
						};
					}
				}
			: false
	])(GetDispatchFunc(), GetStateFunc());

	return result;
}

export function createViewPagingDataChain(
	newItems: {
		currentNode: any;
		pagingEntry: string;
		screenListDataChain: any;
		viewModelListRefNode: any;
		screenListDataChainAlreadyMade: any;
		pagingRefNode: any;
	},
	viewName: any,
	viewPackage: {} | undefined,
	skipChain = true
) {
	let skip = false;
	const skipOrTake = skipChain ? 'Skip' : 'Take';
	return function() {
		return [
			{
				// The data chain for a list screen
				operation: ADD_NEW_NODE,
				options(graph: any) {
					const $node = GetNodeByProperties(
						{
							[NodeProperties.UIText]: skipChain ? `Get ${viewName} Skip` : `Get ${viewName} Take`,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
							[NodeProperties.QueryParameterType]: skipChain
								? QUERY_PARAMETER_KEYS.Skip
								: QUERY_PARAMETER_KEYS.Take,
							[NodeProperties.NODEType]: NodeTypes.DataChain,
							[NodeProperties.Model]: newItems.currentNode,
							[NodeProperties.PagingSkip]: skipChain,
							[NodeProperties.IsPaging]: true,
							[NodeProperties.PagingTake]: !skipChain,
							[NodeProperties.EntryPoint]: true
						},
						graph
					);
					if ($node) {
						newItems.pagingEntry = $node.id;
						skip = true;
						return false;
					}

					return {
						nodeType: NodeTypes.DataChain,
						properties: {
							[NodeProperties.UIText]: skipChain ? `Get ${viewName} Skip` : `Get ${viewName} Take`,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
							[NodeProperties.QueryParameterType]: skipChain
								? QUERY_PARAMETER_KEYS.Skip
								: QUERY_PARAMETER_KEYS.Take,
							[NodeProperties.Model]: newItems.currentNode,
							[NodeProperties.PagingSkip]: skipChain,
							[NodeProperties.IsPaging]: true,
							[NodeProperties.Pinned]: false,
							[NodeProperties.PagingTake]: !skipChain,
							[NodeProperties.EntryPoint]: true,
							...viewPackage
						},
						callback: (res: { id: any }) => {
							newItems.pagingEntry = res.id;
						}
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options(graph: any) {
					if (skip) {
						return false;
					}
					const $node = GetNodeByProperties(
						{
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.ReferenceDataChain,
							[NodeProperties.NODEType]: NodeTypes.DataChain,
							[NodeProperties.UIText]: `${viewName} ${skipOrTake} VM Ref`,
							[NodeProperties.DataChainReference]: newItems.screenListDataChain
						},
						graph
					);
					if ($node) {
						newItems.viewModelListRefNode = $node.id;
						return false;
					}
					const temp = SplitDataCommand(
						GetNodeById(newItems.pagingEntry, graph),
						(split: { id: any }) => {
							newItems.viewModelListRefNode = split.id;
						},
						{
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.ReferenceDataChain,
							[NodeProperties.UIText]: `${viewName} ${skipOrTake} VM Ref`,
							[NodeProperties.DataChainReference]: newItems.screenListDataChain,
							[NodeProperties.Pinned]: true,
							...viewPackage
						},
						graph
					);
					return temp.options;
				}
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					if (skip) {
						return false;
					}
					if (newItems.screenListDataChainAlreadyMade) {
						return false;
					}

					return {
						target: newItems.viewModelListRefNode,
						source: newItems.screenListDataChain,
						properties: { ...LinkProperties.DataChainLink }
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options(graph: any) {
					if (skip) {
						return false;
					}
					const groupProperties = GetNodeProp(
						newItems.viewModelListRefNode,
						NodeProperties.GroupParent,
						graph
					)
						? {
								id: getGroup(
									GetNodeProp(newItems.viewModelListRefNode, NodeProperties.GroupParent, graph),
									graph
								).id
							}
						: null;
					const model = GetNodeByProperties(
						{
							[skipChain
								? NodeProperties.IsDataChainPagingSkip
								: NodeProperties.IsDataChainPagingTake]: true,
							[NodeProperties.EntryPoint]: true
						},
						graph
					);

					const $node = GetNodeByProperties(
						{
							[NodeProperties.UIText]: `${viewName} ${skipOrTake} Paging Ref`,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.ReferenceDataChain,
							[NodeProperties.NODEType]: NodeTypes.DataChain,
							[NodeProperties.DataChainReference]: model ? model.id : null,
							[NodeProperties.ChainParent]: newItems.viewModelListRefNode
						},
						graph
					);
					if ($node) {
						newItems.pagingRefNode = $node.id;
						return false;
					}

					return {
						parent: newItems.viewModelListRefNode,
						nodeType: NodeTypes.DataChain,
						groupProperties,
						properties: {
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIText]: `${viewName} ${skipOrTake} Paging Ref`,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.ReferenceDataChain,
							[NodeProperties.DataChainReference]: model ? model.id : null,
							[NodeProperties.ChainParent]: newItems.viewModelListRefNode
						},
						linkProperties: {
							properties: { ...LinkProperties.DataChainLink }
						},
						callback: (v: { id: any }) => {
							newItems.pagingRefNode = v.id;
						}
					};
				}
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options(graph: any) {
					if (skip) {
						return false;
					}
					const model = GetNodeByProperties(
						{
							[skipChain
								? NodeProperties.IsDataChainPagingSkip
								: NodeProperties.IsDataChainPagingTake]: true,
							[NodeProperties.NODEType]: NodeTypes.DataChain,
							[NodeProperties.EntryPoint]: true
						},
						graph
					);

					return {
						target: newItems.pagingRefNode,
						source: model ? model.id : null,
						properties: { ...LinkProperties.DataChainLink }
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options(graph: any) {
					if (skip) {
						return false;
					}
					const groupProperties = GetNodeProp(newItems.pagingRefNode, NodeProperties.GroupParent, graph)
						? {
								id: getGroup(
									GetNodeProp(newItems.pagingRefNode, NodeProperties.GroupParent, graph),
									graph
								).id
							}
						: null;
					return {
						parent: newItems.pagingRefNode,
						nodeType: NodeTypes.DataChain,
						groupProperties,
						properties: {
							[NodeProperties.Pinned]: false,
							[NodeProperties.ChainParent]: newItems.pagingRefNode,
							[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
							[NodeProperties.UIText]: `${viewName} ${skipOrTake} Output`,
							[NodeProperties.AsOutput]: true
						},
						linkProperties: {
							properties: { ...LinkProperties.DataChainLink }
						}
					};
				}
			}
		];
	};
}

export function CreatePagingModel() {
	let result = null;
	let pageModelId: null = null;
	let skipModelId = null;
	let takeModelId = null;
	let filterModelId = null;
	let sortModelId = null;
	PerformGraphOperation([
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.IsPagingModel]: true,
						[NodeProperties.NODEType]: NodeTypes.Model
					},
					graph
				);
				if (model) {
					pageModelId = model.id;
					return false;
				}
				return {
					nodeType: NodeTypes.Model,
					callback: (pageModel: { id: any }) => {
						pageModelId = pageModel.id;
					},

					properties: {
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.UIText]: 'Paging Model',
						[NodeProperties.Pinned]: false,
						[NodeProperties.IsPagingModel]: true
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.PagingSkip]: true,
						[NodeProperties.NODEType]: NodeTypes.Property
					},
					graph
				);
				if (model) {
					skipModelId = model.id;
					return false;
				}
				return {
					nodeType: NodeTypes.Property,
					callback: (skipModel: { id: any }) => {
						skipModelId = skipModel.id;
					},
					parent: pageModelId,
					groupProperties: {},
					linkProperties: {
						properties: { ...LinkProperties.PropertyLink }
					},
					properties: {
						[NodeProperties.UIText]: 'Skip',
						[NodeProperties.Pinned]: false,
						[NodeProperties.PagingSkip]: true
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.PagingTake]: true,
						[NodeProperties.NODEType]: NodeTypes.Property
					},
					graph
				);
				if (model) {
					takeModelId = model.id;
					return false;
				}
				return {
					nodeType: NodeTypes.Property,
					callback: (takeModel: { id: any }) => {
						takeModelId = takeModel.id;
					},
					parent: pageModelId,
					groupProperties: {},
					properties: {
						[NodeProperties.UIText]: 'Take',
						[NodeProperties.Pinned]: false,
						[NodeProperties.PagingTake]: true
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.PagingFilter]: true,
						[NodeProperties.NODEType]: NodeTypes.Property
					},
					graph
				);
				if (model) {
					filterModelId = model.id;
					return false;
				}
				return {
					nodeType: NodeTypes.Property,
					callback: (filterModel: { id: any }) => {
						filterModelId = filterModel.id;
					},
					parent: pageModelId,
					groupProperties: {},
					properties: {
						[NodeProperties.UIText]: 'Filter',
						[NodeProperties.Pinned]: false,
						[NodeProperties.PagingFilter]: true
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options(graph: any) {
				const model = GetNodeByProperties(
					{
						[NodeProperties.PagingSort]: true,
						[NodeProperties.NODEType]: NodeTypes.Property
					},
					graph
				);
				if (model) {
					sortModelId = model.id;
					return false;
				}
				return {
					nodeType: NodeTypes.Property,
					callback: (sortModel: { id: any }) => {
						sortModelId = sortModel.id;
					},
					parent: pageModelId,
					groupProperties: {},
					properties: {
						[NodeProperties.ExcludeFromController]: true,
						[NodeProperties.UIText]: 'Sort',
						[NodeProperties.Pinned]: false,
						[NodeProperties.PagingSort]: true
					}
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
	result = {
		pageModelId,
		skipModelId,
		takeModelId,
		filterModelId,
		sortModelId
	};

	return result;
}
export function ListRequiredModels() {
	CreatePagingModel();
	CreatePagingSkipDataChains();
	CreatePagingTakeDataChains();
}
export const CreateDefaultView = {
	type: 'Create View - Form',
	methodType: 'React Native Views',
	method(_args: any): any {
		const method_result: any = {
			uiTypes: {}
		};
		const default_View_method = (args: any = {}) => {
			let { viewName, isList } = args;
			const { viewTypeModelId } = args;
			let { model } = args;
			let { isPluralComponent = false } = args;
			const {
				viewType,
				isDefaultComponent,
				uiType = UITypes.ReactNative,
				agentId,
				isSharedComponent,
				connectedModel,
				chosenChildren = []
			} = args;

			const state = GetState();
			if (typeof model === 'string') {
				model = GetNodeById(model);
			}

			if (connectedModel) {
				if (GetNodeProp(connectedModel, NodeProperties.NODEType) === NodeTypes.Model) {
					isPluralComponent = true;
				}
			}

			const currentNode = model || Node(state, Visual(state, SELECTED_NODE));
			let screenNodeId: any = null;
			let screenComponentId: any = null;
			let listComponentId: any = null;
			let screenNodeOptionId: any = null;
			let childComponents: any = [];
			const modelComponentSelectors: any = [];
			let layout: any = null;
			let listLayout = null;
			const viewModelNodeFocusId = null;
			const viewModelNodeBlurId = null;
			const createConnections: any = [];
			const createListConnections: any = [];
			viewName = viewName || GetNodeTitle(currentNode);
			const useModelInstance = [ ViewTypes.Get, ViewTypes.GetAll, ViewTypes.Delete ].some((v) => viewType === v);
			const viewPackage = {
				[NodeProperties.ViewPackage]: uuidv4(),
				[NodeProperties.ViewPackageTitle]: viewName
			};
			setViewPackageStamp(viewPackage, 'CreateDefaultView');
			const newItems: any = {};
			let viewComponentType: any = null;
			let viewComponent: any = null;
			let multi_item_component = ComponentTypes[uiType].List.key;
			let needsLoadToScreenState = false;

			const propertyDataChainAccesors: any = [];

			const datachainLink: any = [];
			let skipModelDataChainListParts = false;
			let listDataChainId: any = null;
			let listDataChainExitId: any = null;
			let skipAddingComplete = false;

			switch (viewType) {
				case ViewTypes.Update:
					needsLoadToScreenState = true;
					break;
				default:
					break;
			}
			switch (viewType) {
				case ViewTypes.Get:
				case ViewTypes.GetAll:
				case ViewTypes.Delete:
					viewComponentType = ComponentTypes[uiType].Text.key;
					viewComponent = ComponentTypes[uiType].Text;
					if (isPluralComponent && isSharedComponent) {
						isList = true;
						multi_item_component = ComponentTypes[uiType].MultiViewList.key;
					} else if (isSharedComponent) {
						isList = false;
					}
					break;
				default:
					viewComponentType = ComponentTypes[uiType].Input.key;
					viewComponent = ComponentTypes[uiType].Input;
					if (isPluralComponent && isSharedComponent) {
						isList = true;
						viewComponentType = ComponentTypes[uiType].Text.key;
						multi_item_component = ComponentTypes[uiType].MultiSelectList.key;
						viewComponent = ComponentTypes[uiType].Text;
					} else if (isSharedComponent) {
						isList = true;
						viewComponentType = ComponentTypes[uiType].Text.key;
						multi_item_component = ComponentTypes[uiType].SingleSelect.key;
						viewComponent = ComponentTypes[uiType].Text;
					}
					break;
			}
			let dataSourceId: any;
			const modelType = GetNodeProp(currentNode, NodeProperties.NODEType);
			const isModel = modelType === NodeTypes.Model;

			if (isModel) {
				let modelChildren: _.Node[] = GetModelPropertyChildren(currentNode.id);
				newItems.currentNode = currentNode.id;
				if (chosenChildren && chosenChildren.length) {
					modelChildren = modelChildren.filter((x: { id: any }) =>
						chosenChildren.some((v: any) => v === x.id)
					);
				}
				const modelProperties: _.Node[] = modelChildren
					.filter((x: any) => !GetNodeProp(x, NodeProperties.IsDefaultProperty))
					.filter((x: any) => !GetNodeProp(x, NodeProperties.IgnoreInView));
				childComponents = modelProperties.map(() => null);
				const screenComponentEvents: any[] = [];
				if (isList) {
					CreatePagingModel();
					CreatePagingSkipDataChains();
					CreatePagingTakeDataChains();
				}
				// let pageViewModel = null;
				// if (!isSharedComponent) {
				//   pageViewModel = CreateScreenModel(viewName);
				// }
				PerformGraphOperation([
					...[
						!isSharedComponent
							? {
									operation: ADD_NEW_NODE,
									options(graph: any) {
										const res = GetNodesByProperties(
											{
												[NodeProperties.InstanceType]: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												[NodeProperties.UIText]: `${viewName} ${agentId
													? GetNodeTitle(agentId)
													: ''}`,
												[NodeProperties.ViewType]: viewType,
												[NodeProperties.NODEType]: NodeTypes.Screen,
												[NodeProperties.Model]: currentNode.id,
												...agentId ? { [NodeProperties.Agent]: agentId } : {}
											},
											graph
										).find((x) => x);
										if (res) {
											screenNodeId = res.id;
											newItems.screenNodeId = res.id;
											method_result.screenNodeId = screenNodeId;
											method_result.uiTypes[args.uiType] = method_result.uiTypes[args.uiType] || {};
											method_result.uiTypes[args.uiType].screenNodeId = screenNodeId;

											return false;
										}

										return {
											nodeType: NodeTypes.Screen,
											callback: (screenNode: { id: any }) => {
												screenNodeId = screenNode.id;
												newItems.screenNodeId = screenNode.id;
												method_result.screenNodeId = screenNodeId;
												method_result.uiTypes[args.uiType] =
													method_result.uiTypes[args.uiType] || {};
												method_result.uiTypes[args.uiType].screenNodeId = screenNodeId;
											},
											properties: {
												...viewPackage,
												[NodeProperties.InstanceType]: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												[NodeProperties.Screen]: GraphMethods.convertToURLRoute(
													`${viewName} ${agentId ? GetNodeTitle(agentId) : ''}`
												),
												[NodeProperties.ViewType]: viewType,
												[NodeProperties.UIText]: `${viewName} ${agentId
													? GetNodeTitle(agentId)
													: ''}`,
												[NodeProperties.Model]: currentNode.id,
												...agentId ? { [NodeProperties.Agent]: agentId } : {}
											}
										};
									}
								}
							: false,
						!isSharedComponent
							? function(graph: any) {
									return addComponentApiToForm({
										newItems,
										text: 'value',
										parent: newItems.screenNodeId,
										graph,
										isSingular: true
									});
								}
							: null,
						!isSharedComponent
							? function(graph: any) {
									return addComponentApiToForm({
										newItems,
										text: ApiNodeKeys.ViewModel,
										parent: newItems.screenNodeId,
										graph,
										isSingular: true,
										internalProperties: {
											[NodeProperties.DefaultComponentApiValue]: useModelInstance
												? false
												: GetCodeName(newItems.screenNodeId)
										}
									});
								}
							: null,
						// Adding load data chain
						...(needsLoadToScreenState && false
							? LoadModel({
									model_view_name: `${viewName} Load ${GetNodeTitle(currentNode)}`,
									model_item: `Models.${GetCodeName(currentNode)}`,
									callback: (context: { entry: any }) => {
										newItems.dataChainForLoading = context.entry;
									}
								})
							: []),

						{
							operation: ADD_NEW_NODE,
							options(graph: any) {
								const $node = GetNodeByProperties(
									{
										[NodeProperties.UIText]: `Title Service`,
										[NodeProperties.NODEType]: NodeTypes.TitleService
									},
									graph
								);
								if ($node) {
									newItems.titleService = $node.id;
									return false;
								}
								return {
									nodeType: NodeTypes.TitleService,
									properties: {
										[NodeProperties.Pinned]: false,
										[NodeProperties.UIText]: `Title Service`
									},

									callback: (res: { id: any }) => {
										newItems.titleService = res.id;
									}
								};
							}
						},
						!isSharedComponent && isList
							? {
									// The data chain for a list screen
									operation: ADD_NEW_NODE,
									options(graph: any) {
										const $node = GetNodeByProperties(
											{
												[NodeProperties.UIText]: `${viewName} Screen DC`,
												[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
												[NodeProperties.Selector]: newItems.screenSelector,
												[NodeProperties.NODEType]: NodeTypes.DataChain,
												[NodeProperties.EntryPoint]: true,
												[NodeProperties.SelectorProperty]: SelectorPropertyKeys.Object,
												...agentId ? { [NodeProperties.Agent]: agentId } : {}
											},
											graph
										);
										if ($node) {
											newItems.screenListDataChain = $node.id;
											newItems.screenListDataChainAlreadyMade = true;
											return false;
										}

										return {
											nodeType: NodeTypes.DataChain,
											properties: {
												[NodeProperties.UIText]: `${viewName} Screen DC`,
												[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
												[NodeProperties.Selector]: newItems.screenSelector,
												[NodeProperties.EntryPoint]: true,
												[NodeProperties.Pinned]: false,
												[NodeProperties.AsOutput]: true,
												[NodeProperties.SelectorProperty]: SelectorPropertyKeys.Object,
												...agentId ? { [NodeProperties.Agent]: agentId } : {}
											},
											links: [
												{
													target: newItems.screenSelector,
													linkProperties: {
														properties: { ...LinkProperties.DataChainLink }
													}
												}
											],
											callback: (res: { id: any }) => {
												newItems.screenListDataChain = res.id;
											}
										};
									}
								}
							: false,
						!isSharedComponent
							? {
									operation: NEW_SCREEN_OPTIONS,
									options() {
										let formLayout = CreateLayout();
										formLayout = SetCellsLayout(formLayout, 1);
										const rootCellId = GetFirstCell(formLayout);
										const cellProperties = GetCellProperties(formLayout, rootCellId);
										cellProperties.style = {
											...cellProperties.style,
											flexDirection: 'column'
										};

										addComponentTags(ComponentTags.MainSection, cellProperties);

										let componentProps: { properties: {}; instanceTypes: {} } | null = null;

										if (useModelInstance) {
											componentProps = createComponentApi();
											GENERAL_COMPONENT_API.map((x) => {
												componentProps = addComponentApi(componentProps, {
													modelProp: x.property
												});
											});
											GENERAL_COMPONENT_API.map((t) => {
												const apiProperty = t.property;
												(function() {
													const rootCellId = GetFirstCell(formLayout);
													const cellProperties = GetCellProperties(formLayout, rootCellId);
													cellProperties.componentApi = cellProperties.componentApi || {};
													cellProperties.componentApi[apiProperty] = {
														instanceType: InstanceTypes.ApiProperty,
														apiProperty
													};
												})();
											});
										}
										return {
											callback: (screenOptionNode: { id: any }) => {
												screenNodeOptionId = screenOptionNode.id;
												newItems.screenNodeOptionId = screenNodeOptionId;
											},
											parent: screenNodeId,
											properties: {
												...viewPackage,
												[NodeProperties.UIText]: `${viewName} ${agentId
													? GetNodeTitle(agentId)
													: ''} Form`,
												[NodeProperties.UIType]: uiType,
												[NodeProperties.ComponentType]: ComponentTypes[uiType].Generic.key,
												[NodeProperties.ComponentApi]: componentProps,
												[NodeProperties.Pinned]: false,
												[NodeProperties.Layout]: formLayout,
												[NodeProperties.Model]: currentNode.id,
												[NodeProperties.ViewType]: viewType,
												[NodeProperties.InstanceType]: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												...agentId ? { [NodeProperties.Agent]: agentId } : {}
											},
											groupProperties: {},
											linkProperties: {
												properties: { ...LinkProperties.ScreenOptionsLink }
											}
										};
									}
								}
							: false,
						!isSharedComponent
							? function() {
									return addComponentApiToForm({
										newItems,
										text: 'value',
										parent: newItems.screenNodeOptionId
									});
								}
							: null,
						!isSharedComponent
							? function() {
									return addComponentApiToForm({
										newItems,
										text: ApiNodeKeys.ViewModel,
										parent: newItems.screenNodeOptionId
									});
								}
							: null,
						!isSharedComponent
							? function() {
									return connectComponentToExternalApi({
										newItems,
										parent: newItems.screenNodeId,
										key: 'value',
										properties: LinkProperties.ComponentExternalConnection,
										child: newItems.screenNodeOptionId
									});
								}
							: null,
						!isSharedComponent
							? function() {
									return connectComponentToExternalApi({
										newItems,
										parent: newItems.screenNodeId,
										properties: LinkProperties.ComponentExternalConnection,
										key: ApiNodeKeys.ViewModel,
										child: newItems.screenNodeOptionId
									});
								}
							: null,
						...(!isSharedComponent
							? SCREEN_COMPONENT_EVENTS.map((t) => {
									return {
										operation: ADD_NEW_NODE,
										options() {
											return {
												nodeType: NodeTypes.LifeCylceMethod,
												properties: {
													...viewPackage,
													[NodeProperties.InstanceType]: useModelInstance
														? InstanceTypes.ModelInstance
														: InstanceTypes.ScreenInstance,
													[NodeProperties.EventType]: t,
													[NodeProperties.Pinned]: false,
													[NodeProperties.UIText]: `${t}`
												},
												links: [
													{
														target: newItems.screenNodeOptionId,
														linkProperties: {
															properties: { ...LinkProperties.LifeCylceMethod }
														}
													}
												],
												callback: (screenNode: { id: any }) => {
													screenComponentEvents.push(screenNode.id);
												}
											};
										}
									};
								})
							: []),
						...(needsLoadToScreenState && false
							? ConnectLifecycleMethodToDataChain({
									lifeCycleMethod: (graph: any) => {
										const sce = screenComponentEvents.find(
											(x) =>
												GetNodeProp(x, NodeProperties.EventType, graph) ===
												ComponentLifeCycleEvents.ComponentDidMount
										);
										return sce;
									},
									dataChain: () => newItems.dataChainForLoading
								})
							: []),
						!isSharedComponent && isList
							? createViewPagingDataChain(newItems, viewName, viewPackage, true)
							: false,
						!isSharedComponent && isList
							? createViewPagingDataChain(newItems, viewName, viewPackage, false)
							: false,

						isList
							? {
									operation: NEW_COMPONENT_NODE,
									options(currentGraph: any) {
										listLayout = CreateLayout();
										listLayout = SetCellsLayout(listLayout, 1);
										const rootCellId = GetFirstCell(listLayout);
										const cellProperties = GetCellProperties(listLayout, rootCellId);
										cellProperties.style = {
											...cellProperties.style,
											flexDirection: 'column'
										};
										const componentProps = null;

										return {
											callback: (listComponent: { id: any }, graph: any) => {
												listComponentId = listComponent.id;
												newItems.listComponentId = listComponentId;
											},
											parent: screenNodeOptionId,
											properties: {
												...viewPackage,
												[NodeProperties.UIText]: `${viewName} ${multi_item_component}`,
												[NodeProperties.UIType]: uiType,
												[NodeProperties.ViewType]: viewType,
												[NodeProperties.IsPluralComponent]: isPluralComponent,
												[NodeProperties.Pinned]: false,
												[NodeProperties.SharedComponent]: isSharedComponent,
												[NodeProperties.ComponentType]: multi_item_component,
												...agentId && !isSharedComponent
													? { [NodeProperties.Agent]: agentId }
													: {},
												[NodeProperties.InstanceType]: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												[NodeProperties.Layout]: listLayout,
												[NodeProperties.ComponentApi]: componentProps
											},
											groupProperties: {},
											linkProperties: {
												properties: { ...LinkProperties.ComponentLink }
											}
										};
									}
								}
							: false,
						isList
							? (currentGraph: any) => {
									let connectto: any[] = [];
									if (isDefaultComponent) {
										if (viewTypeModelId) {
											connectto = [ GetNodeById(viewTypeModelId, currentGraph) ];
										} else {
											connectto = getViewTypeEndpointsForDefaults(
												viewType,
												currentGraph,
												currentNode.id
											);
										}
									}
									return connectto.map((ct) => {
										return [
											(graph: _.Graph) =>
												SetSharedComponent({
													properties: {
														...LinkProperties.DefaultViewType,
														viewType,
														uiType,
														isPluralComponent
													},
													graph,
													viewType,
													uiType,
													isPluralComponent,
													source: ct.id,
													target: listComponentId
												}),
											[
												'value',
												ApiNodeKeys.ViewModel,
												'label',
												'placeholder',
												'error',
												'success'
											].map(
												(v) =>
													function() {
														const graph = GetCurrentGraph(GetStateFunc()());
														return addComponentApiToForm({
															newItems,
															text: v,
															parent: ct.id,
															isSingular: true,
															graph
														});
													}
											)
										];
									});
								}
							: false,
						isList
							? function() {
									return addListItemComponentApi(
										newItems,
										ApiNodeKeys.ViewModel,
										false,
										(v: any, _i: any) => {
											newItems.componentItemListViewModel = _i;
										},
										newItems.listComponentId,
										{ useAsValue: false }
									);
								}
							: null,
						...[ 'index', 'separators', 'value' ].map((text) => {
							return function() {
								if (!isList) {
									return [];
								}
								return addListItemComponentApi(
									newItems,
									text,
									true,
									(v: any, _i: any) => {
										newItems[`list${v}`] = _i;
									},
									newItems.listComponentId,
									{ useAsValue: false }
								);
							};
						}),
						isList
							? {
									operation: ADD_NEW_NODE,
									options() {
										return {
											nodeType: NodeTypes.ComponentApi,
											callback: (nn: { id: any }) => {
												newItems.listComponentInternalApi = nn.id;
											},
											parent: newItems.listComponentId,
											linkProperties: {
												properties: { ...LinkProperties.ComponentInternalApi }
											},
											groupProperties: {},
											properties: {
												[NodeProperties.UIText]: `item`,
												[NodeProperties.Pinned]: false,
												[NodeProperties.UseAsValue]: true
											}
										};
									}
								}
							: null,
						isList
							? {
									operation: ADD_NEW_NODE,
									options() {
										return {
											nodeType: NodeTypes.ComponentExternalApi,
											callback: (nn: { id: any }) => {
												newItems.listComponentExternalApi = nn.id;
											},
											parent: newItems.listComponentId,
											linkProperties: {
												properties: { ...LinkProperties.ComponentExternalApi }
											},
											groupProperties: {},
											properties: {
												[NodeProperties.Pinned]: false,
												[NodeProperties.UIText]: `value`
											}
										};
									}
								}
							: null,
						isList
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											source: newItems.listComponentInternalApi,
											target: newItems.listComponentExternalApi,
											properties: {
												...LinkProperties.ComponentInternalConnection
											}
										};
									}
								}
							: null,
						isList && !isSharedComponent
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											source: newItems.listComponentExternalApi,
											target: getApiConnectors(newItems, newItems.screenNodeOptionId, 'value')
												.internalId,
											properties: {
												...LinkProperties.ComponentExternalConnection
											}
										};
									}
								}
							: null,
						isList
							? {
									operation: NEW_DATA_SOURCE,
									options(currentGraph: any) {
										return {
											parent: listComponentId,
											callback: (dataSource: { id: any }) => {
												dataSourceId = dataSource.id;
											},
											groupProperties: {},
											properties: {
												[NodeProperties.InstanceType]: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												[NodeProperties.UIType]: GetNodeProp(
													listComponentId,
													NodeProperties.UIType,
													currentGraph
												),
												[NodeProperties.Pinned]: false,
												[NodeProperties.UIText]: `${GetNodeTitle(
													currentNode
												)} Data Source ${GetNodeProp(
													listComponentId,
													NodeProperties.UIType,
													currentGraph
												)}`
											},
											linkProperties: {
												properties: { ...LinkProperties.DataSourceLink }
											}
										};
									}
								}
							: false,
						{
							operation: NEW_COMPONENT_NODE,
							options(currentGraph: any) {
								layout = CreateLayout();
								layout = SetCellsLayout(layout, 1);
								const rootCellId = GetFirstCell(layout);
								const cellProperties = GetCellProperties(layout, rootCellId);
								cellProperties.style = {
									...cellProperties.style,
									flexDirection: 'column'
								};
								const propertyCount = modelProperties.length + 2; //TODO: // THIS NEEDS TO CHANGE.
								const componentProps = null;
								if (isList) {
									addComponentTags(ComponentTags.List, cellProperties);
								} else {
									addComponentTags(ComponentTags.Form, cellProperties);
								}

								layout = SetCellsLayout(layout, propertyCount, rootCellId);

								let connectto: any[] = [];
								if (isDefaultComponent && !isList) {
									connectto = getViewTypeEndpointsForDefaults(viewType, currentGraph, currentNode.id);
								}
								return {
									callback: (screenComponent: { id: any }, graph: any) => {
										screenComponentId = screenComponent.id;
										newItems.screenComponentId = screenComponentId;
										connectto.forEach((ct) => {
											createConnections.push(() => {
												return SetSharedComponent({
													properties: {
														...LinkProperties.DefaultViewType,
														viewType,
														uiType,
														isPluralComponent
													},
													graph,
													source: ct.id,
													isPluralComponent,
													target: screenComponentId,
													viewType,
													uiType
												});
											});
										});
									},
									parent: isList ? listComponentId : screenNodeOptionId,
									properties: {
										...viewPackage,
										[NodeProperties.UIText]: `${viewName}`,
										[NodeProperties.UIType]: uiType,
										[NodeProperties.ViewType]: viewType,
										[NodeProperties.SharedComponent]: isSharedComponent,
										[NodeProperties.Pinned]: false,
										...agentId && !isSharedComponent ? { [NodeProperties.Agent]: agentId } : {},
										[NodeProperties.ComponentType]: isList
											? ComponentTypes[uiType].ListItem.key
											: ComponentTypes[uiType].Form.key,
										[NodeProperties.InstanceType]: useModelInstance
											? InstanceTypes.ModelInstance
											: InstanceTypes.ScreenInstance,
										[NodeProperties.Layout]: layout,
										[NodeProperties.ComponentApi]: componentProps
									},
									groupProperties: {},
									linkProperties: {
										properties: isList
											? { ...LinkProperties.ListItem }
											: { ...LinkProperties.ComponentLink }
									}
								};
							}
						},
						function() {
							return addListItemComponentApi(
								newItems,
								ApiNodeKeys.ViewModel,
								false,
								(v: any, _i: any) => {
									newItems.componentViewModelApiIds = _i;
								},
								newItems.screenComponentId,
								{ useAsValue: false }
							);
						},
						isList
							? function() {
									if (!isList) {
										return [];
									}
									return {
										operation: ADD_LINK_BETWEEN_NODES,
										options() {
											return {
												target: newItems.componentItemListViewModel.internalId,
												source: newItems.componentViewModelApiIds.externalId,
												properties: {
													...LinkProperties.ComponentExternalConnection
												}
											};
										}
									};
								}
							: null,

						...[ 'index', 'separators' ].map((text) => {
							return function() {
								if (!isList) {
									return [];
								}
								return [
									...addListItemComponentApi(
										newItems,
										text,
										false,
										(v: any, _i: any) => {
											newItems[`listItem${v}`] = _i;
										},
										newItems.screenComponentId
									)
								];
							};
						}),

						...[ 'index', 'separators' ].map((text) => {
							return function() {
								if (!isList) {
									return [];
								}
								return {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: newItems[`list${text}`].internalId,
											source: newItems[`listItem${text}`].externalId,
											properties: {
												...LinkProperties.ComponentExternalConnection
											}
										};
									}
								};
							};
						}),
						{
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.ComponentApi,
									callback: (nn: { id: any }) => {
										newItems.screenComponentIdInternalApi = nn.id;
									},
									parent: newItems.screenComponentId,
									linkProperties: {
										properties: { ...LinkProperties.ComponentInternalApi }
									},
									groupProperties: {},
									properties: {
										[NodeProperties.UIText]: `value`,
										[NodeProperties.Pinned]: false,
										[NodeProperties.UseAsValue]: true
									}
								};
							}
						},
						{
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.ComponentExternalApi,
									callback: (nn: { id: any }) => {
										newItems.screenComponentIdExternalApi = nn.id;
										setApiConnectors(
											newItems,
											newItems.screenComponentId,
											{
												externalId: nn.id,
												internalId: newItems.screenComponentIdInternalApi
											},
											'value'
										);
									},
									parent: newItems.screenComponentId,
									linkProperties: {
										properties: { ...LinkProperties.ComponentExternalApi }
									},
									groupProperties: {},
									properties: {
										[NodeProperties.Pinned]: false,
										[NodeProperties.UIText]: `value`
									}
								};
							}
						},
						{
							operation: ADD_LINK_BETWEEN_NODES,
							options() {
								return {
									source: getApiConnectors(newItems, newItems.screenComponentId, 'value').internalId,
									target: getApiConnectors(newItems, newItems.screenComponentId, 'value').externalId,
									properties: {
										...LinkProperties.ComponentInternalConnection
									}
								};
							}
						},
						!isSharedComponent
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										if (screenNodeOptionId || listComponentId) {
											return {
												source: getApiConnectors(newItems, newItems.screenComponentId, 'value')
													.externalId,
												target: getApiConnectors(
													newItems,
													isList ? listComponentId : screenNodeOptionId,
													'value'
												).internalId,
												properties: {
													...LinkProperties.ComponentExternalConnection
												}
											};
										}
									}
								}
							: false,
						!isSharedComponent
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										if (screenNodeOptionId || listComponentId) {
											return {
												source: getApiConnectors(
													newItems,
													newItems.screenComponentId,
													ApiNodeKeys.ViewModel
												).externalId,
												target: getApiConnectors(
													newItems,
													isList ? listComponentId : screenNodeOptionId,
													ApiNodeKeys.ViewModel
												).internalId,
												properties: {
													...LinkProperties.ComponentExternalConnection
												}
											};
										}
									}
								}
							: null,
						!isSharedComponent
							? {
									operation: CHANGE_NODE_PROPERTY,
									options(currentGraph: any) {
										const formLayout = GetNodeProp(
											screenNodeOptionId,
											NodeProperties.Layout,
											currentGraph
										);
										const rootCellId: any = GetFirstCell(formLayout);
										const cellProperties = GetCellProperties(formLayout, rootCellId);
										cellProperties.children[rootCellId] = isList
											? listComponentId
											: screenComponentId;

										return {
											prop: NodeProperties.Layout,
											value: formLayout,
											id: screenNodeOptionId
										};
									}
								}
							: false,

						isList
							? {
									operation: CHANGE_NODE_PROPERTY,
									options(currentGraph: any) {
										const formLayout = GetNodeProp(
											listComponentId,
											NodeProperties.Layout,
											currentGraph
										);
										const rootCellId: any = GetFirstCell(formLayout);
										const cellProperties = GetCellProperties(formLayout, rootCellId);
										cellProperties.children[rootCellId] = screenComponentId;

										return {
											prop: NodeProperties.Layout,
											value: formLayout,
											id: listComponentId
										};
									}
								}
							: false,
						...modelProperties
							.map((modelProperty: _.Node, modelIndex: number) => {
								const sharedComponent = GetSharedComponentFor(
									viewType,
									modelProperty,
									currentNode.id,
									isSharedComponent,
									uiType
								);
								if (!sharedComponent) {
									switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
										case NodeTypes.Model:
											return {};
										case NodeTypes.Property:
											if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
												// if the property is a model reference, it should be a shared component or something.
												return {};
											}
											break;
										default:
											break;
									}
								} else {
									childComponents[modelIndex] = sharedComponent;
									return [
										...[
											'value',
											ApiNodeKeys.ViewModel,
											'label',
											'placeholder',
											'error',
											'success'
										].map(
											(v) =>
												function() {
													const graph = GetCurrentGraph(GetStateFunc()());
													return addComponentApiToForm({
														newItems,
														text: v,
														parent: sharedComponent,
														isSingular: true,
														graph
													});
												}
										)
									];
								}

								return [
									{
										operation: NEW_COMPONENT_NODE,
										options() {
											const componentTypeToUse =
												GetNodeProp(modelProperty.id, NodeProperties.ComponentType) ||
												viewComponentType;

											// Check if the property has a default view to use for different types of situations

											return {
												parent: screenComponentId,
												groupProperties: {},
												properties: {
													...viewPackage,
													[NodeProperties.UIText]: `${GetNodeTitle(modelProperty)}`,
													[NodeProperties.UIType]: uiType,
													[NodeProperties.Label]: GetNodeTitle(modelProperty),
													[NodeProperties.ComponentType]:
														sharedComponent || componentTypeToUse,
													[NodeProperties.UsingSharedComponent]: !!sharedComponent,
													[NodeProperties.Pinned]: false,
													...agentId && !isSharedComponent
														? { [NodeProperties.Agent]: agentId }
														: {},
													[NodeProperties.InstanceType]: useModelInstance
														? InstanceTypes.ModelInstance
														: InstanceTypes.ScreenInstance
												},
												linkProperties: {
													properties: { ...LinkProperties.ComponentLink }
												},
												links: [
													{
														target: modelProperty ? modelProperty.id : null,
														linkProperties: {
															properties: {
																...LinkProperties.PropertyLink,
																[LinkPropertyKeys.ComponentProperty]: true
															}
														}
													}
												],
												callback: (component: { id: any }) => {
													childComponents[modelIndex] = component.id;
												}
											};
										}
									},

									function() {
										return addComponentApiNodes(newItems, childComponents, modelIndex);
									},
									function() {
										return addComponentApiNodes(newItems, childComponents, modelIndex, 'label');
									},
									function() {
										return addComponentApiNodes(
											newItems,
											childComponents,
											modelIndex,
											'placeholder'
										);
									},
									function() {
										return addComponentApiNodes(newItems, childComponents, modelIndex, 'error');
									},
									function() {
										return addComponentApiNodes(newItems, childComponents, modelIndex, 'success');
									},
									function() {
										return addComponentApiNodes(
											newItems,
											childComponents,
											modelIndex,
											ApiNodeKeys.ViewModel,
											newItems.componentViewModelApiIds.internalId
										);
									},
									function() {
										return addComponentEventApiNodes({
											newItems,
											childComponents,
											modelIndex,
											viewComponent,
											viewPackage,
											modelProperty,
											currentNode,
											useModelInstance
										});
									},

									...[ 'value', ApiNodeKeys.ViewModel, 'label', 'placeholder', 'error', 'success' ]
										.map((v) => {
											return function(graph: any) {
												let connectto = [];
												if (isDefaultComponent) {
													connectto = getViewTypeEndpointsForDefaults(
														viewType,
														graph,
														currentNode.id
													);
												}

												const shared_to_component_commands: any[] = [];
												connectto.map((ct: any) => {
													shared_to_component_commands.push(
														...addComponentApiToForm({
															newItems,
															text: v,
															parent: ct.id,
															isSingular: true,
															graph
														})
													);
												});
												return shared_to_component_commands.flatten();
											};
										})
										.filter((x) => x && isSharedComponent && isDefaultComponent),

									isSharedComponent && isDefaultComponent
										? function(graph: any) {
												let connectto = [];
												if (isDefaultComponent) {
													connectto = getViewTypeEndpointsForDefaults(
														viewType,
														graph,
														currentNode.id
													);
												}

												const shared_to_component_commands: {
													operation: string;
													options(): { source: any; target: any; properties: any };
												}[] = [];
												connectto.map((ct: any) => {
													const temp = GetNodesLinkedTo(graph, {
														id: ct.id,
														link: LinkType.ComponentInternalApi
													}).filter(
														(x: any) =>
															GetNodeProp(x, NodeProperties.NODEType) ===
															NodeTypes.ComponentApi
													);
													// && GetNodeProp(x, NodeProperties.UIText) === text
													temp.map((t: any) => {
														shared_to_component_commands.push(
															...connectComponentToExternalApi({
																newItems,
																parent: ct.id,
																key: GetNodeProp(t, NodeProperties.UIText),
																properties: {
																	...LinkProperties.ComponentExternalConnection,
																	...needsLoadToScreenState
																		? {
																				[LinkPropertyKeys.InstanceUpdate]: false
																			}
																		: {}
																},
																child: childComponents[modelIndex]
															})
														);
													});
												});
												return shared_to_component_commands;
											}
										: null
								].filter((x) => x);
							})
							.flatten(),
						...modelProperties.map((modelProperty: any) => {
							return {
								operation: ADD_LINK_BETWEEN_NODES,
								options() {
									const sharedComponent = GetSharedComponentFor(
										viewType,
										modelProperty,
										currentNode.id,
										isSharedComponent,
										uiType
									);
									if (
										screenComponentId &&
										sharedComponent &&
										!existsLinkBetween(GetCurrentGraph(GetState()), {
											source: screenComponentId,
											target: sharedComponent,
											type: LinkType.SharedComponentInstance
										})
									) {
										return {
											source: screenComponentId,
											target: sharedComponent,
											properties: {
												...LinkProperties.SharedComponentInstance
											}
										};
									}
								}
							};
						}),
						// {
						// 	operation: NEW_COMPONENT_NODE,
						// 	options() {
						// 		return {
						// 			parent: screenComponentId,
						// 			groupProperties: {},
						// 			properties: {
						// 				...viewPackage,
						// 				[NodeProperties.UIText]: `${agentId && !isSharedComponent
						// 					? GetNodeTitle(agentId)
						// 					: ''} ${Titles.Execute} ${viewName} Button`,
						// 				[NodeProperties.UIType]: uiType,
						// 				...agentId ? { [NodeProperties.Agent]: agentId } : {},
						// 				[NodeProperties.Pinned]: false,
						// 				[NodeProperties.Label]: `${Titles.Execute} Button`,
						// 				[NodeProperties.ExecuteButton]: true,
						// 				[NodeProperties.ComponentType]: ComponentTypes[uiType].Button.key,
						// 				[NodeProperties.InstanceType]: useModelInstance
						// 					? InstanceTypes.ModelInstance
						// 					: InstanceTypes.ScreenInstance
						// 			},
						// 			linkProperties: {
						// 				properties: { ...LinkProperties.ComponentLink }
						// 			},
						// 			callback: (component: { id: any }) => {
						// 				childComponents.push(component.id);
						// 				newItems.button = component.id;
						// 				method_result.formButton = component.id;
						// 				method_result.uiTypes[args.uiType] = method_result.uiTypes[args.uiType] || {};
						// 				method_result.uiTypes[args.uiType].formButton = component.id;
						// 			}
						// 		};
						// 	}
						// },
						{
							operation: NEW_COMPONENT_NODE,
							options() {
								return {
									parent: screenComponentId,
									groupProperties: {},
									properties: {
										...viewPackage,
										[NodeProperties.UIText]: `${Titles.Cancel} ${viewName} Button`,
										[NodeProperties.UIType]: uiType,
										[NodeProperties.Pinned]: false,
										[NodeProperties.CancelButton]: true,
										[NodeProperties.Label]: `${Titles.Cancel} ${viewName} Button`,
										...agentId && !isSharedComponent ? { [NodeProperties.Agent]: agentId } : {},
										[NodeProperties.ComponentType]: ComponentTypes[uiType].Button.key,
										[NodeProperties.InstanceType]: useModelInstance
											? InstanceTypes.ModelInstance
											: InstanceTypes.ScreenInstance
									},
									linkProperties: {
										properties: { ...LinkProperties.ComponentLink }
									},
									callback: (component: { id: any }) => {
										childComponents.push(component.id);
										newItems.cancelbutton = component.id;
										method_result.cancelButton = component.id;
										method_result.uiTypes[args.uiType] = method_result.uiTypes[args.uiType] || {};
										method_result.uiTypes[args.uiType].cancelButton = component.id;
									}
								};
							}
						},

						addTitleService({ newItems }),
						...addButtonApiNodes(newItems),
						...addButtonApiNodes(newItems, () => {
							return newItems.cancelbutton;
						}),
						{
							operation: ADD_NEW_NODE,
							options() {
								if (newItems.button) {
									return {
										nodeType: NodeTypes.ComponentApi,
										callback: (nn: { id: any }) => {
											newItems.buttonInternalApi = nn.id;
										},
										linkProperties: {
											properties: { ...LinkProperties.ComponentInternalApi }
										},
										parent: newItems.button,
										groupProperties: {},
										properties: {
											[NodeProperties.UIText]: `value`,
											[NodeProperties.Pinned]: false,
											[NodeProperties.UseAsValue]: true
										}
									};
								}
								return null;
							}
						},
						{
							operation: ADD_NEW_NODE,
							options() {
								if (newItems.button) {
									return {
										nodeType: NodeTypes.ComponentExternalApi,
										callback: (nn: { id: any }) => {
											newItems.buttonExternalApi = nn.id;
										},
										parent: newItems.button,
										linkProperties: {
											properties: { ...LinkProperties.ComponentExternalApi }
										},
										groupProperties: {},
										properties: {
											[NodeProperties.Pinned]: false,
											[NodeProperties.UIText]: `value`
										}
									};
								}
								return null;
							}
						},
						{
							operation: ADD_LINK_BETWEEN_NODES,
							options() {
								if (newItems.buttonInternalApi && newItems.buttonExternalApi) {
									return {
										source: newItems.buttonInternalApi,
										target: newItems.buttonExternalApi,
										properties: {
											...LinkProperties.ComponentInternalConnection
										}
									};
								}
								return null;
							}
						},
						{
							operation: ADD_LINK_BETWEEN_NODES,
							options() {
								if (newItems.buttonExternalApi) {
									return {
										target: newItems.screenComponentIdInternalApi,
										source: newItems.buttonExternalApi,
										properties: {
											...LinkProperties.ComponentExternalConnection,
											...needsLoadToScreenState
												? {
														[LinkPropertyKeys.InstanceUpdate]: true
													}
												: {}
										}
									};
								}
								return null;
							}
						},
						function() {
							if (newItems.button) {
								return addComponentApiToForm({
									newItems,
									text: ApiNodeKeys.ViewModel,
									parent: newItems.button
								});
							}
							return false;
						},
						function() {
							if (newItems.button) {
								return connectComponentToExternalApi({
									newItems,
									parent: newItems.screenComponentId,
									key: ApiNodeKeys.ViewModel,
									properties: {
										...LinkProperties.ComponentExternalConnection,
										...needsLoadToScreenState
											? {
													[LinkPropertyKeys.InstanceUpdate]: true
												}
											: {}
									},
									child: newItems.button
								});
							}
						},
						...ComponentTypes[uiType].Button.eventApi.map((t: string | number) => {
							if (newItems.button) {
								return {
									operation: ADD_NEW_NODE,
									options() {
										return {
											nodeType: NodeTypes.EventMethod,
											properties: {
												...viewPackage,
												[NodeProperties.InstanceType]: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												[NodeProperties.EventType]: t,
												[NodeProperties.UIText]: `${t}`,
												[NodeProperties.Pinned]: false
											},
											callback(component: { id: any }) {
												method_result.formButtonApi = method_result.formButtonApi || {};
												method_result.formButtonApi[t] = component.id;

												method_result.uiTypes[args.uiType] =
													method_result.uiTypes[args.uiType] || {};
												method_result.uiTypes[args.uiType].formButtonApi =
													method_result.uiTypes[args.uiType].formButtonApi || {};
												method_result.uiTypes[args.uiType].formButtonApi[t] = component.id;
											},
											links: [
												{
													target: currentNode.id,
													linkProperties: {
														properties: { ...LinkProperties.ModelTypeLink }
													}
												},
												{
													target: newItems.button,
													linkProperties: {
														properties: { ...LinkProperties.EventMethod }
													}
												}
											]
										};
									}
								};
							}
							return false;
						}),
						{
							operation: CHANGE_NODE_PROPERTY,
							options() {
								if (newItems.button) {
									const executeButtonComponent = childComponents.indexOf(newItems.button);
									if (executeButtonComponent !== -1) {
										const rootCellId = GetFirstCell(layout);
										const children = GetChildren(layout, rootCellId);
										const childId = children[executeButtonComponent];
										const cellProperties = GetCellProperties(layout, childId);
										cellProperties.children[childId] = newItems.button;
										cellProperties.style.flex = null;
										cellProperties.style.height = null;
										addComponentTags(ComponentTags.MainButton, cellProperties);
										return {
											prop: NodeProperties.Layout,
											id: screenComponentId,
											value: layout
										};
									}
								}
								return null;
							}
						},
						{
							operation: CHANGE_NODE_PROPERTY,
							options() {
								const executeButtonComponent = childComponents.indexOf(newItems.cancelbutton);
								if (executeButtonComponent !== -1) {
									const rootCellId = GetFirstCell(layout);
									const children = GetChildren(layout, rootCellId);
									const childId = children[executeButtonComponent];
									const cellProperties = GetCellProperties(layout, childId);
									cellProperties.children[childId] = childComponents[executeButtonComponent];
									cellProperties.style.flex = null;
									cellProperties.style.height = null;
									addComponentTags(ComponentTags.SecondaryButton, cellProperties);
									addComponentTags(ComponentTags.CancelButton, cellProperties);
									return {
										prop: NodeProperties.Layout,
										id: screenComponentId,
										value: layout
									};
								}
								return false;
							}
						},
						...modelProperties.map((modelProperty: any, modelIndex: any) => {
							return {
								operation: CHANGE_NODE_PROPERTY,
								options() {
									let sharedComponent = GetSharedComponentFor(
										viewType,
										modelProperty,
										currentNode.id,
										isSharedComponent,
										uiType
									);
									if (!sharedComponent) {
										switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
											case NodeTypes.Model:
												return {};
											case NodeTypes.Property:
												if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
													const _ui_model_type = GetNodeProp(
														modelProperty,
														NodeProperties.UIModelType
													);
													if (_ui_model_type) {
														sharedComponent = GetSharedComponentFor(
															viewType,
															modelProperty,
															_ui_model_type,
															isSharedComponent,
															uiType
														);
													}
													if (!sharedComponent) {
														// if the property is a model reference, it should be a shared component or something.
														return {};
													}
												}
												break;
											default:
												break;
										}
									}

									const rootCellId = GetFirstCell(layout);
									const children = GetChildren(layout, rootCellId);
									const childId = children[modelIndex];
									const cellProperties = GetCellProperties(layout, childId);
									cellProperties.children[childId] = sharedComponent || childComponents[modelIndex];
									cellProperties.style.flex = null;
									cellProperties.style.height = null;
									addComponentTags(ComponentTags.Field, cellProperties);

									return {
										prop: NodeProperties.Layout,
										id: screenComponentId,
										value: layout
									};
								}
							};
						}),
						...modelProperties.map((modelProperty: any, modelIndex: string | number) => {
							const sharedComponent = GetSharedComponentFor(
								viewType,
								modelProperty,
								currentNode.id,
								isSharedComponent,
								uiType
							);
							if (!sharedComponent) {
								switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
									case NodeTypes.Model:
										return {};
									case NodeTypes.Property:
										if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
											// if the property is a model reference, it should be a shared component or something.
											return {};
										}
										break;
									default:
										break;
								}
							}
							return {
								operation: CHANGE_NODE_PROPERTY,
								options(graph: any) {
									let componentProps: any = createComponentApi();
									const componentTypes: any = ComponentTypes[uiType];
									const compNodeId: any = childComponents[modelIndex];
									const compNode: any = GetNodeById(compNodeId, graph);
									const componentType: any = GetNodeProp(compNode, NodeProperties.ComponentType);
									if (!sharedComponent && componentTypes[componentType]) {
										if (componentTypes[componentType].defaultApi) {
											componentTypes[componentType].defaultApi.map((x: { property: any }) => {
												componentProps = addComponentApi(componentProps, {
													modelProp: x.property
												});
											});
										}
									} else if (sharedComponent) {
										componentProps = {};
										//     let { instanceType, model, selector, modelProperty, apiProperty, handlerType, isHandler, dataChain } = apiConfig[i];
										SHARED_COMPONENT_API.map((x) => {
											componentProps[x.property] = {
												instanceType: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												model: currentNode.id,
												modelProperty: modelProperty ? modelProperty.id : null,
												handlerType: HandlerTypes.Property
											};
										});
									} else {
										throw 'sharedComponent should be set';
									}

									return {
										prop: NodeProperties.ComponentApi,
										id: compNodeId,
										value: componentProps
									};
								}
							};
						}),
						{
							operation: CHANGE_NODE_PROPERTY,
							options(graph: any) {
								if (newItems.cancelbutton) {
									let componentProps = createComponentApi();
									const componentTypes = ComponentTypes[uiType];

									const compNodeId = newItems.cancelbutton;
									const compNode = GetNodeById(compNodeId, graph);
									const componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
									componentTypes[componentType].defaultApi.map((x: { property: any }) => {
										componentProps = addComponentApi(componentProps, {
											modelProp: x.property
										});
									});

									return {
										prop: NodeProperties.ComponentApi,
										id: compNodeId,
										value: componentProps
									};
								}
								return null;
							}
						},
						{
							operation: CHANGE_NODE_PROPERTY,
							options(graph: any) {
								if (newItems.button) {
									let componentProps = createComponentApi();
									const componentTypes = ComponentTypes[uiType];
									const compNodeId = newItems.button;
									const compNode = GetNodeById(compNodeId, graph);
									const componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
									componentTypes[componentType].defaultApi.map((x: { property: any }) => {
										componentProps = addComponentApi(componentProps, {
											modelProp: x.property
										});
									});

									return {
										prop: NodeProperties.ComponentApi,
										id: compNodeId,
										value: componentProps
									};
								}
								return null;
							}
						},
						function() {
							if (newItems.cancelbutton) {
								return AddNavigateBackHandler({
									button: newItems.cancelbutton,
									evt: uiType === UITypes.ReactNative ? 'onPress' : 'onClick'
								});
							}
						},
						function() {
							const selectorNode = GetNodesByProperties({
								[NodeProperties.Model]: currentNode.id,
								[NodeProperties.NODEType]: NodeTypes.Selector
								//  [NodeProperties.IsShared]: isSharedComponent,
								// [NodeProperties.InstanceType]: useModelInstance
							}).find((x) => x);
							return [
								{
									operation: selectorNode ? ADD_LINKS_BETWEEN_NODES : ADD_NEW_NODE,
									options() {
										if (selectorNode) {
											modelComponentSelectors.push(selectorNode.id);
											return {
												links: [
													{
														source: selectorNode.id,
														target: currentNode.id,
														linkProperties: {
															properties: { ...LinkProperties.ModelTypeLink }
														}
													}
												]
											};
										}
										return {
											nodeType: NodeTypes.Selector,
											properties: {
												...viewPackage,
												[NodeProperties.UIText]: `${GetNodeTitle(currentNode)}${useModelInstance
													? ' Instance'
													: ''}`,
												[NodeProperties.Model]: currentNode.id,
												[NodeProperties.Pinned]: false
												// [NodeProperties.IsShared]: isSharedComponent,
												// [NodeProperties.InstanceType]: useModelInstance
											},
											links: [
												{
													target: currentNode.id,
													linkProperties: {
														properties: { ...LinkProperties.ModelTypeLink }
													}
												}
											],
											callback: (selector: { id: any }) => {
												modelComponentSelectors.push(selector.id);
											}
										};
									}
								}
							];
						}
					].filter((x) => x),
					...[
						isList
							? {
									operation: ADD_NEW_NODE,
									options() {
										const node = GetNodesByProperties({
											[NodeProperties.EntryPoint]: true,
											[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Models,
											[NodeProperties.UIModelType]: currentNode.id
										}).find((x) => x);
										if (node) {
											listDataChainId = node.id;
											skipModelDataChainListParts = true;
											return null;
										}

										return {
											callback: (dataChain: { id: any }) => {
												listDataChainId = dataChain.id;
											},
											nodeType: NodeTypes.DataChain,
											properties: {
												...viewPackage,
												[NodeProperties.UIText]: `Get ${viewName} Objects`,
												[NodeProperties.EntryPoint]: true,
												[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Models,
												[NodeProperties.UIModelType]: currentNode.id,
												[NodeProperties.Pinned]: false,
												[NodeProperties.InstanceType]: useModelInstance
											},
											links: [
												{
													target: currentNode.id,
													linkProperties: {
														properties: {
															...LinkProperties.ModelTypeLink
														}
													}
												}
											]
										};
									}
								}
							: false,
						isList
							? {
									operation: ADD_NEW_NODE,
									options(graph: any) {
										if (skipModelDataChainListParts) {
											return null;
										}
										const temp = SplitDataCommand(
											GetNodeById(listDataChainId, graph),
											(split: { id: any }, graph: any, groupId: any) => {
												listDataChainExitId = split.id;
												newItems.listDataChainExitId = listDataChainExitId;
												newItems.listDataChainExitGroupId = groupId;
											},
											viewPackage
										);
										return temp.options;
									}
								}
							: false,
						isList
							? {
									operation: CHANGE_NODE_PROPERTY,
									options() {
										if (skipModelDataChainListParts) {
											return null;
										}
										return {
											prop: NodeProperties.DataChainFunctionType,
											id: listDataChainExitId,
											value: DataChainFunctionKeys.Pass
										};
									}
								}
							: false,
						isList
							? {
									operation: CHANGE_NODE_PROPERTY,
									options() {
										if (skipModelDataChainListParts) {
											return null;
										}
										return {
											prop: NodeProperties.UIText,
											id: listDataChainExitId,
											value: `${GetNodeTitle(currentNode)}s DC Complete`
										};
									}
								}
							: false,
						isList
							? {
									operation: CHANGE_NODE_PROPERTY,
									options() {
										if (skipModelDataChainListParts) {
											return null;
										}
										return {
											prop: NodeProperties.AsOutput,
											id: listDataChainExitId,
											value: true
										};
									}
								}
							: false,
						isList
							? {
									operation: CHANGE_NODE_PROPERTY,
									options() {
										return {
											prop: NodeProperties.DataChain,
											id: dataSourceId,
											value: listDataChainId
										};
									}
								}
							: false,
						isList
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: listDataChainId,
											source: dataSourceId,
											properties: { ...LinkProperties.DataChainLink }
										};
									}
								}
							: false,
						isList
							? {
									operation: CHANGE_NODE_PROPERTY,
									options() {
										return {
											prop: NodeProperties.UIModelType,
											id: dataSourceId,
											value: currentNode.id
										};
									}
								}
							: false,
						isList
							? {
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: currentNode.id,
											source: dataSourceId,
											properties: { ...LinkProperties.ModelTypeLink }
										};
									}
								}
							: false
					].filter((x) => x),
					...[
						{
							operation: ADD_NEW_NODE,
							options(graph: any) {
								const node = GetNodesByProperties(
									{
										[NodeProperties.UIText]: `Get ${viewName}`,
										[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
										[NodeProperties.EntryPoint]: true,
										[NodeProperties.Model]: currentNode.id,
										[NodeProperties.Selector]: modelComponentSelectors[0],
										[NodeProperties.SelectorProperty]: SelectorPropertyKeys.Object
									},
									graph
								).find((x) => x);
								if (node) {
									skipAddingComplete = true;
									newItems.getObjectDataChain = node.id;
									return null;
								}
								return {
									nodeType: NodeTypes.DataChain,
									callback: (n: { id: any }) => {
										newItems.getObjectDataChain = n.id;
									},
									properties: {
										...viewPackage,
										[NodeProperties.UIText]: `Get ${viewName}`,
										[NodeProperties.EntryPoint]: true,
										[NodeProperties.Model]: currentNode.id,
										[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
										[NodeProperties.Selector]: modelComponentSelectors[0],
										[NodeProperties.SelectorProperty]: SelectorPropertyKeys.Object,
										[NodeProperties.Pinned]: true
									},
									links: [
										{
											target: modelComponentSelectors[0],
											linkProperties: {
												properties: { ...LinkProperties.DataChainLink }
											}
										},
										{
											target: currentNode.id,
											linkProperties: {
												properties: { ...LinkProperties.ModelTypeLink }
											}
										}
									]
								};
							}
						},
						{
							operation: ADD_NEW_NODE,
							options(graph: any) {
								if (skipAddingComplete) {
									return false;
								}
								const temp = AddChainCommand(
									GetNodeById(newItems.getObjectDataChain, graph),
									() => {},
									graph,
									{
										...viewPackage,
										[NodeProperties.AsOutput]: true,
										[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
										[NodeProperties.UIText]: `Get ${viewName} Complete`
									}
								);
								return temp.options;
							}
						}
					]
				])(GetDispatchFunc(), GetStateFunc());

				modelProperties.forEach((modelProperty: any, propertyIndex: any) => {
					let propDataChainNodeId = null;
					let skip = false;
					let _ui_model_type = false;
					let referenceproperty = false;
					// Needs an accessor even if it is a shared or reference property
					switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
						case NodeTypes.Model:
							return {};
						case NodeTypes.Property:
							if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
								// if the property is a model reference, it should be a shared component or something.
								// The ViewType will be need the data chain accessor to get the property value
								// on the object.
								/*
                                    current.[property]
                                    we need to get the property to pass to the shared component.
                                */
								// If the thing being referenced is a n => many that means it will need,
								// the 'current' id to be able to query for the children objects.

								if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
									_ui_model_type = GetNodeProp(modelProperty, NodeProperties.UIModelType);
									if (_ui_model_type) {
										referenceproperty = GetSharedComponentFor(
											viewType,
											modelProperty,
											_ui_model_type,
											isSharedComponent,
											uiType
										);
									}
								}
							}
							break;
						default:
							break;
					}

					const buildPropertyResult = BuildPropertyDataChainAccessor({
						viewName,
						modelProperty,
						currentNode,
						modelComponentSelectors,
						skip,
						isSharedComponent,
						viewPackage,
						propertyDataChainAccesors,
						uiType,
						viewType,
						newItems,
						childComponents,
						propertyIndex
					});
					if (referenceproperty) {
						// add data-chain accessor to view-type external connections
						AttachDataChainAccessorTo(referenceproperty, buildPropertyResult.propDataChainNodeId);
						AttachSelectorAccessorTo(referenceproperty, modelComponentSelectors[0]);
						return {};
					}
					skip = buildPropertyResult.skip;
					propDataChainNodeId = buildPropertyResult.propDataChainNodeId;
					if (_ui_model_type) {
						return {};
					}
					ConnectExternalApisToSelectors({
						modelComponentSelectors,
						newItems,
						viewType,
						childComponents,
						propertyIndex
					});

					const compNodeId = childComponents[propertyIndex];

					const rootCellId = GetFirstCell(layout);
					const children = GetChildren(layout, rootCellId);
					const childId = children[propertyIndex];
					const apiList = PropertyApiList; // getComponentApiList(componentApi);
					const apiDataChainLists: any = {};
					newItems.apiDataChain = newItems.apiDataChain || {};
					newItems.apiDataChain[childId] = apiDataChainLists;

					setupPropertyApi({
						viewName,
						modelProperty,
						childId,
						currentNode,
						modelComponentSelectors,
						useModelInstance,
						isSharedComponent,
						viewPackage,
						propertyDataChainAccesors,
						apiList,
						uiType,
						apiDataChainLists,
						propDataChainNodeId,
						viewType,
						newItems,
						childComponents,
						propertyIndex
					});

					PerformGraphOperation([
						...apiList.map((api) => {
							return {
								operation: CHANGE_NODE_PROPERTY,
								options() {
									const apiProperty = api.value;
									const cellProperties = GetCellProperties(layout, childId);
									cellProperties.componentApi = cellProperties.componentApi || {};
									// let { instanceType, model, selector, handlerType, dataChain, modelProperty } = cellProperties.componentApi[apiProperty] || {};
									if (ARE_BOOLEANS.some((v) => v === apiProperty)) {
										cellProperties.componentApi[apiProperty] = {
											instanceType: InstanceTypes.Boolean,
											handlerType: HandlerTypes.Property
										};
									} else if (ARE_HANDLERS.some((v: any) => v === apiProperty)) {
										if ([ ARE_TEXT_CHANGE ].some((v: any) => v === apiProperty)) {
											cellProperties.componentApi[apiProperty] = {
												instanceType: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												handlerType: HandlerTypes.ChangeText
											};
										} else {
											cellProperties.componentApi[apiProperty] = {
												instanceType: useModelInstance
													? InstanceTypes.ModelInstance
													: InstanceTypes.ScreenInstance,
												handlerType: HandlerTypes.Change
											};
										}
									} else {
										cellProperties.componentApi[apiProperty] = {
											instanceType: useModelInstance
												? InstanceTypes.SelectorInstance
												: InstanceTypes.Selector,
											selector: modelComponentSelectors[0],
											handlerType: HandlerTypes.Property,
											dataChain: apiDataChainLists[apiProperty]
										};
										if (apiDataChainLists[apiProperty]) {
											datachainLink.push({
												operation: ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														target: modelComponentSelectors[0],
														source: compNodeId,
														linkProperties: {
															...LinkProperties.SelectorLink
														}
													};
												}
											});
										}
									}

									switch (apiProperty) {
										case ON_BLUR:
											cellProperties.componentApi[apiProperty].model = viewModelNodeBlurId;
											cellProperties.componentApi[apiProperty].modelProperty =
												modelProperties[propertyIndex].id;
											cellProperties.componentApi[apiProperty].handlerType = HandlerTypes.Blur;
											break;
										case ON_CHANGE_TEXT:
										case ON_CHANGE:
											cellProperties.componentApi[apiProperty].modelProperty =
												modelProperties[propertyIndex].id;
											break;
										case ON_FOCUS:
											cellProperties.componentApi[apiProperty].model = viewModelNodeFocusId;
											cellProperties.componentApi[apiProperty].modelProperty =
												modelProperties[propertyIndex].id;
											cellProperties.componentApi[apiProperty].handlerType = HandlerTypes.Focus;
											break;
										default:
											break;
									}
									if (cellProperties.componentApi[apiProperty].modelProperty) {
										datachainLink.push({
											operation: ADD_LINK_BETWEEN_NODES,
											options() {
												return {
													target: cellProperties.componentApi[apiProperty].modelProperty,
													source: compNodeId,
													linkProperties: {
														...LinkProperties.ComponentApi,
														modelProperty: true
													}
												};
											}
										});
									}

									if (cellProperties.componentApi[apiProperty].model) {
										datachainLink.push({
											operation: ADD_LINK_BETWEEN_NODES,
											options() {
												return {
													target: cellProperties.componentApi[apiProperty].model,
													source: compNodeId,
													linkProperties: {
														...LinkProperties.ComponentApi,
														model: true
													}
												};
											}
										});
									}

									return {
										prop: NodeProperties.Layout,
										id: screenComponentId,
										value: layout
									};
								}
							};
						}),
						function() {
							return datachainLink;
						},
						function() {
							return [
								...[]
									.interpolate(0, modelProperties.length + 1, (modelIndex: string | number) => {
										return applyDefaultComponentProperties(
											GetNodeById(childComponents[modelIndex]),
											uiType
										);
									})
									.flatten(),

								applyDefaultComponentProperties(GetNodeById(screenComponentId), uiType),
								applyDefaultComponentProperties(GetNodeById(screenNodeOptionId), uiType)
							];
						},
						function() {
							return createConnections;
						},
						function() {
							return createListConnections;
						},
						function() {
							if (isList) {
								if (newItems.listComponentId) {
									const listViewModel = GetComponentExternalApiNode(
										ComponentApiTypes.ViewModel,
										newItems.listComponentId
									);

									const screenViewModelInternal = GetComponentInternalApiNode(
										ComponentApiTypes.ViewModel,
										newItems.screenNodeOptionId
									);
									if (listViewModel && screenViewModelInternal) {
										return ConnectListViewModelToExternalViewModel({
											target: screenViewModelInternal.id,
											source: listViewModel.id
										});
									}
								}
							}
						},
						function() {
							if (isList) {
								if (
									!newItems.listDataChainExitGetIds &&
									newItems.listDataChainExitId &&
									newItems.listDataChainExitGroupId
								) {
									return AppendGetIdsToDataChain({
										dataChain: newItems.listDataChainExitId,
										dataChainGroup: newItems.listDataChainExitGroupId,
										callback: (con: { entry: any }) => {
											newItems.listDataChainExitGetIds = con.entry;
										}
									});
								}
							}
							return [];
						},
						function() {
							if (needsLoadToScreenState) {
								return SetModelsApiLinkForInstanceUpdate({
									viewPackage: viewPackage[NodeProperties.ViewPackage]
								});
							}
						},
						function() {
							const steps = [];
							if (needsLoadToScreenState) {
								if (!isSharedComponent) {
									if (isList) {
										steps.push(
											...SetupViewModelOnScreen({
												model: currentNode.id,
												screen: screenNodeId
											})
										);
									} else {
										let modelView_DataChain: any;
										steps.push([
											...GetModelViewModelForUpdate({
												screen: GetNodeTitle(screenNodeId),
												viewModel: screenNodeId,
												callback: (ctx: { entry: any }) => {
													const { entry } = ctx;
													modelView_DataChain = entry;
												}
											}),
											function(graph: any) {
												const temp = GetNodesLinkedTo(graph, {
													id: screenNodeId,
													link: LinkType.ComponentExternalApi
												});
												const externalNode = temp.find(
													(x: any) =>
														GetNodeProp(x, NodeProperties.NODEType) ===
															NodeTypes.ComponentExternalApi &&
														GetNodeTitle(x) === ApiNodeKeys.ViewModel
												);
												return [
													{
														operation: ADD_LINK_BETWEEN_NODES,
														options() {
															return {
																target: modelView_DataChain,
																source: externalNode.id,
																properties: {
																	...LinkProperties.DataChainLink
																}
															};
														}
													}
												];
											}
										]);
									}
								}
							}

							return steps;
						}
					])(GetDispatchFunc(), GetStateFunc());
				});
			}
			// SelectedNode(currentNode.id)(GetDispatchFunc());
		};
		const { uiTypes } = _args;
		if (uiTypes) {
			for (const i in uiTypes) {
				if (uiTypes[i]) {
					default_View_method({ ..._args, uiType: i });
					setViewPackageStamp(null, 'CreateDefaultView');
				}
			}
		} else {
			default_View_method({ ..._args });
			setViewPackageStamp(null, 'CreateDefaultView');
		}
		return method_result;
	}
};

export function applyDefaultComponentProperties(currentNode: any, _ui_type: string | number) {
	// var { state } = this.props;
	// var currentNode = Node(state, Visual(state, SELECTED_NODE));
	// let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
	// let _ui_type = GetNodeProp(screenOption, NodeProperties.UIType);
	const result: { operation: string; options: { prop: any; id: any; value: any } }[] = [];
	if (currentNode) {
		const componentTypes = ComponentTypes[_ui_type] || {};
		const componentType = GetNodeProp(currentNode, NodeProperties.ComponentType);
		Object.keys(componentTypes[componentType] ? componentTypes[componentType].properties : {}).map((key) => {
			const prop_obj = componentTypes[componentType].properties[key];
			if (prop_obj.parameterConfig) {
				const selectedComponentApiProperty = key;
				let componentProperties = GetNodeProp(currentNode, prop_obj.nodeProperty);
				componentProperties = componentProperties || {};
				componentProperties[selectedComponentApiProperty] =
					componentProperties[selectedComponentApiProperty] || {};
				componentProperties[selectedComponentApiProperty] = {
					instanceType: InstanceTypes.ApiProperty,
					isHandler: prop_obj.isHandler,
					apiProperty: prop_obj.nodeProperty
				};

				result.push({
					operation: CHANGE_NODE_PROPERTY,
					options: {
						prop: prop_obj.nodeProperty,
						id: currentNode ? currentNode.id : null,
						value: componentProperties
					}
				});
			}
		});
	}

	return result;
}

function CreateFunction(option: {
	nodePackageType: any;
	methodType: any;
	httpMethod: any;
	functionType: any;
	functionName: any;
}) {
	const { nodePackageType, methodType, httpMethod, functionType, functionName } = option;
	if (!nodePackageType) {
		throw 'missing node package type';
	}
	if (!methodType) {
		throw 'missing method type';
	}
	if (!httpMethod) {
		throw 'missing http method';
	}
	if (!functionType) {
		throw 'function type missing';
	}
	if (!functionName) {
		throw 'function name is missing';
	}
	return (args: { model: any; dispatch: any; getState: any }) => {
		const { model, dispatch, getState } = args;
		// Check for existing method of this type

		// if no methods exist, then create a new method.
		// graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
		const agents = GetAgentNodes();

		agents.filter((x) => !GetNodeProp(x, NodeProperties.ExcludeFromController)).forEach((agent) => {
			let methodProps: { [x: string]: any };

			if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
				const context: any = {};
				const outer_commands = [
					{
						operation: ADD_NEW_NODE,
						options() {
							return {
								nodeType: NodeTypes.Method,
								parent: model.id,
								groupProperties: {},
								properties: {
									[NodeProperties.NodePackage]: model.id,
									[NodeProperties.NodePackageType]: nodePackageType,
									[NodeProperties.NodePackageAgent]: agent.id,
									[NodeProperties.FunctionType]: functionType,
									[NodeProperties.MethodType]: methodType,
									[NodeProperties.HttpMethod]: httpMethod,
									[NodeProperties.UIText]: `${GetNodeTitle(model)} ${functionName}`
								},
								linkProperties: {
									properties: { ...LinkProperties.FunctionOperator }
								},
								callback: (methodNode: any) => {
									context.methodNode = methodNode;
								}
							};
						}
					},
					function() {
						const { methodNode } = context;
						const { constraints } = MethodFunctions[functionType];
						let commands: any[] = [];
						Object.values(constraints).forEach((constraint: any) => {
							let perOrModelNode: any = null;
							switch (constraint.key) {
								case FunctionTemplateKeys.Model:
								case FunctionTemplateKeys.Agent:
								case FunctionTemplateKeys.User:
								case FunctionTemplateKeys.Owner:
								case FunctionTemplateKeys.ModelOutput:
									methodProps = {
										...methodProps,
										...GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}
									};
									if (constraint[NodeProperties.IsAgent]) {
										methodProps[constraint.key] = agent.id;
									} else if (constraint.key === FunctionTemplateKeys.User) {
										methodProps[constraint.key] =
											GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) ||
											GetUsers()[0].id;
									} else {
										methodProps[constraint.key] = model.id;
									}
									break;
								case FunctionTemplateKeys.Permission:
								case FunctionTemplateKeys.ModelFilter:
									PerformGraphOperation([
										{
											operation: ADD_NEW_NODE,
											options: {
												parent: methodNode.id,
												nodeType:
													constraint.key === FunctionTemplateKeys.Permission
														? NodeTypes.Permission
														: NodeTypes.ModelFilter,
												groupProperties: {},
												properties: {
													[NodeProperties.NodePackage]: model.id,
													[NodeProperties.NodePackageType]: nodePackageType,
													[NodeProperties.UIText]: `${GetNodeTitle(
														methodNode
													)} ${constraint.key === FunctionTemplateKeys.Permission
														? NodeTypes.Permission
														: NodeTypes.ModelFilter}`
												},
												linkProperties: {
													properties: {
														...LinkProperties.FunctionOperator
													}
												},
												callback: (newNode: { id: any }) => {
													methodProps = {
														...methodProps,
														...GetNodeProp(
															GetNodeById(methodNode.id),
															NodeProperties.MethodProps
														) || {}
													};
													methodProps[constraint.key] = newNode.id;
													perOrModelNode = newNode;
												}
											}
										}
									])(dispatch, getState);
									if (constraint.key === FunctionTemplateKeys.ModelFilter) {
										commands = [
											...commands,
											{
												operation: CHANGE_NODE_PROPERTY,
												options: {
													prop: NodeProperties.FilterAgent,
													id: perOrModelNode.id,
													value: agent.id
												}
											},
											{
												operation: CHANGE_NODE_PROPERTY,
												options: {
													prop: NodeProperties.FilterModel,
													id: perOrModelNode.id,
													value: model.id
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options: {
													target: model.id,
													source: perOrModelNode.id,
													properties: {
														...LinkProperties.ModelTypeLink
													}
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options: {
													target: agent.id,
													source: perOrModelNode.id,
													properties: {
														...LinkProperties.AgentTypeLink
													}
												}
											}
										];
									}
									break;
								default:
									break;
							}
							commands = [
								...commands,
								...[
									{
										operation: CHANGE_NODE_PROPERTY,
										options: {
											prop: NodeProperties.MethodProps,
											id: methodNode.id,
											value: methodProps
										}
									},
									{
										operation: ADD_LINK_BETWEEN_NODES,
										options: {
											target: methodProps[constraint.key],
											source: methodNode.id,
											properties: {
												...LinkProperties.FunctionOperator
											}
										}
									}
								]
							];
						});
						if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType, NodeTypes.Controller)) {
							commands.push(
								{
									operation: ADD_NEW_NODE,
									options: {
										nodeType: NodeTypes.Controller,
										properties: {
											[NodeProperties.NodePackage]: model.id,
											[NodeProperties.NodePackageType]: nodePackageType,
											[NodeProperties.NodePackageAgent]: agent.id,
											[NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(
												agent
											)} Controller`
										},
										linkProperties: {
											properties: {
												...LinkProperties.FunctionOperator
											}
										},
										callback: (controllerNode: any) => {
											context.controllerNode = controllerNode;
										}
									}
								},
								() => {
									const { controllerNode } = context;
									if (
										ModelNotConnectedToFunction(
											agent.id,
											model.id,
											nodePackageType,
											NodeTypes.Maestro
										)
									) {
										return [
											{
												operation: ADD_NEW_NODE,
												options: {
													nodeType: NodeTypes.Maestro,
													parent: controllerNode.id,

													properties: {
														[NodeProperties.NodePackage]: model.id,
														[NodeProperties.NodePackageType]: nodePackageType,
														[NodeProperties.NodePackageAgent]: agent.id,
														[NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(
															agent
														)} Maestro`
													},
													linkProperties: {
														properties: {
															...LinkProperties.MaestroLink
														}
													},
													callback: (maestroNode: any) => {
														context.maestroNode = maestroNode;
													}
												}
											}
										];
									}
									return [];
								},
								() => [
									{
										operation: ADD_LINK_BETWEEN_NODES,
										options() {
											const { maestroNode } = context;
											return {
												target: methodNode.id,
												source: maestroNode.id,
												properties: {
													...LinkProperties.FunctionLink
												}
											};
										}
									}
								]
							);
						}
						return commands;
					}
				];
				PerformGraphOperation(outer_commands)(dispatch, getState);
			}
		});
	};
}

export function CreateAgentFunction(option: any): any {
	const {
		nodePackageType,
		methodType,
		parentId: parent,
		httpMethod,
		functionType,
		functionName,
		viewPackage,
		modelNotRequired = false,
		model,
		model_output,
		agent
	} = option;

	if (!nodePackageType) {
		throw new Error('missing node package type');
	}
	if (!methodType) {
		throw new Error('missing method type');
	}
	if (!httpMethod) {
		throw new Error('missing http method');
	}
	if (!functionType) {
		throw new Error('function type missing');
	}
	if (!functionName) {
		throw new Error('function name is missing');
	}
	return (args: { dispatch: any; getState: any }) => {
		const { dispatch, getState } = args;
		// Check for existing method of this type

		// if no methods exist, then create a new method.
		// graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);

		let methodProps: { [x: string]: any };
		const new_nodes: any = {};
		let _viewPackage = null;

		_viewPackage = viewPackage || {
			[NodeProperties.ViewPackage]: uuidv4()
		};
		setViewPackageStamp(_viewPackage, 'CreateAgentFunction');
		if (modelNotRequired || ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
			const outer_commands: any = [
				{
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.Method,
							groupProperties: {},
							properties: {
								[NodeProperties.NodePackage]: modelNotRequired ? model.id : null,
								[NodeProperties.NodePackageType]: nodePackageType,
								[NodeProperties.NodePackageAgent]: agent.id,
								[NodeProperties.FunctionType]: functionType,
								[NodeProperties.MethodType]: methodType,
								[NodeProperties.HttpMethod]: httpMethod,
								[NodeProperties.UIText]: `${functionName}`
							},
							linkProperties: {
								properties: { ...LinkProperties.FunctionOperator }
							},
							callback: (methodNode: any) => {
								new_nodes.methodNode = methodNode;
							}
						};
					}
				},
				function() {
					const { methodNode } = new_nodes;
					const { constraints } = MethodFunctions[functionType];
					let commands: any = [
						modelNotRequired
							? null
							: {
									operation: ADD_DEFAULT_PROPERTIES,
									options: {
										parent: model.id,
										groupProperties: {},
										linkProperties: {
											properties: { ...LinkProperties.PropertyLink }
										}
									}
								}
					].filter((x) => x);
					Object.values(constraints).forEach((constraint: any) => {
						let validator: any = null;
						let perOrModelNode: any = null;
						let executor: any = null;
						switch (constraint.key) {
							case FunctionTemplateKeys.Model:
							case FunctionTemplateKeys.Agent:
							case FunctionTemplateKeys.Parent:
							case FunctionTemplateKeys.User:
							case FunctionTemplateKeys.ModelOutput:
								methodProps = {
									...methodProps,
									...GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}
								};
								if (constraint[NodeProperties.IsAgent]) {
									methodProps[constraint.key] = agent.id;
								} else if (constraint.key === FunctionTemplateKeys.User) {
									methodProps[constraint.key] = option.user
										? option.user.id
										: GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) || GetUsers()[0].id;
									commands.push({
										operation: ADD_LINK_BETWEEN_NODES,
										options() {
											return {
												source: methodNode.id,
												target: methodProps[constraint.key],
												properties: {
													...LinkProperties.FunctionOperator
												}
											};
										}
									});
								} else if (constraint.key === FunctionTemplateKeys.Parent) {
									if (typeof parent === 'string') {
										methodProps[constraint.key] = parent;
									} else if (parent && parent.id) {
										// add parent if set.
										methodProps[constraint.key] = parent.id;
									}
								} else if (constraint.key === FunctionTemplateKeys.ModelOutput && model_output) {
									methodProps[constraint.key] =
										typeof model_output === 'string' ? model_output : model_output.id;
								} else if (!modelNotRequired) {
									methodProps[constraint.key] = model.id;
								}
								break;
							case FunctionTemplateKeys.Validator:
								if (!modelNotRequired) {
									commands.push(
										...[
											{
												operation: ADD_NEW_NODE,
												options() {
													return {
														parent: methodNode.id,
														nodeType: NodeTypes.Validator,
														groupProperties: {},
														properties: {
															[NodeProperties.NodePackage]: model.id,
															[NodeProperties.Collapsed]: true,
															[NodeProperties.NodePackageType]: nodePackageType,
															[NodeProperties.UIText]: `${GetNodeTitle(
																methodNode
															)} Validator`,
															[NodeProperties.ValidatorModel]: model.id,
															[NodeProperties.ValidatorAgent]: agent.id,
															[NodeProperties.ValidatorFunction]: methodNode.id
														},
														callback: (_node: { id: any }) => {
															methodProps[constraint.key] = _node.id;
															validator = _node;
														}
													};
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														target: model.id,
														source: validator.id,
														properties: { ...LinkProperties.ValidatorModelLink }
													};
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														target: agent.id,
														source: validator.id,
														properties: { ...LinkProperties.ValidatorAgentLink }
													};
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														target: methodNode.id,
														source: validator.id,
														properties: {
															...LinkProperties.ValidatorFunctionLink
														}
													};
												}
											}
										]
									);
								}
								break;
							case FunctionTemplateKeys.Executor:
								if (!modelNotRequired) {
									let executors = MethodFunctions[functionType].constraints[
										FunctionTemplateKeys.Executor
									].executors || [ { name: '', methodType } ];
									executors.forEach((temp: { methodType: string; name: string }) => {
										commands.push(
											...[
												{
													operation: ADD_NEW_NODE,
													options() {
														return {
															parent: methodNode.id,
															nodeType: NodeTypes.Executor,
															groupProperties: {},
															properties: {
																[NodeProperties.NodePackage]: model.id,
																[NodeProperties.NodePackageType]: nodePackageType,
																[NodeProperties.ExecutorFunctionType]: temp.methodType,
																[NodeProperties.UIText]: `${GetNodeTitle(
																	methodNode
																)} ${temp.name} Executor`,
																[NodeProperties.ExecutorModel]: model.id,
																[NodeProperties.ExecutorModelOutput]: model.id,
																[NodeProperties.ExecutorFunction]: methodNode.id,
																[NodeProperties.ExecutorAgent]: agent.id
															},
															callback: (_node: { id: any }) => {
																methodProps[constraint.key] = _node.id;
																methodProps.executors = methodProps.executors || [];
																if (methodProps.executors.indexOf(_node.id) === -1) {
																	methodProps.executors.push(_node.id);
																}
																executor = _node;
															}
														};
													}
												},
												{
													operation: ADD_LINK_BETWEEN_NODES,
													options() {
														return {
															target: model.id,
															source: executor.id,
															properties: { ...LinkProperties.ExecutorModelLink }
														};
													}
												},
												{
													operation: ADD_LINK_BETWEEN_NODES,
													options() {
														return {
															target: agent.id,
															source: executor.id,
															properties: { ...LinkProperties.ExecutorAgentLink }
														};
													}
												},
												{
													operation: ADD_LINK_BETWEEN_NODES,
													options() {
														return {
															target: methodNode.id,
															source: executor.id,
															properties: {
																...LinkProperties.ExecutorFunctionLink
															}
														};
													}
												}
											]
										);
									});
								}
								break;
							case FunctionTemplateKeys.Permission:
							case FunctionTemplateKeys.ModelFilter:
								if (!modelNotRequired) {
									commands.push(
										...[
											{
												operation: ADD_NEW_NODE,
												options() {
													return {
														parent: methodNode.id,
														nodeType:
															constraint.key === FunctionTemplateKeys.Permission
																? NodeTypes.Permission
																: NodeTypes.ModelFilter,
														groupProperties: {},
														properties: {
															[NodeProperties.NodePackage]: model.id,
															[NodeProperties.NodePackageType]: nodePackageType,
															[NodeProperties.UIText]: `${GetNodeTitle(
																methodNode
															)} ${constraint.key === FunctionTemplateKeys.Permission
																? NodeTypes.Permission
																: NodeTypes.ModelFilter}`
														},
														linkProperties: {
															properties: { ...LinkProperties.FunctionOperator }
														},
														callback: (newNode: { id: any }) => {
															methodProps = {
																...methodProps,
																...GetNodeProp(
																	GetNodeById(methodNode.id),
																	NodeProperties.MethodProps
																) || {}
															};
															methodProps[constraint.key] = newNode.id;
															perOrModelNode = newNode;
														}
													};
												}
											}
										]
									);
									if (constraint.key === FunctionTemplateKeys.ModelFilter) {
										commands = [
											...commands,
											{
												operation: CHANGE_NODE_PROPERTY,
												options() {
													return {
														prop: NodeProperties.FilterAgent,
														id: perOrModelNode.id,
														value: agent.id
													};
												}
											},
											{
												operation: CHANGE_NODE_PROPERTY,
												options() {
													return {
														prop: NodeProperties.FilterModel,
														id: perOrModelNode.id,
														value: model.id
													};
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														target: model.id,
														source: perOrModelNode.id,
														properties: { ...LinkProperties.ModelTypeLink }
													};
												}
											},
											{
												operation: ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														target: agent.id,
														source: perOrModelNode.id,
														properties: { ...LinkProperties.AgentTypeLink }
													};
												}
											}
										];
									}
								}
								break;
							default:
								break;
						}
						commands = [
							...commands,
							...[
								{
									operation: CHANGE_NODE_PROPERTY,
									options() {
										return {
											prop: NodeProperties.MethodProps,
											id: methodNode.id,
											value: methodProps
										};
									}
								},
								{
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: methodProps[constraint.key],
											source: methodNode.id,
											properties: { ...LinkProperties.FunctionOperator }
										};
									}
								}
							]
						];
					});
					return commands;
				},
				function() {
					return UpdateMethodParameters({
						methodType: functionType,
						current: new_nodes.methodNode.id,
						viewPackages: viewPackage
					});
				},
				modelNotRequired
					? null
					: function() {
							return AttachMethodToMaestro({
								methodNodeId: new_nodes.methodNode.id,
								modelId: model.id,
								options: option,
								viewPackage
							});
						}
			].filter((x) => x);

			// updateMethodParameters(
			//   new_nodes.methodNode.id,
			//   functionType,
			//   viewPackage
			// )(dispatch, getState);
			outer_commands.push({
				operation: NO_OP,
				options() {}
			});

			PerformGraphOperation(outer_commands)(dispatch, getState);
			// attachMethodToMaestro(new_nodes.methodNode.id, model.id, option)(
			//   dispatch,
			//   getState,
			//   null,
			//   viewPackage
			// );

			// PerformGraphOperation([
			//   {
			//     operation: NO_OP,
			//     options() { }
			//   }
			// ]);
		}

		setViewPackageStamp(null, 'CreateAgentFunction');
		if (option.callback && new_nodes.methodNode) {
			option.callback(new_nodes.methodNode.id);
		}
		return new_nodes;
	};
}

function addListItemComponentApi(
	newItems: any,
	text: string,
	noExternal: boolean,
	keyfunc: {
		(v: any, _i: any): void;
		(v: any, _i: any): void;
		(v: any, _i: any): void;
		(v: any, _i: any): void;
		(arg0: any, arg1: { internalId: any; externalId: any }): void;
	},
	parent: any,
	options = { useAsValue: true }
) {
	let internalId: any;
	let externalId: any;
	return [
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.ComponentApi,
					callback: (nn: { id: any }) => {
						internalId = nn.id;
						if (keyfunc && noExternal) {
							keyfunc(text, {
								internalId,
								externalId
							});
							setApiConnectors(
								newItems,
								parent,
								{
									internalId,
									externalId
								},
								text
							);
						}
					},
					parent,
					linkProperties: {
						properties: { ...LinkProperties.ComponentInternalApi }
					},
					groupProperties: {},
					properties: {
						[NodeProperties.UIText]: text,
						[NodeProperties.Pinned]: false,
						[NodeProperties.UseAsValue]: options.useAsValue
					}
				};
			}
		},
		noExternal
			? null
			: {
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.ComponentExternalApi,
							callback: (nn: { id: any }) => {
								externalId = nn.id;
							},
							parent,
							linkProperties: {
								properties: { ...LinkProperties.ComponentExternalApi }
							},
							groupProperties: {},
							properties: {
								[NodeProperties.Pinned]: false,
								[NodeProperties.UIText]: text
							}
						};
					}
				},
		noExternal
			? null
			: {
					operation: ADD_LINK_BETWEEN_NODES,
					options() {
						if (keyfunc) {
							keyfunc(text, {
								internalId,
								externalId
							});
						}
						setApiConnectors(
							newItems,
							parent,
							{
								internalId,
								externalId
							},
							text
						);
						return {
							source: internalId,
							target: externalId,
							properties: {
								...LinkProperties.ComponentInternalConnection
							}
						};
					}
				}
	].filter((x) => x);
}

function addComponentEventApiNodes(args: {
	newItems: any;
	childComponents: any;
	modelIndex: any;
	viewComponent: any;
	viewPackage: any;
	modelProperty: any;
	currentNode: any;
	useModelInstance: any;
}) {
	const {
		newItems,
		childComponents,
		modelIndex,
		modelProperty,
		currentNode,
		viewComponent,
		viewPackage,
		useModelInstance
	} = args;
	const parent = childComponents[modelIndex];
	newItems.eventApis = newItems.eventApis || {};
	return (viewComponent.eventApi || [])
		.map((apiName: string | number) => {
			const apiNameInstance = `${apiName} Instance`;
			const apiNameEventHandler = `${apiName} Event Handler`;

			return [
				{
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.EventMethod,
							callback: (nn: { id: any }) => {
								newItems.eventApis[childComponents[modelIndex]] = {
									...newItems.eventApis[childComponents[modelIndex]] || {},
									[apiName]: nn.id
								};
							},
							linkProperties: {
								properties: {
									...LinkProperties.EventMethod
								}
							},
							parent,
							groupProperties: {},
							properties: {
								...viewPackage,
								[NodeProperties.Pinned]: false,
								[NodeProperties.InstanceType]: useModelInstance
									? InstanceTypes.ModelInstance
									: InstanceTypes.ScreenInstance,
								[NodeProperties.EventType]: apiName,
								[NodeProperties.UIText]: `${apiName}`
							},
							links: [
								{
									target: currentNode.id,
									linkProperties: {
										properties: { ...LinkProperties.ModelTypeLink }
									}
								}
							]
						};
					}
				},
				{
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.EventMethodInstance,
							callback: (nn: { id: any }) => {
								newItems.eventApis[childComponents[modelIndex]] = {
									...newItems.eventApis[childComponents[modelIndex]] || {},
									[apiNameInstance]: nn.id
								};
							},

							linkProperties: {
								properties: {
									...LinkProperties.EventMethodInstance
								}
							},
							parent: newItems.eventApis[childComponents[modelIndex]][apiName],
							groupProperties: {},
							properties: {
								[NodeProperties.UIText]: `${apiName} Instance`,
								[NodeProperties.InstanceType]: useModelInstance
									? InstanceTypes.ModelInstance
									: InstanceTypes.ScreenInstance,
								[NodeProperties.EventType]: apiName,
								[NodeProperties.Model]: currentNode.id,
								[NodeProperties.Pinned]: false,
								[NodeProperties.Property]: modelProperty.id,
								[NodeProperties.AutoDelete]: {
									properties: {
										[NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
									}
								}
							}
						};
					}
				},
				{
					operation: ADD_NEW_NODE,
					options() {
						return {
							nodeType: NodeTypes.EventHandler,
							callback: (nn: { id: any }) => {
								newItems.eventApis[childComponents[modelIndex]] = {
									...newItems.eventApis[childComponents[modelIndex]] || {},
									[apiNameEventHandler]: nn.id
								};
							},
							parent: newItems.eventApis[childComponents[modelIndex]][apiNameInstance],
							linkProperties: {
								properties: {
									...LinkProperties.EventHandler
								}
							},
							groupProperties: {},
							properties: {
								[NodeProperties.EventType]: apiName,
								[NodeProperties.Pinned]: false,
								[NodeProperties.UIText]: `${apiName} EventHandler`
							}
						};
					}
				},
				{
					operation: ADD_LINK_BETWEEN_NODES,
					options() {
						return {
							source: newItems.eventApis[childComponents[modelIndex]][apiNameEventHandler],
							target: modelProperty.id,
							properties: {
								...LinkProperties.PropertyLink
							}
						};
					}
				}
			];
		})
		.flatten();
}

function addComponentApiNodes(
	newItems: any,
	childComponents: string[],
	modelIndex: number,
	apiName = 'value',
	externalApiId?: any
) {
	const parent = childComponents[modelIndex];
	let componentInternalValue: null = null;
	let componentExternalValue: null = null;

	return [
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.ComponentApi,
					callback: (nn: { id: any }) => {
						componentInternalValue = nn.id;
						newItems[childComponents[modelIndex]] = {
							...newItems[childComponents[modelIndex]] || {},
							[apiName]: {
								componentInternalValue: nn.id
							}
						};
					},
					linkProperties: {
						properties: {
							...LinkProperties.ComponentInternalApi
						}
					},
					parent,
					groupProperties: {},
					properties: {
						[NodeProperties.UIText]: apiName,
						[NodeProperties.Pinned]: false,
						[NodeProperties.UseAsValue]: true
						// [NodeProperties.ComponentApiKey]: viewComponentType.internalApiNode || null
					}
				};
			}
		},
		{
			operation: ADD_NEW_NODE,
			options() {
				return {
					nodeType: NodeTypes.ComponentExternalApi,
					callback: (nn: { id: any }) => {
						componentExternalValue = nn.id;
						newItems[childComponents[modelIndex]] = {
							...newItems[childComponents[modelIndex]],
							[apiName]: {
								...newItems[childComponents[modelIndex]][apiName],
								componentExternalValue: nn.id
							}
						};
					},
					parent,
					linkProperties: {
						properties: { ...LinkProperties.ComponentExternalApi }
					},
					groupProperties: {},
					properties: {
						[NodeProperties.UIText]: apiName,
						[NodeProperties.Pinned]: false
						// [NodeProperties.ComponentApiKey]:  viewComponentType.externalApiNode || null
					}
				};
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				if (parent) {
					setApiConnectors(
						newItems,
						parent,
						{
							internalId: componentInternalValue,
							externalId: componentExternalValue
						},
						apiName
					);
				}
				return {
					source: componentInternalValue,
					target: componentExternalValue,
					properties: {
						...LinkProperties.ComponentInternalConnection
					}
				};
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					target: externalApiId || newItems.screenComponentIdInternalApi,
					source: componentExternalValue,
					properties: {
						...LinkProperties.ComponentExternalConnection
					}
				};
			}
		}
	].filter((x) => x);
}

function addButtonApiNodes(newItems: any, btn?: any) {
	let buttonInternalApi: any = null;
	let buttonExternalApi: any = null;
	btn = btn || (() => null);
	if (btn() || newItems.button) {
		return [
			{
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.ComponentApi,
						callback: (nn: { id: any }) => {
							buttonInternalApi = nn.id;
						},
						linkProperties: {
							properties: { ...LinkProperties.ComponentInternalApi }
						},
						parent: btn() || newItems.button,
						groupProperties: {},
						properties: {
							[NodeProperties.UIText]: `label`,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UseAsValue]: true
						}
					};
				}
			},
			{
				operation: ADD_NEW_NODE,
				options() {
					return {
						nodeType: NodeTypes.ComponentExternalApi,
						callback: (nn: { id: any }) => {
							buttonExternalApi = nn.id;
						},
						parent: btn() || newItems.button,
						linkProperties: {
							properties: { ...LinkProperties.ComponentExternalApi }
						},
						groupProperties: {},
						properties: {
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIText]: `label`
						}
					};
				}
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						source: buttonInternalApi,
						target: buttonExternalApi,
						properties: {
							...LinkProperties.ComponentInternalConnection
						}
					};
				}
			},
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: newItems.titleService,
						source: buttonExternalApi,
						properties: {
							...LinkProperties.TitleServiceLink
						}
					};
				}
			}
		];
	}
	return [];
}

function ConnectExternalApisToSelectors(args: {
	modelComponentSelectors: any;
	newItems: any;
	viewType: any;
	childComponents: any;
	propertyIndex: any;
}) {
	const { modelComponentSelectors, newItems, viewType, childComponents, propertyIndex } = args;
	const steps = [];
	switch (viewType) {
		case ViewTypes.Update:
		case ViewTypes.Create:
			steps.push({
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: modelComponentSelectors[0],
						source: newItems[childComponents[propertyIndex]].value.componentExternalValue,
						properties: {
							...LinkProperties.SelectorLink
						}
					};
				}
			});
			break;
		default:
			break;
	}

	PerformGraphOperation([
		...steps,
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					target: newItems.titleService,
					source: newItems[childComponents[propertyIndex]].label.componentExternalValue,
					properties: {
						...LinkProperties.TitleServiceLink
					}
				};
			}
		}
	])(GetDispatchFunc(), GetStateFunc());
	if (newItems[childComponents[propertyIndex]].placeholder) {
		PerformGraphOperation([
			...steps,
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: newItems.titleService,
						source: newItems[childComponents[propertyIndex]].placeholder.componentExternalValue,
						properties: {
							...LinkProperties.TitleServiceLink
						}
					};
				}
			}
		])(GetDispatchFunc(), GetStateFunc());
	}
}

function BuildPropertyDataChainAccessor(args: {
	viewName: any;
	modelProperty: any;
	currentNode: any;
	modelComponentSelectors: any;
	skip?: boolean;
	isSharedComponent?: any;
	viewPackage: any;
	propertyDataChainAccesors: any;
	uiType?: any;
	viewType: any;
	newItems: any;
	childComponents?: any;
	propertyIndex?: any;
}) {
	const {
		viewName,
		modelProperty,
		viewPackage,
		currentNode,
		modelComponentSelectors,
		propertyDataChainAccesors,
		newItems,
		viewType
	} = args;
	let skip = false;
	let propDataChainNodeId: string | null = null;
	let entryNodeProperties: { [x: string]: any } | null = null;
	let links: { target: any; linkProperties: { properties: any } }[] | null = null;
	let skipDataChainStep = false;
	let addcomplete = false;
	switch (viewType) {
		case ViewTypes.Update:
		case ViewTypes.Create:
			entryNodeProperties = {
				[NodeProperties.UIText]: `Get ${viewName} ${viewType} Object => ${GetNodeTitle(modelProperty)}`,
				[NodeProperties.EntryPoint]: true,
				[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
				[NodeProperties.Selector]: modelComponentSelectors[0],
				[NodeProperties.SelectorProperty]: SelectorPropertyKeys.Object,
				[NodeProperties.Pinned]: false,
				[NodeProperties.Property]: modelProperty.id
			};
			links = [
				{
					target: modelComponentSelectors[0],
					linkProperties: {
						properties: { ...LinkProperties.DataChainLink }
					}
				}
			];
			break;
		default:
			skipDataChainStep = true;
			addcomplete = true;
			entryNodeProperties = {
				[NodeProperties.UIText]: `Get ${viewName} ${viewType} Object => ${GetNodeTitle(modelProperty)}`,
				[NodeProperties.EntryPoint]: true,
				[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.ModelProperty,
				[NodeProperties.UIModelType]: currentNode.id,
				[NodeProperties.Pinned]: false,
				[NodeProperties.Property]: modelProperty.id
			};
			links = [
				{
					target: modelProperty.id,
					linkProperties: {
						properties: { ...LinkProperties.PropertyLink }
					}
				},
				{
					target: currentNode.id,
					linkProperties: {
						properties: { ...LinkProperties.ModelTypeLink }
					}
				}
			];
			break;
	}
	PerformGraphOperation(
		[
			{
				operation: ADD_NEW_NODE,
				options() {
					const node = GetNodesByProperties({
						...entryNodeProperties
					}).find((x) => x);
					if (node) {
						propDataChainNodeId = node.id;
						skip = true;
						propertyDataChainAccesors.push(propDataChainNodeId);
						setModelPropertyViewTypePropNode(newItems, modelProperty, viewType, node);
						return null;
					}
					return {
						nodeType: NodeTypes.DataChain,
						properties: {
							...viewPackage,
							...entryNodeProperties
						},
						links,
						callback: (propNode: { id: any }) => {
							propDataChainNodeId = propNode.id;
							propertyDataChainAccesors.push(propDataChainNodeId);
							setModelPropertyViewTypePropNode(newItems, modelProperty, viewType, propNode);
						}
					};
				}
			},
			skipDataChainStep
				? false
				: {
						operation: ADD_NEW_NODE,
						options() {
							if (skip) {
								return {};
							}
							return {
								parent: propDataChainNodeId,
								nodeType: NodeTypes.DataChain,
								groupProperties: {
									[GroupProperties.ExternalEntryNode]: GetNodeProp(
										GetNodeById(propDataChainNodeId),
										NodeProperties.ChainParent
									),
									[GroupProperties.GroupEntryNode]: propDataChainNodeId,
									[GroupProperties.GroupExitNode]: propDataChainNodeId,
									[GroupProperties.ExternalExitNode]: GetDataChainNextId(propDataChainNodeId)
								},
								properties: {
									...viewPackage,
									[NodeProperties.UIText]: `Get ${GetNodeTitle(modelProperty)}`,
									[NodeProperties.ChainParent]: propDataChainNodeId,
									[NodeProperties.AsOutput]: true,
									[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Property,
									[NodeProperties.Pinned]: false,
									[NodeProperties.UIModelType]: currentNode.id,
									[NodeProperties.Property]: modelProperty.id
								},
								linkProperties: {
									properties: { ...LinkProperties.DataChainLink }
								},
								links: [
									{
										target: currentNode.id,
										linkProperties: {
											properties: { ...LinkProperties.ModelTypeLink }
										}
									},
									{
										target: modelProperty.id,
										linkProperties: {
											properties: { ...LinkProperties.PropertyLink }
										}
									}
								],
								callback: () => {}
							};
						}
					},
			addcomplete
				? {
						operation: ADD_NEW_NODE,
						options(graph: any) {
							if (skip) {
								return false;
							}
							const groupProperties = GetNodeProp(propDataChainNodeId, NodeProperties.GroupParent, graph)
								? {
										id: getGroup(
											GetNodeProp(propDataChainNodeId, NodeProperties.GroupParent, graph),
											graph
										).id
									}
								: null;
							return {
								parent: propDataChainNodeId,
								nodeType: NodeTypes.DataChain,
								groupProperties,
								properties: {
									[NodeProperties.Pinned]: false,
									[NodeProperties.ChainParent]: propDataChainNodeId,
									[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
									[NodeProperties.UIText]: `Get ${viewName} ${viewType} Object => ${GetNodeTitle(
										modelProperty
									)} Output`,
									[NodeProperties.AsOutput]: true
								},
								linkProperties: {
									properties: { ...LinkProperties.DataChainLink }
								}
							};
						}
					}
				: false
		].filter((x) => x)
	)(GetDispatchFunc(), GetStateFunc());
	return { skip, propDataChainNodeId };
}

function setModelPropertyViewTypePropNode(
	newItems: { PropertyDataChainGetter: { [x: string]: { [x: string]: any } } },
	modelProperty: { id: string | number },
	viewType: string | number,
	propNode: { id: any }
) {
	if (!newItems.PropertyDataChainGetter) {
		newItems.PropertyDataChainGetter = {};
	}
	if (!newItems.PropertyDataChainGetter[modelProperty.id]) {
		newItems.PropertyDataChainGetter[modelProperty.id] = {};
	}
	newItems.PropertyDataChainGetter[modelProperty.id][viewType] = propNode.id;
}

function setupPropertyApi(args: any) {
	const {
		childId,
		apiList,
		childComponents,
		propertyIndex,
		viewName,
		apiDataChainLists,
		modelProperty,
		currentNode,
		modelComponentSelectors,
		viewType,
		uiType,
		newItems
	} = args;

	newItems.apiDataChain = newItems.apiDataChain || {};
	newItems.apiDataChain[childId] = apiDataChainLists;

	PerformGraphOperation([
		...apiList
			.map((api: any) => {
				const apiProperty = api.value;
				if (ARE_BOOLEANS.some((v) => v === apiProperty) || ARE_HANDLERS.some((v) => v === apiProperty)) {
					return false;
				}
				let _context = null;
				switch (apiProperty) {
					case ApiProperty.Success:
						return [];
					// return [
					//   ...AttributeSuccess({
					//     model: currentNode.id,
					//     property: modelProperty.id,
					//     propertyName: GetNodeTitle(modelProperty),
					//     viewName,
					//     uiType,
					//     callback: context => {
					//       _context = context;
					//       apiDataChainLists[apiProperty] = _context.entry;
					//     }
					//   })
					// ];
					case ApiProperty.Error:
						return [];
					// return [
					//   ...AttributeError({
					//     model: currentNode.id,
					//     property: modelProperty.id,
					//     propertyName: `${viewName} ${GetNodeTitle(
					//       modelProperty
					//     )} ${uiType}`,
					//     viewName,
					//     callback: context => {
					//       _context = context;
					//       apiDataChainLists[apiProperty] = _context.entry;
					//     }
					//   })
					// ];
					default:
						break;
				}
				return [
					...CreateSelectorToDataChainSelectorDC({
						model: currentNode.id,
						property: modelProperty.id,
						viewName,
						viewType,
						uiType,
						propertyName: GetNodeTitle(modelProperty),
						screen: GetNodeTitle(newItems.screenNodeId),
						external_api: apiProperty,
						callback: (context: any) => {
							_context = context;
							apiDataChainLists[apiProperty] = _context.entry;
						}
					})
				];
			})
			.flatten()
			.filter((x: any) => x),
		...apiList.map((v: { value: any }) => v.value).map((api_key: string | number) => {
			return {
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					if (newItems[childComponents[propertyIndex]][api_key]) {
						return {
							target: apiDataChainLists[api_key],
							source: newItems[childComponents[propertyIndex]][api_key].componentExternalValue,
							properties: {
								...LinkProperties.DataChainLink
							}
						};
					}
				}
			};
		}),
		...apiList.map((v: { value: any }) => v.value).map((api_key: string | number) => {
			return {
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					if (modelComponentSelectors[0]) {
						return {
							target: modelComponentSelectors[0],
							source: newItems[childComponents[propertyIndex]][api_key].componentExternalValue,
							properties: {
								...LinkProperties.SelectorLink
							}
						};
					}
				}
			};
		})
	])(GetDispatchFunc(), GetStateFunc());
}

function connectComponentToExternalApi(args: { newItems: any; parent: any; key: any; properties: any; child: any }) {
	const { newItems, child, key, parent, properties } = args;

	const { externalId } = getApiConnectors(newItems, child, key);
	const { internalId } = getApiConnectors(newItems, parent, key);
	if (externalId && internalId)
		return [
			{
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						source: externalId,
						target: internalId,
						properties: {
							...properties
						}
					};
				}
			}
		];

	throw new Error(`missing externalId ${externalId} or internalId ${internalId}`);
}

function addComponentApiToForm(args: {
	newItems: any;
	text: any;
	parent: any;
	graph?: any;
	isSingular?: any;
	internalProperties?: any;
	externalProperties?: any;
}) {
	const { newItems, text, parent, isSingular, graph, internalProperties = {}, externalProperties = {} } = args;
	let externalId: any;
	let internalId: any;
	let skip = false;
	let exists = !!GetComponentInternalApiNode(text, parent, graph);
	if (exists) {
		return [];
	}
	return [
		{
			operation: ADD_NEW_NODE,
			options() {
				if (parent) {
					if (isSingular && graph) {
						const temp = GetNodesLinkedTo(graph, {
							id: parent,
							link: LinkType.ComponentInternalApi
						}).find(
							(x: any) =>
								GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentApi &&
								GetNodeProp(x, NodeProperties.UIText) === text
						);
						if (temp) {
							internalId = temp.id;
							skip = true;
							return false;
						}
					}
					return {
						nodeType: NodeTypes.ComponentApi,
						callback: (nn: { id: any }) => {
							internalId = nn.id;
						},
						parent,
						linkProperties: {
							properties: { ...LinkProperties.ComponentInternalApi }
						},
						groupProperties: {},
						properties: {
							...internalProperties,
							[NodeProperties.UIText]: text,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UseAsValue]: true
						}
					};
				}
			}
		},
		{
			operation: ADD_NEW_NODE,
			options() {
				if (isSingular && graph) {
					const temp = GetNodesLinkedTo(graph, {
						id: parent,
						link: LinkType.ComponentExternalApi
					}).find(
						(x: any) =>
							GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentApi &&
							GetNodeProp(x, NodeProperties.UIText) === text
					);
					if (temp) {
						externalId = temp.id;
						skip = true;
						return false;
					}
				}
				if (parent && !skip) {
					return {
						nodeType: NodeTypes.ComponentExternalApi,
						callback: (nn: { id: any }) => {
							externalId = nn.id;
						},
						parent,
						linkProperties: {
							properties: { ...LinkProperties.ComponentExternalApi }
						},
						groupProperties: {},
						properties: {
							...externalProperties,
							[NodeProperties.Pinned]: false,
							[NodeProperties.UIText]: text
						}
					};
				}
			}
		},
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				if (parent) {
					setApiConnectors(newItems, parent, { internalId, externalId }, text);
				}
				if (parent && !skip) {
					return {
						source: internalId,
						target: externalId,
						properties: {
							...LinkProperties.ComponentInternalConnection
						}
					};
				}
			}
		}
	];
}

function setApiConnectors(
	newItems: { apiConnectors: { [x: string]: { [x: string]: any } } },
	parent: string | number,
	api: { externalId: any; internalId: any },
	key: string
) {
	newItems.apiConnectors = newItems.apiConnectors || {};
	newItems.apiConnectors[parent] = newItems.apiConnectors[parent] || {};
	newItems.apiConnectors[parent][key] = api;
}

function getApiConnectors(
	newItems: { apiConnectors: { [x: string]: { [x: string]: any } } },
	parent: string | number,
	key: string
) {
	newItems.apiConnectors = newItems.apiConnectors || {};
	newItems.apiConnectors[parent] = newItems.apiConnectors[parent] || {};
	if (!newItems.apiConnectors[parent][key]) {
		let externalNode = GetComponentInternalApiNode(key, parent);
		let internalNode = GetComponentExternalApiNode(key, parent);
		newItems.apiConnectors[parent][key] = { externalId: externalNode.id, internalId: internalNode.id };
	}
	return newItems.apiConnectors[parent][key];
}

function AttachDataChainAccessorTo(nodeId: boolean, accessorId: any) {
	const externalApis = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
		id: nodeId,
		link: LinkType.ComponentExternalApi
	});

	PerformGraphOperation([
		...externalApis.map((externalApi: { id: any }) => {
			return {
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: accessorId,
						source: externalApi.id,
						properties: {
							...LinkProperties.DataChainLink
						}
					};
				}
			};
		})
	])(GetDispatchFunc(), GetStateFunc());
}

function AttachSelectorAccessorTo(nodeId: boolean, accessorId: any) {
	const externalApis = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
		id: nodeId,
		link: LinkType.ComponentExternalApi
	});

	PerformGraphOperation([
		...externalApis.map((externalApi: { id: any }) => {
			return {
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: accessorId,
						source: externalApi.id,
						properties: {
							...LinkProperties.SelectorLink
						}
					};
				}
			};
		})
	])(GetDispatchFunc(), GetStateFunc());
}
