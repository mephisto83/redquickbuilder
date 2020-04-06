
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // node0,node1,node2,node3,node4,node5,node6,node7

      // 
      
    let context = {
      ...args,
node0: uuidv4() ,
node1: uuidv4() ,
node2: uuidv4() ,
node3: uuidv4() ,
node4: uuidv4() ,
node5: uuidv4() ,
node6: uuidv4() ,
node7: uuidv4() 
    };
    let {
      viewPackages
    } = args;
    viewPackages = {
      [NodeProperties.ViewPackage]: uuidv4(),
      ...(viewPackages||{})
    };
    let result = [
      function(graph) {
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
                                "main-screen-alternate"
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
                                "main-screen-alternate-container"
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
                        "children": {
                            [context.node3]: context.node6
                        },
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "Header"
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
                        "children": {},
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
                        "children": {
                            [context.node5]: context.node7
                        },
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "Main"
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
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node1,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node2,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node3,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node4,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node5,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node6,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node7,
          value: false
        }
      }
    }];
    let applyViewPackages = []
    return [
      ...result,
      ...clearPinned,
      ...applyViewPackages,
      function() {
        if (context.callback) {
          context.entry = context.node0;
          context.callback(context);
        }
        return [];
      }];
  }