import { UITypes, NodeProperties, NodeTypes } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import { GetNodeTitle, GetModelPropertyChildren, GetNodeProp, GetDispatchFunc, GetStateFunc, executeGraphOperations, NodesByType, GetNodeById } from "../../actions/uiactions";
import { CreateDefaultView } from '../../constants/nodepackages';

export default function CreateComponentAll() {
  const result = [];
  const models = NodesByType(null, NodeTypes.Model)
    .filter(x => !GetNodeProp(x, NodeProperties.IsAgent))
    .filter(x => !GetNodeProp(x, NodeProperties.IsViewModel));
  models.forEach(v => {
    result.push(...CreateComponentModel({
      model: v.id,
      isSharedComponent: true,
      isDefaultComponent: true
    }));
  });
  models.forEach(v => {
    result.push(...CreateComponentModel({ model: v.id }));
  });
  return result;
}

export function CreateComponentModel(args = {}) {
  const {
    model,
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
      [UITypes.ReactNative]: false,
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
