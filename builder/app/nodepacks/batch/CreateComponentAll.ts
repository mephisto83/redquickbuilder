import { UITypes, NodeProperties, NodeTypes, LinkType } from '../../constants/nodetypes';
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
	hasAccessNode,
	GetModelReferencedByProperty,
	AddLinkBetweenNodes,
	graphOperation
} from '../../actions/uiActions';
import { CreateDefaultView } from '../../constants/nodepackages';
import { GetViewTypeModelType } from '../viewtype/SetupViewTypeForCreate';
import { findLink, GetNodesLinkedTo, GetLinkBetween } from '../../methods/graph_methods';
import { Node } from '../../methods/graph_types';
import { GraphLink } from '../../methods/graph_types';
import { ApiNodeKeys } from '../../constants/nodetypes';
import { SetupApiComponent } from '../SetupApiBetweenComponents';

export async function CreateComponentSharedAll(progressFunc: any, filter?: any, filterViewTypes?: any) {
	console.log('Create Component All');
	const result: any = [];
	debugger;

	const defaultViewTypes = NodesByType(null, NodeTypes.ViewType);
	console.log(`defaultViewTypes.length : ${defaultViewTypes.length}`)
	await defaultViewTypes
		.filter((v: any) => (filterViewTypes ? filterViewTypes(v) : true))
		.filter((v: Node) => GetNodeProp(v, NodeProperties.ViewType) !== ViewTypes.Delete)
		.forEachAsync(async (viewType: Node, viewTypeIndex: any, viewTypeCount: any) => {
			const { model, property } = GetViewTypeModelType(viewType.id);
			if (filter && !filter(model)) {
				console.log(`'Filtered out model: "${GetNodeTitle(model)}"`)
				return;
			}
			let modelReferenceByProperty = GetModelReferencedByProperty(property.id);
			console.log(
				`Creating shared components for :[${GetNodeProp(viewType, NodeProperties.ViewType)}] ${GetNodeTitle(
					model
				)}.${GetNodeTitle(property)} => ${GetNodeTitle(modelReferenceByProperty)}`
			);

			let isPluralRef = GetNodeProp(property, NodeProperties.NODEType) === NodeTypes.Model && GetNodeProp(model, NodeProperties.NODEType) === NodeTypes.Model;
			// Try to find a group of components already implementing what we want.
			let matchingDefaultViewType: Node | undefined = defaultViewTypes
				.filter((v: Node) => v.id !== viewType.id)
				.find((viewTypeNode: Node) => {
					const local = GetViewTypeModelType(viewTypeNode.id);
					const currentLocalRef = GetModelReferencedByProperty(local.property.id);
					if (!modelReferenceByProperty) {
						throw new Error('model referencing a property not found');
					}
					if (!currentLocalRef) {
						throw new Error('View type isnt referencing a model');
					}
					let isPlural = GetNodeProp(local.property.id, NodeProperties.NODEType) === NodeTypes.Model &&
						GetNodeProp(local.model.id, NodeProperties.NODEType) === NodeTypes.Model;
					return (
						isPluralRef === isPlural &&
						modelReferenceByProperty.id === currentLocalRef.id &&
						GetNodeProp(viewTypeNode, NodeProperties.ViewType) ===
						GetNodeProp(viewType, NodeProperties.ViewType)
					);
				});

			// There is an existing component, that we can connect to.
			if (matchingDefaultViewType) {
				let alreadyMadeSharedComponents: Node[] = GetNodesLinkedTo(null, {
					id: matchingDefaultViewType.id,
					link: LinkType.DefaultViewType,
					componentType: NodeTypes.ComponentNode
				});
				if (alreadyMadeSharedComponents && alreadyMadeSharedComponents.length) {
					console.log('{Connecting to an existing shared component}');
					SetupApiForDefaultViewType(viewType);
					DuplicateDefaultViewTypes(matchingDefaultViewType, alreadyMadeSharedComponents, viewType);
					if (progressFunc) await progressFunc(0);
					return;
				}
			}
			console.log('[Create shared component]');
			CreateComponentModel({
				model: property.id,
				viewTypeModelId: viewType.id,
				viewTypes: [GetNodeProp(viewType, NodeProperties.ViewType)],
				connectedModel: model.id,
				isSharedComponent: true,
				isDefaultComponent: true
			});
			if (progressFunc) await progressFunc(0);
		});

	return result;
}

function SetupApiForDefaultViewType(viewType: Node) {
	graphOperation(
		['value', ApiNodeKeys.ViewModel, 'label', 'placeholder', 'error', 'success'].map((v: string) => {
			return SetupApiComponent({
				component_a: {
					external: v,
					id: viewType.id,
					internal: v
				}
			});
		})
	)(GetDispatchFunc(), GetStateFunc());
}

function DuplicateDefaultViewTypes(matchingDefaultViewType: Node, alreadyMadeSharedComponents: Node[], viewType: Node) {
	if (matchingDefaultViewType) {
		alreadyMadeSharedComponents.map((v: Node) => {
			let link: GraphLink | undefined = GetLinkBetween(
				matchingDefaultViewType ? matchingDefaultViewType.id : null,
				v.id,
				GetCurrentGraph()
			);
			if (link) {
				let duplicateProps = JSON.parse(JSON.stringify(link.properties));
				graphOperation(AddLinkBetweenNodes(viewType.id, v.id, duplicateProps))(
					GetDispatchFunc(),
					GetStateFunc()
				);
			}
		});
	}
}

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

		if (progressFunc) {
			await progressFunc((agentIndex + 0.5) / agentCount);
		}
		await models.forEachAsync(async (model: any) => {
			if (filter && !filter(model)) {
				return;
			}
			console.log(`Creating components for : ${GetNodeTitle(model.id)} / ${GetNodeTitle(agent.id)}`);
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
		viewTypes = [ViewTypes.Create, ViewTypes.Update, ViewTypes.Get, ViewTypes.GetAll],
		defaultArgs = {},
		navigableScreens = null
	} = args;

	const agentAccesses = NodesByType(null, NodeTypes.AgentAccessDescription);
	const operations: any = [];
	const result: any = [];
	const graph = GetCurrentGraph();
	viewTypes.forEach((viewType: string) => {
		const viewName = `${args.isSharedComponent ? '' : ''} ${GetNodeTitle(model)} ${viewType}`;
		const properties = GetModelPropertyChildren(model).filter(
			(x: any) => !GetNodeProp(x, NodeProperties.IsDefaultProperty)
		);
		const agentAccess = args.isSharedComponent
			? true
			: agentAccesses.find((aa: Node) =>
				hasAccessNode(GetNodeById(args.agentId), GetNodeById(model), aa, viewType)
			);
		if (agentAccess || args.isSharedComponent) {
			const agentCreds =
				agentAccess && !args.isSharedComponent
					? findLink(graph, { target: agentAccess.id, source: args.agentId })
					: null;

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
