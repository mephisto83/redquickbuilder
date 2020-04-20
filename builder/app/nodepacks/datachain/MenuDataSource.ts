/* eslint-disable func-names */

import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";

export default function MenuDataSource(args = {}) {
  // node0,node1

  // menu_name, menu_name, index, menu_name, navigate_function
  if (!args.menu_name) {
    throw new Error('missing menu_name argument');
  } if (!args.navigate_function) {
    throw new Error('missing navigate_function argument');
  } if (!args.menuGeneration) {
    throw new Error('missing menuGeneration argument');
  } if (!args.component) {
    throw new Error('missing component arguments');
  }

  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  const context = {
    ...args,
    uiType: args.uiType || "ElectronIO",
    node0: args.component,
    node1: viewPackages[NodeProperties.ViewPackage]
  };
  const result = [

    function () {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node) { context.node9 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node9,
          "value": `${args.menu_name} Menu Data Source`
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node9,
          "value": "data-chain"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": NodeProperties.UIType,
          "id": context.node9,
          "value": args.uiType
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node9,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node9,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node9,
          "value": "Pass"
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
          "parent": context.node9,
          "nodeType": "data-chain",
          "groupProperties": {
            "GroupEntryNode": context.node9,
            "GroupExitNode": context.node9
          },
          "properties": {
            "Pinned": false,
            "ChainParent": context.node9
          },
          "linkProperties": {
            "properties": {
              "type": "data-chain-link",
              "data-chain-link": {}
            }
          },
          "links": [],
          "callback": function (node, graph, group) {
            context.node10 = node.id;
            context.group2 = group;
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node10,
          "value": true
        }
      }]
    },


    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainTypeName",
          "id": context.node9,
          "value": context.buildMethod
        }
      }]
    },
    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node10,
          "value": context.buildMethod || "Lambda"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Lambda",
          "id": context.node10,
          "value": `${context.menuGeneration}`
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node10,
          "value": "return menu"
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
          "parent": context.node10,
          "nodeType": "data-chain",
          "groupProperties": {
            "id": context.group2
          },
          "properties": {
            "ChainParent": context.node10
          },
          "linkProperties": {
            "properties": {
              "type": "data-chain-link",
              "data-chain-link": {}
            }
          },
          "callback": function (node) {
            context.node11 = node.id;

          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node11,
          "value": "convert to graph"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node11,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node11,
          "value": "Lambda"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Lambda",
          "id": context.node11,
          "value": "(array: any) => {\n    let graph = RedGraph.create();\n\n    array.map((item: any) => {\n        RedGraph.addNode(graph, item, null);\n    }).forEach((item: any) => {\n        if (item && item.parent) {\n            RedGraph.addLink(graph, item.parent, item.id)\n        }\n    });\n    return graph;\n}"
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_LINK",
        "options": {
          "target": context.node9,
          "source": context.node8,
          "properties": {
            "type": "data-chain-link",
            "data-chain-link": {},
            "singleLink": true,
            "nodeTypes": [
              "data-chain"
            ]
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node6,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node) { context.node12 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node12,
          "value": `${args.menu_name} Navigate To Pages`
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node12,
          "value": "data-chain"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node12,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node12,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node12,
          "value": "Lambda"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node12,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Lambda",
          "id": context.node12,
          "value": `${args.navigate_function}`
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_LINK",
        "options": {
          "target": context.node12,
          "source": context.node6,
          "properties": {
            "type": "data-chain-link",
            "data-chain-link": {},
            "singleLink": true,
            "nodeTypes": [
              "data-chain"
            ]
          }
        }
      }]
    }]
    ;
  const clearPinned = [
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
    }];
  const applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node9,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node10,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node11,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node12,
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
        context.entry = context.node9;
        context.callback(context);
      }
      return [];
    }];
}
