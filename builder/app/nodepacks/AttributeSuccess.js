export default function(args = {}) {
  // node4,node5
  let context = {
    ...args,
    node4: args.model,
    node5: args.property
  };
  let propertyName = context.propertyName;

  let result = [
    function(graph) {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function(node) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: `Get Success For ${propertyName} ${args.viewName}`
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node1 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node1,
            value: "x => x ? x.object : null"
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node2 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node3 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node3
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node3
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node6 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node6
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node6
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node7 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node8 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node7
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node9 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node7
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
            callback: function(node, graph, group) {
              context.node10 = node.id;
              context.groupundefined = group;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node10,
            value: "complete"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "AsOutput",
            id: context.node10,
            value: true
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
