import * as GraphMethods from '../methods/graph_methods';
import * as NodeConstants from '../constants/nodetypes';
import * as Titles from '../components/titles';
export const VISUAL = 'VISUAL';
export const APPLICATION = 'APPLICATION';
export const GRAPHS = 'GRAPHS';
export const DASHBOARD_MENU = 'DASHBOARD_MENU';
export const SELECTED_NODE_BB = 'SELECTED_NODE_BB';
export const NodeTypes = NodeConstants.NodeTypes;
export const NodeTypeColors = NodeConstants.NodeTypeColors;
export const NodeProperties = NodeConstants.NodeProperties;
export const LinkProperties = NodeConstants.LinkProperties;
export const NodeAttributePropertyTypes = NodeConstants.NodeAttributePropertyTypes;
export const ValidationRules = NodeConstants.ValidationRules;

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
export function VisualEq(state, key, value) {
    return Visual(state, key) === value;
}
export function Node(state, nodeId) {

    var currentGraph = Application(state, CURRENT_GRAPH);
    if (currentGraph) {
        currentGraph = Graphs(state, currentGraph);
        if (currentGraph && currentGraph.nodeLib) {
            return currentGraph.nodeLib[nodeId];
        }
    }
    return null;
}
export function Application(state, key) {
    return GetC(state, APPLICATION, key);
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
export function NodesByType(state, nodeType) {
    var currentGraph = GetCurrentGraph(state);
    if (currentGraph) {
        return currentGraph.nodes
            .filter(x => currentGraph.nodeLib[x].properties &&
                currentGraph.nodeLib[x].properties[NodeProperties.NODEType] === nodeType)
            .map(x => currentGraph.nodeLib[x]);
    }
    return [];
}
export function GetCurrentGraph(state) {
    var currentGraph = Application(state, CURRENT_GRAPH);
    if (currentGraph) {
        currentGraph = Graphs(state, currentGraph);
    }
    return currentGraph;
}
export const NEW_NODE = 'NEW_NODE';
export const REMOVE_NODE = 'REMOVE_NODE';
export const NEW_LINK = 'NEW_LINK';
export const CHANGE_NODE_TEXT = 'CHANGE_NODE_TEXT';
export const CURRENT_GRAPH = 'CURRENT_GRAPH';
export const CHANGE_NODE_PROPERTY = 'CHANGE_NODE_PROPERTY';
export const NEW_PROPERTY_NODE = 'NEW_PROPERTY_NODE';
export const NEW_ATTRIBUTE_NODE = 'NEW_ATTRIBUTE_NODE';
export const ADD_LINK_BETWEEN_NODES = 'ADD_LINK_BETWEEN_NODES';
export const REMOVE_LINK_BETWEEN_NODES = 'REMOVE_LINK_BETWEEN_NODES';
export const NEW_CHOICE_ITEM_NODE = 'NEW_CHOICE_ITEM_NODE';
export const NEW_VALIDATION_ITEM_NODE = 'NEW_VALIDATION_ITEM_NODE';
export const NEW_CHOICE_TYPE = 'NEW_CHOICE_TYPE';
export const NEW_VALIDATION_TYPE = 'NEW_VALIDATION_TYPE';
export function graphOperation(operation, options) {
    return (dispatch, getState) => {
        var state = getState();
        var currentGraph = Application(state, CURRENT_GRAPH);
        if (!currentGraph) {
            currentGraph = GraphMethods.createGraph();
            SaveApplication(currentGraph.id, CURRENT_GRAPH, dispatch);
        }
        else {
            currentGraph = Graphs(state, currentGraph);
        }

        switch (operation) {
            case NEW_NODE:
                currentGraph = GraphMethods.newNode(currentGraph);
                setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                break;
            case REMOVE_NODE:
                currentGraph = GraphMethods.removeNode(currentGraph, options);
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
            case NEW_CHOICE_TYPE:
                currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ChoiceList);
                setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                break;
            case NEW_CHOICE_ITEM_NODE:
                currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ChoiceListItem);
                setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                break;
            case NEW_VALIDATION_ITEM_NODE:
                currentGraph = GraphMethods.addNewNodeOfType(currentGraph, options, NodeTypes.ValidationListItem);
                setVisual(SELECTED_NODE, currentGraph.nodes[currentGraph.nodes.length - 1])(dispatch, getState);
                break;
        }

        SaveGraph(currentGraph, dispatch)
    }
}

export const Colors = {
    SelectedNode: '#f39c12'
};