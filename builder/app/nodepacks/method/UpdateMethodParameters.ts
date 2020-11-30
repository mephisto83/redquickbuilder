import { GetNodesLinkedTo } from '../../methods/graph_methods';
import * as GraphMethods from '../../methods/graph_methods';
import { GetCurrentGraph, GetNodeProp, GetNodesByProperties, REMOVE_NODE, ADD_NEW_NODE } from '../../actions/uiActions';
import { LinkType, NodeProperties, LinkProperties, NodeTypes } from '../../constants/nodetypes';
import { uuidv4 } from '../../utils/array';
import { MethodFunctions } from '../../constants/functiontypes';
import * as Titles from '../../components/titles';

export default function UpdateMethodParameters(args: any = {}) {
	let { methodType, current } = args;
	if (!methodType) {
		throw 'no node';
	}
	if (!current) {
		throw 'no method';
	}

	const graph = GetCurrentGraph();
	const result = [];
	let { viewPackages } = args;
	viewPackages = {
		[NodeProperties.ViewPackage]: uuidv4(),
		...viewPackages || {}
	};

	const toRemove: any = [];
	GetNodesLinkedTo(graph, {
		id: current
	})
		.filter((t: any) => {
			return GetNodeProp(t, NodeProperties.NODEType) === NodeTypes.MethodApiParameters;
		})
		.map((t: any) => {
			toRemove.push(t.id);
			const viewPackageId = GetNodeProp(t, NodeProperties.ViewPackage);
			if (viewPackageId)
				GetNodesByProperties({
					[NodeProperties.ViewPackage]: viewPackageId
				}).map((v) => {
					toRemove.push(v.id);
				});
			GraphMethods.GetNodesLinkedTo(graph, {
				id: t.id
			})
				.filter((w: any) => {
					return GetNodeProp(w, NodeProperties.NODEType) === NodeTypes.MethodApiParameters;
				})
				.map((v: any) => {
					toRemove.push(v.id);
				});
		});

	result.push(
		...toRemove.map((v: any) => {
			return {
				operation: REMOVE_NODE,
				options() {
					return { id: v };
				}
			};
		})
	);
	if (MethodFunctions[methodType]) {
		const { parameters } = MethodFunctions[methodType];
		if (parameters) {
			const { body } = parameters;
			const params: any = parameters.parameters;
			const operations: any = [
				body
					? {
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.MethodApiParameters,
									properties: {
										...viewPackages,
										[NodeProperties.UIText]: Titles.Body,
										[NodeProperties.UriBody]: true
									},
									links: [
										{
											target: current,
											linkProperties: {
												properties: {
													...LinkProperties.MethodApiParameters,
													body: !!body
												}
											}
										}
									]
								};
							}
						}
					: false
			].filter((x) => x);
			if (params) {
				const { query, template } = params;
				if (query) {
					let queryNodeId: any = null;
					operations.push(
						{
							operation: ADD_NEW_NODE,
							options() {
								return {
									nodeType: NodeTypes.MethodApiParameters,
									properties: {
										...viewPackages,
										[NodeProperties.UIText]: 'Query',
										[NodeProperties.QueryParameterObject]: true
									},
									callback(queryNode: any) {
										queryNodeId = queryNode.id;
									},
									links: [
										{
											target: current,
											linkProperties: {
												properties: {
													...LinkProperties.MethodApiParameters,
													params: true,
													query: true
												}
											}
										}
									]
								};
							}
						},
						...Object.keys(query).map((q) => {
							return {
								operation: ADD_NEW_NODE,
								options() {
									return {
										nodeType: NodeTypes.MethodApiParameters,
										groupProperties: {},
										parent: queryNodeId,
										properties: {
											...viewPackages,
											[NodeProperties.UIText]: q,
											[NodeProperties.QueryParameterParam]: true,
											[NodeProperties.QueryParameterParamType]: q
										},
										linkProperties: {
											properties: {
												...LinkProperties.MethodApiParameters,
												parameter: q
											}
										}
									};
								}
							};
						})
					);
				}
				if (template) {
					let templateParameterId: any = null;
					operations.push(
						{
							operation: ADD_NEW_NODE,
							options: () => {
								return {
									nodeType: NodeTypes.MethodApiParameters,
									properties: {
										...viewPackages,
										[NodeProperties.UIText]: 'TemplateParameters',
										[NodeProperties.TemplateParameter]: true
									},
									callback(queryNode: any) {
										templateParameterId = queryNode.id;
									},
									links: [
										{
											target: current,
											linkProperties: {
												properties: {
													...LinkProperties.MethodApiParameters,
													params: true,
													template: true
												}
											}
										}
									]
								};
							}
						},
						...Object.keys(template).map((q) => {
							return {
								operation: ADD_NEW_NODE,
								options() {
									return {
										nodeType: NodeTypes.MethodApiParameters,
										groupProperties: {},
										parent: templateParameterId,
										properties: {
											...viewPackages,
											[NodeProperties.UIText]: q,
											[NodeProperties.TemplateParameter]: true,
											[NodeProperties.TemplateParameterType]: q
										},
										linkProperties: {
											properties: {
												...LinkProperties.MethodApiParameters,
												parameter: q
											}
										}
									};
								}
							};
						})
					);
				}
			}
			result.push(...operations);
		}
	}
	return result;
}
