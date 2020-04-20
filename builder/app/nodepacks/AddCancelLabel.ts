export default function(args = {}) {
  // node0
  let context = {
    node0: args.button,
    ...args
  };
  let { viewPackages = {} } = args;
  return [
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
            parent: context.node0,
            groupProperties: {},
            properties: {
              ...viewPackages,
              text: "label",
              Pinned: false,
              UseAsValue: true
            },
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
            nodeType: "ComponentExternalApi",
            parent: context.node0,
            linkProperties: {
              properties: {
                type: "component-external-api",
                "component-external-api": {}
              }
            },
            groupProperties: {},
            properties: {
              ...viewPackages,
              text: "label",
              Pinned: false
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
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node1,
            target: context.node2,
            properties: {
              type: "component-internal-connection",
              "component-internal-connection": {}
            }
          }
        }
      ];
    },
    ...[]
      .interpolate(0, 3, x => {
        return {
          operation: "CHANGE_NODE_PROPERTY",
          options: function() {
            return {
              prop: "Pinned",
              id: context["node" + x],
              value: false
            };
          }
        };
      })
      .filter(x => x)
  ];
}
