import { uuidv4 } from "../utils/array";
import { LinkProperties } from "../actions/uiactions";
export default function (args = {}) {
  // node0,node2

  if (!args.lifeCycleMethod) {
    throw "missing life cylcle method";
  }
  if (!args.dataChain) {
    throw "missing data chain";
  }
  let context = {
    ...args,
    node0: args.lifeCycleMethod,
    node2: args.dataChain
  };
  let { viewPackages = {} } = args;
  let result = [
    function (graph) {
      if (typeof args.lifeCycleMethod === "function") {
        context.node0 = args.lifeCycleMethod(graph);
      }
      if (typeof args.dataChain === "function") {
        context.node2 = args.dataChain(graph);
      }
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "LifeCylceMethodInstance",
            parent: context.node0,
            groupProperties: {},
            linkProperties: {
              properties: { ...LinkProperties.LifeCylceMethodInstance }
            },
            properties: {
              ...viewPackages,
              text: "componentDidMount Instance",
              AutoDelete: {
                properties: {
                  nodeType: "component-api-connector"
                }
              }
            },
            callback: function (node, graph, group) {
              context.node1 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function (graph) {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node2,
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
    }
  ];
  return [
    ...result,
    ...clearPinned,
    function () {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
