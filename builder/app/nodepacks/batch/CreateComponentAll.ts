import { UITypes, NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { ViewTypes } from '../../constants/viewtypes';
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
	GetLinkProperty,
  hasAccessNode
} from '../../actions/uiactions';
import { CreateDefaultView } from '../../constants/nodepackages';
import { GetViewTypeModelType } from '../viewtype/SetupViewTypeForCreate';
import { findLink } from '../../methods/graph_methods';

export default async function CreateComponentAll(progressFunc: any, filter?: any) {
	console.log('Create Component All');
	const result: any = [];
	debugger;
	const navigableScreens = GetNodesByProperties({
		[NodeProperties.NODEType]: NodeTypes.NavigationScreen
	});
	const models = GetNodesByProperties({
		[NodeProperties.NODEType]: NodeTypes.Model
	})
		.filter((v) => !GetNodeProp(v, NodeProperties.IsViewModel))
		.filter((x) => !GetNodeProp(x, NodeProperties.IsUser));
	const agents = GetNodesByProperties({
		[NodeProperties.NODEType]: NodeTypes.Model,
		[NodeProperties.IsAgent]: (v: any) => v
	}).filter((x) => !GetNodeProp(x, NodeProperties.IsUser));
	console.log('----------------- agents ---------------------------');
	agents.map((v) => console.log(GetNodeTitle(v)));
	console.log('----------------- end agents -----------------------');
	console.log('----------------- model ---------------------------');
	models.map((v) => console.log(GetNodeTitle(v)));
	console.log('----------------- end models -----------------------');
	await agents.forEachAsync(async (agent: any, agentIndex: any, agentCount: any) => {
		if (progressFunc) {
			await progressFunc((agentIndex + 0.25) / agentCount);
		}
		const defaultViewTypes = NodesByType(null, NodeTypes.ViewType);
		await defaultViewTypes.forEachAsync(async (viewType: any, viewTypeIndex: any, viewTypeCount: any) => {
			const { model, property } = GetViewTypeModelType(viewType.id);
			if (filter && !filter(model)) {
				return;
			}
			console.log(`Creating shared components for : ${GetNodeTitle(model)}`);

			CreateComponentModel({
				model: model.id,
				viewTypeModelId: viewType.id,
				agentId: agent.id,
				viewTypes: [ GetNodeProp(viewType, NodeProperties.ViewType) ],
				connectedModel: property.id,
				isSharedComponent: true,
				isDefaultComponent: true
			});
			if (progressFunc)
				await progressFunc(
					(agentIndex * viewTypeIndex + viewTypeIndex) /
						(agentCount * viewTypeCount + agentCount * models.length)
				);
		});
		if (progressFunc) {
			await progressFunc((agentIndex + 0.5) / agentCount);
		}
		await models.forEachAsync(async (model: any) => {
			if (filter && !filter(model)) {
				return;
			}
			console.log(`Creating components for : ${GetNodeTitle(model.id)}`);
			CreateComponentModel({
				agentId: agent.id,
				model: model.id,
				navigableScreens
			});
		});
		if (progressFunc) {
			await progressFunc((agentIndex + 0.75) / agentCount);
		}
	});

	return result;
}

export function CreateComponentModel(args: any = {}) {
	const {
		model,
		connectedModel,
		viewTypes = [ ViewTypes.Create, ViewTypes.Update, ViewTypes.Get, ViewTypes.GetAll ],
		defaultArgs = {},
		navigableScreens = null
	} = args;

	const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);
	const operations: any = [];
	const result: any = [];
	const graph = GetCurrentGraph();
	viewTypes.forEach((viewType: string) => {
		const viewName = `${args.isSharedComponent ? 'Shared' : ''} ${GetNodeTitle(model)} ${viewType}`;
		const properties = GetModelPropertyChildren(model).filter(
			(x: any) => !GetNodeProp(x, NodeProperties.IsDefaultProperty)
		);
		const agentAccess = agentAccesses.find((aa: any) =>
			hasAccessNode(GetNodeById(args.agentId), GetNodeById(model), aa, viewType)
		);
		if (agentAccess || args.isSharedComponent) {
			const agentCreds = agentAccess ? findLink(graph, { target: agentAccess.id, source: args.agentId }) : null;

			if (!args.isSharedComponent && navigableScreens.length) {
				let naviScreen = navigableScreens.find((navigableScreen: Node) => {
					let navAgent = GetNodeProp(navigableScreen, NodeProperties.Agent);
					let navViewType = GetNodeProp(navigableScreen, NodeProperties.ViewType);
					let navModel = GetNodeProp(navigableScreen, NodeProperties.Model);

					return model === navModel && navAgent === args.agentId && navViewType === viewType;
				});
				if (!naviScreen) {
					return;
				}
			}

			if (args.isSharedComponent || (agentCreds && GetLinkProperty(agentCreds, viewType))) {
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
							model: args.model,
							agentId: args.agentId,
							viewType,
							...defaultArgs,
							viewName
						}),
						viewType,
						agentId: args.agentId,
						isList: viewType === ViewTypes.GetAll,
						chosenChildren: properties.map((v: any) => v.id)
					}
				});
			}
		}
	});
	if (operations.length) {
		executeGraphOperations(operations)(GetDispatchFunc, GetStateFunc);
	}

	return result;
}

function defaultParameters(args: any = {}) {
	const {
		viewName = null,
		uiTypes = {
			[UITypes.ReactNative]: true,
			[UITypes.ElectronIO]: true,
			[UITypes.VR]: false,
			[UITypes.ReactWeb]: true
		},
		chosenChildren = []
	} = args;
	return {
		...args,
		viewName,
		uiTypes,
		chosenChildren
	};
}
