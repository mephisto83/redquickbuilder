
  import { uuidv4 } from "../utils/array";
  import { NodeProperties } from "../constants/nodetypes";
  export default function(args = {}) {
    // node2,node3,node4,node5

      // 
      
    let context = {
      ...args,
node2: uuidv4() ,
node3: uuidv4() ,
node4: uuidv4() ,
node5: uuidv4() 
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
            "value": "{permissiontemplatename}"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "parameter"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "permission"
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
            "prop": "nodeType",
            "id": context.node0,
            "value": "PermissionTemplate"
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
            "nodeType": "ConditionTemplate",
            "parent": context.node0,
            "linkProperties": {
                "properties": {
                    "type": "ConditionTemplate",
                    "ConditionTemplate": {}
                }
            },
            "groupProperties": {},
            "properties": {
                "text": "Enumeration",
                "Condition": "Enumeration"
            },
            "callback": function(node, graph, group) { context.node1 = node.id;
      context.group0 = group;
    }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "NEW_LINK",
        "options": {
            "target": context.node2,
            "source": context.node0,
            "properties": {
                "type": "model-type-link",
                "model-type-link": {},
                "singleLink": true,
                "nodeTypes": [
                    "model"
                ]
            }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "NEW_LINK",
        "options": {
            "target": context.node3,
            "source": context.node0,
            "properties": {
                "type": "AgentLink",
                "AgentLink": {},
                "singleLink": true,
                "nodeTypes": [
                    "model"
                ],
                "properties": {
                    "isAgent": true
                }
            }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "NEW_LINK",
        "options": {
            "target": context.node2,
            "source": context.node1,
            "properties": {
                "type": "model-type-link",
                "model-type-link": {},
                "singleLink": true,
                "nodeTypes": [
                    "model"
                ]
            }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "NEW_LINK",
        "options": {
            "target": context.node3,
            "source": context.node1,
            "properties": {
                "type": "AgentLink",
                "AgentLink": {},
                "singleLink": true,
                "nodeTypes": [
                    "model"
                ]
            }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "NEW_LINK",
        "options": {
            "target": context.node4,
            "source": context.node1,
            "properties": {
                "type": "property-link",
                "property-link": {},
                "singleLink": true,
                "nodeTypes": [
                    "model-property"
                ]
            }
        }
    }]
    },

    function(graph) {
      return [{

        "operation": "NEW_LINK",
        "options": {
            "target": context.node5,
            "source": context.node1,
            "properties": {
                "type": "enumeration",
                "enumeration": {},
                "singleLink": true,
                "nodeTypes": [
                    "enumeration"
                ]
            }
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
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node3,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node4,
          value: false
        }
      }
    },
{
      operation: 'CHANGE_NODE_PROPERTY',
      options: function() {
          return {
          prop: 'Pinned',
          id: context.node5,
          value: false
        }
      }
    }];
    let applyViewPackages = [{
          operation: 'UPDATE_NODE_PROPERTY',
          options : function() {
            return {
              id: context.node0,
              properties: viewPackages
            }
          }
        },{
          operation: 'UPDATE_NODE_PROPERTY',
          options : function() {
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
      function() {
        if (context.callback) {
          context.entry = context.node0;
          context.callback(context);
        }
        return [];
      }];
  }