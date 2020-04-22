import { uuidv4 } from "../utils/array";
export default function (args : any= {}) {
  // node1,node2

  //
  if (!args.model) {
    throw "no model was passed";
  }
  if (!args.user) {
    throw "no user was passed";
  }

  let context = {
    ...args,
    modelName: args.modelName || "Unknown",
    node1: args.model,
    node2: args.user
  };
  let { modelName } = context;
  let { viewPackages = {} } = args;
  let result = [
    function (graph: any) {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function (node: { id: any; }) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: "Claim Service"
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "nodeType",
            id: context.node0,
            value: "ClaimService"
          }
        }
      ];
    },

    function (graph: any) {
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

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "method",
            groupProperties: {},
            properties: {
              NodePackage: context.node1,
              NodePackageType: "Create " + modelName + " For User",
              NodePackageAgent: context.node2,
              functionType: "Create/Object=>Object(with users)",
              MethodType: "Create",
              HttpMethod: "HttpPost",
              text: "Create " + modelName + " For User"
            },
            linkProperties: {
              properties: {
                type: "function-operator",
                "function-operator": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node3 = node.id;
              context.group0 = group;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_DEFAULT_PROPERTIES",
          options: {
            parent: context.node1,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "property-link",
                "property-link": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node4 = node.id;
              context.group1 = group;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node3,
            target: context.node2,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node3,
            nodeType: "permission",
            groupProperties: {},
            properties: {
              NodePackage: context.node1,
              NodePackageType: "Create " + modelName + " For User",
              text: "Create " + modelName + " For User permission"
            },
            linkProperties: {
              properties: {
                type: "function-operator",
                "function-operator": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node5 = node.id;
              context.group2 = group;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2,
              permission: context.node5
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node5,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node3,
            nodeType: "model-filter",
            groupProperties: {},
            properties: {
              NodePackage: context.node1,
              NodePackageType: "Create " + modelName + " For User",
              text: "Create " + modelName + " For User model-filter"
            },
            linkProperties: {
              properties: {
                type: "function-operator",
                "function-operator": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node6 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "filteragent",
            id: context.node6,
            value: context.node2
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "filtermodel",
            id: context.node6,
            value: context.node1
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node6,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node6,
            properties: {
              type: "agent-type-link",
              "agent-type-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2,
              permission: context.node5,
              model_filter: context.node6,
              Validator: context.node7,
              executor: context.node8
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node6,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node3,
            nodeType: "validator",
            groupProperties: {},
            properties: {
              NodePackage: context.node1,
              collapsed: true,
              NodePackageType: "Create " + modelName + " For User",
              text: "Create " + modelName + " For User Validator",
              ValidatorModel: context.node1,
              ValidatorAgent: context.node2,
              ValidatorFunction: context.node3
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node7 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node7,
            properties: {
              type: "validator-model",
              "validator-model": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node7,
            properties: {
              type: "validator-agent",
              "validator-agent": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node3,
            source: context.node7,
            properties: {
              type: "validator-function",
              "validator-function": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2,
              permission: context.node5,
              model_filter: context.node6,
              Validator: context.node7,
              executor: context.node8
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node7,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node3,
            nodeType: "executor",
            groupProperties: {},
            properties: {
              NodePackage: context.node1,
              NodePackageType: "Create " + modelName + " For User",
              ExecutorFunctionType: "Create",
              text: "Create " + modelName + " For User Executor",
              ExecutorModel: context.node1,
              ExecutorModelOutput: context.node1,
              ExecutorFunction: context.node3,
              ExecutorAgent: context.node2
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node8 = node.id;
              context.executor = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node1,
            source: context.node8,
            properties: {
              type: "executor-model",
              "executor-model": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node8,
            properties: {
              type: "validator-agent",
              "validator-agent": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node3,
            source: context.node8,
            properties: {
              type: "executor-function",
              "executor-function": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node3,
            value: {
              user: context.node2,
              model: context.node1,
              agent: context.node2,
              permission: context.node5,
              model_filter: context.node6,
              Validator: context.node7,
              executor: context.node8
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node8,
            source: context.node3,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "method-api-parameters",
            properties: {
              text: "Body",
              UriBody: true
            },
            links: [
              function (graph: any) {
                return [
                  {
                    target: context.node3,
                    linkProperties: {
                      properties: {
                        type: "MethodApiParameters",
                        MethodApiParameters: {},
                        body: true
                      }
                    }
                  }
                ];
              }
            ],
            callback: function (node: { id: any; }) {
              context.node9 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "controller",
            properties: {
              text: "" + modelName + " Controller"
            },
            links: [
              function (graph: any) {
                return [
                  {
                    target: context.node1,
                    linkProperties: {
                      properties: {
                        type: "model-type-link",
                        "model-type-link": {}
                      }
                    }
                  }
                ];
              }
            ],
            callback: function (node: { id: any; }) {
              context.node10 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            id: context.node10,
            value: "systemUser",
            prop: "codeUser"
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "maestro",
            properties: {
              text: "" + modelName + " Maestro"
            },
            links: [
              function (graph: any) {
                return [
                  {
                    target: context.node1,
                    linkProperties: {
                      properties: {
                        type: "model-type-link",
                        "model-type-link": {}
                      }
                    }
                  }
                ];
              }
            ],
            callback: function (node: { id: any; }) {
              context.node11 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node10,
            target: context.node11,
            properties: {
              type: "maestro-link",
              "maestro-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node11,
            target: context.node3,
            properties: {
              type: "function-link",
              "function-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node3,
            source: context.node0,
            properties: {
              type: "ClaimServiceAuthorizationMethod",
              ClaimServiceAuthorizationMethod: {},
              nodeTypes: ["method"]
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "method",
            groupProperties: {},
            properties: {
              NodePackage: context.node2,
              NodePackageType: "Update User",
              NodePackageAgent: context.node2,
              functionType: "Update/Object=>Object(with users)",
              MethodType: "Update",
              HttpMethod: "HttpPost",
              text: "Update User"
            },
            linkProperties: {
              properties: {
                type: "function-operator",
                "function-operator": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node12 = node.id;
              context.group3 = group;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_DEFAULT_PROPERTIES",
          options: {
            parent: context.node2,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "property-link",
                "property-link": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node13 = node.id;
              context.group4 = group;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node12,
            target: context.node2,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node12,
            nodeType: "permission",
            groupProperties: {},
            properties: {
              NodePackage: context.node2,
              NodePackageType: "Update User",
              text: "Update User permission"
            },
            linkProperties: {
              properties: {
                type: "function-operator",
                "function-operator": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node14 = node.id;
              context.group5 = group;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2,
              permission: context.node14
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node14,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node12,
            nodeType: "model-filter",
            groupProperties: {},
            properties: {
              NodePackage: context.node2,
              NodePackageType: "Update User",
              text: "Update User model-filter"
            },
            linkProperties: {
              properties: {
                type: "function-operator",
                "function-operator": {}
              }
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node15 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "filteragent",
            id: context.node15,
            value: context.node2
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "filtermodel",
            id: context.node15,
            value: context.node2
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node15,
            properties: {
              type: "model-type-link",
              "model-type-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node15,
            properties: {
              type: "agent-type-link",
              "agent-type-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2,
              permission: context.node14,
              model_filter: context.node15,
              Validator: context.node16,
              executor: context.node17
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node15,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node12,
            nodeType: "validator",
            groupProperties: {},
            properties: {
              NodePackage: context.node2,
              collapsed: true,
              NodePackageType: "Update User",
              text: "Update User Validator",
              ValidatorModel: context.node2,
              ValidatorAgent: context.node2,
              ValidatorFunction: context.node12
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node16 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node16,
            properties: {
              type: "validator-model",
              "validator-model": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node16,
            properties: {
              type: "validator-agent",
              "validator-agent": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node12,
            source: context.node16,
            properties: {
              type: "validator-function",
              "validator-function": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2,
              permission: context.node14,
              model_filter: context.node15,
              Validator: context.node16,
              executor: context.node17
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node16,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            parent: context.node12,
            nodeType: "executor",
            groupProperties: {},
            properties: {
              NodePackage: context.node2,
              NodePackageType: "Update User",
              ExecutorFunctionType: "Update",
              text: "Update User Executor",
              ExecutorModel: context.node2,
              ExecutorModelOutput: context.node2,
              ExecutorFunction: context.node12,
              ExecutorAgent: context.node2
            },
            callback: function (node: { id: any; }, graph: any, group: any) {
              context.node17 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node17,
            properties: {
              type: "executor-model",
              "executor-model": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node2,
            source: context.node17,
            properties: {
              type: "validator-agent",
              "validator-agent": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node12,
            source: context.node17,
            properties: {
              type: "executor-function",
              "executor-function": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "methodProperties",
            id: context.node12,
            value: {
              user: context.node2,
              model: context.node2,
              agent: context.node2,
              permission: context.node14,
              model_filter: context.node15,
              Validator: context.node16,
              executor: context.node17
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            target: context.node17,
            source: context.node12,
            properties: {
              type: "function-operator",
              "function-operator": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "method-api-parameters",
            properties: {
              text: "Body",
              UriBody: true
            },
            links: [
              function (graph: any) {
                return [
                  {
                    target: context.node12,
                    linkProperties: {
                      properties: {
                        type: "MethodApiParameters",
                        MethodApiParameters: {},
                        body: true
                      }
                    }
                  }
                ];
              }
            ],
            callback: function (node: { id: any; }) {
              context.node18 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "controller",
            properties: {
              text: "User Controller"
            },
            links: [
              function (graph: any) {
                return [
                  {
                    target: context.node2,
                    linkProperties: {
                      properties: {
                        type: "model-type-link",
                        "model-type-link": {}
                      }
                    }
                  }
                ];
              }
            ],
            callback: function (node: { id: any; }) {
              context.node19 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            id: context.node19,
            value: "systemUser",
            prop: "codeUser"
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_NEW_NODE",
          options: {
            nodeType: "maestro",
            properties: {
              text: "User Maestro"
            },
            links: [
              function (graph: any) {
                return [
                  {
                    target: context.node2,
                    linkProperties: {
                      properties: {
                        type: "model-type-link",
                        "model-type-link": {}
                      }
                    }
                  }
                ];
              }
            ],
            callback: function (node: { id: any; }) {
              context.node20 = node.id;
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node19,
            target: context.node20,
            properties: {
              type: "maestro-link",
              "maestro-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "ADD_LINK_BETWEEN_NODES",
          options: {
            source: context.node20,
            target: context.node12,
            properties: {
              type: "function-link",
              "function-link": {}
            }
          }
        }
      ];
    },

    function (graph: any) {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node12,
            source: context.node0,
            properties: {
              type: "ClaimServiceUpdateUserMethod",
              ClaimServiceUpdateUserMethod: {},
              nodeTypes: ["method"]
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
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node3,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node4,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node5,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node6,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node7,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node8,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node9,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node10,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node11,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node12,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node13,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node14,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node15,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node16,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node17,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node18,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node19,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function () {
        return {
          prop: "Pinned",
          id: context.node20,
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
