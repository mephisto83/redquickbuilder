import {
  MethodFunctions,
  FunctionTypes,
  FunctionTemplateKeys,
  FunctionMethodTypes,
  HTTP_METHODS,
  QUERY_PARAMETERS,
  QUERY_PARAMETER_KEYS
} from './functiontypes'
import {
  NodeTypes,
  LinkProperties,
  NodeProperties,
  Methods,
  UITypes,
  GroupProperties,
  LinkType,
  LinkPropertyKeys,
  SelectorPropertyKeys
} from './nodetypes'
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
  ViewTypes,
  GetLinkProperty,
  setSharedComponent,
  getViewTypeEndpointsForDefaults,
  NEW_DATA_SOURCE,
  updateMethodParameters,
  GetNodeByProperties,
  getGroup,
  SelectedNode,
  GetJSCodeName,
  GetCodeName,
  attachMethodToMaestro,
  ADD_DEFAULT_PROPERTIES,
  GetSharedComponentFor
} from '../actions/uiactions'
import {
  newNode,
  CreateLayout,
  SetCellsLayout,
  GetCellProperties,
  GetFirstCell,
  GetAllChildren,
  FindLayoutRootParent,
  GetChildren,
  GetNode,
  existsLinkBetween,
  getNodesByLinkType,
  TARGET,
  SOURCE,
  GetNodesLinkedTo,
  findLink,
  GetLinkBetween,
  getNodesLinkedTo
} from '../methods/graph_methods'
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
  VALUE,
  SHARED_COMPONENT_API,
  GENERAL_COMPONENT_API,
  SCREEN_COMPONENT_EVENTS,
  ComponentEvents,
  PropertyApiList
} from './componenttypes'
import { debug } from 'util'
import * as Titles from '../components/titles'
import {
  createComponentApi,
  addComponentApi,
  getComponentApiList
} from '../methods/component_api_methods'
import {
  DataChainFunctionKeys,
  DataChainFunctions,
  SplitDataCommand,
  ConnectChainCommand,
  AddChainCommand,
  insertNodeInbetween,
  InsertNodeInbetween
} from './datachain'
import { uuidv4 } from '../utils/array'

export const GetSpecificModels = {
  type: 'get-specific-models',
  method: args => {
    let { model, dispatch, getState } = args
    // Check for existing method of this type

    // if no methods exist, then create a new method.
    // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
    let agents = GetAgentNodes()

    agents.map(agent => {
      let methodProps

      if (
        ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type)
      ) {
        let outer_commands = [
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
                setTimeout(() => {
                  new Promise(resolve => {
                    let { constraints } = MethodFunctions[
                      FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
                    ]
                    let commands = []
                    let permissionNode = null
                    Object.values(constraints).map(constraint => {
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
                          }
                          if (constraint[NodeProperties.IsAgent]) {
                            methodProps[constraint.key] = agent.id
                          } else if (
                            constraint.key === FunctionTemplateKeys.User
                          ) {
                            methodProps[constraint.key] =
                              GetNodeProp(
                                GetNodeById(agent.id),
                                NodeProperties.UIUser
                              ) || GetUsers()[0].id
                          } else {
                            methodProps[constraint.key] = model.id
                          }
                          break
                        case FunctionTemplateKeys.Permission:
                        case FunctionTemplateKeys.ModelFilter:
                          let perOrModelNode = null
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
                                  }
                                  methodProps[constraint.key] = newNode.id
                                  perOrModelNode = newNode
                                }
                              }
                            }
                          ])(dispatch, getState)
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
                            ]
                          }
                          break
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
                      ]
                    })
                    if (
                      ModelNotConnectedToFunction(
                        agent.id,
                        model.id,
                        GetSpecificModels.type,
                        NodeTypes.Controller
                      )
                    ) {
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
                            setTimeout(() => {
                              if (
                                ModelNotConnectedToFunction(
                                  agent.id,
                                  model.id,
                                  GetSpecificModels.type,
                                  NodeTypes.Maestro
                                )
                              ) {
                                PerformGraphOperation([
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
                                        setTimeout(() => {
                                          PerformGraphOperation([
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
                                          ])(dispatch, getState)
                                        }, 1500)
                                      }
                                    }
                                  }
                                ])(dispatch, getState)
                              }
                            }, 1500)
                          }
                        }
                      })
                    }
                    PerformGraphOperation(commands)(dispatch, getState)
                    resolve()
                  })
                }, 1500)
              }
            }
          }
        ]
        PerformGraphOperation(outer_commands)(dispatch, getState)
      }
    })
  },
  methodType: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
}

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
}

export const CreateLoginModels = {
  type: 'login-models',
  methodType: 'Login Models',
  method: () => {
    // let currentGraph = GetCurrentGraph(GetStateFunc()());
    // currentGraph = newNode(currentGraph);
    let nodePackageType = 'login-models'
    let nodePackage = 'login-models'
    PerformGraphOperation([
      {
        operation: ADD_NEW_NODE,
        options: {
          nodeType: NodeTypes.Model,
          // groupProperties: {},
          properties: {
            [NodeProperties.NodePackage]: nodePackage,
            [NodeProperties.NodePackageType]: nodePackageType,
            [NodeProperties.UIText]: `Blue Login Model`
          },
          callback: newNode => {
            // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
            // methodProps[constraint.key] = newNode.id;
            // perOrModelNode = newNode;
            setTimeout(() => {
              PerformGraphOperation(
                [
                  { propName: 'User Name' },
                  { propName: 'Password' },
                  { propName: 'Remember Me' }
                ].map(v => {
                  let { propName } = v
                  return {
                    operation: ADD_NEW_NODE,
                    options: {
                      nodeType: NodeTypes.Property,
                      linkProperties: {
                        properties: { ...LinkProperties.PropertyLink }
                      },
                      groupProperties: {},
                      parent: newNode.id,
                      properties: {
                        [NodeProperties.NodePackage]: nodePackage,
                        [NodeProperties.UIAttributeType]:
                          NodePropertyTypes.STRING,
                        [NodeProperties.NodePackageType]: nodePackageType,
                        [NodeProperties.UIText]: propName
                      }
                    }
                  }
                })
              )(GetDispatchFunc(), GetStateFunc())
            }, 1000)
          }
        }
      },
      {
        operation: ADD_NEW_NODE,
        options: {
          nodeType: NodeTypes.Model,
          // groupProperties: {},
          properties: {
            [NodeProperties.NodePackage]: nodePackage,
            [NodeProperties.NodePackageType]: nodePackageType,
            [NodeProperties.UIText]: `Blue Register View Model`
          },
          callback: newNode => {
            // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
            // methodProps[constraint.key] = newNode.id;
            // perOrModelNode = newNode;
            setTimeout(() => {
              PerformGraphOperation(
                [
                  { propName: 'User Name' },
                  { propName: 'Email', propType: NodePropertyTypes.EMAIL },
                  { propName: 'Password' },
                  { propName: 'Confirm Password' }
                ].map(v => {
                  let { propName, propType } = v
                  return {
                    operation: ADD_NEW_NODE,
                    options: {
                      nodeType: NodeTypes.Property,
                      linkProperties: {
                        properties: { ...LinkProperties.PropertyLink }
                      },
                      groupProperties: {},
                      parent: newNode.id,
                      properties: {
                        [NodeProperties.NodePackage]: nodePackage,
                        [NodeProperties.UIAttributeType]:
                          propType || NodePropertyTypes.STRING,
                        [NodeProperties.NodePackageType]: nodePackageType,
                        [NodeProperties.UIText]: propName
                      }
                    }
                  }
                })
              )(GetDispatchFunc(), GetStateFunc())
            }, 1000)
          }
        }
      }
    ])(GetDispatchFunc(), GetStateFunc())
  }
}

export const AddAgentUser = {
  type: 'add-agent-user',
  methodType: 'Add User Agent',
  method: () => {
    let userId = null
    PerformGraphOperation([
      {
        operation: ADD_NEW_NODE,
        options: function () {
          return {
            nodeType: NodeTypes.Model,
            callback: node => {
              userId = node.id
            },
            properties: {
              [NodeProperties.UIText]: `User`,
              [NodeProperties.IsUser]: true
            }
          }
        }
      },
      {
        operation: ADD_NEW_NODE,
        options: function () {
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
          }
        }
      }
    ])(GetDispatchFunc(), GetStateFunc())
  }
}

export function CreatePagingSkipDataChains () {
  var result = {}
  var skipResult = false
  let arrayLengthNode = null
  let defaultPagingValue = null
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.IsDataChainPagingSkip]: true,
            [NodeProperties.EntryPoint]: true
          },
          graph
        )
        if (model) {
          result.pagingSkip = model.id
          skipResult = true
          return false
        }
        return {
          nodeType: NodeTypes.DataChain,
          callback: node => {
            result.pagingSkip = node.id
          },

          properties: {
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.UIText]: 'Paging Skip',
            [NodeProperties.Pinned]: false,
            [NodeProperties.IsDataChainPagingSkip]: true,
            [NodeProperties.EntryPoint]: true
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        if (skipResult) {
          return false
        }
        let temp = SplitDataCommand(
          GetNodeById(result.pagingSkip, graph),
          split => {
            result.pagingSkipOuput = split.id
          },
          {
            [NodeProperties.Pinned]: false,
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.UIText]: 'Paging Skip Ouput',
            [NodeProperties.AsOutput]: true
          }
        )

        return temp.options
      }
    },
    function (graph) {
      if (skipResult) {
        return false
      }
      return InsertNodeInbetween(
        GetNodeById(result.pagingSkip, graph),
        result.pagingSkipOuput,
        graph,
        insertedNode => {
          arrayLengthNode = insertedNode.id
        },
        {
          [NodeProperties.Pinned]: false
        }
      )
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipResult) {
          return false
        }
        return {
          prop: NodeProperties.DataChainFunctionType,
          value: DataChainFunctionKeys.ArrayLength,
          id: arrayLengthNode
        }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipResult) {
          return false
        }
        return {
          prop: NodeProperties.UIText,
          value: `Paging ${DataChainFunctionKeys.ArrayLength}`,
          id: arrayLengthNode
        }
      }
    },
    function (graph) {
      if (skipResult) {
        return false
      }

      return InsertNodeInbetween(
        GetNodeById(arrayLengthNode, graph),
        result.pagingSkipOuput,
        graph,
        insertedNode => {
          defaultPagingValue = insertedNode.id
        },
        {
          [NodeProperties.Pinned]: false
        }
      )
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipResult) {
          return false
        }
        return {
          prop: NodeProperties.DataChainFunctionType,
          value: DataChainFunctionKeys.NumericalDefault,
          id: defaultPagingValue
        }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipResult) {
          return false
        }
        return {
          prop: NodeProperties.UIText,
          value: `Paging ${DataChainFunctionKeys.NumericalDefault}`,
          id: defaultPagingValue
        }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipResult) {
          return false
        }
        return {
          prop: NodeProperties.NumberParameter,
          value: '0',
          id: defaultPagingValue
        }
      }
    }
  ])(GetDispatchFunc(), GetStateFunc())
  return result
}
export function CreatePagingTakeDataChains () {
  var result = {}
  var skipTake = false
  let defaultPagingValue = null
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.IsDataChainPagingTake]: true,
            [NodeProperties.EntryPoint]: true
          },
          graph
        )
        if (model) {
          result.pagingTake = model.id
          skipTake = true
          return false
        }
        return {
          nodeType: NodeTypes.DataChain,
          callback: node => {
            result.pagingTake = node.id
          },

          properties: {
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.UIText]: 'Paging Take',
            [NodeProperties.Pinned]: false,
            [NodeProperties.IsDataChainPagingTake]: true,
            [NodeProperties.EntryPoint]: true
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        if (skipTake) {
          return false
        }

        let temp = SplitDataCommand(
          GetNodeById(result.pagingTake, graph),
          split => {
            result.pagingTakeOuput = split.id
          },
          {
            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
            [NodeProperties.Pinned]: false,
            [NodeProperties.UIText]: 'Paging Take Ouput',
            [NodeProperties.AsOutput]: true
          }
        )

        return temp.options
      }
    },
    function (graph) {
      if (skipTake) {
        return false
      }

      return InsertNodeInbetween(
        GetNodeById(result.pagingTake, graph),
        result.pagingTakeOuput,
        graph,
        insertedNode => {
          defaultPagingValue = insertedNode.id
        }
      )
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipTake) {
          return false
        }
        return {
          prop: NodeProperties.DataChainFunctionType,
          value: DataChainFunctionKeys.NumericalDefault,
          id: defaultPagingValue
        }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipTake) {
          return false
        }
        return {
          prop: NodeProperties.UIText,
          value: `Paging ${DataChainFunctionKeys.NumericalDefault}`,
          id: defaultPagingValue
        }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipTake) {
          return false
        }
        return {
          prop: NodeProperties.NumberParameter,
          value: '50',
          id: defaultPagingValue
        }
      }
    },
    {
      operation: CHANGE_NODE_PROPERTY,
      options: function (graph) {
        if (skipTake) {
          return false
        }
        return {
          prop: NodeProperties.Pinned,
          value: false,
          id: defaultPagingValue
        }
      }
    }
  ])(GetDispatchFunc(), GetStateFunc())
  return result
}
export function CreateScreenModel (viewModel, options = { isList: true }) {
  var result = {}
  let pageModelId = null
  let skip = false
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let $node = GetNodeByProperties(
          {
            [NodeProperties.ExcludeFromController]: true,
            [NodeProperties.UIText]: viewModel + ' Model',
            [NodeProperties.IsViewModel]: true
          },
          graph
        )
        if ($node) {
          pageModelId = $node.id
          result.model = pageModelId
          skip = true
          return false
        }
        return {
          nodeType: NodeTypes.Model,
          callback: pageModel => {
            pageModelId = pageModel.id
            result.model = pageModelId
          },

          properties: {
            [NodeProperties.Pinned]: false,
            [NodeProperties.ExcludeFromController]: true,
            [NodeProperties.UIText]: viewModel + ' Model',
            [NodeProperties.IsViewModel]: true
          }
        }
      }
    },
    options && options.isList
      ? {
        operation: ADD_NEW_NODE,
        options: function (graph) {
          if (skip) {
            return false
          }
          return {
            nodeType: NodeTypes.Property,
            callback: skipModel => {
              result.list = skipModel.id
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
          }
        }
      }
      : false
  ])(GetDispatchFunc(), GetStateFunc())

  return result
}

