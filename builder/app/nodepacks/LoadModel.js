/* eslint-disable func-names */
import { uuidv4 } from "../utils/array";
import { UPDATE_NODE_PROPERTY } from "../actions/uiactions";
export default function LoadModel(args = {}) {
  //
  if (!args.model_view_name) {
    throw "missing model_view_name argument";
  }

  if (!args.model_item) {
    throw "missing model_item argument";
  }
  // model_view_name, model_item

  let context = {
    ...args
  };
  let { viewPackages = {} } = args;
  let result = [
    function (_graph) {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function (node) {
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
            value: "Load " + args.model_view_name + ""
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
      return [{
        operation: UPDATE_NODE_PROPERTY,
        options: {
          id: context.node0,
          properties: {
            ...viewPackages
          }
        }
      }]
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
              ...viewPackages,
              ChainParent: context.node0
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            links: [],
            callback(node, _graph, group) {
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
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node1,
            value: "x => useParameters()"
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
            value: "read parameters"
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
            callback: function (node, _graph, _group) {
              context.node2 = node.id;
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
            prop: "AsOutput",
            id: context.node2,
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
            prop: "AsOutput",
            id: context.node2,
            value: false
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
            value: "Lambda"
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
            id: context.node2,
            value:
              "params => {\n   let { value, viewModel } = params;\n   let dispatch = GetDispatch();\n   let getState = GetState();\n   let currentItem = GetK(getState(), UI_MODELS, " +
              args.model_item +
              ", value);\n   if(currentItem) {\n\tdispatch(clearScreenInstance(viewModel, currentItem?currentItem.id:null, currentItem)); \n\tdispatch(updateScreenInstanceObject(viewModel,currentItem?currentItem.id:null, { ...currentItem }));\n   }\n\n   return params;\n}"
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
            value: "update local"
          }
        }
      ];
    },

    function (_graph) {
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
    }
  ];
  let clearPinned = [
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node1,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node2,
          value: false
        };
      }
    }
  ];
  return [
    ...result,
    ...clearPinned,
    function () {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
