import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph, GetNodeTitle, GetMethodsProperties } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING, Methods, ExecutorRules } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTemplateKeys } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const RETURN_GET_CLASS = './app/templates/models/returns/returns_class.tpl';
const RETURN_GET_FUNCTION = './app/templates/models/returns/returns_funcs.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';

export default class ModelReturnGenerator {

    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let _return_get_class = fs.readFileSync(RETURN_GET_CLASS, 'utf8');
        let _return_get_methods = fs.readFileSync(RETURN_GET_FUNCTION, 'utf8');
        let allfilters = NodesByType(state, NodeTypes.ModelFilter);
        let allmodels = NodesByType(state, NodeTypes.Model).filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration))
        .filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController));
        let allagents = allmodels.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        allagents.map(agent => {
            var methods = allfilters.filter(x => {
                var methodProps = GetMethodsProperties(x.id);
                if (methodProps) {
                    return methodProps[FunctionTemplateKeys.Agent] === agent.id;
                }
            }).map(filterNode => {
                var methodProps = GetMethodsProperties(filterNode.id);
                let model = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.ModelOutput] || methodProps[FunctionTemplateKeys.Model]);
                let properties = GraphMethods.getNodesByLinkType(graph, {
                    id: model.id,
                    direction: GraphMethods.SOURCE,
                    type: LinkType.PropertyLink
                }).filter(x => x.id !== model.id).filter(t => GetNodeProp(filterNode, NodeProperties.FilterPropreties) ? GetNodeProp(filterNode, NodeProperties.FilterPropreties)[t.id] : '')
                    .map(t => {
                        return `           result.${GetNodeProp(t, NodeProperties.CodeName)} = model.${GetNodeProp(t, NodeProperties.CodeName)};`
                    }).join(NEW_LINE);
                return bindTemplate(_return_get_methods, {
                    function: GetNodeProp(filterNode, NodeProperties.CodeName),
                    agent: GetNodeProp(agent, NodeProperties.CodeName),
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    set_properties: properties
                });
            }).join(NEW_LINE);
            let templateRes = bindTemplate(_return_get_class, {
                agent: GetNodeProp(agent, NodeProperties.CodeName),
                functions: methods
            });
            result[GetNodeProp(agent, NodeProperties.CodeName)] = {
                id: GetNodeProp(agent, NodeProperties.CodeName),
                name: `${GetNodeProp(agent, NodeProperties.CodeName)}Return`,
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
