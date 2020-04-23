import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodesByType,
	NodeTypes,
	GetRootGraph,
	GetNodeTitle,
	GetCodeName,
	GetMethodProps,
	GetMethodFilterParameters,
	GetMethodFilterMetaParameters,
	GetConditionNodes,
	GetCombinedCondition,
	GetFunctionType
} from '../actions/uiactions';
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
	ExecutorRules,
	FilterUI,
	FilterRules
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';
import { NodeType, Filter } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const RETURN_GET_CLASS = './app/templates/models/itemfilters/item_filter.tpl';
const FILTER_PROPERTY_FUNCTION_VALUE = './app/templates/models/itemfilters/filter_property_function_value.tpl';
const FILTER_PROPERTY_FUNCTION_VALUE_EQUALS =
	'./app/templates/models/itemfilters/filter_property_function_value_equals.tpl';

const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelItemFilterGenerator {
	static predicates(nodes: any, out_: any = {}) {
		return nodes.map((x: any) => {
			let validator = GetNodeProp(x, NodeProperties.FilterModel);
			let params: any = [];
			let filterModelParams = GetMethodFilterParameters(x.id);
			if (filterModelParams && filterModelParams.length) {
				params = filterModelParams.map((x: { paramName: any }) => `${x.paramName}`);
			} else if (validator) {
				Object.values(validator.properties).map((t: any) =>
					Object.values(t.validators).map((v: any) => {
						if (v && v.type === FilterRules.EqualsModelRef) {
							out_[v.node] = true;
							params.push(v.node);
						}
					})
				);
				params = params.filter((x: any) => x).unique().sort();
			}
			let text = `${GetCodeName(x)}.Filter({{predicate_parameters}})`;
			return bindTemplate(text, {
				predicate_parameters: params.join(', ')
			});
		});
	}
	static GetFilterModel(graph: any, methodNode: any) {
		var node = null;
		var methodProps = GetMethodProps(methodNode);
		if (methodProps) {
			switch (GetFunctionType(methodNode)) {
				case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
					node = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.ManyToManyModel]);
					break;
				case FunctionTypes.Create_Object_Agent_Value__IListObject:
				case FunctionTypes.Get_Parent$Child_Agent_Value__IListChild:
				case FunctionTypes.Create_Parent$Child_Agent_Value__IListChild:
				case FunctionTypes.Create_Parent_Child_Agent_Value__Child:
				default:
					node = GraphMethods.GetNode(
						graph,
						methodProps[FunctionTemplateKeys.ModelOutput] || methodProps[FunctionTemplateKeys.Model]
					);
					break;
			}
		}
		return node;
	}
	static Generate(options: { state: any; key: any; language?: any }) {
		var { state, key } = options;
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		let graph = GetRootGraph(state);
		let result: any = {};

		let _return_get_class = fs.readFileSync(RETURN_GET_CLASS, 'utf8');
		let allfilters = NodesByType(state, NodeTypes.ModelFilter);
		let modelitemfilters = NodesByType(state, NodeTypes.ModelItemFilter);
		modelitemfilters.map((modelitemfilter: { id: string }) => {
			var method = GraphMethods.GetMethodNode(state, modelitemfilter.id);
			var methodProps = null;
			let filterModelNode = null;
			if (method) {
				methodProps = GetMethodProps(method);
				filterModelNode = ModelItemFilterGenerator.GetFilterModel(graphRoot, method);
			}
			let itemFilter =
				GetNodeProp(modelitemfilter, NodeProperties.ModelItemFilter) ||
				(filterModelNode ? filterModelNode.id : null);
			let filterModel = GetNodeProp(modelitemfilter, NodeProperties.FilterModel);
			let conditions = GetConditionNodes(modelitemfilter.id);
			let filterMethodParameters = GetMethodFilterParameters(modelitemfilter.id);
			let meta_parameters = GetMethodFilterMetaParameters(modelitemfilter.id);
			let funcs = [];
			let parameters: any[] = [];

			if (true || (filterModel && filterModel.properties)) {
				let filterPropFunction = fs.readFileSync(FILTER_PROPERTY_FUNCTION_VALUE, 'utf8');
				let filters: any = [];
				parameters = parameters.filter((x) => x).unique().sort();
				if (filterMethodParameters && filterMethodParameters.length) {
					parameters = filterMethodParameters.map((item: { paramClass: any; paramName: any }) => {
						return `${item.paramClass} ${item.paramName}`;
					});
				}
				if (meta_parameters && meta_parameters.length) {
					meta_parameters = meta_parameters.map((item: { paramName: any }) => {
						return `${item.paramName}`;
					});
				}
				if (conditions && conditions.length) {
					filters = GetCombinedCondition(modelitemfilter.id);
				} else {
					filters = filters.join('');
				}

				funcs.push(
					bindTemplate(filterPropFunction, {
						filter: filters,
						model: GetCodeName(itemFilter),
						model_output: GetCodeName(itemFilter),
						meta_parameter: meta_parameters.join(', '),
						parameters: parameters.join(', ')
					})
				);
			}
			let templateRes = bindTemplate(_return_get_class, {
				code_name: GetNodeProp(modelitemfilter, NodeProperties.CodeName),
				filter: funcs
			});

			result[GetNodeProp(modelitemfilter, NodeProperties.CodeName)] = {
				id: GetNodeProp(modelitemfilter, NodeProperties.CodeName),
				name: `${GetNodeProp(modelitemfilter, NodeProperties.CodeName)}`,
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
