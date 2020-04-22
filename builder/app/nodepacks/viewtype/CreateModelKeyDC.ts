
import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";
export default function (args = {}) {
  // node1
  if (!args.modelId) {
    throw new Error('missing model id');
  }
  // model
  if (!args.model) {
    throw 'missing model argument';
  }
  let context = {
    ...args,
    node1: args.modelId
  };
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };
  let result = [
    function (graph) {
      return [{

        "operation": "NEW_NODE",
        "options": {
          "callback": function (node) { context.node0 = node.id; }
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node0,
          "value": "data-chain"
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node0,
          "value": "ModelKey"
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "REMOVE_LINK_BETWEEN_NODES",
        "options": {
          "source": context.node0
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "ModelKey",
          "id": context.node0,
          "value": context.node1
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "ADD_LINK_BETWEEN_NODES",
        "options": {
          "target": context.node1,
          "source": context.node0,
          "properties": {
            "type": "ModelKey",
            "ModelKey": {}
          }
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node0,
          "value": "Get " + args.model + " Model Key"
        }
      }]
    }]
    ;
  let clearPinned = [{
    operation: 'CHANGE_NODE_PROPERTY',
    options: function () {
      return {
        prop: 'Pinned',
        id: context.node1,
        value: false
      }
    }
  }];
  let applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options: function () {
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
    function () {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context);
      }
      return [];
    }];
}
