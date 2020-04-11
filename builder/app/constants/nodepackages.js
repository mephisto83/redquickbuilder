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
} from "./functiontypes";
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
} from "./nodetypes";
import PostRegister from "../nodepacks/PostRegister";
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
  setSharedComponent,
  getViewTypeEndpointsForDefaults,
  NEW_DATA_SOURCE,
  updateMethodParameters,
  GetNodeByProperties,
  getGroup,
  SelectedNode,
  GetCodeName,
  attachMethodToMaestro,
  ADD_DEFAULT_PROPERTIES,
  GetSharedComponentFor,
  NodesByType,
  addInstanceFunc,
  GetComponentExternalApiNode,
  GetComponentInternalApiNode,
  ADD_LINKS_BETWEEN_NODES,
  NO_OP,
  addComponentTags,
  SetSharedComponent
} from "../actions/uiactions";
import {
  CreateLayout,
  SetCellsLayout,
  GetCellProperties,
  GetFirstCell,
  GetChildren,
  existsLinkBetween,
  GetNodesLinkedTo,
  setViewPackageStamp
} from "../methods/graph_methods";
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
  ComponentTags
} from "./componenttypes";
import * as Titles from "../components/titles";
import {
  createComponentApi,
  addComponentApi
} from "../methods/component_api_methods";
import {
  DataChainFunctionKeys,
  SplitDataCommand,
  AddChainCommand,
  InsertNodeInbetween,
  DataChainName
} from "./datachain";
import { uuidv4 } from "../utils/array";
import PostAuthenticate from "../nodepacks/PostAuthenticate";
import HomeView from "../nodepacks/HomeView";
import AddNavigateBackHandler from "../nodepacks/AddNavigateBackHandler";
import CreateSelectorToDataChainSelectorDC from "../nodepacks/CreateSelectorToDataChainSelectorDC";
import ConnectListViewModelToExternalViewModel from "../nodepacks/ConnectListViewModelToExternalViewModel";
import LoadModel from "../nodepacks/LoadModel";
import ConnectLifecycleMethodToDataChain from "../nodepacks/ConnectLifecycleMethodToDataChain";
import SetModelsApiLinkForInstanceUpdate from "../nodepacks/SetModelsApiLinkForInstanceUpdate";
import SetupViewModelOnScreen from "../nodepacks/SetupViewModelOnScreen";
import AppendGetIdsToDataChain from "../nodepacks/AppendGetIdsToDataChain";
import GetModelViewModelForUpdate from "../nodepacks/GetModelViewModelForUpdate";
import { ViewTypes } from "./viewtypes";
import ConnectLifecycleMethod from "../components/ConnectLifecycleMethod";
import UpdateMethodParameters from "../nodepacks/method/UpdateMethodParameters";
import AttachMethodToMaestro from "../nodepacks/method/AttachMethodToMaestro";
import CreateGetObjectDataChain from "../nodepacks/CreateGetObjectDataChain";

export const GetSpecificModels = {
  type: "get-specific-models",
  method: args => {
    const { model, dispatch, getState } = args;
    // Check for existing method of this type

    // if no methods exist, then create a new method.
    // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
    const agents = GetAgentNodes();

    agents.map(agent => {
      let methodProps;

      if (
        ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type)
      ) {
        const context = {};
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
                [NodeProperties.UIText]: `${GetNodeTitle(
                  model
                )} Get Specific Objects`
              },
              linkProperties: {
                properties: { ...LinkProperties.FunctionOperator }
              },
              callback: methodNode => {
                context.methodNode = methodNode;
              }
            }
          },
          function () {
            const { methodNode } = context;
            const { constraints } = MethodFunctions[
              FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
            ];
            let perOrModelNode = null;
            let commands = [];
            Object.values(constraints).forEach(constraint => {
              switch (constraint.key) {
                case FunctionTemplateKeys.Model:
                case FunctionTemplateKeys.Agent:
                case FunctionTemplateKeys.User:
                case FunctionTemplateKeys.ModelOutput:
                  methodProps = {
                    ...methodProps,
                    ...(GetNodeProp(
                      GetNodeById(methodNode.id),
                      NodeProperties.MethodProps
                    ) || {})
                  };
                  if (constraint[NodeProperties.IsAgent]) {
                    methodProps[constraint.key] = agent.id;
                  } else if (
                    constraint.key === FunctionTemplateKeys.User
                  ) {
                    methodProps[constraint.key] =
                      GetNodeProp(
                        GetNodeById(agent.id),
                        NodeProperties.UIUser
                      ) || GetUsers()[0].id;
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
                          constraint.key ===
                            FunctionTemplateKeys.Permission
                            ? NodeTypes.Permission
                            : NodeTypes.ModelFilter,
                        groupProperties: {},
                        properties: {
                          [NodeProperties.NodePackage]: model.id,
                          [NodeProperties.NodePackageType]:
                            GetSpecificModels.type,
                          [NodeProperties.UIText]: `${GetNodeTitle(
                            methodNode
                          )} ${
                            constraint.key ===
                              FunctionTemplateKeys.Permission
                              ? NodeTypes.Permission
                              : NodeTypes.ModelFilter
                            }`
                        },
                        linkProperties: {
                          properties: {
                            ...LinkProperties.FunctionOperator
                          }
                        },
                        callback: newNode => {
                          methodProps = {
                            ...methodProps,
                            ...(GetNodeProp(
                              GetNodeById(methodNode.id),
                              NodeProperties.MethodProps
                            ) || {})
                          };
                          methodProps[constraint.key] = newNode.id;
                          perOrModelNode = newNode;
                        }
                      }
                    }
                  ])(dispatch, getState);
                  if (
                    constraint.key === FunctionTemplateKeys.ModelFilter
                  ) {
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
                default: break;
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
              const subcontext = {};
              commands.push({
                operation: ADD_NEW_NODE,
                options: {
                  nodeType: NodeTypes.Controller,
                  properties: {
                    [NodeProperties.NodePackage]: model.id,
                    [NodeProperties.NodePackageType]:
                      GetSpecificModels.type,
                    [NodeProperties.NodePackageAgent]: agent.id,
                    [NodeProperties.UIText]: `${GetNodeTitle(
                      model
                    )} ${GetNodeTitle(agent)} Controller`
                  },
                  linkProperties: {
                    properties: { ...LinkProperties.FunctionOperator }
                  },
                  callback: controllerNode => {
                    subcontext.controllerNode = controllerNode;

                  }
                }
              }, () => {
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
                          [NodeProperties.NodePackageType]:
                            GetSpecificModels.type,
                          [NodeProperties.NodePackageAgent]:
                            agent.id,
                          [NodeProperties.UIText]: `${GetNodeTitle(
                            model
                          )} ${GetNodeTitle(agent)} Maestro`
                        },
                        linkProperties: {
                          properties: {
                            ...LinkProperties.MaestroLink
                          }
                        },
                        callback: maestroNode => {
                          subcontext.maestroNode = maestroNode;
                        }
                      }
                    }
                  ])
                }
              }, () => {
                const { maestroNode } = subcontext;
                return ([
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
                ])
              });
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
  type: "get-all-models",
  method: CreateFunction({
    nodePackageType: "get-all-models",
    methodType: Methods.GetAll,
    httpMethod: HTTP_METHODS.GET,
    functionType: FunctionTypes.Get_Agent_Value__IListObject,
    functionName: `Get All`
  }),
  methodType: FunctionTypes.Get_Agent_Value__IListObject
};

