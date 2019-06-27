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
        let agentFunctionDic = {};
        let agentFunctionInterfaceDic = {};
        let agmCombos = [];
        let allmodels = NodesByType(state, NodeTypes.Model);
        let allagents = allmodels.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        allmodels.map(agent => {
            var methods = allmodels.filter(x => x.id !== agent.id)
                .filter(x => {
                    if (GetNodeProp(agent, NodeProperties.IsParent) && GetNodeProp(agent, NodeProperties.UIChoiceNode) === x.id) {
                        return true;
                    }
                    return false;
                })
                .map(model => {
                    return bindTemplate(_get_methods, {
                        agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                        model: GetNodeProp(model, NodeProperties.CodeName),
                    });
                }).join(NEW_LINE);
            let templateRes = bindTemplate(_get_class, {
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                functions: methods
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