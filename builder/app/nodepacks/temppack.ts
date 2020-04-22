export default function(args: any = {}) {
  // node4,node5

  // propertyName
  let context = {
    ...args
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
            value: "Get Success For " + args.propertyName + ""
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
              context.node1 = node.id;
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
            id: context.node1,
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
            id: context.node1,
            value: "Lambda"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node1,
            value: "(x: any) => x ? x.object : null"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: "Get object from selector result"
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
            callback: function(node: { id: any; }) {
              context.node2 = node.id;
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
            value: "Lambda"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node2,
            value: "x => x ? x.sucess: null"
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
            value: "Get success from "
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node2,
            value: "x => x ? x.dirty: null"
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
            value: "Get dirty from selector result"
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
            value: "Model - Property"
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
            prop: "uiModelType",
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
            prop: "Property",
            id: context.node3,
            value: context.node5
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node5,
            source: context.node3,
            properties: {
              type: "property-link",
              "property-link": {}
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
            value: "Get Property from dirty"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node1,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ChainParent: context.node1
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: { id: any; }) {
              context.node6 = node.id;
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
            id: context.node6,
            value: "Model - Property"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node6
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
            id: context.node6,
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
            source: context.node6,
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
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node6
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Property",
            id: context.node6,
            value: context.node5
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node5,
            source: context.node6,
            properties: {
              type: "property-link",
              "property-link": {}
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
            id: context.node6,
            value: "Get Property from object"
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
              context.node7 = node.id;
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
            id: context.node7,
            value: "IfThanElse"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node7,
            value: "if dirty then check validity"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node6,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ChainParent: context.node6
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: { id: any; }) {
              context.node8 = node.id;
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
            id: context.node8,
            value: "Validation"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node8,
            value: "validate property"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node7
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "ChainNodeInput1",
            id: context.node7,
            value: context.node8
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node8,
            target: context.node7,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {}
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "data-chain",
            properties: {
              MergeChain: true
            },
            groupProperties: {
              id: context.group0
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: { id: any; }) {
              context.node9 = node.id;
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
            id: context.node9,
            value: "Lambda"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node9,
            value: "x => false"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node9,
            value: "return false"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node7
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "ChainNodeInput2",
            id: context.node7,
            value: context.node9
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node9,
            target: context.node7,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {}
            }
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node7,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ChainParent: context.node7
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: { id: any; }) {
              context.node10 = node.id;
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
            id: context.node10,
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
            id: context.node10,
            value: "complete"
          }
        }
      ];
    }
  ];
  return [
    ...result,
    function() {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
