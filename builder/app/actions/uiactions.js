import * as GraphMethods from '../methods/graph_methods';
export const VISUAL = 'VISUAL';
export const APPLICATION = 'APPLICATION';
export const GRAPHS = 'GRAPHS';
export const DASHBOARD_MENU = 'DASHBOARD_MENU';


export const NodeTypes = {
    Concept: 'concept',
    Model: 'model',
    Property: 'model-property',
    Screen: 'screen'
}

export const NodeTypeColors = {
    [NodeTypes.Concept]: '#DD4B39',
    [NodeTypes.Model]: '#713E5A',
    [NodeTypes.Property]: '#484349',
    [NodeTypes.Screen]: '#3A405A',
    ['unknown']: '#414770',
}

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
export function VisualEq(state, key, value) {
    return Visual(state, key) === value;
}
export function Node(state, nodeId) {

    var currentGraph = Application(state, CURRENT_GRAPH);
    if (currentGraph) {
        currentGraph = Graphs(state, currentGraph);
        return currentGraph.nodeLib[nodeId];
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
export const NEW_NODE = 'NEW_NODE';
export const NEW_LINK = 'NEW_LINK';
export const CHANGE_NODE_TEXT = 'CHANGE_NODE_TEXT';
export const CURRENT_GRAPH = 'CURRENT_GRAPH';
export const CHANGE_NODE_PROPERTY = 'CHANGE_NODE_PROPERTY';
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
                break;
            case NEW_LINK:
                currentGraph = GraphMethods.newLink(currentGraph, options)
                break;
            case CHANGE_NODE_TEXT:
                currentGraph = GraphMethods.updateNodeProperty(currentGraph, { ...options, prop: 'text' });
                break;
            case CHANGE_NODE_PROPERTY:
                currentGraph = GraphMethods.updateNodeProperty(currentGraph, options);
                break;
        }

        SaveGraph(currentGraph, dispatch)
    }
}

export const Colors = {
    SelectedNode: '#f39c12'
};