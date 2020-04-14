import { UITypes, NodeProperties, NodeTypes } from "../../constants/nodetypes";
import { ViewTypes } from "../../constants/viewtypes";
import {
  GetNodeTitle,
  GetModelPropertyChildren,
  GetNodeProp,
  GetDispatchFunc,
  GetStateFunc,
  executeGraphOperations,
  NodesByType,
  GetNodeById
} from "../../actions/uiactions";
import { CreateDefaultView } from '../../constants/nodepackages';
import { GetViewTypeModelType } from '../viewtype/SetupViewTypeForCreate';

export default async function CreateComponentAll(progressFunc) {
  const result = [];
  const models = NodesByType(null, NodeTypes.Model)
    .filter(x => !GetNodeProp(x, NodeProperties.IsAgent))
    .filter(x => !GetNodeProp(x, NodeProperties.IsViewModel));
  // await models.forEachAsync(async (v, mindex) => {
  //   const defaultViewTypes = GetNodesLinkedTo(null, {
  //     id: v.id,
  //     componentType: NodeTypes.ViewType,
  //     link: LinkType.DefaultViewType
  //   });

  //   await [...properties, ...models].filter(x => x.id !== v.id).forEachAsync(async (w, windex) => {
  //     const defaultViewTypesOther = GetNodesLinkedTo(null, {
  //       id: w.id,
  //       componentType: NodeTypes.ViewType,
  //       link: LinkType.DefaultViewType
  //     });
  //     const intersections = defaultViewTypes.intersection(defaultViewTypesOther, (x, y) => y.id === x.id)
  //     if (intersections && intersections.length) {
  //       CreateComponentModel({
  //         model: v.id,
  //         connectedModel: w.id,
  //         isSharedComponent: true,
  //         isDefaultComponent: true
  //       });
  //     }
  //   });
  //   await progressFunc((mindex) / (models.length * 2))
  // });
  const defaultViewTypes = NodesByType(null, NodeTypes.ViewType);
  await defaultViewTypes.forEachAsync(async (viewType, mindex) => {
    const { model, property } = GetViewTypeModelType(viewType.id);

    CreateComponentModel({
      model: model.id,
      viewTypes: [GetNodeProp(viewType, NodeProperties.ViewType)],
      connectedModel: property.id,
      isSharedComponent: true,
      isDefaultComponent: true
    });

    await progressFunc((mindex) / (defaultViewTypes.length + models.length))
  });

  await models.forEachAsync(async (v, mindex) => {
    CreateComponentModel({ model: v.id });

    await progressFunc((mindex + defaultViewTypes.length) / (defaultViewTypes.length + models.length))
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
      [UITypes.ReactWeb]: true
    }, chosenChildren = []
  } = args;
  return {
    ...args,
    viewName,
    uiTypes,
    chosenChildren
  }
};
