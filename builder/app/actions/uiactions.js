/* eslint-disable default-case */
/* eslint-disable func-names */
import * as GraphMethods from "../methods/graph_methods";
import * as NodeConstants from "../constants/nodetypes";
import * as Titles from "../components/titles";
import { NavigateTypes } from "../constants/nodetypes";
import {
  MethodFunctions,
  bindTemplate,
  bindReferenceTemplate,
  FunctionTemplateKeys,
  ReturnTypes
} from "../constants/functiontypes";
import {
  DataChainFunctionKeys,
  DataChainFunctions
} from "../constants/datachain";
import { uuidv4, addNewLine } from "../utils/array";
import { currentId } from "async_hooks";
import { getReferenceInserts } from "../utils/utilservice";
import CreateDataChainGetBody from "../nodepacks/CreateDataChainGetBody";
import { buildValidation } from "../service/validation_js_service";
import UpdateMethodParameters from "../nodepacks/method/UpdateMethodParameters";
import ConnectLifecycleMethod from "../components/ConnectLifecycleMethod";
import { ViewTypes } from "../constants/viewtypes";
const fs = require("fs");
export const VISUAL = "VISUAL";
export const MINIMIZED = "MINIMIZED";
export const HIDDEN = "HIDDEN";
export const APPLICATION = "APPLICATION";
export const GRAPHS = "GRAPHS";
export const VISUAL_GRAPH = "VISUAL_GRAPH";
export const DASHBOARD_MENU = "DASHBOARD_MENU";
export const SELECTED_NODE_BB = "SELECTED_NODE_BB";
export const GROUPS_ENABLED = "GROUPS_ENABLED";
export const SIDE_PANEL_EXTRA_WIDTH = "SIDE_PANEL_EXTRA_WIDTH";
export const NodeTypes = NodeConstants.NodeTypes;
export const NodeTypeColors = NodeConstants.NodeTypeColors;
export const NodeProperties = NodeConstants.NodeProperties;
export const LinkProperties = NodeConstants.LinkProperties;
export const NodeAttributePropertyTypes =
  NodeConstants.NodeAttributePropertyTypes;
export const NodePropertyTypes = NodeConstants.NodePropertyTypes;
export const ValidationRules = NodeConstants.ValidationRules;
export const OptionsTypes = NodeConstants.OptionsTypes;
export const NODE_COST = "NODE_COST";
export const NODE_CONNECTION_COST = "NODE_CONNECTION_COST";

export const BATCH_MODEL = "BATCH_MODEL";
export const BATCH_AGENT = "BATCH_AGENT";
export const BATCH_PARENT = "BATCH_PARENT";
export const BATCH_FUNCTION_NAME = "BATCH_FUNCTION_NAME";
export const RECORDING = "RECORDING";
export const BATCH_FUNCTION_TYPE = "BATCH_FUNCTION_TYPE";

// export const ViewTypes = {
//   Update: "Update",
//   Delete: "Delete",
//   Create: "Create",
//   Get: "Get",
//   GetAll: "GetAll"
// };
export function GetScreenUrl(
  op,
  language = NodeConstants.UITypes.ElectronIO,
  overrideText = null
) {
  const params = GetComponentExternalApiNodes(op.id)
    .filter(externaApiNodes => {
      return GetNodeProp(externaApiNodes, NodeProperties.IsUrlParameter);
    })
    .map(v => `:${GetCodeName(v)}`)
    .join("/");
  const route = `${overrideText || GetNodeProp(op, NodeProperties.UIText)}${
    params ? `/${params}` : ""
    }`;

  return convertToURLRoute(route);
}
export function convertToURLRoute(x) {
  return [...x.split(" ")]
    .filter(x => x)
    .join("/")
    .toLowerCase();
}
export const UI_UPDATE = "UI_UPDATE";
export function GetC(state, section, item) {
  if (state && state.uiReducer && state.uiReducer[section]) {
    return state.uiReducer[section][item];
  }
  return null;
}
export function Get(state, section) {
  if (state && state.uiReducer) {
    return state.uiReducer[section];
  }
  return null;
}
export function generateDataSeed(node) {
  const dataSeed = _generateDataSeed(node);
  return JSON.stringify(dataSeed, null, 4);
}

function _generateDataSeed(node) {
  const state = _getState();
  const properties = {};
  GraphMethods.getPropertyNodes(GetRootGraph(state), node.id).map(t => {
    properties[t.id] = {
      name: GetCodeName(t),
      jsName: GetCodeName(t).toJavascriptName(),
      type: GetNodeProp(t, NodeProperties.DataGenerationType)
    };
  });
  GetLogicalChildren(node.id).map(t => {
    properties[t.id] = {
      name: GetCodeName(t),
      jsName: GetCodeName(t).toJavascriptName(),
      type: "Id"
    };
  });
  const dataSeed = {
    name: GetCodeName(node),
    properties
  };
  return dataSeed;
}

export function generateDataSeeds() {
  return JSON.stringify(
    NodesByType(_getState(), NodeTypes.Model).map(t => _generateDataSeed(t))
  );
}
export function Visual(state, key) {
  return GetC(state, VISUAL, key);
}
export function ChoseModel(id) {
  return `choson model ${id}`;
}
export function Minimized(state, key) {
  if (!key) {
    return Get(state, MINIMIZED);
  }
  return GetC(state, MINIMIZED, key);
}
export function Hidden(state, key) {
  if (!key) {
    return Get(state, HIDDEN);
  }
  return GetC(state, HIDDEN, key);
}
export function CopyKey(key) {
  return `Copy ${key}`;
}
export function IsCurrentNodeA(state, type) {
  const currentNode = Node(state, Visual(state, SELECTED_NODE));
  if (!Array.isArray(type)) {
    type = [type];
  }
  return (
    currentNode &&
    currentNode.properties &&
    type.some(v => v === currentNode.properties.nodeType)
  );
}
export function Use(node, prop) {
  return node && node.properties && node.properties[prop];
}
export function GetManyToManyNodes(ids) {
  return (
    GraphMethods.GetManyToManyNodes(GetCurrentGraph(_getState()), ids) || []
  );
}
export function GetNodeProp(node, prop, currentGraph) {
  if (typeof node === "string") {
    node = GetNodeById(node, currentGraph) || node;
  }
  return node && node.properties && node.properties[prop];
}
export function GetNodeType(node, graph) {
  return GetNodeProp(node, NodeProperties.NODEType, graph)
}

export function GetNodePropDirty(node, prop, currentGraph) {
  if (typeof node === "string") {
    node = GetNodeById(node, currentGraph) || node;
  }
  return node && node.dirty && node.dirty[prop];
}
export function GetGroupProp(id, prop) {
  const group = GraphMethods.GetGroup(GetCurrentGraph(_getState()), id);
  if (group) {
    return group && group.properties && group.properties[prop];
  }

  return null;
}

export function GetSharedComponentFor(
  viewType,
  modelProperty,
  currentNodeId,
  isSharedProperty
) {
  const graph = GetCurrentGraph(GetState());
  let viewTypeNodes = GraphMethods.GetNodesLinkedTo(graph, {
    id: modelProperty.id
  });

  let isPluralComponent;
  const propertyNode = GetNodeById(modelProperty.id);
  if (propertyNode && GetNodeProp(propertyNode, NodeProperties.NODEType) === NodeTypes.Model) {
    isPluralComponent = true;
  }
  if (isSharedProperty) {
    viewType = isPluralComponent ? ViewTypes.GetAll : ViewTypes.Get;
  }
  viewTypeNodes = viewTypeNodes.filter(x => {
    let result = GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ViewType;

    result =
      result &&
      !!GetNodeProp(x, NodeProperties.IsPluralComponent) ===
      !!isPluralComponent;
    return result;
  });
  viewTypeNodes = viewTypeNodes.find(x => {
    if (
      GraphMethods.existsLinkBetween(graph, {
        source: x.id,
        target: currentNodeId,
        type: NodeConstants.LinkType.DefaultViewType
      })
    ) {
      const link = GraphMethods.findLink(graph, {
        source: x.id,
        target: currentNodeId
      });
      if (
        GetLinkProperty(link, NodeConstants.LinkPropertyKeys.ViewType) ===
        viewType
      ) {
        return true;
      }
    }
    return false;
  });
  if (viewTypeNodes) {
    return viewTypeNodes.id;
  }
  switch (viewType) {
    case ViewTypes.Get:
      return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGet);
    case ViewTypes.Create:
      return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeCreate);
    case ViewTypes.Delete:
      return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeDelete);
    case ViewTypes.GetAll:
      return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGetAll);
    case ViewTypes.Update:
      return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeUpdate);
  }
}

export function getViewTypeEndpointsForDefaults(viewType, currentGraph, id) {
  currentGraph = currentGraph || GetCurrentGraph(_getState());

  const currentNode = GetNodeById(id, currentGraph);
  const connectto = GetNodesByProperties(
    {
      [NodeProperties.NODEType]: NodeTypes.ViewType,
      [NodeProperties.ViewType]: viewType
    },
    currentGraph
  ).filter(_x => {
    const res = GraphMethods.existsLinkBetween(currentGraph, {
      source: _x.id,
      type: NodeConstants.LinkType.DefaultViewType,
      target: currentNode.id
    });
    if (res) {
      const link = GraphMethods.GetLinkBetween(
        _x.id,
        currentNode.id,
        currentGraph
      );
      if (
        link &&
        link.properties &&
        link.properties.target === currentNode.id
      ) {
        return true;
      }
    }
    return false;
  });

  return connectto;
}

export function setSharedComponent(args) {
  const {
    properties,
    target,
    source,
    viewType,
    uiType,
    isPluralComponent
  } = args;
  return (dispatch, getState) => {
    const state = getState();
    const graph = GetCurrentGraph(getState());
    if (
      !GraphMethods.existsLinkBetween(graph, {
        target,
        source,
        type: NodeConstants.LinkType.SharedComponent,
        properties: { viewType }
      }) &&
      GetNodeProp(target, NodeProperties.SharedComponent) &&
      GetNodeProp(target, NodeProperties.NODEType) === NodeTypes.ComponentNode
    ) {
      const connections = GraphMethods.GetConnectedNodesByType(
        state,
        source,
        NodeTypes.ComponentNode
      )
        .filter(x => GetNodeProp(x, NodeProperties.ViewType) === viewType)
        .filter(x => GetNodeProp(x, NodeProperties.UIType) === uiType)
        .filter(
          x =>
            GetNodeProp(x, NodeProperties.IsPluralComponent) ===
            isPluralComponent
        )
        .map(x => {
          return {
            operation: REMOVE_LINK_BETWEEN_NODES,
            options: {
              source,
              target: x.id
            }
          };
        });

      PerformGraphOperation([
        ...connections,
        {
          operation: ADD_LINK_BETWEEN_NODES,
          options: {
            source,
            target,
            properties: { ...properties }
          }
        }
      ])(dispatch, getState);
    }
  };
}
export function setComponentApiConnection(args) {
  const { properties, target, source } = args;
  return (dispatch, getState) => {
    const state = getState();
    const graph = GetCurrentGraph(state);
    if (
      [
        NodeTypes.EventMethod,
        NodeTypes.LifeCylceMethod,
        NodeTypes.MethodApiParameters,
        NodeTypes.DataChain,
        NodeTypes.Selector
      ].some(t => t === GetNodeProp(target, NodeProperties.NODEType))
    ) {
      if (
        !GraphMethods.existsLinkBetween(graph, {
          target,
          source,
          type: NodeConstants.LinkType.ComponentApiConnection
        })
      ) {
        const connections = GraphMethods.GetConnectedNodesByType(
          state,
          source,
          GetNodeProp(target, NodeProperties.NODEType)
        ).map(x => {
          return {
            operation: REMOVE_LINK_BETWEEN_NODES,
            options: {
              source,
              target: x.id
            }
          };
        });
        PerformGraphOperation([
          ...connections,
          {
            operation: ADD_LINK_BETWEEN_NODES,
            options: {
              source,
              target,
              properties: { ...properties }
            }
          }
        ])(dispatch, getState);
      }
    }
  };
}

export function addQueryMethodParameter() {
  return (dispatch, getState) => {
    const state = getState();
    const graph = GetCurrentGraph(state);
    const currentNode = Node(state, Visual(state, SELECTED_NODE));
    const operations = [];
    operations.push({
      operation: ADD_NEW_NODE,
      options() {
        return {
          nodeType: NodeTypes.MethodApiParameters,
          properties: {
            [NodeProperties.UIText]: "Query Parameter",
            [NodeProperties.QueryParameterParam]: true
          },
          parent: currentNode.id,
          groupProperties: {},
          linkProperties: {
            properties: {
              ...LinkProperties.MethodApiParameters,
              params: true,
              query: true
            }
          }
        };
      }
    });
    PerformGraphOperation(operations)(dispatch, getState);
  };
}
export function addQueryMethodApi() {
  return (dispatch, getState) => {
    const state = getState();
    const graph = GetCurrentGraph(state);
    const currentNode = Node(state, Visual(state, SELECTED_NODE));
    const queryObjects = GraphMethods.GetConnectedNodesByType(
      state,
      currentNode.id,
      NodeTypes.MethodApiParameters
    ).filter(x => GetNodeProp(x, NodeProperties.QueryParameterObject));
    if (queryObjects.length === 0) {
      const operations = [];
      operations.push({
        operation: ADD_NEW_NODE,
        options() {
          return {
            nodeType: NodeTypes.MethodApiParameters,
            properties: {
              [NodeProperties.UIText]: "Query",
              [NodeProperties.QueryParameterObject]: true,
              [NodeProperties.QueryParameterObjectExtendible]: true
            },
            links: [
              {
                target: currentNode.id,
                linkProperties: {
                  properties: {
                    ...LinkProperties.MethodApiParameters,
                    params: true,
                    query: true
                  }
                }
              }
            ]
          };
        }
      });
      PerformGraphOperation(operations)(dispatch, getState);
    }
  };
}

export function connectLifeCycleMethod(args) {
  const { properties, target, source } = args;
  return (dispatch, getState) => {
    setTimeout(() => {
      const state = getState();
      const graph = GetCurrentGraph(state);
      graphOperation(ConnectLifecycleMethod({ target, source, graph }))(
        dispatch,
        getState
      );
    }, 100);
  };
}

