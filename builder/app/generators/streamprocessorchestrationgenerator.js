import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetRootGraph, NodeTypes } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace, STANDARD_TEST_USING, NEW_LINE } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTemplateKeys } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const STREAM_PROCESS_ORCHESTRATION_TEMPLATE = './app/templates/stream_process/stream_process_orchestration.tpl';
const STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE = './app/templates/stream_process/stream_process_orchestration_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS = './app/templates/stream_process/stream_process_orchestration_agenttype_methods.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE = './app/templates/stream_process/stream_process_orchestration_agenttype_methods_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES = './app/templates/stream_process/stream_process_orchestration_selected_staged_changes.tpl';
const STREAM_METHOD_TESTS = './app/templates/stream_process/tests/stream_process_execution_tests.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
export default class StreamProcessOrchestrationGenerator {
    static GenerateStaticMethods(models) {

        let _streamProcessFunctionTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES, 'utf-8');
        let staticMethods = models.map(model => {
            let streamProcessFunctionTemplate = _streamProcessFunctionTemplate;
            let modelCode = GetNodeProp(model, NodeProperties.CodeName);
            let res = bindTemplate(streamProcessFunctionTemplate, {
                model: modelCode,
                [`model#allupper`]: modelCode.toUpperCase(),
                [`model#lower`]: modelCode.toLowerCase()
            });

            return res + jNL
        });

