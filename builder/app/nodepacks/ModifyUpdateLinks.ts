import { uuidv4 } from "../utils/array";
import {
  GetNodesLinkedTo,
  GetLinkBetween,
  getNodeLinks
} from "../methods/graph_methods";
import {
  GetCurrentGraph,
  NodesByType,
  UPDATE_LINK_PROPERTY,
  ComponentIsViewType,
  GetNodeProp,
  GetLinkProperty
} from "../actions/uiActions";
import {
  LinkType,
  NodeTypes,
  LinkProperties,
  LinkPropertyKeys,
  NodeProperties
} from "../constants/nodetypes";
import { ViewTypes } from "../constants/viewtypes";

export default function (args = { name: "Replace Name" }) {
  // node2

  // name
  const result = [];

  const graph = GetCurrentGraph();
  const eventMethods = NodesByType(null, NodeTypes.EventMethod);
  NodesByType(null, NodeTypes.ViewType)
    .filter(x => GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Update)
    .forEach(node => {
      getNodeLinks(graph, node.id)
        .filter(
          x =>
            GetLinkProperty(x, LinkPropertyKeys.TYPE) ===
            LinkType.ComponentExternalApi
        )
        .forEach(link => {
          result.push(() => {
            return [
              {
                operation: UPDATE_LINK_PROPERTY,
                options: {
                  prop: LinkPropertyKeys.InstanceUpdate,
                  value: true,
                  id: link.id
                }
              }
            ];
          });
        });
    });
  eventMethods.map(eventMethod => {
    const components = GetNodesLinkedTo(graph, {
      id: eventMethod.id,
      link: LinkType.EventMethod,
      componentType: NodeTypes.ComponentNode
    }).filter(x => ComponentIsViewType(x, ViewTypes.Update, graph));

    if (components.length) {
      const eventMethodInstances = GetNodesLinkedTo(graph, {
        id: eventMethod.id,
        link: LinkType.EventMethodInstance
      });
      eventMethodInstances.forEach(eventMethodInstance => {
        const link = GetLinkBetween(
          eventMethod.id,
          eventMethodInstance.id,
          graph
        );

        // modify link
        if (link) {
          result.push(() => {
            return [
              {
                operation: UPDATE_LINK_PROPERTY,
                options: {
                  prop: LinkPropertyKeys.InstanceUpdate,
                  value: true,
                  id: link.id
                }
              }
            ];
          });
        }
      });
    }
  });

  return result;
}