export function addComponentEventTo(node, apiName) {
  return (dispatch, getState) => {
    graphOperation([
      ComponentEventTo(node, apiName)
    ])(dispatch, getState);
  };
}
export function ComponentEventTo(node, apiName, callback) {
  return {
    operation: ADD_NEW_NODE,
    options() {
      return {
        nodeType: NodeTypes.EventMethod,
        callback,
        properties: {
          [NodeProperties.EventType]: apiName,
          [NodeProperties.UIText]: `${apiName}`
        },
        links: [
          {
            target: node,
            linkProperties: {
              properties: { ...LinkProperties.EventMethod }
            }
          }
        ]
      };
    }
  }
}
export function GetTitleService(graph) {
  graph = GetCurrentGraph();

  return NodesByType(GetState(), NodeTypes.TitleService).find(x => x);
}
export function AgentHasExecutor(model) {
  const state = GetState();
  const graphRoot = GetCurrentGraph();
  return NodesByType(state, NodeTypes.Executor).find(x =>
    GraphMethods.existsLinkBetween(graphRoot, {
      source: x.id,
      target: model.id
    })
  );
}
export function setupDefaultViewType(args) {
  const { properties, target, source } = args;
  return (dispatch, getState) => {
    const graph = GetCurrentGraph(getState());
    let is_property_link = false;
    if (
      GraphMethods.existsLinkBetween(graph, {
        target,
        source,
        type: NodeConstants.LinkType.ModelTypeLink
      })
    ) {
      const isUsedAsModelType = GetNodeProp(
        source,
        NodeProperties.UseModelAsType
      );
      if (isUsedAsModelType) {
        const targetedTypeNode = GetNodeProp(source, NodeProperties.UIModelType);
        if (targetedTypeNode === target) {
          is_property_link = true;
        }
      }
    }

    const right_link =
      is_property_link ||
      GraphMethods.existsLinkBetween(graph, {
        target,
        source,
        type: NodeConstants.LinkType.LogicalChildren
      });
    if (right_link) {
      const useModelAsType = GetNodeProp(target, NodeProperties.UseModelAsType);
      const illegalViewType = false; // useModelAsType ? ViewTypes.GetAll : ViewTypes.Get;
      if (properties.all) {
        PerformGraphOperation(
          Object.keys(ViewTypes)
            .filter(x => x !== illegalViewType)
            .map(viewType => {
              const sibling = uuidv4();
              return {
                operation: ADD_NEW_NODE,
                options() {
                  return {
                    nodeType: NodeTypes.ViewType,
                    properties: {
                      [NodeProperties.ViewType]: viewType,
                      [NodeProperties.UIText]: `[${viewType}] ${GetNodeTitle(
                        target
                      )} => ${GetNodeTitle(source)}`
                    },
                    ...(useModelAsType
                      ? { parent: target, groupProperties: {} }
                      : {}),
                    links: [
                      {
                        target: target,
                        linkProperties: {
                          properties: {
                            ...properties,
                            viewType,
                            sibling,
                            target: target
                          }
                        }
                      },
                      {
                        target: source,
                        linkProperties: {
                          properties: {
                            ...properties,
                            viewType,
                            sibling,
                            source: source
                          }
                        }
                      }
                    ]
                  };
                }
              };
            })
        )(dispatch, getState);
      } else {
        if (illegalViewType !== properties.viewType) {
          PerformGraphOperation([
            {
              operation: ADD_NEW_NODE,
              options() {
                return {
                  nodeType: NodeTypes.ViewType,
                  properties: {
                    [NodeProperties.UIText]: `[${
                      properties.viewType
                      }] ${GetNodeTitle(target)}:${GetNodeTitle(source)}`
                  },
                  links: [
                    {
                      target: target,
                      linkProperties: {
                        properties: { ...properties, sibling }
                      }
                    },
                    {
                      target: source,
                      linkProperties: {
                        properties: { ...properties, sibling }
                      }
                    }
                  ]
                };
              }
            }
          ])(dispatch, getState);
        }
      }
    }
  };
}
export function GetConditionNodes(id) {
  const state = _getState();
  return GraphMethods.GetConditionNodes(state, id);
}
export function IsAgent(node) {
  return GetNodeProp(node, NodeProperties.IsAgent);
}
export function GetLinkChainItem(options) {
  return GraphMethods.GetLinkChainItem(GetState(), options);
}
export function GetCodeName(node, options) {
  const graph = GetCurrentGraph(GetState());
  if (typeof node === "string") {
    node = GraphMethods.GetNode(graph, node);
  }
  if (options && options.includeNameSpace) {
    if (GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.DataChain) {
      const collections = GraphMethods.GetNodesLinkedTo(graph, {
        id: node.id,
        link: NodeConstants.LinkType.DataChainCollection,
        direction: GraphMethods.SOURCE
      });
      if (collections && collections.length) {
        return `${computeNamespace(collections[0])}.${GetNodeProp(
          node,
          NodeProperties.CodeName
        )}`;
      }
    }
  }
  return GetNodeProp(node, NodeProperties.CodeName);
}

export function GetRelativeDataChainPath(node) {
  const graph = GetCurrentGraph();
  const collections = GraphMethods.GetNodesLinkedTo(graph, {
    id: node.id,
    link: NodeConstants.LinkType.DataChainCollection,
    direction: GraphMethods.SOURCE
  });
  if (collections && collections.length) {
    return [...GetRelativeDataChainPath(collections[0]), GetJSCodeName(node)];
  }
  return [GetJSCodeName(node)];
}

export function computeNamespace(node) {
  const graph = GetCurrentGraph(GetState());
  const dc = GraphMethods.GetNodesLinkedTo(graph, {
    id: node.id,
    link: NodeConstants.LinkType.DataChainCollection,
    direction: GraphMethods.SOURCE
  });
  if (dc && dc.length) {
    const namesp = computeNamespace(dc[0]);
    if (namesp) {
      return `${namesp}.${GetJSCodeName(node)}`;
    }
  }
  return `${GetJSCodeName(node)}`;
}

export function GetJSCodeName(node) {
  const l = GetCodeName(node);
  if (l) {
    return l.toJavascriptName();
  }
  return l;
}

export function GetModelPropertyChildren(id, options = {}) {
  const { skipLogicalChildren } = options;
  const propertyNodes = GetModelPropertyNodes(id);
  const logicalChildren = skipLogicalChildren ? [] : GetLogicalChildren(id);
  let userModels = [];
  if (
    GetNodeProp(id, NodeProperties.NODEType) === NodeTypes.Model ||
    GetNodeProp(id, NodeProperties.IsUser)
  ) {
    userModels = GetUserReferenceNodes(id);
  }
  return [...userModels, ...propertyNodes, ...logicalChildren].filter(
    x => x.id !== id
  ).unique(v => v.id);
}
export function GetMethodParameters(methodId) {
  const method = GetNodeById(methodId);
  if (method) {
    const methodType = GetNodeProp(method, NodeProperties.FunctionType);
    if (methodType && MethodFunctions[methodType]) {
      const { parameters } = MethodFunctions[methodType];
      if (parameters) {
        return parameters;
      }
    }
  }
  return null;
}
export function updateMethodParameters(current, methodType, viewPackages) {
  return (dispatch, getState) => {
    const state = getState();
    const graph = GetRootGraph(state);
    const toRemove = [];
    graphOperation(
      UpdateMethodParameters({
        methodType,
        current,
        viewPackages
      })
    )(dispatch, getState);
  };
}
export function Connect(source, target, linkProperties) {
  return {
    target,
    source,
    properties: { ...(linkProperties || {}) }
  };
}
export function attachMethodToMaestro(
  methodNodeId,
  modelId,
  options,
  viewPackage
) {
  return (dispatch, getState) => {
    let controller = false;
    let maestro = false;
    if (options && options.maestro) {
      PerformGraphOperation([
        {
          operation: ADD_LINK_BETWEEN_NODES,
          options(graph) {
            return {
              source: options.maestro,
              target: methodNodeId,
              properties: {
                ...LinkProperties.FunctionLink
              }
            };
          }
        }
      ])(dispatch, getState);
      return;
    }
    PerformGraphOperation([
      {
        operation: ADD_NEW_NODE,
        options(graph) {
          const state = getState();
          const _controller = NodesByType(state, NodeTypes.Controller).find(x => {
            return GraphMethods.existsLinkBetween(graph, {
              target: modelId,
              source: x.id,
              link: NodeConstants.LinkType.ModelTypeLink
            });
          });

          if (!_controller) {
            return {
              nodeType: NodeTypes.Controller,
              properties: {
                ...(viewPackage || {}),
                [NodeProperties.UIText]: `${GetNodeTitle(modelId)} Controller`
              },
              links: [
                {
                  target: modelId,
                  properties: {
                    ...LinkProperties.ModelTypeLink
                  }
                }
              ],
              callback: _controller => {
                controller = _controller;
              }
            };
          }
          controller = _controller;

        }
      },
      {
        operation: CHANGE_NODE_PROPERTY,
        options(graph) {
          return {
            id: controller.id,
            value: "systemUser",
            prop: NodeProperties.CodeUser
          };
        }
      },
      {
        operation: ADD_NEW_NODE,
        options(graph) {
          const state = getState();

          const _maestro = NodesByType(state, NodeTypes.Maestro).find(x => {
            return GraphMethods.existsLinkBetween(graph, {
              target: modelId,
              source: x.id,
              link: NodeConstants.LinkType.ModelTypeLink
            });
          });

          if (!_maestro) {
            return {
              nodeType: NodeTypes.Maestro,
              properties: {
                ...(viewPackage || {}),
                [NodeProperties.UIText]: `${GetNodeTitle(modelId)} Maestro`
              },
              links: [
                {
                  target: modelId,
                  properties: {
                    ...LinkProperties.ModelTypeLink
                  }
                }
              ],
              callback: _maestro => {
                maestro = _maestro;
              }
            };
          }
          maestro = _maestro;

        }
      },
      {
        operation: ADD_LINK_BETWEEN_NODES,
        options(graph) {
          return {
            source: controller.id,
            target: maestro.id,
            properties: {
              ...LinkProperties.MaestroLink
            }
          };
        }
      },
      {
        operation: ADD_LINK_BETWEEN_NODES,
        options(graph) {
          return {
            source: maestro.id,
            target: methodNodeId,
            properties: {
              ...LinkProperties.FunctionLink
            }
          };
        }
      }
    ])(dispatch, getState);
  };
}
export function GetMethodParametersFor(methodId, type) {
  const method = GetNodeById(methodId);
  if (method) {
    const methodType = GetNodeProp(method, NodeProperties.FunctionType);
    if (methodType && MethodFunctions[methodType]) {
      const { permission, validation } = MethodFunctions[methodType];
      switch (type) {
        case NodeTypes.Permission:
          return permission ? permission.params : null;
        case NodeTypes.Validator:
          return validation ? validation.params : null;
      }
    }
  }
  return null;
}
export function GetNodeById(node, graph) {
  return GraphMethods.GetNode(graph || GetCurrentGraph(GetState()), node);
}
export function GetNodesByProperties(props, graph, state) {
  const currentGraph = graph || GetCurrentGraph(state || GetState());
  if (currentGraph) {
    return [...currentGraph.nodes.map(t => currentGraph.nodeLib[t])].filter(
      x => {
        for (const i in props) {
          if (props[i] !== GetNodeProp(x, i)) {
            return false;
          }
        }
        return true;
      }
    );
  }
  return [];
}
export function GetNodeByProperties(props, graph, state) {
  return GetNodesByProperties(props, graph, state).find(x => x);
}

export function GetChildComponentAncestors(id) {
  return GraphMethods.GetChildComponentAncestors(_getState(), id);
}

export function GetMethodDefinition(id) {
  return MethodFunctions[GetMethodFunctionType(id)];
}
export function GetMethodFunctionType(id) {
  const state = _getState();
  const method = GraphMethods.GetMethodNode(state, id);

  return GetNodeProp(method, NodeProperties.FunctionType);
}
export function GetMethodFunctionValidation(id) {
  const state = _getState();
  const method = GraphMethods.GetMethodNode(state, id);
  return GetNodeProp(method, NodeProperties.MethodFunctionValidation);
}
export function GetPermissionNode(id) {
  const state = _getState();
  return GraphMethods.GetPermissionNode(state, id);
}
export function GetValidationNode(id) {
  const state = _getState();
  return GraphMethods.GetValidationNode(state, id);
}
export function GetDataSourceNode(id) {
  const state = _getState();
  return GraphMethods.GetDataSourceNode(state, id);
}
export function GetModelItemFilter(id) {
  const state = _getState();
  return GraphMethods.GetModelItemFilter(state, id);
}
export function GetPermissionsConditions(id) {
  return _getPermissionsConditions(_getState(), id);
}
export function GetServiceInterfaceMethodCalls(id) {
  const state = GetState();
  const graph = GetRootGraph(state);
  return GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).filter(
    x =>
      GetNodeProp(x, NodeProperties.NODEType) ===
      NodeTypes.ServiceInterfaceMethod
  );
}
export function GetServiceInterfaceCalls(id) {
  const state = GetState();
  const graph = GetRootGraph(state);
  return GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ServiceInterface
  );
}
export function GetValidationsConditions(id) {
  return _getValidationConditions(_getState(), id);
}
export function GetModelItemConditions(id) {
  return _getValidationConditions(_getState(), id);
}
export function GetConditionSetup(condition) {
  return GetNodeProp(condition, NodeProperties.Condition);
}
export function GetDataChainEntryNodes(cs) {
  return GraphMethods.GetDataChainEntryNodes(_getState(), cs);
}
export function GetLambdaDefinition(method) {
  const functionType = GetNodeProp(method, NodeProperties.FunctionType);
  const { lambda } = MethodFunctions[functionType];
  return lambda;
}
export function GenerateDataChainArguments(id) {
  const currentNode = GetNodeById(id);
  let _arguments = "";
  if (GetNodeProp(currentNode, NodeProperties.CS)) {
    const methods = GraphMethods.GetNodesLinkedTo(null, {
      id: currentNode.id,
      link: NodeConstants.LinkType.DataChainLink,
      componentType: NodeTypes.Method
    });
    if (methods.length) {
      const functionType = GetNodeProp(methods[0], NodeProperties.FunctionType);
      const { lambda } = MethodFunctions[functionType];
      if (lambda && lambda.default) {
        const methodProps = GetMethodProps(methods[0]);
        _arguments = Object.keys(lambda.default)
          .filter(x => x !== "return")
          .map(key => {
            return `${key.split(".").join("")}:${key} `;
          })
          .join(", ");
      }
    }
  }
  return _arguments;
}
export function GenerateCSChainFunction(id) {
  const lastNodeName = GenerateCDDataChainMethod(id);
  const arbiters = GetArbitersInCSDataChainMethod(id);
  const outputType = GetOutputTypeInCSDataChainMethod(id);
  const arbiterInterfaces = arbiters
    .map(arb => `IRedArbiter<${GetCodeName(arb)}> _arbiter${GetCodeName(arb)}`)
    .join(", ");
  const arbiterSets = addNewLine(
    arbiters
      .map(arb => `arbiter${GetCodeName(arb)} = _arbiter${GetCodeName(arb)};`)
      .join(NodeConstants.NEW_LINE)
  );
  const arbiterProperties = arbiters
    .map(arb => `IRedArbiter<${GetCodeName(arb)}> arbiter${GetCodeName(arb)};`)
    .join(NodeConstants.NEW_LINE);
  const currentNode = GetNodeById(id);
  let _arguments = "";
  if (GetNodeProp(currentNode, NodeProperties.CS)) {
    const methods = GraphMethods.GetNodesLinkedTo(null, {
      id: currentNode.id,
      link: NodeConstants.LinkType.DataChainLink,
      componentType: NodeTypes.Method
    });
    if (methods.length) {
      const functionType = GetNodeProp(methods[0], NodeProperties.FunctionType);
      const { lambda } = MethodFunctions[functionType];
      if (lambda && lambda.default) {
        const methodProps = GetMethodProps(methods[0]);
        _arguments = Object.keys(lambda.default)
          .filter(x => x !== "return")
          .map(key => {
            return `${GetCodeName(methodProps[lambda.default[key]]) ||
              lambda.default[key]} ${key.split(".").join("")}`;
          })
          .join(", ");
      }
    }
  }
  const method = `public class ${GetCodeName(id)}
{
${arbiterProperties}
    public ${GetCodeName(id)}(${arbiterInterfaces}) {
${arbiterSets}
    }
    public async Task<${GetCodeName(outputType)}> Execute(${_arguments}) {
      ${lastNodeName}
    }
}`;

  return method;
}
export function GenerateChainFunction(id, cs) {
  const chain = GetDataChainParts(id);
  let args = null;
  const observables = [];
  const setArgs = [];
  const subscribes = [];
  const setProcess = [];
  const funcs = chain.map((c, index) => {
    if (index === 0) {
      args = GetDataChainArgs(c);
    }
    const temp = GenerateDataChainMethod(c);
    observables.push(GenerateObservable(c, index));
    setArgs.push(GenerateArgs(c, chain));
    setProcess.push(GenerateSetProcess(c, chain));
    subscribes.push(GetSubscribes(c, chain));
    return temp;
  });
  const index = chain.indexOf(id);
  const nodeName = (GetJSCodeName(id) || "node" + index).toJavascriptName();
  const lastLink = GetLastChainLink(chain);
  const lastLinkindex = chain.indexOf(lastLink);
  const lastNodeName = (
    GetJSCodeName(lastLink) || "node" + lastLinkindex
  ).toJavascriptName();
  const method = `export function  ${GetCodeName(id)}(${args.join()}) {
${observables.join(NodeConstants.NEW_LINE)}
${setArgs.join(NodeConstants.NEW_LINE)}
${setProcess.join(NodeConstants.NEW_LINE)}
${subscribes.join(NodeConstants.NEW_LINE)}
${nodeName}.update($id , '$id');

return ${lastNodeName}.value;
}`;

  return method;
}
export function GenerateSetProcess(id, parts) {
  const index = parts.indexOf(id);
  const nodeName = (GetJSCodeName(id) || "node" + index).toJavascriptName();
  return `${nodeName}.setProcess(${GenerateDataChainMethod(id)})`;
}

