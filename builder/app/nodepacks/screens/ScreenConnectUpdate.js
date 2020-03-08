import { GetNodesLinkedTo } from "../../methods/graph_methods";
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
  ComponentApiKeys
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
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import ModifyUpdateLinks from "../ModifyUpdateLinks";
import CreateValidatorForProperty from "../CreateValidatorForProperty";
import AppendValidations from "./AppendValidations";

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
            }
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
  result = [...result, ...ModifyUpdateLinks()];
  return result;
}
