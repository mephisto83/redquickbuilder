import { uuidv4 } from "../utils/array";

export default function(args: any = {}) {
  // node0,node1,node2,node3
  let context = {
    node0: args.component,
    node1: uuidv4(),
    node2: uuidv4(),
    node3: uuidv4(),
    ...args
  };

  return [
    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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

    function() {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Layout",
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {}
                }
              },
              properties: {
                [context.node1]: {
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
                [context.node2]: {
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
                [context.node3]: {
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
                    tags: ["MainSection"]
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
}
