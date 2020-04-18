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
  GetNodeById,
  GetNodesByProperties,
  isAccessNode,
  GetCurrentGraph,
  GetLinkProperty
} from "../../actions/uiactions";
import { CreateDefaultView } from '../../constants/nodepackages';
import { GetViewTypeModelType } from '../viewtype/SetupViewTypeForCreate';
import { findLink } from "../../methods/graph_methods";

export default async function CreateComponentAll(progressFunc) {
  const result = [];
  const models = GetNodesByProperties({
    [NodeProperties.NODEType]: NodeTypes.Model,
    [NodeProperties.IsAgent]: (v) => !v,
    [NodeProperties.IsViewModel]: v => !v
  });
  const agents = GetNodesByProperties({
    [NodeProperties.NODEType]: NodeTypes.Model,
    [NodeProperties.IsAgent]: (v) => v
  });
  //  NodesByType(null, NodeTypes.Model)
  //   .filter(x => !GetNodeProp(x, NodeProperties.IsAgent))
  //   .filter(x => !GetNodeProp(x, NodeProperties.IsViewModel));
  // // await models.forEachAsync(async (v, mindex) => {
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
  await agents.forEachAsync(async (agent, agentIndex, agentCount) => {

    const defaultViewTypes = NodesByType(null, NodeTypes.ViewType);
    await defaultViewTypes.forEachAsync(async (viewType, viewTypeIndex, viewTypeCount) => {
      const { model, property } = GetViewTypeModelType(viewType.id);

      CreateComponentModel({
        model: model.id,
        viewTypeModelId: viewType.id,
        agentId: agent.id,
        viewTypes: [GetNodeProp(viewType, NodeProperties.ViewType)],
        connectedModel: property.id,
        isSharedComponent: true,
        isDefaultComponent: true
      });
      await progressFunc(((agentIndex * viewTypeIndex) + viewTypeIndex) / ((agentCount * viewTypeCount) + (agentCount * models.length)));

    });

    await models.forEachAsync(async (v, mindex, mcount) => {
      CreateComponentModel({
        agentId: agent.id,
        model: v.id
      });

      await progressFunc((
        (agentIndex * defaultViewTypes.length) +
        (agentIndex * mcount) + mindex
      ) / ((agentCount * defaultViewTypes.length) + (agentCount * models.length)));
    });

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

  const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);
  const operations = [];
  const result = [];
  const graph = GetCurrentGraph();
  viewTypes.forEach(viewType => {
    const viewName = `${args.isSharedComponent ? 'Shared' : ''} ${GetNodeTitle(model)} ${viewType}`;
    const properties = GetModelPropertyChildren(model)
      .filter(x => !GetNodeProp(x, NodeProperties.IsDefaultProperty));
    const agentAcesses = agentAccesses.find(aa => isAccessNode(GetNodeById(args.agentId), GetNodeById(model), aa));
    if (agentAcesses || args.isSharedComponent) {
      const agentCreds = findLink(graph, { target: agentAcesses.id, source: args.agentId });

      if (args.isSharedComponent || GetLinkProperty(agentCreds, viewType)) {
        operations.push({
          node: GetNodeById(model),
          method: CreateDefaultView,
          options: {
            ...defaultParameters({
              isDefaultComponent: args.isDefaultComponent,
              isPluralComponent: args.isPluralComponent,
              isSharedComponent: args.isSharedComponent,
              viewTypeModelId: args.viewTypeModelId,
              connectedModel,
              ...defaultArgs,
              viewName
            }),
            agentId: args.agentId,
            viewType,
            isList: viewType === ViewTypes.GetAll,
            chosenChildren: properties
              .map(v => v.id)
          }
        });
      }
    }
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
