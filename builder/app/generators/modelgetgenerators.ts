/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph } from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NEW_LINE,
	ConstantsDeclaration,
	MakeConstant,
	NameSpace,
	STANDARD_CONTROLLER_USING,
	ValidationCases,
	STANDARD_TEST_USING,
	Methods,
	ExecutorRules
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';
import { fs_readFileSync } from './modelgenerators';

const MODEL_GET_CLASS = './app/templates/models/gets/model_get_class.tpl';
const MODEL_GET_FUNCTION = './app/templates/models/gets/model_get_function.tpl';
const MODEL_GET_MANY_TO_MANY_FUNCTION = './app/templates/models/gets/model_get_many_to_many_function.tpl';
const MODEL_GET_MANY_TO_MANY_FUNCTION_GET_CHILD =
	'./app/templates/models/gets/model_get_many_to_many_function_get_child.tpl';

const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelGetGenerator {
	static enumerateValidationTestVectors(validation_test_vectors: any[]) {
		const vects = validation_test_vectors.map((x: { values: { cases: {} } }) => Object.keys(x.values.cases).length);

		const enumeration = ModelGetGenerator.EnumerateCases(vects);
		return enumeration;
	}

	static EnumerateCases(vects: any, j = 0) {
		return enumerate(vects, j);
	}

	static Tabs(c: number) {
		let res = '';
		for (let i = 0; i < c; i++) {
			res += `    `;
		}
		return res;
	}

	static Generate(options: { state: any; key: any; language?: any }) {
		const { state, key } = options;
		const graphRoot = GetRootGraph(state);
		const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		const graph = GetRootGraph(state);
		const result: any = {};

		const _get_class = fs_readFileSync(MODEL_GET_CLASS, 'utf8');
		const _get_methods = fs_readFileSync(MODEL_GET_FUNCTION, 'utf8');
		const _get_methods_many_to_many = fs_readFileSync(MODEL_GET_MANY_TO_MANY_FUNCTION, 'utf8');
		const _get_method_many_to_many_get_child = fs_readFileSync(MODEL_GET_MANY_TO_MANY_FUNCTION_GET_CHILD, 'utf8');
		const allmodels = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController));
		allmodels.filter((x: any) => !GetNodeProp(x, NodeProperties.IsCompositeInput)).map((agent: { id: any }) => {
			const methods = allmodels
				.filter((x: { id: any }) => x.id !== agent.id)
				.filter((x: { id: any }) => {
					if (
						GetNodeProp(agent, NodeProperties.HasLogicalChildren) &&
						(GetNodeProp(agent, NodeProperties.LogicalChildrenTypes) || []).some((v: any) => v === x.id)
					) {
						if (!GetNodeProp(agent, NodeProperties.ManyToManyNexus)) return true;
					}
					return false;
				})
				.map((model: any) => {
					return bindTemplate(_get_methods, {
						item_property: GetNodeProp(model, NodeProperties.IsOwnedByAgents)
							? 'Owner'
							: GetNodeProp(agent, NodeProperties.CodeName),
						agent_type: GetNodeProp(agent, NodeProperties.CodeName),
						model: GetNodeProp(model, NodeProperties.CodeName)
					});
				});

			if (GetNodeProp(agent, NodeProperties.ManyToManyNexus)) {
				const childrenTypes = GetNodeProp(agent, NodeProperties.LogicalChildrenTypes) || [];
				if (childrenTypes && childrenTypes.length) {
					const namesAreUnique =
						childrenTypes
							.map((t: string) => GetNodeProp(GraphMethods.GetNode(graph, t), NodeProperties.CodeName))
							.unique((x: any) => x).length === childrenTypes.length;
					childrenTypes.map((ct: string) => {
						methods.push(
							bindTemplate(_get_method_many_to_many_get_child, {
								model: GetNodeProp(GraphMethods.GetNode(graph, ct), NodeProperties.CodeName),
								many_to_many: GetNodeProp(agent, NodeProperties.CodeName)
							})
						);
					});
					enumerate(
						[].interpolate(0, childrenTypes.length, () => {
							return childrenTypes.length + 1;
						})
					)
						.filter((x) => x.length === x.unique((t: any) => t).length)
						.forEach((model) => {
							const params = model
								.subset(0, model.length)
								.map((t: string | number, index: any) => {
									if (childrenTypes.length === t) {
										return false;
									}
									let paramName = `x${index}`;
									if (namesAreUnique) {
										paramName = GetNodeProp(
											GraphMethods.GetNode(graph, childrenTypes[t]),
											NodeProperties.CodeName
										).toLowerCase();
									}
									return bindTemplate(`{{_type}} ${paramName}`, {
										_type: GetNodeProp(
											GraphMethods.GetNode(graph, childrenTypes[t]),
											NodeProperties.CodeName
										)
									});
								})
								.filter((x: any) => x);
							if (params.length) {
								methods.push(
									bindTemplate(_get_methods_many_to_many, {
										parameters: params.join(', '),
										query: model
											.subset(0, model.length)
											.map((t: string | number, index: any) => {
												if (childrenTypes.length === t) {
													return false;
												}

												let paramName = `x${index}`;
												if (namesAreUnique) {
													paramName = GetNodeProp(
														GraphMethods.GetNode(graph, childrenTypes[t]),
														NodeProperties.CodeName
													).toLowerCase();
												}

												return bindTemplate(
													`item != null && ${paramName} != null && ${paramName}.{{_type}}.Any(v => v == item.Id)`,
													{
														_type: GetNodeProp(
															GraphMethods.GetNode(graph, childrenTypes[t]),
															NodeProperties.CodeName
														)
													}
												);
											})
											.filter((x: any) => x)
											.join(' && '), //
										model: GetNodeProp(agent, NodeProperties.CodeName)
									})
								);
							}
						});
				}
			}
			const templateRes = bindTemplate(_get_class, {
				agent_type: GetNodeProp(agent, NodeProperties.CodeName),
				functions: methods.unique((x: any) => x).join(NEW_LINE)
			});
			result[GetNodeProp(agent, NodeProperties.CodeName)] = {
				id: GetNodeProp(agent, NodeProperties.CodeName),
				name: `${GetNodeProp(agent, NodeProperties.CodeName)}Get`,
				template: NamespaceGenerator.Generate({
					template: templateRes,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.Constants}`
					],
					namespace,
					space: NameSpace.Controllers
				})
			};
		});

		return result;
	}
}
