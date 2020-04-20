import { GetNodeLinkedTo, GetNodesLinkedTo } from "../../methods/graph_methods";
import { NodeTypes, LinkType, NodeProperties } from "../../constants/nodetypes";
import { GetNodeProp } from "../../actions/uiactions";
import NavigateBackEventInstanceToAction from "../NavigateBackEventInstanceToAction";

export default function AddCancelButtonEvent(args = {}) {
  if (!args.screen) {
    throw new Error('missing screen');
  }
  if (!args.uiType) {
    throw new Error('missing uiType');
  }

  const result = [];
  const screenOption = GetNodesLinkedTo(null, {
    id: args.screen,
    componentType: NodeTypes.Screen,
    link: LinkType.ScreenOptions
  }).find(x => GetNodeProp(x, NodeProperties.UIType) === args.uiType);

  if (screenOption) {
    const topComponent = GetNodesLinkedTo(null, {
      id: screenOption.id,
      componentType: NodeTypes.ComponentNode
    });
    if (topComponent) {
      const cancelButton = GetNodesLinkedTo(null, {
        id: topComponent.id,
        componentType: NodeTypes.ComponentNode
      }).find(x => GetNodeProp(x, NodeProperties.CancelButton));

      if (cancelButton) {
        const eventMethod = GetNodeLinkedTo(null, {
          id: cancelButton.id,
          componentType: NodeTypes.EventMethod
        })
        if (eventMethod) {
          result.push(...NavigateBackEventInstanceToAction({
            event: eventMethod.id
          }));
        }
      }
    }
  }

  return result;
}
