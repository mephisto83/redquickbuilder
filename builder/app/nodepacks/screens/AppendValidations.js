import {
  GetNodeProp,
  GetNodeTitle,
  ComponentApiKeys,
  GetModelPropertyChildren,
  ADD_LINK_BETWEEN_NODES,
  GetNodeById
} from "../../actions/uiactions";
import {
  NodeProperties,
  LinkType,
  LinkProperties,
  LinkPropertyKeys
} from "../../constants/nodetypes";
import { GetNodesLinkedTo, GetNodeLinkedTo } from "../../methods/graph_methods";
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import { ComponentTypeKeys } from "../../constants/componenttypes";

export default function AppendValidations({
  subcomponents,
  screen_option,
  viewPackages,
  method
}) {
  if (!subcomponents) {
    throw new Error("no subcomponents");
  }
  const nonExecuteSubComponents = subcomponents.filter(
    x => !GetNodeProp(x, NodeProperties.ExecuteButton)
  );
  const result = [];

  if (nonExecuteSubComponents.length) {
    nonExecuteSubComponents.map(subcomponent => {
      const componentType = GetNodeProp(
        subcomponent,
        NodeProperties.ComponentType
      );
      let externalValidationApi;
      switch (componentType) {
        case ComponentTypeKeys.Button:
          break;
        default:
          externalValidationApi = GetNodesLinkedTo(null, {
            id: subcomponent.id,
            link: LinkType.ComponentExternalApi
          }).find(v => GetNodeTitle(v) === ComponentApiKeys.Error);
          if (externalValidationApi) {
            const modelId = GetNodeProp(screen_option, NodeProperties.Model);
            let propertyId = GetNodeProp(subcomponent, NodeProperties.Property);
            propertyId =
              propertyId ||
              GetNodeLinkedTo(null, {
                id: subcomponent.id,
                link: LinkType.PropertyLink,
                properties: {
                  [LinkPropertyKeys.ComponentProperty]: true
                }
              });
            if (!propertyId) {
              propertyId = GetModelPropertyChildren(modelId).find(
                v => GetNodeTitle(v) === GetNodeTitle(subcomponent)
              );
              if (propertyId) {
                propertyId = propertyId.id;
              }
            }
            if (!GetNodeById(propertyId)) {
              return;
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
                options() {
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
