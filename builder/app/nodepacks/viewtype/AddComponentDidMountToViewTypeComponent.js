import { GetNodesLinkedTo, GetNodeLinkedTo } from "../../methods/graph_methods";
import { GetCurrentGraph, GetNodeProp, ADD_NEW_NODE, addInstanceFunc, GetNodeById } from "../../actions/uiactions";
import { LinkType, NodeProperties, NodeTypes, LinkProperties } from "../../constants/nodetypes";
import { SCREEN_COMPONENT_EVENTS, ComponentLifeCycleEvents } from '../../constants/componenttypes';

export default function AddComponentDidMountToViewTypeComponent(args = {}) {
  const result = [];
  const currentGraph = GetCurrentGraph();
  const { node, viewPackages } = args;
  let lifeCycleMethod = null;
  let lifeCycleInstance = null;
  let skip = false;
  const component = GetNodesLinkedTo(currentGraph, {
    id: node,
    link: LinkType.DefaultViewType
  }).find(v => GetNodeProp(v, NodeProperties.SharedComponent));
  if (component) {
    result.push((graph) => {
      lifeCycleMethod = GetNodeLinkedTo(graph, {
        id: component.id,
        link: LinkType.LifeCylceMethod,
        componentType: NodeTypes.LifeCylceMethod
      });
      if (lifeCycleMethod) {
        skip = true;
        return null;
      }

      return SCREEN_COMPONENT_EVENTS.map(t => ({
        operation: ADD_NEW_NODE,
        options() {
          return {
            nodeType: NodeTypes.LifeCylceMethod,
            properties: {
              [NodeProperties.EventType]: t,
              ...viewPackages,
              [NodeProperties.Pinned]: false,
              [NodeProperties.UIText]: `${t}`
            },
            callback: (lifeCycle) => {
              if (t === ComponentLifeCycleEvents.ComponentDidMount) {
                lifeCycleMethod = lifeCycle;
              }
            },
            links: [
              {
                target: component.id,
                linkProperties: {
                  properties: {
                    ...LinkProperties.LifeCylceMethod
                  }
                }
              }
            ]
          };
        }
      }))
    }, () => {
      if (lifeCycleMethod) {
        const temp = addInstanceFunc(lifeCycleMethod, (lci) => {
          lifeCycleInstance = lci;
        }, viewPackages);
        return {
          operation: ADD_NEW_NODE,
          options: temp
        }
      }
      return [];
    }, () => {
      if (args.callback) {
        args.callback({
          lifeCycleMethod,
          component,
          skip,
          lifeCycleInstance
        })
      }
      return [];
    })
  }
  return result;
}
