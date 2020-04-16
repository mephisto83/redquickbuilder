/* eslint-disable func-names */
import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";

GridHeaderMainMenuMain.title = 'Grid Header MainMenu';
GridHeaderMainMenuMain.callingArguments = ['main', 'header', 'mainMenu'].map(v => ({ name: v, field: v, value: v, title: v }))
export default function GridHeaderMainMenuMain(args = {}) {
  // node0,node1,node2,node3,node4,node5

  //

  let context = {
    ...args,
    node0: args.component,
    node1: uuidv4(),
    node2: uuidv4(),
    node3: uuidv4(),
    node4: uuidv4(),
    node5: uuidv4()
  };
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Layout",
          "id": context.node0,
          "value": {
            "layout": {
              [context.node1]: {
                [context.node2]: {
                  [context.node3]: {},
                  [context.node4]: {},
                  [context.node5]: {}
                }
              }
            },
            "properties": {
              [context.node1]: {
                "style": {
                  "display": "flex",
                  "flex": null,
                  "height": null,
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flexDirection": ""
                },
                "children": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "main-screen"
                  ]
                },
                "cellModelProperty": {},
                "cellRoot": {},
                "cellEvents": {},
                "name": {}
              },
              [context.node2]: {
                "style": {
                  "display": "flex",
                  "flex": null,
                  "height": null,
                  "borderStyle": "solid",
                  "borderWidth": 1
                },
                "children": {
                  [context.node2]: ""
                },
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "main-screen-container"
                  ]
                },
                "cellModelProperty": {},
                "cellRoot": {},
                "cellEvents": {}
              },
              [context.node3]: {
                "style": {
                  "display": "flex",
                  "flex": 1,
                  "height": null,
                  "borderStyle": "solid",
                  "borderWidth": 1
                },
                "children": context.header ? {
                  [context.node3]: context.header
                } : {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainHeader"
                  ]
                },
                "cellModelProperty": {},
                "cellRoot": {},
                "cellEvents": {}
              },
              [context.node4]: {
                "style": {
                  "display": "flex",
                  "flex": 1,
                  "height": null,
                  "borderStyle": "solid",
                  "borderWidth": 1
                },
                "children": context.mainMenu ? {
                  [context.node4]: context.mainMenu
                } : {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainMenu"
                  ]
                },
                "cellModelProperty": {},
                "cellRoot": {},
                "cellEvents": {}
              },
              [context.node5]: {
                "style": {
                  "display": "flex",
                  "flex": 1,
                  "height": null,
                  "borderStyle": "solid",
                  "borderWidth": 1
                },
                "children": context.main ? {
                  [context.node5]: context.main
                } : {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainSection"
                  ]
                },
                "cellModelProperty": {},
                "cellRoot": {},
                "cellEvents": {}
              }
            }
          }
        }
      }]
    }]
    ;
  let clearPinned = [{
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node1,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node2,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node3,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node4,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node5,
        value: false
      }
    }
  }];
  let applyViewPackages = []
  return [
    ...result,
    ...clearPinned,
    ...applyViewPackages,
    function () {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }];
}
