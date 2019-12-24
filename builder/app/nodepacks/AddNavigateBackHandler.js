export default function(args = {}) {
  // node0
  let context = {
    node0: args.button,
    evt: args.evt || "onClick",
    ...args
  };

  return [
    function(graph) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "EventMethod",
            properties: {
              EventType: context.evt,
              text: context.evt
            },
            links: [
              function(graph) {
                return [
                  {
                    target: context.node0,
                    linkProperties: {
                      properties: {
                        type: "EventMethod",
                        EventMethod: {}
                      }
                    }
                  }
                ];
              }
            ],
            callback: function(node) {
              context.node1 = node.id;
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
            parent: context.node1,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "EventMethodInstance",
                EventMethodInstance: {}
              }
            },
            properties: {
              text: `${context.evt} Instance`,
              AutoDelete: {
                properties: {
                  nodeType: "component-api-connector"
                }
              }
            },
            callback: function(node) {
              context.node2 = node.id;
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
            nodeType: "NavigationAction",
            linkProperties: {
              properties: {
                type: "NavigationMethod",
                NavigationMethod: {}
              }
            },
            parent: context.node2,
            properties: {
              text: "GoBack",
              NavigationAction: "GoBack"
            },
            callback: function(node) {
              context.node3 = node.id;
            }
          }
        }
      ];
    }
  ];
}
