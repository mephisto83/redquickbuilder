
  import { uuidv4 } from "../utils/array";
  export default function(args = {}) {
    // 

      // model_view_name, model_item

    let context = {
      ...args
    };
    let { viewPackages = {} } = args;
    let result = [
      function(graph) {
      return [{

        "operation": "NEW_NODE",
        "options": {
            "callback": function(node) { context.node0 = node.id; }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
            "id": context.node0,
            "value": "Load " + args.model_view_name + ""
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "data-chain"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "EntryPoint",
            "id": context.node0,
            "value": true
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "DataChainFunctionType",
            "id": context.node0,
            "value": "Pass"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "Pinned",
            "id": context.node0,
            "value": true
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
            "parent": context.node0,
            "nodeType": "data-chain",
            "groupProperties": {
                "GroupEntryNode": context.node0,
                "GroupExitNode": context.node0
            },
            "properties": {
                "Pinned": false,
                "ChainParent": context.node0
            },
            "linkProperties": {
                "properties": {
                    "type": "data-chain-link",
                    "data-chain-link": {}
                }
            },
            "links": [],
            "callback": function(node, graph, group) { context.node1 = node.id;
      context.group0 = group;
    }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "Pinned",
            "id": context.node1,
            "value": true
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "DataChainFunctionType",
            "id": context.node1,
            "value": "Lambda"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "Lambda",
            "id": context.node1,
            "value": "x => useParameters()"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
            "id": context.node1,
            "value": "read parameters"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
            "parent": context.node1,
            "nodeType": "data-chain",
            "groupProperties": {
                "id": context.group0
            },
            "properties": {
                "ChainParent": context.node1
            },
            "linkProperties": {
                "properties": {
                    "type": "data-chain-link",
                    "data-chain-link": {}
                }
            },
            "callback": function(node, graph, group) { context.node2 = node.id;
      
    }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "AsOutput",
            "id": context.node2,
            "value": true
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "AsOutput",
            "id": context.node2,
            "value": false
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "DataChainFunctionType",
            "id": context.node2,
            "value": "Lambda"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "Lambda",
            "id": context.node2,
            "value": "params => {\n   let { value, viewModel } = params;\n   let dispatch = GetDispatch();\n   let getState = GetState();\n   let currentItem = GetK(getState(), UI_MODELS, " + args.model_item + ", value);\n   if(currentItem) {\n\tdispatch(clearScreenInstance(viewModel, currentItem?currentItem.id:null, currentItem)); \n\tdispatch(updateScreenInstanceObject(viewModel,currentItem?currentItem.id:null, { ...currentItem }));\n   }\n\n   return params;\n}"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
            "id": context.node2,
            "value": "update local"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "AsOutput",
            "id": context.node2,
            "value": true
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "AsOutput",
            "id": context.node2,
            "value": false
        }
    }]
  }]
;
    let clearPinned = [{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node1,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node2,
          value: false
        }
      }
    }];
    return [...result,
      ...clearPinned,
      function() {
        if (context.callback) {
          context.entry = context.node0;
          context.callback(context);
        }
        return [];
      }];
  }