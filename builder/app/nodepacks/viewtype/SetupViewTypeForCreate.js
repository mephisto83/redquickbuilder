import { GetNodesLinkedTo, GetNodeLinkedTo, GetLinkBetween } from "../../methods/graph_methods";
import { GetCurrentGraph, GetNodeProp, GetNodeTitle, ADD_LINK_BETWEEN_NODES, ComponentApiKeys, GetNodeByProperties, UPDATE_LINK_PROPERTY } from "../../actions/uiactions";
import { LinkType, NodeProperties, NodeTypes, LinkProperties, LinkPropertyKeys, UITypes } from "../../constants/nodetypes";
import AddEvent from "../AddEvent";
import CreateModelKeyDC from './CreateModelKeyDC';
import { uuidv4 } from "../../utils/array";
import CreateModelPropertyGetterDC from "../CreateModelPropertyGetterDC";

export default function SetupViewTypeForCreate(args = {}) {
  const { node, eventType, eventTypeHandler, callback, uiType = UITypes.ElectronIO } = args;
  const graph = GetCurrentGraph();
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
  const model = models[0];
  const property = properties[0];
  if (!property) {
    console.warn('no property');
    return result;
  }


  const component = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.DefaultViewType
  }).filter(x => GetNodeProp(x, NodeProperties.UIType) === uiType).find(v => GetNodeProp(v, NodeProperties.SharedComponent));
  if (component) {
    GetNodesLinkedTo(null, {
      id: component.id,
      link: LinkType.ListItem,
      componentType: NodeTypes.ComponentNode
    }).forEach(listItem => {
      GetNodesLinkedTo(null, {
        id: listItem.id,
        link: LinkType.Component,
        componentType: NodeTypes.ComponentNode
      }).forEach(subcomponent => {
        GetNodesLinkedTo(null, {
          id: subcomponent.id,
          link: LinkType.ComponentExternalApi,
          componentType: NodeTypes.ComponentExternalApi
        }).forEach(externalApi => {
          GetNodesLinkedTo(null, {
            id: externalApi.id,
            link: LinkType.ComponentExternalConnection,
            componentType: NodeTypes.ComponentApi
          }).forEach(externalConnection => {
            const link = GetLinkBetween(externalApi.id, externalConnection.id, graph);
            if (link) {
              result.push({
                operation: UPDATE_LINK_PROPERTY,
                options: {
                  prop: LinkPropertyKeys.InstanceUpdate,
                  value: false,
                  id: link.id
                }
              });
            }
          });
        });
      });
    });
  }

  const modelType = GetNodesLinkedTo(null, {
    id: property.id,
    link: LinkType.PropertyLink
  }).find(v => GetNodeProp(v, NodeProperties.NODEType) === NodeTypes.Model);

  const propertyModel = GetNodeLinkedTo(null, {
    id: property.id,
    link: LinkType.PropertyLink
  });
  const valueExternalNode = GetNodesLinkedTo(null, {
    id: node,
    link: LinkType.ComponentExternalApi,
    componentType: NodeTypes.ComponentExternalApi
  }).find(v => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.Value);


  let modelKeyDC = null;
  const externalNodes = GetNodesLinkedTo(null, {
    id: node,
    link: LinkType.ComponentExternalApi,
    componentType: NodeTypes.ComponentExternalApi
  })
  const viewModelExternalNode = externalNodes.find(v => GetNodeProp(v, NodeProperties.ValueName) === ComponentApiKeys.ViewModel);
  result.push(...externalNodes.map(externalNode => {
    const link = GetLinkBetween(node, externalNode.id, graph);
    if (link) {
      return {
        operation: UPDATE_LINK_PROPERTY,
        options: {
          prop: LinkPropertyKeys.InstanceUpdate,
          value: false,
          id: link.id
        }
      }
    }
    return null;
  }))
  result.push(...CreateModelKeyDC({
    model: `${GetNodeTitle(node)} ${GetNodeTitle(property)}`,
    modelId: model.id,
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

  let temp;

  result.push(
    ...CreateModelPropertyGetterDC({
      model: propertyModel.id,
      property: property.id,
      viewPackages,
      propertyName: `${GetNodeTitle(node)}${GetNodeTitle(property.id)}`,
      modelName: GetNodeTitle(propertyModel),
      callback: context => {
        temp = context.entry;
      }
    }),
    {
      operation: ADD_LINK_BETWEEN_NODES,
      options() {
        return {
          source: valueExternalNode.id,
          target: temp,
          properties: { ...LinkProperties.DataChainLink }
        };
      }
    })

  const selector = GetNodeByProperties({
    [NodeProperties.NODEType]: NodeTypes.Selector,
    [NodeProperties.Model]: modelType.id
  });

  if (selector) {
    result.push({
      operation: ADD_LINK_BETWEEN_NODES,
      options() {
        return {
          source: valueExternalNode.id,
          target: selector.id,
          properties: { ...LinkProperties.SelectorLink }
        };
      }
    })
  }

  result.push(
    ...AddEvent({
      component: node,
      viewPackages,
      eventType,
      eventTypeHandler: properties.length
        ? eventTypeHandler
        : false,
      property: properties.length ? properties[0].id : null,
      callback
    })
  );
  return result;
}
SetupViewTypeForCreate.title = 'Setup View Type For Create';
SetupViewTypeForCreate.description = `Setup view-type nodes for create. Adds an onChange event, and sets the dataChain for viewmodel.`
