import {
  GetNodeProp,
  GetNodeTitle,
  ComponentApiKeys,
  GetModelPropertyChildren,
  ADD_LINK_BETWEEN_NODES
} from "../../actions/uiactions";
import {
  NodeProperties,
  LinkType,
  LinkProperties
} from "../../constants/nodetypes";
import { GetNodesLinkedTo } from "../../methods/graph_methods";
import CreateValidatorForProperty from "../CreateValidatorForProperty";

export default function AppendValidations({
  subcomponents,
  screen_option,
  viewPackages,
  method
}) {
  if (!subcomponents) {
    throw "no subcomponents";
  }
  let result = [];

  if (subcomponents.length) {
    subcomponents.map(subcomponent => {
      let componentType = GetNodeProp(
        subcomponent,
        NodeProperties.ComponentType
      );
      switch (componentType) {
        default:
          let externalValidationApi = GetNodesLinkedTo(null, {
            id: subcomponent.id,
            link: LinkType.ComponentExternalApi
          }).find(v => GetNodeTitle(v) === ComponentApiKeys.Error);
          if (externalValidationApi) {
            let modelId = GetNodeProp(screen_option, NodeProperties.Model);
            let propertyId = GetNodeProp(subcomponent, NodeProperties.Property);
            if (!propertyId) {
              propertyId = GetModelPropertyChildren(modelId).find(
                v => GetNodeTitle(v) === GetNodeTitle(subcomponent)
              );
              if (propertyId) {
                propertyId = propertyId.id;
              }
            }
            let validatorNode = null;
            result.push(
              ...CreateValidatorForProperty({
                modelText: GetNodeTitle(modelId),
                propertyText: GetNodeTitle(propertyId),
                model: modelId,
                property: propertyId,
                method,
                viewPackages,
                callback: context => {
                  validatorNode = context.entry;
                }
              }),
              {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function() {
                  return {
                    target: validatorNode,
                    source: externalValidationApi.id,
                    properties: { ...LinkProperties.DataChainLink }
                  };
                }
              }
            );
          }
          break;
      }
    });
  }

  return result;
}
