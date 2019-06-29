import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING, Methods, ExecutorRules } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const MODEL_GET_CLASS = './app/templates/models/gets/model_get_class.tpl';
const MODEL_GET_FUNCTION = './app/templates/models/gets/model_get_function.tpl';
const MODEL_GET_MANY_TO_MANY_FUNCTION = './app/templates/models/gets/model_get_many_to_many_function.tpl';
const MODEL_GET_MANY_TO_MANY_FUNCTION_GET_CHILD = './app/templates/models/gets/model_get_many_to_many_function_get_child.tpl';

const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelGetGenerator {
    static enumerateValidationTestVectors(validation_test_vectors) {
        var vects = validation_test_vectors.map(x => Object.keys(x.values.cases).length);

        var enumeration = ModelGetGenerator.EnumerateCases(vects);
        return enumeration;
    }
    static EnumerateCases(vects, j = 0) {
        return enumerate(vects, j);
    }
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += `    `;
        }
        return res;
    }
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let _get_class = fs.readFileSync(MODEL_GET_CLASS, 'utf-8');
        let _get_methods = fs.readFileSync(MODEL_GET_FUNCTION, 'utf-8');
        let _get_methods_many_to_many = fs.readFileSync(MODEL_GET_MANY_TO_MANY_FUNCTION, 'utf-8');
        let _get_method_many_to_many_get_child = fs.readFileSync(MODEL_GET_MANY_TO_MANY_FUNCTION_GET_CHILD, 'utf-8');
        let allmodels = NodesByType(state, NodeTypes.Model);
        allmodels.map(agent => {
            var methods = allmodels.filter(x => x.id !== agent.id)
                .filter(x => {
                    if (GetNodeProp(agent, NodeProperties.HasLogicalChildren) && (GetNodeProp(agent, NodeProperties.LogicalChildrenTypes) || []).some(v => v === x.id)) {
                        if (!GetNodeProp(agent, NodeProperties.ManyToManyNexus))
                            return true;
                    }
                    return false;
                })
                .map(model => {
                    return bindTemplate(_get_methods, {
                        agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                        model: GetNodeProp(model, NodeProperties.CodeName),
                    });
                });

            if (GetNodeProp(agent, NodeProperties.ManyToManyNexus)) {
                var childrenTypes = (GetNodeProp(agent, NodeProperties.LogicalChildrenTypes) || []);
                if (childrenTypes && childrenTypes.length) {
                    let namesAreUnique = childrenTypes.map(t => GetNodeProp(GraphMethods.GetNode(graph, t), NodeProperties.CodeName)).unique(x => x).length === childrenTypes.length;
                    childrenTypes.map(ct => {
                        methods.push(bindTemplate(_get_method_many_to_many_get_child, {
                            model: GetNodeProp(GraphMethods.GetNode(graph, ct), NodeProperties.CodeName),
                            many_to_many: GetNodeProp(agent, NodeProperties.CodeName)
                        }));
                    })
                    enumerate([].interpolate(0, childrenTypes.length, function () {
                        return childrenTypes.length + 1;
                    })).filter(x => x.length === x.unique(t => t).length)
                        .map(model => {
                            let params = model.subset(0, model.length).map((t, index) => {
                                if (childrenTypes.length === t) {
                                    return false;
                                }
                                let paramName = `x${index}`;
                                if (namesAreUnique) {
                                    paramName = GetNodeProp(GraphMethods.GetNode(graph, childrenTypes[t]), NodeProperties.CodeName).toLowerCase();
                                }
                                return bindTemplate(`{{_type}} ${paramName}`, {
                                    _type: GetNodeProp(GraphMethods.GetNode(graph, childrenTypes[t]), NodeProperties.CodeName)
                                })
                            }).filter(x => x);
                            if (params.length) {
                                methods.push(bindTemplate(_get_methods_many_to_many, {
                                    parameters: params.join(', '),
                                    query: model.subset(0, model.length).map((t, index) => {
                                        if (childrenTypes.length === t) {
                                            return false;
                                        }

                                        let paramName = `x${index}`;
                                        if (namesAreUnique) {
                                            paramName = GetNodeProp(GraphMethods.GetNode(graph, childrenTypes[t]), NodeProperties.CodeName).toLowerCase();
                                        }

                                        return bindTemplate(`item.{{_type}} == ${paramName}.Id`, {
                                            _type: GetNodeProp(GraphMethods.GetNode(graph, childrenTypes[t]), NodeProperties.CodeName)
                                        })
                                    }).filter(x => x).join(' && '),// 
                                    model: GetNodeProp(agent, NodeProperties.CodeName),
                                }));
                            }
                        });
                }
            }
            let templateRes = bindTemplate(_get_class, {
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                functions: methods.unique(x => x).join(NEW_LINE)
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
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Controllers
                })
            };
        })

        return result;
    }
}