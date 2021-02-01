import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodesByType,
	GetRootGraph,
	NodeTypes,
	GetCodeName,
	GetMethodProps,
	IsAgent,
	GetGraphNode,
	GetValidationsSortedByAgent,
	GetState,
	GetCurrentGraph,
	AgentHasExecutor
} from '../actions/uiActions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	STANDARD_CONTROLLER_USING,
	NameSpace,
	STANDARD_TEST_USING,
	NEW_LINE,
	Methods,
	LinkProperties
} from '../constants/nodetypes';
import fs from 'fs';
import {
	bindTemplate,
	FunctionTemplateKeys,
	MethodFunctions,
	AFTER_EFFECTS,
	AfterEffectsTemplate
} from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import PermissionGenerator from './permissiongenerator';
import ValidationRuleGenerator from './validationrulegenerator';
import { enumerate } from '../utils/utils';
import { Node, Graph } from '../methods/graph_types';
import { fs_readFileSync } from './modelgenerators';

const STREAM_PROCESS_ORCHESTRATION_TEMPLATE = './app/templates/stream_process/stream_process_orchestration.tpl';
const STREAM_PROCESS_ORCHESTRATION_ROOT_TEMPLATE =
	'./app/templates/stream_process/stream_process_orchestration_root.tpl';
const STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE =
	'./app/templates/stream_process/stream_process_orchestration_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS =
	'./app/templates/stream_process/stream_process_orchestration_agenttype_methods.tpl';
const STREAM_PROCESS_AGENT_CRUD_UPDATE = './app/templates/stream_process/agent_methods/update.tpl';
const STREAM_PROCESS_AGENT_CRUD_CREATE = './app/templates/stream_process/agent_methods/create.tpl';
const STREAM_PROCESS_AGENT_CRUD_DELETE = './app/templates/stream_process/agent_methods/delete.tpl';
const STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE =
	'./app/templates/stream_process/stream_process_orchestration_agenttype_methods_interface.tpl';
const STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES =
	'./app/templates/stream_process/stream_process_orchestration_selected_staged_changes.tpl';
const STREAM_METHOD_TESTS = './app/templates/stream_process/tests/stream_process_execution_tests.tpl';
const CREATE_MODEL_TESTS = './app/templates/stream_process/tests/create_model_tests.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
export default class StreamProcessOrchestrationGenerator {
	static GenerateStaticMethods(models: any[]) {
		let _streamProcessFunctionTemplate = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_STAGED_CHANGES, 'utf8');
		let staticMethods = models.map((model: any) => {
			let streamProcessFunctionTemplate = _streamProcessFunctionTemplate;
			let modelCode = GetNodeProp(model, NodeProperties.CodeName);
			let res = bindTemplate(streamProcessFunctionTemplate, {
				model: modelCode,
				[`model#allupper`]: modelCode.toUpperCase(),
				[`model#lower`]: modelCode.toLowerCase()
			});

			return res + jNL;
		});