export function createViewPagingDataChain (
  newItems,
  viewName,
  viewPackage,
  skipChain = true
) {
  let skip = false
  let skipOrTake = skipChain ? 'Skip' : 'Take'
  return function () {
    return [
      {
        // The data chain for a list screen
        operation: ADD_NEW_NODE,
        options: function (graph) {
          let $node = GetNodeByProperties(
            {
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
              [NodeProperties.PagingTake]: !skipChain,
              [NodeProperties.EntryPoint]: true
            },
            graph
          )
          if ($node) {
            newItems.pagingEntry = $node.id
            skip = true
            return false
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
              newItems.pagingEntry = res.id
            }
          }
        }
      },
      {
        operation: ADD_NEW_NODE,
        options: function (graph) {
          if (skip) {
            return false
          }
          let $node = GetNodeByProperties(
            {
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.ReferenceDataChain,
              [NodeProperties.UIText]: `${viewName} ${skipOrTake} VM Ref`,
              [NodeProperties.DataChainReference]: newItems.screenListDataChain
            },
            graph
          )
          if ($node) {
            newItems.viewModelListRefNode = $node.id
            return false
          }
          let temp = SplitDataCommand(
            GetNodeById(newItems.pagingEntry, graph),
            split => {
              newItems.viewModelListRefNode = split.id
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
          )
          return temp.options
        }
      },
      {
        operation: ADD_LINK_BETWEEN_NODES,
        options: function (graph) {
          if (skip) {
            return false
          }
          if (newItems.screenListDataChainAlreadyMade) {
            return false
          }

          return {
            target: newItems.viewModelListRefNode,
            source: newItems.screenListDataChain,
            properties: { ...LinkProperties.DataChainLink }
          }
        }
      },
      {
        operation: ADD_NEW_NODE,
        options: function (graph) {
          if (skip) {
            return false
          }
          let groupProperties = GetNodeProp(
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
            : null
          let model = GetNodeByProperties(
            {
              [skipChain
                ? NodeProperties.IsDataChainPagingSkip
                : NodeProperties.IsDataChainPagingTake]: true,
              [NodeProperties.EntryPoint]: true
            },
            graph
          )

          let $node = GetNodeByProperties(
            {
              [NodeProperties.UIText]: `${viewName} ${skipOrTake} Paging Ref`,
              [NodeProperties.DataChainFunctionType]:
                DataChainFunctionKeys.ReferenceDataChain,
              [NodeProperties.DataChainReference]: model ? model.id : null,
              [NodeProperties.ChainParent]: newItems.viewModelListRefNode
            },
            graph
          )
          if ($node) {
            newItems.pagingRefNode = $node.id
            return false
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
              newItems.pagingRefNode = v.id
            }
          }
        }
      },
      {
        operation: ADD_LINK_BETWEEN_NODES,
        options: function (graph) {
          if (skip) {
            return false
          }
          let model = GetNodeByProperties(
            {
              [skipChain
                ? NodeProperties.IsDataChainPagingSkip
                : NodeProperties.IsDataChainPagingTake]: true,
              [NodeProperties.EntryPoint]: true
            },
            graph
          )

          return {
            target: newItems.pagingRefNode,
            source: model ? model.id : null,
            properties: { ...LinkProperties.DataChainLink }
          }
        }
      },
      {
        operation: ADD_NEW_NODE,
        options: function (graph) {
          if (skip) {
            return false
          }
          let groupProperties = GetNodeProp(
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
            : null
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
          }
        }
      }
    ]
  }
}
export function CreatePagingModel () {
  var result = null
  let pageModelId = null
  let skipModelId = null
  let takeModelId = null
  let filterModelId = null
  let sortModelId = null
  PerformGraphOperation([
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.IsPagingModel]: true,
            [NodeProperties.NODEType]: NodeTypes.Model
          },
          graph
        )
        if (model) {
          pageModelId = model.id
          return false
        }
        return {
          nodeType: NodeTypes.Model,
          callback: pageModel => {
            pageModelId = pageModel.id
          },

          properties: {
            [NodeProperties.ExcludeFromController]: true,
            [NodeProperties.UIText]: 'Paging Model',
            [NodeProperties.Pinned]: false,
            [NodeProperties.IsPagingModel]: true
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.PagingSkip]: true,
            [NodeProperties.NODEType]: NodeTypes.Property
          },
          graph
        )
        if (model) {
          skipModelId = model.id
          return false
        }
        return {
          nodeType: NodeTypes.Property,
          callback: skipModel => {
            skipModelId = skipModel.id
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
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.PagingTake]: true,
            [NodeProperties.NODEType]: NodeTypes.Property
          },
          graph
        )
        if (model) {
          takeModelId = model.id
          return false
        }
        return {
          nodeType: NodeTypes.Property,
          callback: takeModel => {
            takeModelId = takeModel.id
          },
          parent: pageModelId,
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: 'Take',
            [NodeProperties.Pinned]: false,
            [NodeProperties.PagingTake]: true
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.PagingFilter]: true,
            [NodeProperties.NODEType]: NodeTypes.Property
          },
          graph
        )
        if (model) {
          filterModelId = model.id
          return false
        }
        return {
          nodeType: NodeTypes.Property,
          callback: filterModel => {
            filterModelId = filterModel.id
          },
          parent: pageModelId,
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: 'Filter',
            [NodeProperties.Pinned]: false,
            [NodeProperties.PagingFilter]: true
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (graph) {
        let model = GetNodeByProperties(
          {
            [NodeProperties.PagingSort]: true,
            [NodeProperties.NODEType]: NodeTypes.Property
          },
          graph
        )
        if (model) {
          sortModelId = model.id
          return false
        }
        return {
          nodeType: NodeTypes.Property,
          callback: sortModel => {
            sortModelId = sortModel.id
          },
          parent: pageModelId,
          groupProperties: {},
          properties: {
            [NodeProperties.ExcludeFromController]: true,
            [NodeProperties.UIText]: 'Sort',
            [NodeProperties.Pinned]: false,
            [NodeProperties.PagingSort]: true
          }
        }
      }
    }
  ])(GetDispatchFunc(), GetStateFunc())
  result = {
    pageModelId,
    skipModelId,
    takeModelId,
    filterModelId,
    sortModelId
  }

  return result
}
export const CreateDefaultView = {
  type: 'Create View - Form',
  methodType: 'React Native Views',
  method: function (_args) {
    let default_View_method = (args = {}) => {
      let {
        viewName,
        viewType,
        isDefaultComponent,
        uiType = UITypes.ReactNative,
        isSharedComponent,
        isPluralComponent,
        isList,
        model,
        chosenChildren = []
      } = args
      let state = GetState()
      var currentNode = model || Node(state, Visual(state, SELECTED_NODE))
      let screenNodeId = null
      let screenComponentId = null
      let listComponentId = null
      let screenNodeOptionId = null
      let childComponents = []
      let modelComponentSelectors = []
      let modelComponentDataChains = []
      let layout = null
      let listLayout = null
      let viewModelNodeDirtyId = null
      let viewModelNodeFocusId = null
      let viewModelNodeBlurId = null
      let viewModelNodeFocusedId = null
      let viewModelNodeId = null
      let createConnections = []
      let createListConnections = []
      viewName = viewName || GetNodeTitle(currentNode)
      let useModelInstance = [
        ViewTypes.Get,
        ViewTypes.GetAll,
        ViewTypes.Delete
      ].some(v => viewType === v)
      let viewPackage = {
        [NodeProperties.ViewPackage]: uuidv4(),
        [NodeProperties.ViewPackageTitle]: viewName
      }
      let newItems = {}
      let viewComponentType = null
      let viewComponent = null
      let multi_item_component = ComponentTypes[uiType].List.key
      switch (viewType) {
        case ViewTypes.Get:
        case ViewTypes.GetAll:
        case ViewTypes.Delete:
          viewComponentType = ComponentTypes[uiType].Text.key
          viewComponent = ComponentTypes[uiType].Text
          if (isPluralComponent && isSharedComponent) {
            isList = true
          } else if (isSharedComponent) {
            isList = false
          }
          break
        default:
          viewComponentType = ComponentTypes[uiType].Input.key
          viewComponent = ComponentTypes[uiType].Input
          if (isPluralComponent && isSharedComponent) {
            isList = true
            viewComponentType = ComponentTypes[uiType].Text.key
            multi_item_component = ComponentTypes[uiType].MultiSelectList.key
            viewComponent = ComponentTypes[uiType].Text
          }
          break
      }
      let dataSourceId
      let vmsIds = () => [
        viewModelNodeDirtyId,
        viewModelNodeFocusId,
        viewModelNodeBlurId,
        viewModelNodeFocusedId,
        viewModelNodeId
      ]
      if (
        GetNodeProp(currentNode, NodeProperties.NODEType) === NodeTypes.Model
      ) {
        let modelChildren = GetModelPropertyChildren(currentNode.id)
        newItems.currentNode = currentNode.id
        if (chosenChildren && chosenChildren.length) {
          modelChildren = modelChildren.filter(x =>
            chosenChildren.some(v => v === x.id)
          )
        }
        let modelProperties = modelChildren.filter(
          x => !GetNodeProp(x, NodeProperties.IsDefaultProperty)
        )
        childComponents = modelProperties.map(v => null)
        let apiListLinkOperations = []
        let screenComponentEvents = []
        let pagingModelAndProperties = null
        let pagingSkipChains = null
        let pagingTakeChains = null
        if (isList) {
          pagingModelAndProperties = CreatePagingModel()
          pagingSkipChains = CreatePagingSkipDataChains()
          pagingTakeChains = CreatePagingTakeDataChains()
        }
        let pageViewModel = null
        if (!isSharedComponent) {
          pageViewModel = CreateScreenModel(viewName)
        }
        PerformGraphOperation(
          [
            !isSharedComponent
              ? {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  let res = GetNodesByProperties(
                    {
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance,
                      [NodeProperties.UIText]: `${viewName} Form`,
                      [NodeProperties.Model]: currentNode.id
                    },
                    graph
                  ).find(x => x)
                  if (res) {
                    screenNodeId = res.id
                    newItems.screenNodeId = res.id
                    return false
                  }
                  return {
                    nodeType: NodeTypes.Screen,
                    callback: screenNode => {
                      screenNodeId = screenNode.id
                      newItems.screenNodeId = screenNode.id
                    },
                    properties: {
                      ...viewPackage,
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance,
                      [NodeProperties.UIText]: `${viewName} Form`,
                      [NodeProperties.Model]: currentNode.id
                    }
                  }
                }
              }
              : false,
            !isSharedComponent
              ? function (graph) {
                return addComponentApiToForm({
                  newItems,
                  text: 'value',
                  parent: newItems.screenNodeId,
                  graph,
                  isSingular: true
                })
              }
              : null,
            !isSharedComponent
              ? function (graph) {
                return addComponentApiToForm({
                  newItems,
                  text: 'viewModel',
                  parent: newItems.screenNodeId,
                  graph,
                  isSingular: true,
                  internalProperties: {
                    [NodeProperties.DefaultComponentApiValue]: useModelInstance
                      ? false
                      : GetCodeName(newItems.screenNodeId)
                  }
                })
              }
              : null,
            !isSharedComponent && isList
              ? {
                // The selector for a list screen
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  let $node = GetNodeByProperties(
                    {
                      [NodeProperties.UIText]: `${viewName} Screen View Model`,
                      [NodeProperties.InstanceType]: InstanceTypes.AppState,
                      [NodeProperties.Model]: pageViewModel.model,
                      [NodeProperties.NODEType]: NodeTypes.ViewModel
                    },
                    graph
                  )
                  if ($node) {
                    newItems.screenViewModel = $node.id
                    return false
                  }

                  return {
                    nodeType: NodeTypes.ViewModel,
                    properties: {
                      [NodeProperties.UIText]: `${viewName} Screen View Model`,
                      [NodeProperties.InstanceType]: InstanceTypes.AppState,
                      [NodeProperties.Pinned]: false,
                      [NodeProperties.Model]: pageViewModel.model
                    },
                    links: [
                      {
                        target: pageViewModel.model,
                        linkProperties: {
                          properties: { ...LinkProperties.ViewModelLink }
                        }
                      }
                    ],
                    callback: res => {
                      newItems.screenViewModel = res.id
                    }
                  }
                }
              }
              : false,
            {
              operation: ADD_NEW_NODE,
              options: function (graph) {
                let $node = GetNodeByProperties(
                  {
                    [NodeProperties.UIText]: `Title Service`,
                    [NodeProperties.NODEType]: NodeTypes.TitleService
                  },
                  graph
                )
                if ($node) {
                  newItems.titleService = $node.id
                  return false
                }
                return {
                  nodeType: NodeTypes.TitleService,
                  properties: {
                    [NodeProperties.Pinned]: false,
                    [NodeProperties.UIText]: `Title Service`
                  },

                  callback: res => {
                    newItems.titleService = res.id
                  }
                }
              }
            },
            !isSharedComponent && isList
              ? {
                // The selector for a list screen
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  let $node = GetNodeByProperties(
                    {
                      [NodeProperties.UIText]: `${viewName} Screen Selector`,
                      [NodeProperties.NODEType]: NodeTypes.Selector
                    },
                    graph
                  )
                  if ($node) {
                    newItems.screenSelector = $node.id
                    return false
                  }
                  return {
                    nodeType: NodeTypes.Selector,
                    properties: {
                      [NodeProperties.Pinned]: false,
                      [NodeProperties.UIText]: `${viewName} Screen Selector`
                    },
                    links: [
                      {
                        target: newItems.screenViewModel,
                        linkProperties: {
                          properties: { ...LinkProperties.SelectorLink }
                        }
                      }
                    ],
                    callback: res => {
                      newItems.screenSelector = res.id
                    }
                  }
                }
              }
              : false,
            !isSharedComponent && isList
              ? {
                // The data chain for a list screen
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  let $node = GetNodeByProperties(
                    {
                      [NodeProperties.UIText]: `${viewName} Screen DC`,
                      [NodeProperties.DataChainFunctionType]:
                          DataChainFunctionKeys.Selector,
                      [NodeProperties.Selector]: newItems.screenSelector,
                      [NodeProperties.EntryPoint]: true,
                      [NodeProperties.SelectorProperty]:
                          SelectorPropertyKeys.Object
                    },
                    graph
                  )
                  if ($node) {
                    newItems.screenListDataChain = $node.id
                    newItems.screenListDataChainAlreadyMade = true
                    return false
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
                      },
                      {
                        target: newItems.screenViewModel,
                        linkProperties: {
                          properties: { ...LinkProperties.DataChainLink }
                        }
                      }
                    ],
                    callback: res => {
                      newItems.screenListDataChain = res.id
                    }
                  }
                }
              }
              : false,

            !isSharedComponent
              ? {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  let res = GetNodesByProperties(
                    {
                      [NodeProperties.Model]: currentNode.id,
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance,
                      [NodeProperties.NODEType]: NodeTypes.ViewModel
                    },
                    graph
                  )
                  if (res && res.length) {
                    viewModelNodeId = res[0].id
                    return false
                  }
                  return {
                    nodeType: NodeTypes.ViewModel,
                    callback: viewModelNode => {
                      viewModelNodeId = viewModelNode.id
                    },
                    properties: {
                      ...viewPackage,
                      [NodeProperties.UIText]: `${viewName} VM ${
                        useModelInstance
                          ? InstanceTypes.ModelInstance
                          : InstanceTypes.ScreenInstance
                      }`,
                      [NodeProperties.Model]: currentNode.id,
                      [NodeProperties.Pinned]: false,
                      [NodeProperties.InstanceType]: useModelInstance
                        ? InstanceTypes.ModelInstance
                        : InstanceTypes.ScreenInstance
                    },
                    links: [
                      {
                        target: currentNode.id,
                        linkProperties: {
                          properties: { ...LinkProperties.ViewModelLink }
                        }
                      }
                    ]
                  }
                }
              }
              : false,
            !isSharedComponent
              ? {
                operation: NEW_SCREEN_OPTIONS,
                options: function () {
                  let formLayout = CreateLayout()
                  formLayout = SetCellsLayout(formLayout, 1)
                  let rootCellId = GetFirstCell(formLayout)
                  let cellProperties = GetCellProperties(
                    formLayout,
                    rootCellId
                  )
                  cellProperties.style = {
                    ...cellProperties.style,
                    flexDirection: 'column'
                  }

                  let componentProps = null

                  if (useModelInstance) {
                    componentProps = createComponentApi()
                    GENERAL_COMPONENT_API.map(x => {
                      componentProps = addComponentApi(componentProps, {
                        modelProp: x.property
                      })
                    })
                    GENERAL_COMPONENT_API.map(t => {
                      let apiProperty = t.property
                        ;(function () {
                        let rootCellId = GetFirstCell(formLayout)
                        let cellProperties = GetCellProperties(
                          formLayout,
                          rootCellId
                        )
                        cellProperties.componentApi =
                            cellProperties.componentApi || {}
                        cellProperties.componentApi[apiProperty] = {
                          instanceType: InstanceTypes.ApiProperty,
                          apiProperty
                        }
                      })()
                    })
                  }
                  return {
                    callback: screenOptionNode => {
                      screenNodeOptionId = screenOptionNode.id
                      newItems.screenNodeOptionId = screenNodeOptionId
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
                  }
                }
              }
              : false,
            !isSharedComponent
              ? function () {
                return addComponentApiToForm({
                  newItems,
                  text: 'value',
                  parent: newItems.screenNodeOptionId
                })
              }
              : null,
            !isSharedComponent
              ? function () {
                return addComponentApiToForm({
                  newItems,
                  text: 'viewModel',
                  parent: newItems.screenNodeOptionId
                })
              }
              : null,
            !isSharedComponent
              ? function () {
                return connectComponentToExternalApi({
                  newItems,
                  parent: newItems.screenNodeId,
                  key: 'value',
                  properties: LinkProperties.ComponentExternalConnection,
                  child: newItems.screenNodeOptionId
                })
              }
              : null,
            !isSharedComponent
              ? function () {
                return connectComponentToExternalApi({
                  newItems,
                  parent: newItems.screenNodeId,
                  properties: LinkProperties.ComponentExternalConnection,
                  key: 'viewModel',
                  child: newItems.screenNodeOptionId
                })
              }
              : null,
            ...(!isSharedComponent
              ? SCREEN_COMPONENT_EVENTS.map(t => {
                return {
                  operation: ADD_NEW_NODE,
                  options: function () {
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
                        screenComponentEvents.push(screenNode.id)
                      }
                    }
                  }
                }
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
                options: function (currentGraph) {
                  listLayout = CreateLayout()
                  listLayout = SetCellsLayout(listLayout, 1)
                  let rootCellId = GetFirstCell(listLayout)
                  let cellProperties = GetCellProperties(
                    listLayout,
                    rootCellId
                  )
                  cellProperties.style = {
                    ...cellProperties.style,
                    flexDirection: 'column'
                  }
                  let componentProps = null

                  let connectto = []
                  if (isDefaultComponent) {
                    connectto = getViewTypeEndpointsForDefaults(
                      viewType,
                      currentGraph,
                      currentNode.id
                    )
                  }
                  return {
                    callback: listComponent => {
                      listComponentId = listComponent.id
                      newItems.listComponentId = listComponentId
                      connectto.map(ct => {
                        createListConnections.push(
                          function () {
                            return setSharedComponent({
                              properties: {
                                ...LinkProperties.DefaultViewType,
                                viewType,
                                uiType
                              },
                              viewType,
                              uiType,
                              source: ct.id,
                              target: listComponentId
                            })(GetDispatchFunc(), GetStateFunc())
                          },
                          function () {
                            PerformGraphOperation([
                              ...[
                                'value',
                                'viewModel',
                                'label',
                                'error',
                                'success'
                              ].map(
                                v =>
                                  function () {
                                    let graph = GetCurrentGraph(
                                      GetStateFunc()()
                                    )
                                    return addComponentApiToForm({
                                      newItems,
                                      text: v,
                                      parent: ct.id,
                                      isSingular: true,
                                      graph
                                    })
                                  }
                              )
                            ])(GetDispatchFunc(), GetStateFunc())
                          }
                        )
                      })
                    },
                    parent: screenNodeOptionId,
                    properties: {
                      ...viewPackage,
                      [NodeProperties.UIText]: `${viewName} ${multi_item_component}`,
                      [NodeProperties.UIType]: uiType,
                      [NodeProperties.ViewType]: viewType,
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
                  }
                }
              }
              : false,
            isList
              ? function () {
                return addListItemComponentApi(
                  newItems,
                  'viewModel',
                  false,
                  (v, _i) => {
                    newItems.componentItemListViewModel = _i
                  },
                  newItems.listComponentId,
                  { useAsValue: false }
                )
              }
              : null,
            ...['index', 'separators', 'value'].map(text => {
              return function () {
                if (!isList) {
                  return []
                }
                return addListItemComponentApi(
                  newItems,
                  text,
                  true,
                  (v, _i) => {
                    newItems['list' + v] = _i
                  },
                  newItems.listComponentId,
                  { useAsValue: false }
                )
              }
            }),
            isList
              ? {
                operation: ADD_NEW_NODE,
                options: function (currentGraph) {
                  return {
                    nodeType: NodeTypes.ComponentApi,
                    callback: nn => {
                      newItems.listComponentInternalApi = nn.id
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
                  }
                }
              }
              : null,
            isList
              ? {
                operation: ADD_NEW_NODE,
                options: function (currentGraph) {
                  return {
                    nodeType: NodeTypes.ComponentExternalApi,
                    callback: nn => {
                      newItems.listComponentExternalApi = nn.id
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
                  }
                }
              }
              : null,
            isList
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function () {
                  return {
                    source: newItems.listComponentInternalApi,
                    target: newItems.listComponentExternalApi,
                    properties: {
                      ...LinkProperties.ComponentInternalConnection
                    }
                  }
                }
              }
              : null,
            isList && !isSharedComponent
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function () {
                  return {
                    source: newItems.listComponentExternalApi,
                    target: getApiConnectors(
                      newItems,
                      newItems.screenNodeOptionId,
                      'value'
                    ).internalId,
                    properties: {
                      ...LinkProperties.ComponentExternalConnection
                    }
                  }
                }
              }
              : null,
            isList
              ? {
                operation: NEW_DATA_SOURCE,
                options: function (currentGraph) {
                  let res = GetNodesByProperties(
                    {
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
                    currentGraph
                  )
                  if (res && res.length) {
                    dataSourceId = res[0].id
                    return false
                  }

                  return {
                    parent: listComponentId,
                    callback: dataSource => {
                      dataSourceId = dataSource.id
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
                  }
                }
              }
              : false,
            {
              operation: NEW_COMPONENT_NODE,
              options: function (currentGraph) {
                layout = CreateLayout()
                layout = SetCellsLayout(layout, 1)
                let rootCellId = GetFirstCell(layout)
                let cellProperties = GetCellProperties(layout, rootCellId)
                cellProperties.style = {
                  ...cellProperties.style,
                  flexDirection: 'column'
                }
                let propertyCount = modelProperties.length + 1
                let componentProps = null

                layout = SetCellsLayout(layout, propertyCount, rootCellId)
                let connectto = []
                if (isDefaultComponent && !isList) {
                  connectto = getViewTypeEndpointsForDefaults(
                    viewType,
                    currentGraph,
                    currentNode.id
                  )
                }
                return {
                  callback: screenComponent => {
                    screenComponentId = screenComponent.id
                    newItems.screenComponentId = screenComponentId
                    connectto.map(ct => {
                      createConnections.push(function () {
                        return setSharedComponent({
                          properties: {
                            ...LinkProperties.DefaultViewType,
                            viewType,
                            uiType
                          },
                          source: ct.id,
                          target: screenComponentId,
                          viewType,
                          uiType
                        })(GetDispatchFunc(), GetStateFunc())
                      })
                    })
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
                }
              }
            },

            function () {
              return addListItemComponentApi(
                newItems,
                'viewModel',
                false,
                (v, _i) => {
                  newItems.componentViewModelApiIds = _i
                },
                newItems.screenComponentId,
                { useAsValue: false }
              )
            },
            isList
              ? function () {
                if (!isList) {
                  return []
                }
                return {
                  operation: ADD_LINK_BETWEEN_NODES,
                  options: function () {
                    return {
                      target: newItems.componentItemListViewModel.internalId,
                      source: newItems.componentViewModelApiIds.externalId,
                      properties: {
                        ...LinkProperties.ComponentExternalConnection
                      }
                    }
                  }
                }
              }
              : null,

            ...['index', 'separators'].map(text => {
              return function () {
                if (!isList) {
                  return []
                }
                return [
                  ...addListItemComponentApi(
                    newItems,
                    text,
                    false,
                    (v, _i) => {
                      newItems['listItem' + v] = _i
                    },
                    newItems.screenComponentId
                  )
                ]
              }
            }),

            ...['index', 'separators'].map(text => {
              return function () {
                if (!isList) {
                  return []
                }
                return {
                  operation: ADD_LINK_BETWEEN_NODES,
                  options: function () {
                    return {
                      target: newItems['list' + text].internalId,
                      source: newItems['listItem' + text].externalId,
                      properties: {
                        ...LinkProperties.ComponentExternalConnection
                      }
                    }
                  }
                }
              }
            }),
            {
              operation: ADD_NEW_NODE,
              options: function (currentGraph) {
                return {
                  nodeType: NodeTypes.ComponentApi,
                  callback: nn => {
                    newItems.screenComponentIdInternalApi = nn.id
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
                }
              }
            },
            {
              operation: ADD_NEW_NODE,
              options: function (currentGraph) {
                return {
                  nodeType: NodeTypes.ComponentExternalApi,
                  callback: nn => {
                    newItems.screenComponentIdExternalApi = nn.id
                    setApiConnectors(
                      newItems,
                      newItems.screenComponentId,
                      {
                        externalId: nn.id,
                        internalId: newItems.screenComponentIdInternalApi
                      },
                      'value'
                    )
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
                }
              }
            },
            {
              operation: ADD_LINK_BETWEEN_NODES,
              options: function () {
                return {
                  source: getApiConnectors(
                    newItems,
                    newItems.screenComponentId,
                    'value'
                  ).internalId,
                  target: getApiConnectors(
                    newItems,
                    newItems.screenComponentId,
                    'value'
                  ).externalId,
                  properties: {
                    ...LinkProperties.ComponentInternalConnection
                  }
                }
              }
            },
            !isSharedComponent
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function () {
                  if (screenNodeOptionId || listComponentId) {
                    return {
                      source: getApiConnectors(
                        newItems,
                        newItems.screenComponentId,
                        'value'
                      ).externalId,
                      target: getApiConnectors(
                        newItems,
                        isList ? listComponentId : screenNodeOptionId,
                        'value'
                      ).internalId,
                      properties: {
                        ...LinkProperties.ComponentExternalConnection
                      }
                    }
                  }
                }
              }
              : false,
            !isSharedComponent
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function () {
                  if (screenNodeOptionId || listComponentId) {
                    return {
                      source: getApiConnectors(
                        newItems,
                        newItems.screenComponentId,
                        'viewModel'
                      ).externalId,
                      target: getApiConnectors(
                        newItems,
                        isList ? listComponentId : screenNodeOptionId,
                        'viewModel'
                      ).internalId,
                      properties: {
                        ...LinkProperties.ComponentExternalConnection
                      }
                    }
                  }
                }
              }
              : null,
            !isSharedComponent
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (currentGraph) {
                  let formLayout = GetNodeProp(
                    screenNodeOptionId,
                    NodeProperties.Layout,
                    currentGraph
                  )
                  let rootCellId = GetFirstCell(formLayout)
                  let cellProperties = GetCellProperties(
                    formLayout,
                    rootCellId
                  )
                  cellProperties.children[rootCellId] = isList
                    ? listComponentId
                    : screenComponentId

                  return {
                    prop: NodeProperties.Layout,
                    value: formLayout,
                    id: screenNodeOptionId
                  }
                }
              }
              : false,

            isList
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (currentGraph) {
                  let formLayout = GetNodeProp(
                    listComponentId,
                    NodeProperties.Layout,
                    currentGraph
                  )
                  let rootCellId = GetFirstCell(formLayout)
                  let cellProperties = GetCellProperties(
                    formLayout,
                    rootCellId
                  )
                  cellProperties.children[rootCellId] = screenComponentId

                  return {
                    prop: NodeProperties.Layout,
                    value: formLayout,
                    id: listComponentId
                  }
                }
              }
              : false,
            ...modelProperties
              .map((modelProperty, modelIndex) => {
                let sharedComponent = GetSharedComponentFor(
                  viewType,
                  modelProperty,
                  currentNode.id
                )
                if (!sharedComponent) {
                  switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                    case NodeTypes.Model:
                      return {}
                    case NodeTypes.Property:
                      if (
                        GetNodeProp(
                          modelProperty,
                          NodeProperties.UseModelAsType
                        )
                      ) {
                        // if the property is a model reference, it should be a shared component or something.
                        return {}
                      }
                      break
                  }
                } else {
                  childComponents[modelIndex] = sharedComponent
                  return [
                    ...['value', 'viewModel', 'label', 'error', 'success'].map(
                      v =>
                        function () {
                          let graph = GetCurrentGraph(GetStateFunc()())
                          return addComponentApiToForm({
                            newItems,
                            text: v,
                            parent: sharedComponent,
                            isSingular: true,
                            graph
                          })
                        }
                    )
                  ]
                  return {}
                }

                return [
                  {
                    operation: NEW_COMPONENT_NODE,
                    options: function () {
                      let componentTypeToUse = viewComponentType

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
                        callback: component => {
                          childComponents[modelIndex] = component.id
                        }
                      }
                    }
                  },

                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      viewComponent
                    )
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      viewComponent,
                      'label'
                    )
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      viewComponent,
                      'error'
                    )
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      viewComponent,
                      'success'
                    )
                  },
                  function () {
                    return addComponentApiNodes(
                      newItems,
                      childComponents,
                      modelIndex,
                      viewComponent,
                      'viewModel',
                      newItems.componentViewModelApiIds.internalId
                    )
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
                    })
                  },

                  ...['value', 'viewModel', 'label', 'error', 'success']
                    .map(v => {
                      return function (graph) {
                        let connectto = []
                        if (isDefaultComponent) {
                          connectto = getViewTypeEndpointsForDefaults(
                            viewType,
                            graph,
                            currentNode.id
                          )
                        }

                        let shared_to_component_commands = []
                        connectto.map(ct => {
                          shared_to_component_commands.push(
                            ...addComponentApiToForm({
                              newItems,
                              text: v,
                              parent: ct.id,
                              isSingular: true,
                              graph
                            })
                          )
                        })
                        return shared_to_component_commands.flatten()
                      }
                    })
                    .filter(x => x && isSharedComponent && isDefaultComponent),

                  isSharedComponent && isDefaultComponent
                    ? function (graph) {
                      let connectto = []
                      if (isDefaultComponent) {
                        connectto = getViewTypeEndpointsForDefaults(
                          viewType,
                          graph,
                          currentNode.id
                        )
                      }

                      let shared_to_component_commands = []
                      connectto.map(ct => {
                        let temp = GetNodesLinkedTo(graph, {
                          id: ct.id,
                          link: LinkType.ComponentInternalApi
                        }).filter(
                          x =>
                            GetNodeProp(x, NodeProperties.NODEType) ===
                              NodeTypes.ComponentApi
                        )
                        // && GetNodeProp(x, NodeProperties.UIText) === text
                        temp.map(t => {
                          shared_to_component_commands.push(
                            ...connectComponentToExternalApi({
                              newItems,
                              parent: ct.id,
                              key: GetNodeProp(t, NodeProperties.UIText),
                              properties:
                                  LinkProperties.ComponentExternalConnection,
                              child: childComponents[modelIndex]
                            })
                          )
                        })
                      })
                      return shared_to_component_commands
                    }
                    : null
                ].filter(x => x)
              })
              .flatten(),
            ...modelProperties.map((modelProperty, modelIndex) => {
              return {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function () {
                  let sharedComponent = GetSharedComponentFor(
                    viewType,
                    modelProperty,
                    currentNode.id
                  )
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
                    }
                  }
                }
              }
            }),
            {
              operation: NEW_COMPONENT_NODE,
              options: function () {
                return {
                  parent: screenComponentId,
                  groupProperties: {},
                  properties: {
                    ...viewPackage,
                    [NodeProperties.UIText]: ` ${
                      Titles.Execute
                    } Button ${viewName} Component`,
                    [NodeProperties.UIType]: uiType,
                    [NodeProperties.Pinned]: false,
                    [NodeProperties.Label]: `${viewName} ${Titles.Execute}`,
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
                    childComponents.push(component.id)
                    newItems.button = component.id
                  }
                }
              }
            },
            ...addButtonApiNodes(newItems),
            {
              operation: ADD_NEW_NODE,
              options: function (currentGraph) {
                return {
                  nodeType: NodeTypes.ComponentApi,
                  callback: nn => {
                    newItems.buttonInternalApi = nn.id
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
                }
              }
            },
            {
              operation: ADD_NEW_NODE,
              options: function (currentGraph) {
                return {
                  nodeType: NodeTypes.ComponentExternalApi,
                  callback: nn => {
                    newItems.buttonExternalApi = nn.id
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
                }
              }
            },
            {
              operation: ADD_LINK_BETWEEN_NODES,
              options: function () {
                return {
                  source: newItems.buttonInternalApi,
                  target: newItems.buttonExternalApi,
                  properties: {
                    ...LinkProperties.ComponentInternalConnection
                  }
                }
              }
            },
            {
              operation: ADD_LINK_BETWEEN_NODES,
              options: function () {
                return {
                  target: newItems.screenComponentIdInternalApi,
                  source: newItems.buttonExternalApi,
                  properties: {
                    ...LinkProperties.ComponentExternalConnection
                  }
                }
              }
            },
            function () {
              return addComponentApiToForm({
                newItems,
                text: 'viewModel',
                parent: newItems.button
              })
            },
            function () {
              return connectComponentToExternalApi({
                newItems,
                parent: newItems.screenComponentId,
                key: 'viewModel',
                properties: LinkProperties.ComponentExternalConnection,
                child: newItems.button
              })
            },
            ...ComponentTypes[uiType].Button.eventApi.map(t => {
              return {
                operation: ADD_NEW_NODE,
                options: function () {
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
                  }
                }
              }
            }),
            {
              operation: CHANGE_NODE_PROPERTY,
              options: function () {
                let lastComponent = childComponents.length - 1
                let rootCellId = GetFirstCell(layout)
                let children = GetChildren(layout, rootCellId)
                let childId = children[lastComponent]
                let cellProperties = GetCellProperties(layout, childId)
                cellProperties.children[childId] =
                  childComponents[lastComponent]
                cellProperties.style.flex = null
                cellProperties.style.height = null
                return {
                  prop: NodeProperties.Layout,
                  id: screenComponentId,
                  value: layout
                }
              }
            },
            ...modelProperties.map((modelProperty, modelIndex) => {
              return {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                  let sharedComponent = GetSharedComponentFor(
                    viewType,
                    modelProperty,
                    currentNode.id
                  )
                  if (!sharedComponent) {
                    switch (
                      GetNodeProp(modelProperty, NodeProperties.NODEType)
                    ) {
                      case NodeTypes.Model:
                        return {}
                      case NodeTypes.Property:
                        if (
                          GetNodeProp(
                            modelProperty,
                            NodeProperties.UseModelAsType
                          )
                        ) {
                          let _ui_model_type = GetNodeProp(
                            modelProperty,
                            NodeProperties.UIModelType
                          )
                          if (_ui_model_type) {
                            sharedComponent = GetSharedComponentFor(
                              viewType,
                              modelProperty,
                              _ui_model_type
                            )
                          }
                          if (!sharedComponent) {
                            // if the property is a model reference, it should be a shared component or something.
                            return {}
                          }
                        }
                        break
                    }
                  }

                  let rootCellId = GetFirstCell(layout)
                  let children = GetChildren(layout, rootCellId)
                  let childId = children[modelIndex]
                  let cellProperties = GetCellProperties(layout, childId)
                  cellProperties.children[childId] =
                    sharedComponent || childComponents[modelIndex]
                  cellProperties.style.flex = null
                  cellProperties.style.height = null
                  return {
                    prop: NodeProperties.Layout,
                    id: screenComponentId,
                    value: layout
                  }
                }
              }
            }),
            ...modelProperties.map((modelProperty, modelIndex) => {
              let sharedComponent = GetSharedComponentFor(
                viewType,
                modelProperty,
                currentNode.id
              )
              if (!sharedComponent) {
                switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                  case NodeTypes.Model:
                    return {}
                  case NodeTypes.Property:
                    if (
                      GetNodeProp(modelProperty, NodeProperties.UseModelAsType)
                    ) {
                      // if the property is a model reference, it should be a shared component or something.
                      return {}
                    }
                    break
                }
              }
              return {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  let componentProps = createComponentApi()
                  let componentTypes = ComponentTypes[uiType]
                  let compNodeId = childComponents[modelIndex]
                  let compNode = GetNodeById(compNodeId, graph)
                  let componentType = GetNodeProp(
                    compNode,
                    NodeProperties.ComponentType
                  )
                  if (!sharedComponent && componentTypes[componentType]) {
                    componentTypes[componentType].defaultApi.map(x => {
                      componentProps = addComponentApi(componentProps, {
                        modelProp: x.property
                      })
                    })
                  } else if (sharedComponent) {
                    componentProps = {}
                    //     let { instanceType, model, selector, modelProperty, apiProperty, handlerType, isHandler, dataChain } = apiConfig[i];
                    SHARED_COMPONENT_API.map(x => {
                      componentProps[x.property] = {
                        instanceType: useModelInstance
                          ? InstanceTypes.ModelInstance
                          : InstanceTypes.ScreenInstance,
                        model: currentNode.id,
                        modelProperty: modelProperty.id,
                        handlerType: HandlerTypes.Property
                      }
                    })
                  } else {
                    throw 'sharedComponent should be set'
                  }

                  return {
                    prop: NodeProperties.ComponentApi,
                    id: compNodeId,
                    value: componentProps
                  }
                }
              }
            }),
            {
              operation: CHANGE_NODE_PROPERTY,
              options: function (graph) {
                let componentProps = createComponentApi()
                let componentTypes = ComponentTypes[uiType]
                let compNodeId = childComponents[childComponents.length - 1]
                let compNode = GetNodeById(compNodeId, graph)
                let componentType = GetNodeProp(
                  compNode,
                  NodeProperties.ComponentType
                )
                componentTypes[componentType].defaultApi.map(x => {
                  componentProps = addComponentApi(componentProps, {
                    modelProp: x.property
                  })
                })

                return {
                  prop: NodeProperties.ComponentApi,
                  id: compNodeId,
                  value: componentProps
                }
              }
            }
          ].filter(x => x)
        )(GetDispatchFunc(), GetStateFunc())

        PerformGraphOperation([
          {
            operation: ADD_NEW_NODE,
            options: function (graph) {
              let selectorNode = GetNodesByProperties({
                [NodeProperties.Model]: currentNode.id,
                [NodeProperties.NODEType]: NodeTypes.Selector,
                [NodeProperties.IsShared]: isSharedComponent,
                [NodeProperties.InstanceType]: useModelInstance
              }).find(x => x)
              if (selectorNode) {
                modelComponentSelectors.push(selectorNode.id)
                return false
              }
              return {
                nodeType: NodeTypes.Selector,
                properties: {
                  ...viewPackage,
                  [NodeProperties.UIText]: `${GetNodeTitle(currentNode)}${
                    useModelInstance ? ' Instance' : ''
                  }`,
                  [NodeProperties.Model]: currentNode.id,
                  [NodeProperties.Pinned]: false,
                  [NodeProperties.IsShared]: isSharedComponent,
                  [NodeProperties.InstanceType]: useModelInstance
                },
                links: [
                  ...vmsIds()
                    .filter(x => x)
                    .map(t => ({
                      target: t,
                      linkProperties: {
                        properties: {
                          ...LinkProperties.SelectorLink
                        }
                      }
                    })),
                  {
                    target: currentNode.id,
                    linkProperties: {
                      properties: { ...LinkProperties.ModelTypeLink }
                    }
                  }
                ],
                callback: selector => {
                  modelComponentSelectors.push(selector.id)
                }
              }
            }
          }
        ])(GetDispatchFunc(), GetStateFunc())

        let propertyDataChainAccesors = []

        let datachainLink = []
        let skipModelDataChainListParts = false
        let listDataChainId = null
        let listDataChainExitId = null
        PerformGraphOperation(
          [
            isList
              ? {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  let node = GetNodesByProperties({
                    [NodeProperties.EntryPoint]: true,
                    [NodeProperties.DataChainFunctionType]:
                        DataChainFunctionKeys.Models,
                    [NodeProperties.UIModelType]: currentNode.id
                  }).find(x => x)
                  if (node) {
                    listDataChainId = node.id
                    skipModelDataChainListParts = true
                    return null
                  }

                  return {
                    callback: dataChain => {
                      listDataChainId = dataChain.id
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
                  }
                }
              }
              : false,
            isList
              ? {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                  if (skipModelDataChainListParts) {
                    return null
                  }
                  let temp = SplitDataCommand(
                    GetNodeById(listDataChainId, graph),
                    split => {
                      listDataChainExitId = split.id
                    },
                    viewPackage
                  )
                  return temp.options
                }
              }
              : false,
            isList
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  if (skipModelDataChainListParts) {
                    return null
                  }
                  return {
                    prop: NodeProperties.DataChainFunctionType,
                    id: listDataChainExitId,
                    value: DataChainFunctionKeys.Pass
                  }
                }
              }
              : false,
            isList
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  if (skipModelDataChainListParts) {
                    return null
                  }
                  return {
                    prop: NodeProperties.UIText,
                    id: listDataChainExitId,
                    value: `${GetNodeTitle(currentNode)}s DC Complete`
                  }
                }
              }
              : false,
            isList
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  if (skipModelDataChainListParts) {
                    return null
                  }
                  return {
                    prop: NodeProperties.AsOutput,
                    id: listDataChainExitId,
                    value: true
                  }
                }
              }
              : false,
            isList
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  return {
                    prop: NodeProperties.DataChain,
                    id: dataSourceId,
                    value: listDataChainId
                  }
                }
              }
              : false,
            isList
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function (graph) {
                  return {
                    target: listDataChainId,
                    source: dataSourceId,
                    properties: { ...LinkProperties.DataChainLink }
                  }
                }
              }
              : false,
            isList
              ? {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  return {
                    prop: NodeProperties.UIModelType,
                    id: dataSourceId,
                    value: currentNode.id
                  }
                }
              }
              : false,
            isList
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function (graph) {
                  return {
                    target: currentNode.id,
                    source: dataSourceId,
                    properties: { ...LinkProperties.ModelTypeLink }
                  }
                }
              }
              : false
          ].filter(x => x)
        )(GetDispatchFunc(), GetStateFunc())
        let skipAddingComplete = false
        PerformGraphOperation([
          {
            operation: ADD_NEW_NODE,
            options: function (graph) {
              let viewModelInstanceNode = GetNodeByProperties(
                {
                  [NodeProperties.Model]: currentNode.id,
                  [NodeProperties.InstanceType]: useModelInstance
                    ? InstanceTypes.ModelInstance
                    : InstanceTypes.ScreenInstance,
                  [NodeProperties.NODEType]: NodeTypes.ViewModel
                },
                graph
              )
              if (!viewModelInstanceNode) {
                skipAddingComplete = true
                return null
              }
              let node = GetNodesByProperties(
                {
                  [NodeProperties.UIText]: `Get ${viewName}`,
                  [NodeProperties.DataChainFunctionType]:
                    DataChainFunctionKeys.Selector,
                  [NodeProperties.EntryPoint]: true,
                  [NodeProperties.Model]: currentNode.id,
                  [NodeProperties.Selector]: modelComponentSelectors[0],
                  [NodeProperties.SelectorProperty]:
                    SelectorPropertyKeys.Object
                },
                graph
              ).find(x => x)
              if (node) {
                skipAddingComplete = true
                newItems.getObjectDataChain = node.id
                return null
              }
              if (!viewModelInstanceNode) {
                skipAddingComplete = true
              }
              return {
                nodeType: NodeTypes.DataChain,
                callback: node => {
                  newItems.getObjectDataChain = node.id
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
                    target: viewModelNodeId,
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
              }
            }
          },
          {
            operation: ADD_NEW_NODE,
            options: function (graph) {
              if (skipAddingComplete) {
                return false
              }
              let temp = AddChainCommand(
                GetNodeById(newItems.getObjectDataChain, graph),
                complete => {},
                graph,
                {
                  ...viewPackage,
                  [NodeProperties.AsOutput]: true,
                  [NodeProperties.DataChainFunctionType]:
                    DataChainFunctionKeys.Pass,
                  [NodeProperties.UIText]: `Get ${viewName} Complete`
                }
              )
              return temp.options
            }
          }
        ])(GetDispatchFunc(), GetStateFunc())

        modelProperties.map((modelProperty, propertyIndex) => {
          let propDataChainNodeId = null
          let skip = false
          let referenceproperty = false
          // Needs an accessor even if it is a shared or reference property
          switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
            case NodeTypes.Model:
              return {}
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
                  let _ui_model_type = GetNodeProp(
                    modelProperty,
                    NodeProperties.UIModelType
                  )
                  if (_ui_model_type) {
                    referenceproperty = GetSharedComponentFor(
                      viewType,
                      modelProperty,
                      _ui_model_type
                    )
                  }
                }
              }
              break
          }

          let buildPropertyResult = BuildPropertyDataChainAccessor({
            viewName,
            modelProperty,
            currentNode,
            modelComponentSelectors,
            skip,
            isSharedComponent,
            viewModelNodeId,
            viewPackage,
            propertyDataChainAccesors,
            uiType,
            viewType,
            newItems,
            childComponents,
            propertyIndex
          })
          if (referenceproperty) {
            // add data-chain accessor to view-type external connections
            AttachDataChainAccessorTo(
              referenceproperty,
              buildPropertyResult.propDataChainNodeId
            )
            AttachSelectorAccessorTo(
              referenceproperty,
              modelComponentSelectors[0]
            )
            return {}
          }
          skip = buildPropertyResult.skip
          propDataChainNodeId = buildPropertyResult.propDataChainNodeId

          ConnectExternalApisToSelectors({
            modelComponentSelectors,
            newItems,
            viewType,
            childComponents,
            propertyIndex
          })

          let compNodeId = childComponents[propertyIndex]

          let compNode = GetNodeById(compNodeId)
          let componentType = GetNodeProp(
            compNode,
            NodeProperties.ComponentType
          )
          let componentApi = GetNodeProp(compNode, NodeProperties.ComponentApi)

          let rootCellId = GetFirstCell(layout)
          let children = GetChildren(layout, rootCellId)
          let childId = children[propertyIndex]
          let apiList = PropertyApiList // getComponentApiList(componentApi);
          let apiDataChainLists = {}
          newItems.apiDataChain = newItems.apiDataChain || {}
          newItems.apiDataChain[childId] = apiDataChainLists

          setupPropertyApi({
            viewName,
            modelProperty,
            currentNode,
            modelComponentSelectors,
            isSharedComponent,
            viewModelNodeId,
            viewPackage,
            propertyDataChainAccesors,
            apiList,
            apiDataChainLists,
            propDataChainNodeId,
            uiType,
            viewType,
            newItems,
            childComponents,
            propertyIndex
          })

          PerformGraphOperation([
            ...apiList.map(api => {
              return {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                  let apiProperty = api.value
                  let cellProperties = GetCellProperties(layout, childId)
                  cellProperties.componentApi =
                    cellProperties.componentApi || {}
                  // let { instanceType, model, selector, handlerType, dataChain, modelProperty } = cellProperties.componentApi[apiProperty] || {};
                  if (ARE_BOOLEANS.some(v => v === apiProperty)) {
                    cellProperties.componentApi[apiProperty] = {
                      instanceType: InstanceTypes.Boolean,
                      handlerType: HandlerTypes.Property
                    }
                  } else if (ARE_HANDLERS.some(v => v === apiProperty)) {
                    if ([ARE_TEXT_CHANGE].some(v => v === apiProperty)) {
                      cellProperties.componentApi[apiProperty] = {
                        instanceType: useModelInstance
                          ? InstanceTypes.ModelInstance
                          : InstanceTypes.ScreenInstance,
                        handlerType: HandlerTypes.ChangeText
                      }
                    } else {
                      cellProperties.componentApi[apiProperty] = {
                        instanceType: useModelInstance
                          ? InstanceTypes.ModelInstance
                          : InstanceTypes.ScreenInstance,
                        handlerType: HandlerTypes.Change
                      }
                    }
                  } else {
                    cellProperties.componentApi[apiProperty] = {
                      instanceType: useModelInstance
                        ? InstanceTypes.SelectorInstance
                        : InstanceTypes.Selector,
                      selector: modelComponentSelectors[0],
                      handlerType: HandlerTypes.Property,
                      dataChain: apiDataChainLists[apiProperty] // propertyDataChainAccesors[propertyIndex]
                    }
                    if (apiDataChainLists[apiProperty]) {
                      datachainLink.push({
                        operation: ADD_LINK_BETWEEN_NODES,
                        options: function () {
                          return {
                            target: modelComponentSelectors[0],
                            source: compNodeId,
                            linkProperties: {
                              ...LinkProperties.SelectorLink
                            }
                          }
                        }
                      })
                    }
                  }

                  switch (apiProperty) {
                    case ON_BLUR:
                      cellProperties.componentApi[
                        apiProperty
                      ].model = viewModelNodeBlurId
                      cellProperties.componentApi[apiProperty].modelProperty =
                        modelProperties[propertyIndex].id
                      cellProperties.componentApi[apiProperty].handlerType =
                        HandlerTypes.Blur
                      break
                    case ON_CHANGE_TEXT:
                    case ON_CHANGE:
                      cellProperties.componentApi[
                        apiProperty
                      ].model = viewModelNodeId
                      cellProperties.componentApi[apiProperty].modelProperty =
                        modelProperties[propertyIndex].id
                      break
                    case ON_FOCUS:
                      cellProperties.componentApi[
                        apiProperty
                      ].model = viewModelNodeFocusId
                      cellProperties.componentApi[apiProperty].modelProperty =
                        modelProperties[propertyIndex].id
                      cellProperties.componentApi[apiProperty].handlerType =
                        HandlerTypes.Focus
                      break
                  }
                  if (cellProperties.componentApi[apiProperty].modelProperty) {
                    datachainLink.push({
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target:
                            cellProperties.componentApi[apiProperty]
                              .modelProperty,
                          source: compNodeId,
                          linkProperties: {
                            ...LinkProperties.ComponentApi,
                            modelProperty: true
                          }
                        }
                      }
                    })
                  }

                  if (cellProperties.componentApi[apiProperty].model) {
                    datachainLink.push({
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target:
                            cellProperties.componentApi[apiProperty].model,
                          source: compNodeId,
                          linkProperties: {
                            ...LinkProperties.ComponentApi,
                            model: true
                          }
                        }
                      }
                    })
                  }

                  return {
                    prop: NodeProperties.Layout,
                    id: screenComponentId,
                    value: layout
                  }
                }
              }
            })
          ])(GetDispatchFunc(), GetStateFunc())
        })

        PerformGraphOperation(datachainLink)(GetDispatchFunc(), GetStateFunc())

        PerformGraphOperation([
          ...[]
            .interpolate(0, modelProperties.length + 1, modelIndex => {
              return applyDefaultComponentProperties(
                GetNodeById(childComponents[modelIndex]),
                uiType
              )
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
        ])(GetDispatchFunc(), GetStateFunc())
        createConnections.map(t => t())
        createListConnections.map(t => t())
      }

      SelectedNode(currentNode.id)(GetDispatchFunc(), GetStateFunc())
    }
    let { uiTypes } = _args
    if (uiTypes) {
      for (var i in uiTypes) {
        if (uiTypes[i]) {
          default_View_method({ ..._args, uiType: i })
        }
      }
    } else {
      default_View_method({ ..._args })
    }
  }
}

