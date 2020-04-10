import { NodesByType, GetNodeProp, GetModelPropertyChildren, CHANGE_NODE_PROPERTY, graphOperation, GetDispatchFunc, GetStateFunc } from "../../actions/uiactions";
import { NodeTypes } from "../../constants/nodetypes";
import { NodeProperties } from "../../components/titles";

export default async function SelectAllOnModelFilters(progresFunc) {
  const filters = NodesByType(null, NodeTypes.ModelFilter);
  await filters.forEachAsync(async (filter, index, length) => {
    const model = GetNodeProp(filter, NodeProperties.FilterModel);
    const propnodes = GetModelPropertyChildren(model);
    const fprops = GetNodeProp(filter, NodeProperties.FilterPropreties) || {};
    propnodes.forEach(node => {
      fprops[node.id] = true;
    });
    graphOperation([{
      operation: CHANGE_NODE_PROPERTY,
      options: {
        prop: NodeProperties.FilterPropreties,
        id: filter.id,
        value: fprops
      }
    }])(GetDispatchFunc(), GetStateFunc());
    await progresFunc(index / length);
  });
}
