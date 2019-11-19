var fs = require('fs');

import * as GraphMethods from '../methods/graph_methods';
import * as NodeConstants from '../constants/nodetypes';
import * as Titles from '../components/titles';
import { MethodFunctions, bindTemplate, FunctionTemplateKeys, ReturnTypes } from '../constants/functiontypes';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { uuidv4 } from '../utils/array';
import { currentId } from 'async_hooks';
export const VISUAL = 'VISUAL';
export const MINIMIZED = 'MINIMIZED';
export const HIDDEN = 'HIDDEN';
export const APPLICATION = 'APPLICATION';
export const GRAPHS = 'GRAPHS';
export const VISUAL_GRAPH = 'VISUAL_GRAPH';
export const DASHBOARD_MENU = 'DASHBOARD_MENU';
export const SELECTED_NODE_BB = 'SELECTED_NODE_BB';
export const SIDE_PANEL_EXTRA_WIDTH = 'SIDE_PANEL_EXTRA_WIDTH';
export const NodeTypes = NodeConstants.NodeTypes;
export const NodeTypeColors = NodeConstants.NodeTypeColors;
export const NodeProperties = NodeConstants.NodeProperties;
export const LinkProperties = NodeConstants.LinkProperties;
export const NodeAttributePropertyTypes = NodeConstants.NodeAttributePropertyTypes;
export const NodePropertyTypes = NodeConstants.NodePropertyTypes;
export const ValidationRules = NodeConstants.ValidationRules;
export const OptionsTypes = NodeConstants.OptionsTypes;
export const NODE_COST = 'NODE_COST';
export const NODE_CONNECTION_COST = 'NODE_CONNECTION_COST';

export const BATCH_MODEL = 'BATCH_MODEL';
export const BATCH_AGENT = 'BATCH_AGENT';
export const BATCH_PARENT = 'BATCH_PARENT';
export const BATCH_FUNCTION_NAME = 'BATCH_FUNCTION_NAME';
export const BATCH_FUNCTION_TYPE = 'BATCH_FUNCTION_TYPE';

export const ViewTypes = {
    Update: 'Update',
    Delete: 'Delete',
    Create: 'Create',
    Get: 'Get',
    GetAll: 'GetAll'
}


export const UI_UPDATE = 'UI_UPDATE';
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
    let dataSeed = _generateDataSeed(node);
    return JSON.stringify(dataSeed, null, 4);
}

function _generateDataSeed(node) {
    let state = _getState();
    let properties = {};
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
            type: 'Id'
        };
    });
    let dataSeed = {
        name: GetCodeName(node),
        properties
    }
    return dataSeed;
}

export function generateDataSeeds() {
    return JSON.stringify(NodesByType(_getState(), NodeTypes.Model).map(t => _generateDataSeed(t)));
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
    var currentNode = Node(state, Visual(state, SELECTED_NODE));
    if (!Array.isArray(type)) {
        type = [type]
    }
    return currentNode && currentNode.properties && type.some(v => v === currentNode.properties.nodeType);
}
export function Use(node, prop) {
    return node && node.properties && node.properties[prop];
}
export function GetManyToManyNodes(ids) {
    return GraphMethods.GetManyToManyNodes(GetCurrentGraph(_getState()), ids) || [];
}
export function GetNodeProp(node, prop, currentGraph) {
    if (typeof node === 'string') {
        node = GetNodeById(node, currentGraph) || node;
    }
    return node && node.properties && node.properties[prop];
}
export function GetGroupProp(id, prop) {
    let group = GraphMethods.GetGroup(GetCurrentGraph(_getState()), id);
    if (group) {
        return group && group.properties && group.properties[prop];
    }

    return null;
}

export function getViewTypeEndpointsForDefaults(viewType, currentGraph, id) {
    currentGraph = currentGraph || GetCurrentGraph(_getState());

    let currentNode = GetNodeById(id, currentGraph)
    var connectto = GetNodesByProperties({
        [NodeProperties.NODEType]: NodeTypes.ViewType,
        [NodeProperties.ViewType]: viewType,
    }, currentGraph).filter(_x => {
        let res = GraphMethods.existsLinkBetween(currentGraph, {
            source: _x.id,
            type: NodeConstants.LinkType.DefaultViewType,
            target: currentNode.id
        });
        if (res) {
            let link = GraphMethods.GetLinkBetween(_x.id, currentNode.id, currentGraph);
            if (link && link.properties && link.properties.target === currentNode.id) {
                return true;
            }
        }
        return false;
    });

    return connectto;
}

export function setSharedComponent(args) {
    let { properties, target, source } = args;
    return (dispatch, getState) => {
        let state = getState();
        let graph = GetCurrentGraph(getState());
        if (!GraphMethods.existsLinkBetween(graph, { target, source, type: NodeConstants.LinkType.SharedComponent }) &&
            GetNodeProp(target, NodeProperties.SharedComponent) &&
            GetNodeProp(target, NodeProperties.NODEType) === NodeTypes.ComponentNode) {
            let connections = GraphMethods.GetConnectedNodesByType(state, source, NodeTypes.ComponentNode).map(x => {
                return {
                    operation: REMOVE_LINK_BETWEEN_NODES,
                    options: {
                        source,
                        target: x.id
                    }
                }
            })

            PerformGraphOperation([...connections, {
                operation: ADD_LINK_BETWEEN_NODES,
                options: {
                    source,
                    target,
                    properties: { ...properties }
                }
            }])(dispatch, getState);
        }
    };
}
export function setComponentApiConnection(args) {
    let { properties, target, source } = args;
    return (dispatch, getState) => {
        let state = getState();
        let graph = GetCurrentGraph(state);
        if ([NodeTypes.EventMethod, NodeTypes.LifeCylceMethod, NodeTypes.MethodApiParameters, NodeTypes.DataChain, NodeTypes.Selector].some(t => t === GetNodeProp(target, NodeProperties.NODEType)))
            if (!GraphMethods.existsLinkBetween(graph, { target, source, type: NodeConstants.LinkType.ComponentApiConnection })) {
                let connections = GraphMethods.GetConnectedNodesByType(state, source, GetNodeProp(target, NodeProperties.NODEType)).map(x => {
                    return {
                        operation: REMOVE_LINK_BETWEEN_NODES,
                        options: {
                            source,
                            target: x.id
                        }
                    }
                });
                PerformGraphOperation([...connections, {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: {
                        source,
                        target,
                        properties: { ...properties }
                    }
                }])(dispatch, getState);
            }
    }
}

export function addQueryMethodParameter() {
    return (dispatch, getState) => {
        let state = getState();
        let graph = GetCurrentGraph(state);
        var currentNode = Node(state, Visual(state, SELECTED_NODE));
        let operations = [];
        operations.push({
            operation: ADD_NEW_NODE,
            options: function () {
                return {
                    nodeType: NodeTypes.MethodApiParameters,
                    properties: {
                        [NodeProperties.UIText]: 'Query Parameter',
                        [NodeProperties.QueryParameterParam]: true,
                    },
                    parent: currentNode.id,
                    groupProperties: {},
                    links: [{
                        target: currentNode.id,
                        linkProperties: {
                            properties: {
                                ...LinkProperties.MethodApiParameters,
                                params: true,
                                query: true
                            }
                        }
                    }]
                };
            }
        });
        PerformGraphOperation(operations)(dispatch, getState);
    }
}
export function addQueryMethodApi() {
    return (dispatch, getState) => {
        let state = getState();
        let graph = GetCurrentGraph(state);
        var currentNode = Node(state, Visual(state, SELECTED_NODE));
        let queryObjects = GraphMethods.GetConnectedNodesByType(state, currentNode.id, NodeTypes.MethodApiParameters).filter(x => GetNodeProp(x, NodeProperties.QueryParameterObject))
        if (queryObjects.length === 0) {
            let operations = [];
            operations.push({
                operation: ADD_NEW_NODE,
                options: function () {
                    return {
                        nodeType: NodeTypes.MethodApiParameters,
                        properties: {
                            [NodeProperties.UIText]: 'Query',
                            [NodeProperties.QueryParameterObject]: true,
                            [NodeProperties.QueryParameterObjectExtendible]: true
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: {
                                    ...LinkProperties.MethodApiParameters,
                                    params: true,
                                    query: true
                                }
                            }
                        }]
                    };
                }
            });
            PerformGraphOperation(operations)(dispatch, getState);
        }
    }
}