export function GetSubscribes(id, parts) {
  const node = GetNodeById(id);
  const index = parts.indexOf(id);
  const nodeName = (GetJSCodeName(id) || "node" + index).toJavascriptName();
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  if (
    functionType &&
    DataChainFunctions[functionType] &&
    DataChainFunctions[functionType].merge
  ) {
    // pulls args from other nodes
    const args = Object.keys(DataChainFunctions[functionType].ui).map(
      (key, kindex) => {
        const temp = GetNodeProp(node, DataChainFunctions[functionType].ui[key]);
        return `${(
          GetJSCodeName(temp) || "node" + parts.indexOf(temp)
        ).toJavascriptName()}`;
      }
    );
    if (args && args.length) {
      return `${args
        .map(
          v => `${v}.subscribe(${nodeName});
`
        )
        .join("")}`;
    }
  } else {
    const parent = GetNodeProp(node, NodeProperties.ChainParent);
    if (parent) {
      return `${GetJSCodeName(
        parent
      ).toJavascriptName()}.subscribe(${nodeName})`;
    }
  }
  return "";
}

export function GenerateArgs(id, parts) {
  const node = GetNodeById(id);
  const index = parts.indexOf(id);
  const nodeName = (GetJSCodeName(id) || "node" + index).toJavascriptName();
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  if (
    functionType &&
    DataChainFunctions[functionType] &&
    DataChainFunctions[functionType].merge
  ) {
    // pulls args from other nodes
    const args = Object.keys(DataChainFunctions[functionType].ui).map(
      (key, kindex) => {
        const temp = GetNodeProp(node, DataChainFunctions[functionType].ui[key]);
        return `['${(
          GetJSCodeName(temp) || "node" + parts.indexOf(temp)
        ).toJavascriptName()}']: ${kindex}`;
      }
    );

    return `${nodeName}.setArgs({ ${args} })`;
  }
  const parent = GetNodeProp(node, NodeProperties.ChainParent);
  if (parent) {
    return `${nodeName}.setArgs({ ['${GetJSCodeName(
      parent
    ).toJavascriptName()}']: 0 })`;
  }
  return `${nodeName}.setArgs({ $id: 0 })`;


  return "";
}

export function GetLastChainLink(parts) {
  const lastLink = parts.find(id => {
    return GetNodeProp(GetNodeById(id), NodeProperties.AsOutput);
  });
  return lastLink;
}
export function GenerateObservable(id, index) {
  const nodeName = GetJSCodeName(id);
  return `let ${nodeName} = new RedObservable('${nodeName}');`;
}

export function GenerateDataChainFunc(id, chain, index) {
  const nodeName = GetCodeName(id);
  //Should be able to capture the args throw the link between nodes.
  return `private async Task ${nodeName}(/*define args*/) {
    throw new NotImplementedException();
  }`;
}
export function GetDataChainArgs(id) {
  const node = GetNodeById(id);
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  if (functionType && DataChainFunctions[functionType]) {
    const { merge, ui } = DataChainFunctions[functionType];
    if (merge) {
      return Object.keys(ui);
    }
    return ["$id"];
  }
  return [];
}

export function GenerateChainFunctions(options) {
  const { cs, language, collection } = options;
  const graph = GetCurrentGraph();
  const entryNodes = GetDataChainEntryNodes(cs)
    .filter(x => {
      const uiType = GetNodeProp(x, NodeProperties.UIType);
      if (uiType) {
        return language === uiType;
      }
      return true;
    })
    .map(x => x.id)
    .filter(ct => {
      const collections = GraphMethods.GetNodesLinkedTo(graph, {
        id: ct,
        link: NodeConstants.LinkType.DataChainCollection
      });
      if (collection) {
        return collections.find(v => v.id === collection);
      }
      return !collections || !collections.length;
    });
  const temp = entryNodes
    .map(v =>
      cs
        ? { node: v, class: GenerateCSChainFunction(v) }
        : GenerateChainFunction(v)
    )
    .unique(x => x);
  // sorry this is bad.
  if (cs) {
    return temp;
  }
  return temp.join(NodeConstants.NEW_LINE);
}
export function CollectionIsInLanguage(graph, collection, language) {
  const uiTypeOfCollection = GetNodeProp(collection, NodeProperties.UIType);
  if (uiTypeOfCollection && uiTypeOfCollection === language) {
    return true;
  }
  if (uiTypeOfCollection) {
    return false;
  }
  const reference = GraphMethods.GetNodeLinkedTo(graph, {
    id: collection,
    link: NodeConstants.LinkType.DataChainCollectionReference
  });
  if (reference) {
    if (GetNodeProp(reference, NodeProperties.NODEType) === NodeTypes.Screen) {
      return true;
    } if (GetNodeProp(reference, NodeProperties.UIType) === language) {
      return true;
    } if (GetNodeProp(reference, NodeProperties.UIType)) {
      return false;
    }
    const parent = GraphMethods.GetNodesLinkedTo(graph, {
      id: collection,
      link: NodeConstants.LinkType.DataChainCollection,
      direction: GraphMethods.TARGET
    }).filter(
      x =>
        GetNodeProp(x, NodeProperties.NODEType) ===
        NodeTypes.DataChainCollection
    )[0];
    if (parent) {
      return CollectionIsInLanguage(graph, parent.id, language);
    }

  } else {
    return true;
  }

  return true;
}

export function GetDataChainCollections(options) {
  const { collection, language } = options;
  const graph = GetCurrentGraph();
  const temp = collection
    ? GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
      id: collection,
      link: NodeConstants.LinkType.DataChainCollection,
      direction: GraphMethods.TARGET
    }).filter(
      x =>
        GetNodeProp(x, NodeProperties.NODEType) ===
        NodeTypes.DataChainCollection &&
        CollectionIsInLanguage(graph, x.id, language)
    )
    : [];

  return NodesByType(null, NodeTypes.DataChainCollection)
    .filter(x => {
      if (collection) {
        const res = temp.some(v => v.id === x.id);
        if (res) {
          return true;
        }
        return false;
      }
      ///only reference the top levels in data-chain.js
      return (
        GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
          id: x.id,
          link: NodeConstants.LinkType.DataChainCollection,
          direction: GraphMethods.SOURCE
        }).filter(
          dcc =>
            GetNodeProp(dcc, NodeProperties.NODEType) ===
            NodeTypes.DataChainCollection
        ).length === 0 && CollectionIsInLanguage(graph, x.id, language)
      );
    })
    .map(dataChainCollection => {
      const _path = GetRelativeDataChainPath(dataChainCollection);
      return `export * as ${GetJSCodeName(dataChainCollection)} from './${
        collection ? "" : `datachains/`
        }${[..._path, GetJSCodeName(dataChainCollection)]
          .subset(_path.length - 1)
          .join("/")}';`;
    })
    .unique()
    .join(NodeConstants.NEW_LINE);
}

export function GetComponentExternalApiNode(api, parent, graph) {
  graph = graph || GetCurrentGraph();
  return GraphMethods.GetNodesLinkedTo(graph, {
    id: parent,
    link: NodeConstants.LinkType.ComponentExternalApi
  }).find(v => GetNodeTitle(v) === api);
}
export function GetComponentApiNode(api, parent, graph) {
  graph = graph || GetCurrentGraph();
  return GraphMethods.GetNodesLinkedTo(graph, {
    id: parent,
    link: NodeConstants.LinkType.ComponentInternalApi
  }).find(v => GetNodeTitle(v) === api);
}

export function GetComponentExternalApiNodes(parent, graph) {
  graph = graph || GetCurrentGraph();
  return GraphMethods.GetNodesLinkedTo(graph, {
    id: parent,
    link: NodeConstants.LinkType.ComponentExternalApi
  });
}

export function GetNodeMethodCall(id, graph) {
  graph = graph || GetCurrentGraph();
  return GraphMethods.GetNodesLinkedTo(graph, {
    id,
    link: NodeConstants.LinkType.MethodCall
  }).find(v => v);
}

export function GetComponentInternalApiNode(api, parent, graph) {
  graph = graph || GetCurrentGraph();
  return GraphMethods.GetNodesLinkedTo(graph, {
    id: parent,
    link: NodeConstants.LinkType.ComponentInternalApi
  }).find(v => GetNodeTitle(v) === api);
}

export function GenerateChainFunctionSpecs(options) {
  const { language, collection } = options;
  const result = [];
  const graph = GetCurrentGraph();
  const entryNodes = GetDataChainEntryNodes()
    .filter(x => {
      const uiType = GetNodeProp(x, NodeProperties.UIType);
      if (uiType) {
        return language === uiType;
      }
      return true;
    })
    .map(x => x.id)
    .filter(ct => {
      const collections = GraphMethods.GetNodesLinkedTo(graph, {
        id: ct,
        link: NodeConstants.LinkType.DataChainCollection
      });
      if (collection) {
        return collections.find(v => v.id === collection);
      }
      return !collections || !collections.length;
    });

  const basicentryvalues = [
    undefined,
    null,
    0,
    {},
    "a string",
    1.1,
    [],
    [1],
    ["1"],
    ["1", 1]
  ];

  entryNodes.map(entryNode => {
    basicentryvalues.map(val => {
      result.push(GenerateSimpleTest(entryNode, val));
    });
  });
  return result;
}
export function GenerateSimpleTest(node, val) {
  let _value = ["object", "string"].some(
    v => typeof val === v && val !== undefined && val !== null
  )
    ? JSON.stringify(val)
    : val;
  if (val === undefined) {
    _value = "undefined";
  } else if (val === null) {
    _value = "null";
  }
  const template = `it('${GetCodeName(node)} - should be able to handle a "${
    typeof val === "object" ? JSON.stringify(val) : val
    }"', () => {
    let error = undefined;
    try {
        DC.${GetCodeName(node, {
      includeNameSpace: true
    })}(${_value});
    }
    catch(e) {
        error = e;
        console.error(e);
    }
    expect(error === undefined).toBeTruthy(error);
})`;
  return template;
}
export function GetDataChainNext(id, graph) {
  graph = graph || GetRootGraph(_getState());
  if (!graph) {
    throw "no graph found";
  }
  const current = id;
  const groupDaa = GetNodeProp(GetNodeById(current), NodeProperties.Groups);

  if (groupDaa && groupDaa.group) {
    const group = GraphMethods.GetGroup(graph, groupDaa.group);
    if (group) {
      const entryNode = GetGroupProp(
        group.id,
        NodeConstants.GroupProperties.GroupEntryNode
      );
      if (entryNode === current) {
        const exitNode = GetGroupProp(
          group.id,
          NodeConstants.GroupProperties.ExternalExitNode
        );
        return GetNodeById(exitNode);
      }
    }
  }
  const next = GraphMethods.getNodesByLinkType(graph, {
    id: current,
    type: NodeConstants.LinkType.DataChainLink,
    direction: GraphMethods.SOURCE
  })
    .filter(x => x.id !== current)
    .sort((a, b) => {
      const a_ = GetNodeProp(a, NodeProperties.ChainParent) ? 1 : 0;
      const b_ = GetNodeProp(b, NodeProperties.ChainParent) ? 1 : 0;
      return a_ - b_;
    })
    .unique(x => x.id)[0];
  return next;
}
export function GetDataChainNextId(id, graph) {
  const next = GetDataChainNext(id, graph);
  return next && next.id;
}
export function GetDataChainParts(id, result) {
  result = result || [id];
  result.push(id);
  result = [...result].unique();
  const node = GetNodeById(id);
  const nodeGroup = GetNodeProp(node, NodeProperties.Groups) || {};
  let groups = Object.values(nodeGroup);
  const current = id;
  const dataChains = NodesByType(_getState(), NodeTypes.DataChain);
  let oldlength;
  do {
    oldlength = result.length;
    const dc = dataChains.filter(x =>
      result.some(v => v === GetNodeProp(x, NodeProperties.ChainParent))
    );
    result.push(...dc.map(v => v.id));
    dc.map(_dc => {
      groups = [
        ...groups,
        ...Object.values(GetNodeProp(_dc, NodeProperties.Groups) || {})
      ];
    });
    groups.map(g => {
      const nodes = GetNodesInGroup(g);
      result.push(...nodes);
    });
    result = result.unique();
  } while (result.length !== oldlength);

  return result;
}
export function GetNodesInGroup(groupId) {
  return GraphMethods.GetNodesInGroup(GetCurrentGraph(_getState()), groupId);
}
export function GetDataChainFrom(id) {
  const result = [id];
  let current = id;
  const graph = GetRootGraph(_getState());
  if (!graph) {
    throw "no graph found";
  }
  for (let i = 0; i < 10; i++) {
    const next = GetDataChainNext(current);
    current = null;
    if (next && next.id) {
      result.push(next.id);
      current = next.id;
    } else {
      break;
    }
  }

  return result;
}
export function getGroup(id, graph) {
  // return graph.groupLib[id];
  return GraphMethods.getGroup(graph || GetCurrentGraph(_getState()), id);
}
export function hasGroup(id, graph) {
  //    return !!(graph.nodeLib[parent] && GetNodeProp(graph.nodeLib[parent], NodeProperties.Groups));
  return GraphMethods.hasGroup(graph || GetCurrentGraph(_getState()), id);
}

