/* eslint-disable func-names */
import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
export default function (args = {}) {
  // node2,node3,node5

  //
  if (!args.model) {
    throw "missing model";
  }
  if (!args.modelText) {
    throw new Error("missing modelText");
  }
  let model = args.modelText;
  if (!args.property) {
    throw "missing property";
  }
  if (!args.propertyText) {
    throw "missing propertyText";
  }
  if (!args.methodType) {
    args.methodType = 'Method Type';
  }
  let methodType = args.methodType;
  let property = args.propertyText;
  if (!args.method) {
    throw "missing method  for create validator for property";
  }
  let context = {
    ...args,
    node2: args.model,
    node3: args.property,
    node5: args.method
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function () {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback (node) {
              context.node0 = node.id;
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
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: `Validate ${methodType} ${model} ${property}`
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
              ChainParent: context.node0
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            links: [],
            callback (node, group) {
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
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: "check for dirty"
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
            value: "Lambda"
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
            id: context.node1,
            value:
              "x => {\n let { object, dirty, focus, blur, focused } = x;\n  let result = {};\n  if(dirty && blur) {\n      //#{model}\n      // #{model~property}\n           if( dirty.#{model~property} && blur.#{model~property} ) \n {//updated \n        return { ...x, property: '#{model~property}', validated: true };\n      }\n  }\n    // only dirty fields, will be validatated.\n return { valid: false, validated: false };\n}"
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
            prop: "LambdaInsertArguments",
            id: context.node1,
            value: {
              model: context.node2,
              property: context.node3
            }
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
              type: "LambdaInsertArguments",
              LambdaInsertArguments: {}
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "REMOVE_LINK_BETWEEN_NODES",
          options: {
            target: {
              model: context.node2,
              property: context.node3
            },
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
            prop: "LambdaInsertArguments",
            id: context.node1,
            value: {
              model: context.node2,
              property: context.node3
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node3,
            source: context.node1,
            properties: {
              type: "LambdaInsertArguments",
              LambdaInsertArguments: {}
            }
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
              ChainParent: context.node1
            },
            linkProperties: {
              properties: {
                type: "data-chain-link",
                "data-chain-link": {}
              }
            },
            callback (node) {
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
            prop: "uiModelType",
            id: context.node4,
            value: context.node2
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Property",
            id: context.node4,
            value: context.node3
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
            value: `validate ${model}`
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
            value: "MethodBaseValidation"
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
            prop: "Method",
            id: context.node4,
            value: context.node5
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node4,
            target: context.node5,
            properties: {
              type: "data-chain-link",
              "data-chain-link": {}
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
            prop: "AsOutput",
            id: context.node4,
            value: true
          }
        }
      ];
    }
  ];
  let clearPinned = [
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
    }
  ];
  let applyViewPackages = [
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node0,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node1,
          properties: viewPackages
        };
      }
    },
    {
      operation: "UPDATE_NODE_PROPERTY",
      options () {
        return {
          id: context.node4,
          properties: viewPackages
        };
      }
    }
  ];
  return [
    ...result,
    ...clearPinned,
    ...applyViewPackages,
    function () {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
