import { uuidv4 } from "../utils/array";
export default function (args = {}) {
  // node0

  //
  if (!args.component) {
    throw "missing component";
  }

  let context = {
    ...args,
    node0: args.component
  };
  let { viewPackages = {} } = args;
  let result = [
    function (graph) {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node0,
            groupProperties: {},
            properties: {
              UIType: context.uiType || "ElectronIO"
            },
            linkProperties: {
              properties: {
                type: "component",
                stroke: "#B7245C",
                component: {}
              }
            },
            callback: function (node, graph, group) {
              context.node1 = node.id;
            }
          }
        }
      ];
    },

    function (graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "component-type",
            id: context.node1,
            value: args.componentType || "Button"
          }
        }
      ];
    },

    function (graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: args.componentName || args.componentType || "Button"
          }
        }
      ];
    },

    function (graph) {
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
            callback: function (node, graph, group) {
              context.node2 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function (graph) {
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
            callback: function (node, graph, group) {
              context.node3 = node.id;
            }
          }
        }
      ];
    },

    function (graph) {
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

    function (graph) {
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

    function (graph) {
      return [
        {
          operation: "CONNECT_TO_TITLE_SERVICE",
          options: {
            id: context.node3
          }
        }
      ];
    }
  ];
  let clearPinned = !args.clearPinned
    ? []
    : [
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
      },
      {
        operation: "CHANGE_NODE_PROPERTY",
        options: function () {
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
    function () {
      if (context.callback) {
        context.entry = context.node1;
        context.callback(context);
      }
      return [];
    }
  ];
}