export function applyDefaultComponentProperties (currentNode, _ui_type) {
  // var { state } = this.props;
  // var currentNode = Node(state, Visual(state, SELECTED_NODE));
  // let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
  // let _ui_type = GetNodeProp(screenOption, NodeProperties.UIType);
  let result = []
  if (currentNode) {
    let componentTypes = ComponentTypes[_ui_type] || {}
    let componentType = GetNodeProp(currentNode, NodeProperties.ComponentType)
    Object.keys(
      componentTypes[componentType]
        ? componentTypes[componentType].properties
        : {}
    ).map(key => {
      let prop_obj = componentTypes[componentType].properties[key]
      if (prop_obj.parameterConfig) {
        let selectedComponentApiProperty = key
        let componentProperties = GetNodeProp(
          currentNode,
          prop_obj.nodeProperty
        )
        componentProperties = componentProperties || {}
        componentProperties[selectedComponentApiProperty] =
          componentProperties[selectedComponentApiProperty] || {}
        componentProperties[selectedComponentApiProperty] = {
          instanceType: InstanceTypes.ApiProperty,
          isHandler: prop_obj.isHandler,
          apiProperty: prop_obj.nodeProperty
        }

        result.push({
          operation: CHANGE_NODE_PROPERTY,
          options: {
            prop: prop_obj.nodeProperty,
            id: currentNode.id,
            value: componentProperties
          }
        })
      }
    })
  }

  return result
}

