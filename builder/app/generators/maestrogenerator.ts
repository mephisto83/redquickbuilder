import fs from 'fs';
import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodeTypes,
	NodesByType,
	GetRootGraph,
	GetCurrentGraph,
	GetCodeName,
	GenerateDataChainArguments,
	GetLambdaDefinition
} from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	STANDARD_CONTROLLER_USING,
	NEW_LINE,
	STANDARD_TEST_USING,
	Methods
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
const get_agent_manytomany_listchild_interface =
	'./app/templates/maestro/tests/get_agent_manytomany_listchild_interface.tpl';
const MAESTRO_FUNCTION_GET_TESTS = './app/templates/maestro/tests/maestro_get.tpl';
const PROPERTY_TABS = 6;
export default class MaestroGenerator {
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

		const maestros = NodesByType(state, NodeTypes.Maestro).filter(
			(x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration)
		);

		const _maestroTemplateClass = fs.readFileSync(MAESTRO_CLASS_TEMPLATE, 'utf8');
		const _MAESTRO_INTERFACE_TEMPLATE = fs.readFileSync(MAESTRO_INTERFACE_TEMPLATE, 'utf8');
		const _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
		const testFunctionTemplate = fs.readFileSync(MAESTRO_FUNCTION_TESTS, 'utf8');
		const testFunctionGetSameParentTemplate = fs.readFileSync(MAESTRO_FUNCTION_SAME_AGENT_MODEL_TESTS, 'utf8');

