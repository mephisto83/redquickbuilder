import * as GraphMethods from '../methods/graph_methods';
export const VISUAL = 'VISUAL';
export const APPLICATION = 'APPLICATION';
export const GRAPHS = 'GRAPHS';
export const DASHBOARD_MENU = 'DASHBOARD_MENU';

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
export const CURRENT_GRAPH = 'CURRENT_GRAPH';
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
        }

        SaveGraph(currentGraph, dispatch)
    }
}

export const Colors = {
    SelectedNode: '#f1f121'
};