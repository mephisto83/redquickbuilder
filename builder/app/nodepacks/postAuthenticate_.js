import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  // node0,node1,node2

  //

  let context = null;

  let { viewPackages = {} } = args;
  let result = [
    function() {
      context = {
        ...args,
        node0: uuidv4(),
        node1: args.head(),
        node2: args.tail()
      };
      return [];
    },
    function(graph) {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node1,
            target: context.node2,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {}
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
            nodeType: "data-chain",
            parent: context.node1,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            properties: {
              ChainParent: context.node1
            },
            links: [
              function(graph) {
                return [
                  {
                    target: context.node2,
                    linkProperties: {
                      properties: {
                        type: "data-chain-link",
                        "data-chain-link": {}
                      }
                    }
                  }
                ];
              }
            ],
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
            source: context.node1,
            target: context.node3,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {}
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
            id: context.node2,
            value: context.node3,
            prop: "ChainParent"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node3,
            value: "SetBearerAccessToken"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node3,
            value: "set bearer token"
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
