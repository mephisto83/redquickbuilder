
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // node0,node1,node2,node3,node4,node5

      // 
      
    let context = {
      ...args,
node0: uuidv4() ,
node1: uuidv4() ,
node2: uuidv4() ,
node3: uuidv4() ,
node4: uuidv4() ,
node5: uuidv4() 
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
                        [context.node3]: {}
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": "100%",
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "width": null
                        },
                        "children": {},
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "componentType": "",
                            "tags": [
                                "ButtonContainer"
                            ]
                        }
                    },
                    [context.node2]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node2]: context.node4
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "MainButton",
                                "LoginButton"
                            ]
                        }
                    },
                    [context.node3]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node3]: context.node5
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton",
                                "LoginButton"
                            ]
                        }
                    }
                }
            }
        }
    }]
    },

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
                        [context.node3]: {}
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": "100%",
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "width": null
                        },
                        "children": {},
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "componentType": "",
                            "tags": [
                                "ButtonContainer"
                            ]
                        }
                    },
                    [context.node2]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node2]: context.node4
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "MainButton",
                                "LoginButton"
                            ]
                        }
                    },
                    [context.node3]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node3]: context.node5
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton",
                                "LoginButton"
                            ]
                        }
                    }
                }
            }
        }
    }]
    },

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
                        [context.node3]: {}
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": "100%",
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "width": null
                        },
                        "children": {},
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "componentType": "",
                            "tags": [
                                "ButtonContainer"
                            ]
                        }
                    },
                    [context.node2]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node2]: context.node4
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "MainButton",
                                "LoginButton"
                            ]
                        }
                    },
                    [context.node3]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node3]: context.node5
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton",
                                "LoginButton"
                            ]
                        }
                    }
                }
            }
        }
    }]
    },

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
                        [context.node3]: {}
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": "100%",
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "width": null
                        },
                        "children": {},
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "componentType": "",
                            "tags": [
                                "ButtonContainer"
                            ]
                        }
                    },
                    [context.node2]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node2]: context.node4
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "MainButton",
                                "LoginButton"
                            ]
                        }
                    },
                    [context.node3]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node3]: context.node5
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton",
                                "LoginButton"
                            ]
                        }
                    }
                }
            }
        }
    }]
    },

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
                        [context.node3]: {}
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": "100%",
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "width": null
                        },
                        "children": {},
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "componentType": "",
                            "tags": [
                                "ButtonContainer"
                            ]
                        }
                    },
                    [context.node2]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node2]: context.node4
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "MainButton",
                                "LoginButton"
                            ]
                        }
                    },
                    [context.node3]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node3]: context.node5
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton",
                                "LoginButton"
                            ]
                        }
                    }
                }
            }
        }
    }]
    },

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
                        [context.node3]: {}
                    }
                },
                "properties": {
                    [context.node1]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": "100%",
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "width": null
                        },
                        "children": {},
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "componentType": "",
                            "tags": [
                                "ButtonContainer"
                            ]
                        }
                    },
                    [context.node2]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node2]: context.node4
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "MainButton",
                                "LoginButton"
                            ]
                        }
                    },
                    [context.node3]: {
                        "style": {
                            "display": "flex",
                            "flex": 1,
                            "height": null,
                            "borderStyle": "solid",
                            "borderWidth": 1,
                            "justifyContent": "center",
                            "alignItems": "flex-start"
                        },
                        "children": {
                            [context.node3]: context.node5
                        },
                        "cellModel": {},
                        "cellModelProperty": {},
                        "cellRoot": {},
                        "cellEvents": {},
                        "name": {},
                        "properties": {
                            "tags": [
                                "SecondaryButton",
                                "LoginButton"
                            ]
                        }
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