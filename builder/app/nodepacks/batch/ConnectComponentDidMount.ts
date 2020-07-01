import {
	GetNodeById,
	GetCurrentGraph,
	GetLambdaVariableTitle,
	GetNodeTitle,
	ADD_LINK_BETWEEN_NODES,
	GetCodeName,
	graphOperation,
	GetStateFunc,
	GetDispatchFunc,
	NodeTypes
} from '../../actions/uiactions';
import { GetNodesLinkedTo, GetNodeProp } from '../../methods/graph_methods';
import { LinkType, NodeProperties, LinkProperties } from '../../constants/nodetypes';
import { ComponentLifeCycleEvents } from '../../constants/componenttypes';
import AddLifeCylcleMethodInstance from '../AddLifeCylcleMethodInstance';
import { uuidv4 } from '../../utils/array';
import ConnectLifecycleMethod from '../../components/ConnectLifecycleMethod';
import { Graph } from '../../methods/graph_types';
import StoreModelInLake from '../datachain/StoreModelInLake';
import { MethodFunctions } from '../../constants/functiontypes';
import LoadModel from '../LoadModel';
import { ViewTypes } from '../../constants/viewtypes';
import StoreModelArrayStandard from '../StoreModelArrayStandard';

export default function ConnectComponentDidMount(args: {
	screen: string;
	screenOption: string;
	viewPackages?: any;
	methods: string[];
}) {
	let { screen, methods } = args;
	if (!screen) {
		throw 'no node';
	}
	if (!methods) {
		throw 'no method';
	}

	let graph = GetCurrentGraph();
	let screen_option = GetNodeById(args.screenOption, graph);
	let viewType = GetNodeProp(screen, NodeProperties.ViewType);
	let instanceType = false; // change this to be methodFunction related,
	// if it is create/update, it should use and appropriate storage
	// if it is returning a list or model, it should be able to use the appropriate thing
	// check the methods functionType to see if it is returning a list or single model or whatever.
	switch (viewType) {
		case ViewTypes.Create:
		case ViewTypes.Update:
			instanceType = true;
			break;
	}
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const lifeCylcleMethods = GetNodesLinkedTo(graph, {
		id: screen_option.id,
		link: LinkType.LifeCylceMethod
	});

	const internalComponentApis = GetNodesLinkedTo(graph, {
		id: screen_option.id,
		link: LinkType.ComponentInternalApi
	});
	methods.forEach((method: string) => {
		let result: any[] = [];
		lifeCylcleMethods
			.filter((x: any) => GetNodeProp(x, NodeProperties.UIText) === ComponentLifeCycleEvents.ComponentDidMount)
			.map((lifeCylcleMethod: { id: any }) => {
				const apiEndpoints: any = {};
				let cycleInstance: { id: any } | null = null;
				let datachain: string;
				let functionType: string = GetNodeProp(method, NodeProperties.FunctionType);
				let functionTypeParameters = GetMethodTemplateParameters(functionType);
				let returnsAList = MethodReturnsList(functionType);
				let dataChainForLoading: null = null;
				let storeModelDataChain: null = null;
				result.push(
					...AddLifeCylcleMethodInstance({
						node: lifeCylcleMethod.id,
						viewPackages,
						callback: (_cycleInstance: any) => {
							cycleInstance = _cycleInstance;
						}
					}),
					(graph: any) => {
						// With a variety of parameters, this will need to be generalized to handle
						// all the possible parameters.
						if (cycleInstance) {
							return ConnectLifecycleMethod({
								target: method,
								source: cycleInstance.id,
								graph,
								viewPackages,
								connectToParameter: (ae: any) => {
									let param = GetNodeProp(ae, NodeProperties.UIText);
									const valueScreenOptionNavigateTargetApi = GetNodesLinkedTo(graph, {
										id: screen_option.id,
										link: LinkType.ComponentInternalApi
									}).find((x: any) => GetNodeTitle(x) === param);
									if (valueScreenOptionNavigateTargetApi) {
										return {
											target: valueScreenOptionNavigateTargetApi.id,
											linkProperties: {
												properties: {
													...LinkProperties.ComponentApi
												}
											}
										};
									}
									return false;
								},
								callback: (context: { apiEndPoints: any[] }, graph: any) => {
									if (context.apiEndPoints) {
										context.apiEndPoints.filter((d: { id: any }) => {
											const temp = GetNodesLinkedTo(graph, {
												id: d.id,
												link: LinkType.ComponentApiConnection
											}).find(
												(v: any) =>
													functionTypeParameters
														? functionTypeParameters[GetCodeName(v)]
														: false
											);
											if (temp) {
												apiEndpoints[GetCodeName(temp)] = d;
											}
											return temp;
										});
									}
								}
							});
						}
						return [];
          },
          //Returns a MODEL and an instanceType[IS edit]
					...(!returnsAList && instanceType
						? [
								LoadModel({
									screen: screen,
									viewPackages,
									model_view_name: `Load ${GetCodeName(
										GetNodeProp(screen, NodeProperties.Model)
									)} into state`,
									model_item: `Models.${GetCodeName(GetNodeProp(screen, NodeProperties.Model))}`,
									callback: (context: { entry: any }) => {
										dataChainForLoading = context.entry;
									}
								}),
								{
									operation: ADD_LINK_BETWEEN_NODES,
									options() {
										return {
											target: dataChainForLoading,
											source: cycleInstance ? cycleInstance.id : null,
											properties: {
												...LinkProperties.DataChainLink
											}
										};
									}
								}
							]
						: []),
					//Returns a model and not an instanceType[not edit]
					...(!returnsAList && !instanceType
						? [
								(graph: Graph) => {
									let model = GetNodeProp(screen, NodeProperties.Model, graph);
									return StoreModelInLake({
										modelId: model,
										modelInsertName: GetLambdaVariableTitle(model, false, true),
										model: GetNodeTitle(model),
										viewPackages,
										callback: (dcontext: { entry: string }) => {
											datachain = dcontext.entry;
										}
									});
								},
								() => {
									return [
										{
											operation: ADD_LINK_BETWEEN_NODES,
											options() {
												return {
													properties: { ...LinkProperties.DataChainLink },
													target: datachain,
													source: cycleInstance ? cycleInstance.id : null
												};
											}
										}
									];
								}
							]
						: []),
					//Returns a LIST and not an instanceType[not edit]
					...(returnsAList && !instanceType
						? [
								...StoreModelArrayStandard({
									viewPackages,
									model: GetNodeProp(screen, NodeProperties.Model),
									modelText: GetNodeTitle(screen),
									state_key: `${GetNodeTitle(GetNodeProp(screen, NodeProperties.Model))} State`,
									callback: (context: { entry: any }) => {
										storeModelDataChain = context.entry;
									}
								}),
								() => {
									return [
										{
											operation: ADD_LINK_BETWEEN_NODES,
											options() {
												return {
													target: storeModelDataChain,
													source: cycleInstance ? cycleInstance.id : null,
													properties: {
														...LinkProperties.DataChainLink,
														singleLink: true,
														nodeTypes: [ NodeTypes.DataChain ]
													}
												};
											}
										}
									];
								}
							]
						: []),
					() => {
						if (apiEndpoints) {
							return Object.keys(apiEndpoints).map((key) => {
								const apiEndpoint = apiEndpoints[key];
								let internalComponentApi = internalComponentApis.find(
									(v: any) => GetCodeName(v) === key
								);
								if (!internalComponentApi) {
									internalComponentApi = internalComponentApis.find(
										(v: any) => GetCodeName(v) === 'value'
									);
								}
								if (apiEndpoint && internalComponentApi) {
									return {
										operation: ADD_LINK_BETWEEN_NODES,
										options: {
											source: apiEndpoint.id,
											target: internalComponentApi.id,
											properties: { ...LinkProperties.ComponentApi }
										}
									};
								}
								return false;
							});
						}
						return false;
					}
				);
			});
		graphOperation(result)(GetDispatchFunc(), GetStateFunc());
	});
}
export function MethodReturnsList(functionType: string): boolean {
	let methodFunctionProperties = MethodFunctions[functionType];
	if (methodFunctionProperties) {
		return methodFunctionProperties.isList;
	}
	return false;
}
export function GetMethodTemplateParameters(functionType: string) {
	let methodFunctionProperties = MethodFunctions[functionType];
	if (methodFunctionProperties && methodFunctionProperties.parameters) {
		let { parameters } = methodFunctionProperties.parameters;
		if (parameters) {
			let { template } = parameters;
			if (template) {
				return template;
			}
		}
	}
	return null;
}
