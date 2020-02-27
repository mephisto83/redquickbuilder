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
  GetCurrentGraph,
  GetNodeByProperties
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
  let screens = NodesByType(null, NodeTypes.Screen);
  let screenWithoutDataChainCollection = screens.filter(screen => {
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
  let sharedReferenceCollection = GetNodeByProperties(
    {
      [NodeProperties.SharedReferenceCollection]: true
    },
    graph
  );
  if (!sharedReferenceCollection) {
    result.push({
      operation: ADD_NEW_NODE,
      options: function() {
        return {
          nodeType: NodeTypes.DataChainCollection,
          properties: {
            [NodeProperties.UIText]: `Shared Components`,
            [NodeProperties.Pinned]: false,
            [NodeProperties.SharedReferenceCollection]: true
          },
          callback: node => {
            sharedReferenceCollection = node;
          }
        };
      }
    });
  }
  let componentNodes = NodesByType(null, NodeTypes.ComponentNode);
  let topComponents = componentNodes
    .map(d => getTopComponent(graph, d))
    .filter(x => GetNodeProp(x, NodeProperties.SharedComponent))
    .unique();

  componentNodes
    .sort((a, b) => {
      let a_lineage = getComponentLineage(graph, a);
      let b_lineage = getComponentLineage(graph, b);
      let intersects = a_lineage.intersection(b_lineage);
      if (intersects.length === 0) {
        return a_lineage.length - b_lineage.length;
      }
      if (a_lineage.length !== b_lineage.length) {
        return a_lineage.length - b_lineage.length;
      }
      return 0;
    })
    .map(component => {
      result.push(function(graph) {
        let externalApiDataChains = getComponentExternalApiDataChains(
          graph,
          component
        );
        let internalApiDataChains = getComponentInternalApiDataChains(
          graph,
          component
        );
        let eventApiDataChains = getComponentEventDataChains(graph, component);
        let reference = null;
        let steps = [];
        reference = getCollectionReference(graph, component);
        if (!reference) {
          steps.push({
            operation: ADD_NEW_NODE,
            options: function(graph) {
              let parentReference = getParentCollectionReference(
                graph,
                component
              );
              if (true || parentReference) {
                return {
                  nodeType: NodeTypes.DataChainCollection,
                  properties: {
                    [NodeProperties.UIText]: `${GetNodeTitle(component)}`,
                    [NodeProperties.Pinned]: false
                  },
                  links: [
                    {
                      target: (parentReference || sharedReferenceCollection).id,
                      linkProperties: {
                        properties: {
                          ...LinkProperties.DataChainCollection
                        }
                      }
                    },
                    {
                      linkProperties: {
                        properties: {
                          ...LinkProperties.DataChainCollectionReference
                        }
                      },
                      target: component.id
                    }
                  ].filter(x => x),
                  callback: node => {
                    reference = node;
                  }
                };
              } else {
                console.log(component.id);
                //  throw "parent should have a reference before getting here";
              }
            }
          });
        }
        return [
          ...steps,
          ...[
            ...externalApiDataChains,
            ...internalApiDataChains,
            ...eventApiDataChains
          ].map(dc => {
            return {
              operation: ADD_LINK_BETWEEN_NODES,
              options: function(graph) {
                reference =
                  reference || getCollectionReference(graph, component);
                return {
                  target: reference.id,
                  source: dc.id,
                  properties: { ...LinkProperties.DataChainCollection }
                };
              }
            };
          })
        ];
      });
    });
  screens.map(screen => {
    let screen_data_chains = [];
    let externalApiDataChains = getComponentExternalApiDataChains(
      graph,
      screen
    );
    let internalApiDataChains = getComponentInternalApiDataChains(
      graph,
      screen
    );
    let eventApiDataChains = getComponentEventDataChains(graph, screen);
    screen_data_chains.push(
      ...externalApiDataChains,
      ...internalApiDataChains,
      ...eventApiDataChains
    );
    let reference = null;
    result.push(
      ...[...screen_data_chains].map(dc => {
        return {
          operation: ADD_LINK_BETWEEN_NODES,
          options: function(graph) {
            reference = reference || getCollectionReference(graph, screen);
            return {
              target: reference.id,
              source: dc.id,
              properties: { ...LinkProperties.DataChainCollection }
            };
          }
        };
      })
    );
  });
  return result.filter(x => x);
}
function getComponentLineage(graph, node) {
  let parent = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.Component,
    direction: TARGET
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
  )[0];
  if (!parent) {
    parent = GetNodesLinkedTo(graph, {
      id: node.id,
      link: LinkType.Component,
      direction: TARGET
    }).filter(
      x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ScreenOption
    )[0];
  }
  if (!parent) {
    parent = GetNodesLinkedTo(graph, {
      id: node.id,
      link: LinkType.ListItem,
      direction: TARGET
    }).filter(
      x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
    )[0];
  }
  if (!parent) {
    parent = GetNodesLinkedTo(graph, {
      id: node.id,
      link: LinkType.ScreenOptions,
      direction: TARGET
    }).filter(
      x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Screen
    )[0];
  }
  if (parent) {
    return [...getComponentLineage(graph, parent), node.id];
  }
  return [node.id];
}
function getParentCollectionReference(graph, node) {
  node = getParentComponent(graph, node);
  if (node)
    return GetNodeLinkedTo(graph, {
      id: node.id,
      link: LinkType.DataChainCollectionReference
    });
  return null;
}
function getCollectionReference(graph, node) {
  return GetNodeLinkedTo(graph, {
    id: node.id,
    link: LinkType.DataChainCollectionReference
  });
}
function getParentComponent(graph, node) {
  let parent = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.Component,
    direction: TARGET
  }).filter(
    x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
  )[0];

  if (!parent) {
    parent = GetNodesLinkedTo(graph, {
      id: node.id,
      link: LinkType.ListItem,
      direction: TARGET
    }).filter(
      x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentNode
    )[0];
    if (parent) {
    }
  }

  return parent;
}
function getTopComponent(graph, node) {
  let parent = getParentComponent(graph, node);
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

function getComponentInternalApiDataChains(graph, node) {
  let result = [];
  GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.ComponentInternalApi,
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

function getComponentEventDataChains(graph, node) {
  let result = [];
  GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.EventMethod,
    componentType: NodeTypes.EventMethod
  }).map(res => {
    let instances = GetNodesLinkedTo(graph, {
      id: res.id,
      link: LinkType.EventMethodInstance,
      componentType: NodeTypes.EventMethodInstance
    });
    instances.map(res => {
      result.push(
        ...GetNodesLinkedTo(graph, {
          id: res.id,
          link: LinkType.DataChainLink,
          componentType: NodeTypes.DataChain
        }).filter(x => GetNodeProp(x, NodeProperties.EntryPoint))
      );
    });
  });
  return result;
}
