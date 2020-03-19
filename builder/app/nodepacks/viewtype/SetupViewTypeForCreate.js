import { GetNodesLinkedTo, GetNodeLinkedTo } from "../../methods/graph_methods";
import { GetCurrentGraph, GetNodeProp, GetNodeTitle, ADD_LINK_BETWEEN_NODES, ComponentApiKeys } from "../../actions/uiactions";
import { LinkType, NodeProperties, NodeTypes, LinkProperties } from "../../constants/nodetypes";
import AddEvent from "../AddEvent";
import CreateModelKeyDC from './CreateModelKeyDC';
import { uuidv4 } from "../../utils/array";

export default function SetupViewTypeForCreate(args = {}) {
  const { node, eventType, eventTypeHandler } = args;
  const result = [];
  if (!node) {
    throw new Error('missing node');
  }
  if (!eventType) {
    throw new Error('missing eventType');
  }
  if (!eventTypeHandler) {
    throw new Error('missing eventTypeHandler');
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

  let existingDatachain = null;
  if (viewModelExternalNode) {
    existingDatachain = GetNodeLinkedTo(null, {
      id: viewModelExternalNode.id,
      link: LinkType.DataChainLink
    })
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
  const existingEventMethod = GetNodeLinkedTo(null, {
    id: node,
    link: LinkType.EventMethod,
    componentType: NodeTypes.EventMethod
  });

  if (!existingEventMethod) {
    result.push(
      ...AddEvent({
        component: node,
        viewPackages,
        eventType,
        eventTypeHandler: properties.length
          ? eventTypeHandler
          : false,
        property: properties.length ? properties[0].id : null
      })
    );
  }
  return result;
}
SetupViewTypeForCreate.title = 'Setup View Type For Create';
SetupViewTypeForCreate.description = `Setup view-type nodes for create. Adds an onChange event, and sets the dataChain for viewmodel.`