export const CreateLoginModels = {
  type: "Build Login",
  methodType: "Login Models",
  method: (args = {}) => {
    // let currentGraph = GetCurrentGraph(GetStateFunc()());
    // currentGraph = newNode(currentGraph);
    const nodePackageType = "login-models";
    const nodePackage = "login-models";
    const viewPackage = {
      [NodeProperties.ViewPackage]: uuidv4(),
      [NodeProperties.NodePackage]: nodePackage,
      [NodeProperties.NodePackageType]: nodePackageType
    };
    const newStuff = {};
    setViewPackageStamp(viewPackage, "create-login-models");
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
            [NodeProperties.UIText]: `Red Login Model`
          },
          callback: newNode => {
            newStuff.loginModel = newNode.id;
          }
        }
      },
      function () {
        return [
          { propName: "User Name" },
          { propName: "Password" },
          { propName: "Remember Me" }
        ].map(v => {
          const { propName } = v;
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
          callback: newNode => {
            // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
            // methodProps[constraint.key] = newNode.id;
            // perOrModelNode = newNode;
            newStuff.registerModel = newNode.id;
          }
        }
      },
      function () {
        return [
          { propName: "User Name" },
          { propName: "Email", propType: NodePropertyTypes.EMAIL },
          { propName: "Password" },
          { propName: "Confirm Password" }
        ].map(v => {
          const { propName, propType } = v;
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
                [NodeProperties.UIAttributeType]:
                  propType || NodePropertyTypes.STRING,
                [NodeProperties.Pinned]: false,
                [NodeProperties.NodePackageType]: nodePackageType,
                [NodeProperties.UIText]: propName
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
              [NodeProperties.UIText]: "Authorization"
            },
            callback: node => {
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
              [NodeProperties.UIText]: "Authorization Maestro"
            },
            callback: node => {
              newStuff.maestro = node.id;
            }
          };
        }
      },
      function (graph) {
        newStuff.graph = graph;
        return [];
      }
    ])(GetDispatchFunc(), GetStateFunc());
    const regsterResult = CreateAgentFunction({
      viewPackage,
      model: GetNodeById(newStuff.registerModel, newStuff.graph),
      agent: {},
      maestro: newStuff.maestro,
      nodePackageType: "register-user",
      methodType: Methods.Create,
      user: NodesByType(GetState(), NodeTypes.Model).find(x =>
        GetNodeProp(x, NodeProperties.IsUser)
      ),
      httpMethod: HTTP_METHODS.POST,
      functionType: FunctionTypes.Register,
      functionName: `Register`
    })({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });
    const loginResult = CreateAgentFunction({
      viewPackage,
      model: GetNodeById(newStuff.loginModel, newStuff.graph),
      agent: {},
      maestro: newStuff.maestro,
      nodePackageType: "login-user",
      methodType: Methods.Create,
      user: NodesByType(GetState(), NodeTypes.Model).find(x =>
        GetNodeProp(x, NodeProperties.IsUser)
      ),
      httpMethod: HTTP_METHODS.POST,
      functionType: FunctionTypes.Login,
      functionName: `Authenticate`
    })({ dispatch: GetDispatchFunc(), getState: GetStateFunc() });
    let viewName = "Authenticate";
    args = args || {};
    let chosenChildren = GetModelPropertyChildren(newStuff.loginModel).map(
      x => x.id
    );

    let method_results = CreateDefaultView.method({
      viewName,
      dispatch: GetDispatchFunc(),
      getState: GetStateFunc(),
      model: GetNodeById(newStuff.loginModel, newStuff.graph),
      isSharedComponent: false,
      isDefaultComponent: false,
      isPluralComponent: false,
      uiTypes: {
        [UITypes.ReactNative]: args[UITypes.ReactNative] || false,
        [UITypes.ElectronIO]: args[UITypes.ElectronIO] || false,
        [UITypes.VR]: args[UITypes.VR] || false,
        [UITypes.Web]: args[UITypes.Web] || false
      },
      chosenChildren,
      viewType: ViewTypes.Create
    });
    const authenticateScreen = method_results.screenNodeId;
    addInstanceEventsToForms({
      method_results,
      targetMethod: loginResult.methodNode.id
    });
    if (method_results.instanceFunc) {
      PerformGraphOperation([
        ...PostAuthenticate({
          screen: null,
          functionName: "Post Authenticate ReactNative",
          pressInstance: method_results.instanceFunc.onPress
        }),
        ...PostAuthenticate({
          screen: null,
          functionName: "Post Authenticate ElectronIo",
          clickInstance: method_results.instanceFunc.onClick
        })
      ])(GetDispatchFunc(), GetStateFunc());
    }
    viewName = "Register";
    chosenChildren = GetModelPropertyChildren(newStuff.registerModel).map(
      x => x.id
    );
    method_results = CreateDefaultView.method({
      viewName,
      dispatch: GetDispatchFunc(),
      getState: GetStateFunc(),
      model: GetNodeById(newStuff.registerModel, newStuff.graph),
      isSharedComponent: false,
      isDefaultComponent: false,
      isPluralComponent: false,
      uiTypes: {
        [UITypes.ReactNative]: args[UITypes.ReactNative] || false,
        [UITypes.ElectronIO]: args[UITypes.ElectronIO] || false,
        [UITypes.VR]: args[UITypes.VR] || false,
        [UITypes.Web]: args[UITypes.Web] || false
      },
      chosenChildren,
      viewName: `${viewName}`,
      viewType: ViewTypes.Create
    });
    addInstanceEventsToForms({
      method_results,
      targetMethod: regsterResult.methodNode.id
    });
    const registerScreen = method_results.screenNodeId;
    if (method_results.instanceFunc) {
      PerformGraphOperation([
        ...PostRegister({
          screen: authenticateScreen,
          name: "Post Register ReactNative",
          pressInstance: method_results.instanceFunc.onPress
        }),
        ...PostRegister({
          screen: authenticateScreen,
          name: "Post Register ElectronIO",
          clickInstance: method_results.instanceFunc.onClick
        })
      ])(GetDispatchFunc(), GetStateFunc());
    }
    const titleService = GetNodeByProperties({
      [NodeProperties.NODEType]: NodeTypes.TitleService
    });
    PerformGraphOperation(
      HomeView({
        titleService: titleService.id,
        registerForm: registerScreen,
        authenticateForm: authenticateScreen
      })
    )(GetDispatchFunc(), GetStateFunc());
    setViewPackageStamp(null, "create-login-models");
  }
};
function addTitleService(args) {
  const { newItems } = args;
  return {
    operation: ADD_NEW_NODE,
    options(graph) {
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

        callback: res => {
          newItems.titleService = res.id;
        }
      };
    }
  };
}
function addInstanceEventsToForms(args) {
  const { method_results, targetMethod } = args;
  let createDataChainCallback = null;
  if (method_results && method_results.formButton) {
    PerformGraphOperation([
      {
        operation: CHANGE_NODE_PROPERTY,
        options() {
          return {
            prop: NodeProperties.Pinned,
            value: false,
            id: method_results.formButton
          };
        }
      }
    ])(GetDispatchFunc(), GetStateFunc());
    if (method_results.formButtonApi) {
      const context = { evts: {} };
      const getObjectDataChain = GetNodeByProperties({
        [NodeProperties.DataChainName]: DataChainName.GetObject
      });
      PerformGraphOperation([
        ...Object.keys(method_results.formButtonApi).map(evt => {

          return {
            operation: ADD_NEW_NODE,
            options(graph) {
              const currentNode = GetNodeById(
                method_results.formButtonApi[evt],
                graph
              );
              return addInstanceFunc(currentNode, instanceFuncNode => {
                context.evts[evt] = {};
                context.evts[evt].instanceFuncNode = instanceFuncNode;

              })();
            }
          };
        }),
        ...(getObjectDataChain ? [] : CreateGetObjectDataChain({
          callback: ($createDataChainCallback) => {
            createDataChainCallback = $createDataChainCallback;
          }
        })),
        function (graph) {
          return Object.keys(context.evts).map(evt => {

            const { instanceFuncNode } = context.evts[evt];
            method_results.instanceFunc = method_results.instanceFunc || {};
            method_results.instanceFunc[evt] = instanceFuncNode.id;

            const source = instanceFuncNode.id;
            const target = targetMethod
            return ConnectLifecycleMethod({ target, source, graph, dataChain: () => getObjectDataChain ? getObjectDataChain.id : createDataChainCallback.entry })
          })
        }
      ].filter(x => x))(GetDispatchFunc(), GetStateFunc());
    }
  }
}
export const AddAgentUser = {
  type: "add-agent-user",
  methodType: "Add User Agent",
  method: () => {
    let userId = null;
    PerformGraphOperation([
      {
        operation: ADD_NEW_NODE,
        options() {
          return {
            nodeType: NodeTypes.Model,
            callback: node => {
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
  const result = {};
  let skipResult = false;
  let arrayLengthNode = null;
  let defaultPagingValue = null;
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: node => {
            result.pagingSkip = node.id;
          },

          properties: {
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.UIText]: "Paging Skip",
            [NodeProperties.Pinned]: false,
            [NodeProperties.IsDataChainPagingSkip]: true,
            [NodeProperties.EntryPoint]: true
          }
        };
      }
    },
    {
      operation: ADD_NEW_NODE,
      options(graph) {
        if (skipResult) {
          return false;
        }
        const temp = SplitDataCommand(
          GetNodeById(result.pagingSkip, graph),
          split => {
            result.pagingSkipOuput = split.id;
          },
          {
            [NodeProperties.Pinned]: false,
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.UIText]: "Paging Skip Ouput",
            [NodeProperties.AsOutput]: true
          }
        );

        return temp.options;
      }
    },
    function (graph) {
      if (skipResult) {
        return false;
      }
      return InsertNodeInbetween(
        GetNodeById(result.pagingSkip, graph),
        result.pagingSkipOuput,
        graph,
        insertedNode => {
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
    function (graph) {
      if (skipResult) {
        return false;
      }

      return InsertNodeInbetween(
        GetNodeById(arrayLengthNode, graph),
        result.pagingSkipOuput,
        graph,
        insertedNode => {
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
          value: "0",
          id: defaultPagingValue
        };
      }
    }
  ])(GetDispatchFunc(), GetStateFunc());
  return result;
}
export function CreatePagingTakeDataChains() {
  const result = {};
  let skipTake = false;
  let defaultPagingValue = null;
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: node => {
            result.pagingTake = node.id;
          },

          properties: {
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.UIText]: "Paging Take",
            [NodeProperties.Pinned]: false,
            [NodeProperties.IsDataChainPagingTake]: true,
            [NodeProperties.EntryPoint]: true
          }
        };
      }
    },
    {
      operation: ADD_NEW_NODE,
      options(graph) {
        if (skipTake) {
          return false;
        }

        const temp = SplitDataCommand(
          GetNodeById(result.pagingTake, graph),
          split => {
            result.pagingTakeOuput = split.id;
          },
          {
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.Pinned]: false,
            [NodeProperties.UIText]: "Paging Take Ouput",
            [NodeProperties.AsOutput]: true
          }
        );

        return temp.options;
      }
    },
    function (graph) {
      if (skipTake) {
        return false;
      }

      return InsertNodeInbetween(
        GetNodeById(result.pagingTake, graph),
        result.pagingTakeOuput,
        graph,
        insertedNode => {
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
          value: "50",
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
export function CreateScreenModel(viewModel, options = { isList: true }) {
  const result = {};
  let pageModelId = null;
  let skip = false;
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: pageModel => {
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
            callback: skipModel => {
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
  newItems,
  viewName,
  viewPackage,
  skipChain = true
) {
  let skip = false;
  const skipOrTake = skipChain ? "Skip" : "Take";
  return function () {
    return [
      {
        // The data chain for a list screen
        operation: ADD_NEW_NODE,
        options(graph) {
          const $node = GetNodeByProperties(
            {
              [NodeProperties.UIText]: skipChain
                ? `Get ${viewName} Skip`
                : `Get ${viewName} Take`,
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.Pass,
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
              [NodeProperties.UIText]: skipChain
                ? `Get ${viewName} Skip`
                : `Get ${viewName} Take`,
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.Pass,
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
            callback: res => {
              newItems.pagingEntry = res.id;
            }
          };
        }
      },
      {
        operation: ADD_NEW_NODE,
        options(graph) {
          if (skip) {
            return false;
          }
          const $node = GetNodeByProperties(
            {
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.ReferenceDataChain,
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
            split => {
              newItems.viewModelListRefNode = split.id;
            },
            {
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.ReferenceDataChain,
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
        options(graph) {
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
                GetNodeProp(
                  newItems.viewModelListRefNode,
                  NodeProperties.GroupParent,
                  graph
                ),
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
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.ReferenceDataChain,
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
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.ReferenceDataChain,
              [NodeProperties.DataChainReference]: model ? model.id : null,
              [NodeProperties.ChainParent]: newItems.viewModelListRefNode
            },
            linkProperties: {
              properties: { ...LinkProperties.DataChainLink }
            },
            callback: v => {
              newItems.pagingRefNode = v.id;
            }
          };
        }
      },
      {
        operation: ADD_LINK_BETWEEN_NODES,
        options(graph) {
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
        options(graph) {
          if (skip) {
            return false;
          }
          const groupProperties = GetNodeProp(
            newItems.pagingRefNode,
            NodeProperties.GroupParent,
            graph
          )
            ? {
              id: getGroup(
                GetNodeProp(
                  newItems.pagingRefNode,
                  NodeProperties.GroupParent,
                  graph
                ),
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
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.Pass,
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
  let pageModelId = null;
  let skipModelId = null;
  let takeModelId = null;
  let filterModelId = null;
  let sortModelId = null;
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: pageModel => {
            pageModelId = pageModel.id;
          },

          properties: {
            [NodeProperties.ExcludeFromController]: true,
            [NodeProperties.UIText]: "Paging Model",
            [NodeProperties.Pinned]: false,
            [NodeProperties.IsPagingModel]: true
          }
        };
      }
    },
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: skipModel => {
            skipModelId = skipModel.id;
          },
          parent: pageModelId,
          groupProperties: {},
          linkProperties: {
            properties: { ...LinkProperties.PropertyLink }
          },
          properties: {
            [NodeProperties.UIText]: "Skip",
            [NodeProperties.Pinned]: false,
            [NodeProperties.PagingSkip]: true
          }
        };
      }
    },
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: takeModel => {
            takeModelId = takeModel.id;
          },
          parent: pageModelId,
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: "Take",
            [NodeProperties.Pinned]: false,
            [NodeProperties.PagingTake]: true
          }
        };
      }
    },
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: filterModel => {
            filterModelId = filterModel.id;
          },
          parent: pageModelId,
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: "Filter",
            [NodeProperties.Pinned]: false,
            [NodeProperties.PagingFilter]: true
          }
        };
      }
    },
    {
      operation: ADD_NEW_NODE,
      options(graph) {
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
          callback: sortModel => {
            sortModelId = sortModel.id;
          },
          parent: pageModelId,
          groupProperties: {},
          properties: {
            [NodeProperties.ExcludeFromController]: true,
            [NodeProperties.UIText]: "Sort",
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
export const CreateDefaultView = {
  type: "Create View - Form",
  methodType: "React Native Views",
  method(_args) {
    const method_result = {};
    const default_View_method = (args = {}) => {
      let {
        viewName,
        isList,
      } = args;
      let { model } = args;
      let {
        isPluralComponent = false } = args;
      const {
        viewType,
        isDefaultComponent,
        uiType = UITypes.ReactNative,
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
      let screenNodeId = null;
      let screenComponentId = null;
      let listComponentId = null;
      let screenNodeOptionId = null;
      let childComponents = [];
      const modelComponentSelectors = [];
      let layout = null;
      let listLayout = null;
      const viewModelNodeFocusId = null;
      const viewModelNodeBlurId = null;
      const createConnections = [];
      const createListConnections = [];
      viewName = viewName || GetNodeTitle(currentNode);
      const useModelInstance = [
        ViewTypes.Get,
        ViewTypes.GetAll,
        ViewTypes.Delete
      ].some(v => viewType === v);
      const viewPackage = {
        [NodeProperties.ViewPackage]: uuidv4(),
        [NodeProperties.ViewPackageTitle]: viewName
      };
      setViewPackageStamp(viewPackage, "CreateDefaultView");
      const newItems = {};
      let viewComponentType = null;
      let viewComponent = null;
      let multi_item_component = ComponentTypes[uiType].List.key;
      let needsLoadToScreenState = false;

      const propertyDataChainAccesors = [];

      const datachainLink = [];
      let skipModelDataChainListParts = false;
      let listDataChainId = null;
      let listDataChainExitId = null;
      let skipAddingComplete = false;

      switch (viewType) {
        case ViewTypes.Update:
          needsLoadToScreenState = true;
          break;
        default: break;
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
      let dataSourceId;
      const modelType = GetNodeProp(currentNode, NodeProperties.NODEType);
      const isModel = modelType === NodeTypes.Model;

      if (isModel) {
        let modelChildren = GetModelPropertyChildren(currentNode.id);
        newItems.currentNode = currentNode.id;
        if (chosenChildren && chosenChildren.length) {
          modelChildren = modelChildren.filter(x =>
            chosenChildren.some(v => v === x.id)
          );
        }
        const modelProperties = modelChildren.filter(
          x => !GetNodeProp(x, NodeProperties.IsDefaultProperty)
        );
        childComponents = modelProperties.map(() => null);
        const screenComponentEvents = [];
        if (isList) {
          CreatePagingModel();
          CreatePagingSkipDataChains();
          CreatePagingTakeDataChains();
        }
        // let pageViewModel = null;
        // if (!isSharedComponent) {
        //   pageViewModel = CreateScreenModel(viewName);
        // }
        PerformGraphOperation(
          [
            !isSharedComponent
              ? {
                operation: ADD_NEW_NODE,
                options(graph) {
                  const res = GetNodesByProperties(
                    {
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance,
                      [NodeProperties.UIText]: `${viewName} Form`,
                      [NodeProperties.ViewType]: viewType,
                      [NodeProperties.NODEType]: NodeTypes.Screen,
                      [NodeProperties.Model]: currentNode.id
                    },
                    graph
                  ).find(x => x);
                  if (res) {
                    screenNodeId = res.id;
                    newItems.screenNodeId = res.id;
                    method_result.screenNodeId = screenNodeId;
                    return false;
                  }
                  return {
                    nodeType: NodeTypes.Screen,
                    callback: screenNode => {
                      screenNodeId = screenNode.id;
                      newItems.screenNodeId = screenNode.id;
                    },
                    properties: {
                      ...viewPackage,
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance,
                      [NodeProperties.ViewType]: viewType,
                      [NodeProperties.UIText]: `${viewName} Form`,
                      [NodeProperties.Model]: currentNode.id
                    }
                  };
                }
              }
              : false,
            !isSharedComponent
              ? function (graph) {
                return addComponentApiToForm({
                  newItems,
                  text: "value",
                  parent: newItems.screenNodeId,
                  graph,
                  isSingular: true
                });
              }
              : null,
            !isSharedComponent
              ? function (graph) {
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
            ...((needsLoadToScreenState && false)
              ? LoadModel({
                model_view_name: `${viewName} Load ${GetNodeTitle(
                  currentNode
                )}`,
                model_item: `Models.${GetCodeName(currentNode)}`,
                callback: context => {
                  newItems.dataChainForLoading = context.entry;
                }
              })
              : []),

            {
              operation: ADD_NEW_NODE,
              options(graph) {
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

                  callback: res => {
                    newItems.titleService = res.id;
                  }
                };
              }
            },
            !isSharedComponent && isList
              ? {
                // The data chain for a list screen
                operation: ADD_NEW_NODE,
                options(graph) {
                  const $node = GetNodeByProperties(
                    {
                      [NodeProperties.UIText]: `${viewName} Screen DC`,
                      [NodeProperties.DataChainFunctionType]:
                        DataChainFunctionKeys.Selector,
                      [NodeProperties.Selector]: newItems.screenSelector,
                      [NodeProperties.NODEType]: NodeTypes.DataChain,
                      [NodeProperties.EntryPoint]: true,
                      [NodeProperties.SelectorProperty]:
                        SelectorPropertyKeys.Object
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
                      [NodeProperties.DataChainFunctionType]:
                        DataChainFunctionKeys.Selector,
                      [NodeProperties.Selector]: newItems.screenSelector,
                      [NodeProperties.EntryPoint]: true,
                      [NodeProperties.Pinned]: false,
                      [NodeProperties.AsOutput]: true,
                      [NodeProperties.SelectorProperty]:
                        SelectorPropertyKeys.Object
                    },
                    links: [
                      {
                        target: newItems.screenSelector,
                        linkProperties: {
                          properties: { ...LinkProperties.DataChainLink }
                        }
                      }
                    ],
                    callback: res => {
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
                  const cellProperties = GetCellProperties(
                    formLayout,
                    rootCellId
                  );
                  cellProperties.style = {
                    ...cellProperties.style,
                    flexDirection: "column"
                  };

                  addComponentTags(ComponentTags.Main, cellProperties);

                  let componentProps = null;

                  if (useModelInstance) {
                    componentProps = createComponentApi();
                    GENERAL_COMPONENT_API.map(x => {
                      componentProps = addComponentApi(componentProps, {
                        modelProp: x.property
                      });
                    });
                    GENERAL_COMPONENT_API.map(t => {
                      const apiProperty = t.property;
                      (function () {
                        const rootCellId = GetFirstCell(formLayout);
                        const cellProperties = GetCellProperties(
                          formLayout,
                          rootCellId
                        );
                        cellProperties.componentApi =
                          cellProperties.componentApi || {};
                        cellProperties.componentApi[apiProperty] = {
                          instanceType: InstanceTypes.ApiProperty,
                          apiProperty
                        };
                      })();
                    });
                  }
                  return {
                    callback: screenOptionNode => {
                      screenNodeOptionId = screenOptionNode.id;
                      newItems.screenNodeOptionId = screenNodeOptionId;
                    },
                    parent: screenNodeId,
                    properties: {
                      ...viewPackage,
                      [NodeProperties.UIText]: `${viewName} ${uiType} Form`,
                      [NodeProperties.UIType]: uiType,
                      [NodeProperties.ComponentType]:
                        ComponentTypes[uiType].Generic.key,
                      [NodeProperties.ComponentApi]: componentProps,
                      [NodeProperties.Pinned]: false,
                      [NodeProperties.Layout]: formLayout,
                      [NodeProperties.Model]: currentNode.id,
                      [NodeProperties.ViewType]: viewType,
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance
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
              ? function () {
                return addComponentApiToForm({
                  newItems,
                  text: "value",
                  parent: newItems.screenNodeOptionId
                });
              }
              : null,
            !isSharedComponent
              ? function () {
                return addComponentApiToForm({
                  newItems,
                  text: ApiNodeKeys.ViewModel,
                  parent: newItems.screenNodeOptionId
                });
              }
              : null,
            !isSharedComponent
              ? function () {
                return connectComponentToExternalApi({
                  newItems,
                  parent: newItems.screenNodeId,
                  key: "value",
                  properties: LinkProperties.ComponentExternalConnection,
                  child: newItems.screenNodeOptionId
                });
              }
              : null,
            !isSharedComponent
              ? function () {
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
              ? SCREEN_COMPONENT_EVENTS.map(t => {
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
                      callback: screenNode => {
                        screenComponentEvents.push(screenNode.id);
                      }
                    };
                  }
                };
              })
              : []),

            ...((needsLoadToScreenState && false)
              ? ConnectLifecycleMethodToDataChain({
                lifeCycleMethod: graph => {
                  const sce = screenComponentEvents.find(
                    x =>
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
              ? createViewPagingDataChain(
                newItems,
                viewName,
                viewPackage,
                false
              )
              : false,

            isList
              ? {
                operation: NEW_COMPONENT_NODE,
                options(currentGraph) {
                  listLayout = CreateLayout();
                  listLayout = SetCellsLayout(listLayout, 1);
                  const rootCellId = GetFirstCell(listLayout);
                  const cellProperties = GetCellProperties(
                    listLayout,
                    rootCellId
                  );
                  cellProperties.style = {
                    ...cellProperties.style,
                    flexDirection: "column"
                  };
                  const componentProps = null;

                  let connectto = [];
                  if (isDefaultComponent) {
                    connectto = getViewTypeEndpointsForDefaults(
                      viewType,
                      currentGraph,
                      currentNode.id
                    );
                  }
                  return {
                    callback: (listComponent, graph) => {
                      listComponentId = listComponent.id;
                      newItems.listComponentId = listComponentId;
                      connectto.forEach(ct => {
                        createListConnections.push(
                          () => SetSharedComponent({
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
                          () => ([
                            ...[
                              "value",
                              ApiNodeKeys.ViewModel,
                              "label",
                              "placeholder",
                              "error",
                              "success"
                            ].map(
                              v =>
                                function () {
                                  const graph = GetCurrentGraph(
                                    GetStateFunc()()
                                  );
                                  return addComponentApiToForm({
                                    newItems,
                                    text: v,
                                    parent: ct.id,
                                    isSingular: true,
                                    graph
                                  });
                                }
                            )
                          ])
                        );
                      });
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
              ? function () {
                return addListItemComponentApi(
                  newItems,
                  ApiNodeKeys.ViewModel,
                  false,
                  (v, _i) => {
                    newItems.componentItemListViewModel = _i;
                  },
                  newItems.listComponentId,
                  { useAsValue: false }
                );
              }
              : null,
            ...["index", "separators", "value"].map(text => {
              return function () {
                if (!isList) {
                  return [];
                }
                return addListItemComponentApi(
                  newItems,
                  text,
                  true,
                  (v, _i) => {
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
                    callback: nn => {
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
                    callback: nn => {
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
                    target: getApiConnectors(
                      newItems,
                      newItems.screenNodeOptionId,
                      "value"
                    ).internalId,
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
                options(currentGraph) {

                  return {
                    parent: listComponentId,
                    callback: dataSource => {
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
              options(currentGraph) {
                layout = CreateLayout();
                layout = SetCellsLayout(layout, 1);
                const rootCellId = GetFirstCell(layout);
                const cellProperties = GetCellProperties(layout, rootCellId);
                cellProperties.style = {
                  ...cellProperties.style,
                  flexDirection: "column"
                };
                const propertyCount = modelProperties.length + 2;
                const componentProps = null;
                if (isList) {
                  addComponentTags(ComponentTags.List, cellProperties);
                }
                else {
                  addComponentTags(ComponentTags.Form, cellProperties);
                }

                layout = SetCellsLayout(layout, propertyCount, rootCellId);

                let connectto = [];
                if (isDefaultComponent && !isList) {
                  connectto = getViewTypeEndpointsForDefaults(
                    viewType,
                    currentGraph,
                    currentNode.id
                  );
                }
                return {
                  callback: (screenComponent, graph) => {
                    screenComponentId = screenComponent.id;
                    newItems.screenComponentId = screenComponentId;
                    connectto.forEach(ct => {
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

            function () {
              return addListItemComponentApi(
                newItems,
                ApiNodeKeys.ViewModel,
                false,
                (v, _i) => {
                  newItems.componentViewModelApiIds = _i;
                },
                newItems.screenComponentId,
                { useAsValue: false }
              );
            },
            isList
              ? function () {
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

            ...["index", "separators"].map(text => {
              return function () {
                if (!isList) {
                  return [];
                }
                return [
                  ...addListItemComponentApi(
                    newItems,
                    text,
                    false,
                    (v, _i) => {
                      newItems[`listItem${v}`] = _i;
                    },
                    newItems.screenComponentId
                  )
                ];
              };
            }),

            ...["index", "separators"].map(text => {
              return function () {
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
                  callback: nn => {
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
                  callback: nn => {
                    newItems.screenComponentIdExternalApi = nn.id;
                    setApiConnectors(
                      newItems,
                      newItems.screenComponentId,
                      {
                        externalId: nn.id,
                        internalId: newItems.screenComponentIdInternalApi
                      },
                      "value"
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
                  source: getApiConnectors(
                    newItems,
                    newItems.screenComponentId,
                    "value"
                  ).internalId,
                  target: getApiConnectors(
                    newItems,
                    newItems.screenComponentId,
                    "value"
                  ).externalId,
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
                      source: getApiConnectors(
                        newItems,
                        newItems.screenComponentId,
                        "value"
                      ).externalId,
                      target: getApiConnectors(
                        newItems,
                        isList ? listComponentId : screenNodeOptionId,
                        "value"
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
                options(currentGraph) {
                  const formLayout = GetNodeProp(
                    screenNodeOptionId,
                    NodeProperties.Layout,
                    currentGraph
                  );
                  const rootCellId = GetFirstCell(formLayout);
                  const cellProperties = GetCellProperties(
                    formLayout,
                    rootCellId
                  );
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
                options(currentGraph) {
                  const formLayout = GetNodeProp(
                    listComponentId,
                    NodeProperties.Layout,
                    currentGraph
                  );
                  const rootCellId = GetFirstCell(formLayout);
                  const cellProperties = GetCellProperties(
                    formLayout,
                    rootCellId
                  );
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
              .map((modelProperty, modelIndex) => {
                const sharedComponent = GetSharedComponentFor(
                  viewType,
                  modelProperty,
                  currentNode.id,
                  isSharedComponent
                );
                if (!sharedComponent) {
                  switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                    case NodeTypes.Model:
                      return {};
                    case NodeTypes.Property:
                      if (
                        GetNodeProp(
                          modelProperty,
                          NodeProperties.UseModelAsType
                        )
                      ) {
                        // if the property is a model reference, it should be a shared component or something.
                        return {};
                      }
                      break;
                    default: break;
                  }
                } else {
                  childComponents[modelIndex] = sharedComponent;
                  return [
                    ...[
                      "value",
                      ApiNodeKeys.ViewModel,
                      "label",
                      "placeholder",
                      "error",
                      "success"
                    ].map(
                      v =>
                        function () {
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
                  return {};
                }

                return [
                  {
                    operation: NEW_COMPONENT_NODE,
                    options() {
                      const componentTypeToUse = viewComponentType;

                      // Check if the property has a default view to use for different types of situations

                      return {
                        parent: screenComponentId,
                        groupProperties: {},
                        properties: {
                          ...viewPackage,
                          [NodeProperties.UIText]: `${GetNodeTitle(
                            modelProperty
                          )}`,
                          [NodeProperties.UIType]: uiType,
                          [NodeProperties.Label]: GetNodeTitle(modelProperty),
                          [NodeProperties.ComponentType]:
                            sharedComponent || componentTypeToUse,
                          [NodeProperties.UsingSharedComponent]: !!sharedComponent,
                          [NodeProperties.Pinned]: false,
                          [NodeProperties.InstanceType]: useModelInstance
                            ? InstanceTypes.ModelInstance
                            : InstanceTypes.ScreenInstance
                        },
                        linkProperties: {
                          properties: { ...LinkProperties.ComponentLink }
                        },
                        links: [
                          {
                            target: modelProperty.id,
                            linkProperties: {
                              properties: {
                                ...LinkProperties.PropertyLink,
                                [LinkPropertyKeys.ComponentProperty]: true
                              }
                            }
                          }
                        ],
                        callback: component => {
                          childComponents[modelIndex] = component.id;
                        }
                      };
                    }
                  },

                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex
                    );
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      "label"
                    );
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      "placeholder"
                    );
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      "error"
                    );
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      "success"
                    );
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      ApiNodeKeys.ViewModel,
                      newItems.componentViewModelApiIds.internalId
                    );
                  },
                  function () {
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

                  ...[
                    "value",
                    ApiNodeKeys.ViewModel,
                    "label",
                    "placeholder",
                    "error",
                    "success"
                  ]
                    .map(v => {
                      return function (graph) {
                        let connectto = [];
                        if (isDefaultComponent) {
                          connectto = getViewTypeEndpointsForDefaults(
                            viewType,
                            graph,
                            currentNode.id
                          );
                        }

                        const shared_to_component_commands = [];
                        connectto.map(ct => {
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
                    .filter(x => x && isSharedComponent && isDefaultComponent),

                  isSharedComponent && isDefaultComponent
                    ? function (graph) {
                      let connectto = [];
                      if (isDefaultComponent) {
                        connectto = getViewTypeEndpointsForDefaults(
                          viewType,
                          graph,
                          currentNode.id
                        );
                      }

                      const shared_to_component_commands = [];
                      connectto.map(ct => {
                        const temp = GetNodesLinkedTo(graph, {
                          id: ct.id,
                          link: LinkType.ComponentInternalApi
                        }).filter(
                          x =>
                            GetNodeProp(x, NodeProperties.NODEType) ===
                            NodeTypes.ComponentApi
                        );
                        // && GetNodeProp(x, NodeProperties.UIText) === text
                        temp.map(t => {
                          shared_to_component_commands.push(
                            ...connectComponentToExternalApi({
                              newItems,
                              parent: ct.id,
                              key: GetNodeProp(t, NodeProperties.UIText),
                              properties: {
                                ...LinkProperties.ComponentExternalConnection,
                                ...(needsLoadToScreenState
                                  ? {
                                    [LinkPropertyKeys.InstanceUpdate]: false
                                  }
                                  : {})
                              },
                              child: childComponents[modelIndex]
                            })
                          );
                        });
                      });
                      return shared_to_component_commands;
                    }
                    : null
                ].filter(x => x);
              })
              .flatten(),
            ...modelProperties.map((modelProperty) => {
              return {
                operation: ADD_LINK_BETWEEN_NODES,
                options() {
                  const sharedComponent = GetSharedComponentFor(
                    viewType,
                    modelProperty,
                    currentNode.id,
                    isSharedComponent
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
            {
              operation: NEW_COMPONENT_NODE,
              options() {
                return {
                  parent: screenComponentId,
                  groupProperties: {},
                  properties: {
                    ...viewPackage,
                    [NodeProperties.UIText]: `${
                      Titles.Execute
                      } Button ${viewName} Component`,
                    [NodeProperties.UIType]: uiType,
                    [NodeProperties.Pinned]: false,
                    [NodeProperties.Label]: `${
                      Titles.Execute
                      } Button ${viewName} Component`,
                    [NodeProperties.ExecuteButton]: true,
                    [NodeProperties.ComponentType]:
                      ComponentTypes[uiType].Button.key,
                    [NodeProperties.InstanceType]: useModelInstance
                      ? InstanceTypes.ModelInstance
                      : InstanceTypes.ScreenInstance
                  },
                  linkProperties: {
                    properties: { ...LinkProperties.ComponentLink }
                  },
                  callback: component => {
                    childComponents.push(component.id);
                    newItems.button = component.id;
                    method_result.formButton = component.id;
                  }
                };
              }
            },
            {
              operation: NEW_COMPONENT_NODE,
              options() {
                return {
                  parent: screenComponentId,
                  groupProperties: {},
                  properties: {
                    ...viewPackage,
                    [NodeProperties.UIText]: `${
                      Titles.Cancel
                      } Button ${viewName} Component`,
                    [NodeProperties.UIType]: uiType,
                    [NodeProperties.Pinned]: false,
                    [NodeProperties.Label]: `${
                      Titles.Cancel
                      } Button ${viewName} Component`,
                    [NodeProperties.ComponentType]:
                      ComponentTypes[uiType].Button.key,
                    [NodeProperties.InstanceType]: useModelInstance
                      ? InstanceTypes.ModelInstance
                      : InstanceTypes.ScreenInstance
                  },
                  linkProperties: {
                    properties: { ...LinkProperties.ComponentLink }
                  },
                  callback: component => {
                    childComponents.push(component.id);
                    newItems.cancelbutton = component.id;
                    method_result.cancelButton = component.id;
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
                return {
                  nodeType: NodeTypes.ComponentApi,
                  callback: nn => {
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
            },
            {
              operation: ADD_NEW_NODE,
              options() {
                return {
                  nodeType: NodeTypes.ComponentExternalApi,
                  callback: nn => {
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
            },
            {
              operation: ADD_LINK_BETWEEN_NODES,
              options() {
                return {
                  source: newItems.buttonInternalApi,
                  target: newItems.buttonExternalApi,
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
                  target: newItems.screenComponentIdInternalApi,
                  source: newItems.buttonExternalApi,
                  properties: {
                    ...LinkProperties.ComponentExternalConnection,
                    ...(needsLoadToScreenState
                      ? {
                        [LinkPropertyKeys.InstanceUpdate]: true
                      }
                      : {})
                  }
                };
              }
            },
            function () {
              return addComponentApiToForm({
                newItems,
                text: ApiNodeKeys.ViewModel,
                parent: newItems.button
              });
            },
            function () {
              return connectComponentToExternalApi({
                newItems,
                parent: newItems.screenComponentId,
                key: ApiNodeKeys.ViewModel,
                properties: {
                  ...LinkProperties.ComponentExternalConnection,
                  ...(needsLoadToScreenState
                    ? {
                      [LinkPropertyKeys.InstanceUpdate]: true
                    }
                    : {})
                },
                child: newItems.button
              });
            },
            ...ComponentTypes[uiType].Button.eventApi.map(t => {
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
                    callback(component) {
                      method_result.formButtonApi =
                        method_result.formButtonApi || {};
                      method_result.formButtonApi[t] = component.id;
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
            }),
            {
              operation: CHANGE_NODE_PROPERTY,
              options() {
                const executeButtonComponent = childComponents.length - 2;
                const rootCellId = GetFirstCell(layout);
                const children = GetChildren(layout, rootCellId);
                const childId = children[executeButtonComponent];
                const cellProperties = GetCellProperties(layout, childId);
                cellProperties.children[childId] =
                  childComponents[executeButtonComponent];
                cellProperties.style.flex = null;
                cellProperties.style.height = null;
                addComponentTags(ComponentTags.MainButton, cellProperties);
                return {
                  prop: NodeProperties.Layout,
                  id: screenComponentId,
                  value: layout
                };
              }
            },
            {
              operation: CHANGE_NODE_PROPERTY,
              options() {
                const executeButtonComponent = childComponents.length - 1;
                const rootCellId = GetFirstCell(layout);
                const children = GetChildren(layout, rootCellId);
                const childId = children[executeButtonComponent];
                const cellProperties = GetCellProperties(layout, childId);
                cellProperties.children[childId] =
                  childComponents[executeButtonComponent];
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
            },
            ...modelProperties.map((modelProperty, modelIndex) => {
              return {
                operation: CHANGE_NODE_PROPERTY,
                options() {
                  let sharedComponent = GetSharedComponentFor(
                    viewType,
                    modelProperty,
                    currentNode.id,
                    isSharedComponent
                  );
                  if (!sharedComponent) {
                    switch (
                    GetNodeProp(modelProperty, NodeProperties.NODEType)
                    ) {
                      case NodeTypes.Model:
                        return {};
                      case NodeTypes.Property:
                        if (
                          GetNodeProp(
                            modelProperty,
                            NodeProperties.UseModelAsType
                          )
                        ) {
                          const _ui_model_type = GetNodeProp(
                            modelProperty,
                            NodeProperties.UIModelType
                          );
                          if (_ui_model_type) {
                            sharedComponent = GetSharedComponentFor(
                              viewType,
                              modelProperty,
                              _ui_model_type,
                              isSharedComponent
                            );
                          }
                          if (!sharedComponent) {
                            // if the property is a model reference, it should be a shared component or something.
                            return {};
                          }
                        }
                        break;
                      default: break;
                    }
                  }

                  const rootCellId = GetFirstCell(layout);
                  const children = GetChildren(layout, rootCellId);
                  const childId = children[modelIndex];
                  const cellProperties = GetCellProperties(layout, childId);
                  cellProperties.children[childId] =
                    sharedComponent || childComponents[modelIndex];
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
            ...modelProperties.map((modelProperty, modelIndex) => {
              const sharedComponent = GetSharedComponentFor(
                viewType,
                modelProperty,
                currentNode.id,
                isSharedComponent
              );
              if (!sharedComponent) {
                switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                  case NodeTypes.Model:
                    return {};
                  case NodeTypes.Property:
                    if (
                      GetNodeProp(modelProperty, NodeProperties.UseModelAsType)
                    ) {
                      // if the property is a model reference, it should be a shared component or something.
                      return {};
                    }
                    break;
                }
              }
              return {
                operation: CHANGE_NODE_PROPERTY,
                options(graph) {
                  let componentProps = createComponentApi();
                  const componentTypes = ComponentTypes[uiType];
                  const compNodeId = childComponents[modelIndex];
                  const compNode = GetNodeById(compNodeId, graph);
                  const componentType = GetNodeProp(
                    compNode,
                    NodeProperties.ComponentType
                  );
                  if (!sharedComponent && componentTypes[componentType]) {
                    componentTypes[componentType].defaultApi.map(x => {
                      componentProps = addComponentApi(componentProps, {
                        modelProp: x.property
                      });
                    });
                  } else if (sharedComponent) {
                    componentProps = {};
                    //     let { instanceType, model, selector, modelProperty, apiProperty, handlerType, isHandler, dataChain } = apiConfig[i];
                    SHARED_COMPONENT_API.map(x => {
                      componentProps[x.property] = {
                        instanceType: useModelInstance
                          ? InstanceTypes.ModelInstance
                          : InstanceTypes.ScreenInstance,
                        model: currentNode.id,
                        modelProperty: modelProperty.id,
                        handlerType: HandlerTypes.Property
                      };
                    });
                  } else {
                    throw "sharedComponent should be set";
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
              options(graph) {
                let componentProps = createComponentApi();
                const componentTypes = ComponentTypes[uiType];
                const compNodeId = childComponents[childComponents.length - 1];
                const compNode = GetNodeById(compNodeId, graph);
                const componentType = GetNodeProp(
                  compNode,
                  NodeProperties.ComponentType
                );
                componentTypes[componentType].defaultApi.map(x => {
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
            },
            {
              operation: CHANGE_NODE_PROPERTY,
              options(graph) {
                let componentProps = createComponentApi();
                const componentTypes = ComponentTypes[uiType];
                const compNodeId = childComponents[childComponents.length - 2];
                const compNode = GetNodeById(compNodeId, graph);
                const componentType = GetNodeProp(
                  compNode,
                  NodeProperties.ComponentType
                );
                componentTypes[componentType].defaultApi.map(x => {
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
            }
            , function () {
              return AddNavigateBackHandler({
                button: newItems.cancelbutton,
                evt: uiType === UITypes.ReactNative ? "onPress" : "onClick"
              })
            },
            function () {
              const selectorNode = GetNodesByProperties({
                [NodeProperties.Model]: currentNode.id,
                [NodeProperties.NODEType]: NodeTypes.Selector
                //  [NodeProperties.IsShared]: isSharedComponent,
                // [NodeProperties.InstanceType]: useModelInstance
              }).find(x => x);
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
                        [NodeProperties.UIText]: `${GetNodeTitle(currentNode)}${
                          useModelInstance ? " Instance" : ""
                          }`,
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
                      callback: selector => {
                        modelComponentSelectors.push(selector.id);
                      }
                    };
                  }
                }
              ];
            }].filter(x => x),
          ...[
            isList
              ? {
                operation: ADD_NEW_NODE,
                options() {
                  const node = GetNodesByProperties({
                    [NodeProperties.EntryPoint]: true,
                    [NodeProperties.DataChainFunctionType]:
                      DataChainFunctionKeys.Models,
                    [NodeProperties.UIModelType]: currentNode.id
                  }).find(x => x);
                  if (node) {
                    listDataChainId = node.id;
                    skipModelDataChainListParts = true;
                    return null;
                  }

                  return {
                    callback: dataChain => {
                      listDataChainId = dataChain.id;
                    },
                    nodeType: NodeTypes.DataChain,
                    properties: {
                      ...viewPackage,
                      [NodeProperties.UIText]: `Get ${viewName} Objects`,
                      [NodeProperties.EntryPoint]: true,
                      [NodeProperties.DataChainFunctionType]:
                        DataChainFunctionKeys.Models,
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
                options(graph) {
                  if (skipModelDataChainListParts) {
                    return null;
                  }
                  const temp = SplitDataCommand(
                    GetNodeById(listDataChainId, graph),
                    (split, graph, groupId) => {
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
          ].filter(x => x),
          ...[
            {
              operation: ADD_NEW_NODE,
              options(graph) {
                const node = GetNodesByProperties(
                  {
                    [NodeProperties.UIText]: `Get ${viewName}`,
                    [NodeProperties.DataChainFunctionType]:
                      DataChainFunctionKeys.Selector,
                    [NodeProperties.EntryPoint]: true,
                    [NodeProperties.Model]: currentNode.id,
                    [NodeProperties.Selector]: modelComponentSelectors[0],
                    [NodeProperties.SelectorProperty]: SelectorPropertyKeys.Object
                  },
                  graph
                ).find(x => x);
                if (node) {
                  skipAddingComplete = true;
                  newItems.getObjectDataChain = node.id;
                  return null;
                }
                return {
                  nodeType: NodeTypes.DataChain,
                  callback: n => {
                    newItems.getObjectDataChain = n.id;
                  },
                  properties: {
                    ...viewPackage,
                    [NodeProperties.UIText]: `Get ${viewName}`,
                    [NodeProperties.EntryPoint]: true,
                    [NodeProperties.Model]: currentNode.id,
                    [NodeProperties.DataChainFunctionType]:
                      DataChainFunctionKeys.Selector,
                    [NodeProperties.Selector]: modelComponentSelectors[0],
                    [NodeProperties.SelectorProperty]:
                      SelectorPropertyKeys.Object,
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
              options(graph) {
                if (skipAddingComplete) {
                  return false;
                }
                const temp = AddChainCommand(
                  GetNodeById(newItems.getObjectDataChain, graph),
                  () => { },
                  graph,
                  {
                    ...viewPackage,
                    [NodeProperties.AsOutput]: true,
                    [NodeProperties.DataChainFunctionType]:
                      DataChainFunctionKeys.Pass,
                    [NodeProperties.UIText]: `Get ${viewName} Complete`
                  }
                );
                return temp.options;
              }
            }
          ]
        )(GetDispatchFunc(), GetStateFunc());

        modelProperties.forEach((modelProperty, propertyIndex) => {
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
                  _ui_model_type = GetNodeProp(
                    modelProperty,
                    NodeProperties.UIModelType
                  );
                  if (_ui_model_type) {
                    referenceproperty = GetSharedComponentFor(
                      viewType,
                      modelProperty,
                      _ui_model_type,
                      isSharedComponent
                    );
                  }
                }
              }
              break;
            default: break;
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
            AttachDataChainAccessorTo(
              referenceproperty,
              buildPropertyResult.propDataChainNodeId
            );
            AttachSelectorAccessorTo(
              referenceproperty,
              modelComponentSelectors[0]
            );
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
          const apiDataChainLists = {};
          newItems.apiDataChain = newItems.apiDataChain || {};
          newItems.apiDataChain[childId] = apiDataChainLists;

          setupPropertyApi({
            viewName,
            modelProperty,
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
            uiType,
            viewType,
            newItems,
            childComponents,
            propertyIndex
          });

          PerformGraphOperation([
            ...apiList.map(api => {
              return {
                operation: CHANGE_NODE_PROPERTY,
                options() {
                  const apiProperty = api.value;
                  const cellProperties = GetCellProperties(layout, childId);
                  cellProperties.componentApi =
                    cellProperties.componentApi || {};
                  // let { instanceType, model, selector, handlerType, dataChain, modelProperty } = cellProperties.componentApi[apiProperty] || {};
                  if (ARE_BOOLEANS.some(v => v === apiProperty)) {
                    cellProperties.componentApi[apiProperty] = {
                      instanceType: InstanceTypes.Boolean,
                      handlerType: HandlerTypes.Property
                    };
                  } else if (ARE_HANDLERS.some(v => v === apiProperty)) {
                    if ([ARE_TEXT_CHANGE].some(v => v === apiProperty)) {
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
                      cellProperties.componentApi[
                        apiProperty
                      ].model = viewModelNodeBlurId;
                      cellProperties.componentApi[apiProperty].modelProperty =
                        modelProperties[propertyIndex].id;
                      cellProperties.componentApi[apiProperty].handlerType =
                        HandlerTypes.Blur;
                      break;
                    case ON_CHANGE_TEXT:
                    case ON_CHANGE:
                      cellProperties.componentApi[apiProperty].modelProperty =
                        modelProperties[propertyIndex].id;
                      break;
                    case ON_FOCUS:
                      cellProperties.componentApi[
                        apiProperty
                      ].model = viewModelNodeFocusId;
                      cellProperties.componentApi[apiProperty].modelProperty =
                        modelProperties[propertyIndex].id;
                      cellProperties.componentApi[apiProperty].handlerType =
                        HandlerTypes.Focus;
                      break;
                    default:
                      break;
                  }
                  if (cellProperties.componentApi[apiProperty].modelProperty) {
                    datachainLink.push({
                      operation: ADD_LINK_BETWEEN_NODES,
                      options() {
                        return {
                          target:
                            cellProperties.componentApi[apiProperty]
                              .modelProperty,
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
                          target:
                            cellProperties.componentApi[apiProperty].model,
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
            function () {
              return datachainLink;
            },
            function () {
              return [
                ...[]
                  .interpolate(0, modelProperties.length + 1, modelIndex => {
                    return applyDefaultComponentProperties(
                      GetNodeById(childComponents[modelIndex]),
                      uiType
                    );
                  })
                  .flatten(),

                applyDefaultComponentProperties(
                  GetNodeById(screenComponentId),
                  uiType
                ),
                applyDefaultComponentProperties(
                  GetNodeById(screenNodeOptionId),
                  uiType
                )
              ];
            },
            function () {
              return createConnections;
            },
            function () {
              return createListConnections;
            },
            function () {
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
                    return (
                      ConnectListViewModelToExternalViewModel({
                        target: screenViewModelInternal.id,
                        source: listViewModel.id
                      })
                    )
                  }
                }
              }
            },
            function () {
              if (isList) {
                if (newItems.listDataChainExitId && newItems.listDataChainExitGroupId) {
                  return AppendGetIdsToDataChain({
                    dataChain: newItems.listDataChainExitId,
                    dataChainGroup: newItems.listDataChainExitGroupId
                  });
                }
              }
              return [];
            },
            function () {
              if (needsLoadToScreenState) {

                return SetModelsApiLinkForInstanceUpdate({
                  viewPackage: viewPackage[NodeProperties.ViewPackage]
                })
              }
            },
            function () {
              const steps = [];
              if (needsLoadToScreenState) {
                if (!isSharedComponent) {
                  if (isList) {
                    steps.push(...SetupViewModelOnScreen({
                      model: currentNode.id,
                      screen: screenNodeId
                    }));
                  } else {
                    let modelView_DataChain;
                    steps.push([
                      ...GetModelViewModelForUpdate({
                        screen: GetNodeTitle(screenNodeId),
                        viewModel: screenNodeId,
                        callback: ctx => {
                          const { entry } = ctx;
                          modelView_DataChain = entry;
                        }
                      }),
                      function (graph) {
                        const temp = GetNodesLinkedTo(graph, {
                          id: screenNodeId,
                          link: LinkType.ComponentExternalApi
                        });
                        const externalNode = temp.find(
                          x =>
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
                    ])
                  }
                }
              }

              return steps;
            }
          ])(GetDispatchFunc(), GetStateFunc());
        });
      }



      SelectedNode(currentNode.id)(GetDispatchFunc(), GetStateFunc());
    };
    const { uiTypes } = _args;
    if (uiTypes) {
      for (const i in uiTypes) {
        if (uiTypes[i]) {
          default_View_method({ ..._args, uiType: i });
          setViewPackageStamp(null, "CreateDefaultView");
        }
      }
    } else {
      default_View_method({ ..._args });
      setViewPackageStamp(null, "CreateDefaultView");
    }
    return method_result;
  }
};

export function applyDefaultComponentProperties(currentNode, _ui_type) {
  // var { state } = this.props;
  // var currentNode = Node(state, Visual(state, SELECTED_NODE));
  // let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
  // let _ui_type = GetNodeProp(screenOption, NodeProperties.UIType);
  const result = [];
  if (currentNode) {
    const componentTypes = ComponentTypes[_ui_type] || {};
    const componentType = GetNodeProp(currentNode, NodeProperties.ComponentType);
    Object.keys(
      componentTypes[componentType]
        ? componentTypes[componentType].properties
        : {}
    ).map(key => {
      const prop_obj = componentTypes[componentType].properties[key];
      if (prop_obj.parameterConfig) {
        const selectedComponentApiProperty = key;
        let componentProperties = GetNodeProp(
          currentNode,
          prop_obj.nodeProperty
        );
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
            id: currentNode.id,
            value: componentProperties
          }
        });
      }
    });
  }

  return result;
}

function CreateFunction(option) {
  const {
    nodePackageType,
    methodType,
    httpMethod,
    functionType,
    functionName
  } = option;
  if (!nodePackageType) {
    throw "missing node package type";
  }
  if (!methodType) {
    throw "missing method type";
  }
  if (!httpMethod) {
    throw "missing http method";
  }
  if (!functionType) {
    throw "function type missing";
  }
  if (!functionName) {
    throw "function name is missing";
  }
  return args => {
    const { model, dispatch, getState } = args;
    // Check for existing method of this type

    // if no methods exist, then create a new method.
    // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
    const agents = GetAgentNodes();

    agents
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController))
      .forEach(agent => {
        let methodProps;

        if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
          const context = {};
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
                    [NodeProperties.UIText]: `${GetNodeTitle(
                      model
                    )} ${functionName}`
                  },
                  linkProperties: {
                    properties: { ...LinkProperties.FunctionOperator }
                  },
                  callback: methodNode => {
                    context.methodNode = methodNode;

                  }
                }
              }
            },
            function () {
              const { methodNode } = context;
              const { constraints } = MethodFunctions[functionType];
              let commands = [];
              Object.values(constraints).forEach(constraint => {
                let perOrModelNode = null;
                switch (constraint.key) {
                  case FunctionTemplateKeys.Model:
                  case FunctionTemplateKeys.Agent:
                  case FunctionTemplateKeys.User:
                  case FunctionTemplateKeys.ModelOutput:
                    methodProps = {
                      ...methodProps,
                      ...(GetNodeProp(
                        GetNodeById(methodNode.id),
                        NodeProperties.MethodProps
                      ) || {})
                    };
                    if (constraint[NodeProperties.IsAgent]) {
                      methodProps[constraint.key] = agent.id;
                    } else if (
                      constraint.key === FunctionTemplateKeys.User
                    ) {
                      methodProps[constraint.key] =
                        GetNodeProp(
                          GetNodeById(agent.id),
                          NodeProperties.UIUser
                        ) || GetUsers()[0].id;
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
                            constraint.key ===
                              FunctionTemplateKeys.Permission
                              ? NodeTypes.Permission
                              : NodeTypes.ModelFilter,
                          groupProperties: {},
                          properties: {
                            [NodeProperties.NodePackage]: model.id,
                            [NodeProperties.NodePackageType]: nodePackageType,
                            [NodeProperties.UIText]: `${GetNodeTitle(
                              methodNode
                            )} ${
                              constraint.key ===
                                FunctionTemplateKeys.Permission
                                ? NodeTypes.Permission
                                : NodeTypes.ModelFilter
                              }`
                          },
                          linkProperties: {
                            properties: {
                              ...LinkProperties.FunctionOperator
                            }
                          },
                          callback: newNode => {
                            methodProps = {
                              ...methodProps,
                              ...(GetNodeProp(
                                GetNodeById(methodNode.id),
                                NodeProperties.MethodProps
                              ) || {})
                            };
                            methodProps[constraint.key] = newNode.id;
                            perOrModelNode = newNode;
                          }
                        }
                      }
                    ])(dispatch, getState);
                    if (
                      constraint.key ===
                      FunctionTemplateKeys.ModelFilter
                    ) {
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
                  default: break;
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
                  nodePackageType,
                  NodeTypes.Controller
                )
              ) {
                commands.push({
                  operation: ADD_NEW_NODE,
                  options: {
                    nodeType: NodeTypes.Controller,
                    properties: {
                      [NodeProperties.NodePackage]: model.id,
                      [NodeProperties.NodePackageType]: nodePackageType,
                      [NodeProperties.NodePackageAgent]: agent.id,
                      [NodeProperties.UIText]: `${GetNodeTitle(
                        model
                      )} ${GetNodeTitle(agent)} Controller`
                    },
                    linkProperties: {
                      properties: {
                        ...LinkProperties.FunctionOperator
                      }
                    },
                    callback: controllerNode => {
                      context.controllerNode = controllerNode;
                    }
                  }
                }, () => {
                  const { controllerNode } = context;
                  if (
                    ModelNotConnectedToFunction(
                      agent.id,
                      model.id,
                      nodePackageType,
                      NodeTypes.Maestro
                    )
                  ) {
                    return ([
                      {
                        operation: ADD_NEW_NODE,
                        options: {
                          nodeType: NodeTypes.Maestro,
                          parent: controllerNode.id,

                          properties: {
                            [NodeProperties.NodePackage]:
                              model.id,
                            [NodeProperties.NodePackageType]: nodePackageType,
                            [NodeProperties.NodePackageAgent]:
                              agent.id,
                            [NodeProperties.UIText]: `${GetNodeTitle(
                              model
                            )} ${GetNodeTitle(agent)} Maestro`
                          },
                          linkProperties: {
                            properties: {
                              ...LinkProperties.MaestroLink
                            }
                          },
                          callback: maestroNode => {
                            context.maestroNode = maestroNode;
                          }
                        }
                      }
                    ])
                  }
                  return [];
                }, () => [
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
                      }
                    }
                  }
                ]);
              }
              return commands;
            }
          ];
          PerformGraphOperation(outer_commands)(dispatch, getState);
        }
      });
  };
}

export function CreateAgentFunction(option) {
  const {
    nodePackageType,
    methodType,
    parentId: parent,
    httpMethod,
    functionType,
    functionName,
    viewPackage,
    model,
    agent
  } = option;

  if (!nodePackageType) {
    throw new Error("missing node package type");
  }
  if (!methodType) {
    throw new Error("missing method type");
  }
  if (!httpMethod) {
    throw new Error("missing http method");
  }
  if (!functionType) {
    throw new Error("function type missing");
  }
  if (!functionName) {
    throw new Error("function name is missing");
  }
  return args => {
    const { dispatch, getState } = args;
    // Check for existing method of this type

    // if no methods exist, then create a new method.
    // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);

    let methodProps;
    const new_nodes = {};
    let _viewPackage = null;

    _viewPackage = viewPackage || {
      [NodeProperties.ViewPackage]: uuidv4()
    };
    setViewPackageStamp(_viewPackage, "CreateAgentFunction");
    if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
      const outer_commands = [
        {
          operation: ADD_NEW_NODE,
          options() {
            return {
              nodeType: NodeTypes.Method,
              groupProperties: {},
              properties: {
                [NodeProperties.NodePackage]: model.id,
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
              callback: methodNode => {
                new_nodes.methodNode = methodNode;
              }
            };
          }
        },
        function () {
          const { methodNode } = new_nodes;
          const { constraints } = MethodFunctions[functionType];
          let commands = [
            {
              operation: ADD_DEFAULT_PROPERTIES,
              options: {
                parent: model.id,
                groupProperties: {},
                linkProperties: {
                  properties: { ...LinkProperties.PropertyLink }
                }
              }
            }
          ];
          Object.values(constraints).forEach(constraint => {
            let validator = null;
            let perOrModelNode = null;
            let executor = null;
            switch (constraint.key) {
              case FunctionTemplateKeys.Model:
              case FunctionTemplateKeys.Agent:
              case FunctionTemplateKeys.Parent:
              case FunctionTemplateKeys.User:
              case FunctionTemplateKeys.ModelOutput:
                methodProps = {
                  ...methodProps,
                  ...(GetNodeProp(
                    GetNodeById(methodNode.id),
                    NodeProperties.MethodProps
                  ) || {})
                };
                if (constraint[NodeProperties.IsAgent]) {
                  methodProps[constraint.key] = agent.id;
                } else if (constraint.key === FunctionTemplateKeys.User) {
                  methodProps[constraint.key] = option.user
                    ? option.user.id
                    : GetNodeProp(
                      GetNodeById(agent.id),
                      NodeProperties.UIUser
                    ) || GetUsers()[0].id;
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
                  methodProps[constraint.key] = parent.id;
                } else {
                  methodProps[constraint.key] = model.id;
                }
                break;
              case FunctionTemplateKeys.Validator:
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
                          callback: _node => {
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
                break;
              case FunctionTemplateKeys.Executor:

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
                            [NodeProperties.ExecutorFunctionType]: methodType,
                            [NodeProperties.UIText]: `${GetNodeTitle(
                              methodNode
                            )} Executor`,
                            [NodeProperties.ExecutorModel]: model.id,
                            [NodeProperties.ExecutorModelOutput]: model.id,
                            [NodeProperties.ExecutorFunction]: methodNode.id,
                            [NodeProperties.ExecutorAgent]: agent.id
                          },
                          callback: _node => {
                            methodProps[constraint.key] = _node.id;
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
                break;
              case FunctionTemplateKeys.Permission:
              case FunctionTemplateKeys.ModelFilter:
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
                            )} ${
                              constraint.key === FunctionTemplateKeys.Permission
                                ? NodeTypes.Permission
                                : NodeTypes.ModelFilter
                              }`
                          },
                          linkProperties: {
                            properties: { ...LinkProperties.FunctionOperator }
                          },
                          callback: newNode => {
                            methodProps = {
                              ...methodProps,
                              ...(GetNodeProp(
                                GetNodeById(methodNode.id),
                                NodeProperties.MethodProps
                              ) || {})
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
                break;
              default: break;
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
        function () {
          return UpdateMethodParameters({
            methodType: functionType,
            current: new_nodes.methodNode.id,
            viewPackages: viewPackage
          })
        },
        function () {
          return AttachMethodToMaestro({
            methodNodeId: new_nodes.methodNode.id,
            modelId: model.id,
            options: option,
            viewPackage
          })
        }
      ];

      // updateMethodParameters(
      //   new_nodes.methodNode.id,
      //   functionType,
      //   viewPackage
      // )(dispatch, getState);
      outer_commands.push({
        operation: NO_OP,
        options() { }
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

    setViewPackageStamp(null, "CreateAgentFunction");
    return new_nodes;
  };
}

function addListItemComponentApi(
  newItems,
  text,
  noExternal,
  keyfunc,
  parent,
  options = { useAsValue: true }
) {
  let internalId;
  let externalId;
  return [
    {
      operation: ADD_NEW_NODE,
      options() {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
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
            callback: nn => {
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
  ].filter(x => x);
}
function addComponentEventApiNodes(args) {
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
    .map(apiName => {
      const apiNameInstance = `${apiName} Instance`;
      const apiNameEventHandler = `${apiName} Event Handler`;

      return [
        {
          operation: ADD_NEW_NODE,
          options() {
            return {
              nodeType: NodeTypes.EventMethod,
              callback: nn => {
                newItems.eventApis[childComponents[modelIndex]] = {
                  ...(newItems.eventApis[childComponents[modelIndex]] || {}),
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
              callback: nn => {
                newItems.eventApis[childComponents[modelIndex]] = {
                  ...(newItems.eventApis[childComponents[modelIndex]] || {}),
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
              callback: nn => {
                newItems.eventApis[childComponents[modelIndex]] = {
                  ...(newItems.eventApis[childComponents[modelIndex]] || {}),
                  [apiNameEventHandler]: nn.id
                };
              },
              parent:
                newItems.eventApis[childComponents[modelIndex]][
                apiNameInstance
                ],
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
              source:
                newItems.eventApis[childComponents[modelIndex]][
                apiNameEventHandler
                ],
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
  newItems,
  childComponents,
  modelIndex,
  apiName = "value",
  externalApiId
) {
  const parent = childComponents[modelIndex];
  let componentInternalValue = null;
  let componentExternalValue = null;
  return [
    {
      operation: ADD_NEW_NODE,
      options() {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
            componentInternalValue = nn.id;
            newItems[childComponents[modelIndex]] = {
              ...(newItems[childComponents[modelIndex]] || {}),
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
          callback: nn => {
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
  ].filter(x => x);
}

function addButtonApiNodes(newItems, btn) {
  let buttonInternalApi = null;
  let buttonExternalApi = null;
  btn = btn || (() => null);

  return [
    {
      operation: ADD_NEW_NODE,
      options() {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
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
          callback: nn => {
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

function ConnectExternalApisToSelectors(args) {
  const {
    modelComponentSelectors,
    newItems,
    viewType,
    childComponents,
    propertyIndex
  } = args;
  const steps = [];
  switch (viewType) {
    case ViewTypes.Update:
    case ViewTypes.Create:
      steps.push({
        operation: ADD_LINK_BETWEEN_NODES,
        options() {
          return {
            target: modelComponentSelectors[0],
            source:
              newItems[childComponents[propertyIndex]].value
                .componentExternalValue,
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
          source:
            newItems[childComponents[propertyIndex]].label
              .componentExternalValue,
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
            source:
              newItems[childComponents[propertyIndex]].placeholder
                .componentExternalValue,
            properties: {
              ...LinkProperties.TitleServiceLink
            }
          };
        }
      }
    ])(GetDispatchFunc(), GetStateFunc());
  }
}

function BuildPropertyDataChainAccessor(args) {
  const {
    viewName,
    modelProperty,
    viewPackage,
    currentNode,
    modelComponentSelectors,
    propertyDataChainAccesors,
    newItems,
    viewType } = args;
  let skip = false;
  let propDataChainNodeId = null;
  let entryNodeProperties = null;
  let links = null;
  let skipDataChainStep = false;
  let addcomplete = false;
  switch (viewType) {
    case ViewTypes.Update:
    case ViewTypes.Create:
      entryNodeProperties = {
        [NodeProperties.UIText]: `Get ${viewName} ${viewType} Object => ${GetNodeTitle(
          modelProperty
        )}`,
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
        [NodeProperties.UIText]: `Get ${viewName} ${viewType} Object => ${GetNodeTitle(
          modelProperty
        )}`,
        [NodeProperties.EntryPoint]: true,
        [NodeProperties.DataChainFunctionType]:
          DataChainFunctionKeys.ModelProperty,
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
          }).find(x => x);
          if (node) {
            propDataChainNodeId = node.id;
            skip = true;
            propertyDataChainAccesors.push(propDataChainNodeId);
            setModelPropertyViewTypePropNode(
              newItems,
              modelProperty,
              viewType,
              node
            );
            return null;
          }
          return {
            nodeType: NodeTypes.DataChain,
            properties: {
              ...viewPackage,
              ...entryNodeProperties
            },
            links,
            callback: propNode => {
              propDataChainNodeId = propNode.id;
              propertyDataChainAccesors.push(propDataChainNodeId);
              setModelPropertyViewTypePropNode(
                newItems,
                modelProperty,
                viewType,
                propNode
              );
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
                [GroupProperties.ExternalExitNode]: GetDataChainNextId(
                  propDataChainNodeId
                )
              },
              properties: {
                ...viewPackage,
                [NodeProperties.UIText]: `Get ${GetNodeTitle(modelProperty)}`,
                [NodeProperties.ChainParent]: propDataChainNodeId,
                [NodeProperties.AsOutput]: true,
                [NodeProperties.DataChainFunctionType]:
                  DataChainFunctionKeys.Property,
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
              callback: () => { }
            };
          }
        },
      addcomplete
        ? {
          operation: ADD_NEW_NODE,
          options(graph) {
            if (skip) {
              return false;
            }
            const groupProperties = GetNodeProp(
              propDataChainNodeId,
              NodeProperties.GroupParent,
              graph
            )
              ? {
                id: getGroup(
                  GetNodeProp(
                    propDataChainNodeId,
                    NodeProperties.GroupParent,
                    graph
                  ),
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
                [NodeProperties.DataChainFunctionType]:
                  DataChainFunctionKeys.Pass,
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
    ].filter(x => x)
  )(GetDispatchFunc(), GetStateFunc());
  return { skip, propDataChainNodeId };
}

function setModelPropertyViewTypePropNode(
  newItems,
  modelProperty,
  viewType,
  propNode
) {
  if (!newItems.PropertyDataChainGetter) {
    newItems.PropertyDataChainGetter = {};
  }
  if (!newItems.PropertyDataChainGetter[modelProperty.id]) {
    newItems.PropertyDataChainGetter[modelProperty.id] = {};
  }
  newItems.PropertyDataChainGetter[modelProperty.id][viewType] = propNode.id;
}

function setupPropertyApi(args) {
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
      .map(api => {
        const apiProperty = api.value;
        if (
          ARE_BOOLEANS.some(v => v === apiProperty) ||
          ARE_HANDLERS.some(v => v === apiProperty)
        ) {
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
          default: break;
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
            callback: context => {
              _context = context;
              apiDataChainLists[apiProperty] = _context.entry;
            }
          })
        ];
      })
      .flatten()
      .filter(x => x),
    ...apiList
      .map(v => v.value)
      .map(api_key => {
        return {
          operation: ADD_LINK_BETWEEN_NODES,
          options() {
            if (newItems[childComponents[propertyIndex]][api_key]) {
              return {
                target: apiDataChainLists[api_key],
                source:
                  newItems[childComponents[propertyIndex]][api_key]
                    .componentExternalValue,
                properties: {
                  ...LinkProperties.DataChainLink
                }
              };
            }
          }
        };
      }),
    ...apiList
      .map(v => v.value)
      .map(api_key => {
        return {
          operation: ADD_LINK_BETWEEN_NODES,
          options() {
            if (modelComponentSelectors[0]) {
              return {
                target: modelComponentSelectors[0],
                source:
                  newItems[childComponents[propertyIndex]][api_key]
                    .componentExternalValue,
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
function connectComponentToExternalApi(args) {
  const { newItems, child, key, parent, properties } = args;
  const { externalId } = getApiConnectors(newItems, child, key);
  const { internalId } = getApiConnectors(newItems, parent, key);
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
}

function addComponentApiToForm(args) {
  const {
    newItems,
    text,
    parent,
    isSingular,
    graph,
    internalProperties = {},
    externalProperties = {}
  } = args;
  let externalId;
  let internalId;
  let skip = false;
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
              x =>
                GetNodeProp(x, NodeProperties.NODEType) ===
                NodeTypes.ComponentApi &&
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
            callback: nn => {
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
            x =>
              GetNodeProp(x, NodeProperties.NODEType) ===
              NodeTypes.ComponentApi &&
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
            callback: nn => {
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

function setApiConnectors(newItems, parent, api, key) {
  newItems.apiConnectors = newItems.apiConnectors || {};
  newItems.apiConnectors[parent] = newItems.apiConnectors[parent] || {};
  newItems.apiConnectors[parent][key] = api;
}
function getApiConnectors(newItems, parent, key) {
  newItems.apiConnectors = newItems.apiConnectors || {};
  newItems.apiConnectors[parent] = newItems.apiConnectors[parent] || {};
  return newItems.apiConnectors[parent][key];
}

function AttachDataChainAccessorTo(nodeId, accessorId) {
  const externalApis = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
    id: nodeId,
    link: LinkType.ComponentExternalApi
  });

  PerformGraphOperation([
    ...externalApis.map(externalApi => {
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

function AttachSelectorAccessorTo(nodeId, accessorId) {
  const externalApis = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
    id: nodeId,
    link: LinkType.ComponentExternalApi
  });

  PerformGraphOperation([
    ...externalApis.map(externalApi => {
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
