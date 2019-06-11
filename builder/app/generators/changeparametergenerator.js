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

        let _testClass = fs.readFileSync(TEST_CLASS, 'utf-8');
        let _streamProcessChangeClassExtension = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_EXTENSION, 'utf-8');
        let _streamProcessChangeClassConstructors = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR, 'utf-8');
        let _streamProcessChangeClassConstrictorsTest = fs.readFileSync(STREAM_PROCESS_CHANGE_CLASS_CONSTRUCTOR_TESTS, 'utf-8');
        let result = {};
        models.map(agent => {
            let streamProcessChangeClassExtension = _streamProcessChangeClassExtension;
            let testClass = _testClass;
            let properties = '';
            let statics = '';
            let constructors = [];
            let tests = [];
            let staticFunctionTemplate = fs.readFileSync(MODEL_STATIC_TEMPLATES, 'utf-8');
            agents.map(model => {
                Object.values(Methods).filter(x => x !== Methods.Get).map(method => {

                    let streamProcessChangeClassConstructors = _streamProcessChangeClassConstructors;

                    streamProcessChangeClassConstructors = bindTemplate(streamProcessChangeClassConstructors, {
                        model: GetNodeProp(agent, NodeProperties.CodeName),
                        value: GetNodeProp(agent, NodeProperties.ValueName) || 'value',
                        agent_type: GetNodeProp(model, NodeProperties.CodeName),
                        agent: GetNodeProp(model, NodeProperties.AgentName) || 'agent',
                        change_type: `Methods.${method}`,
                        method
                    });
                    let streamProcessChangeClassConstrictorsTest = _streamProcessChangeClassConstrictorsTest;

                    streamProcessChangeClassConstrictorsTest = bindTemplate(streamProcessChangeClassConstrictorsTest, {
                        model: GetNodeProp(agent, NodeProperties.CodeName),
                        value: GetNodeProp(agent, NodeProperties.ValueName) || 'value',
                        agent_type: GetNodeProp(model, NodeProperties.CodeName),
                        agent: GetNodeProp(model, NodeProperties.AgentName) || 'agent',
                        change_type: `Methods.${method}`,
                        method
                    });
                    constructors.push(streamProcessChangeClassConstructors);
                    tests.push(streamProcessChangeClassConstrictorsTest);

                })
            }).join(jNL);

            let staticDic = {
                model: `${GetNodeProp(agent, NodeProperties.CodeName)}Change`
            };
            constructors.push(bindTemplate(staticFunctionTemplate, staticDic));
            streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
                model: GetNodeProp(agent, NodeProperties.CodeName),
                constructors: constructors.join(jNL)
            });

            testClass = bindTemplate(testClass, {
                name: `${GetNodeProp(agent, NodeProperties.CodeName)}Change`,
                tests: tests.unique(x => x).join('')
            })


            result[GetNodeProp(agent, NodeProperties.CodeName)] = {
                id: GetNodeProp(agent, NodeProperties.CodeName),
                name: `${GetNodeProp(agent, NodeProperties.CodeName)}Change`,
                tname: `${GetNodeProp(agent, NodeProperties.CodeName)}ChangeTests`,
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
        })

        return result;
    }
}
const NL = `
                    `
const jNL = `
`
const TAB = `   `;