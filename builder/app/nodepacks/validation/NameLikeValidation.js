import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";
function NameLikeValidation(args = { condition: null, property: null }) {
  // node0,node1,node2,node3,node4,node5

  if (!args.condition) {
    throw "missing condition";
  }
  //

  let context = {
    ...args,
    node0: args.condition,
    node1: args.property,
    node2: uuidv4(),
    node3: uuidv4(),
    node4: uuidv4(),
    node5: uuidv4()
  };
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Condition",
            id: context.node0,
            value: {
              methods: {
                "Create/Object => Object": {
                  model: {
                    properties: {
                      [context.node1]: {
                        validators: {
                          [context.node2]: {
                            type: "minLengthEqual",
                            code: {
                              csharp: "MinAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "3"
                          },
                          [context.node3]: {
                            type: "maxlengthEqual",
                            code: {
                              csharp: "MaximumLengthAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "50"
                          },
                          [context.node4]: {
                            type: "alphaonly",
                            code: {
                              csharp: "AlphaOnlyAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              }
                            }
                          },
                          [context.node5]: {
                            type: "isNotNull",
                            code: {
                              csharp: "IsNotNullAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
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
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Condition",
            id: context.node0,
            value: {
              methods: {
                "Create/Object => Object": {
                  model: {
                    properties: {
                      [context.node1]: {
                        validators: {
                          [context.node2]: {
                            type: "minLengthEqual",
                            code: {
                              csharp: "MinAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "3"
                          },
                          [context.node3]: {
                            type: "maxlengthEqual",
                            code: {
                              csharp: "MaximumLengthAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "50"
                          },
                          [context.node4]: {
                            type: "alphaonly",
                            code: {
                              csharp: "AlphaOnlyAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              }
                            }
                          },
                          [context.node5]: {
                            type: "isNotNull",
                            code: {
                              csharp: "IsNotNullAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
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
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Condition",
            id: context.node0,
            value: {
              methods: {
                "Create/Object => Object": {
                  model: {
                    properties: {
                      [context.node1]: {
                        validators: {
                          [context.node2]: {
                            type: "minLengthEqual",
                            code: {
                              csharp: "MinAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "3"
                          },
                          [context.node3]: {
                            type: "maxlengthEqual",
                            code: {
                              csharp: "MaximumLengthAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "50"
                          },
                          [context.node4]: {
                            type: "alphaonly",
                            code: {
                              csharp: "AlphaOnlyAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              }
                            }
                          },
                          [context.node5]: {
                            type: "isNotNull",
                            code: {
                              csharp: "IsNotNullAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
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
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Condition",
            id: context.node0,
            value: {
              methods: {
                "Create/Object => Object": {
                  model: {
                    properties: {
                      [context.node1]: {
                        validators: {
                          [context.node2]: {
                            type: "minLengthEqual",
                            code: {
                              csharp: "MinAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "3"
                          },
                          [context.node3]: {
                            type: "maxlengthEqual",
                            code: {
                              csharp: "MaximumLengthAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "50"
                          },
                          [context.node4]: {
                            type: "alphaonly",
                            code: {
                              csharp: "AlphaOnlyAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              }
                            }
                          },
                          [context.node5]: {
                            type: "isNotNull",
                            code: {
                              csharp: "IsNotNullAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
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
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Condition",
            id: context.node0,
            value: {
              methods: {
                "Create/Object => Object": {
                  model: {
                    properties: {
                      [context.node1]: {
                        validators: {
                          [context.node2]: {
                            type: "minLengthEqual",
                            code: {
                              csharp: "MinAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "3"
                          },
                          [context.node3]: {
                            type: "maxlengthEqual",
                            code: {
                              csharp: "MaximumLengthAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "50"
                          },
                          [context.node4]: {
                            type: "alphaonly",
                            code: {
                              csharp: "AlphaOnlyAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              }
                            }
                          },
                          [context.node5]: {
                            type: "isNotNull",
                            code: {
                              csharp: "IsNotNullAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
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
        }
      ];
    },

    function(graph) {
      return [
        {
          operation: "CHANGE_NODE_PROPERTY",
          options: {
            prop: "Condition",
            id: context.node0,
            value: {
              methods: {
                "Create/Object => Object": {
                  model: {
                    properties: {
                      [context.node1]: {
                        validators: {
                          [context.node2]: {
                            type: "minLengthEqual",
                            code: {
                              csharp: "MinAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "3"
                          },
                          [context.node3]: {
                            type: "maxlengthEqual",
                            code: {
                              csharp: "MaximumLengthAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "INT",
                                nodeType: "model-property"
                              },
                              condition: {
                                type: "INT",
                                nodeType: null,
                                equals: true,
                                defaultValue: 0
                              }
                            },
                            condition: "50"
                          },
                          [context.node4]: {
                            type: "alphaonly",
                            code: {
                              csharp: "AlphaOnlyAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
                              }
                            }
                          },
                          [context.node5]: {
                            type: "isNotNull",
                            code: {
                              csharp: "IsNotNullAttribute"
                            },
                            template:
                              "./app/templates/validation/validation_generic.tpl",
                            arguments: {
                              value: {
                                type: "STRING",
                                nodeType: "model-property"
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
        }
      ];
    }
  ];
  let clearPinned = [];
  let applyViewPackages = [];
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

NameLikeValidation.title = "Name List Validation";

NameLikeValidation.description =
  "Minimum length 3, Max length 50 and just alpha chars.";

export default NameLikeValidation;
