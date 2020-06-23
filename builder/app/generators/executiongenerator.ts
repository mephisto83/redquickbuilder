import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodesByType,
	NodeTypes,
	GetRootGraph,
	GetMethodProps,
	GetCodeName,
	GetNodeCode,
	GetMethodNode,
	GetMethodNodeProp,
	GetCurrentGraph,
	GetState,
	GetNodeById
} from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NEW_LINE,
	ConstantsDeclaration,
	MakeConstant,
	NameSpace,
	STANDARD_CONTROLLER_USING,
	ValidationCases,
	STANDARD_TEST_USING,
	Methods,
	ExecutorRules
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate, FunctionTemplateKeys, MethodTemplateKeys } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';
import { Node } from '../methods/graph_types';

const EXECUTOR_CLASS = './app/templates/executor/executor_class.tpl';
const EXECUTOR_INTERFACE = './app/templates/executor/executor_class_interface.tpl';
const EXECUTOR_CREATE = './app/templates/executor/create.tpl';
const EXECUTOR_CREATE_COMPOSITE_INPUT = './app/templates/executor/create_composite_input.tpl';

const EXECUTOR_ENTRY_METHODS = './app/templates/executor/executor_entry_methods.tpl';
const EXECUTOR_ENTRY_METHODS_INTERFACE = './app/templates/executor/executor_entry_methods_interface.tpl';
const EXECUTOR_METHOD_CASE = './app/templates/executor/entry_method_case.tpl';
const EXECUTOR_UPDATE = './app/templates/executor/update.tpl';
const EXECUTOR_DELETE = './app/templates/executor/delete.tpl';
const EXECUTOR_GET = './app/templates/executor/get.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const EXECUTOR_METHOD_COMPOSITE_INPUT = './app/templates/executor/executor_method_composite_input.tpl';
const EXECUTOR_METHODS = './app/templates/executor/executor_methods.tpl';
const EXECUTOR_METHODS_INTERFACE = './app/templates/executor/executor_methods_interface.tpl';

export default class ExecutorGenerator {
	static enumerateValidationTestVectors(validation_test_vectors: any) {
		const vects = validation_test_vectors.map((x: { values: { cases: {} } }) => Object.keys(x.values.cases).length);

		const enumeration = ExecutorGenerator.EnumerateCases(vects);
		return enumeration;
	}

	static GetParameters(executor_node: any) {
		const graph = GetCurrentGraph(GetState());
		const methodNode = GetMethodNode(executor_node.id);
		const agent = GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent);
		const model = GetMethodNodeProp(methodNode, FunctionTemplateKeys.Model);
		const modelOutput = GetMethodNodeProp(methodNode, FunctionTemplateKeys.ModelOutput);
		const modelNode = GraphMethods.GetNode(graph, model);
		const agentNode = GraphMethods.GetNode(graph, agent);

		// var vectors = ExecutorGenerator.enumerateValidationTestVectors(validation_test_vectors);

		let agent_parameter: any = GetCodeName(agentNode);
		agent_parameter = agent_parameter ? `${agent_parameter} agent` : false;

		let data_parameter: any = GetCodeName(modelNode);
		data_parameter = data_parameter ? `${data_parameter} data` : false;

		let change_parameter = !agent_parameter
			? false
			: `${GetNodeProp(modelNode, NodeProperties.CodeName)}ChangeBy${GetNodeProp(
					agentNode,
					NodeProperties.CodeName
				)}`;
		change_parameter = change_parameter ? `${change_parameter} change` : false;