export function connectLifeCycleMethod(args) {

    let { properties, target, source } = args;
    return (dispatch, getState) => {
        setTimeout(() => {

            let state = getState();
            let graph = GetCurrentGraph(state);
            if ([NodeTypes.Method, NodeTypes.ScreenOption].some(t => t === GetNodeProp(target, NodeProperties.NODEType))) {
                let apiConnectors = GraphMethods.GetConnectedNodesByType(state, source, NodeTypes.ComponentApiConnector).map(x => {
                    return {
                        operation: REMOVE_NODE,
                        options: {
                            id: x.id
                        }
                    }
                });

                let lifeCycleMethod = GraphMethods.GetConnectedNodeByType(state, source, [NodeTypes.LifeCylceMethod, NodeTypes.EventMethod]);
                let componentNode = GraphMethods.GetConnectedNodeByType(state, lifeCycleMethod.id, [NodeTypes.ComponentNode, NodeTypes.Screen, NodeTypes.ScreenOption]);

                state = getState();
                graph = GetCurrentGraph(state);
                let apiEndpoints = [];
                GraphMethods.GetConnectedNodesByType(state, target, NodeTypes.MethodApiParameters).filter(x => {
                    if (GetNodeProp(x, NodeProperties.QueryParameterObject)) {
                        return true;
                    }
                    if (GetNodeProp(x, NodeProperties.UriBody)) {
                        apiEndpoints.push(x);
                        return false;
                    }
                    return true;
                }).map(queryObj => {
                    GraphMethods.GetConnectedNodesByType(state, queryObj.id, NodeTypes.MethodApiParameters).map(queryParam => {
                        if (GetNodeProp(queryParam, NodeProperties.QueryParameterParam)) {
                            apiEndpoints.push(queryParam);
                        }
                    })
                });

                PerformGraphOperation([...apiConnectors, {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: function () {
                        return {
                            target,
                            source,
                            properties: {
                                ...LinkProperties.MethodCall
                            }
                        }
                    }
                }, ...apiEndpoints.map(ae => {
                    return {
                        operation: ADD_NEW_NODE,
                        options: function () {
                            let skipOrTake = GetNodeByProperties({
                                [NodeProperties.QueryParameterType]: GetNodeProp(ae, NodeProperties.QueryParameterParamType),
                                [NodeProperties.NODEType]: NodeTypes.DataChain,
                                [NodeProperties.Component]: componentNode.id,
                                [NodeProperties.IsPaging]: true
                            })
                            return {
                                nodeType: NodeTypes.ComponentApiConnector,
                                groupProperties: {},
                                parent: source,
                                properties: {
                                    [NodeProperties.UIText]: `${GetNodeTitle(ae)} Parameter`,
                                },
                                links: [{
                                    target: ae.id,
                                    linkProperties: {
                                        properties: { ...LinkProperties.ComponentApiConnection }
                                    }
                                }, skipOrTake ? ({
                                    target: skipOrTake.id,
                                    linkProperties: {
                                        properties: { ...LinkProperties.ComponentApiConnection }
                                    }
                                }) : null].filter(x => x)
                            }
                        }
                    }
                })])(dispatch, getState);


            }

        }, 100);
    }
}
export function setupDefaultViewType(args) {
    let { properties, target, source } = args;
    return (dispatch, getState) => {
        let graph = GetCurrentGraph(getState());
        let right_link = (
            GraphMethods.existsLinkBetween(graph, { target, source, type: NodeConstants.LinkType.PropertyLink }) &&
            GetNodeProp(target, NodeProperties.UseModelAsType)) ||
            GraphMethods.existsLinkBetween(graph, { target, source, type: NodeConstants.LinkType.LogicalChildren });
        if (right_link) {

            let useModelAsType = GetNodeProp(target, NodeProperties.UseModelAsType);
            let illegalViewType = false;//useModelAsType ? ViewTypes.GetAll : ViewTypes.Get;
            if (properties.all) {
                PerformGraphOperation(Object.keys(ViewTypes).filter(x => x !== illegalViewType).map(viewType => {
                    let sibling = uuidv4();
                    return {
                        operation: ADD_NEW_NODE,
                        options: function () {
                            return {
                                nodeType: NodeTypes.ViewType,
                                properties: {
                                    [NodeProperties.ViewType]: viewType,
                                    [NodeProperties.UIText]: `[${viewType}] ${GetNodeTitle(target)} => ${GetNodeTitle(source)}`
                                },
                                ...(useModelAsType ? { parent: target, groupProperties: {} } : {}),
                                links: [{
                                    target: target,
                                    linkProperties: {
                                        properties: {
                                            ...properties, viewType, sibling,
                                            target: target
                                        }
                                    }
                                }, {
                                    target: source,
                                    linkProperties: {
                                        properties: {
                                            ...properties,
                                            viewType,
                                            sibling,
                                            source: source
                                        }
                                    }
                                }]
                            }
                        }

                    }
                }))(dispatch, getState);
            }
            else {
                if (illegalViewType !== properties.viewType) {
                    PerformGraphOperation([{
                        operation: ADD_NEW_NODE,
                        options: function () {
                            return {
                                nodeType: NodeTypes.ViewType,
                                properties: {
                                    [NodeProperties.UIText]: `[${properties.viewType}] ${GetNodeTitle(target)}:${GetNodeTitle(source)}`
                                },
                                links: [{
                                    target: target,
                                    linkProperties: {
                                        properties: { ...properties, sibling }
                                    }
                                }, {
                                    target: source,
                                    linkProperties: {
                                        properties: { ...properties, sibling }
                                    }
                                }]
                            }
                        }

                    }])(dispatch, getState);
                }
            }
        }
        else if (GraphMethods.existsLinkBetween(graph, { target, source, type: NodeConstants.LinkType.PropertyLink })) {
            if (GetNodeProp(target, NodeProperties.UseModelAsType)) {
                debugger;
            }
        }
    }
}
export function GetConditionNodes(id) {
    let state = _getState();
    return GraphMethods.GetConditionNodes(state, id);
}
export function IsAgent(node) {
    return GetNodeProp(node, NodeProperties.IsAgent);
}
export function GetLinkChainItem(options) {
    return GraphMethods.GetLinkChainItem(GetState(), options);
}
export function GetCodeName(node) {
    if (typeof (node) === 'string') {
        node = GraphMethods.GetNode(GetCurrentGraph(GetState()), node);
    }
    return GetNodeProp(node, NodeProperties.CodeName);
}

export function GetJSCodeName(node) {
    var l = GetCodeName(node);
    if (l) {
        return l.toJavascriptName();
    }
    return l;
}

