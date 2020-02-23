import { ADD_NEW_NODE, GetNodeTitle } from "../actions/uiactions";
import {
  NodeTypes,
  NodeProperties,
  LinkProperties
} from "../constants/nodetypes";

export default function(args = { node, viewPackages }) {
  let { node, viewPackages } = args;
  return [
    {
      operation: ADD_NEW_NODE,
      options: function() {
        return {
          nodeType: NodeTypes.LifeCylceMethodInstance,
          parent: node,
          linkProperties: {
            properties: LinkProperties.LifeCylceMethodInstance
          },
          groupProperties: {},
          properties: {
            [NodeProperties.UIText]: `${GetNodeTitle(node)} Instance`,
            [NodeProperties.AutoDelete]: {
              properties: {
                [NodeProperties.NODEType]: NodeTypes.ComponentApiConnector
              }
            },
            ...viewPackages
          },
          callback: node => {
            if (args.callback) {
              args.callback(node);
            }
          }
        };
      }
    }
  ];
}