function CreateFunction (option) {
  let {
    nodePackageType,
    methodType,
    httpMethod,
    functionType,
    functionName
  } = option
  if (!nodePackageType) {
    throw 'missing node package type'
  }
  if (!methodType) {
    throw 'missing method type'
  }
  if (!httpMethod) {
    throw 'missing http method'
  }
  if (!functionType) {
    throw 'function type missing'
  }
  if (!functionName) {
    throw 'function name is missing'
  }
  return args => {
    let { model, dispatch, getState } = args
    // Check for existing method of this type

    // if no methods exist, then create a new method.
    // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
    let agents = GetAgentNodes()

    agents
      .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController))
      .map(agent => {
        let methodProps

        if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
          let outer_commands = [
            {
              operation: ADD_NEW_NODE,
              options: {
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
                  setTimeout(() => {
                    new Promise(resolve => {
                      let { constraints } = MethodFunctions[functionType]
                      let commands = []
                      let permissionNode = null
                      Object.values(constraints).map(constraint => {
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
                            }
                            if (constraint[NodeProperties.IsAgent]) {
                              methodProps[constraint.key] = agent.id
                            } else if (
                              constraint.key === FunctionTemplateKeys.User
                            ) {
                              methodProps[constraint.key] =
                                GetNodeProp(
                                  GetNodeById(agent.id),
                                  NodeProperties.UIUser
                                ) || GetUsers()[0].id
                            } else {
                              methodProps[constraint.key] = model.id
                            }
                            break
                          case FunctionTemplateKeys.Permission:
                          case FunctionTemplateKeys.ModelFilter:
                            let perOrModelNode = null
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
                                    }
                                    methodProps[constraint.key] = newNode.id
                                    perOrModelNode = newNode
                                  }
                                }
                              }
                            ])(dispatch, getState)
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
                              ]
                            }
                            break
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
                        ]
                      })
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
                              setTimeout(() => {
                                if (
                                  ModelNotConnectedToFunction(
                                    agent.id,
                                    model.id,
                                    nodePackageType,
                                    NodeTypes.Maestro
                                  )
                                ) {
                                  PerformGraphOperation([
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
                                          setTimeout(() => {
                                            PerformGraphOperation([
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
                                            ])(dispatch, getState)
                                          }, 1500)
                                        }
                                      }
                                    }
                                  ])(dispatch, getState)
                                }
                              }, 1500)
                            }
                          }
                        })
                      }
                      PerformGraphOperation(commands)(dispatch, getState)
                      resolve()
                    })
                  }, 1500)
                }
              }
            }
          ]
          PerformGraphOperation(outer_commands)(dispatch, getState)
        }
      })
  }
}

