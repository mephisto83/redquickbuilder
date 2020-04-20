/* eslint-disable func-names */
/* eslint-disable no-shadow */

import { uuidv4 } from "../utils/array";
import { NodeProperties } from "../constants/nodetypes";
import { GetNodeProp } from "../actions/uiactions";

export default function NavigateBackEventInstanceToAction(args = {}) {
  // node0

  //
  if (!args.event) {
    throw new Error('missing event');
  }
  const eventType = GetNodeProp(args.event, NodeProperties.EventType);
  const context = {
    ...args,
    node0: args.event
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

        "operation": "ADD_NEW_NODE",
        "options": {
          "nodeType": "EventMethodInstance",
          "parent": context.node0,
          "groupProperties": {},
          "linkProperties": {
            "properties": {
              "type": "EventMethodInstance",
              "EventMethodInstance": {}
            }
          },
          "properties": {
            "text": `${eventType} Instance`,
            "Pinned": false,
            "AutoDelete": {
              "properties": {
                "nodeType": "component-api-connector"
              }
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

        "operation": "CHANGE_NODE_PROPERTY",
        "options": {
          "prop": "Pinned",
          "id": context.node1,
          "value": true
        }
      }]
    },

    function () {
      return [{

        "operation": "ADD_NEW_NODE",
        "options": {
          "nodeType": "NavigationAction",
          "linkProperties": {
            "properties": {
              "type": "NavigationMethod",
              "NavigationMethod": {}
            }
          },
          "parent": context.node1,
          "properties": {
            "text": "GoBack",
            "NavigationAction": "GoBack"
          },
          "callback": function (node) { context.node2 = node.id; }
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
  }];
  const applyViewPackages = [{
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node1,
        properties: viewPackages
      }
    }
  }, {
    operation: 'UPDATE_NODE_PROPERTY',
    options() {
      return {
        id: context.node2,
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
