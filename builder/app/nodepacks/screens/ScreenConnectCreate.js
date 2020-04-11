import { GetNodesLinkedTo, GetNodeLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ADD_NEW_NODE,
  addInstanceFunc,
  GetNodeTitle,
  GetNodeById,
  ADD_LINK_BETWEEN_NODES,
  ComponentApiKeys,
  GetComponentExternalApiNode,
  ScreenOptionFilter
} from "../../actions/uiactions";
import { LinkType, NodeProperties, LinkProperties, NodeTypes, Methods } from "../../constants/nodetypes";
import {
  ComponentEvents, ComponentLifeCycleEvents
} from "../../constants/componenttypes";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import AppendValidations from "./AppendValidations";
import AppendPostMethod from "./AppendPostMethod";
import GetModelObjectFromSelector from "../GetModelObjectFromSelector";
import ClearScreenInstance from "../datachain/ClearScreenInstance";

export default function ScreenConnectCreate(args = { method, node }) {
  let { node, method } = args;
  if (!node) {
    throw new Error("no node");
  }
  if (!method) {
    throw new Error("no method");
  }
  const graph = GetCurrentGraph();
  const screenOptions = GetNodesLinkedTo(graph, {
    id: node,
    link: LinkType.ScreenOptions
  }).filter(ScreenOptionFilter);

  const result = [];
  let { viewPackages } = args;
  viewPackages = {
    [NodeProperties.ViewPackage]: uuidv4(),
    ...(viewPackages || {})
  };

  screenOptions.forEach(screenOption => {
    const components = GetNodesLinkedTo(graph, {
      id: screenOption.id,
      link: LinkType.Component
    });
    components.forEach(component => {
      const subcomponents = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.Component
      });
      const executeButtons = subcomponents.filter(x =>
        GetNodeProp(x, NodeProperties.ExecuteButton)
      );

      if (executeButtons.length === 1) {
        // There should be only 1 execute button
        const executeButton = executeButtons[0];

        const onEvents = GetNodesLinkedTo(graph, {
          id: executeButton.id,
          link: LinkType.EventMethod
        }).filter(x =>
          [ComponentEvents.onClick, ComponentEvents.onPress].some(
            v => v === GetNodeProp(x, NodeProperties.EventType)
          )
        );
        onEvents.forEach(evntNode => {
          const t = GetNodesLinkedTo(graph, {
            id: evntNode.id,
            link: LinkType.EventMethodInstance
          });
          if (t && t.length) {
            t.forEach(instance => {
              const vp = GetNodeProp(instance, NodeProperties.ViewPackage);
              if (vp) {
                const inPackageNodes = GetNodesByProperties({
                  [NodeProperties.ViewPackage]: vp
                });
                inPackageNodes.forEach(inPackageNode => {
                  result.push({
                    operation: REMOVE_NODE,
                    options: function options() {
                      return {
                        id: inPackageNode.id
                      };
                    }
                  });
                });
              }
            });
          }
          let instanceTempNode = null;
          let modelDataChain = null;
          result.push(
            ...[
              {
                operation: ADD_NEW_NODE,
                options: addInstanceFunc(
                  evntNode,
                  instanceNode => {
                    instanceTempNode = instanceNode;
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
              if (instanceTempNode) {
                return ConnectLifecycleMethod({
                  target: method,
                  dataChain: () => modelDataChain.id,
                  source: instanceTempNode.id,
                  graph: currentGraph,
                  viewPackages
                });
              }
              return [];
            },
            ...AppendPostMethod({
              method,
              viewPackages,
              handler: () => instanceTempNode.id
            })
          );
        });
      }

      result.push(
        ...AppendValidations({
          subcomponents,
          component,
          methodType: Methods.Create,
          screen_option: screenOption,
          InstanceUpdate: false,
          method,
          viewPackages
        })
      );
    });

    let clearScreenContext = null;
    let componentDidMountInstance = null;
    let componentDidMount = null;
    result.push(
      ...ClearScreenInstance({
        viewPackages,
        title: `Clear ${GetNodeTitle(node)} State`,
        model: GetNodeProp(node, NodeProperties.Model),
        callback: (temp) => {
          clearScreenContext = temp;
        }
      }), (gg) => {
        componentDidMount = GetNodesLinkedTo(gg, {
          id: screenOption.id,
          link: LinkType.LifeCylceMethod,
          componentType: NodeTypes.LifeCylceMethod
        }).find(v => GetNodeProp(v, NodeProperties.EventType) === ComponentLifeCycleEvents.ComponentDidMount);
        if (componentDidMount) {
          componentDidMountInstance = GetNodeLinkedTo(gg, {
            id: componentDidMount.id,
            link: LinkType.LifeCylceMethodInstance,
            componentType: NodeTypes.LifeCylceMethodInstance
          });
          if (!componentDidMountInstance) {
            return {
              operation: ADD_NEW_NODE,
              options: addInstanceFunc(
                componentDidMount,
                instanceNode => {
                  componentDidMountInstance = instanceNode;
                },
                viewPackages,
                { lifecycle: true }
              )
            }
          }
        }
      },
      () => ({
        operation: ADD_LINK_BETWEEN_NODES,
        options() {
          return {
            target: clearScreenContext.entry,
            source: componentDidMountInstance.id,
            properties: { ...LinkProperties.CallDataChainLink }
          }
        }
      }),
      () => ({
        operation: ADD_LINK_BETWEEN_NODES,
        options(gg) {
          const viewModelExternalApiNode = GetComponentExternalApiNode(ComponentApiKeys.ViewModel, screenOption.id, gg);
          return {
            source: clearScreenContext.entry,
            target: viewModelExternalApiNode.id,
            properties: { ...LinkProperties.DataChainInputLink }
          }
        }
      }),
      () => ({
        operation: ADD_LINK_BETWEEN_NODES,
        options(gg) {
          const valueExternalApiNode = GetComponentExternalApiNode(ComponentApiKeys.Value, screenOption.id, gg);
          return {
            source: clearScreenContext.entry,
            target: valueExternalApiNode.id,
            properties: { ...LinkProperties.DataChainInputLink }
          }
        }
      }))
  });

  return result;
}
