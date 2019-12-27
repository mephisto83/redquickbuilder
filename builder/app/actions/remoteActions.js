import {
  createGraph,
  updateWorkSpace,
  updateGraphTitle,
  updateGraphProperty
} from "../methods/graph_methods";
import {
  SaveApplication,
  SaveGraph,
  CURRENT_GRAPH,
  GetRootGraph,
  Visual,
  toggleVisual,
  CONTEXT_MENU_VISIBLE,
  setVisual,
  CONTEXT_MENU_MODE,
  GetDispatchFunc,
  GetStateFunc
} from "./uiactions";
import { processRecording } from "../utils/utilservice";

var fs = require("fs");
const { ipcRenderer } = require("electron");
const remote = require("electron").remote;
var dialog = remote.dialog;

export function openGraph() {
  openRedQuickBuilderGraph()(_dispatch, _getState);
}

export function toggleContextMenu(mode) {
  if (mode) {
    setVisual(CONTEXT_MENU_MODE, mode)(_dispatch, _getState);
    setVisual(CONTEXT_MENU_VISIBLE, true)(_dispatch, _getState);
  } else {
    toggleVisual(CONTEXT_MENU_VISIBLE)(_dispatch, _getState);
  }
}
export function toggleVisualKey(key) {
  toggleVisual(key)(_dispatch, _getState);
}
const SELECTED_TAB = "SELECTED_TAB";
const DEFAULT_TAB = "DEFAULT_TAB";
const PARAMETER_TAB = "PARAMETER_TAB";
const SCOPE_TAB = "SCOPE_TAB";
const QUICK_MENU = "QUICK_MENU";
export function setRightMenuTab(num) {
  switch (num) {
    case "1":
      setVisual(SELECTED_TAB, DEFAULT_TAB)(_dispatch, _getState);
      break;
    case "2":
      setVisual(SELECTED_TAB, PARAMETER_TAB)(_dispatch, _getState);
      break;
    case "3":
      setVisual(SELECTED_TAB, SCOPE_TAB)(_dispatch, _getState);
      break;
    case "4":
      setVisual(SELECTED_TAB, QUICK_MENU)(_dispatch, _getState);
      break;
  }
}
export function openRedQuickBuilderGraph() {
  return (dispatch, getState) => {
    dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        filters: [
          { name: "Red Quick Builder", extensions: [RED_QUICK_FILE_EXT$] }
        ],
        properties: ["openFile"]
      },
      fileName => {
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
        fs.readFile(fileName, { encoding: "utf8" }, (err, res) => {
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
      }
    );
  };
}
export function newRedQuickBuilderGraph() {
  return (dispatch, getState) => {
    var default_graph = createGraph();
    var opened_graph = { ...default_graph };
    SaveApplication(opened_graph.id, CURRENT_GRAPH, dispatch);
    SaveGraph(opened_graph, dispatch);
  };
}
export function newGraph() {
  newRedQuickBuilderGraph()(GetDispatchFunc(), GetStateFunc());
}
ipcRenderer.on("save-graph-to-file-reply", (event, arg) => {
  console.log(arg); // prints "pong"
});
export const RED_QUICK_FILE_EXT = ".rqb";
export const RED_QUICK_FILE_EXT$ = "rqb";
export const RED_QUICK_FILE_RECORDING_EXT = ".js";
export const RED_QUICK_FILE_RECORDING_EXT$ = "js";
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
            { name: "Red Quick Builder", extensions: [RED_QUICK_FILE_EXT$] }
          ]
        },
        fileName => {
          if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
          }

          if (!fileName.endsWith(RED_QUICK_FILE_EXT)) {
            fileName = `${fileName}${RED_QUICK_FILE_EXT}`;
          }
          console.log(fileName);
          updateGraphProperty(currentGraph, {
            prop: "graphFile",
            value: fileName
          });
          fs.writeFile(fileName, content, err => {
            if (err) {
              console.error("An error ocurred updating the file" + err.message);
              console.log(err);
              return;
            }

            console.warn("The file has been succesfully saved");
          });
        }
      );
    }
  };
}
export function saveRecording(recording) {
  return (dispatch, getState) => {
    dialog.showSaveDialog(
      remote.getCurrentWindow(),
      {
        filters: [
          {
            name: "Red Quick Builder Recording",
            extensions: [RED_QUICK_FILE_RECORDING_EXT$]
          }
        ]
      },
      fileName => {
        if (fileName === undefined) {
          console.log("You didn't save the file");
          return;
        }

        if (!fileName.endsWith(RED_QUICK_FILE_RECORDING_EXT)) {
          fileName = `${fileName}${RED_QUICK_FILE_RECORDING_EXT}`;
        }
        console.log(fileName);
        let content = JSON.stringify(recording, null, 4);
        content = processRecording(content);
        fs.writeFile(fileName, content, err => {
          if (err) {
            console.error("An error ocurred updating the file" + err.message);
            console.log(err);
            return;
          }

          console.warn("The file has been succesfully saved");
        });
      }
    );
  };
}
export function saveGraph(graph) {
  return (dispatch, getState) => {
    var currentGraph = GetRootGraph(getState());
    if (currentGraph && currentGraph.graphFile) {
      if (fs.existsSync(currentGraph.graphFile)) {
        fs.writeFileSync(currentGraph.graphFile, JSON.stringify(currentGraph));
      }
    }
  };
}
let _dispatch = null;
let _getState = null;
export function setRemoteState() {
  return (dispatch, getState) => {
    _dispatch = dispatch;
    _getState = getState;
  };
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
          properties: ["openDirectory"]
        },
        fileName => {
          if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
          }

          console.log(fileName);
          currentGraph = updateWorkSpace(currentGraph, {
            workspace: fileName[0]
          });
          SaveGraph(currentGraph, dispatch);
        }
      );
    }
  };
}