export function GetModelPropertyChildren(id) {

    let property_nodes = GetModelPropertyNodes(id);
    let logicalChildren = GetLogicalChildren(id);
    return [...property_nodes, ...logicalChildren].filter(x => x.id !== id);
}
export function GetMethodParameters(methodId) {
    let method = GetNodeById(methodId);
    if (method) {
        let methodType = GetNodeProp(method, NodeProperties.FunctionType);
        if (methodType && MethodFunctions[methodType]) {

            let { parameters } = MethodFunctions[methodType];
            if (parameters) {
                return parameters;
            }
        }
    }
    return null;
}
export function updateMethodParameters(current, methodType) {
    return (dispatch, getState) => {

        let state = getState();
        let graph = GetRootGraph(state);
        let toRemove = [];
        GraphMethods.GetNodesLinkedTo(graph, {
            id: current
        }).filter(t => {
            return GetNodeProp(t, NodeProperties.NODEType) === NodeTypes.MethodApiParameters;
        }).map(t => {
            toRemove.push(t.id);
            GraphMethods.GetNodesLinkedTo(graph, {
                id: t.id,
            }).filter(w => {
                return GetNodeProp(w, NodeProperties.NODEType) === NodeTypes.MethodApiParameters;
            }).map(v => {
                toRemove.push(v.id);
            });
        });

        toRemove.map(v => {
            graphOperation(REMOVE_NODE, { id: v })(dispatch, getState);
        });
        if (MethodFunctions[methodType]) {
            let { parameters } = MethodFunctions[methodType];
            let newGroupId = uuidv4();
            if (parameters) {
                let { body } = parameters;
                let params = parameters.parameters;
                let operations = [body ? {
                    operation: ADD_NEW_NODE,
                    options: function () {
                        return {
                            nodeType: NodeTypes.MethodApiParameters,
                            properties: {
                                [NodeProperties.UIText]: Titles.Body,
                                [NodeProperties.UriBody]: true
                            },
                            links: [{
                                target: current,
                                linkProperties: {
                                    properties: { ...LinkProperties.MethodApiParameters, body: !!body }
                                }
                            }]
                        }
                    }
                } : false].filter(x => x);
                if (params) {
                    let { query } = params;
                    if (query) {
                        let queryNodeId = null;
                        operations.push({
                            operation: ADD_NEW_NODE,
                            options: function () {
                                return {
                                    nodeType: NodeTypes.MethodApiParameters,
                                    properties: {
                                        [NodeProperties.UIText]: 'Query',
                                        [NodeProperties.QueryParameterObject]: true
                                    },
                                    callback: function (queryNode) {
                                        queryNodeId = queryNode.id;
                                    },
                                    links: [{
                                        target: current,
                                        linkProperties: {
                                            properties: {
                                                ...LinkProperties.MethodApiParameters,
                                                params: true,
                                                query: true
                                            }
                                        }
                                    }]
                                };
                            }
                        }, ...Object.keys(query).map(q => {
                            return {
                                operation: ADD_NEW_NODE,
                                options: function () {
                                    return {
                                        nodeType: NodeTypes.MethodApiParameters,
                                        groupProperties: {},
                                        parent: queryNodeId,
                                        properties: {
                                            [NodeProperties.UIText]: q,
                                            [NodeProperties.QueryParameterParam]: true,
                                            [NodeProperties.QueryParameterParamType]: q
                                        },
                                        linkProperties: {
                                            properties: { ...LinkProperties.MethodApiParameters, parameter: q }
                                        }
                                    };
                                }
                            }
                        }))
                    }
                }
                PerformGraphOperation([...operations])(dispatch, getState);
            }
        }
    }
}
export function GetMethodParametersFor(methodId, type) {
    let method = GetNodeById(methodId);
    if (method) {
        let methodType = GetNodeProp(method, NodeProperties.FunctionType);
        if (methodType && MethodFunctions[methodType]) {

            let { permission, validation } = MethodFunctions[methodType];
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
    var currentGraph = graph || GetCurrentGraph(state || GetState());
    if (currentGraph) {
        return [...currentGraph.nodes.map(t => currentGraph.nodeLib[t])].filter(x => {
            for (var i in props) {
                if (props[i] !== GetNodeProp(x, i)) {
                    return false;
                }
            }
            return true;
        });
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
    let state = _getState();
    var method = GraphMethods.GetMethodNode(state, id);

    return GetNodeProp(method, NodeProperties.FunctionType);
}
export function GetMethodFunctionValidation(id) {

    let state = _getState();
    var method = GraphMethods.GetMethodNode(state, id);
    return GetNodeProp(method, NodeProperties.MethodFunctionValidation);
}
export function GetPermissionNode(id) {
    let state = _getState();
    return GraphMethods.GetPermissionNode(state, id);
}
export function GetValidationNode(id) {
    let state = _getState();
    return GraphMethods.GetValidationNode(state, id);
}
export function GetDataSourceNode(id) {
    let state = _getState();
    return GraphMethods.GetDataSourceNode(state, id);
}
export function GetModelItemFilter(id) {
    let state = _getState();
    return GraphMethods.GetModelItemFilter(state, id);
}
export function GetPermissionsConditions(id) {
    return _getPermissionsConditions(_getState(), id);
}
export function GetServiceInterfaceMethodCalls(id) {
    let state = GetState();
    let graph = GetRootGraph(state);
    return GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ServiceInterfaceMethod);
}
export function GetServiceInterfaceCalls(id) {
    let state = GetState();
    let graph = GetRootGraph(state);
    return GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ServiceInterface);
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
export function GetDataChainEntryNodes() {
    return GraphMethods.GetDataChainEntryNodes(_getState());
}
export function GenerateChainFunction(id) {
    let chain = GetDataChainParts(id);
    let args = null;
    let observables = [];
    let setArgs = [];
    let subscribes = [];
    let setProcess = [];
    let funcs = chain.map((c, index) => {
        if (index === 0) {
            args = GetDataChainArgs(c);
        }
        let temp = GenerateDataChainMethod(c);
        observables.push(GenerateObservable(c, index));
        setArgs.push(GenerateArgs(c, chain));
        setProcess.push(GenerateSetProcess(c, chain));
        subscribes.push(GetSubscribes(c, chain));
        return temp;
    });
    let index = chain.indexOf(id);
    let nodeName = (GetJSCodeName(id) || ('node' + index)).toJavascriptName();
    let lastLink = GetLastChainLink(chain);
    let lastLinkindex = chain.indexOf(lastLink);
    let lastNodeName = (GetJSCodeName(lastLink) || ('node' + lastLinkindex)).toJavascriptName();
    let method = `export function  ${GetCodeName(id)}(${args.join()}) {
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
    let index = parts.indexOf(id);
    let nodeName = (GetJSCodeName(id) || ('node' + index)).toJavascriptName();
    return `${nodeName}.setProcess(${GenerateDataChainMethod(id)})`;

}

export function GetSubscribes(id, parts) {
    let node = GetNodeById(id);
    let index = parts.indexOf(id);
    let nodeName = (GetJSCodeName(id) || ('node' + index)).toJavascriptName();
    let functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
    if (functionType && DataChainFunctions[functionType] && DataChainFunctions[functionType].merge) {
        // pulls args from other nodes
        let args = Object.keys(DataChainFunctions[functionType].ui).map((key, kindex) => {
            let temp = GetNodeProp(node, DataChainFunctions[functionType].ui[key]);
            return `${(GetJSCodeName(temp) || ('node' + parts.indexOf(temp))).toJavascriptName()}`
        });
        if (args && args.length)
            return `${args.map(v => `${v}.subscribe(${nodeName});
`).join('')}`;
    }
    else {
        let parent = (GetNodeProp(node, NodeProperties.ChainParent));
        if (parent) {
            return `${GetJSCodeName(parent).toJavascriptName()}.subscribe(${nodeName})`;
        }
    }
    return '';
}


export function GenerateArgs(id, parts) {
    let node = GetNodeById(id);
    let index = parts.indexOf(id);
    let nodeName = (GetJSCodeName(id) || ('node' + index)).toJavascriptName();
    let functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
    if (functionType && DataChainFunctions[functionType] && DataChainFunctions[functionType].merge) {
        // pulls args from other nodes
        let args = Object.keys(DataChainFunctions[functionType].ui).map((key, kindex) => {
            let temp = GetNodeProp(node, DataChainFunctions[functionType].ui[key]);
            return `['${(GetJSCodeName(temp) || ('node' + parts.indexOf(temp))).toJavascriptName()}']: ${kindex}`
        });

        return `${nodeName}.setArgs({ ${args} })`;
    }
    else {
        let parent = (GetNodeProp(node, NodeProperties.ChainParent));
        if (parent) {
            return `${nodeName}.setArgs({ ['${GetJSCodeName(parent).toJavascriptName()}']: 0 })`;
        }
        else {
            return `${nodeName}.setArgs({ $id: 0 })`;
        }
    }
    return '';
}



export function GetLastChainLink(parts) {
    let lastLink = parts.find(id => {
        return GetNodeProp(GetNodeById(id), NodeProperties.AsOutput);
    })
    return lastLink;
}
export function GenerateObservable(id, index) {
    let nodeName = (GetCodeName(id) || ('node' + index)).toJavascriptName();
    return `let ${nodeName} = new RedObservable('${nodeName}');`
}
export function GetDataChainArgs(id) {
    let node = GetNodeById(id);
    let functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
    if (functionType && DataChainFunctions[functionType]) {
        let { merge, ui } = DataChainFunctions[functionType];
        if (merge) {
            return Object.keys(ui);
        }
        return ['$id']
    }
    return [];
}


export function GetSelectorsNodes(id) {
    let state = _getState();
    let graph = GetRootGraph(state);
    return GraphMethods.GetNodesLinkedTo(graph, {
        id,
        direction: GraphMethods.SOURCE
    }).filter(x => [NodeTypes.Selector, NodeTypes.ViewModel].some(v => v === GetNodeProp(x, NodeProperties.NODEType)));
}

export function GenerateChainFunctions() {
    let entryNodes = GetDataChainEntryNodes().map(x => x.id);
    return entryNodes.map(GenerateChainFunction).join(NodeConstants.NEW_LINE);
}
export function GetDataChainNext(id, graph) {
    graph = graph || GetRootGraph(_getState());
    if (!graph) { throw 'no graph found'; }
    let current = id;
    let groupDaa = GetNodeProp(GetNodeById(current), NodeProperties.Groups);

    if (groupDaa && groupDaa.group) {
        let group = GraphMethods.GetGroup(graph, groupDaa.group);
        if (group) {
            let entryNode = GetGroupProp(group.id, NodeConstants.GroupProperties.GroupEntryNode);
            if (entryNode === current) {
                let exitNode = GetGroupProp(group.id, NodeConstants.GroupProperties.ExternalExitNode);
                return GetNodeById(exitNode);
            }
        }
    }
    let next = GraphMethods.getNodesByLinkType(graph, {
        id: current,
        type: NodeConstants.LinkType.DataChainLink,
        direction: GraphMethods.SOURCE
    }).filter(x => x.id !== current).sort((a, b) => {
        var a_ = GetNodeProp(a, NodeProperties.ChainParent) ? 1 : 0;
        var b_ = GetNodeProp(b, NodeProperties.ChainParent) ? 1 : 0;
        return a_ - b_;
    }).unique(x => x.id)[0];
    return next;
}
export function GetDataChainNextId(id, graph) {
    let next = GetDataChainNext(id, graph);
    return next && next.id;
}
export function GetDataChainParts(id, result) {
    result = result ? result : [id];
    result.push(id);
    result = [...result].unique();
    let node = GetNodeById(id);
    let nodeGroup = GetNodeProp(node, NodeProperties.Groups) || {};
    let groups = Object.values(nodeGroup);
    let current = id;
    let dataChains = NodesByType(_getState(), NodeTypes.DataChain);
    let oldlength;
    do {
        oldlength = result.length;
        let dc = dataChains.filter(x => result.some(v => v === GetNodeProp(x, NodeProperties.ChainParent)));
        result.push(...dc.map(v => v.id));
        dc.map(_dc => {
            groups = [...groups, ...Object.values(GetNodeProp(_dc, NodeProperties.Groups) || {})];
        });
        groups.map(g => {
            let nodes = GetNodesInGroup(g);
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
    let result = [id];
    let current = id;
    let graph = GetRootGraph(_getState());
    if (!graph) { throw 'no graph found'; }
    for (var i = 0; i < 10; i++) {
        let next = GetDataChainNext(current);
        current = null;
        if (next && next.id) {
            result.push(next.id);
            current = next.id;
        }
        else {
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
export function GenerateDataChainMethod(id) {
    let node = GetNodeById(id);
    let model = GetNodeProp(node, NodeProperties.UIModelType);
    let numberParameter = GetNodeProp(node, NodeProperties.NumberParameter);
    let property = GetNodeProp(node, NodeProperties.Property);
    let functionType = GetNodeProp(node, NodeProperties.DataChainFunctionType);
    let func = GetCodeName(GetNodeProp(node, NodeProperties.DataChainReference));
    let selectorProp = GetJSCodeName(GetNodeProp(node, NodeProperties.SelectorProperty));
    let lastpart = 'return item;';
    switch (functionType) {
        case DataChainFunctionKeys.ModelProperty:
            if (property) {
                lastpart = `if(item) {
        return item.${GetJSCodeName(property) || property};
    }
    return null;`
            }
            return `(id) => {
    let item = GetItem(Models.${GetCodeName(model)}, id);
    ${lastpart}
}`;
        case DataChainFunctionKeys.Model:
            return `(id) => {
    let item = GetItem(Models.${GetCodeName(model)}, id);
    ${lastpart}
}`;
        case DataChainFunctionKeys.Pass:
            return `(arg) => {
    return arg;
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
        case DataChainFunctionKeys.GreaterThanOrEqualTo:
            return `(a) => greaterThanOrEqualTo(a, ${numberParameter})`;
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
        case DataChainFunctionKeys.Equals:
            return `(a, b) => a === b`;
        case DataChainFunctionKeys.Required:
            return `(a) => a !== null && a !==undefined`;
        case DataChainFunctionKeys.Not:
            return `(a) => !!!a`;
        case DataChainFunctionKeys.Selector:
            return `(a) => a.${selectorProp}`

    }
}
export function GetPermissionsSortedByAgent() {
    return GetNodesSortedByAgent(NodeTypes.Permission);
}

export function GetValidationsSortedByAgent() {
    return GetNodesSortedByAgent(NodeTypes.Validator);
}

export function GetNodesSortedByAgent(type) {
    let state = _getState();
    let nodes = NodesByType(state, type);

    return nodes.filter((node) => {
        let methodNode = GraphMethods.GetMethodNode(state, node.id);
        return methodNode;
    }).groupBy(node => {
        let methodNode = GraphMethods.GetMethodNode(state, node.id);
        return GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent);
    })
}

export function GetArbitersForNodeType(type) {
    let state = _getState();
    let permissions = NodesByType(state, type);
    let models = [];
    permissions.map((permission) => {
        let methodNode = GraphMethods.GetMethodNode(state, permission.id);
        let methodProps = GetMethodProps(methodNode);
        Object.values(methodProps).map(id => {
            let node = GetGraphNode(id);
            let nodeType = GetNodeProp(node, NodeProperties.NODEType);
            if ([NodeTypes.Model].some(v => v === nodeType)) {
                models.push(id);
            }
        })
    })
    return models.unique();
}

export function GetCustomServicesForNodeType(type) {
    let state = _getState();
    let permissions = NodesByType(state, type);
    let models = [];
    permissions.map((permission) => {
        let methods = GetServiceInterfaceMethodCalls(permission.id);
        methods.map(method => {
            let services = GetServiceInterfaceCalls(method.id);
            models.push(...services.map(v => v.id));
        })
    });
    return models.unique();
}

export function GetAgentNodes() {
    return NodesByType(_getState(), NodeTypes.Model).filter(x => GetNodeProp(x, NodeProperties.IsAgent));
}
export function GetUsers() {
    return NodesByType(_getState(), NodeTypes.Model).filter(x => GetNodeProp(x, NodeProperties.IsUser));
}
export function GetArbitersForPermissions() {
    return GetArbitersForNodeType(NodeTypes.Permission);
}

export function GetArbitersForValidations() {
    return GetArbitersForNodeType(NodeTypes.Validator);
}

export function GetNameSpace() {
    let state = _getState();

    let graphRoot = GetRootGraph(state);

    let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

    return namespace;
}

export function GetArbiterPropertyDefinitions(tabs = 3, language = NodeConstants.ProgrammingLanguages.CSHARP) {
    let arbiters = GetArbitersForPermissions();
    let template = `IRedArbiter<{{model}}> arbiter{{model}};`
    let tab = [].interpolate(0, tabs, () => `   `).join('');
    let definitions = arbiters.map(arbiter => {
        return tab + bindTemplate(template, {
            model: GetCodeName(arbiter)
        });
    });
    return definitions.join(NodeConstants.NEW_LINE);
}
export function GetCustomServiceDefinitions(type, tabs = 3, language = NodeConstants.ProgrammingLanguages.CSHARP) {
    let services = GetCustomServicesForNodeType(type);
    let template = `I{{model}} {{model_js}};`
    let tab = [].interpolate(0, tabs, () => `   `).join('');
    let definitions = services.map(service => {
        return tab + bindTemplate(template, {
            model: GetCodeName(service),
            model_js: GetJSCodeName(service)
        });
    });
    return definitions.join(NodeConstants.NEW_LINE);
}


export function GetArbiterPropertyImplementations(tabs = 4, language = NodeConstants.ProgrammingLanguages.CSHARP) {
    let arbiters = GetArbitersForPermissions();
    let template = `arbiter{{model}} = RedStrapper.Resolve<IRedArbiter<{{model}}>>();`
    let tab = [].interpolate(0, tabs, () => `   `).join('');
    let definitions = arbiters.map(arbiter => {
        return tab + bindTemplate(template, {
            model: GetCodeName(arbiter)
        });
    });
    return definitions.join(NodeConstants.NEW_LINE);
}

export function GetCustomServiceImplementations(type, tabs = 4, language = NodeConstants.ProgrammingLanguages.CSHARP) {
    let services = GetCustomServicesForNodeType(type);
    let template = `{{model_js}} = RedStrapper.Resolve<I{{model}}>();`
    let tab = [].interpolate(0, tabs, () => `   `).join('');
    let definitions = services.map(service => {
        return tab + bindTemplate(template, {
            model: GetCodeName(service),
            model_js: GetJSCodeName(service)
        });
    });
    return definitions.join(NodeConstants.NEW_LINE);
}

export function GetCombinedCondition(id, language = NodeConstants.ProgrammingLanguages.CSHARP) {
    let node = GetGraphNode(id);
    let conditions = [];
    let customMethods = [];
    let final_result = 'res';
    let tabcount = 0;
    let methodNodeParameters = null;
    let ft = null;
    let methodNode = null;
    switch (GetNodeProp(node, NodeProperties.NODEType)) {
        case NodeTypes.Permission:
            conditions = GetPermissionsConditions(id);
            customMethods = GetServiceInterfaceMethodCalls(id);
            methodNode = GetPermissionMethod(node);
            ft = MethodFunctions[GetNodeProp(methodNode, NodeProperties.FunctionType)];
            if (ft && ft.permission && ft.permission.params) {
                methodNodeParameters = ft.permission.params.map(t => typeof (t) === 'string' ? t : t.key);
            }
            final_result = 'result';
            tabcount = 3;
            break;
        case NodeTypes.ModelItemFilter:
            conditions = GetModelItemConditions(id);
            break;
        case NodeTypes.Validator:
            conditions = GetValidationsConditions(id);
            methodNode = GetNodesMethod(id);
            ft = MethodFunctions[GetNodeProp(methodNode, NodeProperties.FunctionType)];
            if (ft && ft.validation && ft.validation.params) {
                methodNodeParameters = ft.validation.params.map(t => typeof (t) === 'string' ? t : t.key);
            }
            tabcount = 3;
            final_result = 'result';
            break;
    }
    let tabs = [].interpolate(0, tabcount, () => `    `).join('');
    let clauses = [];
    conditions.map(condition => {
        let selectedConditionSetup = GetSelectedConditionSetup(id, condition);
        let res = GetConditionsClauses(id, selectedConditionSetup, language);
        clauses = [...clauses, ...res.map(t => t.clause)];
    });
    customMethods.map(customMethod => {
        let res = GetCustomMethodClauses(node, customMethod, methodNodeParameters, language);
        clauses = [...clauses, ...res.map(t => t.clause)]
    });
    let finalClause = clauses.map((_, index) => {
        return `res_` + index;
    }).join(' && ') || 'true';
    clauses.push(`${final_result} = ${finalClause};`)
    return clauses.map((clause, index) => {
        return tabs + bindTemplate(clause, {
            result: `res_${index}`
        });
    }).join(NodeConstants.NEW_LINE)

}

export function GetCustomMethodClauses(node, customMethod, methodNodeParameters, language) {
    let result = [];

    if (methodNodeParameters) {
        let serviceInterface = GetServiceInterfaceCalls(customMethod.id).find(x => x);

        if (serviceInterface) {
            result.push({
                clause: `var {{result}} = await ${GetJSCodeName(serviceInterface)}.${GetCodeName(customMethod)}(${methodNodeParameters.join()});`
            })
        }

    }
    return result;
}
export function GetConditionsClauses(adjacentId, clauseSetup, language) {
    let result = [];
    if (clauseSetup) {
        Object.keys(clauseSetup).map(clauseKey => {
            let { properties } = clauseSetup[clauseKey];
            if (properties) {
                Object.keys(properties).map(modelId => {
                    let propertyName = GetCodeName(modelId);
                    let { validators } = properties[modelId];
                    if (validators) {
                        Object.keys(validators).map(validatorId => {
                            let validator = validators[validatorId];
                            let res = GetConditionClause(adjacentId, clauseKey, propertyName, validator, language);
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
    return str.split('-').join('_');
}
export function GetConditionClause(adjacentId, clauseKey, propertyName, validator, language) {
    let method = GetNodesMethod(adjacentId);
    let clauseKeyNodeId = GetMethodNodeProp(method, clauseKey);
    let { type, template, node, nodeProperty, many2manyProperty, many2many, many2manyMethod } = validator;
    let dataAccessor = '';
    let nodeNodeId = GetMethodNodeProp(method, node);
    let conditionTemplate = '';
    let condition = '';
    let properties = {};
    if (NodeConstants.FilterUI && NodeConstants.FilterUI[type] && NodeConstants.FilterUI[type].template && !template) {
        template = NodeConstants.FilterUI[type].template;
    }
    if (template) {
        conditionTemplate = fs.readFileSync(template, 'utf8');
    }
    else {
        throw 'no template found'
    }
    if (clauseKey === 'change_parameter') {
        clauseKey = clauseKey + '.Data';
    }
    switch (type) {
        case NodeConstants.FilterRules.IsInModelPropertyCollection:
        case NodeConstants.FilterRules.EqualsModelProperty:
        case NodeConstants.FilterRules.EqualsFalse:
        case NodeConstants.FilterRules.EqualsParent:
        case NodeConstants.FilterRules.IsNotInModelPropertyCollection:
            properties = {
                agent: safeFormatTemplateProperty(clauseKey),
                agent_property: safeFormatTemplateProperty(propertyName),
                model: node,
                model_property: GetCodeName(nodeProperty)
            }
            break;
        case NodeConstants.FilterRules.Many2ManyPropertyIsTrue:
            properties = {
                agent: safeFormatTemplateProperty(clauseKey),
                agent_property: safeFormatTemplateProperty(propertyName),
                agent_type: GetCodeName(clauseKeyNodeId) || 'agent_type missing',
                model_type: GetCodeName(nodeNodeId) || 'model_type missing',
                model: node,
                model_property: GetCodeName(nodeProperty),
                connection_type: GetCodeName(many2many),
                connection_is_true: GetConnectionClause({
                    many2manyProperty,
                    many2manyMethod
                }) //
            }
            break;
        case NodeConstants.ValidationRules.OneOf:
            let listItems = GenerateConstantList(validator);
            properties = {
                agent: safeFormatTemplateProperty(clauseKey),
                agent_property: safeFormatTemplateProperty(propertyName),
                agent_type: GetCodeName(clauseKeyNodeId) || 'agent_type missing',
                list: listItems
            }
            break;
        case NodeConstants.ValidationRules.AlphaOnlyWithSpaces:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'AlphaOnlyWithSpacesAttribute'
            }
            break;
        case NodeConstants.ValidationRules.AlphaNumericLike:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'AlphaNumericLikeAttribute'
            }
            break;
        case NodeConstants.ValidationRules.AlphaOnly:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'AlphaOnlyAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MaxLength:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: `${validator ? validator.condition : null}`,
                validation_Func_name: 'MaxLengthAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MaxLengthEqual:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: `${validator ? validator.condition : null}, true`,
                validation_Func_name: 'MaxLengthAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MinLength:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: validator ? validator.condition : null,
                validation_Func_name: 'MinLengthAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MinLengthEqual:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: `${validator ? validator.condition : null}, true`,
                validation_Func_name: 'MinLengthAttribute'
            }
            break;

        case NodeConstants.ValidationRules.MaxValue:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: `${validator ? validator.condition : null}`,
                validation_Func_name: 'MaxAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MaxValueEqual:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: `${validator ? validator.condition : null}, true`,
                validation_Func_name: 'MaxAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MinValue:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: validator ? validator.condition : null,
                validation_Func_name: 'MinAttribute'
            }
            break;
        case NodeConstants.ValidationRules.MinValueEqual:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                parameters: `${validator ? validator.condition : null}, true`,
                validation_Func_name: 'MinAttribute'
            }
            break;
        case NodeConstants.ValidationRules.Email:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'EmailAttribute'
            }
            break;
        case NodeConstants.ValidationRules.EmailEmpty:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'EmailEmptyAttribute'
            }
            break;
        case NodeConstants.ValidationRules.Zip:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'ZipAttribute'
            }
            break;
        case NodeConstants.ValidationRules.ZipEmpty:
            properties = {
                model: clauseKey,
                model_property: propertyName,
                validation_Func_name: 'ZipEmptyAttribute'
            }
            break;
        default:
            throw 'Unhandled condition clause case: ' + type;
    }

    return bindTemplate(conditionTemplate, {
        parameters: '',
        ...properties
    });
}
function GenerateConstantList(validator) {
    let node = GetGraphNode(validator.node);
    let { enumeration } = validator;
    switch (GetNodeProp(node, NodeProperties.NODEType)) {
        case NodeTypes.Enumeration:
            var enums = GetNodeProp(node, NodeProperties.Enumeration) || [];

            return enums.map(enum_ => {
                if (enumeration[enum_.id || enum_]) {
                    return `${GetCodeName(validator.node)}.${NodeConstants.MakeConstant(enum_.value || enum_)}`;
                }
            }).filter(x => x).join(', ');
        default:
            throw 'not implemented capturing of enums';
    }
}
export function GetConnectionClause(args) {
    let {
        many2manyProperty,
        many2manyMethod
    } = args;
    switch (many2manyMethod) {
        case NodeConstants.FilterRules.EqualsTrue:
            return bindTemplate('_x => _x.{{connection_property}} == {{connection_value}}', {
                connection_property: GetCodeName(many2manyProperty),
                connection_value: 'true'
            });
        case NodeConstants.FilterRules.EqualsFalse:
            return bindTemplate('_x => _x.{{connection_property}} == {{connection_value}}', {
                connection_property: GetCodeName(many2manyProperty),
                connection_value: 'false'
            });
        default:
            throw 'unhandle get connection clause : ' + many2manyMethod
    }
}

export function GetSelectedConditionSetup(permissionId, condition) {
    var method = GraphMethods.GetMethodNode(_getState(), permissionId);
    if (method) {
        let conditionSetup = GetConditionSetup(condition);
        if (conditionSetup && conditionSetup.methods) {
            return conditionSetup.methods[GetNodeProp(method, NodeProperties.FunctionType)];
        }
        else {
            // console.warn('condition is improperly formed');
        }
    }
    else {
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
    let graph = GetRootGraph(state);
    return GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Condition);
}

export function GetComponentNodes() {
    let state = GetState();
    return NodesByType(state, NodeTypes.ComponentNode);
}
export function GetComponentNodeProperties() {
    let res = GetComponentNodes().map(node => {

        let componentProperties = GetNodeProp(node, NodeProperties.ComponentProperties);
        let componentPropertiesList = GraphMethods.getComponentPropertyList(componentProperties) || [];

        return { id: node.id, componentPropertiesList };
    }).filter(x => x.componentPropertiesList.length).groupBy(x => x.id);

    var result = [];
    Object.keys(res).map(v => {
        let componentPropertiesList = [];
        res[v].map(b => componentPropertiesList.push(...b.componentPropertiesList)).unique(x => x.id);

        result.push({ id: v, componentPropertiesList })
    });

    return result;
}
export function GetConnectedScreenOptions(id) {
    let state = _getState();
    let graph = GetRootGraph(state);
    return GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption);
}
export function GetModelPropertyNodes(refId) {
    var state = _getState();
    return GraphMethods.GetLinkChain(state, {
        id: refId,
        links: [{
            type: NodeConstants.LinkType.PropertyLink,
            direction: GraphMethods.SOURCE
        }]
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Property);
}

export function GetLogicalChildren(id) {
    let currentNode = GraphMethods.GetNode(GetCurrentGraph(GetState()), id);
    var hasLogicalChildren = GetNodeProp(currentNode, NodeProperties.HasLogicalChildren);
    if (hasLogicalChildren)
        return (GetNodeProp(currentNode, NodeProperties.LogicalChildrenTypes) || []).map(t => {
            let node = GraphMethods.GetNode(GetCurrentGraph(_getState()), t);
            return node;
        }).filter(x => x);
    return [];
}

export function GetMethodNodeSelectOptions(methodProps) {
    return Object.keys(methodProps).map(val => {
        return {
            value: val,
            title: `${GetCodeName(methodProps[val])} (${val})`
        }
    })
}
export function GetNodeCode(graph, id) {
    return GetCodeName(GraphMethods.GetNode(graph, id));
}

export function GetMethodPropNode(graph, node, key) {
    var methodProps = GetNodeProp(node, NodeProperties.MethodProps);
    if (methodProps) {
        return GraphMethods.GetNode(graph, methodProps[key] || null);
    }
    return null;
}

export function GetMethodOptions(methodProps) {
    if (!methodProps) {
        return [];
    }
    let state = _getState();
    return Object.keys(methodProps).map(t => {
        var n = GraphMethods.GetNode(GetRootGraph(state), methodProps[t]);
        return {
            title: `${GetCodeName(n)} (${t})`,
            value: t
        }
    });
}

export function GetLinkProperty(link, prop) {
    return link && link.properties && link.properties[prop]
}

export function GetGroupProperty(group, prop) {
    return group && group.properties && group.properties[prop]
}

export function VisualEq(state, key, value) {
    return Visual(state, key) === value;
}
export function Node(state, nodeId) {

    var currentGraph = GetCurrentGraph(state);
    if (currentGraph && currentGraph.nodeLib) {
        return currentGraph.nodeLib[nodeId];
    }
    return null;
}
export function ModelNotConnectedToFunction(agentId, modelId, packageType, nodeType = NodeTypes.Method) {
    let connections = NodesByType(_getState(), nodeType).filter(x => {
        let match = GetNodeProp(x, NodeProperties.NodePackage) === modelId &&
            GetNodeProp(x, NodeProperties.NodePackageType) === packageType &&
            GetNodeProp(x, NodeProperties.NodePackageAgent) === agentId
        return match;
    }).length;

    return !connections
}
export function Application(state, key) {
    return GetC(state, APPLICATION, key);
}
export function GetVisualGraph(state) {
    var currentGraph = GetCurrentGraph(state);
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
    let visualGraph = GraphMethods.VisualProcess(graph);
    if (visualGraph)
        dispatch(UIC(VISUAL_GRAPH, visualGraph.id, visualGraph));
    dispatch(UIC(GRAPHS, graph.id, graph));
}
export function UIC(section, item, value) {
    return {
        type: UI_UPDATE,
        item,
        value,
        section
    }
}
export function toggleVisual(key) {
    return (dispatch, getState) => {
        var state = getState();
        dispatch(UIC(VISUAL, key, !!!GetC(state, VISUAL, key)))
    }
}

export function toggleMinimized(key) {
    return (dispatch, getState) => {
        var state = getState();
        dispatch(UIC(MINIMIZED, key, !!!GetC(state, MINIMIZED, key)))
    }
}

export function toggleHideByTypes(key) {
    return (dispatch, getState) => {
        var state = getState();
        let newvalue = !!!GetC(state, HIDDEN, key);
        dispatch(UIC(HIDDEN, key, newvalue));
        PerformGraphOperation(NodesByType(state, key).map(node => {
            return {
                operation: CHANGE_NODE_PROPERTY,
                options: {
                    prop: NodeProperties.Pinned,
                    id: node.id,
                    value: newvalue

                }
            }
        }))(dispatch, getState);
    }
}

export function GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function setVisual(key, value) {
    return (dispatch, getState) => {
        var state = getState();
        dispatch(UIC(VISUAL, key, value))
    }

}
export function setApplication(key, value) {
    return (dispatch, getState) => {
        var state = getState();
        dispatch(UIC(APPLICATION, key, value))
    }

}
export const SELECTED_LINK = 'SELECTED_LINK';
export const HOVERED_LINK = 'HOVERED_LINK';
export const SELECTED_NODE = 'SELECTED_NODE';
export const CONTEXT_MENU_VISIBLE = 'CONTEXT_MENU_VISIBLE';
export const CONTEXT_MENU_MODE = 'CONTEXT_MENU_MODE';
export function SelectedNode(nodeId) {
    return (dispatch, getState) => {
        dispatch(UIC(VISUAL, SELECTED_NODE, nodeId));
    }
}
export function toggleDashboardMinMax() {
    return toggleVisual(DASHBOARD_MENU);
}
export function GetNodeTitle(node) {
    if (typeof (node) === 'string') {
        node = GraphMethods.GetNode(GetCurrentGraph(GetState()), node);
    }

    if (!node) { return Titles.Unknown }
    return node.properties ? node.properties.text || node.id : node.id;
}
export function GetNodes(state) {
    var currentGraph = GetCurrentGraph(state);
    if (currentGraph) {
        return [...currentGraph.nodes.map(t => currentGraph.nodeLib[t])];
    }
    return [];
}
export function CanChangeType(node) {
    var nodeType = GetNodeProp(node, NodeProperties.NODEType);
    switch (nodeType) {
        case NodeTypes.ReferenceNode:
            return false;
        default:
            return true;
    }
}
export function GetScreenNodes() {
    var state = _getState();
    return NodesByType(state, NodeTypes.Screen);
}
export function GetModelNodes() {
    return NodesByType(_getState(), NodeTypes.Model);
}
export function GetConfigurationNodes() {
    return NodesByType(_getState(), NodeTypes.Configuration);
}
export function GetMaestroNode(id) {
    let state = _getState();
    let graph = GetRootGraph(state);
    let nodes = GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Maestro);
    if (nodes && nodes.length) {
        return nodes[0];
    }
    return null;
}
export function GetControllerNode(id) {
    let state = _getState();
    let graph = GetRootGraph(state);
    let nodes = GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Controller);
    if (nodes && nodes.length) {
        return nodes[0];
    }
    return null;
}
export function HasCurrentGraph(options = {}) {
    let state = _getState();
    var currentGraph = options.useRoot ? GetRootGraph(state) : GetCurrentGraph(state);
    return !!currentGraph;
}
export function NodesByType(state, nodeType, options = {}) {

    var currentGraph = options.useRoot ? GetRootGraph(state) : GetCurrentGraph(state);
    if (currentGraph) {
        if (!Array.isArray(nodeType)) {
            nodeType = [nodeType];
        }
        return currentGraph.nodes
            .filter(x => currentGraph.nodeLib && currentGraph.nodeLib[x] && currentGraph.nodeLib[x].properties &&
                (nodeType.indexOf(currentGraph.nodeLib[x].properties[NodeProperties.NODEType]) !== -1) ||
                (!options.excludeRefs &&
                    currentGraph.nodeLib &&
                    currentGraph.nodeLib[x] &&
                    currentGraph.nodeLib[x].properties &&
                    currentGraph.nodeLib[x].properties[NodeProperties.ReferenceType] === nodeType))
            .map(x => currentGraph.nodeLib[x]);
    }
    return [];
}

