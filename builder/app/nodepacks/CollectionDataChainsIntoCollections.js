import { uuidv4 } from "../utils/array";
import {
  NodeProperties,
  NodeTypes,
  LinkType,
  LinkProperties
} from "../constants/nodetypes";
import {
  NodesByType,
  GetNodeTitle,
  ADD_NEW_NODE,
  GetNodeProp,
  ADD_LINK_BETWEEN_NODES,
  GetCurrentGraph
} from "../actions/uiactions";
import {
  GetNodesLinkedTo,
  GetNodeLinkedTo,
  TARGET,
  SOURCE
} from "../methods/graph_methods";
import { NodeType } from "../components/titles";
export default function(args = {}) {
  let result = [];
  let graph = GetCurrentGraph();
  let screenWithoutDataChainCollection = NodesByType(
    null,
    NodeTypes.Screen
  ).filter(screen => {
    return !GetNodesLinkedTo(graph, {
      id: screen.id,
      link: LinkType.DataChainCollectionReference
    }).length;
  });

  screenWithoutDataChainCollection.map(screen => {
    let temp = {};
    let screenoptions = GetNodesLinkedTo(graph, {
      id: screen.id,
      link: LinkType.ScreenOptions
    });
    result.push({
      operation: ADD_NEW_NODE,
      options: function() {
        return {
          nodeType: NodeTypes.DataChainCollection,
          linkProperties: {
            properties: {
              ...LinkProperties.DataChainCollectionReference
            }
          },
          parent: screen.id,
          properties: {
            [NodeProperties.UIText]: `${GetNodeTitle(screen)}`,
            [NodeProperties.Pinned]: false
          },
          callback: node => {
            temp.screen = node;
          }
        };
      }
    });

    screenoptions.map(screenoption => {
      if (
        GetNodesLinkedTo(graph, {
          id: screenoption.id,
          link: LinkType.DataChainCollectionReference
        }).length
      ) {
        return null;
      }

      result.push(function(graph) {
        let screen = GetNodeLinkedTo(graph, {
          id: screenoption.id,
          link: LinkType.ScreenOptions
        });
        let collectionReference;
        if (screen) {
          collectionReference = GetNodeLinkedTo(graph, {
            id: screen.id,
            link: LinkType.DataChainCollectionReference
          });
        }
        let temp;
        return [
          {
            operation: ADD_NEW_NODE,
            options: function(graph) {
              return {
                nodeType: NodeTypes.DataChainCollection,
                linkProperties: {
                  properties: {
                    ...LinkProperties.DataChainCollectionReference
                  }
                },
                parent: screenoption.id,
                properties: {
                  [NodeProperties.UIText]: `${GetNodeTitle(screenoption)}`,
                  [NodeProperties.Pinned]: false
                },
                callback: node => {
                  temp = node;
                }
              };
            }
          },
          collectionReference
            ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options: function() {
                  return {
                    source: temp.id,
                    target: collectionReference.id,
                    properties: { ...LinkProperties.DataChainCollection }
                  };
                }
              }
            : null
        ];
      });

      let components = GetNodesLinkedTo(graph, {
        id: screenoption.id,
        link: LinkType.Component
      });

      components.map(component => {
        let nodes_linked = GetNodesLinkedTo(graph, {
          id: component.id,
          link: LinkType.DataChainCollectionReference
        });
        if (nodes_linked.length) {
          return null;
        }

        result.push(function(graph) {
          let screenoption = GetNodesLinkedTo(graph, {
            id: component.id,
            link: LinkType.Component
          }).filter(
            x =>
              GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption
          )[0];
          let collectionReference;
          if (screenoption) {
            collectionReference = GetNodeLinkedTo(graph, {
              id: screenoption.id,
              link: LinkType.DataChainCollectionReference
            });
          }
          let temp;
          return [
            {
              operation: ADD_NEW_NODE,
              options: function(graph) {
                return {
                  nodeType: NodeTypes.DataChainCollection,
                  linkProperties: {
                    properties: {
                      ...LinkProperties.DataChainCollectionReference
                    }
                  },
                  parent: component.id,
                  properties: {
                    [NodeProperties.UIText]: `${GetNodeTitle(component)}`,
                    [NodeProperties.Pinned]: false
                  },
                  callback: node => {
                    temp = node;
                  }
                };
              }
            },
            collectionReference
              ? {
                  operation: ADD_LINK_BETWEEN_NODES,
                  options: function() {
                    return {
                      source: temp.id,
                      target: collectionReference.id,
                      properties: { ...LinkProperties.DataChainCollection }
                    };
                  }
                }
              : null
          ];
        });
      });
    });
  });
  let componentNodes = NodesByType(null, NodeTypes.ComponentNode);
  componentNodes.map(component => {
    result.push(function(graph) {
      let reference = getComponentNodeCollectionReference(graph, component);
      let externalApiDataChains = getComponentExternalApiDataChains(
        graph,
        component
      );
      if (!reference) {
        return [];
      }
      return [
        ...externalApiDataChains.map(dc => {
          return {
            operation: ADD_LINK_BETWEEN_NODES,
            options: {
              target: reference.id,
              source: dc.id,
              properties: { ...LinkProperties.DataChainCollection }
            }
          };
        })
      ];
    });
  });
  return result.filter(x => x);
}

function getTopComponent(graph, node) {
  let parent = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.Component,
    direction: TARGET
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
  )[0];

  if (parent) {
    return getTopComponent(graph, parent);
  }
  return node;
}

function getComponentNodeCollectionReference(graph, node) {
  node = getTopComponent(graph, node);
  return GetNodeLinkedTo(graph, {
    id: node.id,
    link: LinkType.DataChainCollectionReference
  });
}
function getComponentExternalApiDataChains(graph, node) {
  let result = [];
  GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.ComponentExternalApi,
    direction: SOURCE
  }).map(res => {
    result.push(
      ...GetNodesLinkedTo(graph, {
        id: res.id,
        link: LinkType.DataChainLink,
        direction: SOURCE
      }).filter(x => GetNodeProp(x, NodeProperties.EntryPoint))
    );
  });
  return result;
}
