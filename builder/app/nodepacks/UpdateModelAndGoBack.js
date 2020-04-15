/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
import { GetNodeTitle } from "../actions/uiactions";

export default function (args = {}) {
  // node3
  if (!args.model) {
    throw "missing a model";
  }
  //
  const modelName = GetNodeTitle(args.model);

  const context = {
    ...args,
    node3: args.model
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  const result = [
    function (_graph) {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback (node) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: `${modelName ? (`${modelName} `) : ''}Store Result In Reducer`
          }
        }
      ];
    },

    function (_graph) {
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

    function (_graph) {
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

    function (_graph) {
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

    function (_graph) {
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

    function (_graph) {
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
            callback (node, _graph, group) {
              context.node1 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function (_graph) {
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

    function (_graph) {
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

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: "turn into an array"
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node1,
            value: "(x: any) => x  !== undefined || x!== null  ? [x] : []"
          }
        }
      ];
    },

    function (_graph) {
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
            callback (node, _graph, _group) {
              context.node2 = node.id;
            }
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node2,
            value: "save models"
          }
        }
      ];
    },

    function (_graph) {
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

    function (_graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node2
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "uiModelType",
            id: context.node2,
            value: context.node3
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node3,
            source: context.node2,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function (_graph) {
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
            callback (node, _graph, _group) {
              context.node4 = node.id;
            }
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node4,
            value: "Navigate To"
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "NavigationAction",
            id: context.node4,
            value: "Back"
          }
        }
      ];
    },

    function (_graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node4,
            value: "go back"
          }
        }
      ];
    }
  ];
  const clearPinned = [
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node1,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node2,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node3,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node4,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "AsOutput",
          id: context.node4,
          value: true
        };
      }
    }
  ];
  const applyViewPackages = [
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node0,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node1,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node2,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node4,
          properties: viewPackages
        };
      }
    }
  ];
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
    }
  ];
}
