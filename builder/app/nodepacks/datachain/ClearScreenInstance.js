/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
import { GetModelPropertyChildren, UPDATE_NODE_PROPERTY, ADD_LINK_BETWEEN_NODES, NO_OP, ADD_TO_GROUP, GetNodeTitle } from "../../actions/uiactions";
import ClearScreenInstanceLocalStateProperty from "../partial/ClearScreenInstanceLocalStateProperty";
import { NodeProperties, LinkProperties } from "../../constants/nodetypes";
import ClearScreenInstanceUpdateLocalStateProperty from "../partial/ClearScreenInstanceUpdateLocalStateProperty";

export default function ClearScreenInstance(args) {
  const { viewPackages, model, update, title } = args;
  const func = update ? ClearScreenInstanceUpdateLocalStateProperty : ClearScreenInstanceLocalStateProperty;
  const modelProperties = GetModelPropertyChildren(model, { skipLogicalChildren: true });

  const result = [];
  let lastChain = null;
  let entry = null;
  let groupId = null;
  modelProperties.forEach((modelProperty, index) => {
    let modelPropertyContext = null;
    result.push(...func({
      viewPackages,
      model,
      property: modelProperty.id,
      callback: (temp) => {
        modelPropertyContext = temp;
      }
    }), (gg) => {
      const res = [];
      if (index === modelProperties.length - 1) {
        res.push({
          operation: UPDATE_NODE_PROPERTY,
          options: {
            id: modelPropertyContext.entry,
            properties: {
              [NodeProperties.AsOutput]: true
            }
          }
        });
      }
      if (groupId) {
        res.push({
          operation: ADD_TO_GROUP,
          options: {
            id: modelPropertyContext.entry,
            groupProperties: { id: groupId }
          }
        })
      }
      if (lastChain && lastChain === entry) {
        res.push({
          operation: ADD_TO_GROUP,
          options: {
            parent: lastChain,
            id: modelPropertyContext.entry,
            groupCallback: (temp) => {
              groupId = temp;
            }
          }
        })
      }
      if (lastChain) {
        const temp = lastChain;
        lastChain = modelPropertyContext.entry
        res.push({
          operation: UPDATE_NODE_PROPERTY,
          options: {
            id: modelPropertyContext.entry,
            properties: {
              [NodeProperties.ChainParent]: temp
            }
          }
        }, {
          operation: ADD_LINK_BETWEEN_NODES,
          options: {
            source: temp,
            target: modelPropertyContext.entry,
            properties: { ...LinkProperties.DataChainLink }
          }
        });


        return res;
      }
      lastChain = modelPropertyContext.entry;
      entry = modelPropertyContext.entry;
      return [{
        operation: UPDATE_NODE_PROPERTY,
        options: {
          id: modelPropertyContext.entry,
          properties: {
            [NodeProperties.EntryPoint]: true,
            [NodeProperties.UIText]: title || GetNodeTitle(modelPropertyContext.entry, gg)
          }
        }
      }]
    })
  });
  result.push({
    operation: NO_OP,
    options() {
      if (args.callback) {
        args.callback({ entry })
      }
    }
  })
  return result;
}
