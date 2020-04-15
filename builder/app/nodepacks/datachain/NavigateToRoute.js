
import { uuidv4 } from "../../utils/array";
import { NodeProperties } from "../../constants/nodetypes";
export default function NavigateToRoute(args = {}) {
  //

  // menunavigate
  if (!args.menunavigate) {
    throw new Error('missing menunavigate argument');
  }
  let context = {
    ...args
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

        "operation": "CHANGE_NODE_TEXT",
        "options": {
          "id": context.node0,
          "value": "" + args.menunavigate + ""
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
          "prop": NodeProperties.UIType,
          "id": context.node0,
          "value": args.uiType
        }
      }]
    },


    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainTypeName",
          "id": context.node0,
          "value": "NavigateToRoute"
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node0,
          "value": "List Reference"
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "DataChainFunctionType",
          "id": context.node0,
          "value": "Lambda"
        }
      }]
    },

    function (graph) {
      return [{

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Lambda",
          "id": context.node0,
          "value": "(id: string) => {\n  navigate.Go({ route: routes[id] })(GetDispatch(), GetState());\n}"
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
    }]
    ;
  let clearPinned = [];
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
