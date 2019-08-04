import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, STANDARD_CONTROLLER_USING, STANDARD_TEST_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const TEST_CLASS = './app/templates/tests/tests.tpl';
const STREAM_PROCESS_CHANGE_CLASS_EXTENSION = './app/templates/stream_process/stream_process_change_class_extention.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR = './app/templates/stream_process/stream_process_change_class_constructor.tpl';
const STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TESTS = './app/templates/stream_process/tests/stream_process_change_class_constructor.tpl';

const MODEL_STATIC_TEMPLATES = './app/templates/models/model_statics.tpl';
const PROPERTY_TABS = 6;
export default class ChangeParameterGenerator {
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += TAB;
        }
        return res;
    }
    static Generate(options) {
        var { state, key } = options;
        let models = NodesByType(state, NodeTypes.Model);
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
        let _streamProcessChangeClassExtension = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_EXTENSION, 'utf8');
        let _streamProcessChangeClassConstructors = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR, 'utf8');
        let _streamProcessChangeClassConstrictorsTest = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TESTS, 'utf8');
        let result = {};
        models.map(model => {

            agents.map(agent => {
                let streamProcessChangeClassExtension = _streamProcessChangeClassExtension;
                let testClass = _testClass;
                let properties = '';
                let statics = '';
                let constructors = [];
                let tests = [];
                let staticFunctionTemplate = fs.readFileSync(MODEL_STATIC_TEMPLATES, 'utf8');

                Object.values(Methods).filter(x => x !== Methods.Get).map(method => {

                    let streamProcessChangeClassConstructors = _streamProcessChangeClassConstructors;

                    streamProcessChangeClassConstructors = bindTemplate(streamProcessChangeClassConstructors, {
                        model: GetNodeProp(model, NodeProperties.CodeName),
                        value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
                        agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                        agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
                        change_type: `Methods.${method}`,
                        method
                    });
                    let streamProcessChangeClassConstrictorsTest = _streamProcessChangeClassConstrictorsTest;

                    streamProcessChangeClassConstrictorsTest = bindTemplate(streamProcessChangeClassConstrictorsTest, {
                        model: GetNodeProp(model, NodeProperties.CodeName),
                        value: GetNodeProp(model, NodeProperties.ValueName) || 'value',
                        agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                        agent: GetNodeProp(agent, NodeProperties.AgentName) || 'agent',
                        change_type: `Methods.${method}`,
                        method
                    });
                    constructors.push(streamProcessChangeClassConstructors);
                    tests.push(streamProcessChangeClassConstrictorsTest);

                })

                let staticDic = {
                    model: `${GetNodeProp(model, NodeProperties.CodeName)}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}`
                };
                constructors.push(bindTemplate(staticFunctionTemplate, staticDic));
                streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                    constructors: constructors.join(jNL)
                });

                testClass = bindTemplate(testClass, {
                    name: `${GetNodeProp(model, NodeProperties.CodeName)}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}`,
                    tests: tests.unique(x => x).join('')
                })

                let change_param_name = `${GetNodeProp(model, NodeProperties.CodeName)}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}`;
                result[change_param_name] = {
                    id: change_param_name,
                    name: change_param_name,
                    tname: `${GetNodeProp(model, NodeProperties.CodeName)}ChangeBy${GetNodeProp(agent, NodeProperties.CodeName)}Tests`,
                    template: NamespaceGenerator.Generate({
                        template: streamProcessChangeClassExtension,
                        usings: [
                            ...STANDARD_CONTROLLER_USING,
                            `${namespace}${NameSpace.Constants}`,
                            `${namespace}${NameSpace.Model}`],
                        namespace,
                        space: NameSpace.Parameters
                    }),
                    test: NamespaceGenerator.Generate({
                        template: testClass,
                        usings: [
                            ...STANDARD_CONTROLLER_USING,
                            ...STANDARD_TEST_USING,
                            `${namespace}${NameSpace.Constants}`,
                            `${namespace}${NameSpace.Parameters}`,
                            `${namespace}${NameSpace.Model}`],
                        namespace,
                        space: NameSpace.Tests
                    })
                };

            });
        })

        return result;
    }
}
const NL = `
                    `
const jNL = `
`
const TAB = `   `;