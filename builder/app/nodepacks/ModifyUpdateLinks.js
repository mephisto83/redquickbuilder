import { uuidv4 } from "../utils/array";
import {
  GetNodesLinkedTo,
  GetLinkBetween,
  getNodeLinks
} from "../methods/graph_methods";
import {
  GetCurrentGraph,
  NodesByType,
  ViewTypes,
  UPDATE_LINK_PROPERTY,
  ComponentIsViewType,
  GetNodeProp,
  GetLinkProperty
} from "../actions/uiactions";
import {
  LinkType,
  NodeTypes,
  LinkProperties,
  LinkPropertyKeys,
  NodeProperties
} from "../constants/nodetypes";
export default function(args = { name: "Replace Name" }) {
  // node2

  // name
  let result = [];

  let graph = GetCurrentGraph();
  let eventMethods = NodesByType(null, NodeTypes.EventMethod);
  NodesByType(null, NodeTypes.ViewType)
    .filter(x => GetNodeProp(x, NodeProperties.ViewType) === ViewTypes.Update)
    .map(node => {
      getNodeLinks(graph, node.id)
        .filter(
          x =>
            GetLinkProperty(x, LinkPropertyKeys.TYPE) ===
            LinkType.ComponentExternalApi
        )
        .map(link => {
          result.push(function() {
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
    let components = GetNodesLinkedTo(graph, {
      id: eventMethod.id,
      link: LinkType.EventMethod,
      componentType: NodeTypes.ComponentNode
    }).filter(x => ComponentIsViewType(x, ViewTypes.Update, graph));

    if (components.length) {
      let eventMethodInstances = GetNodesLinkedTo(graph, {
        id: eventMethod.id,
        link: LinkType.EventMethodInstance
      });
      eventMethodInstances.map(eventMethodInstance => {
        let link = GetLinkBetween(
          eventMethod.id,
          eventMethodInstance.id,
          graph
        );

        // modify link
        if (link) {
          result.push(function() {
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
