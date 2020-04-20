/* eslint-disable func-names */
import postAuthenticate_ from "./postAuthenticate_";
import { NodeProperties } from "../constants/nodetypes";

export default function(args = {}) {
  // node0
  const context = {
    node2: args.screen,
    node3: args.clickInstance,
    node5: args.pressInstance,
    ...args
  };

  return [
    function() {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback(node) {
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
            value: context.functionName || "Post Authenticate"
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
            callback(node) {
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
            value: "Navigate"
          }
        }
      ];
    },

    function() {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: context.node1
          }
        }
      ];
    },

    function() {
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

    function() {
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

    function() {
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

    function() {
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
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: NodeProperties.UIType,
            id: context.node1,
            value: context.uiType
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

    context.node3
      ? function() {
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
      ? function() {
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
      head: () => context.node0,
      tail: () => context.node1
    }),
    ...[]
      .interpolate(0, 4, x => {
        if (x !== 2) {
          return {
            operation: "CHANGE_NODE_PROPERTY",
            options() {
              return {
                prop: "Pinned",
                id: context[`node${  x}`],
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