export function IsEndOfDataChain(id) {
  return GetDataChainFrom(id).length === 1;
}

export function GetLambdaVariableNode(id, key) {
  const currentNode = GetNodeById(id);
  if (GetNodeProp(currentNode, NodeProperties.CS)) {
    const methods = GraphMethods.GetNodesLinkedTo(null, {
      id: currentNode.id,
      link: NodeConstants.LinkType.DataChainLink,
      componentType: NodeTypes.Method
    });
    if (methods.length) {
      const functionType = GetNodeProp(methods[0], NodeProperties.FunctionType);
      const { lambda } = MethodFunctions[functionType];
      if (lambda && lambda.default) {
        const methodProps = GetMethodProps(methods[0]);

        return GetNodeById(methodProps[key]);
      }
    }
  }
  return null;
}

export function GetArbitersInCSDataChainMethod(id) {
  const node = GetNodeById(id);
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  const lambda = GetNodeProp(node, NodeProperties.Lambda);

  const result = [];
  switch (functionType) {
    case DataChainFunctionKeys.Lambda:
      getReferenceInserts(lambda)
        .map(v => v.substr(2, v.length - 3))
        .unique()
        .map(_insert => {
          const temp = _insert.split("@");
          const insert = temp.length > 1 ? temp[1] : temp[0];
          if (temp.length > 1) {
            switch (temp[0]) {
              case "arbiter get":
                const lambdaNode = GetLambdaVariableNode(id, insert);
                if (lambdaNode) result.push(lambdaNode);
                break;
              default:
                break;
            }
          }
        });
  }
  return result;
}

export function GetOutputTypeInCSDataChainMethod(id) {
  const node = GetNodeById(id);
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  const lambda = GetNodeProp(node, NodeProperties.Lambda);

  let result = null;
  switch (functionType) {
    case DataChainFunctionKeys.Lambda:
      getReferenceInserts(lambda)
        .map(v => v.substr(2, v.length - 3))
        .unique()
        .map(_insert => {
          const temp = _insert.split("@");
          const insert = temp.length > 1 ? temp[1] : temp[0];
          if (temp.length > 1) {
            if (temp[0].indexOf("return") === 0) {
              const vari = temp[0].split(" ").filter(x => x);
              const lambdaNode = GetLambdaVariableNode(id, vari[vari.length - 1]);
              if (lambdaNode) result = lambdaNode;
            }
          }
        });
  }
  return result;
}
export function GenerateCDDataChainMethod(id) {
  const node = GetNodeById(id);
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  let lambda = GetNodeProp(node, NodeProperties.Lambda);
  const lambdaInsertArguments = GetNodeProp(
    node,
    NodeProperties.LambdaInsertArguments
  );
  switch (functionType) {
    case DataChainFunctionKeys.Lambda:
      getReferenceInserts(lambda)
        .map(v => v.substr(2, v.length - 3))
        .unique()
        .map(_insert => {
          const temp = _insert.split("@");
          const insert = temp.length > 1 ? temp[1] : temp[0];
          if (temp.length > 1) {
            let swap = temp[0];
            const args = insert.split("~");
            const model = args[0];
            const property = args[1];

            switch (temp[0]) {
              case "arbiter get":
                const lambdaNode = GetLambdaVariableNode(id, insert);
                swap = `await arbiter${GetCodeName(
                  lambdaNode
                )}.Get<${GetCodeName(lambdaNode)}>`;
                break;
              default:
                if (property) {
                  const lambdaNode = lambdaInsertArguments[property];
                  swap = `${model}.${GetCodeName(lambdaNode)}`;
                }
                break;
            }
            lambda = lambda.replace(`#{${_insert}}`, swap);
          } else {
            const args = insert.split("~");
            const property = args[0];
            const prop = lambdaInsertArguments[property];
            const node = GetNodeById(prop);
            lambda = bindReferenceTemplate(lambda, {
              [property]: GetCodeName(node)
            });
          }
        });
      return `${lambda}`;
    default:
      throw `${GetNodeTitle(node)} ${
      node.id
      } - ${functionType} is not a defined function type.`;
  }
}
export function GenerateDataChainMethod(id) {
  const node = GetNodeById(id);
  const model = GetNodeProp(node, NodeProperties.UIModelType);
  const stateKey = GetNodeProp(node, NodeProperties.StateKey);
  const modelKey = GetNodeProp(node, NodeProperties.ModelKey);
  const viewModelKey = GetNodeProp(node, NodeProperties.ViewModelKey);
  const numberParameter = GetNodeProp(node, NodeProperties.NumberParameter);
  const property = GetNodeProp(node, NodeProperties.Property);
  const functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
  const func = GetCodeName(GetNodeProp(node, NodeProperties.DataChainReference));
  const funcs = GetNodeProp(node, NodeProperties.DataChainReferences);
  const selectorProp = GetNodeProp(node, NodeProperties.SelectorProperty);
  const nodeInput1 = GetNodeProp(node, NodeProperties.ChainNodeInput1);
  const nodeInput2 = GetNodeProp(node, NodeProperties.ChainNodeInput2);
  const navigateMethod = GetNodeProp(node, NodeProperties.NavigationAction);
  const methodMethod = GetNodeProp(node, NodeProperties.Method);
  const $screen = GetNodeProp(node, NodeProperties.Screen);
  const useNavigationParams = GetNodeProp(
    node,
    NodeProperties.UseNavigationParams
  );
  let lambda = GetNodeProp(node, NodeProperties.Lambda);
  const lambdaInsertArguments = GetNodeProp(
    node,
    NodeProperties.LambdaInsertArguments
  );
  const listReference = GetNodeProp(node, NodeProperties.List);
  let lastpart = "return item;";
  switch (functionType) {
    case DataChainFunctionKeys.ModelProperty:
      if (property) {
        lastpart = `if(item) {
        return item.${GetJSCodeName(property) || property};
    }
    return null;`;
      }
      return `(id) => {
    let item = typeof(id) ==='object' ? id : GetItem(Models.${GetCodeName(
        model
      )}, id);
    ${lastpart}
}`;
    case DataChainFunctionKeys.Model:
      return `(id) => {
    let item = GetItem(Models.${GetCodeName(model)}, id);
    if(!item && id) {
      fetchModel(Models.${GetCodeName(model)}, id);
    }
    ${lastpart}
}`;
    case DataChainFunctionKeys.Pass:
      return `(arg) => {
    return arg;
}`;
    case DataChainFunctionKeys.NewRedGraph:
      return `() => {
        let menuData = new RedGraph();
        // for (var i = 0; i < 12; i++) {
        //   RedGraph.addNode(menuData, { title: "Menu Node " + i, id: i + 1 }, i + 1);
        //   if (i > 2) RedGraph.addLink(menuData, 2, i + 1);
        //   else RedGraph.addLink(menuData, null, i + 1);
        // }
        return menuData;
      }`;
    case DataChainFunctionKeys.AddUrlsToGraph:
      return `graph => {
        Object.keys(routes).map(route=>{
          RedGraph.addNode(graph, { title: route, id: route } , route);
          RedGraph.addLink(graph, null, route);
        });
        return graph;
      }`;
    case DataChainFunctionKeys.StringConcat:
      return `(node1, node2) => { return \`\${node1} \${node2}\` }`;
    case DataChainFunctionKeys.EmailValidation:
      return `(value) => validateEmail(value)`;
    case DataChainFunctionKeys.AlphaNumericLike:
      return `(value) => alphanumericLike(value)`;
    case DataChainFunctionKeys.AlphaNumeric:
      return `(value) => alphanumeric(value)`;
    case DataChainFunctionKeys.AlphaOnly:
      return `(value) => alpha(value)`;
    case DataChainFunctionKeys.BooleanAnd:
      return `(a, b) => a && b`;
    case DataChainFunctionKeys.BooleanOr:
      return `(a, b) => a || b`;
    case DataChainFunctionKeys.IfTrue:
      return `(a, b) => {
        if(a) {
          return b;
        }
        return undefined;
      }`;
    case DataChainFunctionKeys.IfThanElse:
      return `(a) => {
        if(a){
          return ${GetCodeName(nodeInput1)}(a);
        }
        else {
          return ${GetCodeName(nodeInput2)}(a);
        }
      }`;
    case DataChainFunctionKeys.GreaterThanOrEqualTo:
      return `(a) => greaterThanOrEqualTo(a, ${numberParameter})`;
    case DataChainFunctionKeys.Map:
      return `($a) => ($a || []).map(${lambda})`;
    case DataChainFunctionKeys.Lambda:
      getReferenceInserts(lambda)
        .map(v => v.substr(2, v.length - 3))
        .unique()
        .map(insert => {
          const args = insert.split("~");
          const property = args.length > 1 ? args[1] : args[0];
          const model = args[0];
          const prop = lambdaInsertArguments[property];
          const node = GetNodeById(prop);
          let bindValue = GetCodeName(node);
          if (args.length > 1) {
            bindValue = bindValue.toLowerCase();
          }
          lambda = bindReferenceTemplate(lambda, {
            [insert]: bindValue
          });
        });
      return `${lambda}`;
    case DataChainFunctionKeys.Merge:
      return `() => {
        ${Object.keys(funcs || {})
          .map(key => {
            return `let ${key} = ${GetCodeName(funcs[key])}();`;
          })
          .join(NodeConstants.NEW_LINE)}
        ${lambda}
      }`;
    case DataChainFunctionKeys.ListReference:
      return `(a) => RedLists.${GetCodeName(listReference)}`;
    case DataChainFunctionKeys.NumericalDefault:
      return `(a) => numericalDefault(a, ${numberParameter})`;
    case DataChainFunctionKeys.ArrayLength:
      return `(a) => arrayLength(a)`;
    case DataChainFunctionKeys.LessThanOrEqualTo:
      return `(a) => lessThanOrEqualTo(a, ${numberParameter})`;
    case DataChainFunctionKeys.MaxLength:
      return `(a) => maxLength(a, ${numberParameter})`;
    case DataChainFunctionKeys.MinLength:
      return `(a) => minLength(a, ${numberParameter})`;
    case DataChainFunctionKeys.EqualsLength:
      return `(a) => equalsLength(a, ${numberParameter})`;
    case DataChainFunctionKeys.GreaterThan:
      return `(a) => greaterThan(a, ${numberParameter})`;
    case DataChainFunctionKeys.Property:
      return `(a) => a ? a.${GetJSCodeName(property) || property} : null`;
    case DataChainFunctionKeys.ReferenceDataChain:
      return `(a) => ${func}(a)`;
    case DataChainFunctionKeys.Navigate:
      let insert = "";
      if (useNavigationParams) {
        insert = `Object.keys(a).map(v=>{
          let regex =  new RegExp(\`\\:$\{v}\`, 'gm');
          route = route.replace(regex, a[v]);
        })`;
      }
      return `(a) => {
        let route = routes.${GetCodeName($screen)};
        ${insert}
        navigate.${
        NavigateTypes[navigateMethod]
        }({ route })(GetDispatch(), GetState());
        return a;
      }`;
    case DataChainFunctionKeys.NavigateTo:
      return `(a) => {
        navigate.${
        NavigateTypes[navigateMethod]
        }({ route: routes[a] })(GetDispatch(), GetState());
        return a;
      }`;
    case DataChainFunctionKeys.SetBearerAccessToken:
      return `(a) => {
        $service.setBearerAccessToken(a);
        return a;
     }`;
    case DataChainFunctionKeys.Equals:
      return `(a, b) => a === b`;
    case DataChainFunctionKeys.Required:
      return `(a) => a !== null && a !== undefined`;
    case DataChainFunctionKeys.Not:
      return `(a) => !!!a`;
    case DataChainFunctionKeys.GetModelIds:
      return `(a) => {
    if(a && a.map) {
        return a.map(item => item.id);
    }
    else {
        console.warn('"a" parameter was not an array');
    }
}`;
    case DataChainFunctionKeys.SaveModelArrayToState:
      return `(a) => { let dispatch = GetDispatch(); dispatch(UIModels(Models.${GetCodeName(
        model
      )}, a)); return a; }`;
    case DataChainFunctionKeys.SaveModelIdsToState:
      return `(a) => { let dispatch = GetDispatch(); dispatch(UIC('Data', StateKeys.${GetCodeName(
        stateKey
      )}, a)); return a; }`;
    case DataChainFunctionKeys.GetStateKeyValue:
      return `(a) =>  {
        let stateFunc = GetState();
        return GetC(stateFunc(),'Data', StateKeys.${GetCodeName(stateKey)})}`;
    case DataChainFunctionKeys.StateKey:
      return `(a) => StateKeys.${GetCodeName(stateKey)}`;
    case DataChainFunctionKeys.ModelKey:
      return `(a) => ModelKeys.${GetCodeName(modelKey)}`;
    case DataChainFunctionKeys.ViewModelKey:
      return `(a) => ViewModelKeys.${GetCodeName(viewModelKey)}`;
    case DataChainFunctionKeys.Selector:
      return `(a) => a ? a.${selectorProp} : undefined`;
    case DataChainFunctionKeys.Models:
      return `a => GetItems(Models.${GetCodeName(model)})`;
    case DataChainFunctionKeys.Validation:
      return `a => true/*TBI*/`;
    case DataChainFunctionKeys.MethodBaseValidation:
      if (methodMethod) {
        return buildValidation({ methodMethod, id });
      }
      return `a => false`;
    case DataChainFunctionKeys.ModelMethodMenu:
      return buildModelMethodMenu();
    default:
      throw `${GetNodeTitle(node)} ${
      node.id
      } - ${functionType} is not a defined function type.`;
  }
}

function buildModelMethodMenu() {
  const listPages = NodesByType(null, NodeTypes.Screen).filter(x => GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.GetAll);
  const underPages = NodesByType(null, NodeTypes.Screen).filter(x => [ViewTypes.Create, ViewTypes.GetAll].some(v => v === GetNodeProp(x, NodeProperties.ViewType)));

  const screens = listPages.map(v => `{ name: 'top-${GetCodeName(v)}' }`);
  const subscreens = underPages.map(v => {
    const tpage = listPages.find(vt => GetNodeProp(vt, NodeProperties.Model) === GetNodeProp(v, NodeProperties.Model));
    const temp = `{ name: '${GetCodeName(v)}', parent: 'top-${GetCodeName(tpage)}' }`;
    return temp;
  });

  return ` () => {
    let toppages = [${screens.join()}].map(v => ({ id: \`\${v.name}\` , title: titleService.get(v.name), parent: null }));
    let underpages = [${subscreens.join()}].filter(v =>v && routes[v.name] && routes[v.name].indexOf(':') === -1).map(v => ({ id: \`\${v.name}\` , title: titleService.get(v.name), parent: v.parent }));
    return [...toppages, ...underpages]
}`;
}
export function GetPermissionsSortedByAgent() {
  return GetNodesSortedByAgent(NodeTypes.Permission);
}

