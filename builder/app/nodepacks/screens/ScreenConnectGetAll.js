import { GetNodesLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  addInstanceFunc,
  ADD_NEW_NODE,
  ADD_LINK_BETWEEN_NODES,
  GetNodeTitle,
  UPDATE_NODE_PROPERTY,
  ComponentApiKeys
} from "../../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkProperties,
  NodeTypes
} from "../../constants/nodetypes";
import {
  ComponentLifeCycleEvents,
  ComponentEvents,
  ComponentTypeKeys
} from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../AddLifeCylcleMethodInstance";
import CreateNavigateToScreenDC from "../CreateNavigateToScreenDC";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import StoreModelArrayStandard from "../StoreModelArrayStandard";
import AppendValidations from "./AppendValidations";

export default function ScreenConnectGetAll(args = { method, node }) {
  let { node, method, navigateTo } = args;
  if (!node) {
    throw "no node";
  }
  if (!method) {
    throw "no method";
  }

  const graph = GetCurrentGraph();
  const screen_options = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ScreenOptions
  });
  const result = [];
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  screen_options.map(screen_option => {
    const components = GetNodesLinkedTo(graph, {
      id: screen_option.id,
      link: LinkType.Component
    });

    components.map(component => {
      const internalComponentApi = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.ComponentInternalApi
      });

      internalComponentApi
        .filter(
          x =>
            GetNodeProp(component, NodeProperties.ComponentType) ===
            ComponentTypeKeys.List
        )
        .filter(x =>
          [
            ComponentApiKeys.Value,
            ComponentApiKeys.Index,
            ComponentApiKeys.Item,
            ComponentApiKeys.Separators
          ].some(v => v === GetNodeTitle(x))
        )
        .map(internal => {
          result.push(() => {
            return [
              {
                operation: UPDATE_NODE_PROPERTY,
                options: {
                  id: internal.id,
                  properties: {
                    [NodeProperties.AsLocalContext]: true
                  }
                }
              }
            ];
          });
        });

      const listItems = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.ListItem
      });

      listItems.map(listItem => {
        const subcomponents = GetNodesLinkedTo(graph, {
          id: listItem.id,
          link: LinkType.Component
        });
        const executeButtons = subcomponents.filter(x =>
          GetNodeProp(x, NodeProperties.ExecuteButton)
        );
        if (executeButtons && executeButtons.length === 1) {
          const subcomponent = executeButtons[0];
          const valueComponentApiNodeItems = GetNodesLinkedTo(graph, {
            id: subcomponent.id,
            link: LinkType.ComponentInternalApi
          }).find(x => GetNodeTitle(x) === ComponentApiKeys.Value);
          const valueNavigateTargetApiItems = GetNodesLinkedTo(graph, {
            id: navigateTo,
            link: LinkType.ComponentExternalApi
          }).find(x => GetNodeTitle(x) === ComponentApiKeys.Value);
          const events = GetNodesLinkedTo(graph, {
            id: subcomponent.id,
            link: LinkType.EventMethod
          }).filter(x =>
            [ComponentEvents.onClick, ComponentEvents.onPress].some(
              v => v === GetNodeProp(x, NodeProperties.EventType)
            )
          );
          events.map(evnt => {
            const eventMethodInstances = GetNodesLinkedTo(graph, {
              id: evnt.id,
              link: LinkType.EventMethodInstance
            });
            eventMethodInstances.map(eventMethodInstance => {
              const vp = GetNodeProp(
                eventMethodInstance,
                NodeProperties.ViewPackage
              );
              if (vp) {
                const inPackageNodes = GetNodesByProperties({
                  [NodeProperties.ViewPackage]: vp
                });

                inPackageNodes.forEach(inPackageNode => {
                  result.push({
                    operation: REMOVE_NODE,
                    options(graph) {
                      return {
                        id: inPackageNode.id
                      };
                    }
                  });
                });
              }
            });

            let _instanceNode = null;
            let _navigateContext = null;
            const lambdaFunc = "v => ({ value: v })";

            result.push(
              ...[
                {
                  operation: ADD_NEW_NODE,
                  options: addInstanceFunc(
                    evnt,
                    instanceNode => {
                      _instanceNode = instanceNode;
                    },
                    viewPackages
                  )
                }
              ],
              ...CreateNavigateToScreenDC({
                screen: navigateTo,
                node: () => _instanceNode.id,
                lambda: lambdaFunc,
                viewPackages,
                callback: navigateContext => {
                  _navigateContext = navigateContext;
                }
              }),
              {
                operation: ADD_LINK_BETWEEN_NODES,
                options() {
                  return {
                    source: _instanceNode.id,
                    target: valueComponentApiNodeItems.id,
                    properties: {
                      ...LinkProperties.ComponentApi
                    }
                  };
                }
              },
              valueNavigateTargetApiItems
                ? {
                    operation: UPDATE_NODE_PROPERTY,
                    options() {
                      return {
                        id: valueNavigateTargetApiItems.id,
                        properties: {
                          [NodeProperties.IsUrlParameter]: true
                        }
                      };
                    }
                  }
                : null
            );
          });
        }

        result.push(
          ...AppendValidations({
            subcomponents,
            screen_option,
            method,
            viewPackages
          })
        );
      });
    });

    const lifeCylcleMethods = GetNodesLinkedTo(graph, {
      id: screen_option.id,
      link: LinkType.LifeCylceMethod
    });

    lifeCylcleMethods
      .filter(
        x =>
          GetNodeProp(x, NodeProperties.UIText) ===
          ComponentLifeCycleEvents.ComponentDidMount
      )
      .map(lifeCylcleMethod => {
        const lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
          id: lifeCylcleMethod.id,
          link: LinkType.LifeCylceMethodInstance
        });
        lifeCylcleMethodInstances.map(lifeCylcleMethodInstance => {
          const vp = GetNodeProp(
            lifeCylcleMethodInstance,
            NodeProperties.ViewPackage
          );
          if (vp) {
            const inPackageNodes = GetNodesByProperties({
              [NodeProperties.ViewPackage]: vp
            });

            inPackageNodes.forEach(inPackageNode => {
              result.push({
                operation: REMOVE_NODE,
                options() {
                  return {
                    id: inPackageNode.id
                  };
                }
              });
            });
          }
        });
        let cycleInstance = null;
        let storeModelDataChain = null;
        result.push(
          ...AddLifeCylcleMethodInstance({
            node: lifeCylcleMethod.id,
            viewPackages,
            callback: _cycleInstance => {
              cycleInstance = _cycleInstance;
            }
          }),
          (currentGraph) => {
            if (cycleInstance) {
              return ConnectLifecycleMethod({
                target: method,
                source: cycleInstance.id,
                graph: currentGraph,
                viewPackages
              });
            }
            return [];
          },
          ...StoreModelArrayStandard({
            viewPackages,
            model: GetNodeProp(node, NodeProperties.Model),
            modelText: GetNodeTitle(node),
            state_key: `${GetNodeTitle(
              GetNodeProp(node, NodeProperties.Model)
            )} State`,
            callback: context => {
              storeModelDataChain = context.entry;
            }
          }),
          (graph) => {
            return [
              {
                operation: ADD_LINK_BETWEEN_NODES,
                options() {
                  return {
                    target: storeModelDataChain,
                    source: cycleInstance.id,
                    properties: {
                      ...LinkProperties.DataChainLink,
                      singleLink: true,
                      nodeTypes: [NodeTypes.DataChain]
                    }
                  };
                }
              }
            ];
          }
        );
      });
  });

  return result.filter(x => x);
}