export function CreateAgentFunction (option) {
  let {
    nodePackageType,
    methodType,
    maestroNodeId,
    parentId: parent,
    httpMethod,
    functionType,
    functionName,
    model,
    agent
  } = option

  if (!nodePackageType) {
    throw 'missing node package type'
  }
  if (!methodType) {
    throw 'missing method type'
  }
  if (!httpMethod) {
    throw 'missing http method'
  }
  if (!functionType) {
    throw 'function type missing'
  }
  if (!functionName) {
    throw 'function name is missing'
  }
  return args => {
    let { dispatch, getState } = args
    // Check for existing method of this type

    // if no methods exist, then create a new method.
    // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);

    let methodProps
    let new_nodes = {}
    if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
      let outer_commands = [
        {
          operation: ADD_NEW_NODE,
          options: function (graph) {
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
                new_nodes.methodNode = methodNode
              }
            }
          }
        },
        function () {
          let { methodNode } = new_nodes
          let { constraints } = MethodFunctions[functionType]
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
          ]
          Object.values(constraints).map(constraint => {
            switch (constraint.key) {
              case FunctionTemplateKeys.Model:
              case FunctionTemplateKeys.ModelOutput:
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
                }
                if (constraint[NodeProperties.IsAgent]) {
                  methodProps[constraint.key] = agent.id
                } else if (constraint.key === FunctionTemplateKeys.User) {
                  methodProps[constraint.key] =
                    GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) ||
                    GetUsers()[0].id
                } else if (constraint.key === FunctionTemplateKeys.Parent) {
                  methodProps[constraint.key] = parent.id
                } else {
                  methodProps[constraint.key] = model.id
                }
                break
              case FunctionTemplateKeys.Validator:
                let validator = null
                commands.push(
                  ...[
                    {
                      operation: ADD_NEW_NODE,
                      options: function () {
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
                            methodProps[constraint.key] = _node.id
                            validator = _node
                          }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: model.id,
                          source: validator.id,
                          properties: { ...LinkProperties.ValidatorModelLink }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: agent.id,
                          source: validator.id,
                          properties: { ...LinkProperties.ValidatorAgentLink }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: methodNode.id,
                          source: validator.id,
                          properties: {
                            ...LinkProperties.ValidatorFunctionLink
                          }
                        }
                      }
                    }
                  ]
                )
                break
              case FunctionTemplateKeys.Executor:
                let executor = null

                commands.push(
                  ...[
                    {
                      operation: ADD_NEW_NODE,
                      options: function () {
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
                            methodProps[constraint.key] = _node.id
                            executor = _node
                          }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: model.id,
                          source: executor.id,
                          properties: { ...LinkProperties.ExecutorModelLink }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: agent.id,
                          source: executor.id,
                          properties: { ...LinkProperties.ExecutorAgentLink }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: methodNode.id,
                          source: executor.id,
                          properties: {
                            ...LinkProperties.ExecutorFunctionLink
                          }
                        }
                      }
                    }
                  ]
                )
                break
              case FunctionTemplateKeys.Permission:
              case FunctionTemplateKeys.ModelFilter:
                let perOrModelNode = null
                commands.push(
                  ...[
                    {
                      operation: ADD_NEW_NODE,
                      options: function () {
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
                            }
                            methodProps[constraint.key] = newNode.id
                            perOrModelNode = newNode
                          }
                        }
                      }
                    }
                  ]
                )
                if (constraint.key === FunctionTemplateKeys.ModelFilter) {
                  commands = [
                    ...commands,
                    {
                      operation: CHANGE_NODE_PROPERTY,
                      options: function () {
                        return {
                          prop: NodeProperties.FilterAgent,
                          id: perOrModelNode.id,
                          value: agent.id
                        }
                      }
                    },
                    {
                      operation: CHANGE_NODE_PROPERTY,
                      options: function () {
                        return {
                          prop: NodeProperties.FilterModel,
                          id: perOrModelNode.id,
                          value: model.id
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: model.id,
                          source: perOrModelNode.id,
                          properties: { ...LinkProperties.ModelTypeLink }
                        }
                      }
                    },
                    {
                      operation: ADD_LINK_BETWEEN_NODES,
                      options: function () {
                        return {
                          target: agent.id,
                          source: perOrModelNode.id,
                          properties: { ...LinkProperties.AgentTypeLink }
                        }
                      }
                    }
                  ]
                }
                break
            }
            commands = [
              ...commands,
              ...[
                {
                  operation: CHANGE_NODE_PROPERTY,
                  options: function () {
                    return {
                      prop: NodeProperties.MethodProps,
                      id: methodNode.id,
                      value: methodProps
                    }
                  }
                },
                {
                  operation: ADD_LINK_BETWEEN_NODES,
                  options: function () {
                    return {
                      target: methodProps[constraint.key],
                      source: methodNode.id,
                      properties: { ...LinkProperties.FunctionOperator }
                    }
                  }
                }
              ]
            ]
          })
          return commands
        }
      ]
      PerformGraphOperation(outer_commands)(dispatch, getState)

      updateMethodParameters(new_nodes.methodNode.id, functionType)(
        dispatch,
        getState
      )
      attachMethodToMaestro(new_nodes.methodNode.id, model.id)(
        dispatch,
        getState
      )
    }
  }
}

