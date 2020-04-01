import { NodesByType, GetNodeProp, GetModelPropertyChildren, CHANGE_NODE_PROPERTY } from "../../actions/uiactions";
import { NodeTypes } from "../../constants/nodetypes";
import { NodeProperties } from "../../components/titles";

export default function SelectAllOnModelFilters() {
  const filters = NodesByType(null, NodeTypes.ModelFilter);
  return filters.map(filter => {
    const model = GetNodeProp(filter, NodeProperties.FilterModel);
    const propnodes = GetModelPropertyChildren(model);
    const fprops =
      GetNodeProp(
        filter,
        NodeProperties.FilterPropreties
      ) || {};
    propnodes.map(node => {
      fprops[node.id] = true;
    });
    return {
      operation:
        CHANGE_NODE_PROPERTY,
      options: {
        prop: NodeProperties.FilterPropreties,
        id: filter.id,
        value: fprops
      }
    };
  });
}
