import { GetNodesLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ViewTypes,
  addInstanceFunc,
  ADD_NEW_NODE,
  ADD_LINK_BETWEEN_NODES
} from "../../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkProperties
} from "../../constants/nodetypes";
import {
  ComponentLifeCycleEvents,
  ComponentEvents
} from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../AddLifeCylcleMethodInstance";
import CreateNavigateToScreenDC from "../CreateNavigateToScreenDC";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";

export default function ScreenConnectGetAll(args = { method, node }) {
  let { node, method, navigateTo } = args;
  if (!node) {
    throw "no node";
  }
  if (!method) {
    throw "no method";
  }

  let graph = GetCurrentGraph();
  let screen_options = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ScreenOptions
  });
  let result = [];
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  screen_options.map(screen_option => {
    let components = GetNodesLinkedTo(graph, {
      id: screen_option.id,
      link: LinkType.Component
    });

    components.map(component => {
      let listItems = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.ListItem
      });

      listItems.map(listItem => {
        let subcomponents = GetNodesLinkedTo(graph, {
          id: listItem.id,
          link: LinkType.Component
        }).filter(x => GetNodeProp(x, NodeProperties.ExecuteButton));
        if (subcomponents && subcomponents.length === 1) {
          let subcomponent = subcomponents[0];
          let events = GetNodesLinkedTo(graph, {
            id: subcomponent.id,
            link: LinkType.EventMethod
          }).filter(x =>
            [ComponentEvents.onClick, ComponentEvents.onPress].some(
              v => v === GetNodeProp(x, NodeProperties.EventType)
            )
          );
          events.map(evnt => {
            let eventMethodInstances = GetNodesLinkedTo(graph, {
              id: evnt.id,
              link: LinkType.EventMethodInstance
            });
            eventMethodInstances.map(eventMethodInstance => {
              let vp = GetNodeProp(
                eventMethodInstance,
                NodeProperties.ViewPackage
              );
              if (vp) {
                let inPackageNodes = GetNodesByProperties({
                  [NodeProperties.ViewPackage]: vp
                });

                inPackageNodes.map(inPackageNode => {
                  result.push({
                    operation: REMOVE_NODE,
                    options: function(graph) {
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
                viewPackages,
                callback: navigateContext => {
                  _navigateContext = navigateContext;
                }
              }),
              function(graph) {
                return [
                  {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: function() {
                      return {
                        source: _instanceNode.id,
                        target: _navigateContext.entry,
                        properties: { ...LinkProperties.DataChainLink }
                      };
                    }
                  }
                ];
              }
            );
          });
        }
      });
    });

    let lifeCylcleMethods = GetNodesLinkedTo(graph, {
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
        let lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
          id: lifeCylcleMethod.id,
          link: LinkType.LifeCylceMethodInstance
        });
        lifeCylcleMethodInstances.map(lifeCylcleMethodInstance => {
          let vp = GetNodeProp(
            lifeCylcleMethodInstance,
            NodeProperties.ViewPackage
          );
          if (vp) {
            let inPackageNodes = GetNodesByProperties({
              [NodeProperties.ViewPackage]: vp
            });

            inPackageNodes.map(inPackageNode => {
              result.push({
                operation: REMOVE_NODE,
                options: function(graph) {
                  return {
                    id: inPackageNode.id
                  };
                }
              });
            });
          }
        });
        let cycleInstance = null;
        result.push(
          ...AddLifeCylcleMethodInstance({
            node: lifeCylcleMethod.id,
            viewPackages,
            callback: _cycleInstance => {
              cycleInstance = _cycleInstance;
            }
          }),
          function(graph) {
            if (cycleInstance) {
              return ConnectLifecycleMethod({
                target: method,
                source: cycleInstance.id,
                graph,
                viewPackages
              });
            }
            return [];
          }
        );
      });
  });

  return result;
}