		return staticMethods;
	}

	static GenerateAfterEffectsMethods(state: any, agents: Node[]) {
		let models = NodesByType(state, NodeTypes.Model);

		let graph: Graph = GetCurrentGraph();
		let results: string[] = [];
		let modelCases: { [str: string]: string[] } = {};
		agents.map((agent) => {
			let executors = NodesByType(state, NodeTypes.Executor).filter(
				(x: any) => GetNodeProp(x, NodeProperties.ExecutorAgent) === agent.id
			);
			models
				.filter((model: { id: any }) => {
					return executors.find(
						(executor: any) => GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id
					);
				})
				.map((model: any) => {
					let cases = '';
					executors
						.filter((executor: any) => GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id)
						.map((executor: any) => {
							return GraphMethods.GetNodeLinkedTo(graph, {
								id: executor.id,
								componentType: NodeTypes.Method
							});
						})
						.filter((v: any) => v)
						.map((funcs: Node) => {
							let temps = [
								...GraphMethods.GetNodesLinkedTo(graph, {
									id: funcs.id,
									link: LinkType.DataChainAfterEffectConverterTarget
								}),
								...GraphMethods.GetNodesLinkedTo(graph, {
									id: funcs.id,
									link: LinkType.AfterMethod
								})
							].unique((v: Node) => v.id);
							if (temps && temps.length) {
								temps.forEach((temp: Node) => {
									let dataChains = GraphMethods.GetNodesLinkedTo(graph, {
										id: temp.id,
										link: LinkType.DataChainAfterEffectConverter
									});
									let case_temp: string = dataChains
										.filter((chain: Node) => GetNodeProp(chain, NodeProperties.AfterEffectKey))
										.map((chain: Node) => {
											return `case ${GetNodeProp(chain, NodeProperties.AfterEffectKey)}:
                    await ${GetCodeName(chain)}.Execute(data, agent, change);
                  break;`;
										})
										.join(NEW_LINE);
									if (case_temp) {
										modelCases[model.id] = modelCases[model.id] || [];
										modelCases[model.id].push(case_temp);
									}
								});
							}
						})
						.filter((v: any) => v);
					if (modelCases[model.id]) {
						results.push(
							Tabs(4) +
								`public static async Task Execute(${GetNodeProp(
									model,
									NodeProperties.CodeName
								)} data, ${GetNodeProp(agent.id, NodeProperties.CodeName)} agent, ${GetNodeProp(
									model,
									NodeProperties.CodeName
								)}ChangeBy${GetCodeName(agent)} change, string nextPath = null) {
                nextPath = nextPath ?? change.NextPath;
                if(nextPath != null) {
                  switch(nextPath) {
                      ${modelCases[model.id].join(NEW_LINE)}
                  }
                }
              }` +
								jNL
						);
						cases = '';
					}
				});
		});
		return `public class AfterEffects {
      ${results.join(NEW_LINE)}
    }`;
	}

	static GenerateAgentMethods(state: null, agent: { id: any }) {
		let models = NodesByType(state, NodeTypes.Model);
		let methods = NodesByType(state, NodeTypes.Method);
		let agents = [ agent ]; // models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
		let _streamAgentMethods = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS, 'utf8');
		models = models.filter((model: { id: any }) => {
			return methods.find((method: string | Node | null) => {
				var props = GetMethodProps(method);
				return (
					props[FunctionTemplateKeys.Agent] === agent.id &&
					(props[FunctionTemplateKeys.Model] === model.id ||
						props[FunctionTemplateKeys.CompositeInput] === model.id)
				);
			});
		});
		let result: any[] = [];
		let modelexecution: string[] = [];
		let executors = NodesByType(state, NodeTypes.Executor).filter(
			(x: any) => GetNodeProp(x, NodeProperties.ExecutorAgent) === agent.id
		);

		agents.map((agent) => {
			models
				.filter((model: { id: any }) => {
					return executors.find(
						(executor: any) => GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id
					);
				})
				.map((model: any) => {
					modelexecution.push(
						Tabs(4) +
							`var report${GetNodeProp(model, NodeProperties.CodeName)} = await Process${GetNodeProp(model, NodeProperties.CodeName)}ChangesBy${GetCodeName(
								agent
							)}(distribution);
							distributionReports.Add(report${GetNodeProp(model, NodeProperties.CodeName)});
							` +
							jNL
					);
				});
		});
		result.push(`       public async Task<IList<DistributionReport>> ProcessStagedChanges(Distribution distribution = null) {
			var distributionReports = new List<DistributionReport>();
${modelexecution.join('')}
return distributionReports;
        }
`);
		// agents.map(agent => {
		let groupedExecutors = executors.groupBy((executor: any) => {
			return `${GetNodeProp(executor, NodeProperties.ExecutorAgent)} && ${GetNodeProp(
				executor,
				NodeProperties.ExecutorModel
			)}`;
		});
		Object.keys(groupedExecutors).map((ge) => {
			let executors = groupedExecutors[ge];

			let update_method: any = '';
			let update_call: any = '';
			let delete_method: any = '';
			let delete_call: any = '';
			let create_method: any = '';
			let create_call: any = '';
			let bind_params: any = null;
			let ae_functions: any = [];
			executors.map((executor: { id: any }) => {
				let agent: any = GetGraphNode(GetNodeProp(executor, NodeProperties.ExecutorAgent));
				let model: any = GetGraphNode(GetNodeProp(executor, NodeProperties.ExecutorModel));
				let model_output: any = GetGraphNode(GetNodeProp(executor, NodeProperties.ExecutorModelOutput));
				let methodNode: any = GraphMethods.GetMethodNode(state, executor.id);
				let methodProps: any = GetMethodProps(methodNode);
				let afterEffectMethods: any = GraphMethods.GetLinkChain(state, {
					id: methodNode.id,
					links: [
						{
							type: LinkType.AfterMethod,
							direction: GraphMethods.SOURCE
						}
					]
				});
				let ae_calls: any[] = [];
				afterEffectMethods.map((afterEffectMethod: any) => {
					var ae_type = GetNodeProp(afterEffectMethod, NodeProperties.AfterMethod);
					var ae_setup = GetNodeProp(afterEffectMethod, NodeProperties.AfterMethodSetup);
					if (AfterEffectsTemplate.DataChained === ae_type) {
						let dataChain = GraphMethods.GetNodeLinkedTo(GetCurrentGraph(), {
							id: afterEffectMethod.id,
							componentType: NodeTypes.DataChain
						});
						if (dataChain) {
							ae_calls.push(
								`await AfterEffects.Execute(data, agent, change, ${GetNodeProp(
									dataChain,
									NodeProperties.AfterEffectKey
								)});`
							);
						}
					} else if (AFTER_EFFECTS[ae_type] && ae_setup && ae_setup[ae_type]) {
						let { templateKeys, template_call, template } = AFTER_EFFECTS[ae_type];
						let templateString = fs_readFileSync(template, 'utf8');
						Object.keys(templateKeys).map((key) => {
							if (ae_setup[ae_type][key]) {
								let key_val = ae_setup[ae_type][key] || '';
								var name = key_val.startsWith('#')
									? key_val.split('#').join('')
									: GetCodeName(methodProps[key_val] || key_val) || key_val;
								templateString = bindTemplate(templateString, {
									[key]: name,
									[`${key}#lower`]: `${name}`.toLowerCase()
								});
								template_call = bindTemplate(template_call, {
									[key]: name,
									[`${key}#lower`]: `${name}`.toLowerCase()
								});
							}
						});
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

				bind_params = {
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
				ae_calls = ae_calls.unique().join(NEW_LINE);
				if (
					GetNodeProp(executor, NodeProperties.ExecutorFunctionType) === Methods.Update &&
					GetNodeProp(executor, NodeProperties.ExecutorAgent) === agent.id &&
					GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id
				) {
					update_method = bindTemplate(fs_readFileSync(STREAM_PROCESS_AGENT_CRUD_UPDATE, 'utf8'), {
						...bind_params,
						ae_calls
					});
					update_call = `case Methods.Update:
                        await Update(change);
                        break;`;
				} else if (
					GetNodeProp(executor, NodeProperties.ExecutorFunctionType) === Methods.Create &&
					GetNodeProp(executor, NodeProperties.ExecutorAgent) === agent.id &&
					GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id
				) {
					create_method = bindTemplate(fs_readFileSync(STREAM_PROCESS_AGENT_CRUD_CREATE, 'utf8'), {
						...bind_params,
						ae_calls
					});
					create_call = `case Methods.Create:
                        await Create(change);
                        break;`;
				} else if (
					GetNodeProp(executor, NodeProperties.ExecutorFunctionType) === Methods.Delete &&
					GetNodeProp(executor, NodeProperties.ExecutorAgent) === agent.id &&
					GetNodeProp(executor, NodeProperties.ExecutorModel) === model.id
				) {
					delete_method = bindTemplate(fs_readFileSync(STREAM_PROCESS_AGENT_CRUD_DELETE, 'utf8'), {
						...bind_params,
						ae_calls
					});
					delete_call = `
                        case Methods.Delete:
                            await Delete(change);
                            break;`;
				}

				//   });
			});
			var res = bindTemplate(_streamAgentMethods, {
				...bind_params,
				update_method,
				update_call,
				create_method,
				create_call,
				delete_method,
				delete_call,
				ae_functions: ae_functions.unique().join('')
			});
			result.push(res);
			result = result.unique();
		});

		return result.unique().join('');
	}
	static GenerateAgentInterfaceMethods(state: null, agent: { id: any }) {
		let models = NodesByType(state, NodeTypes.Model);
		let methods = NodesByType(state, NodeTypes.Method);
		let agents = [ agent ]; //models.filter(model => GetNodeProp(model, NodeProperties.IsAgent));
		let _streamAgentMethods = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_AGENT_METHODS_INTERFACE, 'utf8');
		models = models.filter((model: { id: any }) => {
			return methods.find((method: string | Node | null) => {
				var props = GetMethodProps(method);
				return (
					props[FunctionTemplateKeys.Agent] === agent.id &&
					(props[FunctionTemplateKeys.Model] === model.id ||
						props[FunctionTemplateKeys.CompositeInput] === model.id)
				);
			});
		});
		let result: any[] = [];
		let executors = NodesByType(state, NodeTypes.Executor).filter(
			(x: any) => GetNodeProp(x, NodeProperties.ExecutorAgent) === agent.id
		);
		let methods_interface: any[] = [];
		// agents.map(agent => {
		executors.map((_ex: any) => {
			let agent = GetGraphNode(GetNodeProp(_ex, NodeProperties.ExecutorAgent));
			let model = GetGraphNode(GetNodeProp(_ex, NodeProperties.ExecutorModel));
			let model_output = GetGraphNode(GetNodeProp(_ex, NodeProperties.ExecutorModelOutput));

			if (GetNodeProp(_ex, NodeProperties.ExecutorFunctionType)) {
				methods_interface.push(
					bindTemplate(
						`
                Task {{method}}({{model}}ChangeBy{{agent_type}} change);
`,
						{
							method: GetNodeProp(_ex, NodeProperties.ExecutorFunctionType),
							model: GetCodeName(model),
							agent_type: GetCodeName(agent)
						}
					)
				);
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

		return result.unique().join('');
	}
	static GenerateStrappers(models: any[], agent: { id: any }) {
		let result = [];
		var sortedValidations = GetValidationsSortedByAgent();
		if (sortedValidations && agent && sortedValidations[agent.id]) {
			result.push(
				Tabs(4) +
					bindTemplate(`validator = RedStrapper.Resolve<I{{agent}}Validations>();`, {
						agent: GetCodeName(agent)
					}) +
					jNL
			);
		}
		var agents = [ agent ]; // models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
		models.map((model: any) => {
			let modelName = GetNodeProp(model, NodeProperties.CodeName);
			result.push(
				Tabs(4) + `${modelName.toLowerCase()}Arbiter = RedStrapper.Resolve<IRedArbiter<${modelName}>>();` + jNL
			);
			agents.map((agent) => {
				var agentName = GetCodeName(agent);
				result.push(
					Tabs(4) +
						`${modelName.toLowerCase()}ChangeBy${agentName}Arbiter = RedStrapper.Resolve<IRedArbiter<${modelName}ChangeBy${agentName}>>();` +
						jNL
				);
			});
			if (GetNodeProp(model, NodeProperties.IsAgent)) {
				result.push(
					Tabs(4) +
						`${modelName.toLowerCase()}ResponseArbiter = RedStrapper.Resolve<IRedArbiter<${modelName}Response>>();` +
						jNL
				);

				if (AgentHasExecutor(agent)) {
					result.push(
						Tabs(4) +
							`${modelName.toLowerCase()}Executor = RedStrapper.Resolve<I${modelName}Executor>();` +
							jNL
					);
				}
			}
		});

		return result.unique().join('');
	}
	static GenerateStrappersInstances(models: any[], agent: { id: any }) {
		let result = [];

		var sortedValidations = GetValidationsSortedByAgent();
		if (sortedValidations && agent && sortedValidations[agent.id]) {
			result.push(
				Tabs(3) + bindTemplate(`public I{{agent}}Validations validator;`, { agent: GetCodeName(agent) }) + jNL
			);
		}
		var agents = [ agent ]; // models.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
		models.map((model: any) => {
			let modelName = GetNodeProp(model, NodeProperties.CodeName);
			result.push(Tabs(3) + `public IRedArbiter<${modelName}> ${modelName.toLowerCase()}Arbiter;` + jNL);
			agents.map((agent) => {
				var agentName = GetCodeName(agent);
				result.push(
					Tabs(3) +
						`public IRedArbiter<${modelName}ChangeBy${agentName}> ${modelName.toLowerCase()}ChangeBy${agentName}Arbiter;` +
						jNL
				);
			});

			if (GetNodeProp(model, NodeProperties.IsAgent)) {
				result.push(
					Tabs(3) +
						`public IRedArbiter<${modelName}Response> ${modelName.toLowerCase()}ResponseArbiter;` +
						jNL
				);
				let state = GetState();
				let graphRoot = GetCurrentGraph();

				if (AgentHasExecutor(agent)) {
					result.push(Tabs(3) + `public I${modelName}Executor ${modelName.toLowerCase()}Executor;` + jNL);
				}
			}
		});

		return result.unique().join('');
	}
	static GenerateStreamOrchestrations(models: any[]) {
		let result: string[] = [];
		var agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		agents.map((model: any) => {
			let modelName = GetNodeProp(model, NodeProperties.CodeName);
			result.push(
				Tabs(4) +
					`${modelName.toLowerCase()}StreamProcessOrchestration = RedStrapper.Resolve<I${modelName}StreamProcessOrchestration>();` +
					jNL
			);
		});

		return result.join('');
	}
	static GenerateStreamOrchestrationInstances(models: any[]) {
		let result: any[] = [];

		const StreamProcessOrchestration = 'StreamProcessOrchestration';
		var agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		agents.map((model: any) => {
			let modelName = GetNodeProp(model, NodeProperties.CodeName);
			result.push(
				`public I${modelName}${StreamProcessOrchestration} ${modelName.toLowerCase()}StreamProcessOrchestration;`
			);
		});
		return result.unique().map((v: string) => Tabs(3) + v + jNL).join('');
	}
	static GenerateProcessTests(state: any) {
		let graph = GetRootGraph(state);
		let functions = NodesByType(state, NodeTypes.Method).filter(
			(x: any) => ![ Methods.Get, Methods.GetAll ].some((t) => t === GetNodeProp(x, NodeProperties.MethodType))
		);
		let res = '';
		// STREAM_METHOD_TESTS
		let _stramMethodTests = fs_readFileSync(STREAM_METHOD_TESTS, 'utf8');
		let _createModelTests = fs_readFileSync(CREATE_MODEL_TESTS, 'utf8');
		let agent_process_orchestration_mocks = `           builder.RegisterType<{{agent_type}}StreamProcessOrchestration>().As<I{{agent_type}}StreamProcessOrchestration>();
`;
		let agent_process_orc_mocks = NodesByType(state, NodeTypes.Model)
			.filter((x: string | any) => {
				var isAgent = IsAgent(x);
				return isAgent;
			})
			.map((t: any) =>
				bindTemplate(agent_process_orchestration_mocks, {
					agent_type: GetCodeName(t)
				})
			)
			.join('');
		res = functions
			.map((func: any, index: any) => {
				let methodProps = GetNodeProp(func, NodeProperties.MethodProps);
				let method = GetNodeProp(func, NodeProperties.MethodType);
				//      let cases = null;
				if (methodProps) {
					var agentTypeNode: any = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.AgentType]);
					var modelNode: any = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Model]);
					var userTypeNode: any = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.User]);
					var permissionNode: any = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Permission]);
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
			})
			.filter((x: any) => x)
			.join(NEW_LINE);
		let func_Cases: any[] = [];
		functions
			.map((func: any, index: any) => {
				let methodProps = GetNodeProp(func, NodeProperties.MethodProps);
				let method = GetNodeProp(func, NodeProperties.MethodType);
				let cases = null;
				if (methodProps) {
					var agentTypeNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.AgentType]);
					var modelNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Model]);
					var permissionNode = GraphMethods.GetNode(graph, methodProps[FunctionTemplateKeys.Permission]);
					if (graph && permissionNode && method && agentTypeNode && modelNode) {
						let validators = StreamProcessOrchestrationGenerator.GetFunctionValidators(state, func);
						let validatorCases: any = null;
						if (validators && validators.length) {
							validatorCases = validators.map((validator: any) => {
								return {
									cases: ValidationRuleGenerator.GenerateValidationCases(graph, validator),
									isModel:
										GetNodeProp(validator, NodeProperties.ValidatorModel) ===
										methodProps[FunctionTemplateKeys.Model]
								};
							});
						}
						if (validatorCases)
							enumerate(
								validatorCases.map((x: { cases: string | any[] }) => x.cases.length)
							).map((_enum, caseindex) => {
								let v1 = validatorCases[0].cases[_enum[0]];
								let v2 = validatorCases[1].cases[_enum[1]];
								let agent_properties = '';
								let model_properties = '';
								if (!validatorCases[1].isModel) {
									agent_properties = bindTemplate(v2.set_properties, { model: 'agent' });
									model_properties = bindTemplate(v1.set_properties, { model: 'model' });
								} else {
									agent_properties = bindTemplate(v2.set_properties, { model: 'model' });
									model_properties = bindTemplate(v1.set_properties, { model: 'agent' });
								}
								// cases.map((_case, caseindex) => {
								func_Cases.push(
									bindTemplate(_createModelTests, {
										model: GetNodeProp(modelNode, NodeProperties.CodeName),
										agent_type: GetNodeProp(agentTypeNode, NodeProperties.CodeName),
										set_agent_propeties: agent_properties,
										set_model_properties: model_properties,
										function_name: GetNodeProp(func, NodeProperties.CodeName),
										test_result: !(v1.resultSuccess && v2.resultSuccess),
										test_name: `${GetNodeProp(func, NodeProperties.CodeName)}${caseindex}Test`
									})
								);
							});
						//  });
					}
				}
			})
			.join(NEW_LINE);
		return res + NEW_LINE + func_Cases.unique().join(NEW_LINE);
	}
	static EnumerateFunctionValidators(state: any, func: any | null) {
		let graph = GetRootGraph(state);
		let methodProps = GetNodeProp(func, NodeProperties.MethodProps);
		let validators = StreamProcessOrchestrationGenerator.GetFunctionValidators(state, func);
		let validatorCases: any = null;
		if (validators && validators.length) {
			validatorCases = validators.map((validator: any) => {
				return {
					cases: ValidationRuleGenerator.GenerateValidationCases(graph, validator),
					isModel:
						GetNodeProp(validator, NodeProperties.ValidatorModel) ===
						methodProps[FunctionTemplateKeys.Model]
				};
			});
		}
		return enumerate((validatorCases || []).map((x: any) => x.cases.length)).map((_enum, caseindex) => {
			let v1 = validatorCases[0].cases[_enum[0]];
			let v2 = validatorCases[1].cases[_enum[1]];
			let agent_properties = '';
			let model_properties = '';
			if (!validatorCases[1].isModel) {
				agent_properties = bindTemplate(v2.set_properties, { model: 'agent' });
				model_properties = bindTemplate(v1.set_properties, { model: 'model' });
				v2.propertyInformation.map(
					(t: { set_properties: any }) =>
						(t.set_properties = bindTemplate(t.set_properties, { model: 'agent' }))
				);
				v1.propertyInformation.map(
					(t: { set_properties: any }) =>
						(t.set_properties = bindTemplate(t.set_properties, { model: 'model' }))
				);
				return {
					agent: v2,
					model: v1
				};
			} else {
				agent_properties = bindTemplate(v2.set_properties, { model: 'model' });
				model_properties = bindTemplate(v1.set_properties, { model: 'agent' });
				v2.propertyInformation.map(
					(t: { set_properties: any }) =>
						(t.set_properties = bindTemplate(t.set_properties, { model: 'model' }))
				);
				v1.propertyInformation.map(
					(t: { set_properties: any }) =>
						(t.set_properties = bindTemplate(t.set_properties, { model: 'agent' }))
				);
				return {
					model: v2,
					agent: v1
				};
			}
		});
	}
	static GetFunctionValidators(state: any, funct: any) {
		return NodesByType(state, NodeTypes.Validator).filter(
			(x: any) => GetNodeProp(x, NodeProperties.ValidatorFunction) === funct.id
		);
	}
	static Generate(options: { state: any; key: any; language?: any }) {
		var { state, key } = options;
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		let _streamProcessTemplate = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_ROOT_TEMPLATE, 'utf8');
		let _testClass = fs_readFileSync(TEST_CLASS, 'utf8');
		let _streamProcessInterfaceTemplate = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE, 'utf8');
		const StreamProcessOrchestration = 'StreamProcessOrchestration';
		let models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
		let agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		let result: any = {};
		let usings = [ ...STANDARD_CONTROLLER_USING ];
		agents.map((agent: any) => {
			var temp = StreamProcessOrchestrationGenerator.GenerateAgent({ state, key, agent });
			result = { ...result, ...temp };
		});

		let after_methods = StreamProcessOrchestrationGenerator.GenerateAfterEffectsMethods(state, agents);
		result['After Effects Ex'] = {
			id: 'after effects ex',
			name: `AfterEffects`,
			template: NamespaceGenerator.Generate({
				template: after_methods,
				usings: [
					...usings,
					'System.Linq.Expressions',
					`${namespace}${NameSpace.Model}`,
					`${namespace}${NameSpace.Parameters}`,
					`${namespace}${NameSpace.Interface}`,
					`${namespace}${NameSpace.Constants}`,
					`${namespace}${NameSpace.Controllers}`,
					`${namespace}${NameSpace.Parameters}`
				],
				namespace,
				space: NameSpace.Controllers
			})
		};
		let strappers = StreamProcessOrchestrationGenerator.GenerateStreamOrchestrations(models);
		let strapperInstances = StreamProcessOrchestrationGenerator.GenerateStreamOrchestrationInstances(models);

		_streamProcessTemplate = bindTemplate(_streamProcessTemplate, {
			agent_type_methods: `

        public async Task<IList<DistributionReport>> ProcessStagedChanges(Distribution distribution = null)
        {
			var result = new List<DistributionReport>();
${agents
				.map((agent: any) => {
					return `var reports${GetCodeName(
						agent
					).toLowerCase()} = await ${GetCodeName(
						agent
					).toLowerCase()}StreamProcessOrchestration.ProcessStagedChanges(distribution);
					result.AddRange(reports${GetCodeName(
						agent
					).toLowerCase()});`;
				})
				.map((v: string) => Tabs(4) + v + jNL)
				.join('')}
			return result;
        }
        `,
			arbiters_strappers: strappers,
			arbiter_instances: strapperInstances
		});
		let stream_process_tests = StreamProcessOrchestrationGenerator.GenerateProcessTests(state);
		let testTemplate = bindTemplate(_testClass, {
			name: StreamProcessOrchestration,
			tests: stream_process_tests
		});
		_streamProcessInterfaceTemplate = bindTemplate(_streamProcessInterfaceTemplate, {
			agent_type_methods: '',
			agent_type: ''
		});

		if (
			agents.find((agent: { id: any }) =>
				NodesByType(state, NodeTypes.Executor).find((x: { id: any }) =>
					GraphMethods.existsLinkBetween(graphRoot, {
						source: x.id,
						target: agent.id
					})
				)
			)
		) {
			usings = [ ...usings, `${namespace}${NameSpace.Executors}` ];
		}
		let streamOrchestration = {
			[StreamProcessOrchestration]: {
				id: StreamProcessOrchestration,
				name: StreamProcessOrchestration,
				iname: `I${StreamProcessOrchestration}`,
				//  tname: `${StreamProcessOrchestration}Tests`,
				template: NamespaceGenerator.Generate({
					template: _streamProcessTemplate,
					usings: [
						...usings,
						'System.Linq.Expressions',
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Parameters}`,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.Constants}`
					],
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
						`${namespace}${NameSpace.Constants}`
					],
					namespace,
					space: NameSpace.StreamProcess
				})
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
	static GenerateAgent(options: any) {
		var { state, key, agent } = options;
		const StreamProcessOrchestration = 'StreamProcessOrchestration';
		let models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
		let _streamProcessTemplate = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE, 'utf8');
		let _streamProcessInterfaceTemplate = fs_readFileSync(STREAM_PROCESS_ORCHESTRATION_TEMPLATE_INTERFACE, 'utf8');
		let _testClass = fs_readFileSync(TEST_CLASS, 'utf8');
		let agent_methods = StreamProcessOrchestrationGenerator.GenerateAgentMethods(state, agent);
		let agent_methods_interface = StreamProcessOrchestrationGenerator.GenerateAgentInterfaceMethods(state, agent);
		let statics = StreamProcessOrchestrationGenerator.GenerateStaticMethods(models);
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
		let stream_process_tests = StreamProcessOrchestrationGenerator.GenerateProcessTests(state);
		let testTemplate: any = bindTemplate(_testClass, {
			name: `${GetCodeName(agent)}${StreamProcessOrchestration}`,
			agent_type: GetCodeName(agent),
			tests: stream_process_tests
		});
		_streamProcessInterfaceTemplate = bindTemplate(_streamProcessInterfaceTemplate, {
			agent_type: GetCodeName(agent),
			agent_type_methods: agent_methods_interface
		});
		let usings = [ ...STANDARD_CONTROLLER_USING ];

		if (
			NodesByType(state, NodeTypes.Executor).find((x: { id: any }) =>
				GraphMethods.existsLinkBetween(graphRoot, {
					source: x.id,
					target: agent.id
				})
			)
		) {
			usings = [ ...usings, `${namespace}${NameSpace.Executors}` ];
		}
		return {
			[`${GetCodeName(agent) + StreamProcessOrchestration}`]: {
				id: StreamProcessOrchestration,
				name: `${GetCodeName(agent)}${StreamProcessOrchestration}`,
				iname: `I${GetCodeName(agent)}${StreamProcessOrchestration}`,
				// tname: `${GetCodeName(agent)}${StreamProcessOrchestration}Tests`,
				template: NamespaceGenerator.Generate({
					template: _streamProcessTemplate,
					usings: [
						...usings,
						'System.Linq.Expressions',
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Parameters}`,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.Constants}`,
						`${namespace}${NameSpace.Controllers}`
					],
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
						`${namespace}${NameSpace.Constants}`
					],
					namespace,
					space: NameSpace.StreamProcess
				})
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
`;
const jNL = `
`;
const TAB = `   `;

function Tabs(c: number) {
	let res = '';
	for (var i = 0; i < c; i++) {
		res += TAB;
	}
	return res;
}