export function GetValidationsSortedByAgent() {
  return GetNodesSortedByAgent(NodeTypes.Validator);
}

export function GetNodesSortedByAgent(type) {
  const state = _getState();
  const nodes = NodesByType(state, type);

  return nodes
    .filter(node => {
      const methodNode = GraphMethods.GetMethodNode(state, node.id);
      return methodNode;
    })
    .groupBy(node => {
      const methodNode = GraphMethods.GetMethodNode(state, node.id);
      return GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent);
    });
}

export function GetArbitersForNodeType(type) {
  const state = _getState();
  const permissions = NodesByType(state, type);
  const models = [];
  permissions.map(permission => {
    const methodNode = GraphMethods.GetMethodNode(state, permission.id);
    const methodProps = GetMethodProps(methodNode);
    Object.values(methodProps).map(id => {
      const node = GetGraphNode(id);
      const nodeType = GetNodeProp(node, NodeProperties.NODEType);
      if ([NodeTypes.Model].some(v => v === nodeType)) {
        models.push(id);
      }
    });
  });
  return models.unique();
}

export function GetCustomServicesForNodeType(type) {
  const state = _getState();
  const permissions = NodesByType(state, type);
  const models = [];
  permissions.map(permission => {
    const methods = GetServiceInterfaceMethodCalls(permission.id);
    methods.map(method => {
      const services = GetServiceInterfaceCalls(method.id);
      models.push(...services.map(v => v.id));
    });
  });
  return models.unique();
}

export function GetAgentNodes() {
  return NodesByType(_getState(), NodeTypes.Model).filter(x =>
    GetNodeProp(x, NodeProperties.IsAgent)
  );
}
export function GetUsers() {
  return NodesByType(_getState(), NodeTypes.Model).filter(x =>
    GetNodeProp(x, NodeProperties.IsUser)
  );
}
export function GetArbitersForPermissions() {
  return GetArbitersForNodeType(NodeTypes.Permission);
}

export function GetArbitersForValidations() {
  return GetArbitersForNodeType(NodeTypes.Validator);
}

export function GetNameSpace() {
  const state = _getState();

  const graphRoot = GetRootGraph(state);

  const namespace = graphRoot
    ? graphRoot[GraphMethods.GraphKeys.NAMESPACE]
    : null;

  return namespace;
}

export function GetArbiterPropertyDefinitions(
  tabs = 3,
  language = NodeConstants.ProgrammingLanguages.CSHARP
) {
  const arbiters = GetArbitersForPermissions();
  const template = `IRedArbiter<{{model}}> arbiter{{model}};`;
  const tab = [].interpolate(0, tabs, () => `   `).join("");
  const definitions = arbiters.map(arbiter => {
    return (
      tab +
      bindTemplate(template, {
        model: GetCodeName(arbiter)
      })
    );
  });
  return definitions.join(NodeConstants.NEW_LINE);
}
export function GetCustomServiceDefinitions(
  type,
  tabs = 3,
  language = NodeConstants.ProgrammingLanguages.CSHARP
) {
  const services = GetCustomServicesForNodeType(type);
  const template = `I{{model}} {{model_js}};`;
  const tab = [].interpolate(0, tabs, () => `   `).join("");
  const definitions = services.map(service => {
    return (
      tab +
      bindTemplate(template, {
        model: GetCodeName(service),
        model_js: GetJSCodeName(service)
      })
    );
  });
  return definitions.join(NodeConstants.NEW_LINE);
}

export function GetArbiterPropertyImplementations(
  tabs = 4,
  language = NodeConstants.ProgrammingLanguages.CSHARP
) {
  const arbiters = GetArbitersForPermissions();
  const template = `arbiter{{model}} = RedStrapper.Resolve<IRedArbiter<{{model}}>>();`;
  const tab = [].interpolate(0, tabs, () => `   `).join("");
  const definitions = arbiters.map(arbiter => {
    return (
      tab +
      bindTemplate(template, {
        model: GetCodeName(arbiter)
      })
    );
  });
  return definitions.join(NodeConstants.NEW_LINE);
}

export function GetCustomServiceImplementations(
  type,
  tabs = 4,
  language = NodeConstants.ProgrammingLanguages.CSHARP
) {
  const services = GetCustomServicesForNodeType(type);
  const template = `{{model_js}} = RedStrapper.Resolve<I{{model}}>();`;
  const tab = [].interpolate(0, tabs, () => `   `).join("");
  const definitions = services.map(service => {
    return (
      tab +
      bindTemplate(template, {
        model: GetCodeName(service),
        model_js: GetJSCodeName(service)
      })
    );
  });
  return definitions.join(NodeConstants.NEW_LINE);
}

export function GetCombinedCondition(
  id,
  language = NodeConstants.ProgrammingLanguages.CSHARP,
  options = {}
) {
  const node = GetGraphNode(id);
  let conditions = [];
  let customMethods = [];
  let finalResult = "res";
  let tabcount = 0;
  let methodNodeParameters = null;
  let ft = null;
  let methodNode = null;
  switch (GetNodeProp(node, NodeProperties.NODEType)) {
    case NodeTypes.Permission:
      conditions = GetPermissionsConditions(id);
      customMethods = GetServiceInterfaceMethodCalls(id);
      methodNode = GetPermissionMethod(node);
      ft =
        MethodFunctions[GetNodeProp(methodNode, NodeProperties.FunctionType)];
      if (ft && ft.permission && ft.permission.params) {
        methodNodeParameters = ft.permission.params.map(t =>
          typeof t === "string" ? t : t.key
        );
      }
      finalResult = "result";
      tabcount = 3;
      break;
    case NodeTypes.ModelItemFilter:
      conditions = GetModelItemConditions(id);
      break;
    case NodeTypes.Validator:
      conditions = GetValidationsConditions(id);
      methodNode = GetNodesMethod(id);
      ft =
        MethodFunctions[GetNodeProp(methodNode, NodeProperties.FunctionType)];
      if (ft && ft.validation && ft.validation.params) {
        methodNodeParameters = ft.validation.params.map(t =>
          typeof t === "string" ? t : t.key
        );
      }
      tabcount = 3;
      finalResult = "result";
      break;
    default: break;
  }
  const tabs = [].interpolate(0, tabcount, () => `    `).join("");
  let clauses = [];
  conditions.map(condition => {
    const selectedConditionSetup = GetSelectedConditionSetup(id, condition);
    const res = GetConditionsClauses(
      id,
      selectedConditionSetup,
      language,
      options
    );
    clauses = [...clauses, ...res.map(t => t.clause)];
  });
  customMethods.map(customMethod => {
    const res = GetCustomMethodClauses(
      node,
      customMethod,
      methodNodeParameters,
      language
    );
    clauses = [...clauses, ...res.map(t => t.clause)];
  });
  const finalClause =
    clauses
      .map((_, index) => {
        return `res_` + index;
      })
      .join(" && ") || "true";
  if (options.finalResult) {
    finalResult = options.finalResult;
  }
  clauses.push(`${finalResult} = ${finalClause};`);
  return clauses
    .map((clause, index) => {
      return (
        tabs +
        bindTemplate(clause, {
          result: `res_${index}`
        })
      );
    })
    .join(NodeConstants.NEW_LINE);
}

export function GetCustomMethodClauses(
  node,
  customMethod,
  methodNodeParameters,
  language
) {
  const result = [];

  if (methodNodeParameters) {
    const serviceInterface = GetServiceInterfaceCalls(customMethod.id).find(
      x => x
    );

    if (serviceInterface) {
      switch (language) {
        case NodeConstants.UITypes.ElectronIO:
          break;
        default:
          result.push({
            clause: `var {{result}} = await ${GetJSCodeName(
              serviceInterface
            )}.${GetCodeName(customMethod)}(${methodNodeParameters.join()});`
          });
          break;
      }
    }
  }
  return result;
}
export function GetConditionsClauses(
  adjacentId,
  clauseSetup,
  language,
  options = {}
) {
  const result = [];
  if (clauseSetup) {
    Object.keys(clauseSetup).map(clauseKey => {
      const { properties } = clauseSetup[clauseKey];
      if (properties) {
        Object.keys(properties)
          .filter(modelId => {
            if (options && options.filter && options.filter.property) {
              return options.filter.property === modelId;
            }
            return true;
          })
          .map(modelId => {
            const propertyName = GetCodeName(modelId);
            const { validators } = properties[modelId];
            if (validators) {
              Object.keys(validators).map(validatorId => {
                const validator = validators[validatorId];
                const res = GetConditionClause(
                  adjacentId,
                  clauseKey,
                  propertyName,
                  validator,
                  language,
                  options
                );
                result.push({
                  clause: res,
                  id: validatorId
                });
              });
            }
          });
      }
    });
  }
  return result;
}
export function safeFormatTemplateProperty(str) {
  return str.split("-").join("_");
}
export function GetConditionClause(
  adjacentId,
  clauseKey,
  propertyName,
  validator,
  language
) {
  const method = GetNodesMethod(adjacentId);
  const clauseKeyNodeId = GetMethodNodeProp(method, clauseKey);
  let {
    type,
    template,
    templatejs,
    node,
    nodeProperty,
    many2manyProperty,
    many2many,
    many2manyMethod
  } = validator;
  const dataAccessor = "";
  const nodeNodeId = GetMethodNodeProp(method, node);
  let conditionTemplate = "";
  const condition = "";
  let properties = {};
  if (
    NodeConstants.FilterUI &&
    NodeConstants.FilterUI[type] &&
    NodeConstants.FilterUI[type].template &&
    !template
  ) {
    template = NodeConstants.FilterUI[type].template;
  }
  if (
    NodeConstants.FilterUI &&
    NodeConstants.FilterUI[type] &&
    NodeConstants.FilterUI[type].templatejs &&
    !templatejs
  ) {
    templatejs = NodeConstants.FilterUI[type].templatejs;
  }
  if (template) {
    switch (language) {
      case NodeConstants.ProgrammingLanguages.JavaScript:
        conditionTemplate = fs.readFileSync(templatejs, "utf8");
        break;
      default:
        conditionTemplate = fs.readFileSync(template, "utf8");
        break;
    }
  } else {
    throw "no template found: " + type;
  }
  if (clauseKey === "change_parameter") {
    clauseKey = clauseKey + ".Data";
  }
  switch (type) {
    case NodeConstants.FilterRules.IsInModelPropertyCollection:
    case NodeConstants.FilterRules.EqualsModelProperty:
    case NodeConstants.FilterRules.EqualsFalse:
    case NodeConstants.FilterRules.EqualsTrue:
    case NodeConstants.FilterRules.EqualsParent:
    case NodeConstants.FilterRules.IsNotInModelPropertyCollection:
      properties = {
        agent: safeFormatTemplateProperty(clauseKey),
        agent_property: safeFormatTemplateProperty(propertyName),
        model: node,
        model_property: GetCodeName(nodeProperty)
      };
      break;
    case NodeConstants.FilterRules.Many2ManyPropertyIsTrue:
      properties = {
        agent: safeFormatTemplateProperty(clauseKey),
        agent_property: safeFormatTemplateProperty(propertyName),
        agent_type: GetCodeName(clauseKeyNodeId) || "agent_type missing",
        model_type: GetCodeName(nodeNodeId) || "model_type missing",
        model: node,
        model_property: GetCodeName(nodeProperty),
        connection_type: GetCodeName(many2many),
        connection_is_true: GetConnectionClause({
          many2manyProperty,
          many2manyMethod
        }) //
      };
      break;
    case NodeConstants.ValidationRules.OneOf:
      const listItems = GenerateConstantList(validator);
      properties = {
        agent: safeFormatTemplateProperty(clauseKey),
        agent_property: safeFormatTemplateProperty(propertyName),
        agent_type: GetCodeName(clauseKeyNodeId) || "agent_type missing",
        list: listItems
      };
      break;
    case NodeConstants.ValidationRules.AlphaOnlyWithSpaces:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "AlphaOnlyWithSpacesAttribute"
      };
      break;
    case NodeConstants.ValidationRules.AlphaNumericLike:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "AlphaNumericLikeAttribute"
      };
      break;
    case NodeConstants.ValidationRules.AlphaOnly:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "AlphaOnlyAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MaxLength:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: `${validator ? validator.condition : null}`,
        validation_Func_name: "MaxLengthAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MaxLengthEqual:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: `${validator ? validator.condition : null}, true`,
        validation_Func_name: "MaxLengthAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MinLength:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: validator ? validator.condition : null,
        validation_Func_name: "MinLengthAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MinLengthEqual:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: `${validator ? validator.condition : null}, true`,
        validation_Func_name: "MinLengthAttribute"
      };
      break;

    case NodeConstants.ValidationRules.MaxValue:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: `${validator ? validator.condition : null}`,
        validation_Func_name: "MaxAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MaxValueEqual:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: `${validator ? validator.condition : null}, true`,
        validation_Func_name: "MaxAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MinValue:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: validator ? validator.condition : null,
        validation_Func_name: "MinAttribute"
      };
      break;
    case NodeConstants.ValidationRules.MinValueEqual:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: `${validator ? validator.condition : null}, true`,
        validation_Func_name: "MinAttribute"
      };
      break;
    case NodeConstants.ValidationRules.IsNull:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: ``,
        validation_Func_name: "IsNullAttribute"
      };
      break;
    case NodeConstants.ValidationRules.IsNotNull:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        parameters: ``,
        validation_Func_name: "IsNotNullAttribute"
      };
      break;
    case NodeConstants.ValidationRules.Email:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "EmailAttribute"
      };
      break;
    case NodeConstants.ValidationRules.EmailEmpty:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "EmailEmptyAttribute"
      };
      break;
    case NodeConstants.ValidationRules.Zip:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "ZipAttribute"
      };
      break;
    case NodeConstants.ValidationRules.ZipEmpty:
      properties = {
        model: clauseKey,
        model_property: propertyName,
        validation_Func_name: "ZipEmptyAttribute"
      };
      break;
    default:
      throw "Unhandled condition clause case: " + type;
  }

  return bindTemplate(conditionTemplate, {
    parameters: "",
    ...properties
  });
}
function GenerateConstantList(validator) {
  const node = GetGraphNode(validator.node);
  const { enumeration } = validator;
  switch (GetNodeProp(node, NodeProperties.NODEType)) {
    case NodeTypes.Enumeration:
      var enums = GetNodeProp(node, NodeProperties.Enumeration) || [];

      return enums
        .map(enum_ => {
          if (enumeration[enum_.id || enum_]) {
            return `${GetCodeName(validator.node)}.${NodeConstants.MakeConstant(
              enum_.value || enum_
            )}`;
          }
        })
        .filter(x => x)
        .join(", ");
    default:
      throw "not implemented capturing of enums";
  }
}
export function GetConnectionClause(args) {
  const { many2manyProperty, many2manyMethod } = args;
  switch (many2manyMethod) {
    case NodeConstants.FilterRules.EqualsTrue:
      return bindTemplate(
        "_x => _x.{{connection_property}} == {{connection_value}}",
        {
          connection_property: GetCodeName(many2manyProperty),
          connection_value: "true"
        }
      );
    case NodeConstants.FilterRules.EqualsFalse:
      return bindTemplate(
        "_x => _x.{{connection_property}} == {{connection_value}}",
        {
          connection_property: GetCodeName(many2manyProperty),
          connection_value: "false"
        }
      );
    default:
      throw "unhandle get connection clause : " + many2manyMethod;
  }
}

