var fs = require('fs');
const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
var dialog = remote.dialog;

import * as GraphMethods from '../methods/graph_methods';
import * as NodeConstants from '../constants/nodetypes';
import * as Titles from '../components/titles';
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
export function GetCurrentGraph(state) {
    var currentGraph = Application(state, CURRENT_GRAPH);
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
export const CHANGE_NODE_PROPERTY = 'CHANGE_NODE_PROPERTY';
export const NEW_PROPERTY_NODE = 'NEW_PROPERTY_NODE';
export const NEW_PERMISSION_NODE = 'NEW_PERMISSION_NODE';
export const NEW_ATTRIBUTE_NODE = 'NEW_ATTRIBUTE_NODE';
export const ADD_LINK_BETWEEN_NODES = 'ADD_LINK_BETWEEN_NODES';
export const REMOVE_LINK_BETWEEN_NODES = 'REMOVE_LINK_BETWEEN_NODES';
export const REMOVE_LINK = 'REMOVE_LINK';
export const NEW_CHOICE_ITEM_NODE = 'NEW_CHOICE_ITEM_NODE';
export const NEW_PARAMETER_NODE = 'NEW_PARAMETER_NODE';
export const NEW_FUNCTION_OUTPUT_NODE = 'NEW_FUNCTION_OUTPUT_NODE';
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
                case NEW_ATTRIBUTE_NODE:
                    currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.Attribute);
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

export function openRedQuickBuilderGraph() {
    return (dispatch, getState) => {
        dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                filters: [
                    { name: 'Red Quick Builder', extensions: [RED_QUICK_FILE_EXT$] }
                ],
                properties: ['openFile']
            },
            (fileName) => {
                if (fileName === undefined) {
                    console.log("You didn't save the file");
                    return;
                }

                if (fileName.length && Array.isArray(fileName)) {
                    fileName = fileName[0];
                }

                if (!fileName.endsWith(RED_QUICK_FILE_EXT)) {
                    fileName = `${fileName}${RED_QUICK_FILE_EXT}`;
                }
                console.log(fileName);
                fs.readFile(fileName, { encoding: 'utf-8' }, (err, res) => {
                    if (err) {
                        console.error("An error ocurred updating the file" + err.message);
                        console.log(err);
                        return;
                    }
                    try {
                        var opened_graph = JSON.parse(res);
                        if (opened_graph) {
                            var default_graph = GraphMethods.createGraph();
                            opened_graph = { ...default_graph, ...opened_graph };
                            SaveApplication(opened_graph.id, CURRENT_GRAPH, dispatch);
                            SaveGraph(opened_graph, dispatch);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    console.warn("The file has been succesfully saved");
                });
            });

    }
}
export function newRedQuickBuilderGraph() {
    return (dispatch, getState) => {
        var default_graph = GraphMethods.createGraph();
        var opened_graph = { ...default_graph };
        SaveApplication(opened_graph.id, CURRENT_GRAPH, dispatch);
        SaveGraph(opened_graph, dispatch);
    }
}
ipcRenderer.on('save-graph-to-file-reply', (event, arg) => {
    console.log(arg) // prints "pong"
})
export const RED_QUICK_FILE_EXT = '.rqb';
export const RED_QUICK_FILE_EXT$ = 'rqb';
export function saveGraphToFile() {
    return (dispatch, getState) => {
        var currentGraph = GetRootGraph(getState());
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        if (currentGraph) {
            var content = JSON.stringify(currentGraph);
            dialog.showSaveDialog(
                remote.getCurrentWindow(),
                {
                    filters: [
                        { name: 'Red Quick Builder', extensions: [RED_QUICK_FILE_EXT$] }
                    ]
                },
                (fileName) => {
                    if (fileName === undefined) {
                        console.log("You didn't save the file");
                        return;
                    }

                    if (!fileName.endsWith(RED_QUICK_FILE_EXT)) {
                        fileName = `${fileName}${RED_QUICK_FILE_EXT}`;
                    }
                    console.log(fileName);
                    fs.writeFile(fileName, content, (err) => {
                        if (err) {
                            console.error("An error ocurred updating the file" + err.message);
                            console.log(err);
                            return;
                        }

                        console.warn("The file has been succesfully saved");
                    });
                });
        }
    }
}

export function setWorkingDirectory() {
    return (dispatch, getState) => {
        var currentGraph = GetRootGraph(getState());
        // You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
        if (currentGraph) {
            dialog.showOpenDialog(
                remote.getCurrentWindow(),
                {
                    properties: ['openDirectory']
                },
                (fileName) => {
                    if (fileName === undefined) {
                        console.log("You didn't save the file");
                        return;
                    }

                    console.log(fileName);
                    currentGraph = GraphMethods.updateWorkSpace(currentGraph, { workspace: fileName[0] });
                    SaveGraph(currentGraph, dispatch)
                });
        }
    }
}