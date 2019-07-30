import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetRootGraph, NodeTypes } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace, STANDARD_TEST_USING, NEW_LINE } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTemplateKeys } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import PermissionGenerator from './permissiongenerator';
import ValidationRuleGenerator from './validationrulegenerator';
import { enumerate } from '../utils/utils';

const STREAM_PROCESS_ORCHESTRATION_TEMPLATE = './app/templates/stream_process/stream_process_orchestration.tpl';
const STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE = './app/templates/stream_process/stream_process_orchestration_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS = './app/templates/stream_process/stream_process_orchestration_agenttype_methods.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE = './app/templates/stream_process/stream_process_orchestration_agenttype_methods_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES = './app/templates/stream_process/stream_process_orchestration_selected_staged_changes.tpl';
const STREAM_METHOD_TESTS = './app/templates/stream_process/tests/stream_process_execution_tests.tpl';
const CREATE_MODEL_TESTS = './app/templates/stream_process/tests/create_model_tests.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
export default class StreamProcessOrchestrationGenerator {
    static GenerateStaticMethods(models) {

        let _streamProcessFunctionTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES, 'utf8');
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
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS, 'utf8');

        let result = [];
        let modelexecution = [];
        models.map(model => {
            modelexecution.push(Tabs(4) + `await Process${GetNodeProp(model, NodeProperties.CodeName)}Changes();` + jNL);
        })
        result.push(`       public async Task ProcessStagedChanges(Distribution distribution = null) {
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
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE, 'utf8');

        let result = [];
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
        let functions = NodesByType(state, NodeTypes.Method);
        let res = '';
        // STREAM_METHOD_TESTS
        let _stramMethodTests = fs.readFileSync(STREAM_METHOD_TESTS, 'utf8');
        let _createModelTests = fs.readFileSync(CREATE_MODEL_TESTS, 'utf8');

        res = functions.map((func, index) => {
            let methodProps = GetNodeProp(func, NodeProperties.MethodProps);
            let method = GetNodeProp(func, NodeProperties.MethodType);
            //      let cases = null;
            if (methodProps) {
                var agentTypeNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.AgentType]);
                var modelNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Model]);
                var userTypeNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.User]);
                var permissionNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Permission]);
                if (graph && permissionNode && method && agentTypeNode && modelNode) {
                    //   cases = PermissionGenerator.EnumeratePermissionCases(graph, permissionNode, method, agentTypeNode, modelNode);
                }
            }
            if (modelNode && agentTypeNode && func) {
                return bindTemplate(_stramMethodTests, {
                    model: GetNodeProp(modelNode, NodeProperties.CodeName),
                    agent_type: GetNodeProp(agentTypeNode, NodeProperties.CodeName),
                    function_name: GetNodeProp(func, NodeProperties.CodeName),
                    test_name: `${GetNodeProp(func, NodeProperties.CodeName)}Test`
                });
            }
        }).filter(x => x).join(NEW_LINE);
        let func_Cases = [];
        functions.map((func, index) => {
            let methodProps = GetNodeProp(func, NodeProperties.MethodProps);
            let method = GetNodeProp(func, NodeProperties.MethodType);
            let cases = null;
            if (methodProps) {
                var agentTypeNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.AgentType]);
                var modelNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Model]);
                var permissionNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Permission]);
                if (graph && permissionNode && method && agentTypeNode && modelNode) {
                    let validators = StreamProcessOrchestrationGenerator.GetFunctionValidators(state, func);
                    let validatorCases = null;
                    if (validators && validators.length) {
                        validatorCases = validators.map(validator => {
                            return {
                                cases: ValidationRuleGenerator.GenerateValidationCases(graph, validator),
                                isModel: GetNodeProp(validator, NodeProperties.ValidatorModel) === methodProps[FunctionTemplateKeys.Model]
                            };
                        })
                    }
                    if (validatorCases)
                        enumerate(validatorCases.map(x => x.cases.length)).map((_enum, caseindex) => {
                            let v1 = validatorCases[0].cases[_enum[0]];
                            let v2 = validatorCases[1].cases[_enum[1]];
                            let agent_properties = '';
                            let model_properties = '';
                            if (!validatorCases[1].isModel) {
                                agent_properties = bindTemplate(v2.set_properties, { model: "agent" });
                                model_properties = bindTemplate(v1.set_properties, { model: "model" });
                            }
                            else {
                                agent_properties = bindTemplate(v2.set_properties, { model: "model" });
                                model_properties = bindTemplate(v1.set_properties, { model: "agent" });
                            }
                            // cases.map((_case, caseindex) => {
                            func_Cases.push(bindTemplate(_createModelTests, {
                                model: GetNodeProp(modelNode, NodeProperties.CodeName),
                                agent_type: GetNodeProp(agentTypeNode, NodeProperties.CodeName),
                                set_agent_propeties: agent_properties,
                                set_model_properties: model_properties,
                                function_name: GetNodeProp(func, NodeProperties.CodeName),
                                test_result: !(v1.resultSuccess && v2.resultSuccess),
                                test_name: `${GetNodeProp(func, NodeProperties.CodeName)}${caseindex}Test`
                            }));

                        })
                    //  });
                }
            }
        }).join(NEW_LINE);
        return res + NEW_LINE + func_Cases.join(NEW_LINE);
    }
    static EnumerateFunctionValidators(state, func) {
        let graph = GetRootGraph(state);
        let methodProps = GetNodeProp(func, NodeProperties.MethodProps);
        let validators = StreamProcessOrchestrationGenerator.GetFunctionValidators(state, func);
        let validatorCases = null;
        if (validators && validators.length) {
            validatorCases = validators.map(validator => {
                return {
                    cases: ValidationRuleGenerator.GenerateValidationCases(graph, validator),
                    isModel: GetNodeProp(validator, NodeProperties.ValidatorModel) === methodProps[FunctionTemplateKeys.Model]
                };
            })
        }
        return enumerate((validatorCases || []).map(x => x.cases.length)).map((_enum, caseindex) => {
            let v1 = validatorCases[0].cases[_enum[0]];
            let v2 = validatorCases[1].cases[_enum[1]];
            let agent_properties = '';
            let model_properties = '';
            if (!validatorCases[1].isModel) {
                agent_properties = bindTemplate(v2.set_properties, { model: "agent" });
                model_properties = bindTemplate(v1.set_properties, { model: "model" });
                v2.propertyInformation.map(t => t.set_properties = bindTemplate(t.set_properties, { model: "agent" }));
                v1.propertyInformation.map(t => t.set_properties = bindTemplate(t.set_properties, { model: "model" }));
                return {
                    agent: v2,
                    model: v1
                }
            }
            else {
                agent_properties = bindTemplate(v2.set_properties, { model: "model" });
                model_properties = bindTemplate(v1.set_properties, { model: "agent" });
                v2.propertyInformation.map(t => t.set_properties = bindTemplate(t.set_properties, { model: "model" }));
                v1.propertyInformation.map(t => t.set_properties = bindTemplate(t.set_properties, { model: "agent" }));
                return {
                    model: v2,
                    agent: v1
                }
            }
        });
    }
    static GetFunctionValidators(state, funct) {
        return NodesByType(state, NodeTypes.Validator).filter(x => GetNodeProp(x, NodeProperties.ValidatorFunction) === funct.id);
    }
    static Generate(options) {
        var { state, key } = options;
        const StreamProcessOrchestration = 'StreamProcessOrchestration';
        let models = NodesByType(state, NodeTypes.Model);
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let _streamProcessTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE, 'utf8');
        let _streamProcessInterfaceTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE, 'utf8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
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
                        `${namespace}${NameSpace.Executors}`,
                        `${namespace}${NameSpace.Extensions}`,
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