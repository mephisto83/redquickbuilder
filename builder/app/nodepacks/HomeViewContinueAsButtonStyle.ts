/* eslint-disable func-names */

import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
import { GetLinkBetween } from "../methods/graph_methods";

export default function HomeViewContinueAsButtonStyle(args: any = {}) {
  // node1,node4
  if (!args.component) {
    throw new Error('missing component');
  }
  //

  const context = {
    ...args,
    node1: args.component,
    node4: null
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

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node: any) { context.node0 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node0,
          "value": "Continue As Style"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node0,
          "value": "Style"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Style",
          "id": context.node0,
          "value": {
            "display": "none"
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Style",
          "id": context.node0,
          "value": {
            "display": "none"
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Style",
          "id": context.node0,
          "value": {
            "display": "none"
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Style",
          "id": context.node0,
          "value": {
            "display": "none"
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_LINK",
        "options": {
          "target": context.node0,
          "source": context.node1,
          "properties": {
            "type": "Style",
            "Style": {},
            "singleLink": false,
            "nodeTypes": [
              "Style"
            ],
            "ComponentTag": "Self"
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node: any) { context.node2 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node2,
          "value": "Should Continue Button Show"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node2,
          "value": "data-chain"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node2,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node2,
          "value": "HasPreviousCredentials"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node2,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
          "parent": context.node2,
          "nodeType": "data-chain",
          "groupProperties": {
            "GroupEntryNode": context.node2,
            "GroupExitNode": context.node2
          },
          "properties": {
            "Pinned": false,
            "ChainParent": context.node2
          },
          "linkProperties": {
            "properties": {
              "type": "data-chain-link",
              "data-chain-link": {}
            }
          },
          "links": [],
          "callback": function (node: any, graph: any, group: any) {
            context.node3 = node.id;
            context.group0 = group;
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node3,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node3,
          "value": "Lambda"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Lambda",
          "id": context.node3,
          "value": "(x: any) => !x"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node3,
          "value": "Not"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node3,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_LINK",
        "options": {
          "target": context.node2,
          "source": context.node0,
          "properties": {
            "type": "DataChainStyleLink",
            "DataChainStyleLink": {},
            "singleLink": true,
            "nodeTypes": [
              "data-chain"
            ]
          }
        }
      }]
    },

    function (graph: any) {
      const link = GetLinkBetween(context.node0, context.node2, graph);
      context.node4 = link.id;
      return [{

        "operation": "UPDATE_LINK_PROPERTY",
        "options": {
          "id": context.node4,
          "prop": "ComponentTag",
          "value": "Self"
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
  }];
  const applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node0,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node2,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node3,
        properties: viewPackages
      }
    }
  }]
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