function addListItemComponentApi (
  newItems,
  text,
  noExternal,
  keyfunc,
  parent,
  options = { useAsValue: true }
) {
  let internalId
  let externalId
  return [
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
            internalId = nn.id
            if (keyfunc && noExternal) {
              keyfunc(text, {
                internalId,
                externalId
              })
              setApiConnectors(
                newItems,
                parent,
                {
                  internalId,
                  externalId
                },
                text
              )
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
        }
      }
    },
    noExternal
      ? null
      : {
        operation: ADD_NEW_NODE,
        options: function (currentGraph) {
          return {
            nodeType: NodeTypes.ComponentExternalApi,
            callback: nn => {
              externalId = nn.id
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
          }
        }
      },
    noExternal
      ? null
      : {
        operation: ADD_LINK_BETWEEN_NODES,
        options: function () {
          if (keyfunc) {
            keyfunc(text, {
              internalId,
              externalId
            })
          }
          setApiConnectors(
            newItems,
            parent,
            {
              internalId,
              externalId
            },
            text
          )
          return {
            source: internalId,
            target: externalId,
            properties: {
              ...LinkProperties.ComponentInternalConnection
            }
          }
        }
      }
  ].filter(x => x)
}
function addComponentEventApiNodes (args) {
  let {
    newItems,
    childComponents,
    modelIndex,
    modelProperty,
    currentNode,
    viewComponent,
    viewPackage,
    useModelInstance
  } = args
  let parent = childComponents[modelIndex]
  newItems.eventApis = newItems.eventApis || {}
  return (viewComponent.eventApi || [])
    .map(apiName => {
      let apiNameInstance = `${apiName} Instance`
      let apiNameEventHandler = `${apiName} Event Handler`

      return [
        {
          operation: ADD_NEW_NODE,
          options: function (graph) {
            return {
              nodeType: NodeTypes.EventMethod,
              callback: nn => {
                newItems.eventApis[childComponents[modelIndex]] = {
                  ...(newItems.eventApis[childComponents[modelIndex]] || {}),
                  [apiName]: nn.id
                }
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
            }
          }
        },
        {
          operation: ADD_NEW_NODE,
          options: function (graph) {
            return {
              nodeType: NodeTypes.EventMethodInstance,
              callback: nn => {
                newItems.eventApis[childComponents[modelIndex]] = {
                  ...(newItems.eventApis[childComponents[modelIndex]] || {}),
                  [apiNameInstance]: nn.id
                }
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
            }
          }
        },
        {
          operation: ADD_NEW_NODE,
          options: function (graph) {
            return {
              nodeType: NodeTypes.EventHandler,
              callback: nn => {
                newItems.eventApis[childComponents[modelIndex]] = {
                  ...(newItems.eventApis[childComponents[modelIndex]] || {}),
                  [apiNameEventHandler]: nn.id
                }
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
            }
          }
        },
        {
          operation: ADD_LINK_BETWEEN_NODES,
          options: function (graph) {
            let viewModelNode = null
            let instanceType = null
            switch (apiName) {
              case ComponentEvents.onFocus:
                instanceType = useModelInstance
                  ? InstanceTypes.ModelInstanceFocus
                  : InstanceTypes.ScreenInstanceFocus
                break
              case ComponentEvents.onBlur:
                instanceType = useModelInstance
                  ? InstanceTypes.ModelInstanceBlur
                  : InstanceTypes.ScreenInstanceBlur
                break
              case ComponentEvents.onChange:
                instanceType = useModelInstance
                  ? InstanceTypes.ModelInstance
                  : InstanceTypes.ScreenInstance
                break
              case ComponentEvents.onChangeText:
                instanceType = useModelInstance
                  ? InstanceTypes.ModelInstance
                  : InstanceTypes.ScreenInstance
                break
            }
            let res = GetNodesByProperties(
              {
                [NodeProperties.Model]: currentNode.id,
                [NodeProperties.InstanceType]: instanceType,
                [NodeProperties.NODEType]: NodeTypes.ViewModel
              },
              graph
            )
            if (res && res.length) {
              viewModelNode = res[0].id
            }
            return {
              source:
                newItems.eventApis[childComponents[modelIndex]][
                  apiNameEventHandler
                ],
              target: viewModelNode,
              properties: {
                ...LinkProperties.ViewModelLink
              }
            }
          }
        },
        {
          operation: ADD_LINK_BETWEEN_NODES,
          options: function (graph) {
            return {
              source:
                newItems.eventApis[childComponents[modelIndex]][
                  apiNameEventHandler
                ],
              target: modelProperty.id,
              properties: {
                ...LinkProperties.PropertyLink
              }
            }
          }
        }
      ]
    })
    .flatten()
}
function addComponentApiNodes (
  newItems,
  childComponents,
  modelIndex,
  viewComponentType,
  apiName = 'value',
  externalApiId
) {
  let parent = childComponents[modelIndex]
  let componentInternalValue = null
  let componentExternalValue = null
  return [
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
            componentInternalValue = nn.id
            newItems[childComponents[modelIndex]] = {
              ...(newItems[childComponents[modelIndex]] || {}),
              [apiName]: {
                componentInternalValue: nn.id
              }
            }
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
            [NodeProperties.UseAsValue]: true,
            [NodeProperties.ComponentApiKey]:
              viewComponentType.internalApiNode || null
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        return {
          nodeType: NodeTypes.ComponentExternalApi,
          callback: nn => {
            componentExternalValue = nn.id
            newItems[childComponents[modelIndex]] = {
              ...newItems[childComponents[modelIndex]],
              [apiName]: {
                ...newItems[childComponents[modelIndex]][apiName],
                componentExternalValue: nn.id
              }
            }
          },
          parent,
          linkProperties: {
            properties: { ...LinkProperties.ComponentExternalApi }
          },
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: apiName,
            [NodeProperties.Pinned]: false,
            [NodeProperties.ComponentApiKey]:
              viewComponentType.externalApiNode || null
          }
        }
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        if (parent) {
          setApiConnectors(
            newItems,
            parent,
            {
              internalId: componentInternalValue,
              externalId: componentExternalValue
            },
            apiName
          )
        }
        return {
          source: componentInternalValue,
          target: componentExternalValue,
          properties: {
            ...LinkProperties.ComponentInternalConnection
          }
        }
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        return {
          target: externalApiId || newItems.screenComponentIdInternalApi,
          source: componentExternalValue,
          properties: {
            ...LinkProperties.ComponentExternalConnection
          }
        }
      }
    }
  ].filter(x => x)
}