		const testFunctionGetTemplate = fs.readFileSync(MAESTRO_FUNCTION_GET_TESTS, 'utf8');
		const root = GetRootGraph(state);
		const graph = GetCurrentGraph(state);
		const result: any = {};
		maestros.map((maestro: { id: any }) => {
			let maestroTemplateClass = _maestroTemplateClass;
			let functions = '';
			let functionsInterface = '';
			const statics = '';
			const codeName = `${GetNodeProp(maestro, NodeProperties.CodeName)}`;

			let maestro_functions = [];
			const tempfunctions = GraphMethods.getNodesByLinkType(root, {
				id: maestro.id,
				type: LinkType.FunctionLink,
				direction: GraphMethods.SOURCE
			});
			let arbiters: any[] = [];
			let permissions: any[] = [];
			const maestroName = GetNodeProp(maestro, NodeProperties.CodeName);
			maestro_functions = tempfunctions;
			let permissionValidationCases: any[] = [];
			if (maestro_functions.length) {
				maestro_functions
					.filter((x) => !GetNodeProp(x, NodeProperties.NotIncludedInController))
					.map((maestro_function: any) => {
						const function_type = GetNodeProp(maestro_function, NodeProperties.FunctionType);
						const ft = MethodFunctions[function_type];
						if (ft) {
							let tempFunction = ft.template;
							if (fs.existsSync(ft.template)) {
								tempFunction = fs.readFileSync(ft.template, 'utf8');
							}
              let interfaceFunction = ft.interface;
              if (fs.existsSync(ft.interface)) {
								interfaceFunction = fs.readFileSync(ft.interface, 'utf8');
							}
              let testFunction = ft.test;
              if (fs.existsSync(testFunction)) {
								testFunction = fs.readFileSync(testFunction, 'utf8');
							}
							let value_type = '';
							let parent_type = '';
							if (ft.parentGet) {
								value_type = 'string';
							}
							const functionName = `${GetNodeProp(maestro_function, NodeProperties.CodeName)}`;
							const httpMethod = `${GetNodeProp(maestro_function, NodeProperties.HttpMethod)}`;
							const httpRoute = `${GetNodeProp(maestro_function, NodeProperties.HttpRoute)}`;
							let datachainoptions = { 'lambda.default': '' };
							const dataChainNodes = GraphMethods.GetNodesLinkedTo(null, {
								id: maestro_function.id,
								link: LinkType.DataChainLink,
								direction: GraphMethods.SOURCE
							});
							dataChainNodes.map((dataChainNode: { id: string }) => {
								const lambda = GetLambdaDefinition(maestro_function);
								if (lambda) {
									if (dataChainNode) {
										const dataChainArgs = GenerateDataChainArguments(dataChainNode.id);
										const link = GraphMethods.GetLinkBetween(
											maestro_function.id,
											dataChainNode.id,
											GetCurrentGraph()
										);
										datachainoptions['lambda.default'] = `
        var ${GetCodeName(dataChainNode).toLowerCase()} = RedStrapper.Resolve<${GetCodeName(dataChainNode)}>();
        return await ${GetCodeName(dataChainNode).toLowerCase()}.Execute(${dataChainArgs});`;
									} else if (lambda.default) {
										datachainoptions = {
											'lambda.default': `return ${lambda.default.return};`
										};
									}
								}
							});
							if (!datachainoptions['lambda.default'] && ft.lambda && ft.lambda.default) {
								datachainoptions['lambda.default'] = `return ${ft.lambda.default.return};`;
							}
							let agentTypeNode = null;
							let fetchTypeNode = null;
							let userTypeNode: any = null;
							let parentNode: any = null;
							let permissionNode = null;
							let modelFilterNode = null;
							let compositeInput: any = null;
							let manyToManyNode: any = null;
							let connectingNode = null;
							let parent_setup = '';
							let modelNode: any = null;
							const parent = null;
							let model_output = null;
							const methodProps = GetNodeProp(maestro_function, NodeProperties.MethodProps);
							let predicates: any = '';
							if (methodProps) {
								agentTypeNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.AgentType] ||
										methodProps[FunctionTemplateKeys.Agent]
								);
								modelNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.Model]);
								userTypeNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.User]);
								fetchTypeNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.FetchParameter]
								);
								permissionNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.Permission]
								);
								modelFilterNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.ModelFilter]
								);
								compositeInput = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.CompositeInput]
								);
								manyToManyNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.ManyToManyModel]
								);
								connectingNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.ConnectionType]
								);
								model_output = GetCodeName(methodProps[FunctionTemplateKeys.ModelOutput]);
								parentNode = GraphMethods.GetNode(graphRoot, methodProps[FunctionTemplateKeys.Parent]);
								parent_type = parentNode
									? GetNodeProp(parentNode, NodeProperties.CodeName)
									: '{missing parent name}';
								manyToManyNode = GraphMethods.GetNode(
									graphRoot,
									methodProps[FunctionTemplateKeys.ManyToManyModel]
								);
								const modelItemFilters = GraphMethods.GetLinkChain(state, {
									id: maestro_function.id,
									links: [
										{
											type: LinkType.ModelItemFilter,
											direction: GraphMethods.SOURCE
										}
									]
								});
								const out_predicate: any = {};
								predicates = ModelItemFilterGenerator.predicates(modelItemFilters, out_predicate);
								if (predicates.length) {
									predicates = predicates.join(', ');
								} else {
									predicates = '';
								}
								if (out_predicate.parent) {
									parent_setup = `var parent = await arbiter${parent_type}.Get<${parent_type}>(model.${parent_type});`;
								}
							}

							const agent = agentTypeNode
								? `${GetNodeProp(agentTypeNode, NodeProperties.CodeName)}`
								: `{maestro_generator_mising_agentTypeNode}`;
							const model_type = modelNode
								? GetNodeProp(modelNode, NodeProperties.CodeName)
								: `{maestro_generator_mising_model}`;
							const agent_type = agentTypeNode
								? `${GetNodeProp(agentTypeNode, NodeProperties.CodeName)}`
								: `{maestro_generator_mising_agentTypeNode}`;
							const methodType = GetNodeProp(maestro_function, NodeProperties.MethodType);
							const connect_type = connectingNode
								? GetCodeName(connectingNode)
								: '{maestro_connection_type_missing}';
							if (parentNode) arbiters.push(parent_type);
							const manyNodes =
								GraphMethods.GetManyToManyNodes(
									graphRoot,
									[
										modelNode ? modelNode.id : false,
										agentTypeNode ? agentTypeNode.id : null
									].filter((x) => x)
								) || [];
							arbiters.push(
								...manyNodes.map((manyNode: any) => GetNodeProp(manyNode, NodeProperties.CodeName))
							);
							arbiters.push(agent_type, model_type);
							permissions.push({ agent_type, model_type });
							let value = '';
							let agentAndModelIsTheSame = false;
							if (ft.parentGet) {
								value = parentNode
									? `${GetNodeProp(parentNode, NodeProperties.CodeName)}`.toLowerCase()
									: '{missing parent name}';
								if (agentTypeNode && parentNode) {
									agentAndModelIsTheSame = agentTypeNode.id === parentNode.id;
								}
							} else {
								value = modelNode
									? `${GetNodeProp(modelNode, NodeProperties.CodeName)}`.toLowerCase()
									: `{maestro_generator_mising_model}`;
							}

							const bindOptions = {
								...datachainoptions,
								function_name: functionName,
								agent_type,
								'agent_type#lower': `${agent_type}`.toLowerCase(),
								parent_type,
								agent,
								'composite-input': GetCodeName(compositeInput) || '',
								model_input: GetCodeName(compositeInput) || model_type,
								value_type,
								value,
								parent_setup,
								model_output,
								parent: GetCodeName(parentNode),
								model: model_type,
								connect_type,
								comma: predicates.length ? ',' : '',
								predicates,
								maestro_function: functionName,
								filter_function: modelFilterNode
									? GetNodeProp(modelFilterNode, NodeProperties.CodeName)
									: '{missing filter node}',
								user: userTypeNode
									? GetNodeProp(userTypeNode, NodeProperties.CodeName)
									: `{maestro_generator_mising_user}`,
								http_route: httpRoute || '{maestro_generator_http_method',
								http_method: httpMethod || '{maestro_generator_http_method',
								fetch_parameter: fetchTypeNode
									? `${GetNodeProp(fetchTypeNode, NodeProperties.CodeName)}`
									: `{maestro_generator_mising_fetchParameter}`,
								user_instance: userTypeNode
									? `${GetNodeProp(userTypeNode, NodeProperties.CodeName)}`.toLowerCase()
									: `{maestro_generator_mising_userNode}`,
								output_type: modelNode ? GetCodeName(modelNode) : '{maestro_generator_missing_model}',
								maestro_interface: ToInterface(maestroName),
								permission_function: permissionNode
									? GetNodeProp(permissionNode, NodeProperties.CodeName)
									: `{MISSING_PERMISSION_FUNCTION}`,
								input_type: modelNode ? GetCodeName(modelNode) : '{maestro_generator_missing_model}'
							};
							tempFunction = bindTemplate(tempFunction, bindOptions);
							interfaceFunction = bindTemplate(interfaceFunction, bindOptions);

							functions += jNL + tempFunction;
							functionsInterface += jNL + interfaceFunction;

							const cases = PermissionGenerator.EnumeratePermissionCases(
								graph,
								permissionNode,
								methodType,
								agentTypeNode,
								modelNode
							);
							const validators = StreamProcessOrchestrationGenerator.EnumerateFunctionValidators(
								state,
								maestro_function
							);
							if (validators && cases) {
								validators.map((validator) => {
									cases.map((_case: any) => {
										const pvc: any = {};
										const pvc2: any = {};
										if (validator && validator.agent && _case.agentProperties) {
											var temp = [
												...validator.agent.propertyInformation.map(
													(t: { set_properties: any }) => t.set_properties
												),
												..._case.properties
													.filter(
														(x: { type: string }) => x.type === FunctionTemplateKeys.Agent
													)
													.map((t: { props: any }) => t.props)
													.map((t: { property: any }, index: string | number) => {
														if (
															validator.agent.propertyInformation.findIndex(
																(x: { property: any }) => x.property === t.property
															) !== -1
														) {
															return false;
														}
														return _case.agentProps[index];
													})
													.filter((x: any) => x)
											].join(NEW_LINE);
											pvc.agent = temp;
										}
										if (validator && validator.model && _case.itemProperties) {
											var temp = [
												...validator.model.propertyInformation.map(
													(t: { set_properties: any }) => t.set_properties
												),
												..._case
													.filter(
														(x: { type: string }) => x.type === FunctionTemplateKeys.Model
													)
													.map((t: { props: any }) => t.props)
													.map((t: { property: any }, index: string | number) => {
														if (
															validator.model.propertyInformation.findIndex(
																(x: { property: any }) => x.property === t.property
															) !== -1
														) {
															return false;
														}
														return _case.itemProps[index];
													})
													.filter((x: any) => x)
											].join(NEW_LINE);
											pvc.model = temp;
										}

										if (validator && validator.agent && _case.agentProperties) {
											var temp = [
												..._case.agentProperties.map(
													(t: any, index: string | number) => _case.agentProps[index]
												),
												...validator.agent.propertyInformation
													.map((t: { property: any }, index: string | number) => {
														if (
															_case.agentProperties.findIndex(
																(x: { property: any }) => x.property === t.property
															) !== -1
														) {
															return false;
														}
														return validator.agent.propertyInformation[index]
															.set_properties;
													})
													.filter((x: any) => x)
											].join(NEW_LINE);
											pvc2.agent = temp;
										}
										if (validator && validator.model && _case.itemProperties) {
											var temp = [
												..._case.itemProperties.map(
													(t: any, index: string | number) => _case.itemProps[index]
												),
												...validator.model.propertyInformation
													.map((t: { property: any }, index: string | number) => {
														if (
															_case.itemProperties.findIndex(
																(x: { property: any }) => x.property === t.property
															) !== -1
														) {
															return false;
														}
														return validator.model.propertyInformation[index]
															.set_properties;
													})
													.filter((x: any) => x)
											].join(NEW_LINE);
											pvc2.model = temp;
										}

										permissionValidationCases.push(pvc2);
										permissionValidationCases.push(pvc);
									});
								});

								permissionValidationCases = permissionValidationCases.map((pvc, index) => {
									// Generate tests.
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
											templ = fs.readFileSync(get_agent_manytomany_listchild_interface, 'utf8');
											break;
									}
									if (ft.test) {
										templ = ft.test;
									}
									return bindTemplate(templ, {
										agent: agent_type,
										many_to_many: GetNodeProp(manyToManyNode, NodeProperties.CodeName),
										parent: GetNodeProp(parentNode, NodeProperties.CodeName),
										set_many_to_many_properties: '//{not set yet}',
										value: modelNode
											? `${GetNodeProp(modelNode, NodeProperties.CodeName)}`.toLowerCase()
											: `{maestro_generator_mising_model}`,
										model: model_type,
										model_input: GetCodeName(compositeInput) || model_type,
										function_name: functionName,
										maestro: maestroName,
										set_agent_properties: pvc.agent,
										user: userTypeNode
											? GetNodeProp(userTypeNode, NodeProperties.CodeName)
											: `{maestro_generator_mising_user}`,
										set_model_properties: pvc.model,
										testname: `${functionName}Test${index}`
									});
								});
								// Do analysis on whether these validations are completely bonk.
							}
						}
					});
			}
			arbiters = arbiters.unique();
			permissions = permissions.unique((x: { agent_type: any }) => `${x.agent_type}`);
			const injectedServices = arbiters.map((x: any) => `IRedArbiter<${x}> _arbiter${x}`);
			const injectedPermissionServices = permissions.map(
				(x: { agent_type: string }) => `IPermissions${x.agent_type} _${x.agent_type.toLowerCase()}Permissions`
			);
			const set_properties = arbiters.map(
				(x: any) => `${jNL + MaestroGenerator.Tabs(4)}arbiter${x} = _arbiter${x};`
			);
			const set_permissions = permissions.map(
				(x: { agent_type: string }) =>
					`${jNL +
						MaestroGenerator.Tabs(
							4
						)}${x.agent_type.toLowerCase()}Permissions = _${x.agent_type.toLowerCase()}Permissions;`
			);
			const properties = arbiters.map(
				(x: any) => `${jNL + MaestroGenerator.Tabs(3)}private readonly IRedArbiter<${x}> arbiter${x};`
			);
			const permissions_properties = permissions.map(
				(x: { agent_type: string }) =>
					`${jNL +
						MaestroGenerator.Tabs(
							3
						)}private readonly IPermissions${x.agent_type} ${x.agent_type.toLowerCase()}Permissions;`
			);
			const testTemplate = bindTemplate(_testClass, {
				name: codeName,
				tests: permissionValidationCases.join(NEW_LINE)
			});
			maestroTemplateClass = bindTemplate(maestroTemplateClass, {
				codeName,
				set_properties: [ ...set_properties, ...set_permissions ].join(jNL),
				properties: [ ...permissions_properties, ...properties ].join(' '),
				injected_services: [ ...injectedServices, ...injectedPermissionServices ]
					.map((t, ti) => jNL + MaestroGenerator.Tabs(7) + t)
					.join(','),
				'codeName#alllower': codeName.toLowerCase(),
				functions
			});
			const maestro_interface_template = bindTemplate(_MAESTRO_INTERFACE_TEMPLATE, {
				codeName,
				set_properties: [ ...set_properties, ...set_permissions ].join(jNL),
				properties: [ ...permissions_properties, ...properties ].join(' '),
				injected_services: [ ...injectedServices, ...injectedPermissionServices ]
					.map((t, ti) => jNL + MaestroGenerator.Tabs(7) + t)
					.join(','),
				'codeName#alllower': codeName.toLowerCase(),
				functions: functionsInterface
			});
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
						`${namespace}${NameSpace.Parameters}`
					],
					namespace,
					space: NameSpace.Controllers
				}),
				interface: NamespaceGenerator.Generate({
					template: maestro_interface_template,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Interface}`
					],
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
						`${namespace}${NameSpace.Constants}`
					],
					namespace,
					space: NameSpace.Tests
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
