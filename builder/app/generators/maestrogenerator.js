import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, STANDARD_CONTROLLER_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTypes, Functions, TEMPLATE_KEY_MODIFIERS, FunctionTemplateKeys, ToInterface } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const MAESTRO_CLASS_TEMPLATE = './app/templates/maestro/maestro.tpl';
const MAESTRO_INTERFACE_TEMPLATE = './app/templates/maestro/imaestro.tpl';
const CONTROLLER_CLASS_FUNCTION_TEMPLATE = './app/templates/controller/controller_functions.tpl';

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
        let _controllerTemplateFunction = fs.readFileSync(CONTROLLER_CLASS_FUNCTION_TEMPLATE, 'utf-8');
        let root = GetRootGraph(state);
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
            let interface_functions = [];
            if (maestro_functions.length) {
                maestro_functions.map(maestro_function => {
                    var ft = Functions[GetNodeProp(maestro_function, NodeProperties.FunctionType)];
                    if (ft) {
                        let tempFunction = ft.template;
                        let interfaceFunction = ft.interface;
                        let codeNode = GetNodeProp(maestro_function, NodeProperties.CodeName);
                        let tempfunctions = GraphMethods.getNodesByLinkType(root, {
                            id: maestro_function.id,
                            type: LinkType.FunctionConstraintLink,
                            direction: GraphMethods.SOURCE
                        });

                        let functionName = `${GetNodeProp(maestro_function, NodeProperties.CodeName)}`;
                        let httpMethod = `${GetNodeProp(maestro_function, NodeProperties.HttpMethod)}`;
                        let httpRoute = `${GetNodeProp(maestro_function, NodeProperties.HttpRoute)}`;
                        let agentType = tempfunctions.find(t => GetNodeProp(t, NodeProperties.CodeName) === FunctionTemplateKeys.AgentType);
                        let userNode = tempfunctions.find(t => GetNodeProp(t, NodeProperties.CodeName) === FunctionTemplateKeys.User);
                        let userTypeNode = null;
                        if (userNode) {
                            userTypeNode = GraphMethods.getNodesByLinkType(root, {
                                id: userNode.id,
                                type: LinkType.Choice,
                                direction: GraphMethods.SOURCE
                            }).find(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);
                        }
                        let agentTypeNode = null;
                        if (agentType) {
                            agentTypeNode = GraphMethods.getNodesByLinkType(root, {
                                id: agentType.id,
                                type: LinkType.Choice,
                                direction: GraphMethods.SOURCE
                            }).find(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);
                        }
                        let modelNode = tempfunctions.find(t => GetNodeProp(t, NodeProperties.CodeName) === FunctionTemplateKeys.Model);
                        let modelNodeType = null;
                        if (modelNode) {
                            modelNodeType = GraphMethods.getNodesByLinkType(root, {
                                id: modelNode.id,
                                type: LinkType.Choice,
                                direction: GraphMethods.SOURCE
                            }).find(x => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Model);
                        }
                        let agent = agentTypeNode ? `${GetNodeProp(agentTypeNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_agentTypeNode}`;
                        let model_type = modelNodeType ? GetNodeProp(modelNodeType, NodeProperties.CodeName) : `{maestro_generator_mising_model}`;
                        let agent_type = agentTypeNode ? `${GetNodeProp(agentTypeNode, NodeProperties.CodeName)}` : `{maestro_generator_mising_agentTypeNode}`;

                        arbiters.push(agent_type, model_type);
                        permissions.push({ agent_type, model_type });
                        let bindOptions = {
                            function_name: functionName,
                            agent_type: agent_type,
                            agent: agent,
                            value: modelNode ? `${GetNodeProp(modelNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_model}`,
                            model: model_type,
                            maestro_function: functionName,
                            user: userTypeNode ? GetNodeProp(userTypeNode, NodeProperties.CodeName) : `{maestro_generator_mising_user}`,
                            http_route: httpRoute || '{maestro_generator_http_method',
                            http_method: httpMethod || '{maestro_generator_http_method',
                            user_instance: userNode ? `${GetNodeProp(userNode, NodeProperties.CodeName)}`.toLowerCase() : `{maestro_generator_mising_userNode}`,
                            output_type: modelNode ? GetNodeProp(modelNode, NodeProperties.CodeName) : '{maestro_generator_missing_model}',
                            maestro_interface: ToInterface(maestroName),
                            input_type: modelNode ? GetNodeProp(modelNode, NodeProperties.CodeName) : '{maestro_generator_missing_model}'
                        };
                        tempFunction = bindTemplate(tempFunction, bindOptions);
                        interfaceFunction = bindTemplate(interfaceFunction, bindOptions)
                        // let template = ft.template;
                        // if (ft.template_keys) {
                        //     for (var template_key in template_key) {
                        //         for (var modifiers in TEMPLATE_KEY_MODIFIERS) {

                        //         }
                        //     }
                        // }
                        functions += jNL + tempFunction;
                        functionsInterface += jNL + interfaceFunction;
                    }

                })
            }
            arbiters = arbiters.unique();
            permissions = permissions.unique(x => `${x.agent_type}`);
            var injectedServices = arbiters.map(x => `IRedArbiter<${x}> _arbiter${x}`);
            var injectedPermissionServices = permissions.map(x => `IPermissions${x.agent_type} _${x.agent_type.toLowerCase()}Permissions`);
            var set_properties = arbiters.map(x => jNL + MaestroGenerator.Tabs(4) + `arbiter${x} = _arbiter${x};`);
            var set_permissions = permissions.map(x => jNL + MaestroGenerator.Tabs(4) + `${x.agent_type.toLowerCase()}Permissions = ${x.agent_type.toLowerCase()}Permissions;`);
            var properties = arbiters.map(x => jNL + MaestroGenerator.Tabs(3) + `private readonly IRedArbiter<${x}> arbiter${x};`);
            var permissions_properties = permissions.map(x => jNL + MaestroGenerator.Tabs(3) + `private readonly IPermissions${x.agent_type} ${x.agent_type.toLowerCase()}Permissions;`);

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