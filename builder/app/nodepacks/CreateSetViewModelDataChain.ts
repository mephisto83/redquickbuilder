import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
export default function(args: any = {}) {
  // node1

  // model
  if (!args.model) {
    throw "missing model argument";
  }
  let context = {
    ...args,
    node1: args.modelId
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
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
            value: "Data Chain"
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
            prop: "AsOutput",
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
            prop: "Lambda",
            id: context.node0,
            value: "x => Models.#{model}"
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
            prop: "LambdaInsertArguments",
            id: context.node0,
            value: {
              model: context.node1
            }
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
              type: "LambdaInsertArguments",
              LambdaInsertArguments: {}
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
            value: "Set View Model To " + args.model + ""
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
