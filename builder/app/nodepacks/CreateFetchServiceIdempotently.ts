import { uuidv4 } from '../utils/array';
import { NodeProperties, NodeTypes } from '../constants/nodetypes';
import {
	GetCurrentGraph,
	GetNodeByProperties,
	GetNodeById,
	NodesByType,
	GetNodeProp,
	ADD_LINK_BETWEEN_NODES,
	LinkProperties,
	GetMethodNodeProp,
	REMOVE_LINK_BETWEEN_NODES,
	UPDATE_NODE_PROPERTY
} from '../actions/uiActions';
import CreateFetchParameters from './CreateFetchParameters';
import CreateFetchService from './CreateFetchService';
import CreateFetchOutput from './CreateFetchOutput';
import { MethodFunctions, FunctionTemplateKeys } from '../constants/functiontypes';
import CreatePropertiesForFetch from './CreatePropertiesForFetch';
import StoreFetchResults from './StoreFetchResults';

export default function(args: any = {}) {
	//
	const result = [];
	const context = {
		...args
	};

	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const graph = GetCurrentGraph();
	let fetchParameter = GetNodeByProperties(
		{
			[NodeProperties.IsFetchParameter]: true
		},
		graph
	);
	let fetchOutput = GetNodeByProperties(
		{
			[NodeProperties.IsFetchOutput]: true
		},
		graph
	);
	let fetchStoreage = GetNodeByProperties({
		[NodeProperties.IsFetchDataChainStorage]: true
	});
	let fetchService = GetNodeByProperties({
		[NodeProperties.NODEType]: NodeTypes.FetchService
	});

	if (!fetchParameter) {
		result.push(
			...CreateFetchParameters({
				viewPackages,
				callback: (inner: any, g: any) => {
					fetchParameter = GetNodeById(inner.entry, g);
				}
			})
		);
	}
	if (!fetchOutput) {
		result.push(
			...CreateFetchOutput({
				viewPackages,
				callback: (inner: any, g: any) => {
					fetchOutput = GetNodeById(inner.entry, g);
				}
			})
		);
	}
	if (!fetchService) {
		result.push(
			...CreateFetchService({
				viewPackages,
				callback: (inner: any, g: any) => {
					fetchService = GetNodeById(inner.entry, g);
				}
			})
		);
	}
	if (!fetchStoreage) {
		result.push(
			...StoreFetchResults({
				viewPackages,
				callback: (inner: any) => {
					fetchStoreage = inner.entry;
				}
			}),
			{
				operation: UPDATE_NODE_PROPERTY,
				options() {
					return {
						id: fetchStoreage,
						properties: {
							[NodeProperties.IsFetchDataChainStorage]: true
						}
					};
				}
			}
		);
	} else {
		fetchStoreage = fetchStoreage.id;
	}

	result.push(() => {
		const fetchCompatibleMethods = NodesByType(null, NodeTypes.Method).filter((method: any) => {
			const funcType: any = GetNodeProp(method, NodeProperties.FunctionType);
			const { isFetchCompatible = false } =
				funcType && MethodFunctions[funcType] ? MethodFunctions[funcType] : {};
			return isFetchCompatible;
		});
		const tempresult : any= [];
		fetchCompatibleMethods.forEach((fetchMethod: any) => {
			tempresult.push({
				operation: ADD_LINK_BETWEEN_NODES,
				options() {
					return {
						target: fetchMethod.id,
						source: fetchService.id,
						properties: { ...LinkProperties.FetchService }
					};
				}
			});

			const param = GetMethodNodeProp(fetchMethod, FunctionTemplateKeys.FetchParameter);
			if (fetchParameter && param !== fetchParameter.id) {
				const methodProps = {
					...GetNodeProp(fetchMethod, NodeProperties.MethodProps) || {}
				};
				methodProps[FunctionTemplateKeys.FetchParameter] = fetchParameter.id;
				tempresult.push(
					{
						operation: REMOVE_LINK_BETWEEN_NODES,
						options: {
							source: fetchMethod.id,
							target: param
						}
					},
					{
						operation: ADD_LINK_BETWEEN_NODES,
						options: {
							source: fetchMethod.id,
							target: fetchParameter.id,
							properties: { ...LinkProperties.FunctionOperator }
						}
					},
					{
						operation: UPDATE_NODE_PROPERTY,
						options() {
							return {
								id: fetchMethod.id,
								properties: { [NodeProperties.MethodProps]: methodProps }
							};
						}
					},
					{
						operation: UPDATE_NODE_PROPERTY,
						options() {
							return {
								id: fetchParameter.id,
								properties: { [NodeProperties.ExcludeFromController]: true }
							};
						}
					}
				);
			}
		});

		return tempresult;
	});

	result.push(
		{
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					target: fetchOutput.id,
					source: fetchService.id,
					properties: { ...LinkProperties.FetchServiceOuput }
				};
			}
		},
		() => ({
			operation: ADD_LINK_BETWEEN_NODES,
			options() {
				return {
					target: fetchStoreage,
					source: fetchService.id,
					properties: { ...LinkProperties.DataChainLink }
				};
			}
		})
	);
	result.push(() =>
		CreatePropertiesForFetch({
			id: fetchOutput.id
		})
	);
	return result;
}
