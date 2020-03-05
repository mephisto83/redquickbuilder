
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // 

      // 
      
    let context = {
      ...args
    };
    let {
      viewPackages
    } = args;
    viewPackages = {
      [NodeProperties.ViewPackage]: uuidv4(),
      ...(viewPackages||{})
    };
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
            "value": "Fetch Service"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "screen"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "selector"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "service-interface"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "FetchService"
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
  }]
;
    let clearPinned = [];
    let applyViewPackages = [{
          operation: 'UPDATE_NODE_PROPERTY',
          options : function() {
            return {
              id: context.node0,
              properties: viewPackages
            }
          }
        }]
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
      }];
  }