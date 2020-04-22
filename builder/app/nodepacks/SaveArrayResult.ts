import { uuidv4 } from "../utils/array";
export default function(args: any = {}) {
  // node1,node4

  //

  let context = {
    ...args,
    node1: uuidv4(),
    node4: uuidv4()
  };
  let result = [
    function() {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function(node: { id: any; }) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: "Handle Items For Agent"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node0,
            value: "data-chain"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "EntryPoint",
            id: context.node0,
            value: true
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Pinned",
            id: context.node0,
            value: true
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node0,
            value: "Save Model Array To State"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node0
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "uiModelType",
            id: context.node0,
            value: context.node1
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node0,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node0,
            value: "Pass"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node0,
            nodeType: "data-chain",
            groupProperties: {
              GroupEntryNode: context.node0,
              GroupExitNode: context.node0
            },
            properties: {
              Pinned: false,
              ChainParent: context.node0
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            links: [],
            callback: function(node: { id: any; }, graph: any, group: any) {
              context.node2 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Pinned",
            id: context.node2,
            value: true
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node2,
            value: "Save Model Array To State"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node2
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "uiModelType",
            id: context.node2,
            value: context.node1
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node2,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node0,
            value: "Save Model Array To State"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node0
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "uiModelType",
            id: context.node0,
            value: ""
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: "",
            source: context.node0,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node0,
            value: "Pass"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node2,
            value: "save model array"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node2,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ChainParent: context.node2
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: { id: any; }) {
              context.node3 = node.id;
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node3,
            value: "Save Model Array Ids to State Under Key"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node3
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "StateKey",
            id: context.node3,
            value: context.node4
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node4,
            source: context.node3,
            properties: {
              type: "StateKey",
              StateKey: {}
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node3,
            value: "save ids to state"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "AsOutput",
            id: context.node3,
            value: true
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "AsOutput",
            id: context.node3,
            value: false
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node3,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ChainParent: context.node3
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: { id: any; }) {
              context.node5 = node.id;
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node5,
            value: "Pass"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "AsOutput",
            id: context.node5,
            value: true
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node5,
            value: "complete"
          }
        }
      ];
    }
  ];
  let clearPinned = [
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node1,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node2,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node3,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node4,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node5,
          value: false
        };
      }
    }
  ];
  return [
    ...result,
    ...clearPinned,
    function() {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
