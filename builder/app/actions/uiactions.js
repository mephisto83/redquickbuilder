var fs = require('fs');

import * as GraphMethods from '../methods/graph_methods';
import * as NodeConstants from '../constants/nodetypes';
import * as Titles from '../components/titles';
import { MethodFunctions, bindTemplate, FunctionTemplateKeys } from '../constants/functiontypes';
export const VISUAL = 'VISUAL';
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

export const UI_UPDATE = 'UI_UPDATE';
export function GetC(state, section, item) {
    if (state && state.uiReducer && state.uiReducer[section]) {
        return state.uiReducer[section][item];
    }
    return null;
}
export function Visual(state, key) {
    return GetC(state, VISUAL, key);
}
export function IsCurrentNodeA(state, type) {
    var currentNode = Node(state, Visual(state, SELECTED_NODE));
    return currentNode && currentNode.properties && currentNode.properties.nodeType === type;
}
export function Use(node, prop) {
    return node && node.properties && node.properties[prop];
}
export function GetNodeProp(node, prop) {
    return node && node.properties && node.properties[prop];
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

export function GetModelPropertyChildren(id) {

    let property_nodes = GetModelPropertyNodes(id);
    let logicalChildren = GetLogicalChildren(id);
    return [...property_nodes, ...logicalChildren];
}

export function GetNodeById(node) {
    return GraphMethods.GetNode(GetCurrentGraph(GetState()), node);
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
export function GetModelItemFilter(id) {
    let state = _getState();
    return GraphMethods.GetModelItemFilter(state, id);
}
export function GetPermissionsConditions(id) {
    return _getPermissionsConditions(_getState(), id);
}
export function GetConditionSetup(condition) {
    return GetNodeProp(condition, NodeProperties.Condition);
}

export function GetPermissionsSortedByAgent() {
    let state = _getState();
    let permissions = NodesByType(state, NodeTypes.Permission);

    return permissions.filter((permission) => {
        let methodNode = GraphMethods.GetMethodNode(state, permission.id);
        return methodNode;
    }).groupBy(permission => {
        let methodNode = GraphMethods.GetMethodNode(state, permission.id);
        return GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent);
    })
}

export function GetArbitersForPermissions() {
    let state = _getState();
    let permissions = NodesByType(state, NodeTypes.Permission);
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



export function GetCombinedCondition(id, language = NodeConstants.ProgrammingLanguages.CSHARP) {
    let node = GetGraphNode(id);
    let conditions = [];
    let final_result = 'res';
    let tabcount = 0;
    switch (GetNodeProp(node, NodeProperties.NODEType)) {
        case NodeTypes.Permission:
            conditions = GetPermissionsConditions(id);;
            final_result = 'result';
            tabcount = 3;
            break;
        case NodeTypes.ModelItemFilter:
            conditions = GetModelItemFilter(id);
            break;
    }
    let tabs = [].interpolate(0, tabcount, () => `    `).join('');
    let clauses = [];
    conditions.map(condition => {
        let selectedConditionSetup = GetSelectedConditionSetup(id, condition);
        let res = GetConditionsClauses(id, selectedConditionSetup, language);
        clauses = [...clauses, ...res.map(t => t.clause)];
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

export function GetConditionClause(adjacentId, clauseKey, propertyName, validator, language) {
    let { type, template, node, nodeProperty } = validator;
    let conditionTemplate = '';
    let properties = {};
    if (template) {
        conditionTemplate = fs.readFileSync(template, 'utf8');
    }
    switch (type) {
        case NodeConstants.FilterRules.IsInModelPropertyCollection:
        case NodeConstants.FilterRules.EqualsModelProperty:
            properties = {
                agent: clauseKey,
                agent_property: propertyName,
                model: node,
                model_property: GetCodeName(nodeProperty)
            }
            break;
        default:
            throw 'Unhandled condition clause case';
    }

    return bindTemplate(conditionTemplate, properties);
}

export function GetSelectedConditionSetup(permissionId, condition) {
    var method = GraphMethods.GetMethodNode(_getState(), permissionId);
    if (method) {
        let conditionSetup = GetConditionSetup(condition);
        if (conditionSetup && conditionSetup.methods) {
            return conditionSetup.methods[GetNodeProp(method, NodeProperties.FunctionType)];
        }
        else {
            console.log(condition);
            console.warn('condition is improperly formed');
        }
    }
    else {
        console.warn('no method node found');
    }
    return null;
}
export function _getPermissionsConditions(state, id) {
    let graph = GetRootGraph(state);
    return GraphMethods.GetNodesLinkedTo(graph, {
        id
    }).filter(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Condition);
}

export function GetModelPropertyNodes(refId) {
    var state = _getState();
    return GraphMethods.GetLinkChain(state, {
        id: refId,
        links: [{
            type: NodeConstants.LinkType.PropertyLink,
            direction: GraphMethods.SOURCE
        }]
    });
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
export function NodesByType(state, nodeType, options = {}) {

    var currentGraph = options.useRoot ? GetRootGraph(state) : GetCurrentGraph(state);
    if (currentGraph) {
        if (!Array.isArray(nodeType)) {
            nodeType = [nodeType];
        }
        return currentGraph.nodes
            .filter(x => currentGraph.nodeLib[x].properties &&
                (nodeType.indexOf(currentGraph.nodeLib[x].properties[NodeProperties.NODEType]) !== -1) ||
                (!options.excludeRefs && currentGraph.nodeLib[x].properties[NodeProperties.ReferenceType] === nodeType))
            .map(x => currentGraph.nodeLib[x]);
    }
    throw 'no graph found'
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
export function GetState() {
    return _getState();
}
export function setTestGetState(func) {
    _getState = func;
}
export function setState() {
    return (dispatch, getState) => {
        _getState = getState;
    }
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
    return (GetNodeProp(methodNode, NodeProperties.MethodProps) || {})[key];
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
export function GetMethodFilterParameters(id) {
    return GetMethod_Parameters(id, 'filter');
}
function GetMethod_Parameters(id, key) {
    let state = _getState();
    var method = GraphMethods.GetMethodNode(state, id);
    let methodProps = GetMethodProps(method);
    let methodType = GetNodeProp(method, NodeProperties.FunctionType);
    if (methodType) {
        let setup = MethodFunctions[methodType];
        if (setup && setup[key] && setup[key].params && methodProps) {
            return setup[key].params.map(_x => {
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
export function GetMethodPermissionParameters(id) {
    return GetMethod_Parameters(id, 'permission');
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
export const NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE = 'NEW_PERMISSION_PROPERTY_DEPENDENCY_NODE';
export const NEW_EXTENSION_LIST_NODE = 'NEW_EXTENSION_LIST_NODE';
export const NEW_EXTENTION_NODE = 'NEW_EXTENTION_NODE';
export const ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY = 'ADD_EXTENSION_DEFINITION_CONFIG_PROPERTY';
export const APPLY_FUNCTION_CONSTRAINTS = 'APPLY_FUNCTION_CONSTRAINTS';
export const ADD_NEW_REFERENCE_NODE = 'ADD_NEW_REFERENCE_NODE;'
export const SET_DEPTH = 'SET_DEPTH';

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
        operations.filter(x => x).map(op => {
            let { operation, options } = op;
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
                case NEW_MODEL_ITEM_FILTER:
                    currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ModelItemFilter);
                    setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                    break;
                case NEW_AFTER_METHOD:
                    currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.AfterEffect);
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
            currentGraph = GraphMethods.applyConstraints(currentGraph);
            currentGraph = GraphMethods.constraintSideEffects(currentGraph);
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
    SelectedNode: '#f39c12'
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