export function GetNodeFromRoot(state, id) {
    var graph = GetRootGraph(state);
    if (graph) {
        return GraphMethods.GetNode(graph, id);
    }
    return null;
}

export function NodesConnectedTo(state, nodeId) {
    var currentGraph = GetCurrentGraph(state);
    if (currentGraph) {
        return (t) => {
            if (currentGraph.linkLib[t.id]) {
                return currentGraph.linkLib[t.id][nodeId];
            }
        }
    }
    return () => false;
}
let _getState;
let _dispatch;
export function GetState() {
    return _getState();
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
    }
}

export function clearPinned() {
    let state = _getState();
    _dispatch(graphOperation(GetNodes(state).filter(x => GetNodeProp(x, NodeProperties.Pinned)).map(node => {
        return {
            operation: CHANGE_NODE_PROPERTY,
            options: {
                prop: NodeProperties.Pinned,
                id: node.id,
                value: false
            }
        }
    })));
}
export function clearMarked() {
    let state = _getState();
    _dispatch(graphOperation(GetNodes(state).filter(x => GetNodeProp(x, NodeProperties.Selected)).map(node => {
        return {
            operation: CHANGE_NODE_PROPERTY,
            options: {
                prop: NodeProperties.Selected,
                id: node.id,
                value: false
            }
        }
    })));
}

