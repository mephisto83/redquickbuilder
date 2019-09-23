import { createGraph, updateWorkSpace, updateGraphTitle, updateGraphProperty } from '../methods/graph_methods';
import { SaveApplication, SaveGraph, CURRENT_GRAPH, GetRootGraph } from './uiactions';

var fs = require('fs');
const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
var dialog = remote.dialog;

export function openGraph() {
    openRedQuickBuilderGraph()(_dispatch, _getState);
}

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
                fs.readFile(fileName, { encoding: 'utf8' }, (err, res) => {
                    if (err) {
                        console.error("An error ocurred updating the file" + err.message);
                        console.log(err);
                        return;
                    }
                    try {
                        var opened_graph = JSON.parse(res);
                        if (opened_graph) {
                            var default_graph = createGraph();
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
        var default_graph = createGraph();
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
                    updateGraphProperty(currentGraph, { prop: 'graphFile', value: fileName });
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

export function saveGraph(graph) {
    return (dispatch, getState) => {
        var currentGraph = GetRootGraph(getState());
        if (currentGraph && currentGraph.graphFile) {
            if (fs.existsSync(currentGraph.graphFile)) {
                fs.writeFileSync(currentGraph.graphFile, JSON.stringify(currentGraph));
            }
        }
    }
}
let _dispatch = null;
let _getState = null;
export function setRemoteState() {
    return (dispatch, getState) => {
        _dispatch = dispatch;
        _getState = getState;
    }
}
export function saveCurrentGraph() {
    let state = _getState();
    saveGraph(GetRootGraph(state))(_dispatch, _getState);
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
                    currentGraph = updateWorkSpace(currentGraph, { workspace: fileName[0] });
                    SaveGraph(currentGraph, dispatch)
                });
        }
    }
}