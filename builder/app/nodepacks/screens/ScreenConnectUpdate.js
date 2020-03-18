import { GetNodesLinkedTo, getLinkInstance } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ADD_NEW_NODE,
  addInstanceFunc,
  GetNodeTitle,
  ComponentApiKeys,
  UPDATE_NODE_PROPERTY,
  GetNodeByProperties,
  UPDATE_LINK_PROPERTY,
  GetNodeById,
  GetCodeName,
  ADD_LINK_BETWEEN_NODES,
  ComponentEventTo
} from "../../actions/uiactions";
import {
  LinkType,
  NodeProperties,
  LinkPropertyKeys,
  LinkProperties,
  UITypes,
  NodeTypes
} from "../../constants/nodetypes";
import {
  ComponentLifeCycleEvents,
  ComponentEvents
} from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../AddLifeCylcleMethodInstance";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import ModifyUpdateLinks from "../ModifyUpdateLinks";
import AppendValidations from "./AppendValidations";
import AppendPostMethod from "./AppendPostMethod";
import GetModelObjectFromSelector from "../GetModelObjectFromSelector";
import LoadModel from "../LoadModel";

export default function ScreenConnectUpdate(args = { method, node }) {
  let { node, method } = args;
  const { componentDidMountMethod } = args;
  if (!node) {
    throw new Error("no node");
  }
  if (!method) {
    throw new Error("no method");
  }
  if (!componentDidMountMethod) {
    throw new Error("no componentDidMountMethod");
  }
  const graph = GetCurrentGraph();
  const screenOptions = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ScreenOptions
  });
  let result = [];
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  const valueNavigateTargetApi = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ComponentExternalApi
  }).find(x => GetNodeTitle(x) === ComponentApiKeys.Value);


  result.push(
    valueNavigateTargetApi
      ? {
        operation: UPDATE_NODE_PROPERTY,
        options() {
          return {
            id: valueNavigateTargetApi.id,
            properties: {
              [NodeProperties.IsUrlParameter]: true
            }
          };
        }
      }
      : null
  );
  screenOptions.forEach(screenOptionInstance => {
    const lifeCylcleMethods = GetNodesLinkedTo(graph, {
      id: screenOptionInstance.id,
      link: LinkType.LifeCylceMethod
    });


    const valueScreenOptionNavigateTargetApi = GetNodesLinkedTo(graph, {
      id: screenOptionInstance.id,
      link: LinkType.ComponentInternalApi
    }).find(x => GetNodeTitle(x) === ComponentApiKeys.Value);

    lifeCylcleMethods
      .filter(
        x =>
          GetNodeProp(x, NodeProperties.UIText) ===
          ComponentLifeCycleEvents.ComponentDidMount
      )
      .forEach(lifeCylcleMethod => {
        const lifeCylcleMethodInstances = GetNodesLinkedTo(graph, {
          id: lifeCylcleMethod.id,
          link: LinkType.LifeCylceMethodInstance
        });
        lifeCylcleMethodInstances.forEach(lifeCylcleMethodInstance => {
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
        let dataChainForLoading = null;
        let cycleInstance = null;
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
                connectToParameter: !valueScreenOptionNavigateTargetApi ? null : (ae) => {
                  switch (GetNodeProp(ae, NodeProperties.UIText)) {
                    case 'modelId':
                      return {
                        target: valueScreenOptionNavigateTargetApi.id,
                        linkProperties: {
                          properties: {
                            ...LinkProperties.ComponentApi
                          }
                        }
                      };
                    default: return false;
                  }
                },
                target: componentDidMountMethod,
                source: cycleInstance.id,
                graph: currentGraph,
                viewPackages
              });
            }
            return [];
          },
          ...LoadModel({
            viewPackages,
            model_view_name: `Load ${GetCodeName(GetNodeProp(node, NodeProperties.Model))} into state`,
            model_item: `Models.${GetCodeName(GetNodeProp(node, NodeProperties.Model))}`,
            callback: context => {
              dataChainForLoading = context.entry;
            }
          }),

          {
            operation: ADD_LINK_BETWEEN_NODES,
            options() {
              return {
                target: dataChainForLoading,
                source: cycleInstance.id,
                properties: {
                  ...LinkProperties.DataChainLink
                }
              }
            }
          }
        );
      });

    const components = GetNodesLinkedTo(graph, {
      id: screenOptionInstance.id,
      link: LinkType.Component
    });
    components.forEach(component => {
      const subcomponents = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.Component
      });

      const executiveButtons = subcomponents.filter(x =>
        GetNodeProp(x, NodeProperties.ExecuteButton)
      );
      if (executiveButtons.length === 1) {
        // There should be only 1 execute button
        const executeButton = executiveButtons[0];

        const onEvents = GetNodesLinkedTo(graph, {
          id: executeButton.id,
          link: LinkType.EventMethod
        }).filter(x =>
          [ComponentEvents.onClick, ComponentEvents.onPress].some(
            v => v === GetNodeProp(x, NodeProperties.EventType)
          )
        );
        const uiType = GetNodeProp(screenOptionInstance, NodeProperties.UIType);
        let eventType = null;
        switch (uiType) {
          case UITypes.ReactNative:
            eventType = 'onPress';
            break;
          default:
            eventType = 'onClick';
            break;
        }
        let newEventNode = null;
        if (onEvents.length === 0) {
          result.push(() => ComponentEventTo(executeButton.id, eventType, (eventNode) => {
            newEventNode = eventNode;
          }));
          onEvents.push({ newEventNode: () => newEventNode })
        }
        onEvents.forEach(onEventHandler => {
          if (!onEventHandler.newEventNode) {
            const t = GetNodesLinkedTo(graph, {
              id: onEventHandler.id,
              link: LinkType.EventMethodInstance
            });
            if (t && t.length) {
              t.forEach(instance => {
                const vp = GetNodeProp(instance, NodeProperties.ViewPackage);
                const parentViewPackage = GetNodeProp(onEventHandler, NodeProperties.ViewPackage);
                if (vp && vp !== parentViewPackage) {
                  const inPackageNodes = GetNodesByProperties({
                    [NodeProperties.ViewPackage]: GetNodeProp(
                      instance,
                      NodeProperties.ViewPackage
                    )
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
                else {
                  result.push({
                    operation: REMOVE_NODE,
                    options() {
                      return {
                        id: instance.id
                      };
                    }
                  });
                }
              });
            }
          }
          let instanceNodeItem = null;
          let modelDataChain = null;
          const modelSelectorNode = GetNodeByProperties({
            [NodeProperties.NODEType]: NodeTypes.Selector,
            [NodeProperties.Model]: GetNodeProp(node, NodeProperties.Model)
          });
          result.push(
            ...[
              {
                operation: ADD_NEW_NODE,
                options: addInstanceFunc(
                  onEventHandler.newEventNode ? onEventHandler.newEventNode : onEventHandler,
                  instanceNode => {
                    instanceNodeItem = instanceNode;
                  },
                  viewPackages
                )
              }
            ],
            ...GetModelObjectFromSelector({
              model: GetNodeTitle(node),
              viewPackages,
              callback: (newContext, tempGraph) => {
                modelDataChain = GetNodeById(newContext.entry, tempGraph);
              }
            }),
            (currentGraph) => {
              if (instanceNodeItem) {
                return ConnectLifecycleMethod({
                  target: method,
                  selectorNode: () => modelSelectorNode.id,
                  dataChain: () => modelDataChain.id,
                  source: instanceNodeItem.id,
                  graph: currentGraph,
                  viewPackages
                });
              }
              return [];
            }
          );

          result.push(
            {
              operation: UPDATE_LINK_PROPERTY,
              options(currentGraph) {
                const link = getLinkInstance(currentGraph, {
                  target: instanceNodeItem.id,
                  source: onEventHandler.id
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
              handler: () => instanceNodeItem.id
            })
          );
        });
      }

      result.push(
        ...AppendValidations({
          subcomponents,
          screen_option: screenOptionInstance,
          method,
          viewPackages
        })
      );
    });
  });
  result = [...result, ...ModifyUpdateLinks()].filter(x => x);
  return result;
}