export function selectProperties(model) {
    return (dispatch, getState) => {
        let state = getState();
        (graphOperation(GraphMethods.getPropertyNodes(GetRootGraph(state), model).map(t => {
            return {
                operation: CHANGE_NODE_PROPERTY,
                options: {
                    prop: NodeProperties.Pinned,
                    id: t.id,
                    value: true
                }
            }
        })))(dispatch, getState);
    }
}
export function toggleNodeMark() {
    let state = _getState();
    let currentNode = Node(state, Visual(state, SELECTED_NODE));
    _dispatch(graphOperation(CHANGE_NODE_PROPERTY, {
        prop: NodeProperties.Selected,
        id: currentNode.id,
        value: !GetNodeProp(currentNode, NodeProperties.Selected)
    }));
}
export function setInComponentMode() {
    _dispatch(UIC(MINIMIZED, NodeTypes.Selector, true));
    _dispatch(UIC(MINIMIZED, NodeTypes.ViewModel, true));
    _dispatch(UIC(MINIMIZED, NodeTypes.ViewType, true));
}
export function removeCurrentNode() {
    graphOperation(REMOVE_NODE, { id: Visual(_getState(), SELECTED_NODE) })(_dispatch, _getState);
}
export function togglePinned() {
    let state = _getState();
    let currentNode = Node(state, Visual(state, SELECTED_NODE));
    _dispatch(graphOperation(CHANGE_NODE_PROPERTY, {
        prop: NodeProperties.Pinned,
        id: currentNode.id,
        value: !GetNodeProp(currentNode, NodeProperties.Pinned)
    }))
}
export function GetGraphNode(id) {
    let state = _getState();
    return GraphMethods.GetNode(GetRootGraph(state), id);
}
export function GetFunctionType(methodNode) {
    return GetNodeProp(methodNode, NodeProperties.FunctionType);
}
export function GetMethodNode(id) {
    return GraphMethods.GetMethodNode(_getState(), id);
}
export function GetMethodNodeProp(methodNode, key) {
    let methodProps = (GetNodeProp(methodNode, NodeProperties.MethodProps) || {});
    if (typeof (key) === 'string')
        return methodProps[key];
    if (!key) return null;
    let { template } = key;
    let temp = {};
    Object.keys(methodProps).map(t => {
        temp[t] = GetCodeName(methodProps[t]);
    })
    return bindTemplate(template, temp);

}
export function GetMethodProps(methodNode) {
    return (GetNodeProp(methodNode, NodeProperties.MethodProps) || {});
}
export function GetMethodsProperties(id) {
    let state = _getState();
    var method = GraphMethods.GetMethodNode(state, id);
    let methodProps = GetMethodProps(method);
    return methodProps;
}
export function GetMethodsProperty(id, prop) {
    let methodProps = GetMethodsProperties(id);
    if (methodProps) {
        return methodProps[prop];
    }
    return null;
}
export function GetMethodFilterParameters(id, all) {
    return GetMethod_Parameters(id, 'filter', all);
}
export function GetMethodFilterMetaParameters(id, all) {
    return GetMethod_MetaParameters(id, 'filter');
}
function GetMethod_MetaParameters(id, key) {
    let state = _getState();
    var method = GraphMethods.GetMethodNode(state, id);
    let methodProps = GetMethodProps(method);
    let methodType = GetNodeProp(method, NodeProperties.FunctionType);
    if (methodType) {
        let setup = MethodFunctions[methodType];
        if (setup && setup[key] && setup[key].params && methodProps) {
            return setup[key].params.filter(x => typeof (x) === 'object' || x.metaparameter).map(x => {
                let _x = x.key;
                let nodeName = GetNodeTitle(methodProps[_x]);
                let nodeClass = GetCodeName(methodProps[_x]);
                return {
                    title: nodeName,
                    value: _x,
                    paramClass: nodeClass,
                    paramName: _x
                }
            });
        }
    }
    return [];
}
function GetMethod_Parameters(id, key, all) {
    let state = _getState();
    var method = GraphMethods.GetMethodNode(state, id);
    let methodProps = GetMethodProps(method);
    let methodType = GetNodeProp(method, NodeProperties.FunctionType);
    if (methodType) {
        let setup = MethodFunctions[methodType];
        if (setup && setup[key] && setup[key].params && methodProps) {
            return setup[key].params.filter(x => all || typeof (x) === 'string' || !x.metaparameter)
                .map(x => !x.metaparameter ? x : x.metaparameter)
                .map(_x => {
                    let nodeName = GetNodeTitle(methodProps[_x]);
                    let nodeClass = GetCodeName(methodProps[_x]);
                    return {
                        title: nodeName,
                        value: _x,
                        paramClass: nodeClass,
                        paramName: _x
                    }
                });
        }
    }
    return [];
}
export function GetMethodPermissionParameters(id, all) {
    return GetMethod_Parameters(id, 'permission', all);
}
export function GetMethodValidationParameters(id, all) {
    return GetMethod_Parameters(id, 'validation', all);
}
export function GetPermissionMethod(permission) {
    return GetLinkChainItem({
        id: permission.id,
        links: [{
            type: NodeConstants.LinkType.FunctionOperator,
            direction: GraphMethods.TARGET
        }]
    })
}
export function GetNodesMethod(id) {
    return GetPermissionMethod(GetNodeById(id));
}
export function GetCurrentGraph(state) {
    var scopedGraph = GetCurrentScopedGraph(state);
    return scopedGraph;
    // if (currentGraph) {
    //     currentGraph = Graphs(state, currentGraph);
    // }
    // return currentGraph;
}
export function GetRootGraph(state, dispatch) {
    var currentGraph = Application(state, CURRENT_GRAPH);
    if (currentGraph) {
        currentGraph = Graphs(state, currentGraph);
    }
    else if (dispatch) {
        currentGraph = GraphMethods.createGraph();
        SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
    }

    return currentGraph;
}
export function GetSubGraphs(state) {
    var currentGraph = Application(state, CURRENT_GRAPH);
    if (currentGraph) {
        currentGraph = Graphs(state, currentGraph);
        let subgraphs = GraphMethods.getSubGraphs(currentGraph);
        return subgraphs;
    }
    return null;
}
export function addNewSubGraph() {
    return (dispatch, getState) => {
        var rootGraph = GetRootGraph(getState(), dispatch);
        rootGraph = GraphMethods.addNewSubGraph(rootGraph);
        SaveGraph(rootGraph, dispatch);
    };
}

