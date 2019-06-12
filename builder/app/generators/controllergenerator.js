import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, STANDARD_CONTROLLER_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTypes, Functions, TEMPLATE_KEY_MODIFIERS, FunctionTemplateKeys, ToInterface } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const CONTROLLER_CLASS_TEMPLATE = './app/templates/controller/controller.tpl';
const CONTROLLER_CLASS_FUNCTION_TEMPLATE = './app/templates/controller/controller_functions.tpl';

const PROPERTY_TABS = 6;
export default class ControllerGenerator {
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

        let controllers = NodesByType(state, NodeTypes.Controller);

        let _controllerTemplateClass = fs.readFileSync(CONTROLLER_CLASS_TEMPLATE, 'utf-8');
        let _controllerTemplateFunction = fs.readFileSync(CONTROLLER_CLASS_FUNCTION_TEMPLATE, 'utf-8');
        let root = GetRootGraph(state);
        let result = {};
        controllers.map(controller => {
            let controllerTemplateClass = _controllerTemplateClass;
            let functions = '';
            let statics = '';
            let codeName = `${GetNodeProp(controller, NodeProperties.CodeName)}`;
            let userNode = NodesByType(state, NodeTypes.Model).find(x => GetNodeProp(x, NodeProperties.IsUser));
            let maestro_functions = [];
            let maestros = GraphMethods.getNodesByLinkType(root, {
                id: controller.id,
                type: LinkType.MaestroLink,
                direction: GraphMethods.SOURCE
            }).map(maestro => {
                let tempfunctions = GraphMethods.getNodesByLinkType(root, {
                    id: maestro.id,
                    type: LinkType.FunctionLink,
                    direction: GraphMethods.SOURCE
                });
                let maestroName = GetNodeProp(maestro, NodeProperties.CodeName);
                maestro_functions = tempfunctions;
                if (maestro_functions.length) {
                    maestro_functions.map(maestro_function => {
                        var ft = Functions[GetNodeProp(maestro_function, NodeProperties.FunctionType)];
                        if (ft) {
                            let tempFunction = _controllerTemplateFunction;
                            let codeNode = GetNodeProp(maestro_function, NodeProperties.CodeName);
                            let tempfunctions = GraphMethods.getNodesByLinkType(root, {
                                id: maestro_function.id,
                                type: LinkType.FunctionConstraintLink,
                                direction: GraphMethods.SOURCE
                            });

                            let functionName = `${GetNodeProp(maestro_function, NodeProperties.CodeName)}`;
                            let httpMethod = `${GetNodeProp(maestro_function, NodeProperties.HttpMethod)}`;
                            let httpRoute = `${GetNodeProp(maestro_function, NodeProperties.HttpRoute)}`;
                            let methodProperties = GetNodeProp(maestro_function, NodeProperties.MethodProps);
                            let userNode = tempfunctions.find(t => GetNodeProp(t, NodeProperties.CodeName) === FunctionTemplateKeys.UserInstance);
                            let modelNode =  GraphMethods.GetNode(root, methodProperties.model);
                            let output_type = '{controller_generator_missing_model}';
                            if (modelNode) {
                                output_type = GetNodeProp(modelNode, NodeProperties.CodeName) || output_type;
                                if (ft.isList) {
                                    output_type = `IList<${output_type}>`;
                                }
                            }
                            tempFunction = bindTemplate(tempFunction, {
                                functionName: functionName,
                                maestro_function: functionName,
                                http_route: httpRoute || '{controller_generator_http_method',
                                http_method: httpMethod || '{controller_generator_http_method',
                                user_instance: controller ? GetNodeProp(controller, NodeProperties.CodeUser) : '{controller_generator_code_name}',
                                output_type: output_type,
                                maestro_interface: ToInterface(maestroName),
                                input_type: modelNode ? GetNodeProp(modelNode, NodeProperties.CodeName) : '{controller_generator_missing_model}'
                            })
                            // let template = ft.template;
                            // if (ft.template_keys) {
                            //     for (var template_key in template_key) {
                            //         for (var modifiers in TEMPLATE_KEY_MODIFIERS) {

                            //         }
                            //     }
                            // }
                            functions += jNL + tempFunction;
                        }

                    })
                }
                controllerTemplateClass = bindTemplate(controllerTemplateClass, {
                    codeName: codeName,
                    'codeName#alllower': codeName.toLowerCase(),
                    user_instance: controller ? GetNodeProp(controller, NodeProperties.CodeUser) : '{controller_generator_code_name}',
                    user: userNode  ? GetNodeProp(userNode , NodeProperties.CodeName) : '{controller_generator_code_name}',
                    functions
                });
            });
            result[GetNodeProp(controller, NodeProperties.CodeName)] = {
                id: GetNodeProp(controller, NodeProperties.CodeName),
                name: GetNodeProp(controller, NodeProperties.CodeName),
                template: NamespaceGenerator.Generate({
                    template: controllerTemplateClass,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        'Microsoft.AspNetCore.Mvc'
                    ],
                    namespace,
                    space: NameSpace.Controllers
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