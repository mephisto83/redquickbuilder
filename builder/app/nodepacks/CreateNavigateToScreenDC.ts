import { uuidv4 } from "../utils/array";
import { NodeProperties, LinkType } from "../constants/nodetypes";
import {
  GetNodeTitle,
  ADD_LINK_BETWEEN_NODES,
  LinkProperties
} from "../actions/uiActions";
import ClearPreviousViewPackage from "./ClearPreviousViewPackage";
import { GetNodesLinkedTo } from "../methods/graph_methods";
export default function(args: any = {}) {
  // node3

  // screen
  if (!args.screen) {
    throw "missing screen argument";
  }
  if (!args.node) {
    throw "missing node argument";
  }
  let context = {
    ...args,
    node: args.node,
    node3: args.screen
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function(graph: any) {
      let temp = typeof args.node === "function" ? args.node() : args.node;
      let tempnodes = GetNodesLinkedTo(graph, {
        id: temp,
        link: LinkType.DataChainLink
      });
      return [
        ...tempnodes.map((node: { id: any; }) =>
          ClearPreviousViewPackage({
            node: node.id,
            graph
          })
        )
      ].flatten();
    },
    function(graph: any) {
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

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: "Navigate to Screen " + GetNodeTitle(args.screen) + ""
          }
        }
      ];
    },

    function(graph: any) {
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

    function(graph: any) {
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

    function(graph: any) {
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

    function(graph: any) {
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

    function(graph: any) {
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

    function(graph: any) {
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

    function(graph: any) {
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

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node1,
            value: context.lambda || "(x: any) => ({ value: x})"
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: "get param"
          }
        }
      ];
    },

    function(graph: any) {
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
            callback: function(node: { id: any; }, graph: any, group: any) {
              context.node2 = node.id;
            }
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node2,
            value: "Navigate To"
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node2,
            value: "Navigate"
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "UseNavigationParams",
            id: context.node2,
            value: true
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node2
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Screen",
            id: context.node2,
            value: context.node3
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "AsOutput",
            id: context.node2,
            value: true
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node2,
            target: context.node3,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {}
            }
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "NavigationAction",
            id: context.node2,
            value: "Go"
          }
        }
      ];
    },

    function(graph: any) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node2,
            value: "go to place"
          }
        }
      ];
    },
    function(graph: any) {
      return [
        {
          operation: ADD_LINK_BETWEEN_NODES,
          options: function() {
            return {
              source:
                typeof context.node === "function"
                  ? context.node()
                  : context.node,
              target: context.node0,
              properties: { ...LinkProperties.DataChainLink }
            };
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
    }
  ];
  let applyViewPackages = [
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node0,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node1,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node2,
          properties: viewPackages
        };
      }
    }
  ];
  return [
    ...result,
    ...clearPinned,
    ...applyViewPackages,
    function() {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
