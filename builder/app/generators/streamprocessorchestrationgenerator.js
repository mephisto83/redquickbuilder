import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, GetRootGraph, NodeTypes, GetCodeName, GetMethodProps, IsAgent, GetGraphNode } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, STANDARD_CONTROLLER_USING, NameSpace, STANDARD_TEST_USING, NEW_LINE, Methods } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTemplateKeys, MethodFunctions, AFTER_EFFECTS } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import PermissionGenerator from './permissiongenerator';
import ValidationRuleGenerator from './validationrulegenerator';
import { enumerate } from '../utils/utils';

const STREAM_PROCESS_ORCHESTRATION_TEMPLATE = './app/templates/stream_process/stream_process_orchestration.tpl';
const STREAM_PROCESS_ORCHESTRATION_ROOT_TEMPLATE = './app/templates/stream_process/stream_process_orchestration_root.tpl';
const STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE = './app/templates/stream_process/stream_process_orchestration_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS = './app/templates/stream_process/stream_process_orchestration_agenttype_methods.tpl';
const STREAM_PROCESS_AGENT_CRUD_UPDATE = './app/templates/stream_process/agent_methods/update.tpl';
const STREAM_PROCESS_AGENT_CRUD_CREATE = './app/templates/stream_process/agent_methods/create.tpl';
const STREAM_PROCESS_AGENT_CRUD_DELETE = './app/templates/stream_process/agent_methods/delete.tpl';
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
    static GenerateAgentMethods(state, agent) {
        let models = NodesByType(state, NodeTypes.Model);
        let methods = NodesByType(state, NodeTypes.Method);
        let agents = [agent] // models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS, 'utf8');
        models = models.filter(model => {
            return methods.find(method => {
                var props = GetMethodProps(method);
                return props[FunctionTemplateKeys.Agent] === agent.id &&
                    (props[FunctionTemplateKeys.Model] === model.id ||
                        props[FunctionTemplateKeys.CompositeInput] === model.id);
            })
        });
        let result = [];
        let modelexecution = [];
        let executors = NodesByType(state, NodeTypes.Executor).filter(x => GetNodeProp(x, NodeProperties.ExecutorAgent) === agent.id);

        agents.map(agent => {
            models.filter(model => {
                return executors.find(executor => GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id);
            }).map(model => {
                modelexecution.push(Tabs(4) + `await Process${GetNodeProp(model, NodeProperties.CodeName)}ChangesBy${GetCodeName(agent)}();` + jNL);
            })
        });
        result.push(`       public async Task ProcessStagedChanges(Distribution distribution = null) {
${modelexecution.join('')}
        }
`)
        // agents.map(agent => {
        executors.map(executor => {
            let agent = GetGraphNode(GetNodeProp(executor, NodeProperties.ExecutorAgent));
            let model = GetGraphNode(GetNodeProp(executor, NodeProperties.ExecutorModel));
            let model_output = GetGraphNode(GetNodeProp(executor, NodeProperties.ExecutorModelOutput));
            let methodNode = GraphMethods.GetMethodNode(state, executor.id, LinkType.ExecutorFunction, GraphMethods.SOURCE);
            let methodProps = GetMethodProps(methodNode);
            let afterEffectMethods = GraphMethods.GetLinkChain(state, {
                id: methodNode.id,
                links: [{
                    type: LinkType.AfterMethod,
                    direction: GraphMethods.SOURCE
                }]
            });
            let ae_calls = [];
            let ae_functions = [];
            afterEffectMethods.map(afterEffectMethod => {
                var ae_type = GetNodeProp(afterEffectMethod, NodeProperties.AfterMethod);
                var ae_setup = GetNodeProp(afterEffectMethod, NodeProperties.AfterMethodSetup);
                if (AFTER_EFFECTS[ae_type] && ae_setup && ae_setup[ae_type]) {
                    let { templateKeys, template_call, template } = AFTER_EFFECTS[ae_type];
                    let templateString = fs.readFileSync(template, 'utf8');
                    Object.keys(templateKeys).map(key => {
                        if (ae_setup[ae_type][key]) {
                            let key_val = ae_setup[ae_type][key] || '';
                            var name = key_val.startsWith('#') ? key_val.split('#').join('') : GetCodeName((methodProps[key_val] || key_val)) || key_val;
                            templateString = bindTemplate(templateString, {
                                [key]: name,
                                [`${key}#lower`]: `${name}`.toLowerCase()
                            });
                            template_call = bindTemplate(template_call, {
                                [key]: name,
                                [`${key}#lower`]: `${name}`.toLowerCase()
                            })
                        }
                    })
                    templateString = bindTemplate(templateString, {
                        function_name: GetCodeName(afterEffectMethod)
                    });
                    template_call = bindTemplate(template_call, {
                        function_name: GetCodeName(afterEffectMethod)
                    });
                    ae_calls.push(template_call);
                    ae_functions.push(templateString);
                }
            });
            let update_method = '';
            let update_call = '';
            let delete_method = '';
            let delete_call = '';
            let create_method = '';
            let create_call = '';

            let bind_params = {
                'model_output#lower': `${GetCodeName(model_output, NodeProperties.CodeName)}`.toLowerCase(),
                model: GetCodeName(model, NodeProperties.CodeName),
                'model#lower': GetNodeProp(model, NodeProperties.CodeName).toLowerCase(),
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                'agent_type#lower': GetNodeProp(agent, NodeProperties.CodeName).toLowerCase(),
                update_method,
                create_method,
                delete_method,
                create_call,
                update_call,
                delete_call
            };
            ae_calls = ae_calls.unique().join(NEW_LINE)
            if (GetNodeProp(executor, NodeProperties.ExecutorFunctionType) === Methods.Update &&
                GetNodeProp(executor, NodeProperties.ExecutorAgent) === agent.id &&
                GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id) {
                update_method = bindTemplate(fs.readFileSync(STREAM_PROCESS_AGENT_CRUD_UPDATE, 'utf8'), {
                    ...bind_params,
                    ae_calls
                });
                update_call = `case Methods.Update:
                    await Update(change);
                    break;`
            }
            else if (GetNodeProp(executor, NodeProperties.ExecutorFunctionType) === Methods.Create &&
                GetNodeProp(executor, NodeProperties.ExecutorAgent) === agent.id &&
                GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id) {
                create_method = bindTemplate(fs.readFileSync(STREAM_PROCESS_AGENT_CRUD_CREATE, 'utf8'), {
                    ...bind_params,
                    ae_calls
                });
                create_call = `case Methods.Create:
                    await Create(change);
                    break;`
            }
            else if (GetNodeProp(executor, NodeProperties.ExecutorFunctionType) === Methods.Delete &&
                GetNodeProp(executor, NodeProperties.ExecutorAgent) === agent.id &&
                GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id) {
                delete_method = bindTemplate(fs.readFileSync(STREAM_PROCESS_AGENT_CRUD_DELETE, 'utf8'), {
                    ...bind_params,
                    ae_calls
                });
                delete_call = `
                    case Methods.Delete:
                        await Delete(change);
                        break;`;
            }

            var res = bindTemplate(_streamAgentMethods, {
                ...bind_params,
                update_method,
                update_call,
                create_method,
                create_call,
                delete_method,
                delete_call,
                ae_functions: ae_functions.unique().join('')
            })
            result.push(res);
            //   });
        });

        return result.join('')
    }
    static GenerateAgentInterfaceMethods(state, agent) {
        let models = NodesByType(state, NodeTypes.Model);
        let methods = NodesByType(state, NodeTypes.Method);
        let agents = [agent];//models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
        let _streamAgentMethods = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE, 'utf8');
        models = models.filter(model => {
            return methods.find(method => {
                var props = GetMethodProps(method);
                return props[FunctionTemplateKeys.Agent] === agent.id &&
                    (props[FunctionTemplateKeys.Model] === model.id ||
                        props[FunctionTemplateKeys.CompositeInput] === model.id);
            })
        });
        let result = [];
        let executors = NodesByType(state, NodeTypes.Executor).filter(x => GetNodeProp(x, NodeProperties.ExecutorAgent) === agent.id);
        let methods_interface = [];
        // agents.map(agent => {    
        executors.map(_ex => {
            let agent = GetGraphNode(GetNodeProp(_ex, NodeProperties.ExecutorAgent));
            let model = GetGraphNode(GetNodeProp(_ex, NodeProperties.ExecutorModel));
            let model_output = GetGraphNode(GetNodeProp(_ex, NodeProperties.ExecutorModelOutput));

            if (GetNodeProp(_ex, NodeProperties.ExecutorFunctionType)) {
                methods_interface.push(bindTemplate(`
                Task {{method}}({{model}}ChangeBy{{agent_type}} change);
`, {
                        method: GetNodeProp(_ex, NodeProperties.ExecutorFunctionType),
                        model: GetCodeName(model),
                        agent_type: GetCodeName(agent)
                    }));
            }


            var res = bindTemplate(_streamAgentMethods, {
                model: GetNodeProp(model, NodeProperties.CodeName),
                model_output: GetCodeName(model_output),
                'model#lower': GetNodeProp(model, NodeProperties.CodeName).toLowerCase(),
                agent_type: GetNodeProp(agent, NodeProperties.CodeName),
                'agent_type#lower': GetNodeProp(agent, NodeProperties.CodeName).toLowerCase(),
                update_method: 'here interface ok'

            });
            result.push(...methods_interface);
            result.push(res);
        });
        // });

        return result.unique().join('')
    }
    static GenerateStrappers(models, agent) {
        let result = [];
        result.push(Tabs(4) + bindTemplate(`validator = RedStrapper.Resolve<I{{agent}}Validations>();`, {
            agent: GetCodeName(agent)
        }) + jNL);
        var agents = [agent];// models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        models.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(4) + `${modelName.toLowerCase()}Arbiter = RedStrapper.Resolve<IRedArbiter<${modelName}>>();` + jNL);
            agents.map(agent => {
                var agentName = GetCodeName(agent);
                result.push(Tabs(4) + `${modelName.toLowerCase()}ChangeBy${agentName}Arbiter = RedStrapper.Resolve<IRedArbiter<${modelName}ChangeBy${agentName}>>();` + jNL);
            });
            if (GetNodeProp(model, NodeProperties.IsAgent)) {
                result.push(Tabs(4) + `${modelName.toLowerCase()}ResponseArbiter = RedStrapper.Resolve<IRedArbiter<${modelName}Response>>();` + jNL);
                result.push(Tabs(4) + `${modelName.toLowerCase()}Executor = RedStrapper.Resolve<I${modelName}Executor>();` + jNL);
            }
        })

        return result.join('');
    }
    static GenerateStrappersInstances(models, agent) {
        let result = [];

        result.push(Tabs(3) + bindTemplate(`public I{{agent}}Validations validator;`, { agent: GetCodeName(agent) }) + jNL);
        var agents = [agent];// models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        models.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(3) + `public IRedArbiter<${modelName}> ${modelName.toLowerCase()}Arbiter;` + jNL)
            agents.map(agent => {
                var agentName = GetCodeName(agent);
                result.push(Tabs(3) + `public IRedArbiter<${modelName}ChangeBy${agentName}> ${modelName.toLowerCase()}ChangeBy${agentName}Arbiter;` + jNL)
            });

            if (GetNodeProp(model, NodeProperties.IsAgent)) {
                result.push(Tabs(3) + `public IRedArbiter<${modelName}Response> ${modelName.toLowerCase()}ResponseArbiter;` + jNL);
                result.push(Tabs(3) + `public I${modelName}Executor ${modelName.toLowerCase()}Executor;` + jNL);
            }

        })

        return result.join('');
    }
    static GenerateStreamOrchestrations(models) {
        let result = [];
        var agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        agents.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(Tabs(4) + `${modelName.toLowerCase()}StreamProcessOrchestration = RedStrapper.Resolve<I${modelName}StreamProcessOrchestration>();` + jNL);

        });

        return result.join('');
    }
    static GenerateStreamOrchestrationInstances(models) {
        let result = [];

        const StreamProcessOrchestration = 'StreamProcessOrchestration';
        var agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        agents.map(model => {
            let modelName = GetNodeProp(model, NodeProperties.CodeName);
            result.push(`public I${modelName}${StreamProcessOrchestration} ${modelName.toLowerCase()}StreamProcessOrchestration;`)
        })
        return result.map(v => Tabs(3) + v + jNL).join('');
    }
    static GenerateProcessTests(state) {
        let graph = GetRootGraph(state);
        let functions = NodesByType(state, NodeTypes.Method).filter(x => ![
            Methods.Get,
            Methods.GetAll].some(t => t === GetNodeProp(x, NodeProperties.MethodType)));
        let res = '';
        // STREAM_METHOD_TESTS
        let _stramMethodTests = fs.readFileSync(STREAM_METHOD_TESTS, 'utf8');
        let _createModelTests = fs.readFileSync(CREATE_MODEL_TESTS, 'utf8');
        let agent_process_orchestration_mocks = `           builder.RegisterType<{{agent_type}}StreamProcessOrchestration>().As<I{{agent_type}}StreamProcessOrchestration>();
`;
        let agent_process_orc_mocks = NodesByType(state, NodeTypes.Model).filter(x => {
            var isAgent = IsAgent(x);
            return isAgent;
        }).map(t => bindTemplate(agent_process_orchestration_mocks, {
            agent_type: GetCodeName(t)
        })).join('');
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
                    test_name: `${GetNodeProp(func, NodeProperties.CodeName)}Test`,
                    stream_process_orchestration_mocks: agent_process_orc_mocks
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
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let _streamProcessTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_ROOT_TEMPLATE, 'utf8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
        let _streamProcessInterfaceTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE, 'utf8');
        const StreamProcessOrchestration = 'StreamProcessOrchestration';
        let models = NodesByType(state, NodeTypes.Model);
        let agents = models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let result = {};
        agents.map(agent => {
            var temp = StreamProcessOrchestrationGenerator.GenerateAgent({ state, key, agent });
            result = { ...result, ...temp };
        });
        let strappers = StreamProcessOrchestrationGenerator.GenerateStreamOrchestrations(models);
        let strapperInstances = StreamProcessOrchestrationGenerator.GenerateStreamOrchestrationInstances(models);

        _streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
            agent_type_methods: `

        public async Task ProcessStagedChanges(Distribution distribution = null) 
        {
${agents.map(agent => {
                return `await ${GetCodeName(agent).toLowerCase()}StreamProcessOrchestration.ProcessStagedChanges(distribution);`;
            }).map(v => Tabs(4) + v + jNL).join('')}
        }
        `,
            arbiters_strappers: strappers,
            arbiter_instances: strapperInstances
        });
        let stream_process_tests = StreamProcessOrchestrationGenerator.GenerateProcessTests(state);
        let testTemplate = bindTemplate(_testClass, {
            name: StreamProcessOrchestration,
            tests: stream_process_tests
        })
        _streamProcessInterfaceTemplate = bindTemplate(_streamProcessInterfaceTemplate, {
            agent_type_methods: '',
            agent_type: ''
        });
        let streamOrchestration = {
            [StreamProcessOrchestration]: {
                id: StreamProcessOrchestration,
                name: StreamProcessOrchestration,
                iname: `I${StreamProcessOrchestration}`,
                //  tname: `${StreamProcessOrchestration}Tests`,
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
                // test: NamespaceGenerator.Generate({
                //     template: testTemplate,
                //     usings: [
                //         ...STANDARD_CONTROLLER_USING,
                //         ...STANDARD_TEST_USING,
                //         `${namespace}${NameSpace.Model}`,
                //         `${namespace}${NameSpace.Parameters}`,
                //         `${namespace}${NameSpace.Interface}`,
                //         `${namespace}${NameSpace.StreamProcess}`,
                //         `${namespace}${NameSpace.Executors}`,
                //         `${namespace}${NameSpace.Extensions}`,
                //         `${namespace}${NameSpace.Constants}`],
                //     namespace,
                //     space: NameSpace.Tests
                // })
            }
        };
        result = { ...result, ...streamOrchestration };
        return result;
    }
    static GenerateAgent(options) {
        var { state, key, agent } = options;
        const StreamProcessOrchestration = 'StreamProcessOrchestration';
        let models = NodesByType(state, NodeTypes.Model);
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let _streamProcessTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE, 'utf8');
        let _streamProcessInterfaceTemplate = fs.readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE, 'utf8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
        let agent_methods = StreamProcessOrchestrationGenerator.GenerateAgentMethods(state, agent);
        let agent_methods_interface = StreamProcessOrchestrationGenerator.GenerateAgentInterfaceMethods(state, agent);
        let statics = StreamProcessOrchestrationGenerator.GenerateStaticMethods(models, agent);
        let strappers = StreamProcessOrchestrationGenerator.GenerateStrappers(models, agent);
        let strapperInstances = StreamProcessOrchestrationGenerator.GenerateStrappersInstances(models, agent);
        _streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
            static_methods: statics.join(''),
            agent_type_methods: agent_methods,
            agent_type: GetCodeName(agent),
            agent: GetCodeName(agent),
            arbiters_strappers: strappers,
            arbiter_instances: strapperInstances
        });
        let stream_process_tests = StreamProcessOrchestrationGenerator.GenerateProcessTests(state, agent);
        let testTemplate = bindTemplate(_testClass, {
            name: `${GetCodeName(agent)}${StreamProcessOrchestration}`,
            agent_type: GetCodeName(agent),
            tests: stream_process_tests
        })
        _streamProcessInterfaceTemplate = bindTemplate(_streamProcessInterfaceTemplate, {
            agent_type: GetCodeName(agent),
            agent_type_methods: agent_methods_interface
        });
        return {
            [`${(GetCodeName(agent) + StreamProcessOrchestration)}`]: {
                id: StreamProcessOrchestration,
                name: `${GetCodeName(agent)}${StreamProcessOrchestration}`,
                iname: `I${GetCodeName(agent)}${StreamProcessOrchestration}`,
                // tname: `${GetCodeName(agent)}${StreamProcessOrchestration}Tests`,
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
                // test: NamespaceGenerator.Generate({
                //     template: testTemplate,
                //     usings: [
                //         ...STANDARD_CONTROLLER_USING,
                //         ...STANDARD_TEST_USING,
                //         `${namespace}${NameSpace.Model}`,
                //         `${namespace}${NameSpace.Parameters}`,
                //         `${namespace}${NameSpace.Interface}`,
                //         `${namespace}${NameSpace.StreamProcess}`,
                //         `${namespace}${NameSpace.Executors}`,
                //         `${namespace}${NameSpace.Extensions}`,
                //         `${namespace}${NameSpace.Constants}`],
                //     namespace,
                //     space: NameSpace.Tests
                // })
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