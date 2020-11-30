import fs from 'fs';
import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodeTypes,
	NodesByType,
	GetRootGraph,
	GetCodeName,
	GetMethodProps,
	GetCurrentGraph,
	GetMethodsProperty,
	GetControllerNode,
	GetMaestroNode,
	GetNodeById
} from '../actions/uiActions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	STANDARD_CONTROLLER_USING,
	Methods,
	NEW_LINE
} from '../constants/nodetypes';
import {
	bindTemplate,
	FunctionTypes,
	TEMPLATE_KEY_MODIFIERS,
	FunctionTemplateKeys,
	ToInterface,
	MethodFunctions
} from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import { fs_readFileSync } from './modelgenerators';

const CONTROLLER_CLASS_FETCH_FUNCTION = './app/templates/controller/fetch_service_function.tpl';
const CONTROLLER_CLASS_FETCH_FUNCTION_Get_PROPERTY = './app/templates/controller/fetch_service_set_property.tpl';
const CONTROLLER_CLASS_TEMPLATE = './app/templates/controller/controller.tpl';

const PROPERTY_TABS = 6;
export default class FetchServiceGenerator {
	static Tabs(c: number) {
		let res = '';
		for (let i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}

	static Generate(options: { state: any; key: any; language?: any }) {
		const { state, key } = options;
		const graphRoot = GetRootGraph(state);
		const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		const result: any = {};
		const controllers = NodesByType(state, NodeTypes.FetchService);
		controllers.map((controller: { id: any }) => {
			const controllerUser = 'controllerUser';
			let controllerTemplateClass = fs_readFileSync(CONTROLLER_CLASS_TEMPLATE, 'utf-8');
			const fetchServiceFunction = fs_readFileSync(CONTROLLER_CLASS_FETCH_FUNCTION, 'utf-8');
			const fetchServiceFunctionGetProperty = fs_readFileSync(
				CONTROLLER_CLASS_FETCH_FUNCTION_Get_PROPERTY,
				'utf-8'
			);
			const userNode = NodesByType(state, NodeTypes.Model).find((x: any) =>
				GetNodeProp(x, NodeProperties.IsUser)
			);
			const outputType = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
				id: controller.id,
				link: LinkType.FetchServiceOuput
			})[0];

			const methods = GraphMethods.GetNodesLinkedTo(GetCurrentGraph(), {
				id: controller.id,
				link: LinkType.FetchService
			}).filter((x: any) => {
				const methodType = GetNodeProp(x, NodeProperties.FunctionType);
				const functionType = MethodFunctions[methodType];
				return functionType.isFetchCompatible;
			});

			let functions = '';
			let set_outputs = '';
			let controllers: any[] = [];
			set_outputs = methods
				.map((method: { id: any }) => {
					const methodProperties = GetNodeProp(method, NodeProperties.MethodProps);
					const modelNode = GetNodeById(methodProperties.model_output) || GetNodeById(methodProperties.model);
					const maestro = GetMaestroNode(method.id);
					const controller = GetControllerNode(maestro.id);
					const output_type = GetCodeName(modelNode);
					controllers.push(controller.id);
					return bindTemplate(fetchServiceFunctionGetProperty, {
						model_output: output_type,
						functionName: GetCodeName(method),
						controller: GetCodeName(controller),
						controller_user: controllerUser
					});
				})
				.join(NEW_LINE);
			controllers = controllers
				.unique()
				.map((v: any) =>
					bindTemplate(
						`var {{controller#lower}} = new {{controller}}();
            {{controller#lower}}.${GetNodeProp(v, NodeProperties.CodeUser)} = ${controllerUser};
            `,
						{
							controller: GetCodeName(v)
						}
					)
				)
				.join(NEW_LINE);
			const httpMethod = `${GetNodeProp(controller, NodeProperties.HttpMethod)}`;
			const httpRoute = `${GetNodeProp(controller, NodeProperties.HttpRoute)}`;
			const codeName = `${GetNodeProp(controller, NodeProperties.CodeName)}`;

			functions = bindTemplate(fetchServiceFunction, {
				output_type: GetCodeName(outputType),
				functionName: 'FetchItems',
				http_route: httpRoute || '{controller_generator_http_method}',
				http_method: 'HttpPost',
				set_outputs,
				controllers
			});
			controllerTemplateClass = bindTemplate(controllerTemplateClass, {
				codeName,
				'codeName#alllower': codeName.toLowerCase(),
				user_instance: controllerUser,

				user: userNode ? GetNodeProp(userNode, NodeProperties.CodeName) : '{controller_generator_code_name}',
				functions
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
