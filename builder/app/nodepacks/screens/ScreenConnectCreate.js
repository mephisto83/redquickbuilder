import { GetNodesLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ADD_NEW_NODE,
  addInstanceFunc,
  GetNodeTitle,
  GetNodeById
} from "../../actions/uiactions";
import { LinkType, NodeProperties } from "../../constants/nodetypes";
import {
  ComponentEvents
} from "../../constants/componenttypes";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";
import AppendValidations from "./AppendValidations";
import AppendPostMethod from "./AppendPostMethod";
import GetModelObjectFromSelector from "../GetModelObjectFromSelector";

export default function ScreenConnectCreate(args = { method, node }) {
  let { node, method } = args;
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

  screen_options.map(screenOption => {
    const components = GetNodesLinkedTo(graph, {
      id: screenOption.id,
      link: LinkType.Component
    });
    components.map(component => {
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
        onEvents.forEach(x => {
          const t = GetNodesLinkedTo(graph, {
            id: x.id,
            link: LinkType.EventMethodInstance
          });
          if (t && t.length) {
            t.map(instance => {
              const vp = GetNodeProp(instance, NodeProperties.ViewPackage);
              if (vp) {
                const inPackageNodes = GetNodesByProperties({
                  [NodeProperties.ViewPackage]: vp
                });
                inPackageNodes.map(inPackageNode => {
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
              return null;
            });
          }
          let instanceTempNode = null;
          let modelDataChain = null;
          result.push(
            ...[
              {
                operation: ADD_NEW_NODE,
                options: addInstanceFunc(
                  x,
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
          screen_option: screenOption,
          method,
          viewPackages
        })
      );
    });
  });

  return result;
}
