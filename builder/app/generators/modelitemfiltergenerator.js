import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph, GetNodeTitle, GetCodeName, GetMethodProps, GetMethodFilterParameters, GetMethodFilterMetaParameters, GetConditionNodes, GetCombinedCondition } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING, Methods, ExecutorRules, FilterUI, FilterRules } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType, Filter } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const RETURN_GET_CLASS = './app/templates/models/itemfilters/item_filter.tpl';
const FILTER_PROPERTY_FUNCTION_VALUE = './app/templates/models/itemfilters/filter_property_function_value.tpl';
const FILTER_PROPERTY_FUNCTION_VALUE_EQUALS = './app/templates/models/itemfilters/filter_property_function_value_equals.tpl';

const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelItemFilterGenerator {
    static predicates(nodes, out_ = {}) {

        return nodes.map(x => {
            let validator = GetNodeProp(x, NodeProperties.FilterModel);
            let params = [];
            let filterModelParams = GetMethodFilterParameters(x.id);
            if (filterModelParams && filterModelParams.length) {
                params = filterModelParams.map(x => `${x.paramName}`)
            }
            else if (validator) {
                Object.values(validator.properties).map(t => Object.values(t.validators).map(v => {
                    if (v && v.type === FilterRules.EqualsModelRef) {
                        out_[v.node] = true;
                        params.push(v.node);
                    }
                }))
                params = params.filter(x => x).unique().sort();
            }
            let text = `${GetCodeName(x)}.Filter({{predicate_parameters}})`;
            return bindTemplate(text, {
                predicate_parameters: params.join(', ')
            });
        });
    }
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let _return_get_class = fs.readFileSync(RETURN_GET_CLASS, 'utf8');
        let allfilters = NodesByType(state, NodeTypes.ModelFilter);
        let modelitemfilters = NodesByType(state, NodeTypes.ModelItemFilter);
        modelitemfilters.map(modelitemfilter => {
            var method = GraphMethods.GetMethodNode(state, modelitemfilter.id);
            var methodProps = null;
            if (method) {
                methodProps = GetMethodProps(method);
            }
            let itemFilter = GetNodeProp(modelitemfilter, NodeProperties.ModelItemFilter);
            let filterModel = GetNodeProp(modelitemfilter, NodeProperties.FilterModel);
            let conditions = GetConditionNodes(modelitemfilter.id);
            let filterMethodParameters = GetMethodFilterParameters(modelitemfilter.id);
            let meta_parameters = GetMethodFilterMetaParameters(modelitemfilter.id);
            let funcs = [];
            let parameters = [];

            if (filterModel && filterModel.properties) {
                let filterPropFunction = fs.readFileSync(FILTER_PROPERTY_FUNCTION_VALUE, 'utf8');
                let filters = [];
                Object.keys(filterModel.properties).map(prop => {
                    let propName = GetCodeName(prop);
                    if (filterModel.properties[prop]) {
                        Object.keys(filterModel.properties[prop].validators).map(validator => {
                            let _validatorProps = filterModel.properties[prop].validators[validator];
                            let validatorValue = '';
                            let validatorName = GetCodeName(validator);
                            let _function = '==';
                            let meta_parameter = 'item';
                            let filterPropFunctionValueEquals = fs.readFileSync(FILTER_PROPERTY_FUNCTION_VALUE_EQUALS, 'utf8');
                            if (_validatorProps && _validatorProps.type)
                                switch (_validatorProps.type) {
                                    case FilterRules.EqualsTrue:
                                        validatorValue = 'true';
                                        break;
                                    case FilterRules.EqualsFalse:
                                        validatorValue = 'false';
                                        break;
                                    case FilterRules.EqualsAgent:
                                        validatorValue = `agent.${propName}`;
                                        break;
                                    case FilterRules.EqualsParent:
                                        validatorValue = `parent.${propName}`;
                                        break;
                                    case FilterRules.EqualsModelRef:
                                        if (_validatorProps.node) {
                                            let mNode = GraphMethods.GetNode(graph, methodProps[_validatorProps.node]);
                                            if (mNode) {
                                                parameters.push(`${GetCodeName(mNode)} ${_validatorProps.node}`);
                                            }
                                            validatorValue = `${_validatorProps.node}.Id`;
                                        }
                                        break;
                                    case FilterRules.EqualsModelProperty:
                                        if (_validatorProps.node && _validatorProps.nodeProperty) {
                                            let mNode = GraphMethods.GetNode(graph, methodProps[_validatorProps.node]);
                                            if (mNode) {
                                                parameters.push(`${GetCodeName(mNode)} ${_validatorProps.node}`);
                                            }
                                            validatorValue = `${_validatorProps.node}.${GetCodeName(_validatorProps.nodeProperty)}`;
                                        }
                                        break;
                                    case FilterRules.IsInModelPropertyCollection:
                                        if (_validatorProps.node && _validatorProps.nodeProperty) {
                                            let mNode = GraphMethods.GetNode(graph, methodProps[_validatorProps.node]);
                                            if (mNode) {
                                                parameters.push(`${GetCodeName(mNode)} ${_validatorProps.node}`);
                                            }
                                            validatorValue = `${_validatorProps.node}.${GetCodeName(_validatorProps.nodeProperty)}`;
                                            filterPropFunctionValueEquals = FilterUI[_validatorProps.type].template;
                                        }
                                        break;
                                    default:
                                        throw 'not handled model item filter generation case';
                                }

                            filters.push(bindTemplate(filterPropFunctionValueEquals, {
                                property: propName,
                                value: validatorValue,
                                meta_parameter,
                                function: _function
                            }));
                        })
                    }
                });
                parameters = parameters.filter(x => x).unique().sort();
                if (filterMethodParameters && filterMethodParameters.length) {
                    parameters = filterMethodParameters.map(item => {
                        return `${item.paramClass} ${item.paramName}`
                    });
                }
                if (meta_parameters && meta_parameters.length) {
                    meta_parameters = meta_parameters.map(item => {
                        return `${item.paramName}`;
                    })
                }
                if (conditions && conditions.length) {
                    filters = GetCombinedCondition(modelitemfilter.id);
                }
                else {
                    filters = filters.join('');
                }

                funcs.push(bindTemplate(filterPropFunction, {
                    filter: filters,
                    model: GetCodeName(itemFilter),
                    model_output: GetCodeName(itemFilter),
                    meta_parameter: meta_parameters.join(', '),
                    parameters: parameters.join(', ')
                }))
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
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Controllers
                })
            };
        })

        return result;
    }
}