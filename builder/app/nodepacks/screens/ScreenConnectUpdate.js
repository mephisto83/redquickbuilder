import { GetNodesLinkedTo, getLinkInstance } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ViewTypes,
  ADD_NEW_NODE,
  addInstanceFunc,
  GetNodeById,
  GetNodeTitle,
  ADD_LINK_BETWEEN_NODES,
  ComponentApiKeys,
  UPDATE_NODE_PROPERTY,
  UPDATE_LINK_PROPERTY
} from "../../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkProperties,
  LinkPropertyKeys
} from "../../constants/nodetypes";
import {
  ComponentLifeCycleEvents,
  ComponentEvents
} from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../AddLifeCylcleMethodInstance";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import ModifyUpdateLinks from "../ModifyUpdateLinks";
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import AppendValidations from "./AppendValidations";
import UpdateModelAndGoBack from "../UpdateModelAndGoBack";
import AppendPostMethod from "./AppendPostMethod";
export default function ScreenConnectUpdate(args = { method, node }) {
  let { node, method, componentDidMountMethod, viewType } = args;
  if (!node) {
    throw "no node";
  }
  if (!method) {
    throw "no method";
  }
  if (!componentDidMountMethod) {
    throw "no componentDidMountMethod";
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

  let _valueNavigateTargetApi = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ComponentExternalApi
  }).find(x => GetNodeTitle(x) === ComponentApiKeys.Value);

  result.push(
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
  screen_options.map(screen_option => {
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
                target: componentDidMountMethod,
                source: cycleInstance.id,
                graph,
                viewPackages
              });
            }
            return [];
          }
        );
      });

    let components = GetNodesLinkedTo(graph, {
      id: screen_option.id,
      link: LinkType.Component
    });
    components.map(component => {
      let subcomponents = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.Component
      });

      let executiveButtons = subcomponents.filter(x =>
        GetNodeProp(x, NodeProperties.ExecuteButton)
      );
      if (executiveButtons.length === 1) {
        // There should be only 1 execute button
        let executeButton = executiveButtons[0];

        let onEvents = GetNodesLinkedTo(graph, {
          id: executeButton.id,
          link: LinkType.EventMethod
        }).filter(x =>
          [ComponentEvents.onClick, ComponentEvents.onPress].some(
            v => v === GetNodeProp(x, NodeProperties.EventType)
          )
        );
        onEvents.filter(x => {
          let t = GetNodesLinkedTo(graph, {
            id: x.id,
            link: LinkType.EventMethodInstance
          });
          if (t && t.length) {
            t.map(instance => {
              let vp = GetNodeProp(instance, NodeProperties.ViewPackage);
              if (vp) {
                let inPackageNodes = GetNodesByProperties({
                  [NodeProperties.ViewPackage]: GetNodeProp(
                    instance,
                    NodeProperties.ViewPackage
                  )
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
          }

          let _instanceNode = null;

          result.push(
            ...[
              {
                operation: ADD_NEW_NODE,
                options: addInstanceFunc(
                  x,
                  instanceNode => {
                    _instanceNode = instanceNode;
                  },
                  viewPackages
                )
              }
            ],
            function(graph) {
              if (_instanceNode) {
                return ConnectLifecycleMethod({
                  target: method,
                  source: _instanceNode.id,
                  graph,
                  viewPackages
                });
              }
              return [];
            },
            function(graph) {}
          );

          result.push(
            {
              operation: UPDATE_LINK_PROPERTY,
              options: function(graph) {
                let link = getLinkInstance(graph, {
                  target: _instanceNode.id,
                  source: x.id
                });
                if (link)
                  return {
                    id: link.id,
                    prop: LinkPropertyKeys.InstanceUpdate,
                    value: true
                  };
              }
            },
            ...AppendPostMethod({
              method,
              viewPackages,
              handler: () => _instanceNode.id
            })
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
  result = [...result, ...ModifyUpdateLinks()].filter(x => x);
  return result;
}
