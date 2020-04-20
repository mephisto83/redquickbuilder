import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  // node0

  //
  if (!args.link) {
    throw "requires a link to update the instance update";
  }
  let context = {
    ...args,
    node0: args.link
  };
  let { viewPackages = {} } = args;
  let result = [
    function(graph) {
      return [
        {
          operation: "UPDATE_LINK_PROPERTY",
          options: {
            id: context.node0,
            prop: "InstanceUpdate",
            value: true
          }
        }
      ];
    }
  ];
  let clearPinned = [];
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
