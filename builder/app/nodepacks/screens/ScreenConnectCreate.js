import { GetNodesLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE,
  ViewTypes,
  ADD_NEW_NODE,
  addInstanceFunc,
  GetNodeById
} from "../../actions/uiactions";
import { LinkType, NodeProperties } from "../../constants/nodetypes";
import {
  ComponentLifeCycleEvents,
  ComponentEvents
} from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../AddLifeCylcleMethodInstance";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";

export default function ScreenConnectGetAll(args = { method, node }) {
  let { node, method, viewType } = args;
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
      let subcomponents = GetNodesLinkedTo(graph, {
        id: component.id,
        link: LinkType.Component
      }).filter(x => GetNodeProp(x, NodeProperties.ExecuteButton));

      if (subcomponents.length === 1) {
        // There should be only 1 execute button
        let executeButton = subcomponents[0];

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
    });
  });

  return result;
}