function addButtonApiNodes (newItems) {
  let buttonInternalApi = null
  let buttonExternalApi = null
  return [
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
            buttonInternalApi = nn.id
          },
          linkProperties: {
            properties: { ...LinkProperties.ComponentInternalApi }
          },
          parent: newItems.button,
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: `label`,
            [NodeProperties.Pinned]: false,
            [NodeProperties.UseAsValue]: true
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        return {
          nodeType: NodeTypes.ComponentExternalApi,
          callback: nn => {
            buttonExternalApi = nn.id
          },
          parent: newItems.button,
          linkProperties: {
            properties: { ...LinkProperties.ComponentExternalApi }
          },
          groupProperties: {},
          properties: {
            [NodeProperties.Pinned]: false,
            [NodeProperties.UIText]: `label`
          }
        }
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        return {
          source: buttonInternalApi,
          target: buttonExternalApi,
          properties: {
            ...LinkProperties.ComponentInternalConnection
          }
        }
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        return {
          target: newItems.titleService,
          source: buttonExternalApi,
          properties: {
            ...LinkProperties.TitleServiceLink
          }
        }
      }
    }
  ]
}

function ConnectExternalApisToSelectors (args) {
  var {
    modelComponentSelectors,
    newItems,
    viewType,
    childComponents,
    propertyIndex
  } = args
  let steps = []
  switch (viewType) {
    case ViewTypes.Update:
    case ViewTypes.Create:
      steps.push({
        operation: ADD_LINK_BETWEEN_NODES,
        options: function () {
          return {
            target: modelComponentSelectors[0],
            source:
              newItems[childComponents[propertyIndex]].value
                .componentExternalValue,
            properties: {
              ...LinkProperties.SelectorLink
            }
          }
        }
      })
      break
    default:
      break
  }

  PerformGraphOperation([
    ...steps,
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        return {
          target: newItems.titleService,
          source:
            newItems[childComponents[propertyIndex]].label
              .componentExternalValue,
          properties: {
            ...LinkProperties.TitleServiceLink
          }
        }
      }
    }
  ])(GetDispatchFunc(), GetStateFunc())
}

