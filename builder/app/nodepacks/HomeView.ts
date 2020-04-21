/* eslint-disable func-names */
import { uuidv4 } from "../utils/array";
import { NodeProperties, UITypes } from "../constants/nodetypes";
import { NO_OP, GetNodeByProperties } from "../actions/uiactions";

export default function (args: any = {}) {
  // node3,node6,node7,node8,node11,node16,node19
  const context = {
    node3: uuidv4(),
    node6: uuidv4(),
    node7: uuidv4(),
    node8: uuidv4(),
    node11: args.titleService,
    node16: args.registerForm,
    node19: args.authenticateForm,
    node20: uuidv4(),
    node23: uuidv4(),
    node25: uuidv4(),
    ...args
  };
  const uiType = args.uiType || UITypes.ElectronIO;
  return [
    function (graph: any) {
      const homeScreen = GetNodeByProperties({
        [NodeProperties.UIText]: 'Home View'
      }, graph);
      if (homeScreen) {
        context.node0 = homeScreen.id;
        return [];
      }
      return [
        function () {
          return [
            {
              operation: "NEW_NODE",
              options: {
                callback(node) {
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
                value: "Home View"
              }
            }
          ];
        },
        function () {
          return [
            {
              operation: "CHANGE_NODE_PROPERTY",
              options: {
                id: context.node0,
                value: "/",
                prop: "HttpRoute"
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
                value: "screen"
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
      ]
    },

    function () {
      return [
        {
          operation: "NEW_SCREEN_OPTIONS",
          options: {
            parent: context.node0,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "screen-options",
                "screen-options": {}
              }
            },
            callback(node) {
              context.node1 = node.id;
              context.screenOption = node.id;
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
            prop: "UIType",
            id: context.node1,
            value: uiType
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
            value: "Home ViewContainer"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            id: context.node1,
            value: "/",
            prop: "HttpRoute"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node1,
            groupProperties: {},
            properties: {
              UIType: uiType
            },
            linkProperties: {
              properties: {
                type: "component",

                component: {}
              }
            },
            callback(node) {
              context.node2 = node.id;
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
            id: context.node2,
            value: "Home ViewComponent"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "component-type",
            id: context.node2,
            value: "View"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node1,
            value: {
              layout: {
                [context.node3]: {}
              },
              properties: {
                [context.node3]: {
                  style: {

                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {
                    [context.node3]: context.node2
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                }
              }
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
            prop: "Layout",
            id: context.node1,
            value: {
              layout: {
                [context.node3]: {}
              },
              properties: {
                [context.node3]: {
                  style: {

                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {
                    [context.node3]: context.node2
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                }
              }
            }
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: uiType
            },
            linkProperties: {
              properties: {
                type: "component",

                component: {}
              }
            },
            callback(node) {
              context.node4 = node.id;
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
            value: "Authenticate Butto"
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
            id: context.node4,
            value: "NavigationAction"
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
            value: "Register"
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
            id: context.node4,
            value: "component-node"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "component-type",
            id: context.node4,
            value: "Button"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: uiType
            },
            linkProperties: {
              properties: {
                type: "component",

                component: {}
              }
            },
            callback(node) {
              context.node5 = node.id;
            }
          }
        }
      ];
    },
    function () {
      // node21 anonymous button
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: uiType,
              "component-type": 'Button',
              [NodeProperties.UIText]: 'Guest'
            },
            linkProperties: {
              properties: {
                type: "component",

                component: {}
              }
            },
            callback(node) {
              context.node21 = node.id;
              context.guestButton = node.id;
            }
          }
        }
      ];
    },
    function () {
      // node22 continu as button
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: uiType,
              "component-type": 'Button',
              [NodeProperties.UIText]: 'Continue As ...'
            },
            linkProperties: {
              properties: {
                type: "component",

                component: {}
              }
            },
            callback(node) {
              context.node22 = node.id;
            }
          }
        }
      ];
    },
    function () {
      // node24 continu as button
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: uiType,
              "component-type": 'Button',
              [NodeProperties.UIText]: 'Forgot Password ...'
            },
            linkProperties: {
              properties: {
                type: "component",

                component: {}
              }
            },
            callback(node) {
              context.node24 = node.id;
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
            prop: "component-type",
            id: context.node5,
            value: "Button"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node5,
            value: "Authenticate"
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node2,
            value: {
              layout: {
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {}
                }
              },
              properties: {
                [context.node6]: {
                  style: {

                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {

                    borderStyle: "solid",
                    borderWidth: 1,
                    justifyContent: "center",
                    alignItems: "center"
                  },
                  children: {
                    [context.node7]: context.node4
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node8]: {
                  style: {

                    borderStyle: "solid",
                    borderWidth: 1,
                    justifyContent: "center",
                    alignItems: "center"
                  },
                  children: {
                    [context.node8]: context.node5
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                }
              }
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
            prop: "Layout",
            id: context.node2,
            value: {
              layout: {
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {},
                  [context.node20]: {},
                  [context.node23]: {},
                  [context.node25]: {}
                }
              },
              properties: {
                [context.node6]: {
                  style: {

                  },
                  children: {},
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {

                  },
                  children: {
                    [context.node7]: context.node4
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node8]: {
                  style: {

                  },
                  children: {
                    [context.node8]: context.node5
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node20]: {
                  style: {

                  },
                  children: {
                    [context.node20]: context.node21
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node23]: {
                  style: {

                  },
                  children: {
                    [context.node23]: context.node22
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node25]: {
                  style: {

                  },
                  children: {
                    [context.node25]: context.node24
                  },
                  cellModel: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                }
              }
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
            nodeType: "ComponentApi",
            linkProperties: {
              properties: {
                type: "component-internal-api",
                "component-internal-api": {}
              }
            },
            parent: context.node5,
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false,
              UseAsValue: true
            },
            callback(node) {
              context.node9 = node.id;
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
            nodeType: "ComponentExternalApi",
            parent: context.node5,
            linkProperties: {
              properties: {
                type: "component-external-api",
                "component-external-api": {}
              }
            },
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false
            },
            callback(node) {
              context.node10 = node.id;
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
            source: context.node9,
            target: context.node10,
            properties: {
              type: "component-internal-connection",
              "component-internal-connection": {}
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
            id: context.node10,
            value: true
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node11,
            source: context.node10,
            properties: {
              type: "title-service-link",
              "title-service-link": {},
              singleLink: true,
              nodeTypes: ["titleService"]
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
            nodeType: "ComponentApi",
            linkProperties: {
              properties: {
                type: "component-internal-api",
                "component-internal-api": {}
              }
            },
            parent: context.node4,
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false,
              UseAsValue: true
            },
            callback(node) {
              context.node12 = node.id;
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
            nodeType: "ComponentExternalApi",
            parent: context.node4,
            linkProperties: {
              properties: {
                type: "component-external-api",
                "component-external-api": {}
              }
            },
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false
            },
            callback(node) {
              context.node13 = node.id;
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
            source: context.node12,
            target: context.node13,
            properties: {
              type: "component-internal-connection",
              "component-internal-connection": {}
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
            id: context.node13,
            value: true
          }
        }
      ];
    },

    function () {
      return [
        {
          operation: "NEW_LINK",
          options: {
            target: context.node11,
            source: context.node13,
            properties: {
              type: "title-service-link",
              "title-service-link": {},
              singleLink: true,
              nodeTypes: ["titleService"]
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
            nodeType: "EventMethod",
            properties: {
              EventType: "onClick",
              text: "onClick"
            },
            links: [
              function () {
                return [
                  {
                    target: context.node4,
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
            callback(node) {
              context.node14 = node.id;
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
            id: context.node4,
            value: false
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
            id: context.node4,
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
            nodeType: "EventMethodInstance",
            parent: context.node14,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "EventMethodInstance",
                EventMethodInstance: {}
              }
            },
            properties: {
              text: "onClick Instance",
              AutoDelete: {
                properties: {
                  nodeType: "component-api-connector"
                }
              }
            },
            callback(node) {
              context.node15 = node.id;
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
            target: context.node16,
            source: context.node15,
            properties: {
              type: "MethodCall",
              MethodCall: {}
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
            nodeType: "EventMethod",
            properties: {
              EventType: "onClick",
              text: "onClick"
            },
            links: [
              function () {
                return [
                  {
                    target: context.node5,
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
            callback(node) {
              context.node17 = node.id;
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
            nodeType: "EventMethodInstance",
            parent: context.node17,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "EventMethodInstance",
                EventMethodInstance: {}
              }
            },
            properties: {
              text: "onClick Instance",
              AutoDelete: {
                properties: {
                  nodeType: "component-api-connector"
                }
              }
            },
            callback(node) {
              context.node18 = node.id;
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
            target: context.node19,
            source: context.node18,
            properties: {
              type: "MethodCall",
              MethodCall: {}
            }
          }
        }
      ];
    },
    ...[]
      .interpolate(0, 20, x => {
        if (x !== 2) {
          return {
            operation: "CHANGE_NODE_PROPERTY",
            options() {
              return {
                prop: "Pinned",
                id: context[`node${x}`],
                value: false
              };
            }
          };
        }
        return null;
      })
      .filter(x => x),
    function () {
      return {
        operation: NO_OP,
        options() {
          if (args.callback) {
            args.callback({
              anonymousButton: context.node21,
              continueAsButton: context.node22,
              forgotLoginButton: context.node24,
              ...context
            })
          }
          return null;
        }
      }
    }
  ];
}
