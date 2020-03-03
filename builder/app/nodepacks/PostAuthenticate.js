import postAuthenticate_ from "./postAuthenticate_";

export default function(args = {}) {
  // node0
  let context = {
    node2: args.screen,
    node3: args.clickInstance,
    node5: args.pressInstance,
    ...args
  };

  return [
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
            value: context.functionName || "Post Authenticate"
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
            callback: function(node) {
              context.node1 = node.id;
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
            value: "Navigate"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node1
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Screen",
            id: context.node1,
            value: context.node2
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node1,
            target: context.node2,
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
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "NavigationAction",
            id: context.node1,
            value: "Replace"
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
            value: "[Select Target Screen]"
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
            prop: "EntryPoint",
            id: context.node0,
            value: true
          }
        }
      ];
    },

    context.node3
      ? function(graph) {
          return [
            {
              operation: "NEW_LINK",
              options: {
                target: context.node3,
                source: context.node0,
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
      : false,

    context.node5
      ? function(graph) {
          return [
            {
              operation: "NEW_LINK",
              options: {
                target: context.node5,
                source: context.node0,
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
      : false,

    ...postAuthenticate_({
      head: () => {
        return context.node0;
      },
      tail: () => {
        return context.node1;
      }
    }),
    ...[]
      .interpolate(0, 4, x => {
        if (x !== 2) {
          return {
            operation: "CHANGE_NODE_PROPERTY",
            options: function() {
              return {
                prop: "Pinned",
                id: context["node" + x],
                value: false
              };
            }
          };
        }
        return null;
      })
      .filter(x => x)
  ].filter(x => x);
}