export function setRootGraph(key, value) {
    return (dispatch, getState) => {
        var rootGraph = GetRootGraph(getState(), dispatch);
        rootGraph = {
            ...rootGraph, ...{ [key]: value }
        };
        SaveGraph(rootGraph, dispatch);
    };
}
export function setAppsettingsAssemblyPrefixes(prefixes) {
    return (dispatch, getState) => {
        var rootGraph = GetRootGraph(getState(), dispatch);
        rootGraph.appConfig.AppSettings.AssemblyPrefixes = ['RedQuick', prefixes].unique(x => x).join(';')
        SaveGraph(rootGraph, dispatch);
    }
}
export function GetCurrentScopedGraph(state, dispatch) {
    var currentGraph = Application(state, CURRENT_GRAPH);
    let scope = Application(state, GRAPH_SCOPE) || [];
    if (!currentGraph) {
        if (dispatch) {
            currentGraph = GraphMethods.createGraph();
            SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
        }
    }
    else {
        currentGraph = Graphs(state, currentGraph);
        if (scope.length) {
            currentGraph = GraphMethods.getScopedGraph(currentGraph, { scope });
        }
    }
    return currentGraph
}
export const SELECTED_TAB = 'SELECTED_TAB';
export const DEFAULT_TAB = 'DEFAULT_TAB';
export const SIDE_PANEL_OPEN = 'side-panel-open';
export const PARAMETER_TAB = 'PARAMETER_TAB';
export const SCOPE_TAB = 'SCOPE_TAB';
export const QUICK_MENU = 'QUICK_MENU';

