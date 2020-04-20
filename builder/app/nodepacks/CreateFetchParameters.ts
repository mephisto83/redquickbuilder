import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
export default function(args = {}) {
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
            value: "Fetch Parameters"
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
            value: "model"
          }
        }
      ];
    },
    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "IsFetchParameter",
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
          operation: "NEW_PROPERTY_NODE",
          options: {
            parent: context.node0,
            properties: {
              uiAttributeType: "STRING"
            },
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "property-link",
                "property-link": {}
              }
            },
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
            prop: "uiAttributeType",
            id: context.node1,
            value: "LISTOFSTRINGS"
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
            value: "Ids"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "UseInView",
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
            prop: "ExcludeFromController",
            id: context.node0,
            value: true
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
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node1,
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
