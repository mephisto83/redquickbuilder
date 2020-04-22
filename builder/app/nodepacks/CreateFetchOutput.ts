import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
export default function (args: any = {}) {
  //

  //

  let context = {
    ...args
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function () {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function (node: any) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: "Fetch Output"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node0,
            value: "FetchService"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node0,
            value: "maestro"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node0,
            value: "model"
          }
        }
      ];
    },

    function () {
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

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "IsFetchOutput",
            id: context.node0,
            value: true
          }
        }
      ];
    }
  ];
  let clearPinned: any = [];
  let applyViewPackages = [
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function () {
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
    (grapph: any) => {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context, grapph);
      }
      return [];
    }
  ];
}