export function newNode() {
    graphOperation(NEW_NODE)(_dispatch, _getState);
    setVisual(SIDE_PANEL_OPEN, true)(_dispatch, _getState);
    setVisual(SELECTED_TAB, DEFAULT_TAB)(_dispatch, _getState);
}
export function GetSelectedSubgraph(state) {
    var root = GetRootGraph(state);
    if (root) {
        var scope = Application(state, GRAPH_SCOPE);
        if (scope && scope.length) {
            return GraphMethods.getSubGraph(root, scope);
        }
    }
    return null;
}

export function BuildPackage(model, _package) {
    let { id } = model;
    let methodFunctionDefinition = MethodFunctions[_package.methodType];
    if (methodFunctionDefinition) {
        let { constraints } = methodFunctionDefinition;

        Object.keys(constraints).values(_const => {
            let { key } = _const;
        });
    }
}

export const UPDATE_GRAPH_TITLE = 'UPDATE_GRAPH_TITLE';
export const NEW_NODE = 'NEW_NODE';
export const REMOVE_NODE = 'REMOVE_NODE';
export const NEW_LINK = 'NEW_LINK';
export const CHANGE_NODE_TEXT = 'CHANGE_NODE_TEXT';
export const CURRENT_GRAPH = 'CURRENT_GRAPH';
export const GRAPH_SCOPE = 'GRAPH_SCOPE';
export const ADD_DEFAULT_PROPERTIES = 'ADD_DEFAULT_PROPERTIES';
export const CHANGE_NODE_PROPERTY = 'CHANGE_NODE_PROPERTY';
export const NEW_PROPERTY_NODE = 'NEW_PROPERTY_NODE';
export const NEW_PERMISSION_NODE = 'NEW_PERMISSION_NODE';
export const NEW_ATTRIBUTE_NODE = 'NEW_ATTRIBUTE_NODE';
export const ADD_LINK_BETWEEN_NODES = 'ADD_LINK_BETWEEN_NODES';
export const NEW_CONDITION_NODE = 'NEW_CONDITION_NODE';
export const ADD_NEW_NODE = 'ADD_NEW_NODE';
export const REMOVE_LINK_BETWEEN_NODES = 'REMOVE_LINK_BETWEEN_NODES';
export const REMOVE_LINK = 'REMOVE_LINK';
export const NEW_CHOICE_ITEM_NODE = 'NEW_CHOICE_ITEM_NODE';
export const NEW_PARAMETER_NODE = 'NEW_PARAMETER_NODE';
export const NEW_FUNCTION_OUTPUT_NODE = 'NEW_FUNCTION_OUTPUT_NODE';
export const NEW_MODEL_ITEM_FILTER = 'NEW_MODEL_ITEM_FILTER';
export const NEW_AFTER_METHOD = 'NEW_AFTER_METHOD';
export const NEW_VALIDATION_ITEM_NODE = 'NEW_VALIDATION_ITEM_NODE';
export const NEW_CHOICE_TYPE = 'NEW_CHOICE_TYPE';
export const NEW_VALIDATION_TYPE = 'NEW_VALIDATION_TYPE';
export const NEW_OPTION_ITEM_NODE = 'NEW_OPTION_ITEM_NODE';
export const NEW_OPTION_NODE = 'NEW_OPTION_NODE';
export const NEW_CUSTOM_OPTION = 'NEW_CUSTOM_OPTION';
export const UPDATE_GROUP_PROPERTY = 'UPDATE_GROUP_PROPERTY';
export const NEW_DATA_SOURCE = 'NEW_DATA_SOURCE';
export const NEW_COMPONENT_NODE = 'NEW_COMPONENT_NODE';
export const NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE = 'NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE';
export const NEW_EXTENSION_LIST_NODE = 'NEW_EXTENSION_LIST_NODE';
export const NEW_EXTENTION_NODE = 'NEW_EXTENTION_NODE';
export const NEW_SCREEN_OPTIONS = 'NEW_SCREEN_OPTIONS';
export const ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY = 'ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY';
export const APPLY_FUNCTION_CONSTRAINTS = 'APPLY_FUNCTION_CONSTRAINTS';
export const ADD_NEW_REFERENCE_NODE = 'ADD_NEW_REFERENCE_NODE;'
export const SET_DEPTH = 'SET_DEPTH';
export function PerformGraphOperation(commands) {
    return graphOperation(commands);
}
export function executeGraphOperation(model, op, args = {}) {
    return (dispatch, getState) => {
        op.method({ model, dispatch, getState, ...args });
    }
}
export function executeGraphOperations(operations) {
    return (dispatch, getState) => {
        operations.map(t => {
            var { node, method, options } = t;
            method.method({ model: node, dispatch, getState, ...options });
        })
    }
}
export function selectAllConnected(id) {
    return (dispatch, getState) => {
        let nodes = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(getState()), {
            id
        });
        graphOperation([...[...nodes, GetNodeById(id)].map(t => {
            return {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    return {
                        prop: NodeProperties.Selected,
                        value: true,
                        id: t.id
                    }
                }
            }
        })])(dispatch, getState)
    }
}
export function selectAllInViewPackage(id) {
    return (dispatch, getState) => {
        let node = GetNodeById(id);
        let nodes = GetNodesByProperties({
            [NodeProperties.ViewPackage]: GetNodeProp(node, NodeProperties.ViewPackage)
        });
        graphOperation([...[...nodes].map(t => {
            return {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    return {
                        prop: NodeProperties.Selected,
                        value: true,
                        id: t.id
                    }
                }
            }
        })])(dispatch, getState)
    }
}