export function GetSelectedConditionSetup(permissionId, condition) {
  const method = GraphMethods.GetMethodNode(_getState(), permissionId);
  if (method) {
    const conditionSetup = GetConditionSetup(condition);
    if (conditionSetup && conditionSetup.methods) {
      return conditionSetup.methods[
        GetNodeProp(method, NodeProperties.FunctionType)
      ];
    }
    // console.warn('condition is improperly formed');

  } else {
    // console.warn('no method node found');
  }
  return null;
}
export function _getPermissionsConditions(state, id) {
  return _getConditions(state, id);
}

export function _getValidationConditions(state, id) {
  return _getConditions(state, id);
}
export function _getConditions(state, id) {
  const graph = GetRootGraph(state);
  return GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Condition
  );
}

export function GetComponentNodes() {
  const state = GetState();
  return NodesByType(state, NodeTypes.ComponentNode);
}
export function GetComponentNodeProperties() {
  const res = GetComponentNodes()
    .map(node => {
      const componentProperties = GetNodeProp(
        node,
        NodeProperties.ComponentProperties
      );
      const componentPropertiesList =
        GraphMethods.getComponentPropertyList(componentProperties) || [];

      return { id: node.id, componentPropertiesList };
    })
    .filter(x => x.componentPropertiesList.length)
    .groupBy(x => x.id);

  const result = [];
  Object.keys(res).map(v => {
    const componentPropertiesList = [];
    res[v]
      .map(b => componentPropertiesList.push(...b.componentPropertiesList))
      .unique(x => x.id);

    result.push({ id: v, componentPropertiesList });
  });

  return result;
}
export function GetConnectedScreenOptions(id) {
  const state = _getState();
  const graph = GetRootGraph(state);
  return GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption
  );
}
export function attachToNavigateNode(currentId, action) {
  return (dispatch, getState) => {
    graphOperation(_attachToNavigateNode(currentId, action))(
      dispatch,
      getState
    );
  };
}

export function _attachToNavigateNode(currentId, action) {
  return [
    {
      operation: ADD_NEW_NODE,
      options(currentGraph) {
        return {
          nodeType: NodeTypes.NavigationAction,
          linkProperties: {
            properties: {
              ...LinkProperties.NavigationMethod
            }
          },
          parent: currentId,
          properties: {
            [NodeProperties.UIText]: action,
            [NodeProperties.NavigationAction]: action
          }
        };
      }
    }
  ];
}
export function GetConnectedScreen(id) {
  const state = _getState();
  const graph = GetRootGraph(state);
  return GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).find(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Screen);
}
export function GetModelPropertyNodes(refId) {
  const state = _getState();
  return GraphMethods.GetLinkChain(state, {
    id: refId,
    links: [
      {
        type: NodeConstants.LinkType.PropertyLink,
        direction: GraphMethods.SOURCE
      }
    ]
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Property
  );
}

export function getTopComponent(graph, node) {
  const parent = GraphMethods.GetNodesLinkedTo(graph, {
    id: node.id,
    link: NodeConstants.LinkType.Component,
    direction: TARGET
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
  )[0];

  if (parent) {
    return getTopComponent(graph, parent);
  }
  return node;
}
export function GetParentComponent(node, graph) {
  graph = graph || GetCurrentGraph();
  const parent = GraphMethods.GetNodesLinkedTo(graph, {
    id: node.id,
    link: NodeConstants.LinkType.Component,
    direction: GraphMethods.TARGET
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
  )[0];
  return parent;
}
export function ComponentIsViewType(component, viewType, graph) {
  graph = graph || GetCurrentGraph();
  const currentType = GetNodeProp(component, NodeProperties.ViewType);
  if (currentType === viewType) {
    return true;
  } if (currentType) {
    return false;
  }
  const parent = GetParentComponent(component, graph);
  if (parent) {
    return ComponentIsViewType(parent, viewType, graph);
  }

  return false;
}
export function GetUserReferenceNodes(refId) {
  const state = _getState();
  return GraphMethods.GetLinkChain(state, {
    id: refId,
    links: [
      {
        type: NodeConstants.LinkType.UserLink,
        direction: GraphMethods.TARGET
      }
    ]
  }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);
}

export function GetLogicalChildren(id) {
  const currentNode = GraphMethods.GetNode(GetCurrentGraph(GetState()), id);
  const hasLogicalChildren = GetNodeProp(
    currentNode,
    NodeProperties.HasLogicalChildren
  );
  if (hasLogicalChildren) {
    return (GetNodeProp(currentNode, NodeProperties.LogicalChildrenTypes) || [])
      .map(t => {
        const node = GraphMethods.GetNode(GetCurrentGraph(_getState()), t);
        return node;
      })
      .filter(x => x);
  }
  return [];
}

export function GetMethodNodeSelectOptions(methodProps) {
  return Object.keys(methodProps).map(val => {
    return {
      value: val,
      title: `${GetCodeName(methodProps[val])} (${val})`
    };
  });
}
export function GetNodeCode(graph, id) {
  return GetCodeName(GraphMethods.GetNode(graph, id));
}

export function GetMethodPropNode(graph, node, key) {
  const methodProps = GetNodeProp(node, NodeProperties.MethodProps);
  if (methodProps) {
    return GraphMethods.GetNode(graph, methodProps[key] || null);
  }
  return null;
}

export function GetMethodOptions(methodProps) {
  if (!methodProps) {
    return [];
  }
  const state = _getState();
  return Object.keys(methodProps).map(t => {
    const n = GraphMethods.GetNode(GetRootGraph(state), methodProps[t]);
    return {
      title: `${GetCodeName(n)} (${t})`,
      value: t
    };
  });
}

export function GetLinkProperty(link, prop) {
  return link && link.properties && link.properties[prop];
}

export function GetLink(linkId) {
  const graph = GetCurrentGraph();

  return GraphMethods.getLink(graph, {
    id: linkId
  });
}

export function GetGroupProperty(group, prop) {
  return group && group.properties && group.properties[prop];
}

export function VisualEq(state, key, value) {
  return Visual(state, key) === value;
}
export function Node(state, nodeId) {
  const currentGraph = GetCurrentGraph(state);
  if (currentGraph && currentGraph.nodeLib) {
    return currentGraph.nodeLib[nodeId];
  }
  return null;
}
export function ModelNotConnectedToFunction(
  agentId,
  modelId,
  packageType,
  nodeType = NodeTypes.Method
) {
  const connections = NodesByType(_getState(), nodeType).filter(x => {
    const match =
      GetNodeProp(x, NodeProperties.NodePackage) === modelId &&
      GetNodeProp(x, NodeProperties.NodePackageType) === packageType &&
      GetNodeProp(x, NodeProperties.NodePackageAgent) === agentId;
    return match;
  }).length;

  return !connections;
}
export function Application(state, key) {
  return GetC(state, APPLICATION, key);
}
export function GetVisualGraph(state) {
  const currentGraph = GetCurrentGraph(state);
  return currentGraph ? GetC(state, VISUAL_GRAPH, currentGraph.id) : null;
}
export function SaveApplication(value, key, dispatch) {
  dispatch(UIC(APPLICATION, key, value));
}
export function Graphs(state, key) {
  return GetC(state, GRAPHS, key);
}

export function SaveGraph(graph, dispatch) {
  graph = {
    ...graph,
    ...{
      updated: Date.now()
    }
  };
  const visualGraph = GraphMethods.VisualProcess(graph);
  if (visualGraph) dispatch(UIC(VISUAL_GRAPH, visualGraph.id, visualGraph));
  dispatch(UIC(GRAPHS, graph.id, graph));
}
export function UIC(section, item, value) {
  return {
    type: UI_UPDATE,
    item,
    value,
    section
  };
}
export function toggleVisual(key) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(UIC(VISUAL, key, !GetC(state, VISUAL, key)));
  };
}

export function toggleMinimized(key) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(UIC(MINIMIZED, key, !GetC(state, MINIMIZED, key)));
  };
}

export function toggleHideByTypes(key) {
  return (dispatch, getState) => {
    const state = getState();
    const newvalue = !GetC(state, HIDDEN, key);
    dispatch(UIC(HIDDEN, key, newvalue));
    PerformGraphOperation(
      NodesByType(state, key).map(node => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options: {
            prop: NodeProperties.Pinned,
            id: node.id,
            value: newvalue
          }
        };
      })
    )(dispatch, getState);
  };
}

export function GUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;

    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function setVisual(key, value) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(UIC(VISUAL, key, value));
  };
}
export function setApplication(key, value) {
  return (dispatch, getState) => {
    const state = getState();
    dispatch(UIC(APPLICATION, key, value));
  };
}
export const SELECTED_LINK = "SELECTED_LINK";
export const HOVERED_LINK = "HOVERED_LINK";
export const SELECTED_NODE = "SELECTED_NODE";
export const CONTEXT_MENU_VISIBLE = "CONTEXT_MENU_VISIBLE";
export const CONTEXT_MENU_MODE = "CONTEXT_MENU_MODE";
export function SelectedNode(nodeId) {
  return (dispatch, getState) => {
    dispatch(UIC(VISUAL, SELECTED_NODE, nodeId));
  };
}
export function toggleDashboardMinMax() {
  return toggleVisual(DASHBOARD_MENU);
}
export function GetNodeTitle(node) {
  if (typeof node === "string") {
    node = GraphMethods.GetNode(GetCurrentGraph(GetState()), node);
  }

  if (!node) {
    return Titles.Unknown;
  }
  return node.properties ? node.properties.text || node.id : node.id;
}
export function GetNodes(state) {
  const currentGraph = GetCurrentGraph(state);
  if (currentGraph) {
    return [...currentGraph.nodes.map(t => currentGraph.nodeLib[t])];
  }
  return [];
}
export function CanChangeType(node) {
  const nodeType = GetNodeProp(node, NodeProperties.NODEType);
  switch (nodeType) {
    case NodeTypes.ReferenceNode:
      return false;
    default:
      return true;
  }
}
export function GetScreenNodes() {
  const state = _getState();
  return NodesByType(state, NodeTypes.Screen);
}

