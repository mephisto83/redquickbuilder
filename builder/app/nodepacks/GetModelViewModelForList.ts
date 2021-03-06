export default function(args: any = {}) {
  // node2,node3

  //
  let context = {
    ...args,
    node2: args.model,
    node3: args.viewModel
  };
  let { modelViewName } = context;
  let result = [
    function() {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function(node: any) {
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
            value: `Get ${modelViewName} Model VM key`
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
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node0,
            nodeType: "data-chain",
            groupProperties: null,
            properties: {
              ChainParent: context.node0
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback: function(node: any) {
              context.node1 = node.id;
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
            value: false
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
            prop: "Pinned",
            id: context.node1,
            value: false
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
            id: context.node1,
            value: "ModelKey"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node1
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "ModelKey",
            id: context.node1,
            value: context.node2
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node1,
            properties: {
              type: "ModelKey",
              ModelKey: {}
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
            id: context.node1,
            value: "get item view model"
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
            id: context.node1,
            value: true
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node0,
            source: context.node3,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {},
              singleLink: true,
              nodeTypes: ["data-chain"]
            }
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
