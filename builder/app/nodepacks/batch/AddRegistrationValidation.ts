/* eslint-disable func-names */

import { uuidv4 } from "../../utils/array";
import { NodeProperties, LinkProperties } from "../../constants/nodetypes";

export default function AddRegistrationValidation(args = {}) {
  // node2,node3,node4,node5,node6,node7,node8,node9,node10,node11,node12,node13,node14,node15,node16,node17
  if (!args.method) {
    throw new Error('missing the method');
  }
  if (!args.userName) {
    throw new Error('userName missing');
  }
  if (!args.email) {
    throw new Error('email missing');
  }
  if (!args.password) {
    throw new Error('password missing');
  }
  if (!args.passwordConfirm) {
    throw new Error('password confirm missing');
  }
  //

  const context = {
    ...args,
    node2: args.method,
    node3: args.userName,
    node4: uuidv4(),
    node5: uuidv4(),
    node6: uuidv4(),
    node7: uuidv4(),
    node8: args.email,
    node9: uuidv4(),
    node10: uuidv4(),
    node11: args.password,
    node12: uuidv4(),
    node13: uuidv4(),
    node14: args.passwordConfirm,
    node15: uuidv4(),
    node16: uuidv4(),
    node17: uuidv4()
  };
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  const result = [
    function () {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node) { context.node0 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node0,
          "value": "Register Validation"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node0,
          "value": "validator"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_CONDITION_NODE",
        "options": {
          "parent": context.node0,
          "groupProperties": {},
          "linkProperties": {
            "properties": {
              "type": "condtion",
              "condtion": {}
            }
          },
          "callback": function (node, graph, group) {
            context.node1 = node.id;
            context.group0 = group;
          }
        }
      }]
    },

    function () {
      return [{

        "operation": "NEW_LINK",
        "options": {
          "target": context.node0,
          "source": context.node2,
          "properties": { ...LinkProperties.ValdationLink }
        }
      }]
    },


    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Selected",
          "id": context.node1,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Selected",
          "id": context.node1,
          "value": false
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Selected",
          "id": context.node1,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Condition",
          "id": context.node1,
          "value": {
            "methods": {
              "Register": {
                "model": {
                  "properties": {
                    [context.node3]: {
                      "validators": {
                        [context.node4]: {
                          "type": "alphaonly",
                          "code": {
                            "csharp": "AlphaOnlyAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "STRING",
                              "nodeType": "model-property"
                            }
                          }
                        },
                        [context.node5]: {
                          "type": "minLength",
                          "code": {
                            "csharp": "MinimumLengthAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "INT",
                              "nodeType": "model-property"
                            },
                            "condition": {
                              "type": "INT",
                              "nodeType": null,
                              "defaultValue": 0
                            }
                          },
                          "condition": "6"
                        },
                        [context.node6]: {
                          "type": "maxlength",
                          "code": {
                            "csharp": "MaximumLengthAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "INT",
                              "nodeType": "model-property"
                            },
                            "condition": {
                              "type": "INT",
                              "nodeType": null,
                              "defaultValue": 0
                            }
                          },
                          "condition": "50"
                        },
                        [context.node7]: {
                          "type": "isNotNull",
                          "code": {
                            "csharp": "IsNotNullAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "STRING",
                              "nodeType": "model-property"
                            }
                          }
                        }
                      }
                    },
                    [context.node8]: {
                      "validators": {
                        [context.node9]: {
                          "type": "email",
                          "code": {
                            "csharp": "EmailAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "STRING",
                              "nodeType": "model-property"
                            }
                          }
                        }
                      }
                    },
                    [context.node11]: {
                      "validators": {
                        [context.node12]: {
                          "type": "minLength",
                          "code": {
                            "csharp": "MinimumLengthAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "INT",
                              "nodeType": "model-property"
                            },
                            "condition": {
                              "type": "INT",
                              "nodeType": null,
                              "defaultValue": 0
                            }
                          },
                          "condition": "8"
                        },
                        [context.node13]: {
                          "type": "maxlength",
                          "code": {
                            "csharp": "MaximumLengthAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "INT",
                              "nodeType": "model-property"
                            },
                            "condition": {
                              "type": "INT",
                              "nodeType": null,
                              "defaultValue": 0
                            }
                          },
                          "condition": "25"
                        }
                      }
                    },
                    [context.node14]: {
                      "validators": {
                        [context.node15]: {
                          "type": "minLength",
                          "code": {
                            "csharp": "MinimumLengthAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "INT",
                              "nodeType": "model-property"
                            },
                            "condition": {
                              "type": "INT",
                              "nodeType": null,
                              "defaultValue": 0
                            }
                          },
                          "condition": "8"
                        },
                        [context.node16]: {
                          "type": "maxlength",
                          "code": {
                            "csharp": "MaximumLengthAttribute"
                          },
                          "template": "./app/templates/validation/validation_generic.tpl",
                          "templatejs": "./app/templates/validation/validation_generic_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "INT",
                              "nodeType": "model-property"
                            },
                            "condition": {
                              "type": "INT",
                              "nodeType": null,
                              "defaultValue": 0
                            }
                          },
                          "condition": "25"
                        },
                        [context.node17]: {
                          "type": "equals-model-property",
                          "code": {
                            "csharp": "EqualsModelProperty"
                          },
                          "template": "./app/templates/filter/equals-model-property.tpl",
                          "templatejs": "./app/templates/filter/equals-model-property_js.tpl",
                          "arguments": {
                            "value": {
                              "type": "STRING",
                              "nodeType": "model-property"
                            },
                            "modelproperty": true
                          },
                          "node": "model",
                          "nodeProperty": context.node11
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }]
    }]
    ;
  const clearPinned = [{
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node1,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node2,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node3,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node4,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node5,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node6,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node7,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node8,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node9,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node10,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node11,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node12,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node13,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node14,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node15,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node16,
        value: false
      }
    }
  },
  {
    operation: 'CHANGE_NODE_PROPERTY',
    options() {
      return {
        prop: 'Pinned',
        id: context.node17,
        value: false
      }
    }
  }];
  const applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node0,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node1,
        properties: viewPackages
      }
    }
  }]
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
    }];
}
