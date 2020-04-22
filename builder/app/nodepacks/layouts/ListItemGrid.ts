/* eslint-disable func-names */

import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";

ListItemGrid.title = 'Applies a list item layout';
ListItemGrid.description = 'Assuming that this will be used in a grid layout';
ListItemGrid.callingArguments = ['mainContent', 'secondaryContent', 'detailContent', 'mainButton', 'secondaryButton'].map(v => ({ name: v, field: v, value: v, title: v }))
export default function ListItemGrid(args:any = {}) {
  // node0,node1,node2,node3,node4,node5,node6,node7,node8,node9,node10,node11,node12,node13,node14
  //
  if (!args.component) {
    throw new Error('No component set');
  }

  const context = {
    ...args,
    node0: args.component || uuidv4(),
    node1: uuidv4(),
    node2: uuidv4(),
    node3: uuidv4(),
    node4: uuidv4(),
    node5: uuidv4(),
    node6: uuidv4(),
    node7: args.mainContent || uuidv4(),
    node8: uuidv4(),
    node9: uuidv4(),
    node10: args.secondaryContent || uuidv4(),
    node11: uuidv4(),
    node12: args.detailContent || uuidv4(),
    node13: args.mainButton || uuidv4(),
    node14: args.secondaryButton || uuidv4()
  };
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  const result = [
    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    },

    function () {
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
                [context.node6]: {}
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
                    "ListItem"
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
                  [context.node2]: context.node7
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node9
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainContent"
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
                  [context.node3]: context.node10
                },
                "componentApi": {
                  "error": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "success": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property"
                  },
                  "value": {
                    "instanceType": "SelectorInstance",
                    "selector": context.node8,
                    "handlerType": "property",
                    "dataChain": context.node11
                  }
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryContent"
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
                  [context.node4]: context.node12
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "DetailContent"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node5]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node5]: context.node13
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "MainButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              },
              [context.node6]: {
                "style": {
                  "borderStyle": "solid",
                  "borderWidth": 1,
                  "flex": null,
                  "height": null
                },
                "children": {
                  [context.node6]: context.node14
                },
                "cellRoot": {},
                "name": {},
                "cellModel": {},
                "properties": {
                  "tags": [
                    "SecondaryButton"
                  ]
                },
                "cellModelProperty": {},
                "cellEvents": {},
                "componentApi": {}
              }
            }
          }
        }
      }]
    }]
    ;
  const clearPinned = [{
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
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node6,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node7,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node8,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node9,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node10,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node11,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node12,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node13,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node14,
        value: false
      }
    }
  }];
  const applyViewPackages : any= []
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
