import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  // node0,node1

  //

  let context = {
    ...args,
    node0: uuidv4(),
    node1: uuidv4()
  };
  let { viewPackages = {} } = args;
  let result = [
    function(graph) {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node0,
            source: context.node1,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {},
              singleLink: true,
              nodeTypes: ["data-chain"]
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