export function pinSelected() {
    return (dispatch, getState) => {
        let nodes = GetNodesByProperties({
            [NodeProperties.Selected]: true
        });
        graphOperation(nodes.map(t => {
            return {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    return {
                        prop: NodeProperties.Pinned,
                        value: true,
                        id: t.id
                    }
                }
            }
        }))(dispatch, getState)
    }
}
export function unPinSelected() {
    return (dispatch, getState) => {
        let nodes = GetNodesByProperties({
            [NodeProperties.Selected]: true
        });
        graphOperation(nodes.map(t => {
            return {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    return {
                        prop: NodeProperties.Pinned,
                        value: false,
                        id: t.id
                    }
                }
            }
        }))(dispatch, getState)
    }
}

export function deleteAllSelected() {
    return (dispatch, getState) => {
        graphOperation(GetNodesByProperties({
            [NodeProperties.Selected]: true
        }).map(t => ({
            operation: REMOVE_NODE,
            options: { id: t.id }
        })))(dispatch, getState);
    }
}
export function graphOperation(operation, options) {
    return (dispatch, getState) => {
        var state = getState();
        let rootGraph = null;
        var currentGraph = Application(state, CURRENT_GRAPH);
        let scope = Application(state, GRAPH_SCOPE) || [];
        if (!currentGraph) {
            currentGraph = GraphMethods.createGraph();
            SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
            rootGraph = currentGraph
        }
        else {
            currentGraph = Graphs(state, currentGraph);
            rootGraph = currentGraph;
            if (scope.length) {
                currentGraph = GraphMethods.getScopedGraph(currentGraph, { scope });
            }
        }
        var operations = operation;
        if (!Array.isArray(operation)) {
            operations = [{ operation: operation, options }]
        }
        operations.filter(x => x).map(_op => {
            if (typeof _op === 'function') {
                _op = _op(currentGraph);
            }
            if (!Array.isArray(_op)) {
                _op = [_op];
            }
            _op.map(op => {

                let { operation, options } = op;
                if (typeof options === 'function') {
                    options = options(currentGraph);
                }
                if (options) {
                    switch (operation) {
                        case SET_DEPTH:
                            currentGraph = GraphMethods.setDepth(currentGraph, options);
                            break;
                        case NEW_NODE:
                            currentGraph = GraphMethods.newNode(currentGraph);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case REMOVE_NODE:
                            currentGraph = GraphMethods.removeNode(currentGraph, options);
                            break;
                        case UPDATE_GRAPH_TITLE:
                            currentGraph = GraphMethods.updateGraphTitle(currentGraph, options);
                            break;
                        case NEW_LINK:
                            currentGraph = GraphMethods.newLink(currentGraph, options)
                            break;
                        case ADD_LINK_BETWEEN_NODES:
                            currentGraph = GraphMethods.addLinkBetweenNodes(currentGraph, options)
                            break;
                        case REMOVE_LINK_BETWEEN_NODES:
                            currentGraph = GraphMethods.removeLinkBetweenNodes(currentGraph, options)
                            break;
                        case REMOVE_LINK:
                            currentGraph = GraphMethods.removeLinkById(currentGraph, options);
                            break;
                        case UPDATE_GROUP_PROPERTY:
                            currentGraph = GraphMethods.updateGroupProperty(currentGraph, options);
                            break;
                        case CHANGE_NODE_TEXT:
                            currentGraph = GraphMethods.updateNodeProperty(currentGraph, { ...options, prop: 'text' });
                            break;
                        case CHANGE_NODE_PROPERTY:
                            currentGraph = GraphMethods.updateNodeProperty(currentGraph, options);
                            break;
                        case NEW_PROPERTY_NODE:
                            currentGraph = GraphMethods.addNewPropertyNode(currentGraph, options);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case ADD_DEFAULT_PROPERTIES:
                            currentGraph = GraphMethods.addDefaultProperties(currentGraph, options);
                            break;
                        case NEW_ATTRIBUTE_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Attribute);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_CONDITION_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Condition);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case ADD_NEW_NODE:
                            if (options && options.nodeType) {
                                currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, options.nodeType, options.callback);
                                setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            }
                            break;
                        case NEW_MODEL_ITEM_FILTER:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ModelItemFilter);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_AFTER_METHOD:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.AfterEffect);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_COMPONENT_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ComponentNode);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_DATA_SOURCE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.DataSource);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_VALIDATION_TYPE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ValidationList);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.PermissionDependency);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_CHOICE_TYPE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ChoiceList);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_PARAMETER_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Parameter);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_FUNCTION_OUTPUT_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.FunctionOutput);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_PERMISSION_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Permission);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_OPTION_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.OptionList);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_CUSTOM_OPTION:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.OptionCustom);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_SCREEN_OPTIONS:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ScreenOption);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case ADD_NEW_REFERENCE_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ReferenceNode);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_EXTENSION_LIST_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ExtensionTypeList);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_VALIDATION_ITEM_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ValidationListItem);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_EXTENTION_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ExtensionType);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case NEW_OPTION_ITEM_NODE:
                            currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.OptionListItem);
                            setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case APPLY_FUNCTION_CONSTRAINTS:
                            currentGraph = GraphMethods.applyFunctionConstraints(currentGraph, options);
                            // setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                            break;
                        case ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY:
                            break;
                    }
                }


                currentGraph = GraphMethods.applyConstraints(currentGraph);
                currentGraph = GraphMethods.constraintSideEffects(currentGraph);
            })
        })

        if (scope.length) {
            rootGraph = GraphMethods.setScopedGraph(rootGraph, { scope, graph: currentGraph });
        }
        else {
            rootGraph = currentGraph;
        }
        rootGraph = GraphMethods.updateReferenceNodes(rootGraph);
        SaveGraph(rootGraph, dispatch)
    }
}

export const Colors = {
    SelectedNode: '#f39c12',
    MarkedNode: '#af10fe'
};


((array) => {
    if (!array.toNodeSelect) {
        Object.defineProperty(array, 'toNodeSelect', {
            enumerable: false,
            writable: true,
            configurable: true,
            value: function () {
                var collection = this;
                return collection.map(node => {
                    return {
                        value: node.id,
                        id: node.id,
                        title: GetNodeTitle(node)
                    }
                })
            }
        })
    }
})(Array.prototype);