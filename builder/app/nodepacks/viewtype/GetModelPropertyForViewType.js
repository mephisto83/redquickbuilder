import { GetNodesLinkedTo } from "../../methods/graph_methods";
import { GetCurrentGraph, GetNodeProp } from "../../actions/uiactions";
import { LinkType, NodeProperties, NodeTypes } from "../../constants/nodetypes";

export default function GetModelPropertyForViewType(args = {}) {
  const { node } = args;
  const result = {};
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
  const models = GetNodesLinkedTo(GetCurrentGraph(), {
    id: node,
    link: LinkType.DefaultViewType
  }).filter(
    x =>
      GetNodeProp(x, NodeProperties.NODEType) ===
      NodeTypes.Model
  );
  if (!models || models.length > 1) {
    console.warn('too many models connected to view-type for this function')
    return result;
  }

  const modelType = GetNodesLinkedTo(null, {
    id: property.id,
    link: LinkType.PropertyLink
  }).find(v => GetNodeProp(v, NodeProperties.NODEType) === NodeTypes.Model);

  const model = models[0];
  result.model = model;
  result.property = property;
  result.modelType = modelType;
  return result;
}

GetModelPropertyForViewType.title = 'Gets the model and property that the shared component will stand in for.'
