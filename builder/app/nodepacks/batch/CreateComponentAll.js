import { UITypes, NodeProperties, NodeTypes, LinkType } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { GetNodeTitle, GetModelPropertyChildren, GetNodeProp, GetDispatchFunc, GetStateFunc, executeGraphOperations, NodesByType, GetNodeById, GetViewTypeModel } from "../../actions/uiactions";
import { CreateDefaultView } from '../../constants/nodepackages';
import { GetNodesLinkedTo } from "../../methods/graph_methods";

export default function CreateComponentAll() {
  const result = [];
  const models = NodesByType(null, NodeTypes.Model)
    .filter(x => !GetNodeProp(x, NodeProperties.IsAgent))
    .filter(x => !GetNodeProp(x, NodeProperties.IsViewModel));
  const properties = NodesByType(null, NodeTypes.Property);
  models.forEach(v => {
    const defaultViewTypes = GetNodesLinkedTo(null, {
      id: v.id,
      componentType: NodeTypes.ViewType,
      link: LinkType.DefaultViewType
    });

    [...properties, ...models].filter(x => x.id !== v.id).forEach(w => {
      const defaultViewTypesOther = GetNodesLinkedTo(null, {
        id: w.id,
        componentType: NodeTypes.ViewType,
        link: LinkType.DefaultViewType
      });
      const intersections = defaultViewTypes.intersection(defaultViewTypesOther, (x, y) => y.id === x.id)
      if (intersections && intersections.length)
        result.push(...CreateComponentModel({
          model: v.id,
          connectedModel: w.id,
          isSharedComponent: true,
          isDefaultComponent: true
        }));
    })
  });
  models.forEach(v => {
    result.push(...CreateComponentModel({ model: v.id }));
  });
  return result;
}

export function CreateComponentModel(args = {}) {
  const {
    model,
    connectedModel,
    viewTypes = [
      ViewTypes.Create,
      ViewTypes.Update,
      ViewTypes.Get,
      ViewTypes.GetAll
    ],
    defaultArgs = {}
  } = args;

  const operations = [];
  const result = [];
  viewTypes.forEach(viewType => {
    const viewName = `${args.isSharedComponent ? 'Shared' : ''} ${GetNodeTitle(model)} ${viewType}`;
    const properties = GetModelPropertyChildren(model)
      .filter(x => !GetNodeProp(x, NodeProperties.IsDefaultProperty));
    operations.push({
      node: GetNodeById(model),
      method: CreateDefaultView,
      options: {
        ...defaultParameters({
          isDefaultComponent: args.isDefaultComponent,
          isPluralComponent: args.isPluralComponent,
          isSharedComponent: args.isSharedComponent,
          connectedModel,
          ...defaultArgs,
          viewName
        }),
        viewType,
        isList: viewType === ViewTypes.GetAll,
        chosenChildren: properties
          .map(v => v.id)
      }
    });
  })
  if (operations.length) {
    executeGraphOperations(operations)(GetDispatchFunc, GetStateFunc)
  }

  return result;
}


function defaultParameters(args = {}) {
  const {
    viewName = null,
    uiTypes = {
      [UITypes.ReactNative]: true,
      [UITypes.ElectronIO]: true,
      [UITypes.VR]: false,
      [UITypes.Web]: false
    }, chosenChildren = []
  } = args;
  return {
    ...args,
    viewName,
    uiTypes,
    chosenChildren
  }
};
