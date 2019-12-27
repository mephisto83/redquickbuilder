import { uuidv4 } from "../utils/array";
export default function(args = {}) {
  // node0,node1,node2,node3,node4,node5,node6,node7,node8,node9,node10,node11
  let context = {
    node0: args.component,
    node1: uuidv4(),
    node2: uuidv4(),
    node3: uuidv4(),
    node4: uuidv4(),
    node5: uuidv4(),
    node6: uuidv4(),
    node7: uuidv4(),
    node8: uuidv4(),
    node9: uuidv4(),
    node10: uuidv4(),
    node11: uuidv4(),
    ...args
  };

  return [
    function(graph) {
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
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node1]: {
                  [context.node2]: {},
                  [context.node3]: {
                    [context.node4]: {},
                    [context.node5]: {}
                  }
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
                    tags: []
                  },
                  cellModelProperty: {},
                  cellRoot: {},
                  cellEvents: {}
                },
                [context.node4]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
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
            id: context.node0,
            value: {
              layout: {
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {}
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
                    width: 150
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
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
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
            id: context.node0,
            value: {
              layout: {
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {}
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
                    width: 150
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
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
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
            id: context.node0,
            value: {
              layout: {
                [context.node6]: {
                  [context.node7]: {},
                  [context.node8]: {
                    [context.node9]: {},
                    [context.node10]: {},
                    [context.node11]: {}
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
                    width: 150
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
                },
                [context.node11]: {
                  style: {
                    display: "flex",
                    flex: null,
                    height: "100%",
                    borderStyle: "solid",
                    borderWidth: 1,
                    width: 150
                  },
                  children: {},
                  cellModel: {},
                  properties: {},
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
