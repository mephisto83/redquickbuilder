import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph, GetCurrentGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, STANDARD_CONTROLLER_USING, NEW_LINE, STANDARD_TEST_USING, Methods } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTypes, Functions, TEMPLATE_KEY_MODIFIERS, FunctionTemplateKeys, ToInterface, MethodFunctions } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import StreamProcessOrchestrationGenerator from './streamprocessorchestrationgenerator';
import ValidationRuleGenerator from './validationrulegenerator';
import PermissionGenerator from './permissiongenerator';
import ModelItemFilterGenerator from './modelitemfiltergenerator';

const MAESTRO_CLASS_TEMPLATE = './app/templates/maestro/maestro.tpl';
const MAESTRO_INTERFACE_TEMPLATE = './app/templates/maestro/imaestro.tpl';
const CONTROLLER_CLASS_FUNCTION_TEMPLATE = './app/templates/controller/controller_functions.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const MAESTRO_FUNCTION_TESTS = './app/templates/maestro/tests/maestro.tpl';
const MAESTRO_FUNCTION_SAME_AGENT_MODEL_TESTS = './app/templates/maestro/tests/maestro_same_agent_model.tpl';
const get_agent_manytomany_listchild_interface = './app/templates/maestro/tests/get_agent_manytomany_listchild_interface.tpl';
const MAESTRO_FUNCTION_GET_TESTS = './app/templates/maestro/tests/maestro_get.tpl';
const PROPERTY_TABS = 6;
export default class MaestroGenerator {
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += TAB;
        }
        return res;

    }
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let maestros = NodesByType(state, NodeTypes.Maestro);

        let _maestroTemplateClass = fs.readFileSync(MAESTRO_CLASS_TEMPLATE, 'utf-8');
        let _MAESTRO_INTERFACE_TEMPLATE = fs.readFileSync(MAESTRO_INTERFACE_TEMPLATE, 'utf-8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf-8');
        let testFunctionTemplate = fs.readFileSync(MAESTRO_FUNCTION_TESTS, 'utf-8');
        let testFunctionGetSameParentTemplate = fs.readFileSync(MAESTRO_FUNCTION_SAME_AGENT_MODEL_TESTS, 'utf-8');

        let testFunctionGetTemplate = fs.readFileSync(MAESTRO_FUNCTION_GET_TESTS, 'utf-8');
        let root = GetRootGraph(state);
        let graph = GetCurrentGraph(state);
        let result = {};
        maestros.map(maestro => {
            let maestroTemplateClass = _maestroTemplateClass;
            let functions = '';
            let functionsInterface = '';
            let statics = '';
            let codeName = `${GetNodeProp(maestro, NodeProperties.CodeName)}`;

            let maestro_functions = [];
            let tempfunctions = GraphMethods.getNodesByLinkType(root, {
                id: maestro.id,
                type: LinkType.FunctionLink,
                direction: GraphMethods.SOURCE
            });
            let arbiters = [];
            let permissions = [];
            let maestroName = GetNodeProp(maestro, NodeProperties.CodeName);
            maestro_functions = tempfunctions;
            let permissionValidationCases = [];
            if (maestro_functions.length) {
                maestro_functions.map(maestro_function => {
                    let function_type = GetNodeProp(maestro_function, NodeProperties.FunctionType);
                    var ft = MethodFunctions[function_type];
                    if (ft) {

                        let tempFunction = ft.template;
                        let interfaceFunction = ft.interface;
                        let value_type = '';
                        let parent_type = '';
                        if (ft.parentGet) {
                            value_type = 'string';
                        }
                        let functionName = `${GetNodeProp(maestro_function, NodeProperties.CodeName)}`;
                        let httpMethod = `${GetNodeProp(maestro_function, NodeProperties.HttpMethod)}`;
                        let httpRoute = `${GetNodeProp(maestro_function, NodeProperties.HttpRoute)}`;
                        let agentTypeNode = null;
                        let userTypeNode = null;
                        let parentNode = null;
                        let permissionNode = null;
                        let modelFilterNode = null;
                        let manyToManyNode = null;
                        let modelNode = null;
                        let methodProps = GetNodeProp(maestro_function, NodeProperties.MethodProps);
                        let predicates = '';
                        if (methodProps) {
                            agentTypeNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.AgentType] || methodProps[FunctionTemplateKeys.Agent]);
                            modelNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.Model]);
                            userTypeNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.User]);
                            permissionNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.Permission]);
                            modelFilterNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.ModelFilter]);
                            manyToManyNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.ManyToManyModel]);
                            parentNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.Parent]);
                            manyToManyNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.ManyToManyModel]);
                            var modelItemFilters = GraphMethods.GetLinkChain(state, {
                                id: maestro_function.id,
                                links: [{
                                    type: LinkType.ModelItemFilter,
                                    direction: GraphMethods.SOURCE
                                }]
                            });
                            predicates = ModelItemFilterGenerator.predicates(modelItemFilters);
                            if (predicates.length) {
                                predicates = predicates.join(', ');
                            }
                            else {
                                predicates = '';
                            }
                        }

                        let agent = agentTypeNode ? `${GetNodeProp(agentTypeNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_agentTypeNode}`;
                        let model_type = modelNode ? GetNodeProp(modelNode, NodeProperties.CodeName) : `{maestro_generator_mising_model}`;
                        let agent_type = agentTypeNode ? `${GetNodeProp(agentTypeNode, NodeProperties.CodeName)}` : `{maestro_generator_mising_agentTypeNode}`;
                        let methodType = GetNodeProp(maestro_function, NodeProperties.MethodType);
                        let connect_type = manyToManyNode ? GetNodeProp(manyToManyNode, NodeProperties.CodeName) : '{maestro_connection_type_missing}';
                        parent_type = parentNode ? GetNodeProp(parentNode, NodeProperties.CodeName) : '{missing parent name}';
                        if (parentNode)
                            arbiters.push(parent_type);
                        let manyNodes = GraphMethods.GetManyToManyNodes(graphRoot, [modelNode ? modelNode.id : false, agentTypeNode ? agentTypeNode.id : null].filter(x => x)) || [];
                        arbiters.push(...manyNodes.map(manyNode => {
                            return GetNodeProp(manyNode, NodeProperties.CodeName);
                        }));
                        arbiters.push(agent_type, model_type);
                        permissions.push({ agent_type, model_type });
                        let value = '';
                        let agentAndModelIsTheSame = false;
                        if (ft.parentGet) {
                            value = parentNode ? `${GetNodeProp(parentNode, NodeProperties.CodeName)}`.toLowerCase() : '{missing parent name}';
                            if (agentTypeNode && parentNode) {
                                agentAndModelIsTheSame = agentTypeNode.id === parentNode.id;
                            }
                        }
                        else {
                            value = modelNode ? `${GetNodeProp(modelNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_model}`;
                        }

                        let bindOptions = {
                            function_name: functionName,
                            agent_type: agent_type,
                            'agent_type#lower': `${agent_type}`.toLowerCase(),
                            parent_type,
                            agent: agent,
                            value_type,
                            value,
                            model: model_type,
                            connect_type,
                            comma: predicates.length ? ',' : '',
                            predicates,
                            maestro_function: functionName,
                            filter_function: modelFilterNode ? GetNodeProp(modelFilterNode, NodeProperties.CodeName) : '{missing filter node}',
                            user: userTypeNode ? GetNodeProp(userTypeNode, NodeProperties.CodeName) : `{maestro_generator_mising_user}`,
                            http_route: httpRoute || '{maestro_generator_http_method',
                            http_method: httpMethod || '{maestro_generator_http_method',
                            user_instance: userTypeNode ? `${GetNodeProp(userTypeNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_userNode}`,
                            output_type: modelNode ? GetNodeProp(modelNode, NodeProperties.CodeName) : '{maestro_generator_missing_model}',
                            maestro_interface: ToInterface(maestroName),
                            permission_function: permissionNode ? GetNodeProp(permissionNode, NodeProperties.CodeName) + methodType : `{MISSING_PERMISSION_FUNCTION}`,
                            input_type: modelNode ? GetNodeProp(modelNode, NodeProperties.CodeName) : '{maestro_generator_missing_model}'
                        };
                        tempFunction = bindTemplate(tempFunction, bindOptions);
                        interfaceFunction = bindTemplate(interfaceFunction, bindOptions)

                        functions += jNL + tempFunction;
                        functionsInterface += jNL + interfaceFunction;

                        var cases = PermissionGenerator.EnumeratePermissionCases(graph, permissionNode, methodType, agentTypeNode, modelNode);
                        let validators = StreamProcessOrchestrationGenerator.EnumerateFunctionValidators(state, maestro_function);
                        if (validators && cases) {
                            validators.map(validator => {
                                cases.map(_case => {
                                    let pvc = {};
                                    let pvc2 = {};
                                    if (validator && validator.agent && _case.agentProperties) {
                                        var temp = [
                                            ...validator.agent.propertyInformation.map(t => t.set_properties),
                                            ..._case.properties.filter(x => x.type === FunctionTemplateKeys.Agent).map(t => t.props).map((t, index) => {
                                                if (validator.agent.propertyInformation.findIndex(x => x.property === t.property) !== -1) {
                                                    return false;
                                                }
                                                return _case.agentProps[index];
                                            }).filter(x => x)
                                        ].join(NEW_LINE);
                                        pvc.agent = (temp);
                                    }
                                    if (validator && validator.model && _case.itemProperties) {
                                        var temp = [
                                            ...validator.model.propertyInformation.map(t => t.set_properties),
                                            ..._case.filter(x => x.type === FunctionTemplateKeys.Model).map(t => t.props).map((t, index) => {
                                                if (validator.model.propertyInformation.findIndex(x => x.property === t.property) !== -1) {
                                                    return false;
                                                }
                                                return _case.itemProps[index];
                                            }).filter(x => x)
                                        ].join(NEW_LINE);
                                        pvc.model = (temp);
                                    }

                                    if (validator && validator.agent && _case.agentProperties) {
                                        var temp = [
                                            ..._case.agentProperties.map((t, index) => _case.agentProps[index]),
                                            ...validator.agent.propertyInformation.map((t, index) => {
                                                if (_case.agentProperties.findIndex(x => x.property === t.property) !== -1) {
                                                    return false;
                                                }
                                                return validator.agent.propertyInformation[index].set_properties;
                                            }).filter(x => x)
                                        ].join(NEW_LINE);
                                        pvc2.agent = (temp);
                                    }
                                    if (validator && validator.model && _case.itemProperties) {
                                        var temp = [
                                            ..._case.itemProperties.map((t, index) => _case.itemProps[index]),
                                            ...validator.model.propertyInformation.map((t, index) => {
                                                if (_case.itemProperties.findIndex(x => x.property === t.property) !== -1) {
                                                    return false;
                                                }
                                                return validator.model.propertyInformation[index].set_properties;
                                            }).filter(x => x)
                                        ].join(NEW_LINE);
                                        pvc2.model = (temp);
                                    }

                                    permissionValidationCases.push(pvc2);
                                    permissionValidationCases.push(pvc);
                                })
                            })

                            permissionValidationCases = permissionValidationCases.map((pvc, index) => {
                                //Generate tests.
                                let templ = testFunctionTemplate;
                                switch (ft.method) {
                                    case Methods.Get:
                                    case Methods.GetAll:
                                        templ = testFunctionGetTemplate;
                                        if (agentAndModelIsTheSame) {
                                            templ = testFunctionGetSameParentTemplate;
                                        }
                                        break;
                                }
                                switch (function_type) {
                                    case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
                                        templ = fs.readFileSync(get_agent_manytomany_listchild_interface, 'utf-8');
                                        break;
                                }
                                return bindTemplate(templ, {
                                    agent: agent_type,
                                    many_to_many: GetNodeProp(manyToManyNode, NodeProperties.CodeName),
                                    parent: GetNodeProp(parentNode, NodeProperties.CodeName),
                                    set_many_to_many_properties: '//{not set yet}',
                                    value: modelNode ? `${GetNodeProp(modelNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_model}`,
                                    model: model_type,
                                    function_name: functionName,
                                    maestro: maestroName,
                                    set_agent_properties: pvc.agent,
                                    user: userTypeNode ? GetNodeProp(userTypeNode, NodeProperties.CodeName) : `{maestro_generator_mising_user}`,
                                    set_model_properties: pvc.model,
                                    testname: `${functionName}Test${index}`
                                });
                            });
                            // Do analysis on whether these validations are completely bonk.
                        }
                    }

                })
            }
            arbiters = arbiters.unique();
            permissions = permissions.unique(x => `${x.agent_type}`);
            var injectedServices = arbiters.map(x => `IRedArbiter<${x}> _arbiter${x}`);
            var injectedPermissionServices = permissions.map(x => `IPermissions${x.agent_type} _${x.agent_type.toLowerCase()}Permissions`);
            var set_properties = arbiters.map(x => jNL + MaestroGenerator.Tabs(4) + `arbiter${x} = _arbiter${x};`);
            var set_permissions = permissions.map(x => jNL + MaestroGenerator.Tabs(4) + `${x.agent_type.toLowerCase()}Permissions = _${x.agent_type.toLowerCase()}Permissions;`);
            var properties = arbiters.map(x => jNL + MaestroGenerator.Tabs(3) + `private readonly IRedArbiter<${x}> arbiter${x};`);
            var permissions_properties = permissions.map(x => jNL + MaestroGenerator.Tabs(3) + `private readonly IPermissions${x.agent_type} ${x.agent_type.toLowerCase()}Permissions;`);
            let testTemplate = bindTemplate(_testClass, {
                name: codeName,
                tests: permissionValidationCases.join(NEW_LINE)
            })
            maestroTemplateClass = bindTemplate(maestroTemplateClass, {
                codeName: codeName,
                set_properties: [...set_properties, ...set_permissions].join(jNL),
                properties: [...permissions_properties, ...properties].join(' '),
                injected_services: [...injectedServices, ...injectedPermissionServices].map((t, ti) => (jNL + MaestroGenerator.Tabs(7) + t)).join(','),
                'codeName#alllower': codeName.toLowerCase(),
                functions
            });
            let maestro_interface_template = bindTemplate(_MAESTRO_INTERFACE_TEMPLATE, {
                codeName: codeName,
                set_properties: [...set_properties, ...set_permissions].join(jNL),
                properties: [...permissions_properties, ...properties].join(' '),
                injected_services: [...injectedServices, ...injectedPermissionServices].map((t, ti) => (jNL + MaestroGenerator.Tabs(7) + t)).join(','),
                'codeName#alllower': codeName.toLowerCase(),
                functions: functionsInterface
            })
            result[GetNodeProp(maestro, NodeProperties.CodeName)] = {
                id: GetNodeProp(maestro, NodeProperties.CodeName),
                name: GetNodeProp(maestro, NodeProperties.CodeName),
                iname: `I${GetNodeProp(maestro, NodeProperties.CodeName)}`,
                tname: `${GetNodeProp(maestro, NodeProperties.CodeName)}Tests`,
                template: NamespaceGenerator.Generate({
                    template: maestroTemplateClass,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.StreamProcess}`,
                        `${namespace}${NameSpace.Constants}`,
                        `${namespace}${NameSpace.Permissions}`,
                        `${namespace}${NameSpace.Parameters}`],
                    namespace,
                    space: NameSpace.Controllers
                }),
                interface: NamespaceGenerator.Generate({
                    template: maestro_interface_template,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Interface}`],
                    namespace,
                    space: NameSpace.Controllers
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
                        `${namespace}${NameSpace.Permissions}`,
                        `${namespace}${NameSpace.Controllers}`,
                        `${namespace}${NameSpace.Executors}`,
                        `${namespace}${NameSpace.Extensions}`,
                        `${namespace}${NameSpace.Constants}`],
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