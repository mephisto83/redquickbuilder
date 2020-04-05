
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // node0,node1,node2,node3,node4,node5,node6,node7,node8,node9,node10,node11,node12,node13,node14,node15,node16,node17,node18,node19

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
node7: uuidv4() ,
node8: uuidv4() ,
node9: uuidv4() ,
node10: uuidv4() ,
node11: uuidv4() ,
node12: uuidv4() ,
node13: uuidv4() ,
node14: uuidv4() ,
node15: uuidv4() ,
node16: uuidv4() ,
node17: uuidv4() ,
node18: uuidv4() ,
node19: uuidv4() 
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
                        [context.node2]: {},
                        [context.node3]: {},
                        [context.node4]: {},
                        [context.node5]: {},
                        [context.node6]: {
                            [context.node7]: {},
                            [context.node8]: {}
                        }
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "flexDirection": "column"
                        },
                        "children": {},
                        "cellRoot": {},
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "Register"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellEvents": {}
                    },
                    [context.node2]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "flex": null,
                            "height": null
                        },
                        "children": {
                            [context.node2]: context.node9
                        },
                        "componentApi": {
                            "error": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "success": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "value": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property",
                                "dataChain": context.node11
                            }
                        },
                        "cellRoot": {},
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "UserName"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellEvents": {}
                    },
                    [context.node3]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "flex": null,
                            "height": null
                        },
                        "children": {
                            [context.node3]: context.node12
                        },
                        "componentApi": {
                            "error": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "success": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "value": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property",
                                "dataChain": context.node13
                            }
                        },
                        "cellRoot": {},
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "Email"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellEvents": {}
                    },
                    [context.node4]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "flex": null,
                            "height": null
                        },
                        "children": {
                            [context.node4]: context.node14
                        },
                        "componentApi": {
                            "error": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "success": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "value": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property",
                                "dataChain": context.node15
                            }
                        },
                        "cellRoot": {},
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "Password"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellEvents": {}
                    },
                    [context.node5]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "flex": null,
                            "height": null
                        },
                        "children": {
                            [context.node5]: context.node16
                        },
                        "componentApi": {
                            "error": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "success": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property"
                            },
                            "value": {
                                "instanceType": "Selector",
                                "selector": context.node10,
                                "handlerType": "property",
                                "dataChain": context.node17
                            }
                        },
                        "cellRoot": {},
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "ConfirmPassword"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellEvents": {}
                    },
                    [context.node6]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "flex": null,
                            "height": null
                        },
                        "children": {
                            [context.node6]: ""
                        },
                        "cellRoot": {},
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "ButtonContainer"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellEvents": {},
                        "componentApi": {}
                    },
                    [context.node7]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1
                        },
                        "children": {
                            [context.node7]: context.node18
                        },
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "MainButton"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "componentApi": {}
                    },
                    [context.node8]: {
                        "style": {
                            "borderStyle": "solid",
                            "borderWidth": 1
                        },
                        "children": {
                            [context.node8]: context.node19
                        },
                        "name": {},
                        "cellModel": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton"
                            ]
                        },
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "componentApi": {}
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
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node8,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node9,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node10,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node11,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node12,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node13,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node14,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node15,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node16,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node17,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node18,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node19,
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