function BuildPropertyDataChainAccessor (args) {
  var {
    viewName,
    modelProperty,
    viewPackage,
    currentNode,
    modelComponentSelectors,
    viewModelNodeId,
    propertyDataChainAccesors,
    newItems,
    uiType,
    viewType,
    childComponents,
    isSharedComponent,
    propertyIndex
  } = args
  let skip = false
  let propDataChainNodeId = null
  let entryNodeProperties = null
  let links = null
  let skipDataChainStep = false
  let addcomplete = false
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
      }
      links = [
        {
          target: modelComponentSelectors[0],
          linkProperties: {
            properties: { ...LinkProperties.DataChainLink }
          }
        },
        {
          target: viewModelNodeId,
          linkProperties: {
            properties: { ...LinkProperties.DataChainLink }
          }
        }
      ]
      break
    default:
      skipDataChainStep = true
      addcomplete = true
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
      }
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
      ]
      break
  }
  PerformGraphOperation(
    [
      {
        operation: ADD_NEW_NODE,
        options: function (graph) {
          let node = GetNodesByProperties({
            ...entryNodeProperties
          }).find(x => x)
          if (node) {
            propDataChainNodeId = node.id
            skip = true
            propertyDataChainAccesors.push(propDataChainNodeId)
            setModelPropertyViewTypePropNode(
              newItems,
              modelProperty,
              viewType,
              node
            )
            return null
          }
          return {
            nodeType: NodeTypes.DataChain,
            properties: {
              ...viewPackage,
              ...entryNodeProperties
            },
            links,
            callback: propNode => {
              propDataChainNodeId = propNode.id
              propertyDataChainAccesors.push(propDataChainNodeId)
              setModelPropertyViewTypePropNode(
                newItems,
                modelProperty,
                viewType,
                propNode
              )
            }
          }
        }
      },
      skipDataChainStep
        ? false
        : {
          operation: ADD_NEW_NODE,
          options: function (graph) {
            if (skip) {
              return {}
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
              callback: (node, graph) => {}
            }
          }
        },
      addcomplete
        ? {
          operation: ADD_NEW_NODE,
          options: function (graph) {
            if (skip) {
              return false
            }
            let groupProperties = GetNodeProp(
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
              : null
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
            }
          }
        }
        : false
    ].filter(x => x)
  )(GetDispatchFunc(), GetStateFunc())
  return { skip, propDataChainNodeId }
}

function setModelPropertyViewTypePropNode (
  newItems,
  modelProperty,
  viewType,
  propNode
) {
  if (!newItems.PropertyDataChainGetter) {
    newItems.PropertyDataChainGetter = {}
  }
  if (!newItems.PropertyDataChainGetter[modelProperty.id]) {
    newItems.PropertyDataChainGetter[modelProperty.id] = {}
  }
  newItems.PropertyDataChainGetter[modelProperty.id][viewType] = propNode.id
}

function setupPropertyApi (args) {
  var {
    newItems,
    childId,
    apiList,
    viewPackage,
    childComponents,
    propertyIndex,
    propDataChainNodeId,
    viewName,
    modelProperty,
    apiDataChainLists,
    viewName,
    modelProperty,
    currentNode,
    modelComponentSelectors,
    isSharedComponent,
    viewModelNodeId,
    propertyDataChainAccesors,
    apiList,
    apiDataChainLists,
    uiType,
    viewType,
    newItems
  } = args

  newItems.apiDataChain = newItems.apiDataChain || {}
  newItems.apiDataChain[childId] = apiDataChainLists
  PerformGraphOperation([
    ...apiList
      .map(api => {
        let apiProperty = api.value
        let apiNameEventHandler = `${apiProperty} Event Handler`
        if (
          ARE_BOOLEANS.some(v => v === apiProperty) ||
          ARE_HANDLERS.some(v => v === apiProperty)
        ) {
          return false
        }
        let completeId = null
        let splitId = null
        let dataChainProps = {
          [NodeProperties.UIText]: `${viewName} ${viewType} ${GetNodeTitle(
            modelProperty
          )} ${apiProperty}`,
          [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
          [NodeProperties.EntryPoint]: true,
          [NodeProperties.DataChainProperty]: modelProperty.id
        }
        let skip = false
        return [
          {
            operation: ADD_NEW_NODE,
            options: function (graph) {
              let $node = GetNodeByProperties(
                {
                  ...dataChainProps
                },
                graph
              )
              if ($node) {
                apiDataChainLists[apiProperty] = $node.id
                skip = true
                return false
              }
              return {
                nodeType: NodeTypes.DataChain,
                properties: {
                  ...viewPackage,
                  ...dataChainProps,
                  [NodeProperties.Pinned]: false
                },
                links: [],
                callback: dataChainApis => {
                  apiDataChainLists[apiProperty] = dataChainApis.id
                }
              }
            }
          },
          {
            operation: ADD_NEW_NODE,
            options: function (graph) {
              if (skip) {
                return false
              }
              let temp = SplitDataCommand(
                GetNodeById(apiDataChainLists[apiProperty], graph),
                split => {
                  splitId = split.id
                },
                viewPackage
              )
              return temp.options
            }
          },
          {
            operation: ADD_NEW_NODE,
            options: function (graph) {
              if (skip) {
                return false
              }
              let temp = AddChainCommand(
                GetNodeById(splitId, graph),
                complete => {
                  completeId = complete.id
                },
                graph,
                viewPackage
              )
              return temp.options
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                prop: NodeProperties.DataChainFunctionType,
                id: completeId,
                value: DataChainFunctionKeys.Pass
              }
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                prop: NodeProperties.UIText,
                id: completeId,
                value: `${apiProperty} Complete`
              }
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                prop: NodeProperties.AsOutput,
                id: completeId,
                value: true
              }
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                prop: NodeProperties.DataChainFunctionType,
                id: splitId,
                value: DataChainFunctionKeys.ReferenceDataChain
              }
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                prop: NodeProperties.UIText,
                id: splitId,
                value: `${GetNodeTitle(modelProperty)} ${apiProperty}`
              }
            }
          },
          {
            operation: CHANGE_NODE_PROPERTY,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                prop: NodeProperties.DataChainReference,
                id: splitId,
                value: propDataChainNodeId
              }
            }
          },
          {
            operation: ADD_LINK_BETWEEN_NODES,
            options: function (graph) {
              if (skip) {
                return false
              }
              return {
                source: splitId,
                target: propDataChainNodeId,
                properties: { ...LinkProperties.DataChainLink }
              }
            }
          },
          {
            operation: ADD_LINK_BETWEEN_NODES,
            options: function (graph) {
              if (
                newItems.eventApis &&
                newItems.eventApis[childComponents[propertyIndex]] &&
                newItems.eventApis[childComponents[propertyIndex]][
                  apiNameEventHandler
                ] &&
                apiDataChainLists[apiProperty]
              ) {
                return {
                  source:
                    newItems.eventApis[childComponents[propertyIndex]][
                      apiNameEventHandler
                    ],
                  target: apiDataChainLists[apiProperty],
                  properties: { ...LinkProperties.DataChainLink }
                }
              }
            }
          }
        ]
      })
      .flatten()
      .filter(x => x),
    ...apiList
      .map(v => v.value)
      .map(api_key => {
        return {
          operation: ADD_LINK_BETWEEN_NODES,
          options: function () {
            if (newItems[childComponents[propertyIndex]][api_key]) {
              return {
                target: apiDataChainLists[api_key],
                source:
                  newItems[childComponents[propertyIndex]][api_key]
                    .componentExternalValue,
                properties: {
                  ...LinkProperties.DataChainLink
                }
              }
            }
          }
        }
      }),
    ...apiList
      .map(v => v.value)
      .map(api_key => {
        return {
          operation: ADD_LINK_BETWEEN_NODES,
          options: function () {
            if (modelComponentSelectors[0]) {
              return {
                target: modelComponentSelectors[0],
                source:
                  newItems[childComponents[propertyIndex]][api_key]
                    .componentExternalValue,
                properties: {
                  ...LinkProperties.SelectorLink
                }
              }
            }
          }
        }
      })
  ])(GetDispatchFunc(), GetStateFunc())
}
function connectComponentToExternalApi (args) {
  let { newItems, child, key, parent, properties } = args
  let { externalId } = getApiConnectors(newItems, child, key)
  let { internalId } = getApiConnectors(newItems, parent, key)
  return [
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        return {
          source: externalId,
          target: internalId,
          properties: {
            ...properties
          }
        }
      }
    }
  ]
}

function addComponentApiToForm (args) {
  let {
    newItems,
    text,
    parent,
    isSingular,
    graph,
    internalProperties = {},
    externalProperties = {}
  } = args
  let externalId
  let internalId
  let skip = false
  return [
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        if (parent) {
          if (isSingular && graph) {
            let temp = GetNodesLinkedTo(graph, {
              id: parent,
              link: LinkType.ComponentInternalApi
            }).find(
              x =>
                GetNodeProp(x, NodeProperties.NODEType) ===
                  NodeTypes.ComponentApi &&
                GetNodeProp(x, NodeProperties.UIText) === text
            )
            if (temp) {
              internalId = temp.id
              skip = true
              return false
            }
          }
          return {
            nodeType: NodeTypes.ComponentApi,
            callback: nn => {
              internalId = nn.id
            },
            parent: parent,
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
          }
        }
      }
    },
    {
      operation: ADD_NEW_NODE,
      options: function (currentGraph) {
        if (isSingular && graph) {
          let temp = GetNodesLinkedTo(graph, {
            id: parent,
            link: LinkType.ComponentExternalApi
          }).find(
            x =>
              GetNodeProp(x, NodeProperties.NODEType) ===
                NodeTypes.ComponentApi &&
              GetNodeProp(x, NodeProperties.UIText) === text
          )
          if (temp) {
            externalId = temp.id
            skip = true
            return false
          }
        }
        if (parent && !skip) {
          return {
            nodeType: NodeTypes.ComponentExternalApi,
            callback: nn => {
              externalId = nn.id
            },
            parent: parent,
            linkProperties: {
              properties: { ...LinkProperties.ComponentExternalApi }
            },
            groupProperties: {},
            properties: {
              ...externalProperties,
              [NodeProperties.Pinned]: false,
              [NodeProperties.UIText]: text
            }
          }
        }
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options: function () {
        if (parent) {
          setApiConnectors(newItems, parent, { internalId, externalId }, text)
        }
        if (parent && !skip) {
          return {
            source: internalId,
            target: externalId,
            properties: {
              ...LinkProperties.ComponentInternalConnection
            }
          }
        }
      }
    }
  ]
}

function setApiConnectors (newItems, parent, api, key) {
  newItems.apiConnectors = newItems.apiConnectors || {}
  newItems.apiConnectors[parent] = newItems.apiConnectors[parent] || {}
  newItems.apiConnectors[parent][key] = api
}
function getApiConnectors (newItems, parent, key) {
  newItems.apiConnectors = newItems.apiConnectors || {}
  newItems.apiConnectors[parent] = newItems.apiConnectors[parent] || {}
  return newItems.apiConnectors[parent][key]
}

function AttachDataChainAccessorTo (nodeId, accessorId) {
  let externalApis = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
    id: nodeId,
    link: LinkType.ComponentExternalApi
  })

  PerformGraphOperation([
    ...externalApis.map(externalApi => {
      return {
        operation: ADD_LINK_BETWEEN_NODES,
        options: function (graph) {
          return {
            target: accessorId,
            source: externalApi.id,
            properties: {
              ...LinkProperties.DataChainLink
            }
          }
        }
      }
    })
  ])(GetDispatchFunc(), GetStateFunc())
}

function AttachSelectorAccessorTo (nodeId, accessorId) {
  let externalApis = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
    id: nodeId,
    link: LinkType.ComponentExternalApi
  })

  PerformGraphOperation([
    ...externalApis.map(externalApi => {
      return {
        operation: ADD_LINK_BETWEEN_NODES,
        options: function (graph) {
          return {
            target: accessorId,
            source: externalApi.id,
            properties: {
              ...LinkProperties.SelectorLink
            }
          }
        }
      }
    })
  ])(GetDispatchFunc(), GetStateFunc())
}
