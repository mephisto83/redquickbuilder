import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph, GetNodeTitle, GetCodeName } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING, Methods, ExecutorRules, FilterUI, FilterRules } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const RETURN_GET_CLASS = './app/templates/models/itemfilters/item_filter.tpl';
const FILTER_PROPERTY_FUNCTION_VALUE = './app/templates/models/itemfilters/filter_property_function_value.tpl';
const FILTER_PROPERTY_FUNCTION_VALUE_EQUALS = './app/templates/models/itemfilters/filter_property_function_value_equals.tpl';

const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelItemFilterGenerator {

    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let _return_get_class = fs.readFileSync(RETURN_GET_CLASS, 'utf-8');
        let allfilters = NodesByType(state, NodeTypes.ModelFilter);
        let modelitemfilters = NodesByType(state, NodeTypes.ModelItemFilter);
        modelitemfilters.map(modelitemfilter => {


            let itemFilter = GetNodeProp(modelitemfilter, NodeProperties.ModelItemFilter);
            let filterModel = GetNodeProp(modelitemfilter, NodeProperties.FilterModel);
            let funcs = [];
            if (filterModel && filterModel.properties) {
                let filterPropFunction = fs.readFileSync(FILTER_PROPERTY_FUNCTION_VALUE, 'utf-8');
                let filters = [];
                Object.keys(filterModel.properties).map(prop => {
                    let propName = GetCodeName(prop);
                    if (filterModel.properties[prop]) {
                        Object.keys(filterModel.properties[prop].validators).map(validator => {
                            let validatorName = filterModel.properties[prop].validators[validator];
                            let validatorValue = '';
                            let _function = '==';
                            switch (validatorName) {
                                case FilterRules.EqualsTrue:
                                    validatorValue = 'true';

                                    break;
                                case FilterRules.EqualsFalse:
                                    validatorValue = 'false';
                                    break;
                            }
                            let filterPropFunctionValueEquals = fs.readFileSync(FILTER_PROPERTY_FUNCTION_VALUE_EQUALS, 'utf-8');
                            filters.push(bindTemplate(filterPropFunctionValueEquals, {
                                property: propName,
                                value: validatorValue,
                                function: _function
                            }));
                        })
                    }
                });
                funcs.push(bindTemplate(filterPropFunction, {
                    filter: filters.join(''),
                    model: GetCodeName(itemFilter)
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