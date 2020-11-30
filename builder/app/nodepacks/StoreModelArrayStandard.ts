/* eslint-disable func-names */
import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
import { UPDATE_NODE_PROPERTY } from "../actions/uiActions";

export default function (args: any = { state_key: "StateKeyReplace" }) {
  // node2

  //

  const context = {
    ...args,
    node2: args.model
  };

  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  const result = [
    function () {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback (node: { id: any; }) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: `Store Model Array Standard ${args.modelText || ""}`
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node0,
            value: "data-chain"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: UPDATE_NODE_PROPERTY,
          options: {
            id: context.node0,
            properties: {
              ...viewPackages
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node0,
            value: "Pass"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "EntryPoint",
            id: context.node0,
            value: true
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: NodeProperties.UIType,
            id: context.node0,
            value: context.uiType
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Pinned",
            id: context.node0,
            value: true
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node0,
            nodeType: "data-chain",
            groupProperties: {
              GroupEntryNode: context.node0,
              GroupExitNode: context.node0
            },
            properties: {
              Pinned: false,
              ...viewPackages,
              ChainParent: context.node0
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            links: [],
            callback(node: { id: any; }, group: any) {
              context.node1 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Pinned",
            id: context.node1,
            value: true
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node1,
            value: "Save Model Array To State"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node1
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "uiModelType",
            id: context.node1,
            value: context.node2
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node1,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: "Store Model To State"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node1,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ...viewPackages,
              ChainParent: context.node1
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback (node: { id: any; }) {
              context.node3 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node3,
            value: "Save Model Array Ids to State Under Key"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node3,
            value: "Map"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Lambda",
            id: context.node3,
            value: "(x: any) => x ? x.id : null"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node3,
            value: "Extract ids"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node3,
            nodeType: "data-chain",
            groupProperties: {
              id: context.group0
            },
            properties: {
              ...viewPackages,
              ChainParent: context.node3
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback (node: { id: any; }) {
              context.node4 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "DataChainFunctionType",
            id: context.node4,
            value: "Save Model Array Ids to State Under Key"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback (node: { id: any; }) {
              context.node5 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "REMOVE_NODE",
          options: {
            id: context.node5,
            callback (node: { id: any; }) {
              context.node4 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback (node: { id: any; }) {
              context.node6 = node.id;
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node6,
            value: "State Key"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node6,
            value: "StateKey"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node6,
            value: `${args.state_key}`
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            source: context.node4
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "StateKey",
            id: context.node4,
            value: context.node6
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node6,
            source: context.node4,
            properties: {
              type: "StateKey",
              StateKey: {}
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node4,
            value: "Save model to state key"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "AsOutput",
            id: context.node4,
            value: true
          }
        }
      ];
    }
  ];
  const clearPinned = [
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node1,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node2,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node3,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node4,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node5,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options () {
        return {
          prop: "Pinned",
          id: context.node6,
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