        return staticMethods;
    }
    static GenerateAgentMethods(state) {
        let models = NodesByType(state, NodeTypes.Model);
        let agents = models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS, 'utf-8');

        let result = [];
        let modelexecution = [];
        models.map(model => {
            modelexecution.push(Tabs(4) + `await Process${GetNodeProp(model, NodeProperties.CodeName)}Changes();` + jNL);
        })
        result.push(`public async Task ProcessStagedChanges() {
${modelexecution.join('')}
        }
`)
        agents.map(agent => {
            models.map(model => {
                var res = bindTemplate(_streamAgentMethods, {
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    'model#lower': GetNodeProp(model, NodeProperties.CodeName).toLowerCase(),
                    agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                    'agent_type#lower': GetNodeProp(agent, NodeProperties.CodeName).toLowerCase()
                })
                result.push(res);
            });
        });

        return result.join('')
    }
    static GenerateAgentInterfaceMethods(state) {
        let models = NodesByType(state, NodeTypes.Model);
        let agents = models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE, 'utf-8');

        let result = [];
        result.push(`Task ProcessStagedChanges();`)
        agents.map(agent => {
            models.map(model => {
                var res = bindTemplate(_streamAgentMethods, {
                    model: GetNodeProp(model, NodeProperties.CodeName),
                    'model#lower': GetNodeProp(model, NodeProperties.CodeName).toLowerCase(),
                    agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                    'agent_type#lower': GetNodeProp(agent, NodeProperties.CodeName).toLowerCase()
                })
                result.push(res);
            });
        });

        return result.join('')
    }
    static GenerateStrappers(models) {
        let result = [];
        result.push(Tabs(4) + `validator = RedStrapper.Resolve<IValidator>();` + jNL);
        models.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(4) + `${modelName.toLowerCase()}Arbiter = RedStrapper.Resolve<IRedArbiter<${modelName}>>();` + jNL);
            result.push(Tabs(4) + `${modelName.toLowerCase()}ChangeArbiter = RedStrapper.Resolve<IRedArbiter<${modelName}Change>>();` + jNL);
            if (GetNodeProp(model, NodeProperties.IsAgent)) {
                result.push(Tabs(4) + `${modelName.toLowerCase()}ResponseArbiter = RedStrapper.Resolve<IRedArbiter<${modelName}Response>>();` + jNL);
                result.push(Tabs(4) + `${modelName.toLowerCase()}Executor = RedStrapper.Resolve<I${modelName}Executor>();` + jNL);
            }
        })

        return result.join('');
    }
    static GenerateStrappersInstances(models) {
        let result = [];

        result.push(Tabs(3) + `public IValidator validator;` + jNL);
        models.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(3) + `public IRedArbiter<${modelName}> ${modelName.toLowerCase()}Arbiter;` + jNL)
            result.push(Tabs(3) + `public IRedArbiter<${modelName}Change> ${modelName.toLowerCase()}ChangeArbiter;` + jNL)
            if (GetNodeProp(model, NodeProperties.IsAgent)) {
                result.push(Tabs(3) + `public IRedArbiter<${modelName}Response> ${modelName.toLowerCase()}ResponseArbiter;` + jNL);
                result.push(Tabs(3) + `public I${modelName}Executor ${modelName.toLowerCase()}Executor;` + jNL);
            }

        })

        return result.join('');
    }
    static GenerateProcessTests(state) {
        let graph = GetRootGraph(state);
        let functions = NodesByType(state, NodeTypes.Function);
        let res = '';
        // STREAM_METHOD_TESTS
        let _stramMethodTests = fs.readFileSync(STREAM_METHOD_TESTS, 'utf-8');

        res = functions.map((func, index) => {
            let models = GraphMethods.getNodesLinkedTo(graph, {
                id: func.id,
                constraints: {
                    key: FunctionTemplateKeys.Model
                }
            });
            if (models && models[0]) {
                models = GraphMethods.getNodesLinkedTo(graph, {
                    id: models[0].id
                })
            }
            let agents = GraphMethods.getNodesLinkedTo(graph, {
                id: func.id,
                constraints: {
                    key: FunctionTemplateKeys.AgentType
                }
            });
            if (agents && agents[0]) {
                agents = GraphMethods.getNodesLinkedTo(graph, {
                    id: agents[0].id
                })
            }
            return bindTemplate(_stramMethodTests, {
                model: GetNodeProp(models[0], NodeProperties.CodeName),
                agent_type: GetNodeProp(agents[0], NodeProperties.CodeName),
                function_name: GetNodeProp(func, NodeProperties.CodeName),
                test_name: `${GetNodeProp(func, NodeProperties.CodeName)}Test`
            });
        }).join(NEW_LINE);
        return res;
    }
    static Generate(options) {
        var { state, key } = options;
        const StreamProcessOrchestration = 'StreamProcessOrchestration';
        let models = NodesByType(state, NodeTypes.Model);
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let _streamProcessTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE, 'utf-8');
        let _streamProcessInterfaceTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE, 'utf-8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf-8');
        let agent_methods = StreamProcessOrchestrationGenerator.GenerateAgentMethods(state);
        let agent_methods_interface = StreamProcessOrchestrationGenerator.GenerateAgentInterfaceMethods(state);
        let statics = StreamProcessOrchestrationGenerator.GenerateStaticMethods(models);
        let strappers = StreamProcessOrchestrationGenerator.GenerateStrappers(models);
        let strapperInstances = StreamProcessOrchestrationGenerator.GenerateStrappersInstances(models);
        _streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
            static_methods: statics.join(''),
            agent_type_methods: agent_methods,
            arbiters_strappers: strappers,
            arbiter_instances: strapperInstances
        });
        let stream_process_tests = StreamProcessOrchestrationGenerator.GenerateProcessTests(state);
        let testTemplate = bindTemplate(_testClass, {
            name: StreamProcessOrchestration,
            tests: stream_process_tests
        })
        _streamProcessInterfaceTemplate = bindTemplate(_streamProcessInterfaceTemplate, {
            agent_type_methods: agent_methods_interface
        });
        return {
            [StreamProcessOrchestration]: {
                id: StreamProcessOrchestration,
                name: StreamProcessOrchestration,
                iname: `I${StreamProcessOrchestration}`,
                tname: `${StreamProcessOrchestration}Tests`,
                template: NamespaceGenerator.Generate({
                    template: _streamProcessTemplate,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        'System.Linq.Expressions',
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Parameters}`,
                        `${namespace}${NameSpace.Executors}`,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.StreamProcess
                }),
                interface: NamespaceGenerator.Generate({
                    template: _streamProcessInterfaceTemplate,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Parameters}`,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.StreamProcess
                }),
                test: NamespaceGenerator.Generate({
                    template: testTemplate,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        ...STANDARD_TEST_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Parameters}`,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.StreamProcess}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Tests
                })
            }
        };
    }
}
const NL = `
`
const jNL = `
`
const TAB = `   `;

function Tabs(c) {
    let res = '';
    for (var i = 0; i < c; i++) {
        res += TAB;
    }
    return res;
}