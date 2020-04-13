/* eslint-disable func-names */

import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
import { DataChainFunctionKeys } from "../constants/datachain";

export default function (args = {}) {
  // node0
  if (!args.component) {
    throw new Error('missing component');
  }
  //

  const context = {
    ...args,
    node0: args.component
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

        "operation": "ADD_NEW_NODE",
        "options": {
          "nodeType": "LifeCylceMethod",
          "properties": {
            "EventType": "componentDidMount",
            "Pinned": false,
            "text": "componentDidMount"
          },
          "links": [
            function () {
              return [{

                "target": context.node0,
                "linkProperties": {
                  "properties": {
                    "type": "LifeCylceMethod",
                    "LifeCylceMethod": {}
                  }
                }
              }]
            }]
          ,
          "callback": function (node) { context.node1 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
          "nodeType": "LifeCylceMethod",
          "properties": {
            "EventType": "componentWillUnmount",
            "Pinned": false,
            "text": "componentWillUnmount"
          },
          "links": [
            function () {
              return [{

                "target": context.node0,
                "linkProperties": {
                  "properties": {
                    "type": "LifeCylceMethod",
                    "LifeCylceMethod": {}
                  }
                }
              }]
            }]
          ,
          "callback": function (node) { context.node2 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node1,
          "value": true
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
          "nodeType": "LifeCylceMethodInstance",
          "parent": context.node1,
          "linkProperties": {
            "properties": {
              "type": "LifeCylceMethodInstance",
              "LifeCylceMethodInstance": {}
            }
          },
          "groupProperties": {},
          "properties": {
            "text": "componentDidMount Instance",
            "AutoDelete": {
              "properties": {
                "nodeType": "component-api-connector"
              }
            }
          },
          "callback": function (node, graph, group) {
            context.node3 = node.id;
            context.group0 = group;
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node) { context.node4 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node4,
          "value": "Try To Get Local Creds"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node4,
          "value": "data-chain"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node4,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node4,
          "value": "LoadUserCredentialsFromLocalStore"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node4,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node4,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node) { context.node5 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node5,
          "value": "Store Cred Results in State"
        }
      }]
    },
    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node5,
          "value": DataChainFunctionKeys.StoreCredResults
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node5,
          "value": "data-chain"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node5,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node5,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node5,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "REMOVE_LINK_BETWEEN_NODES",
        "options": {
          "target": context.node4
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainReference",
          "id": context.node4,
          "value": context.node5
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_LINK_BETWEEN_NODES",
        "options": {
          "source": context.node5,
          "target": context.node4,
          "properties": {
            "type": "data-chain-link",
            "data-chain-link": {}
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "REMOVE_LINK_BETWEEN_NODES",
        "options": {
          "source": context.node5,
          "target": context.node4
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainReference",
          "id": context.node4,
          "value": context.node5
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_LINK_BETWEEN_NODES",
        "options": {
          "source": context.node5,
          "target": context.node4,
          "properties": {
            "type": "data-chain-link",
            "data-chain-link": {}
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_LINK",
        "options": {
          "target": context.node4,
          "source": context.node3,
          "properties": {
            "type": "CallDataChainLink",
            "CallDataChainLink": {},
            "singleLink": true,
            "nodeTypes": [
              "data-chain"
            ]
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
  }];
  const applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node1,
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
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node4,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node5,
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
