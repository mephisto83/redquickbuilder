import { GetNodesLinkedTo } from "../../methods/graph_methods";
import {
  GetCurrentGraph,
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE
} from "../../actions/uiactions";
import { LinkType, NodeProperties } from "../../constants/nodetypes";
import { ComponentLifeCycleEvents } from "../../constants/componenttypes";
import AddLifeCylcleMethodInstance from "../../components/AddLifeCylcleMethodInstance";
import ConnectLifecycleMethod from "../../components/ConnectLifecycleMethod";
import { uuidv4 } from "../../utils/array";

export default function ScreenConnect(args = { method, node }) {
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
          let inPackageNodes = GetNodesByProperties({
            [NodeProperties.ViewPackage]: GetNodeProp(
              lifeCylcleMethodInstance,
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
