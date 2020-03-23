import { LinkType, NodeTypes, NodeProperties, LinkPropertyKeys, LinkProperties } from "../../constants/nodetypes";
import { GetNodeLinkedTo, GetNodesLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph, GetNodeProp, GetNodeById, GetNodeTitle, ComponentApiKeys,
  $addComponentApiNodes, GetModelPropertyChildren, ADD_LINK_BETWEEN_NODES, GetNodeByProperties
} from "../../actions/uiactions";
import { ComponentTypeKeys } from "../../constants/componenttypes";
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import GetModelPropertyForViewType from "./GetModelPropertyForViewType";

export default function AppendViewTypeValidation(args) {
  const { node, viewPackages, method } = args;
  const startGraph = GetCurrentGraph();
  const result = [];
  const component = GetNodeLinkedTo(startGraph, {
    id: node,
    link: LinkType.DefaultViewType,
    componentType: NodeTypes.ComponentNode
  });
  const { model, property, modelType } = GetModelPropertyForViewType({ node });
  if (!component) {
    console.warn('no component');
  }


  const selector = GetNodeByProperties({
    [NodeProperties.NODEType]: NodeTypes.Selector,
    [NodeProperties.Model]: modelType.id
  });
  if (component) {
    const componentType = GetNodeProp(component, NodeProperties.ComponentType);

    let externalValidationApi;
    switch (componentType) {
      case ComponentTypeKeys.Button:
        break;
      default:
        result.push((graph) => {

          externalValidationApi = GetNodesLinkedTo(graph, {
            id: node.id,
            link: LinkType.ComponentExternalApi
          }).find(v => GetNodeTitle(v) === ComponentApiKeys.Error);
          if (!externalValidationApi) {
            return $addComponentApiNodes(node, ComponentApiKeys.Error, null, viewPackages)
          }
          return [];
        });
        result.push((graph) => {

          externalValidationApi = GetNodesLinkedTo(graph, {
            id: node,
            link: LinkType.ComponentExternalApi
          }).find(v => GetNodeTitle(v) === ComponentApiKeys.Error);

          if (externalValidationApi) {
            const modelId = model.id;
            let propertyId = property.id;
            propertyId =
              propertyId ||
              GetNodeLinkedTo(null, {
                id: node,
                link: LinkType.PropertyLink,
                properties: {
                  [LinkPropertyKeys.ComponentProperty]: true
                }
              });
            if (!propertyId) {
              propertyId = GetModelPropertyChildren(modelId).find(
                v => GetNodeTitle(v) === GetNodeTitle(node)
              );
            }
            if (propertyId && propertyId.id) {
              propertyId = propertyId.id;
            }
            if (!GetNodeById(propertyId)) {
              return;
            }
            let validatorNode = null;
            return [...CreateValidatorForProperty({
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
        });
        break;
    }

  }

  return result;
}
