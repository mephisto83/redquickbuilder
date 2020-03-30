import { NodesByType, GetLogicalChildren, getViewTypeEndpointsForDefaults, GetNodeProp, GetNodeTitle, ADD_NEW_NODE, GetCurrentGraph } from "../../actions/uiactions";
import { NodeTypes, LinkType, NodeProperties, LinkProperties } from "../../constants/nodetypes";
import { GetNodesLinkedTo, existsLinkBetween } from "../../methods/graph_methods";
import { ViewTypes } from "../../constants/viewtypes";
import { uuidv4 } from "../../utils/array";

export default function CreateViewTypes() {
  const models = NodesByType(null, NodeTypes.Model);
  const result = [];

  models.forEach(model => {
    const modelChildren = GetLogicalChildren(model.id);
    const modelProperties = GetNodesLinkedTo(null, {
      id: model.id,
      componentType: NodeTypes.Property,
      link: LinkType.ModelTypeLink
    }).filter(x => GetNodeProp(x, NodeProperties.UseModelAsType))
    const modelLinkedNodes = GetNodesLinkedTo(null, {
      id: model.id,
      link: LinkType.DefaultViewType,
      componentType: NodeTypes.ViewType,

    });
    [...modelProperties, ...modelChildren].forEach(child => {
      const childModelLinkedNodes = GetNodesLinkedTo(null, {
        id: child.id,
        link: LinkType.DefaultViewType,
        componentType: NodeTypes.ViewType
      });
      const commonViewTypes = childModelLinkedNodes.intersection(modelLinkedNodes, (x, y) => y.id === x.id);
      const isProperty = GetNodeProp(child, NodeProperties.UseModelAsType);
      Object.keys(ViewTypes).filter(x => !commonViewTypes.some(cvt => GetNodeProp(cvt, NodeProperties.ViewType) === x)).forEach(viewType => {
        result.push(...setupDefaultViewType({
          properties: {
            ...LinkProperties.DefaultViewType,
            viewType
          },
          target: isProperty ? model.id : child.id,
          source: isProperty ? child.id : model.id,
          viewCurrentType: viewType
        }))
      });
    })
  });

  return result;
}

CreateViewTypes.title = 'Create View Type Connections';
// export function ConnectViewType() {
//   let connectto = [];
//   Object.values(ViewTypes).map(viewType => {

//     connectto = getViewTypeEndpointsForDefaults(viewType, null, nodeId);
//     connectto.map(ct => {

//       this.props.setSharedComponent({
//         properties: {
//           ...LinkProperties.DefaultViewType,
//           viewType
//         },
//         source: ct.id,
//         target: properties.autoConnectViewType
//       })
//     });
//   });
// }


export function setupDefaultViewType(args) {
  const { properties, target, source, viewCurrentType } = args;
  const result = [];
  const graph = GetCurrentGraph();
  let isPropertyLink = false;
  if (
    existsLinkBetween(graph, {
      target,
      source,
      type: LinkType.ModelTypeLink
    })
  ) {
    const isUsedAsModelType = GetNodeProp(
      source,
      NodeProperties.UseModelAsType
    );
    if (isUsedAsModelType) {
      const targetedTypeNode = GetNodeProp(source, NodeProperties.UIModelType);
      if (targetedTypeNode === target) {
        isPropertyLink = true;
      }
    }
  }

  const rightLink =
    isPropertyLink ||
    existsLinkBetween(graph, {
      target,
      source,
      type: LinkType.LogicalChildren
    });
  if (rightLink) {
    const useModelAsType = GetNodeProp(target, NodeProperties.UseModelAsType);
    result.push(...[viewCurrentType]
      .map(viewType => {
        const sibling = uuidv4();
        return {
          operation: ADD_NEW_NODE,
          options() {
            return {
              nodeType: NodeTypes.ViewType,
              properties: {
                [NodeProperties.ViewType]: viewType,
                [NodeProperties.UIText]: `[${viewType}] ${GetNodeTitle(target)} => ${GetNodeTitle(source)}`
              },
              ...(useModelAsType ? { parent: target, groupProperties: {} } : {}),
              links: [
                {
                  target,
                  linkProperties: {
                    properties: {
                      ...properties,
                      viewType,
                      sibling,
                      target
                    }
                  }
                },
                {
                  target: source,
                  linkProperties: {
                    properties: {
                      ...properties,
                      viewType,
                      sibling,
                      source
                    }
                  }
                }
              ]
            };
          }
        };
      })
    )
  }
  return result;
}
