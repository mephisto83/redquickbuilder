import { uuidv4 } from "../utils/array";
import { LinkProperties, NodeProperties } from "../constants/nodetypes";
export default function(args = {}) {
  // node0

  //
  if (!args.component) {
    throw "missing component";
  }
  if (!args.eventType) {
    throw "missing eventType";
  }
  if (args.eventTypeHandler && !args.property) {
    throw "missing property";
  }
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
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "EventMethod",
            parent: context.node0,
            properties: {
              ...viewPackages,
              EventType: context.eventType,
              text: context.eventType
            },
            linkProperties: {
              properties: {
                type: "EventMethod",
                EventMethod: {}
              }
            },
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
              text: context.eventType + " Instance",
              EventType: context.eventType,
              Pinned: false,
              ...viewPackages,
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
    context.eventTypeHandler
      ? function(graph) {
          return [
            {
              operation: "ADD_NEW_NODE",
              options: {
                nodeType: "EventHandler",
                parent: context.node5,
                ...viewPackages,
                groupProperties: {},
                linkProperties: {
                  properties: {
                    type: "EventHandler",
                    EventMethodInstance: {}
                  }
                },
                properties: {
                  text: context.eventType + " Handler",
                  Pinned: false,
                  EventType: context.eventType,
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
        }
      : null,
    context.eventTypeHandler
      ? function(graph) {
          return [
            {
              operation: "ADD_LINK_BETWEEN_NODES",
              options: {
                source: context.node5,
                target: context.property,
                properties: { ...LinkProperties.PropertyLink }
              }
            }
          ];
        }
      : null
  ].filter(x => x);
  let clearPinned = !args.clearPinned
    ? []
    : [
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
        }
      ];
  return [
    ...result,
    ...clearPinned,
    function() {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
