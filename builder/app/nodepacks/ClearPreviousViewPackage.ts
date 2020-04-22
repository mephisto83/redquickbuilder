import {
  GetNodeProp,
  GetNodesByProperties,
  REMOVE_NODE
} from "../actions/uiactions";
import { NodeProperties } from "../constants/nodetypes";

export default function ClearPreviosuViewPackage(args = {}) {
  let { graph, node } = args;
  let result = [];
  let vp = GetNodeProp(node, NodeProperties.ViewPackage);
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
  return result;
}
