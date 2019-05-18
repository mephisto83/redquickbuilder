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
        console.log(state);
        dispatch(UIC(VISUAL, key, !!!GetC(state, VISUAL, key)))
    }

}
export function toggleDashboardMinMax() {
    return toggleVisual(DASHBOARD_MENU);
}
export const NEW_NODE = 'NEW_NODE';
export const CURRENT_GRAPH = 'CURRENT_GRAPH';
export function graphOperation(operation) {
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
        }

        SaveGraph(currentGraph, dispatch)
    }
}

