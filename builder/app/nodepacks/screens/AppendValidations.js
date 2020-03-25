import {
  GetNodeProp,
  GetNodeTitle,
  ComponentApiKeys,
  GetModelPropertyChildren,
  ADD_LINK_BETWEEN_NODES,
  GetNodeById,
  $addComponentApiNodes,
  GetNodeByProperties
} from "../../actions/uiactions";
import {
  NodeProperties,
  LinkType,
  LinkProperties,
  LinkPropertyKeys,
  NodeTypes
} from "../../constants/nodetypes";
import { GetNodesLinkedTo, GetNodeLinkedTo } from "../../methods/graph_methods";
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import { ComponentTypeKeys } from "../../constants/componenttypes";
import CreateValidatorForObject from "../CreateValidatorForObject";

export default function AppendValidations({
  subcomponents,
  component,
  screen_option,
  InstanceUpdate = true,
  viewPackages,
  method
}) {
  if (!subcomponents) {
    throw new Error("no subcomponents");
  }
  const nonExecuteSubComponents = subcomponents.filter(
    x => !GetNodeProp(x, NodeProperties.ExecuteButton)
  );
  const executeButtons = subcomponents.filter(x => GetNodeProp(x, NodeProperties.ExecuteButton));
  const componentInternalValueApi = GetNodesLinkedTo(null, {
    id: component.id,
    link: LinkType.ComponentInternalApi,
    componentType: NodeTypes.ComponentApi
  }).find(componentApi => GetNodeTitle(componentApi) === ComponentApiKeys.Value);
  const result = [];
  const modelType = GetNodeProp(screen_option, NodeProperties.Model);
  const selector = modelType ? GetNodeByProperties({
    [NodeProperties.NODEType]: NodeTypes.Selector,
    [NodeProperties.Model]: modelType
  }) : null;

  if (nonExecuteSubComponents.length) {
    nonExecuteSubComponents.forEach(subcomponent => {
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
            }
            if (propertyId && propertyId.id) {
              propertyId = propertyId.id;
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
  if (executeButtons.length) {
    executeButtons.forEach(button => {
      const componentType = GetNodeProp(
        button,
        NodeProperties.ComponentType
      );
      let externalValidationApi;
      switch (componentType) {
        default:
          result.push((ggraph) => {
            const res = [];
            externalValidationApi = GetNodesLinkedTo(ggraph, {
              id: button.id,
              link: LinkType.ComponentExternalApi
            }).find(v => GetNodeTitle(v) === ComponentApiKeys.Error);
            if (!externalValidationApi) {
              res.push(...$addComponentApiNodes(button.id, ComponentApiKeys.Error, null, viewPackages))
            }
            return res;
          })
          result.push((ggraph) => {
            externalValidationApi = GetNodesLinkedTo(ggraph, {
              id: button.id,
              link: LinkType.ComponentExternalApi
            }).find(v => GetNodeTitle(v) === ComponentApiKeys.Error);
            if (externalValidationApi) {
              const modelId = GetNodeProp(screen_option, NodeProperties.Model);
              let validatorNode = null;

              return [
                ...CreateValidatorForObject({
                  model: GetNodeTitle(modelId),
                  modelId,
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
                }, {
                  operation: ADD_LINK_BETWEEN_NODES,
                  options() {
                    return {
                      target: componentInternalValueApi.id,
                      source: externalValidationApi.id,
                      properties: {
                        ...LinkProperties.ComponentExternalConnection,
                        [LinkPropertyKeys.InstanceUpdate]: InstanceUpdate
                      }
                    }
                  }
                },
                selector ? ({
                  operation: ADD_LINK_BETWEEN_NODES,
                  options() {
                    return {
                      source: externalValidationApi.id,
                      target: selector.id,
                      properties: { ...LinkProperties.SelectorLink }
                    };
                  }
                }) : null]
            }
            return []
          });
          break;
      }
    });
  }
  return result;
}
