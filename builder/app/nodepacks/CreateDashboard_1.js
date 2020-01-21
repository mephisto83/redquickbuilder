import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  // node3,node4,node5,node6,node7,node8,node9,node10,node11,node12

  //
  let context = {
    ...args,
    node3: uuidv4(),
    node4: uuidv4(),
    node5: uuidv4(),
    node6: uuidv4(),
    node7: uuidv4(),
    node8: uuidv4(),
    node9: uuidv4(),
    node10: uuidv4(),
    node11: uuidv4(),
    node12: uuidv4(),
    name: args.name || "Dashboard"
  };
  let {
    viewPackages = {
      [NodeProperties.ViewPackage]: uuidv4()
    }
  } = args;
  let result = [
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
            value: "" + context.name + ""
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
            callback: function(node, graph, group) {
              context.node1 = node.id;
              context.group0 = group;
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
            value: "" + context.name + " IO"
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
            callback: function(node, graph, group) {
              context.node2 = node.id;
              context.group1 = group;
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node3]: {
                  [context.node4]: {},
                  [context.node5]: {}
                }
              },
              properties: {
                [context.node3]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["TopMenu", "MainMenu"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node5]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
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
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {},
                    [context.node12]: {}
                  }
                }
              },
              properties: {
                [context.node6]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "Header", "TopMenu"]
                  },
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
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node9]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node10]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SecondaryMain"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node12]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "RightContainer"]
                  },
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
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {},
                    [context.node12]: {}
                  }
                }
              },
              properties: {
                [context.node6]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "Header", "TopMenu"]
                  },
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
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node9]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node10]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SecondaryMain"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node12]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "RightContainer"]
                  },
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
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {},
                    [context.node12]: {}
                  }
                }
              },
              properties: {
                [context.node6]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "Header", "TopMenu"]
                  },
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
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node9]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node10]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SecondaryMain"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node12]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "RightContainer"]
                  },
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
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {},
                    [context.node12]: {}
                  }
                }
              },
              properties: {
                [context.node6]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "Header", "TopMenu"]
                  },
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
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node9]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node10]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SecondaryMain"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node12]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "RightContainer"]
                  },
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
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {},
                    [context.node12]: {}
                  }
                }
              },
              properties: {
                [context.node6]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {
                    [context.node7]: context.node2
                  },
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "Header", "TopMenu"]
                  },
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
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node9]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node10]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SecondaryMain"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node12]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "RightContainer"]
                  },
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
          operation: "CHANGE_NODE_TEXT",
          options: {
            id: context.node2,
            value: "" + context.name + " IO Title"
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
            value: "H3"
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
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {},
                    [context.node12]: {}
                  }
                }
              },
              properties: {
                [context.node6]: {
                  style: {
                    display: "flex",
                    flex: 1,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    flexDirection: "column"
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node7]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: null,
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: null
                  },
                  children: {
                    [context.node7]: context.node2
                  },
                  cellModel: {},
                  properties: {
                    tags: ["MainMenu", "Header", "TopMenu"]
                  },
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
                    borderWidth: 1
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node9]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "LeftContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node10]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["Main"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SecondaryMain"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node12]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: "25%"
                  },
                  children: {},
                  cellModel: {},
                  properties: {
                    tags: ["SideContainer", "RightContainer"]
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
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
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node4,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node5,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node6,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node7,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node8,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node9,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node10,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node11,
          value: false
        };
      }
    },
    {
      operation: "CHANGE_NODE_PROPERTY",
      options: function() {
        return {
          prop: "Pinned",
          id: context.node12,
          value: false
        };
      }
    }
  ];
  let applyViewPackages = [
    ...["node0", "node1", "node2"].map(v => {
      return {
        operation: UPDATE_NODE_PROPERTY,
        options: function() {
          return {
            id: context[v],
            properties: viewPackages
          };
        }
      };
    })
  ];
  return [
    ...result,
    ...clearPinned,
    ...applyViewPackages,
    function() {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }
  ];
}
