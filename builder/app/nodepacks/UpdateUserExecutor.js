export default function(args = {}) {
  // node0,node1,node2

  //
  let context = {
    ...args,
    node0: args.executor,
    node1: args.model,
    node2: args.property
  };
  let { viewPackages = {} } = args;
  let result = [
    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            id: context.node0,
            prop: "Executor",
            value: {
              properties: {
                [context.node1]: {
                  validators: {
                    [context.node2]: {
                      type: "copy",
                      code: {
                        csharp: "copy"
                      },
                      arguments: {
                        value: {
                          type: "STRING",
                          nodeType: "model-property"
                        }
                      }
                    }
                  }
                }
              }
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
            target: context.node1,
            source: context.node0,
            properties: {
              type: "executor-model",
              "executor-model": {},
              on: {
                remove: [
                  function(graph) {
                    return [
                      {
                        function: "OnRemoveExecutorPropConnection"
                      }
                    ];
                  }
                ]
              }
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
            id: context.node0,
            prop: "Executor",
            value: {
              properties: {
                [context.node1]: {
                  validators: {
                    [context.node2]: {
                      type: "copy",
                      code: {
                        csharp: "copy"
                      },
                      arguments: {
                        value: {
                          type: "STRING",
                          nodeType: "model-property"
                        }
                      }
                    }
                  }
                }
              }
            }
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