		const parameters = [ data_parameter, agent_parameter, change_parameter ].filter((x) => x).join(', ');
		return parameters;
	}

	static GetOutput(executor_node: any) {
		const methodNode = GetMethodNode(executor_node.id);
		const modelOutput = GetMethodNodeProp(methodNode, FunctionTemplateKeys.ModelOutput);
		return modelOutput;
	}

	static EnumerateCases(vects: any, j = 0) {
		return enumerate(vects, j);
	}

	static Tabs(c: number) {
		let res = '';
		for (let i = 0; i < c; i++) {
			res += `    `;
		}
		return res;
	}

	static Generate(options: any) {
		const { state, key } = options;
		const graphRoot = GetRootGraph(state);
		const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		const graph = GetRootGraph(state);
		const result: any = {};

		const executor_nodes = NodesByType(state, NodeTypes.Executor);
		const _executor_class = fs.readFileSync(EXECUTOR_CLASS, 'utf8');
		const _executor_class_interface = fs.readFileSync(EXECUTOR_INTERFACE, 'utf8');
		const _executor_methods = fs.readFileSync(EXECUTOR_METHODS, 'utf8');
		const _executor_methods_composite_input = fs.readFileSync(EXECUTOR_METHOD_COMPOSITE_INPUT, 'utf8');
		const _executor_methods_interface = fs.readFileSync(EXECUTOR_METHODS_INTERFACE, 'utf8');
		const _executor_create = fs.readFileSync(EXECUTOR_CREATE, 'utf8');
		const _executor_create_composite_input = fs.readFileSync(EXECUTOR_CREATE_COMPOSITE_INPUT, 'utf8');
		const _executor_update = fs.readFileSync(EXECUTOR_UPDATE, 'utf8');
		const _executor_delete = fs.readFileSync(EXECUTOR_DELETE, 'utf8');
		const _executor_get = fs.readFileSync(EXECUTOR_GET, 'utf8');
		const _exe_method = fs.readFileSync(EXECUTOR_ENTRY_METHODS, 'utf8');
		const _exe_method_interface = fs.readFileSync(EXECUTOR_ENTRY_METHODS_INTERFACE, 'utf8');
		const _exe_case = fs.readFileSync(EXECUTOR_METHOD_CASE, 'utf8');
		const _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
		const agentFunctionDic: any = {};
		const agentFunctionInterfaceDic: any = {};
		const executor_entry_methods: any = [];
		const agentModelDic: any = {};
		const agmCombos: {
			agentId: any;
			agent: string;
			model: string;
			modelId: string;
			modelOutputId: string;
			model_output: string;
			functionNode: Node;
			function: string;
			executorId: string | null;
			executorType: string | null;
			functionId: string;
			method: any;
		}[] = [];
		const allmodels = NodesByType(state, NodeTypes.Model);
		const allagents = allmodels.filter(
			(x: any) => GetNodeProp(x, NodeProperties.IsAgent) && !GetNodeProp(x, NodeProperties.IsUser)
		);
		const allfunctions = NodesByType(state, [ NodeTypes.Function, NodeTypes.Method ]);

		allfunctions.map((fun: Node) => {
			const methodProps = GetMethodProps(fun);
			const agent = methodProps[FunctionTemplateKeys.Agent];
			const model = methodProps[FunctionTemplateKeys.Model];
			let model_output: any;
			let model_output_id = model;
			if (methodProps && methodProps[FunctionTemplateKeys.CompositeInput]) {
				model_output = GetCodeName(methodProps[FunctionTemplateKeys.CompositeInput]);
				model_output_id = methodProps[FunctionTemplateKeys.CompositeInput];
			}
			let executors = GraphMethods.GetNodesLinkedTo(graph, {
				id: fun.id,
				componentType: NodeTypes.Executor,
				link: LinkType.ExecutorFunction
			});

			if (executors.length) {
				executors.forEach((executor: Node) => {
					let method =
						GetNodeProp(executor, NodeProperties.ExecutorFunctionType) ||
						GetNodeProp(fun, NodeProperties.MethodType);
					if (method !== Methods.Get && method !== Methods.GetAll) {
						agmCombos.push({
							agentId: agent,
							agent: GetCodeName(agent),
							model: model_output || GetCodeName(model),
							modelId: model,
							executorId: executor.id,
							executorType: GetNodeProp(executor, NodeProperties.ExecutorFunctionType),
							modelOutputId: model_output_id,
							model_output: GetCodeName(model),
							function: GetCodeName(fun),
							functionNode: fun,
							functionId: fun.id,
							method:
								GetNodeProp(executor, NodeProperties.ExecutorFunctionType) ||
								GetNodeProp(fun, NodeProperties.MethodType)
						});
					}
				});
			} else {
				let method = GetNodeProp(fun, NodeProperties.MethodType);
				if (method !== Methods.Get && method !== Methods.GetAll) {
					agmCombos.push({
						agentId: agent,
						agent: GetCodeName(agent),
						model: model_output || GetCodeName(model),
						modelId: model,
						executorId: null,
						executorType: GetNodeProp(fun, NodeProperties.MethodType),
						modelOutputId: model_output_id,
						model_output: GetCodeName(model),
						function: GetCodeName(fun),
						functionNode: fun,
						functionId: fun.id,
						method: GetNodeProp(fun, NodeProperties.MethodType)
					});
				}
			}
		});

		executor_nodes.map((executor_node: { id: any }) => {
			const agent = GetNodeProp(executor_node, NodeProperties.ExecutorAgent);
			const model = GetNodeProp(executor_node, NodeProperties.ExecutorModel);
			const modelOutput = GetNodeProp(executor_node, NodeProperties.ExecutorModelOutput);
			const modelOutputNode = GraphMethods.GetNode(graph, modelOutput);
			const modelNode = GraphMethods.GetNode(graph, model);
			const agentNode = GraphMethods.GetNode(graph, agent);
			const funct = GetNodeProp(executor_node, NodeProperties.ExecutorFunction);
			const functNode = GraphMethods.GetNode(graph, funct);
			const functType = GetNodeProp(executor_node, NodeProperties.ExecutorFunctionType);
			const functionNode = GraphMethods.GetNode(graph, funct);
			const executor = GetNodeProp(executor_node, NodeProperties.Executor);
			const executorProperties = GraphMethods.getValidatorProperties(executor);
			const validation_test_vectors = [];
			const amdid =
				GetNodeProp(agentNode, NodeProperties.CodeName) +
				GetNodeProp(modelNode, NodeProperties.CodeName) +
				GetNodeProp(executor_node, NodeProperties.CodeName) +
				(GetNodeProp(executor_node, NodeProperties.ExecutorFunctionType) ||
					GetNodeProp(functionNode, NodeProperties.MethodType));
			agentModelDic[amdid] = agentModelDic[amdid] || [];

			agentModelDic[amdid].push({
				agent: GetCodeName(agentNode),
				model: GetCodeName(modelNode),
				model_output: GetCodeName(modelOutputNode),
				executorId: executor_node.id,
				functType,
				funct: GetCodeName(functNode)
			});
			const methodProps = GetMethodProps(functNode);
			const propertyValidationStatements = Object.keys(executorProperties || {})
				.map((property) => {
					const propertyNode = GraphMethods.GetNode(graph, property);
					const validatorPs = executorProperties[property];

					const properties = Object.keys(validatorPs.validators)
						.map((vld) => {
							const validators = validatorPs.validators[vld];
							const node = GraphMethods.GetNode(graph, validators.node);
							let attribute_type_arguments: any = '';
							if (node) {
								switch (GetNodeProp(node, NodeProperties.NODEType)) {
									case NodeTypes.ExtensionType:
										if (validators && validators.extension) {
											const temp: any = { '_ _': '"_____"' };
											attribute_type_arguments = Object.keys(validators.extension)
												.map((ext) => {
													if (validators.extension[ext]) {
														temp[`${ext}`] = `${GetNodeProp(
															node,
															NodeProperties.CodeName
														)}.${MakeConstant(ext)}`;
														return temp[`${ext}`];
													}
												})
												.filter((x) => x);
											attribute_type_arguments = temp
												.filter((x: any) => x)
												.unique((x: any) => x)
												.join();
											validation_test_vectors.push({
												property: GetNodeProp(propertyNode, NodeProperties.CodeName),
												values: { cases: temp }
											});
											attribute_type_arguments = `new List<string> () {
                ${attribute_type_arguments}
            }`;
										}
										break;
									case NodeTypes.Enumeration:
										break;
									default:
										break;
								}
							}
							if (ValidationCases[validators.type]) {
								validation_test_vectors.push({
									property: GetNodeProp(propertyNode, NodeProperties.CodeName),
									values: ValidationCases[validators.type]
								});
							}
							let template = `result{{model_property}} = data{{model_property}};`;
							const templateBindings: any = {};
							switch (validators.type) {
								case ExecutorRules.AgentReference:
									template = `result{{model_property}} = agent.Id;`;
									break;
								case ExecutorRules.ParentReference:
									template = `result{{model_property}} = data{{model_property}};`;
									break;
								case ExecutorRules.SetToDeleted:
									template = `result.Deleted = true;`;
									break;
								case ExecutorRules.Copy:
									break;
								case ExecutorRules.AddModelReference:
									template = fs.readFileSync(
										`app/templates/executor/snippets/add-model-reference.tpl`,
										'utf8'
									);

									const { references } = validators;
									if (references) {
										const methodNode = GraphMethods.GetMethodNode(state, executor_node.id);
										if (methodNode) {
											const methodProps = GetMethodProps(methodNode);
											Object.keys(references).map((ref_key) => {
												templateBindings[ref_key] = GetCodeName(
													methodProps[references[ref_key]]
												);
											});
										}
									}
									break;
								default:
									throw 'not handle [execution generator]';
							}
							const templateRes = bindTemplate(template, {
								attribute_type: validators.code[ProgrammingLanguages.CSHARP],
								attribute_type_arguments,
								model_property: `.${GetNodeProp(propertyNode, NodeProperties.CodeName)}`,
								...{ ...templateBindings }
							});
							return ExecutorGenerator.Tabs(4) + templateRes + NEW_LINE;
						})
						.unique((x: any) => x)
						.join('');

					return properties;
				})
				.unique((x: any) => x)
				.join('');

			let template = '{{not-defined template}}';
			let execution_method = _executor_methods;
			switch (functType) {
				case Methods.Create:
					template = _executor_create;
					if (methodProps[FunctionTemplateKeys.CompositeInput]) {
						execution_method = _executor_methods_composite_input;
						template = _executor_create_composite_input;
					}
					break;
				case Methods.Update:
					template = _executor_update;
					break;
				case Methods.Get:
				case Methods.GetAll:
					template = _executor_get;
					break;
				case Methods.Delete:
					template = _executor_delete;
					break;
				default:
					break;
			}
			var templateRes = bindTemplate(template, {
				property_sets: propertyValidationStatements,
				model: `${GetCodeName(modelNode)}`,
				model_output: GetCodeName(modelOutputNode)
			});

			// var vectors = ExecutorGenerator.enumerateValidationTestVectors(validation_test_vectors);

			let agent_parameter: any = GetCodeName(agentNode);
			agent_parameter = agent_parameter ? `${agent_parameter} agent` : false;

			let data_parameter: any = GetCodeName(modelNode);
			data_parameter = data_parameter ? `${data_parameter} data` : false;

			let change_parameter = !agent_parameter
				? false
				: `${GetNodeProp(modelNode, NodeProperties.CodeName)}ChangeBy${GetNodeProp(
						agentNode,
						NodeProperties.CodeName
					)}`;
			change_parameter = change_parameter ? `${change_parameter} change` : false;

			const parameters = [ data_parameter, agent_parameter, change_parameter ].filter((x) => x).join(', ');

			var templateRes = bindTemplate(execution_method, {
				model: GetCodeName(modelNode),
				model_output: GetCodeName(modelOutputNode) || GetCodeName(modelNode),
				method_name: GetCodeName(executor_node),
				parameters,
				data: GetCodeName(modelNode),
				agent: GetCodeName(agentNode),
				change: `${GetCodeName(modelNode)}Change`,
				method_guts: templateRes
			});

			const templateResInterface = bindTemplate(_executor_methods_interface, {
				model: GetCodeName(modelNode),
				model_output: GetCodeName(modelOutputNode) || GetCodeName(modelNode),
				method_name: GetCodeName(executor_node),
				parameters,
				data: GetCodeName(modelNode),
				agent: GetCodeName(agentNode),
				change: `${GetCodeName(modelNode)}Change`,
				method_guts: templateRes
			});

			// var testTemplate = bindTemplate(_testClass, {
			//     name: GetNodeProp(node, NodeProperties.CodeName),
			//     tests: testProps.join(NEW_LINE)
			// });
			agentFunctionInterfaceDic[agent] = agentFunctionInterfaceDic[agent] || [];
			agentFunctionDic[agent] = agentFunctionDic[agent] || [];
			agentFunctionDic[agent].push(templateRes);
			agentFunctionInterfaceDic[agent].push(templateResInterface);
		});
		let lastCase;
		const static_methods: any[] = [];
		let agmGroups = agmCombos.groupBy((amd: any) => {
			const { agentId, modelId, method, modelOutputId } = amd;
			return `${agentId} - ${modelId} ~ ${method} - ${modelOutputId}`;
		});
		Object.keys(agmGroups).forEach((kagm) => {
			let agmCombos = agmGroups[kagm];

			const cases: any[] = [];
			const { agent, agentId, model, model_output, method } = agmCombos[0];
			agmCombos.map((amd: any) => {
				const { agent, model, functionId, executorId } = amd;
				let executor = GetNodeById(executorId);
				let funcName = GetCodeName(functionId);
				const _case =
					bindTemplate(_exe_case, {
						agent,
						model,
						executor_func_name: GetCodeName(executor) || funcName,
						func_name: GetCodeName(executor) || funcName
					}) + NEW_LINE;
				cases.push(_case);

				// cases.push(
				// 	...(agentModelDic[agent + model + amd.method] || [])
				// 		.map((_cases: { agent: any; model: any; functType: any; funct: any }) => {
				// 			const { agent, model, funct } = _cases;
				// 			if (amd.agent !== agent) {
				// 				'';
				// 			}

				// 			const _case = bindTemplate(_exe_case, {
				// 				agent,
				// 				model,
				// 				executor_func_name: GetCodeName(executor),
				// 				func_name: GetCodeName(executor) || funct
				// 			});
				// 			return _case + NEW_LINE;
				// 		})
				// );
			});

			static_methods.push({
				template:
					bindTemplate(_exe_method, {
						agent,
						model,
						cases: cases.unique((x: any) => x).join(''),
						change: `${model}`,
						model_output: model_output || model,
						method
					}) + NEW_LINE,
				agent: agentId
			});
		});
		const static_methods_interface = agmCombos.map((amd) => {
			const { agent, model, method, agentId, model_output } = amd;
			return {
				template:
					bindTemplate(_exe_method_interface, {
						agent,
						model,
						model_output: model_output || model,
						change: `${model}`,
						method
					}) + NEW_LINE,
				agent: agentId
			};
		});
		Object.keys(agentFunctionDic).map((agent) => {
			const node = GraphMethods.GetNode(graph, agent);
			const templateRes = bindTemplate(_executor_class, {
				model: GetNodeProp(node, NodeProperties.CodeName),
				methods: agentFunctionDic[agent].join(''),
				staticentry: static_methods
					.unique((x: { template: any }) => x.template)
					.filter((x: { agent: string }) => x.agent === agent)
					.map((x: { template: any }) => x.template)
					.join('')
			});

			const templateInterfaceRes = bindTemplate(_executor_class_interface, {
				model: GetNodeProp(node, NodeProperties.CodeName),
				methods: agentFunctionInterfaceDic[agent].unique((x: any) => x).join(''),
				staticentry: static_methods_interface
					.unique((x: { template: any }) => x.template)
					.filter((x: { agent: string }) => x.agent === agent)
					.map((x: { template: any }) => x.template)
					.join('')
			});

			result[GetNodeProp(node, NodeProperties.CodeName)] = {
				id: GetNodeProp(node, NodeProperties.CodeName),
				name: `${GetNodeProp(node, NodeProperties.CodeName)}Executor`,
				tname: `${GetNodeProp(node, NodeProperties.CodeName)}ExecutorTests`,
				iname: `I${GetNodeProp(node, NodeProperties.CodeName)}Executor`,
				template: NamespaceGenerator.Generate({
					template: templateRes,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Parameters}`,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.Constants}`
					],
					namespace,
					space: NameSpace.Executors
				}),
				interface: NamespaceGenerator.Generate({
					template: templateInterfaceRes,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Parameters}`,
						`${namespace}${NameSpace.Constants}`
					],
					namespace,
					space: NameSpace.Interface
				})
				// test: NamespaceGenerator.Generate({
				//     template: testTemplate,
				//     usings: [
				//         ...STANDARD_CONTROLLER_USING,
				//         ...STANDARD_TEST_USING,
				//         `${namespace}${NameSpace.Executors}`,
				//         `${namespace}${NameSpace.Model}`,
				//         `${namespace}${NameSpace.Constants}`],
				//     namespace,
				//     space: NameSpace.Tests
				// }),
			};
		});

		allagents.forEach((node: Node) => {
			if (!result[GetNodeProp(node, NodeProperties.CodeName)]) {
				// add empty executor
				const templateRes = bindTemplate(_executor_class, {
					model: GetNodeProp(node, NodeProperties.CodeName),
					methods: '',
					staticentry: static_methods
						.unique((x: { template: any }) => x.template)
						.filter((x: { agent: string }) => x.agent === node.id)
						.map((x: { template: any }) => x.template)
						.join('')
				});
				const templateInterfaceRes = bindTemplate(_executor_class_interface, {
					model: GetNodeProp(node, NodeProperties.CodeName),
					methods: '',
					staticentry: static_methods_interface
						.unique((x: { template: any }) => x.template)
						.filter((x: { agent: string }) => x.agent === node.id)
						.map((x: { template: any }) => x.template)
						.join('')
				});

				result[GetNodeProp(node, NodeProperties.CodeName)] = {
					id: GetNodeProp(node, NodeProperties.CodeName),
					name: `${GetNodeProp(node, NodeProperties.CodeName)}Executor`,
					tname: `${GetNodeProp(node, NodeProperties.CodeName)}ExecutorTests`,
					iname: `I${GetNodeProp(node, NodeProperties.CodeName)}Executor`,
					template: NamespaceGenerator.Generate({
						template: templateRes,
						usings: [
							...STANDARD_CONTROLLER_USING,
							`${namespace}${NameSpace.Model}`,
							`${namespace}${NameSpace.Parameters}`,
							`${namespace}${NameSpace.Interface}`,
							`${namespace}${NameSpace.Constants}`
						],
						namespace,
						space: NameSpace.Executors
					}),
					interface: NamespaceGenerator.Generate({
						template: templateInterfaceRes,
						usings: [
							...STANDARD_CONTROLLER_USING,
							`${namespace}${NameSpace.Model}`,
							`${namespace}${NameSpace.Parameters}`,
							`${namespace}${NameSpace.Constants}`
						],
						namespace,
						space: NameSpace.Interface
					})
					// test: NamespaceGenerator.Generate({
					//     template: testTemplate,
					//     usings: [
					//         ...STANDARD_CONTROLLER_USING,
					//         ...STANDARD_TEST_USING,
					//         `${namespace}${NameSpace.Executors}`,
					//         `${namespace}${NameSpace.Model}`,
					//         `${namespace}${NameSpace.Constants}`],
					//     namespace,
					//     space: NameSpace.Tests
					// }),
				};
			}
		});

		return result;
	}
}
