/* eslint-disable no-unused-vars */
/* eslint-disable func-names */

import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";

export default function (args: any = {}) {
  //

  // model
  if (!args.model) {
    throw 'missing model argument';
  }
  const context = {
    ...args
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
          "callback": function (node: { id: any; }) { context.node0 = node.id; }
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node0,
          "value": "Get " + args.model + " Object"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "nodeType",
          "id": context.node0,
          "value": "data-chain"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "EntryPoint",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "AsOutput",
          "id": context.node0,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node0,
          "value": "Lambda"
        }
      }]
    },

    function () {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Lambda",
          "id": context.node0,
          "value": "(x: any) => x ? x.object : null"
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
    }]
    ;
  const clearPinned: any[] = [];
  const applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
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
    function (graph: any) {
      if (context.callback) {
        context.entry = context.node0;
        context.callback(context, graph);
      }
      return [];
    }];
}
