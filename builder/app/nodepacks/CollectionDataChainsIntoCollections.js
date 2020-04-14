import { uuidv4 } from "../utils/array";
import {
  NodeProperties,
  NodeTypes,
  LinkType,
  LinkProperties,
  UITypes
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
export default function (args = {}) {
  const result = [];
  const graph = GetCurrentGraph();
  const screens = NodesByType(null, NodeTypes.Screen);
  const screenWithoutDataChainCollection = screens;
  // .filter(screen => {
  //   return !GetNodesLinkedTo(graph, {
  //     id: screen.id,
  //     link: LinkType.DataChainCollectionReference
  //   }).length;
  // });

  screenWithoutDataChainCollection.map(screen => {
    const temp = {};
    const screenoptions = GetNodesLinkedTo(graph, {
      id: screen.id,
      link: LinkType.ScreenOptions
    });
    if (
      !GetNodesLinkedTo(graph, {
        id: screen.id,
        link: LinkType.DataChainCollectionReference
      }).length
    ) {
      result.push({
        operation: ADD_NEW_NODE,
        options() {
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
    }

    screenoptions.map(screenoption => {
      result.push((graph) => {
        const add_screenoption_reference = !GetNodesLinkedTo(graph, {
          id: screenoption.id,
          link: LinkType.DataChainCollectionReference
        }).length;

        const screen = GetNodeLinkedTo(graph, {
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
          add_screenoption_reference
            ? {
              operation: ADD_NEW_NODE,
              options(graph) {
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
            }
            : false,
          collectionReference && add_screenoption_reference
            ? {
              operation: ADD_LINK_BETWEEN_NODES,
              options() {
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

      const components = GetNodesLinkedTo(graph, {
        id: screenoption.id,
        link: LinkType.Component
      });

      components.map(component => {
        const nodes_linked = GetNodesLinkedTo(graph, {
          id: component.id,
          link: LinkType.DataChainCollectionReference
        });
        if (nodes_linked.length) {
          return null;
        }

        result.push((graph) => {
          const screenoption = GetNodesLinkedTo(graph, {
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
          let subtemp;
          return [
            {
              operation: ADD_NEW_NODE,
              options() {
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
                    subtemp = node;
                  }
                };
              }
            },
            collectionReference
              ? {
                operation: ADD_LINK_BETWEEN_NODES,
                options() {
                  return {
                    source: subtemp.id,
                    target: collectionReference.id,
                    properties: { ...LinkProperties.DataChainCollection }
                  };
                }
              }
              : null
          ];
        });
      });

      GetNodesLinkedTo(graph, {
        id: screenoption.id,
        link: LinkType.LifeCylceMethod
      })
        .map(lifeCycleMethod => {
          const res = GetNodesLinkedTo(graph, {
            id: lifeCycleMethod.id,
            link: LinkType.LifeCylceMethodInstance
          }).map(lifecylceInstanceMethod => {
            const chains = [...GetNodesLinkedTo(graph, {
              id: lifecylceInstanceMethod.id,
              link: LinkType.DataChainLink
            }).filter(chain => {
              return GetNodesLinkedTo(graph, {
                id: chain.id
              }).filter(
                x =>
                  GetNodeProp(x, NodeProperties.NODEType) !==
                  NodeTypes.DataChain
              ).length;
            }), ...GetNodesLinkedTo(graph, {
              id: lifecylceInstanceMethod.id,
              link: LinkType.PreDataChainLink
            }).filter(chain => {
              return GetNodesLinkedTo(graph, {
                id: chain.id
              }).filter(
                x =>
                  GetNodeProp(x, NodeProperties.NODEType) !==
                  NodeTypes.DataChain
              ).length;
            }), ...GetNodesLinkedTo(graph, {
              id: lifecylceInstanceMethod.id,
              link: LinkType.CallDataChainLink
            }).filter(chain => {
              return GetNodesLinkedTo(graph, {
                id: chain.id
              }).filter(
                x =>
                  GetNodeProp(x, NodeProperties.NODEType) !==
                  NodeTypes.DataChain
              ).length;
            })];
            return chains;
          });
          return res;
        })
        .flatten()
        .forEach(chain => {
          result.push({
            operation: ADD_LINK_BETWEEN_NODES,
            options(ggraph) {
              let screenOptionCollectionReference;
              if (screenoption) {
                screenOptionCollectionReference = GetNodeLinkedTo(ggraph, {
                  id: screenoption.id,
                  link: LinkType.DataChainCollectionReference
                });
              }
              return {
                target: screenOptionCollectionReference.id,
                source: chain.id,
                properties: { ...LinkProperties.DataChainCollection }
              };
            }
          });
        });
    });
  });
  [
    UITypes.ElectronIO,
    UITypes.ReactNative,
    UITypes.ReactWeb
  ].forEach(uiType => {

    let sharedReferenceCollection = GetNodeByProperties({
      [NodeProperties.SharedReferenceCollection]: true,
      [NodeProperties.UIType]: uiType
    },
      graph
    );
    if (!sharedReferenceCollection) {
      result.push({
        operation: ADD_NEW_NODE,
        options() {
          return {
            nodeType: NodeTypes.DataChainCollection,
            properties: {
              [NodeProperties.UIText]: `Shared Components ${uiType}`,
              [NodeProperties.Pinned]: false,
              [NodeProperties.UIType]: uiType,
              [NodeProperties.SharedReferenceCollection]: true
            },
            callback: node => {
              sharedReferenceCollection = node;
            }
          };
        }
      });
    }
    const componentNodes = NodesByType(null, NodeTypes.ComponentNode).filter(x => {
      return GetNodeProp(x, NodeProperties.UIType) === uiType;
    });
    componentNodes
      .map(d => getTopComponent(graph, d))
      .filter(x => GetNodeProp(x, NodeProperties.SharedComponent))
      .unique();

    componentNodes
      .sort((a, b) => {
        const a_lineage = getComponentLineage(graph, a);
        const b_lineage = getComponentLineage(graph, b);
        const intersects = a_lineage.intersection(b_lineage);
        if (intersects.length === 0) {
          return a_lineage.length - b_lineage.length;
        }
        if (a_lineage.length !== b_lineage.length) {
          return a_lineage.length - b_lineage.length;
        }
        return 0;
      })
      .forEach(component => {
        result.push(function (graph) {
          const externalApiDataChains = getComponentExternalApiDataChains(
            graph,
            component
          );
          const internalApiDataChains = getComponentInternalApiDataChains(
            graph,
            component
          );
          const eventApiDataChains = getComponentEventDataChains(graph, component);
          let reference = null;
          const steps = [];
          reference = getCollectionReference(graph, component);
          if (!reference) {
            steps.push({
              operation: ADD_NEW_NODE,
              options(graph) {
                const parentReference = getParentCollectionReference(
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
                options(graph) {
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
    screens.forEach(screen => {
      const screen_data_chains = [];
      const externalApiDataChains = getComponentExternalApiDataChains(
        graph,
        screen
      );
      const internalApiDataChains = getComponentInternalApiDataChains(
        graph,
        screen
      );
      const eventApiDataChains = getComponentEventDataChains(graph, screen);
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
            options(graph) {
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
  const parent = getParentComponent(graph, node);
  if (parent) {
    return getTopComponent(graph, parent);
  }
  return node;
}
function getComponentExternalApiDataChains(graph, node) {
  const result = [];
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
  const result = [];
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
  const result = [];
  GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.EventMethod,
    componentType: NodeTypes.EventMethod
  }).map(res => {
    const instances = GetNodesLinkedTo(graph, {
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
