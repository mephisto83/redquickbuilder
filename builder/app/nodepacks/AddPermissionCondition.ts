import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
export default function(args: any = {}) {
  // node0,node2,node3

  //

  let context = {
    ...args,
    node0: uuidv4(),
    node2: uuidv4(),
    node3: uuidv4()
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function() {
      return [
        {
          operation: "NEW_CONDITION_NODE",
          options: {
            parent: context.node0,
            groupProperties: {},
            linkProperties: {
              properties: {
                type: "condtion",
                condtion: {}
              }
            },
            callback: function(node: any, graph: any, group: any) {
              context.node1 = node.id;
              context.group0 = group;
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
            prop: "Condition",
            id: context.node1,
            value: {
              methods: {
                "Get/Object/Agent/Value => Object": {
                  model: {
                    properties: {}
                  },
                  agent: {
                    properties: {
                      [context.node2]: {
                        validators: {
                          [context.node3]: {
                            type: "equals-false",
                            code: {
                              csharp: "EqualsFalse"
                            },
                            template: "./app/templates/filter/equals_false.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              },
                              type: "BOOLEAN"
                            }
                          }
                        }
                      }
                    }
                  }
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
            prop: "Condition",
            id: context.node1,
            value: {
              methods: {
                "Get/Object/Agent/Value => Object": {
                  model: {
                    properties: {}
                  },
                  agent: {
                    properties: {
                      [context.node2]: {
                        validators: {
                          [context.node3]: {
                            type: "equals-false",
                            code: {
                              csharp: "EqualsFalse"
                            },
                            template: "./app/templates/filter/equals_false.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              },
                              type: "BOOLEAN"
                            }
                          }
                        }
                      }
                    }
                  }
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
            prop: "Condition",
            id: context.node1,
            value: {
              methods: {
                "Get/Object/Agent/Value => Object": {
                  model: {
                    properties: {}
                  },
                  agent: {
                    properties: {
                      [context.node2]: {
                        validators: {
                          [context.node3]: {
                            type: "equals-false",
                            code: {
                              csharp: "EqualsFalse"
                            },
                            template: "./app/templates/filter/equals_false.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              },
                              type: "BOOLEAN"
                            }
                          }
                        }
                      }
                    }
                  }
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
            prop: "Condition",
            id: context.node1,
            value: {
              methods: {
                "Get/Object/Agent/Value => Object": {
                  model: {
                    properties: {}
                  },
                  agent: {
                    properties: {
                      [context.node2]: {
                        validators: {
                          [context.node3]: {
                            type: "equals-false",
                            code: {
                              csharp: "EqualsFalse"
                            },
                            template: "./app/templates/filter/equals_false.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              },
                              type: "BOOLEAN"
                            }
                          }
                        }
                      }
                    }
                  }
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
            prop: "Condition",
            id: context.node1,
            value: {
              methods: {
                "Get/Object/Agent/Value => Object": {
                  model: {
                    properties: {}
                  },
                  agent: {
                    properties: {
                      [context.node2]: {
                        validators: {
                          [context.node3]: {
                            type: "equals-false",
                            code: {
                              csharp: "EqualsFalse"
                            },
                            template: "./app/templates/filter/equals_false.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              },
                              type: "BOOLEAN"
                            }
                          }
                        }
                      }
                    }
                  }
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
            prop: "Condition",
            id: context.node1,
            value: {
              methods: {
                "Get/Object/Agent/Value => Object": {
                  model: {
                    properties: {}
                  },
                  agent: {
                    properties: {
                      [context.node2]: {
                        validators: {
                          [context.node3]: {
                            type: "equals-false",
                            code: {
                              csharp: "EqualsFalse"
                            },
                            template: "./app/templates/filter/equals_false.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              },
                              type: "BOOLEAN"
                            }
                          }
                        }
                      }
                    }
                  }
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
    }
  ];
  let applyViewPackages = [
    {
      operation: "UPDATE_NODE_PROPERTY",
      options: function() {
        return {
          id: context.node1,
          properties: viewPackages
        };
      }
    }
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
