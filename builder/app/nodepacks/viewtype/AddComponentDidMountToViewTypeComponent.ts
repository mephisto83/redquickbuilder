import { GetNodesLinkedTo } from "../../methods/graph_methods";
import { GetCurrentGraph, GetNodeProp, ADD_NEW_NODE, addInstanceFunc } from "../../actions/uiactions";
import { LinkType, NodeProperties, NodeTypes, LinkProperties } from "../../constants/nodetypes";
import { SCREEN_COMPONENT_EVENTS, ComponentLifeCycleEvents } from '../../constants/componenttypes';

export default function AddComponentDidMountToViewTypeComponent(args: any = {}) {
  const result = [];
  const currentGraph = GetCurrentGraph();
  const { node, viewPackages } = args;
  let lifeCycleMethod: any = null;
  let lifeCycleInstance : any= null;
  const component = GetNodesLinkedTo(currentGraph, {
    id: node,
    link: LinkType.DefaultViewType
  }).find((v: any) => GetNodeProp(v, NodeProperties.SharedComponent));
  if (component) {
    result.push(() => {
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
            callback: (lifeCycle: any) => {
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
        const temp = addInstanceFunc(lifeCycleMethod, (lci: any) => {
          lifeCycleInstance = lci;
        }, viewPackages, { lifeCycle: true });
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
          lifeCycleInstance
        })
      }
      return [];
    })
  }
  else {
    console.error(args);
    throw new Error('component not found ')
  }
  return result;
}
