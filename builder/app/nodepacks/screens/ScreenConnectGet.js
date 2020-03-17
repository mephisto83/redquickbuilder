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
  GetModelPropertyChildren,
  ComponentApiKeys,
  GetCodeName,
  GetComponentApiNode,
  Connect,
  UPDATE_NODE_PROPERTY
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
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import AppendValidations from "./AppendValidations";
import {
  FunctionTemplateKeys,
  TEMPLATE_PARAMETERS
} from "../../constants/functiontypes";

export default function ScreenConnectGet(args = { method, node }) {
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

    let internalComponentApis = GetNodesLinkedTo(graph, {
      id: screen_option.id,
      link: LinkType.ComponentInternalApi
    });

    components.map(component => {
      let subcomponents = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.Component
      });
      let buttonComponents = subcomponents.filter(x =>
        GetNodeProp(x, NodeProperties.ExecuteButton)
      );
      if (buttonComponents && buttonComponents.length === 1) {
        let subcomponent = buttonComponents[0];
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
          let _valueNavigateTargetApi = GetNodesLinkedTo(graph, {
            id: navigateTo,
            link: LinkType.ComponentExternalApi
          }).find(x => GetNodeTitle(x) === ComponentApiKeys.Value);

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
              viewPackages,
              callback: navigateContext => {
                _navigateContext = navigateContext;
              }
            }),
            function(graph) {
              let valueComponentApiNode = GetComponentApiNode(
                ComponentApiKeys.Value,
                subcomponent.id,
                graph
              );
              return {
                operation: ADD_LINK_BETWEEN_NODES,
                options: Connect(
                  _instanceNode.id,
                  valueComponentApiNode.id,
                  LinkProperties.ComponentApi
                )
              };
            },
              _valueNavigateTargetApi
                ? {
                    operation: UPDATE_NODE_PROPERTY,
                    options: function() {
                      return {
                        id: _valueNavigateTargetApi.id,
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
        let apiEndpoints = {};
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
                viewPackages,
                callback: (context, graph) => {
                  if (context.apiEndPoints) {
                    context.apiEndPoints.filter(d => {
                      let temp = GetNodesLinkedTo(graph, {
                        id: d.id,
                        link: LinkType.ComponentApiConnection
                      }).find(v => TEMPLATE_PARAMETERS[GetCodeName(v)]);
                      if (temp) {
                        apiEndpoints[GetCodeName(temp)] = d;
                      }
                      return temp;
                    });
                  }
                }
              });
            }
            return [];
          },
          function(graph) {
            if (apiEndpoints) {
              return Object.keys(apiEndpoints).map(key => {
                let apiEndpoint = apiEndpoints[key];
                let internalComponentApi = internalComponentApis.find(v => {
                  return GetCodeName(v) === key;
                });
                if (!internalComponentApi) {
                  internalComponentApi = internalComponentApis.find(v => {
                    return GetCodeName(v) === "value";
                  });
                }
                if (apiEndpoint && internalComponentApi) {
                  return {
                    operation: ADD_LINK_BETWEEN_NODES,
                    options: {
                      source: apiEndpoint.id,
                      target: internalComponentApi.id,
                      properties: { ...LinkProperties.ComponentApi }
                    }
                  };
                }
              });
            }
          }
        );
      });
  });

  return result;
}