export function addComponentApiNodes(id, apiName) {
  return (dispatch, getState) => {
    graphOperation($addComponentApiNodes(id, apiName))(dispatch, getState);
  };
}
export function $addComponentApiNodes(
  parent,
  apiName = "value",
  externalApiId,
  viewPackages = {}
) {
  let componentInternalValue = null;
  let componentExternalValue = null;
  return [
    {
      operation: ADD_NEW_NODE,
      options(currentGraph) {
        return {
          nodeType: NodeTypes.ComponentApi,
          callback: nn => {
            componentInternalValue = nn.id;
          },
          linkProperties: {
            properties: {
              ...LinkProperties.ComponentInternalApi
            }
          },
          parent,
          groupProperties: {},
          properties: {
            ...viewPackages,
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
      options(currentGraph) {
        return {
          nodeType: NodeTypes.ComponentExternalApi,
          callback: nn => {
            componentExternalValue = nn.id;
          },
          parent,
          linkProperties: {
            properties: { ...LinkProperties.ComponentExternalApi }
          },
          groupProperties: {},
          properties: {
            ...viewPackages,
            [NodeProperties.UIText]: apiName,
            [NodeProperties.Pinned]: false
            // [NodeProperties.ComponentApiKey]: viewComponentType.externalApiNode || null
          }
        };
      }
    },
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options() {
        return {
          source: componentInternalValue,
          target: componentExternalValue,
          properties: {
            ...LinkProperties.ComponentInternalConnection
          }
        };
      }
    },
    externalApiId
      ? {
        operation: ADD_LINK_BETWEEN_NODES,
        options() {
          return {
            target: externalApiId,
            source: componentExternalValue,
            properties: {
              ...LinkProperties.ComponentExternalConnection
            }
          };
        }
      }
      : null
  ].filter(x => x);
}
export function GetScreenOptions() {
  const state = _getState();
  return NodesByType(state, NodeTypes.ScreenOption);
}
export function GetModelNodes() {
  return NodesByType(_getState(), NodeTypes.Model);
}
export function GetConfigurationNodes() {
  return NodesByType(_getState(), NodeTypes.Configuration);
}
export function GetMaestroNode(id) {
  const state = _getState();
  const graph = GetRootGraph(state);
  const nodes = GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Maestro);
  if (nodes && nodes.length) {
    return nodes[0];
  }
  return null;
}
export function GetControllerNode(id) {
  const state = _getState();
  const graph = GetRootGraph(state);
  const nodes = GraphMethods.GetNodesLinkedTo(graph, {
    id
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Controller
  );
  if (nodes && nodes.length) {
    return nodes[0];
  }
  return null;
}
export function HasCurrentGraph(options = {}) {
  const state = _getState();
  const currentGraph = options.useRoot
    ? GetRootGraph(state)
    : GetCurrentGraph(state);
  return !!currentGraph;
}
export function NodesByType(state, nodeType, options = {}) {
  state = state || GetState();

  const currentGraph = options.useRoot
    ? GetRootGraph(state)
    : GetCurrentGraph(state);
  if (currentGraph) {
    if (!Array.isArray(nodeType)) {
      nodeType = [nodeType];
    }
    return currentGraph.nodes
      .filter(
        x =>
          (currentGraph.nodeLib &&
            currentGraph.nodeLib[x] &&
            currentGraph.nodeLib[x].properties &&
            nodeType.indexOf(
              currentGraph.nodeLib[x].properties[NodeProperties.NODEType]
            ) !== -1) ||
          (!options.excludeRefs &&
            currentGraph.nodeLib &&
            currentGraph.nodeLib[x] &&
            currentGraph.nodeLib[x].properties &&
            currentGraph.nodeLib[x].properties[NodeProperties.ReferenceType] ===
            nodeType)
      )
      .map(x => currentGraph.nodeLib[x]);
  }
  return [];
}

export function GetNodeFromRoot(state, id) {
  const graph = GetRootGraph(state);
  if (graph) {
    return GraphMethods.GetNode(graph, id);
  }
  return null;
}

export function NodesConnectedTo(state, nodeId) {
  const currentGraph = GetCurrentGraph(state);
  if (currentGraph) {
    return t => {
      if (currentGraph.linkLib[t.id]) {
        return currentGraph.linkLib[t.id][nodeId];
      }
    };
  }
  return () => false;
}
let _getState;
let _dispatch;
export function GetState() {
  if (_getState) return _getState();
}
export function GetDispatchFunc() {
  return _dispatch;
}
export function GetStateFunc() {
  return _getState;
}
export function setTestGetState(func) {
  _getState = func;
}
export function setState() {
  return (dispatch, getState) => {
    _getState = getState;
    _dispatch = dispatch;
  };
}

export function clearPinned() {
  const state = _getState();
  _dispatch(
    graphOperation(
      GetNodes(state)
        .filter(x => GetNodeProp(x, NodeProperties.Pinned))
        .map(node => {
          return {
            operation: CHANGE_NODE_PROPERTY,
            options: {
              prop: NodeProperties.Pinned,
              id: node.id,
              value: false
            }
          };
        })
    )
  );
}
export function clearMarked() {
  const state = _getState();
  _dispatch(
    graphOperation(
      GetNodes(state)
        .filter(x => GetNodeProp(x, NodeProperties.Selected))
        .map(node => {
          return {
            operation: CHANGE_NODE_PROPERTY,
            options: {
              prop: NodeProperties.Selected,
              id: node.id,
              value: false
            }
          };
        })
    )
  );
}

export function selectProperties(model) {
  return (dispatch, getState) => {
    const state = getState();
    graphOperation(
      GraphMethods.getPropertyNodes(GetRootGraph(state), model).map(t => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options: {
            prop: NodeProperties.Pinned,
            id: t.id,
            value: true
          }
        };
      })
    )(dispatch, getState);
  };
}
export function togglePinnedConnectedNodesByLinkType(model, linkType) {
  return (dispatch, getState) => {
    const state = getState();
    const graph = GetRootGraph(state);
    const nodes = GraphMethods.GetNodesLinkedTo(graph, {
      id: model,
      link: linkType
    });
    const pinned = nodes
      .filter(x => x.id !== model)
      .some(v => GetNodeProp(v, NodeProperties.Pinned));
    graphOperation(
      nodes.map(t => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options: {
            prop: NodeProperties.Pinned,
            id: t.id,
            value: !pinned
          }
        };
      })
    )(dispatch, getState);
  };
}
export function toggleNodeMark() {
  const state = _getState();
  const currentNode = Node(state, Visual(state, SELECTED_NODE));
  _dispatch(
    graphOperation(CHANGE_NODE_PROPERTY, {
      prop: NodeProperties.Selected,
      id: currentNode.id,
      value: !GetNodeProp(currentNode, NodeProperties.Selected)
    })
  );
}
export function setInComponentMode() {
  _dispatch(UIC(MINIMIZED, NodeTypes.Selector, true));
  _dispatch(UIC(MINIMIZED, NodeTypes.ViewModel, true));
  _dispatch(UIC(MINIMIZED, NodeTypes.ViewType, true));
}
export function removeCurrentNode() {
  graphOperation(REMOVE_NODE, { id: Visual(_getState(), SELECTED_NODE) })(
    _dispatch,
    _getState
  );
}
export function togglePinned() {
  const state = _getState();
  const currentNode = Node(state, Visual(state, SELECTED_NODE));
  _dispatch(
    graphOperation(CHANGE_NODE_PROPERTY, {
      prop: NodeProperties.Pinned,
      id: currentNode.id,
      value: !GetNodeProp(currentNode, NodeProperties.Pinned)
    })
  );
}
export function GetGraphNode(id) {
  const state = _getState();
  return GraphMethods.GetNode(GetRootGraph(state), id);
}
export function GetFunctionType(methodNode) {
  return GetNodeProp(methodNode, NodeProperties.FunctionType);
}
export function GetMethodNode(id) {
  return GraphMethods.GetMethodNode(_getState(), id);
}
export function GetMethodNodeProp(methodNode, key) {
  const methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps) || {};
  if (typeof key === "string") return methodProps[key];
  if (!key) return null;
  const { template } = key;
  const temp = {};
  Object.keys(methodProps).map(t => {
    temp[t] = GetCodeName(methodProps[t]);
  });
  return bindTemplate(template, temp);
}
export function GetMethodProps(methodNode) {
  return GetNodeProp(methodNode, NodeProperties.MethodProps) || {};
}
export function GetMethodsProperties(id) {
  const state = _getState();
  const method = GraphMethods.GetMethodNode(state, id);
  const methodProps = GetMethodProps(method);
  return methodProps;
}
export function GetMethodsProperty(id, prop) {
  const methodProps = GetMethodsProperties(id);
  if (methodProps) {
    return methodProps[prop];
  }
  return null;
}
export function GetMethodFilterParameters(id, all) {
  return GetMethod_Parameters(id, "filter", all);
}
export function GetMethodFilterMetaParameters(id, all) {
  return GetMethod_MetaParameters(id, "filter");
}
function GetMethod_MetaParameters(id, key) {
  const state = _getState();
  const method = GraphMethods.GetMethodNode(state, id);
  const methodProps = GetMethodProps(method);
  const methodType = GetNodeProp(method, NodeProperties.FunctionType);
  if (methodType) {
    const setup = MethodFunctions[methodType];
    if (setup && setup[key] && setup[key].params && methodProps) {
      return setup[key].params
        .filter(x => typeof x === "object" || x.metaparameter)
        .map(x => {
          const _x = x.key;
          const nodeName = GetNodeTitle(methodProps[_x]);
          const nodeClass = GetCodeName(methodProps[_x]);
          return {
            title: nodeName,
            value: _x,
            paramClass: nodeClass,
            paramName: _x
          };
        });
    }
  }
  return [];
}
function GetMethod_Parameters(id, key, all) {
  const state = _getState();
  const method = GraphMethods.GetMethodNode(state, id);
  const methodProps = GetMethodProps(method);
  const methodType = GetNodeProp(method, NodeProperties.FunctionType);
  if (methodType) {
    const setup = MethodFunctions[methodType];
    if (setup && setup[key] && setup[key].params && methodProps) {
      return setup[key].params
        .filter(x => all || typeof x === "string" || !x.metaparameter)
        .map(x => (!x.metaparameter ? x : x.metaparameter))
        .map(_x => {
          const nodeName = GetNodeTitle(methodProps[_x]);
          const nodeClass = GetCodeName(methodProps[_x]);
          return {
            title: nodeName,
            value: _x,
            paramClass: nodeClass,
            paramName: _x
          };
        });
    }
  }
  return [];
}
export function GetMethodPermissionParameters(id, all) {
  return GetMethod_Parameters(id, "permission", all);
}
export function GetMethodValidationParameters(id, all) {
  return GetMethod_Parameters(id, "validation", all);
}
export function GetPermissionMethod(permission) {
  if (permission)
    return GetLinkChainItem({
      id: permission.id,
      links: [
        {
          type: NodeConstants.LinkType.FunctionOperator,
          direction: GraphMethods.TARGET
        }
      ]
    });
  return null;
}
export function GetPermissionMethodModel(permission) {
  const method = permission ? GetPermissionMethod(permission) : null;
  if (method) {
    const props = GetMethodProps(method);

    return props ? props[FunctionTemplateKeys.Model] : null;
  }
  return null;
}

export function GetValidatorMethod(permission) {
  if (permission)
    return GetLinkChainItem({
      id: permission.id,
      links: [
        {
          type: NodeConstants.LinkType.FunctionOperator,
          direction: GraphMethods.TARGET
        }
      ]
    });
  return null;
}
export function GetFunctionMethodKey(
  validation,
  templateKey = FunctionTemplateKeys.Model
) {
  const method = validation ? GetValidatorMethod(validation) : null;
  if (method) {
    const props = GetMethodProps(method);

    return props ? props[templateKey] : null;
  }
  return null;
}
export function GetNodesMethod(id) {
  return GetPermissionMethod(GetNodeById(id));
}
export function GetAppSettings(graph) {
  if (graph) {
    if (graph.appConfig) {
      return graph.appConfig.AppSettings;
    }
  }
  return null;
}
export function GetCurrentGraph(state) {
  const scopedGraph = GetCurrentScopedGraph(state);
  return scopedGraph;
  // if (currentGraph) {
  //     currentGraph = Graphs(state, currentGraph);
  // }
  // return currentGraph;
}
export function GetCurrentTheme(state) {
  const graph = GetCurrentGraph(state);
  const {
    themeColors = {},
    themeColorUses = {},
    themeOtherUses = {},
    themeGridPlacements = { grids: [] },
    themeFonts = { fonts: [] },
    themeVariables = { variables: [] }
  } = graph;
  return {
    themeColors,
    themeColorUses,
    themeOtherUses,
    themeGridPlacements,
    themeFonts,
    themeVariables
  };
}
export function GetRootGraph(state, dispatch) {
  let currentGraph = Application(state, CURRENT_GRAPH);
  if (currentGraph) {
    currentGraph = Graphs(state, currentGraph);
  } else if (dispatch) {
    currentGraph = GraphMethods.createGraph();
    SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
  }

  return currentGraph;
}
export function GetSubGraphs(state) {
  let currentGraph = Application(state, CURRENT_GRAPH);
  if (currentGraph) {
    currentGraph = Graphs(state, currentGraph);
    const subgraphs = GraphMethods.getSubGraphs(currentGraph);
    return subgraphs;
  }
  return null;
}
export function addNewSubGraph() {
  return (dispatch, getState) => {
    let rootGraph = GetRootGraph(getState(), dispatch);
    rootGraph = GraphMethods.addNewSubGraph(rootGraph);
    SaveGraph(rootGraph, dispatch);
  };
}

export function setRootGraph(key, value) {
  return (dispatch, getState) => {
    let rootGraph = GetRootGraph(getState(), dispatch);
    rootGraph = {
      ...rootGraph,
      ...{ [key]: value }
    };
    SaveGraph(rootGraph, dispatch);
  };
}
export function setAppsettingsAssemblyPrefixes(prefixes) {
  return (dispatch, getState) => {
    const rootGraph = GetRootGraph(getState(), dispatch);
    rootGraph.appConfig.AppSettings.AssemblyPrefixes = ["RedQuick", prefixes]
      .unique(x => x)
      .join(";");
    rootGraph.appConfig.AppSettings.DatabaseId = [prefixes]
      .unique(x => x)
      .join(";");
    SaveGraph(rootGraph, dispatch);
  };
}
export function GetCurrentScopedGraph(state, dispatch) {
  state = state || GetState();
  let currentGraph = Application(state, CURRENT_GRAPH);
  const scope = Application(state, GRAPH_SCOPE) || [];
  if (!currentGraph) {
    if (dispatch) {
      currentGraph = GraphMethods.createGraph();
      SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
    }
  } else {
    currentGraph = Graphs(state, currentGraph);
    if (scope.length) {
      currentGraph = GraphMethods.getScopedGraph(currentGraph, { scope });
    }
  }
  return currentGraph;
}
export const SELECTED_TAB = "SELECTED_TAB";
export const DEFAULT_TAB = "DEFAULT_TAB";
export const SIDE_PANEL_OPEN = "side-panel-open";
export const PARAMETER_TAB = "PARAMETER_TAB";
export const SCOPE_TAB = "SCOPE_TAB";
export const QUICK_MENU = "QUICK_MENU";

export function newNode() {
  graphOperation(NEW_NODE)(_dispatch, _getState);
  setVisual(SIDE_PANEL_OPEN, true)(_dispatch, _getState);
  setVisual(SELECTED_TAB, DEFAULT_TAB)(_dispatch, _getState);
}
export function GetSelectedSubgraph(state) {
  const root = GetRootGraph(state);
  if (root) {
    const scope = Application(state, GRAPH_SCOPE);
    if (scope && scope.length) {
      return GraphMethods.getSubGraph(root, scope);
    }
  }
  return null;
}

export function GetViewTypeModel(node) {

  const models = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
    id: node,
    link: NodeConstants.LinkType.DefaultViewType
  }).filter(
    x =>
      GetNodeProp(x, NodeProperties.NODEType) ===
      NodeTypes.Model
  );

  return models[0] || null
}

export function BuildPackage(model, _package) {
  const { id } = model;
  const methodFunctionDefinition = MethodFunctions[_package.methodType];
  if (methodFunctionDefinition) {
    const { constraints } = methodFunctionDefinition;

    Object.keys(constraints).values(_const => {
      const { key } = _const;
    });
  }
}
export const ComponentApiKeys = {
  DATA: "data",
  Value: "value",
  Item: "item",
  ViewModel: 'viewModel',
  Index: "index",
  Separators: "separators",
  Error: "error"
};
export const UPDATE_GRAPH_TITLE = "UPDATE_GRAPH_TITLE";
export const NEW_NODE = "NEW_NODE";
export const REMOVE_NODE = "REMOVE_NODE";
export const NEW_LINK = "NEW_LINK";
export const CHANGE_NODE_TEXT = "CHANGE_NODE_TEXT";
export const CURRENT_GRAPH = "CURRENT_GRAPH";
export const GRAPH_SCOPE = "GRAPH_SCOPE";
export const ADD_DEFAULT_PROPERTIES = "ADD_DEFAULT_PROPERTIES";
export const CHANGE_APP_SETTINGS = "CHANGE_APP_SETTINGS";
export const CHANGE_NODE_PROPERTY = "CHANGE_NODE_PROPERTY";
export const NEW_PROPERTY_NODE = "NEW_PROPERTY_NODE";
export const NEW_PERMISSION_NODE = "NEW_PERMISSION_NODE";
export const NEW_ATTRIBUTE_NODE = "NEW_ATTRIBUTE_NODE";
export const ADD_LINK_BETWEEN_NODES = "ADD_LINK_BETWEEN_NODES";
export const ADD_TO_GROUP = 'ADD_TO_GROUP';
export const ESTABLISH_SCOPE = "ESTABLISH_SCOPE";
export const ADD_LINKS_BETWEEN_NODES = "ADD_LINKS_BETWEEN_NODES";
export const UPDATE_NODE_DIRTY = "UPDATE_NODE_DIRTY";
export const NEW_CONDITION_NODE = "NEW_CONDITION_NODE";
export const ADD_NEW_NODE = "ADD_NEW_NODE";
export const REMOVE_LINK_BETWEEN_NODES = "REMOVE_LINK_BETWEEN_NODES";
export const REMOVE_LINK = "REMOVE_LINK";
export const NEW_CHOICE_ITEM_NODE = "NEW_CHOICE_ITEM_NODE";
export const NO_OP = "NO_OP";
export const NEW_PARAMETER_NODE = "NEW_PARAMETER_NODE";
export const NEW_FUNCTION_OUTPUT_NODE = "NEW_FUNCTION_OUTPUT_NODE";
export const NEW_MODEL_ITEM_FILTER = "NEW_MODEL_ITEM_FILTER";
export const NEW_AFTER_METHOD = "NEW_AFTER_METHOD";
export const NEW_VALIDATION_ITEM_NODE = "NEW_VALIDATION_ITEM_NODE";
export const NEW_CHOICE_TYPE = "NEW_CHOICE_TYPE";
export const NEW_VALIDATION_TYPE = "NEW_VALIDATION_TYPE";
export const NEW_OPTION_ITEM_NODE = "NEW_OPTION_ITEM_NODE";
export const NEW_OPTION_NODE = "NEW_OPTION_NODE";
export const NEW_CUSTOM_OPTION = "NEW_CUSTOM_OPTION";
export const UPDATE_NODE_PROPERTY = "UPDATE_NODE_PROPERTY";
export const UPDATE_GROUP_PROPERTY = "UPDATE_GROUP_PROPERTY";
export const CONNECT_TO_TITLE_SERVICE = "CONNECT_TO_TITLE_SERVICE";
export const NEW_DATA_SOURCE = "NEW_DATA_SOURCE";
export const NEW_COMPONENT_NODE = "NEW_COMPONENT_NODE";
export const NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE =
  "NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE";
