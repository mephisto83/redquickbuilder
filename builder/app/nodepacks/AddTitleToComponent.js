import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
export default function(args = {}) {
  // node0
  if (!args.component) {
    throw "no component";
  }
  //

  let context = {
    ...args,
    node0: args.component
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
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node0,
            groupProperties: {},
            properties: {
              UIType: "ElectronIO"
            },
            linkProperties: {
              properties: {
                type: "component",
                stroke: "#B7245C",
                component: {}
              }
            },
            callback: function(node, graph, group) {
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
            prop: "component-type",
            id: context.node1,
            value: "Button"
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
            value: "Button"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "ComponentApi",
            linkProperties: {
              properties: {
                type: "component-internal-api",
                "component-internal-api": {}
              }
            },
            parent: context.node1,
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false,
              UseAsValue: true
            },
            callback: function(node, graph, group) {
              context.node2 = node.id;
              context.group0 = group;
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
            nodeType: "ComponentExternalApi",
            parent: context.node1,
            linkProperties: {
              properties: {
                type: "component-external-api",
                "component-external-api": {}
              }
            },
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false
            },
            callback: function(node, graph, group) {
              context.node3 = node.id;
            }
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node2,
            target: context.node3,
            properties: {
              type: "component-internal-connection",
              "component-internal-connection": {}
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
            id: context.node3,
            value: true
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CONNECT_TO_TITLE_SERVICE",
          options: {
            id: context.node3
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "EventMethod",
            properties: {
              EventType: "onClick",
              text: "onClick"
            },
            links: [null],
            callback: function(node) {
              context.node4 = node.id;
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
            nodeType: "EventMethodInstance",
            parent: context.node4,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "EventMethodInstance",
                EventMethodInstance: {}
              }
            },
            properties: {
              text: "onClick Instance",
              Pinned: false,
              AutoDelete: {
                properties: {
                  nodeType: "component-api-connector"
                }
              }
            },
            callback: function(node, graph, group) {
              context.node5 = node.id;
              context.group1 = group;
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
            prop: "component-type",
            id: context.node1,
            value: "Image"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "component-type",
            id: context.node1,
            value: "Title"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "ComponentApi",
            linkProperties: {
              properties: {
                type: "component-internal-api",
                "component-internal-api": {}
              }
            },
            parent: context.node1,
            groupProperties: {},
            properties: {
              text: "value",
              Pinned: false,
              UseAsValue: true
            },
            callback: function(node, graph, group) {
              context.node6 = node.id;
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
            nodeType: "ComponentExternalApi",
            parent: context.node1,
            linkProperties: {
              properties: {
                type: "component-external-api",
                "component-external-api": {}
              }
            },
            groupProperties: {},
            properties: {
              text: "value",
              Pinned: false
            },
            callback: function(node, graph, group) {
              context.node7 = node.id;
            }
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node6,
            target: context.node7,
            properties: {
              type: "component-internal-connection",
              "component-internal-connection": {}
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
            prop: "Label",
            id: context.node1,
            value: "Title"
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
            value: "Title"
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
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node4,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node5,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node6,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node7,
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
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node3,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node4,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node5,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node6,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node7,
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
