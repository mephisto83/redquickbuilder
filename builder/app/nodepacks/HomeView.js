import { uuidv4 } from "../utils/array";

export default function(args = {}) {
  // node3,node6,node7,node8,node11,node16,node19
  let context = {
    node3: uuidv4(),
    node6: uuidv4(),
    node7: uuidv4(),
    node8: uuidv4(),
    node11: args.titleService,
    node16: args.registerForm,
    node19: args.authenticateForm,
    ...args
  };

  return [
    function(graph) {
      return [
        {
          operation: "NEW_NODE",
          options: {
            callback: function(node) {
              context.node0 = node.id;
            }
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node0,
            value: "Home View "
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
            value: "/",
            prop: "HttpRoute"
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "UIType",
            id: context.node1,
            value: "ElectronIO"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node1,
            value: "Home View Container"
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node1,
            groupProperties: {},
            properties: {
              UIType: "ElectronIO"
            },
            linkProperties: {
              properties: {
                type: "component",
                stroke: "#B7245C",
                component: {}
              }
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
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node2,
            value: "Home View Component"
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: "ElectronIO"
            },
            linkProperties: {
              properties: {
                type: "component",
                stroke: "#B7245C",
                component: {}
              }
            },
            callback: function(node) {
              context.node4 = node.id;
            }
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node4,
            value: "Authenticate Button"
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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

    function(graph) {
      return [
        {
          operation: "NEW_COMPONENT_NODE",
          options: {
            parent: context.node2,
            groupProperties: {},
            properties: {
              UIType: "ElectronIO"
            },
            linkProperties: {
              properties: {
                type: "component",
                stroke: "#B7245C",
                component: {}
              }
            },
            callback: function(node) {
              context.node5 = node.id;
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
            prop: "component-type",
            id: context.node5,
            value: "Button"
          }
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node5,
            value: "Register Button"
          }
        }
      ];
    },

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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

    function(graph) {
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
                    display: "flex",
                    flex: 1,
                    height: "100%",
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
            parent: context.node5,
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false,
              UseAsValue: true
            },
            callback: function(node) {
              context.node9 = node.id;
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
            callback: function(node) {
              context.node10 = node.id;
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

    function(graph) {
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

    function(graph) {
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
            parent: context.node4,
            groupProperties: {},
            properties: {
              text: "label",
              Pinned: false,
              UseAsValue: true
            },
            callback: function(node) {
              context.node12 = node.id;
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
            callback: function(node) {
              context.node13 = node.id;
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

    function(graph) {
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

    function(graph) {
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

    function(graph) {
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
              function(graph) {
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
            callback: function(node) {
              context.node14 = node.id;
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
            prop: "Pinned",
            id: context.node4,
            value: false
          }
        }
      ];
    },

    function(graph) {
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

    function(graph) {
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
            callback: function(node) {
              context.node15 = node.id;
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

    function(graph) {
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
              function(graph) {
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
            callback: function(node) {
              context.node17 = node.id;
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
            callback: function(node) {
              context.node18 = node.id;
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
            options: function() {
              return {
                prop: "Pinned",
                id: context["node" + x],
                value: false
              };
            }
          };
        }
        return null;
      })
      .filter(x => x)
  ];
}
