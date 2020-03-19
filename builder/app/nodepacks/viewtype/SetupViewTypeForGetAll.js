import { GetNodesLinkedTo, GetNodeLinkedTo, existsLinkBetween } from "../../methods/graph_methods";
import { GetCurrentGraph, GetNodeProp, GetNodeTitle, ADD_LINK_BETWEEN_NODES, ComponentApiKeys, REMOVE_LINK_BETWEEN_NODES } from "../../actions/uiactions";
import { LinkType, NodeProperties, NodeTypes, LinkProperties } from "../../constants/nodetypes";
import AddEvent from "../AddEvent";
import CreateModelKeyDC from './CreateModelKeyDC';
import { uuidv4 } from "../../utils/array";

export default function SetupViewTypeForGetAll(args = {}) {
  const { node } = args;
  const result = [];
  if (!node) {
    throw new Error('missing node');
  }
  let {
    viewPackages
  } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  const properties = GetNodesLinkedTo(GetCurrentGraph(), {
    id: node,
    link: LinkType.DefaultViewType
  }).filter(
    x =>
      GetNodeProp(x, NodeProperties.NODEType) ===
      NodeTypes.Property
  );
  const property = properties[0];
  if (!property) {
    console.warn('no property');
    return result;
  }
  let modelKeyDC = null;
  const viewModelExternalNode = GetNodesLinkedTo(null, {
    id: node,
    link: LinkType.ComponentExternalApi,
    componentType: NodeTypes.ComponentExternalApi
  }).find(v => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.ViewModel);

  const valueExternalNode = GetNodesLinkedTo(null, {
    id: node,
    link: LinkType.ComponentExternalApi,
    componentType: NodeTypes.ComponentExternalApi
  }).find(v => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.Value);

  let existingDatachain = null;
  if (viewModelExternalNode) {
    existingDatachain = GetNodeLinkedTo(null, {
      id: viewModelExternalNode.id,
      link: LinkType.DataChainLink
    })
  }
  if (valueExternalNode) {
    const selector = GetNodeLinkedTo(null, {
      id: valueExternalNode.id,
      link: LinkType.SelectorLink
    });
    if (selector) {
      result.push({
        operation: REMOVE_LINK_BETWEEN_NODES,
        options: {
          target: selector.id,
          source: valueExternalNode.id
        }
      })
    }
  }
  if (!existingDatachain) {
    result.push(...CreateModelKeyDC({
      model: `${GetNodeTitle(node)} ${GetNodeTitle(property)}`,
      modelId: property.id,
      viewPackages,
      callback: modelKeyContext => {
        modelKeyDC = modelKeyContext.entry;
      }
    }), {
      operation: ADD_LINK_BETWEEN_NODES,
      options() {
        if (viewModelExternalNode) {
          return {
            target: modelKeyDC,
            source: viewModelExternalNode.id,
            properties: { ...LinkProperties.DataChainLink }
          }
        }
        return false;
      }
    });
  }

  return result;
}
SetupViewTypeForGetAll.title = 'Setup View Type For GetAll';
SetupViewTypeForGetAll.description = `Setup view-type nodes for create. Sets the dataChain for viewmodel.`