export const NEW_EXTENSION_LIST_NODE = "NEW_EXTENSION_LIST_NODE";
export const NEW_EXTENTION_NODE = "NEW_EXTENTION_NODE";
export const NEW_SCREEN_OPTIONS = "NEW_SCREEN_OPTIONS";
export const ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY =
  "ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY";
export const APPLY_FUNCTION_CONSTRAINTS = "APPLY_FUNCTION_CONSTRAINTS";
export const ADD_NEW_REFERENCE_NODE = "ADD_NEW_REFERENCE_NODE;";
export const UPDATE_LINK_PROPERTY = "UPDATE_LINK_PROPERTY";

export const SET_DEPTH = "SET_DEPTH";
export function PerformGraphOperation(commands) {
  return graphOperation(commands);
}
export function executeGraphOperation(model, op, args = {}) {
  return (dispatch, getState) => {
    op.method({ model, dispatch, getState, ...args });
  };
}
// export function executeGraphOperations(model, ops, args = {}) {
//     return (dispatch, getState) => {
//         var promise = Promise.resolve();
//         ops.map(op => {
//             promise = promise.then(() => {
//                 return op.method({ model, dispatch, getState, ...args });
//             })
//         });
//     }
// }
export function GetNodesLinkTypes(id) {
  return GraphMethods.getNodesLinkTypes(GetCurrentGraph(GetState()), { id });
}
export function addInstanceFunc(node, callback, viewPackages, option = {}) {
  viewPackages = viewPackages || {};
  return function () {
    if (typeof node === 'function') {
      node = node();
    }
    if (option.lifeCycle) {
      return {
        nodeType: NodeTypes.LifeCylceMethodInstance,
        parent: node.id,
        linkProperties: {
          properties: LinkProperties.LifeCylceMethodInstance
        },
        callback,
        groupProperties: {},
        properties: {
          [NodeProperties.UIText]: `${GetNodeTitle(node)} Instance`,
          [NodeProperties.AutoDelete]: {
            properties: {
              [NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
            }
          }
        }
      }
    }
    return {
      nodeType: NodeTypes.EventMethodInstance,
      parent: node.id,
      groupProperties: {},
      linkProperties: {
        properties: { ...LinkProperties.EventMethodInstance }
      },
      properties: {
        [NodeProperties.UIText]: `${GetNodeTitle(node)} Instance`,
        [NodeProperties.Pinned]: false,
        ...viewPackages,
        [NodeProperties.AutoDelete]: {
          properties: {
            [NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
          }
        }
      },
      callback
    };
  };
}
export function executeGraphOperations(operations) {
  return (dispatch, getState) => {
    operations.map(t => {
      const { node, method, options } = t;
      method.method({ model: node, dispatch, getState, ...options });
    });
  };
}
export function selectAllConnected(id) {
  return (dispatch, getState) => {
    const nodes = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(getState()), {
      id
    });
    graphOperation([
      ...[...nodes, GetNodeById(id)].map(t => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options() {
            return {
              prop: NodeProperties.Selected,
              value: true,
              id: t.id
            };
          }
        };
      })
    ])(dispatch, getState);
  };
}
export function selectAllInViewPackage(id) {
  return (dispatch, getState) => {
    const node = GetNodeById(id);
    const nodes = GetNodesByProperties({
      [NodeProperties.ViewPackage]: GetNodeProp(
        node,
        NodeProperties.ViewPackage
      )
    });
    graphOperation([
      ...[...nodes].map(t => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options() {
            return {
              prop: NodeProperties.Selected,
              value: true,
              id: t.id
            };
          }
        };
      })
    ])(dispatch, getState);
  };
}

export function pinSelected() {
  return (dispatch, getState) => {
    const nodes = GetNodesByProperties({
      [NodeProperties.Selected]: true
    });
    graphOperation(
      nodes.map(t => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options() {
            return {
              prop: NodeProperties.Pinned,
              value: true,
              id: t.id
            };
          }
        };
      })
    )(dispatch, getState);
  };
}
export function addAllOfType(args) {
  return (dispatch, getState) => {
    const { properties, target, source } = args;
    const nodes = NodesByType(
      getState(),
      GetNodeProp(target, NodeProperties.NODEType)
    );
    graphOperation(
      nodes.map(v => {
        return {
          operation: ADD_LINK_BETWEEN_NODES,
          options: {
            target: v.id,
            source,
            properties
          }
        };
      })
    )(dispatch, getState);
  };
}
export function unPinSelected() {
  return (dispatch, getState) => {
    const nodes = GetNodesByProperties({
      [NodeProperties.Selected]: true
    });
    graphOperation(
      nodes.map(t => {
        return {
          operation: CHANGE_NODE_PROPERTY,
          options() {
            return {
              prop: NodeProperties.Pinned,
              value: false,
              id: t.id
            };
          }
        };
      })
    )(dispatch, getState);
  };
}

export function deleteAllSelected() {
  return (dispatch, getState) => {
    graphOperation(
      GetNodesByProperties({
        [NodeProperties.Selected]: true
      }).map(t => ({
        operation: REMOVE_NODE,
        options: { id: t.id }
      }))
    )(dispatch, getState);
  };
}

export function setViewPackageStamp(viewPackage) {
  GraphMethods.setViewPackageStamp(viewPackage);
}

export function graphOperation(operation, options, stamp) {
  return (dispatch, getState) => {
    if (stamp) {
      const viewPackage = {
        [NodeProperties.ViewPackage]: uuidv4()
      };
      setViewPackageStamp(viewPackage, stamp);
    }
    const state = getState();
    let rootGraph = null;
    let currentGraph = Application(state, CURRENT_GRAPH);
    const scope = Application(state, GRAPH_SCOPE) || [];
    if (!currentGraph) {
      currentGraph = GraphMethods.createGraph();
      SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
      rootGraph = currentGraph;
    } else {
      currentGraph = Graphs(state, currentGraph);
      rootGraph = currentGraph;
      if (scope.length) {
        currentGraph = GraphMethods.getScopedGraph(currentGraph, { scope });
      }
    }
    let operations = operation;
    if (!Array.isArray(operation)) {
      operations = [{ operation, options }];
    }
    operations
      .filter(x => x)
      .forEach(_op => {
        if (typeof _op === "function") {
          _op = _op(currentGraph);
        }
        if (!Array.isArray(_op) && _op) {
          _op = [_op];
        }
        if (_op)
          _op
            .filter(x => x)
            .forEach(opSecondLevel => {
              if (typeof opSecondLevel === "function") {
                opSecondLevel = opSecondLevel() || {};
              }
              let deepOp = opSecondLevel;
              if (!Array.isArray(opSecondLevel)) {
                deepOp = [opSecondLevel];
              }
              deepOp.filter(x => x)
                .forEach(op => {
                  let { operation, options } = op;
                  if (typeof options === "function") {
                    options = options(currentGraph);
                  }
                  if (options) {
                    const currentLastNode =
                      currentGraph.nodes && currentGraph.nodes.length
                        ? currentGraph.nodes[currentGraph.nodes.length - 1]
                        : null;
                    const currentLastGroup =
                      currentGraph.groups && currentGraph.groups.length
                        ? currentGraph.groups[currentGraph.groups.length - 1]
                        : null;
                    switch (operation) {
                      case NO_OP:
                        break;
                      case SET_DEPTH:
                        currentGraph = GraphMethods.setDepth(currentGraph, options);
                        break;
                      case NEW_NODE:
                        currentGraph = GraphMethods.newNode(currentGraph, options);
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case REMOVE_NODE:
                        currentGraph = GraphMethods.removeNode(
                          currentGraph,
                          options
                        );
                        break;
                      case UPDATE_GRAPH_TITLE:
                        currentGraph = GraphMethods.updateGraphTitle(
                          currentGraph,
                          options
                        );
                        break;
                      case UPDATE_NODE_DIRTY:
                        currentGraph = GraphMethods.updateNodePropertyDirty(
                          currentGraph,
                          options
                        );
                        break;
                      case NEW_LINK:
                        currentGraph = GraphMethods.newLink(currentGraph, options);
                        break;
                      case ADD_LINK_BETWEEN_NODES:
                        currentGraph = GraphMethods.addLinkBetweenNodes(
                          currentGraph,
                          options
                        );
                        break;
                      case ADD_TO_GROUP:
                        currentGraph = GraphMethods.updateNodeGroup(
                          currentGraph,
                          options
                        );
                        break;
                      case ADD_LINKS_BETWEEN_NODES:
                        currentGraph = GraphMethods.addLinksBetweenNodes(
                          currentGraph,
                          options
                        );
                        break;
                      case CONNECT_TO_TITLE_SERVICE:
                        const titleService = GetTitleService(currentGraph);
                        if (titleService) {
                          currentGraph = GraphMethods.addLinkBetweenNodes(
                            currentGraph,
                            {
                              source: options.id,
                              target: titleService.id,
                              properties: {
                                ...LinkProperties.TitleServiceLink,
                                singleLink: true,
                                nodeTypes: [NodeTypes.TitleService]
                              }
                            }
                          );
                        }
                        break;
                      case REMOVE_LINK_BETWEEN_NODES:
                        currentGraph = GraphMethods.removeLinkBetweenNodes(
                          currentGraph,
                          options
                        );
                        break;
                      case REMOVE_LINK:
                        currentGraph = GraphMethods.removeLinkById(
                          currentGraph,
                          options
                        );
                        break;
                      case UPDATE_GROUP_PROPERTY:
                        currentGraph = GraphMethods.updateGroupProperty(
                          currentGraph,
                          options
                        );
                        break;
                      case CHANGE_NODE_TEXT:
                        currentGraph = GraphMethods.updateNodeProperty(
                          currentGraph,
                          {
                            ...options,
                            prop: "text"
                          }
                        );
                        break;
                      case CHANGE_NODE_PROPERTY:
                        currentGraph = GraphMethods.updateNodeProperty(
                          currentGraph,
                          options
                        );
                        break;
                      case CHANGE_APP_SETTINGS:
                        currentGraph = GraphMethods.updateAppSettings(
                          currentGraph,
                          options
                        );
                        break;
                      case NEW_PROPERTY_NODE:
                        currentGraph = GraphMethods.addNewPropertyNode(
                          currentGraph,
                          options
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case ADD_DEFAULT_PROPERTIES:
                        currentGraph = GraphMethods.addDefaultProperties(
                          currentGraph,
                          options
                        );
                        break;
                      case NEW_ATTRIBUTE_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.Attribute
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case UPDATE_NODE_PROPERTY:
                        currentGraph = GraphMethods.updateNodeProperties(
                          currentGraph,
                          options
                        );
                        break;
                      case NEW_CONDITION_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.Condition
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case ADD_NEW_NODE:
                        if (options && options.nodeType) {
                          currentGraph = GraphMethods.addNewNodeOfType(
                            currentGraph,
                            options,
                            options.nodeType,
                            options.callback
                          );
                          setVisual(
                            SELECTED_NODE,
                            currentGraph.nodes[currentGraph.nodes.length - 1]
                          )(dispatch, getState);
                        }
                        break;
                      case NEW_MODEL_ITEM_FILTER:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ModelItemFilter
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_AFTER_METHOD:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.AfterEffect
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_COMPONENT_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ComponentNode
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_DATA_SOURCE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.DataSource
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_VALIDATION_TYPE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ValidationList
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.PermissionDependency
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case UPDATE_LINK_PROPERTY:
                        currentGraph = GraphMethods.updateLinkProperty(
                          currentGraph,
                          options
                        );
                        break;
                      case NEW_CHOICE_TYPE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ChoiceList
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_PARAMETER_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.Parameter
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_FUNCTION_OUTPUT_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.FunctionOutput
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_PERMISSION_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.Permission
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_OPTION_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.OptionList
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_CUSTOM_OPTION:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.OptionCustom
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_SCREEN_OPTIONS:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ScreenOption
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case ADD_NEW_REFERENCE_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ReferenceNode
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_EXTENSION_LIST_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ExtensionTypeList
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_VALIDATION_ITEM_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ValidationListItem
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_EXTENTION_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.ExtensionType
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case NEW_OPTION_ITEM_NODE:
                        currentGraph = GraphMethods.addNewNodeOfType(
                          currentGraph,
                          options,
                          NodeTypes.OptionListItem
                        );
                        setVisual(
                          SELECTED_NODE,
                          currentGraph.nodes[currentGraph.nodes.length - 1]
                        )(dispatch, getState);
                        break;
                      case APPLY_FUNCTION_CONSTRAINTS:
                        currentGraph = GraphMethods.applyFunctionConstraints(
                          currentGraph,
                          options
                        );
                        // setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                        break;
                      case ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY:
                        break;
                      default: break;
                    }

                    if (recording && Visual(state, RECORDING)) {
                      recording.push({
                        operation,
                        options,
                        callbackGroup: `group-${
                          currentLastGroup !==
                            currentGraph.groups[currentGraph.groups.length - 1]
                            ? currentGraph.groups[currentGraph.groups.length - 1]
                            : null
                          }`,
                        callback:
                          currentLastNode !==
                            currentGraph.nodes[currentGraph.nodes.length - 1]
                            ? currentGraph.nodes[currentGraph.nodes.length - 1]
                            : null
                      });
                    }
                  }

                  currentGraph = GraphMethods.applyConstraints(currentGraph);
                  currentGraph = GraphMethods.constraintSideEffects(currentGraph);
                });
            });
      });

    if (scope.length) {
      rootGraph = GraphMethods.setScopedGraph(rootGraph, {
        scope,
        graph: currentGraph
      });
    } else {
      rootGraph = currentGraph;
    }
    rootGraph = GraphMethods.updateReferenceNodes(rootGraph);
    if (stamp)
      setViewPackageStamp(null, stamp);

    SaveGraph(rootGraph, dispatch);
  };
}

export function updateGraph(property, value) {
  return (dispatch) => {
    let graph = GetCurrentGraph();
    graph = GraphMethods.updateGraphProperty({ ...graph }, { prop: property, value })
    SaveGraph(graph, dispatch);
  }
}

let recording = [];
export function GetRecording() {
  return recording;
}
export function clearRecording() {
  return (dispatch, getState) => {
    recording = [];
  };
}
export const Colors = {
  SelectedNode: "#f39c12",
  MarkedNode: "#af10fe"
};
(array => {
  if (!array.toNodeSelect) {
    Object.defineProperty(array, "toNodeSelect", {
      enumerable: false,
      writable: true,
      configurable: true,
      value() {
        const collection = this;
        return collection.map(node => {
          return {
            value: node.id,
            id: node.id,
            title: GetNodeTitle(node)
          };
        });
      }
    });
  }
})(Array.prototype);
