import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodeTypes,
	NodesByType,
	GetRootGraph,
	GetCodeName,
	GetMethodProps
} from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	STANDARD_CONTROLLER_USING,
	Methods
} from '../constants/nodetypes';
import fs from 'fs';
import {
	bindTemplate,
	FunctionTypes,
	TEMPLATE_KEY_MODIFIERS,
	FunctionTemplateKeys,
	ToInterface,
	MethodFunctions
} from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const CONTROLLER_CLASS_TEMPLATE = './app/templates/controller/controller.tpl';
const CONTROLLER_CLASS_FUNCTION_TEMPLATE = './app/templates/controller/controller_functions.tpl';
const CONTROLLER_CLASS_FUNCTION_GET_TEMPLATE = './app/templates/controller/controller_functions_get.tpl';

const PROPERTY_TABS = 6;
export default class ControllerGenerator {
	static Tabs(c: any) {
		let res = '';
		for (var i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}
	static Generate(options: any) {
		var { state, key } = options;
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		let controllers = NodesByType(state, NodeTypes.Controller).filter(
			(x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration)
		);

		let _controllerTemplateClass = fs.readFileSync(CONTROLLER_CLASS_TEMPLATE, 'utf8');
		let _controllerTemplateFunction = fs.readFileSync(CONTROLLER_CLASS_FUNCTION_TEMPLATE, 'utf8');
		let _controllerTemplateFunctionGet = fs.readFileSync(CONTROLLER_CLASS_FUNCTION_GET_TEMPLATE, 'utf8');
		let root = GetRootGraph(state);
		let result: any = {};
		controllers.map((controller: any) => {
			let controllerTemplateClass = _controllerTemplateClass;
			let functions = '';
			let statics = '';
			let codeName = `${GetNodeProp(controller, NodeProperties.CodeName)}`;
			let userNode = NodesByType(state, NodeTypes.Model).find((x: any) => GetNodeProp(x, NodeProperties.IsUser));
			let maestro_functions = [];
			let maestros = GraphMethods.getNodesByLinkType(root, {
				id: controller.id,
				type: LinkType.MaestroLink,
				direction: GraphMethods.SOURCE
			}).map((maestro: any) => {
				let tempfunctions = GraphMethods.getNodesByLinkType(root, {
					id: maestro.id,
					type: LinkType.FunctionLink,
					direction: GraphMethods.SOURCE
				});
				let maestroName = GetNodeProp(maestro, NodeProperties.CodeName);
				maestro_functions = tempfunctions;
				if (maestro_functions.length) {
					maestro_functions
						.filter((x) => !GetNodeProp(x, NodeProperties.NotIncludedInController))
						.map((maestro_function: any) => {
							var ft = MethodFunctions[GetNodeProp(maestro_function, NodeProperties.FunctionType)];
							if (ft) {
								let tempFunction = ft.controller || _controllerTemplateFunction;
								if (fs.existsSync(tempFunction)) {
									tempFunction = fs.readFileSync(tempFunction, 'utf8');
								}
								let parameters = '';
								let parameter_route = '';
								let parameter_values = '';
								//If the function is a get then, use the get template.
								if (!ft.controller)
									if (
										[ Methods.Get, Methods.GetAll ].some(
											(v) => v === GetNodeProp(maestro_function, NodeProperties.MethodType)
										)
									) {
										tempFunction = _controllerTemplateFunctionGet;
										let paramName = 'modelId';
										if (ft.parentGet) {
											paramName = 'parentId';
										}
										parameters = `string ${paramName}`;
										parameter_route = `/{${paramName}}`;
										parameter_values = `${paramName}`;
									}
								if (ft.controller_parameters) {
									let methodprops = GetMethodProps(maestro_function);
									parameters = ft.controller_parameters.params
										.map((cp: any) => {
											return `${GetCodeName(methodprops[cp])} ${cp}`;
										})
										.join();
									parameter_route = '';
									parameter_values = ft.controller_parameters.params
										.map((cp: any) => {
											return `${cp}`;
										})
										.join();
								}
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
								if (!methodProperties) return;
								let modelNode = GraphMethods.GetNode(root, methodProperties.model);
								let fetch_parameter = GraphMethods.GetNode(root, methodProperties.fetch_parameter);
								let compositeInput = GraphMethods.GetNode(
									graphRoot,
									methodProperties[FunctionTemplateKeys.CompositeInput]
								);
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
									parameters,
									parameter_values,
									parameter_route,
									http_route: httpRoute || '{controller_generator_http_method',
									http_method: httpMethod || '{controller_generator_http_method',
									user_instance: controller
										? GetNodeProp(controller, NodeProperties.CodeUser)
										: '{controller_generator_code_name}',
									output_type: output_type,
									fetch_parameter: GetCodeName(fetch_parameter),
									maestro_interface: ToInterface(maestroName),
									input_type:
										compositeInput || modelNode
											? GetCodeName(compositeInput || modelNode)
											: '{controller_generator_missing_model}'
								});
								// let template = ft.template;
								// if (ft.template_keys) {
								//     for (var template_key in template_key) {
								//         for (var modifiers in TEMPLATE_KEY_MODIFIERS) {

								//         }
								//     }
								// }
								functions += jNL + tempFunction;
							}
						});
				}
				controllerTemplateClass = bindTemplate(controllerTemplateClass, {
					codeName: codeName,
					'codeName#alllower': codeName.toLowerCase(),
					user_instance: controller
						? GetNodeProp(controller, NodeProperties.CodeUser)
						: '{controller_generator_code_name}',
					user: userNode
						? GetNodeProp(userNode, NodeProperties.CodeName)
						: '{controller_generator_code_name}',
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
		});

		return result;
	}
}
const NL = `
                    `;
const jNL = `
`;
const TAB = `   `;
