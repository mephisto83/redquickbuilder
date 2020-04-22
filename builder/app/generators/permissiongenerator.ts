import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	NodeTypes,
	NodesByType,
	GetRootGraph,
	GetCurrentGraph,
	GetLinkProperty,
	GetCodeName,
	GetMethodPropNode,
	GetLinkChainItem,
	GetPermissionMethod,
	GetFunctionType,
	GetMethodNodeProp,
	GetNodeCode,
	GetC
} from '../actions/uiactions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	Methods,
	MakeConstant,
	CreateStringList,
	STANDARD_CONTROLLER_USING,
	NEW_LINE,
	STANDARD_TEST_USING
} from '../constants/nodetypes';
import fs from 'fs';
import {
	bindTemplate,
	ConditionTypes,
	ConditionTypeParameters,
	ConditionCases,
	FunctionTemplateKeys,
	FunctionTypes,
	INTERNAL_TEMPLATE_REQUIREMENTS
} from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import ExtensionGenerator from './extensiongenerator';
import { enumerate } from '../utils/utils';

const TEST_CASE = './app/templates/permissions/tests/test_case.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const TEST_CASE_PROPERTY = './app/templates/permissions/tests/test_case_property.tpl';
const PERMISSIONS_INTERFACE = './app/templates/permissions/permissions_interface.tpl';
const PERMISSIONS_CASE_EXTENSION = './app/templates/permissions/permissions_case.tpl';
const PERMISSIONS_CASE_ENUMERATION = './app/templates/permissions/permissions_case_enumeration.tpl';
const PERMISSIONS_CASE_INCLUDED_IN_LIST = './app/templates/permissions/permissions_case_included_in_list.tpl';
const PERMISSIONS_METHODS = './app/templates/permissions/permissions_method.tpl';
const PERMISSIONS_ARBITER_PROP = './app/templates/permissions/permissions_arbiter_prop.tpl';
const PERMISSIONS_IMPL = './app/templates/permissions/permissions_impl.tpl';
const PERMISSIONS_INTERFACE_METHODS = './app/templates/permissions/permissions_interface_methods.tpl';
const MATCH_TO_MANY_REFERENCE_PARAMETER = './app/templates/permissions/match-many-reference-parameter.tpl';
const MANY_TO_MANY_CONSTRUCTOR = './app/templates/permissions/tests/many_to_many_constructor.tpl';
const MATCH_REFERENCE = './app/templates/permissions/match-reference.tpl';

const PROPERTY_TABS = 6;
export default class PermissionGenerator {
	static PermissionMatches(permission: GraphMethods.Node | null, agent: { id: any }, model: { id: any }) {
		var methodNode = GetPermissionMethod(permission);
		if (methodNode) {
			let function_type = GetFunctionType(methodNode);
			switch (function_type) {
				//Add more cases as required.
				case FunctionTypes.Get_Parent$Child_Agent_Value__IListChild:
				case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
					var result =
						GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent) === agent.id &&
						GetMethodNodeProp(methodNode, FunctionTemplateKeys.Parent) === model.id;
					return result;
				default:
					var result =
						GetMethodNodeProp(methodNode, FunctionTemplateKeys.Agent) === agent.id &&
						(GetMethodNodeProp(methodNode, FunctionTemplateKeys.Model) === model.id ||
							GetMethodNodeProp(methodNode, FunctionTemplateKeys.CompositeInput) === model.id);
					return result;
			}
		}

		return false;
	}
	static createInstanceEnumerationListName(
		dNode: GraphMethods.Node | null,
		enu: GraphMethods.Node | null,
		method: any,
		type = 'Enums'
	) {
		return `list${type}${GetNodeProp(dNode, NodeProperties.CodeName) || dNode}${GetNodeProp(
			enu,
			NodeProperties.CodeName
		) || enu}${method}`;
	}

	static _createConstantList(name: any, constants: any[]) {
		let result = constants.map((ea: any) => {
			return `${name}.${MakeConstant(ea)}`;
		});
		return result;
	}
	//Deprecated
	static _createEnumerationInstanceList(dpNode: any, enumerationNode: any, method: any) {
		var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedEnumValues) || [];
		let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
		let constants_allowed = ext_allowed.map((ea: any) => {
			return `${enumerationName}.${MakeConstant(ea)}`;
		});
		return constants_allowed;
	}
	static _getNotAllowedConstances(dpNode: any, enumerationNode: any, method: any) {
		var ext_disallowed = GetNodeProp(dpNode, NodeProperties.DisallowedEnumValues) || [];
		let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
		let constants_notallowed = ext_disallowed.map((ea: any) => {
			return `${enumerationName}.${MakeConstant(ea)}`;
		});
		return constants_notallowed;
	}
	static createEnumerationInstanceList(
		dpNode: GraphMethods.Node | null,
		enumerationNode: GraphMethods.Node | null,
		method: any
	) {
		let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, enumerationNode, method);
		let constants_allowed = PermissionGenerator._createEnumerationInstanceList(dpNode, enumerationNode, method);
		// var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedEnumValues) || [];
		// let enumerationName = GetNodeProp(enumerationNode, NodeProperties.CodeName);
		// let constants_allowed = ext_allowed.map(ea => {
		//     return `${enumerationName}.${MakeConstant(ea)}`
		// })
		return `var ${name} = new List<string> { ${constants_allowed
			.map((t: string) => jNL + Tabs(5) + t)
			.join()} ${jNL + Tabs(5)}};${jNL}`;
	}
	static createStringList(options: { name: any; constants_allowed: any; enumerationName: any }) {
		var { name, constants_allowed, enumerationName } = options;
		constants_allowed = constants_allowed.map((ea: any) => {
			return `${enumerationName}.${MakeConstant(ea)}`;
		});

		return `var ${name} = new List<string> { ${constants_allowed
			.map((t: string) => jNL + Tabs(5) + t)
			.join()} ${jNL + Tabs(5)}};${jNL}`;
	}
	static _createExtensionInstanceList(
		dpNode: GraphMethods.Node | null,
		extensionNode: any,
		method: any,
		type = 'Enums'
	) {
		var ext_allowed = GetNodeProp(dpNode, NodeProperties.AllowedExtensionValues) || [];
		let extensionName = GetNodeProp(extensionNode, NodeProperties.CodeName);

		let constants_allowed = ext_allowed.map((ea: any) => {
			return `${extensionName}.${MakeConstant(ea)}`;
		});

		return constants_allowed;
	}
	static _getNotAllowedExtectionConstances(
		dpNode: GraphMethods.Node | null,
		extensionNode: any,
		method: any,
		type = 'Enums'
	) {
		var ext_disallowed = GetNodeProp(dpNode, NodeProperties.DisallowedExtensionValues) || [];
		let extensionName = GetNodeProp(extensionNode, NodeProperties.CodeName);

		let constants_disallowed = ext_disallowed.map((ea: any) => {
			return `${extensionName}.${MakeConstant(ea)}`;
		});

		return constants_disallowed;
	}
	static createExtensionInstanceList(
		dpNode: GraphMethods.Node | null,
		extensionNode: GraphMethods.Node | null,
		method: any,
		type = 'Enums'
	) {
		let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, extensionNode, method, 'Extensions');

		let constants_allowed = PermissionGenerator._createExtensionInstanceList(dpNode, extensionNode, method, type);

		return `var ${name} = new List<string> { ${constants_allowed
			.map((t: string) => jNL + Tabs(5) + t)
			.join()} ${jNL + Tabs(5)}};${jNL}`;
	}
	static IsRequestor(graph: GraphMethods.Graph, model: { id: string }, permission: { id: any }) {
		var requestorNodes = GraphMethods.getNodesByLinkType(graph, {
			id: permission.id,
			type: LinkType.RequestorPermissionLink
		});
		return !!requestorNodes.find((node: any) => {
			return node.id === model.id;
		});
	}
	static GetExtensionNodeValues(
		graph: GraphMethods.Graph,
		permission: { id: any },
		method: any,
		agent: { id: any },
		model: any
	) {
		const value_string = 'value';
		var dependingPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
			id: permission.id,
			type: LinkType.PermissionPropertyDependency
		});
		let listOfCases: { variable: string; template: any }[] = [];
		dependingPermissionNodes.map((dpNode: any) => {
			let propertyNodeLinkedToByDependencyPermissionNodes = GraphMethods.getNodesByLinkType(graph, {
				id: dpNode.id,
				type: LinkType.PermissionPropertyDependency
			});

			let propertyNodeLinkedToByDependencyPermissionNode = propertyNodeLinkedToByDependencyPermissionNodes[0];
			if (!propertyNodeLinkedToByDependencyPermissionNode) {
				return;
			}
			let propertyNodes = GraphMethods.getNodesByLinkType(graph, {
				id: propertyNodeLinkedToByDependencyPermissionNode.id,
				type: LinkType.PermissionDependencyProperty
			});
			let propertyNode: any = null;
			if (propertyNodes.length === 1) {
				propertyNode = propertyNodes[0];
			} else {
				return;
			}
			var agentLinkExists = GraphMethods.existsLinkBetween(graph, {
				target: propertyNode.id,
				source: agent.id,
				type: LinkType.PropertyLink
			});
			let enumerationNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.Enumeration));
			let extentionNode = GraphMethods.GetNode(graph, GetNodeProp(dpNode, NodeProperties.UIExtension));
			let useEnumeration = GetNodeProp(dpNode, NodeProperties.UseEnumeration);
			let useExtension = GetNodeProp(dpNode, NodeProperties.UseExtension);
			let useIncludedInList = GetNodeProp(dpNode, NodeProperties.IncludedInList);

			if (useIncludedInList) {
				let permissionCaseIncludedInList = fs.readFileSync(PERMISSIONS_CASE_INCLUDED_IN_LIST, 'utf8');
				var tempBindingValues: any = {
					method,
					// It currently happens to be that this is correct, but maybe in the future this needs to be more general.
					parent: `${GetNodeProp(agent, NodeProperties.AgentName) || 'agent'}`.toLowerCase(),
					parent_property: 'Id',
					///////////////////////////////////////////////////////////////////////////////////////////////////////////
					value: `${agentLinkExists ? 'value' : 'data'}`.toLowerCase(),
					value_property: GetNodeProp(
						propertyNodeLinkedToByDependencyPermissionNode,
						NodeProperties.CodeName
					),
					model: 'data',
					casename: GetNodeProp(dpNode, NodeProperties.CodeName),
					extension: GetNodeProp(extentionNode, NodeProperties.CodeName),
					instance_list: ''
				};
				let temp = bindTemplate(permissionCaseIncludedInList, tempBindingValues);

				listOfCases.push({
					variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
					template: temp
				});
			}
			if (useEnumeration) {
				let permissionCaseEnumerationTemplate = fs.readFileSync(PERMISSIONS_CASE_ENUMERATION, 'utf8');
				let enumInstance = PermissionGenerator.createEnumerationInstanceList(dpNode, enumerationNode, method);
				let name = PermissionGenerator.createInstanceEnumerationListName(dpNode, enumerationNode, method);
				var tempBindingValues: any = {
					method,
					value: `${agentLinkExists ? 'value' : 'data'}`.toLowerCase(),
					value_property: GetNodeProp(
						propertyNodeLinkedToByDependencyPermissionNode,
						NodeProperties.CodeName
					),
					model: GetNodeProp(model, NodeProperties.CodeName),
					casename: GetNodeProp(dpNode, NodeProperties.CodeName),
					'allowed-values-list': name,
					extension: GetNodeProp(extentionNode, NodeProperties.CodeName),
					instance_list: enumInstance
				};
				let temp = bindTemplate(permissionCaseEnumerationTemplate, tempBindingValues);

				listOfCases.push({
					variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
					template: temp
				});
			}

			if (useExtension) {
				let definition = GetNodeProp(extentionNode, NodeProperties.UIExtensionDefinition);
				let permissionCaseExtensionTemplate = fs.readFileSync(PERMISSIONS_CASE_EXTENSION, 'utf8');
				let extensionInstance = PermissionGenerator.createExtensionInstanceList(dpNode, extentionNode, method);
				let name = PermissionGenerator.createInstanceEnumerationListName(
					dpNode,
					extentionNode,
					method,
					'Extensions'
				);
				let tempBindingValues = {
					method,
					value: `value`,
					value_property: GetNodeProp(
						propertyNodeLinkedToByDependencyPermissionNode,
						NodeProperties.CodeName
					),
					model: 'data',
					casename: GetNodeProp(dpNode, NodeProperties.CodeName),
					extension_propery_key: definition && definition.config ? definition.config.keyField : null,
					extension_value_property: 'Value',
					'allowed-values-list': name,
					extension: GetNodeProp(extentionNode, NodeProperties.CodeName),
					instance_list: extensionInstance
				};
				let temp = bindTemplate(permissionCaseExtensionTemplate, tempBindingValues);

				listOfCases.push({
					variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
					template: temp
				});
			}
		});

		return listOfCases;
	}
	static IsAppliedPermission(graph: GraphMethods.Graph, permission: { id: any }, propertyNode: { id: any }) {
		let appliedPermissionLinks: any = GraphMethods.getNodesByLinkType(graph, {
			id: permission.id,
			type: LinkType.AppliedPermissionLink
		});
		//
		if (appliedPermissionLinks && appliedPermissionLinks.length) {
			var link = GraphMethods.GetLinkByNodes(graph, {
				source: appliedPermissionLinks[0].id,
				target: propertyNode.id
			});
			if (link) {
				return true;
			}
		}
		return false;
	}
	static GetTestExtensionNodeValues(
		graph: GraphMethods.Graph,
		permission: { id: any },
		method: any,
		agent: any,
		model: any
	) {
		return [];
		// const value_string: any = 'value';
		// var conditionNodes = GraphMethods.getNodesByLinkType(graph, {
		// 	id: permission.id,
		// 	type: LinkType.Condition
		// });
		// let listOfCases: any = [];
		// conditionNodes.map((conditionNode) => {
		// 	// let isAppliedPermission = PermissionGenerator.IsAppliedPermission(graph, permission, propertyNode);
		// 	// let enumerationNode = GraphMethods.GetNode(graph, GetNodeProp(conditionNode, NodeProperties.Enumeration));
		// 	let extentionNode: any = GraphMethods.GetNode(
		// 		graph,
		// 		GetNodeProp(conditionNode, NodeProperties.UIExtension)
		// 	);
		// 	let conditionType = GetNodeProp(conditionNode, NodeProperties.ConditionType);
		// 	switch (conditionType) {
		// 		case ConditionTypes.MatchReference:
		// 			var mmrp = GetNodeProp(conditionNode, NodeProperties.MatchReference);
		// 			listOfCases.push({
		// 				type: conditionType,
		// 				values: [ ConditionCases[ConditionTypes.MatchReference].$matching ],
		// 				neg: [ ConditionCases[ConditionTypes.MatchReference].notmatching ],
		// 				options: { ...mmrp }
		// 			});

		// 			break;
		// 		case ConditionTypes.MatchManyReferenceParameter:
		// 			var mmrp = GetNodeProp(conditionNode, NodeProperties.MatchManyReferenceParameter);
		// 			listOfCases.push({
		// 				type: conditionType,
		// 				values: [ ConditionCases[ConditionTypes.MatchManyReferenceParameter].$matching ],
		// 				neg: [ ConditionCases[ConditionTypes.MatchManyReferenceParameter].notmatching ],
		// 				options: { ...mmrp }
		// 			});

		// 			break;
		// 		case ConditionTypes.InEnumerable:
		// 			var enumRef = GetNodeProp(conditionNode, NodeProperties.EnumerationReference);
		// 			var enumerationNodeName = PermissionGenerator.getReferencedNodeName(
		// 				graph,
		// 				enumRef,
		// 				NodeProperties.Enumeration
		// 			);
		// 			var constList = PermissionGenerator.getReference(enumRef, NodeProperties.AllowedEnumValues);
		// 			var disAllowedConstList = PermissionGenerator.getReference(
		// 				enumRef,
		// 				NodeProperties.DisallowedEnumValues
		// 			);
		// 			let enumInstance = PermissionGenerator._createConstantList(enumerationNodeName, constList);
		// 			let enumNotAllowed = PermissionGenerator._createConstantList(
		// 				enumerationNodeName,
		// 				disAllowedConstList
		// 			);
		// 			let nameEnum = PermissionGenerator.createInstanceEnumerationListName(
		// 				conditionNode,
		// 				enumerationNodeName,
		// 				method
		// 			);
		// 			let propertyEnum = PermissionGenerator.getReferencedNodeName(
		// 				graph,
		// 				enumRef,
		// 				ConditionTypeParameters.Ref1Property
		// 			);

		// 			listOfCases.push({
		// 				type: conditionType,
		// 				name: nameEnum,
		// 				ref: enumRef[ConditionTypeParameters.Ref1],
		// 				property: propertyEnum,
		// 				values: enumInstance,
		// 				neg: enumNotAllowed,
		// 				options: { ...enumRef }
		// 			});

		// 			break;
		// 		case ConditionTypes.InExtension:
		// 			let definition = GetNodeProp(conditionNode, NodeProperties.UIExtensionDefinition);
		// 			let extensionInstance = PermissionGenerator._createExtensionInstanceList(
		// 				conditionNode,
		// 				extentionNode,
		// 				method
		// 			);
		// 			let extensionsNotAllowed = PermissionGenerator._getNotAllowedExtectionConstances(
		// 				conditionNode,
		// 				extentionNode,
		// 				method
		// 			);
		// 			let nameExt = PermissionGenerator.createInstanceEnumerationListName(
		// 				conditionNode,
		// 				extentionNode,
		// 				method,
		// 				'Extensions'
		// 			);
		// 			let propertyExt = GetNodeProp(
		// 				propertyNodeLinkedToByDependencyPermissionNode,
		// 				NodeProperties.CodeName
		// 			);
		// 			// definition && definition.config ? definition.config.keyField : null;

		// 			listOfCases.push({
		// 				type: conditionType,
		// 				name: nameExt,
		// 				property: propertyExt,
		// 				values: extensionInstance,
		// 				neg: extensionsNotAllowed,
		// 				options: { ...definition }
		// 			});
		// 			break;
		// 		default:
		// 			throw 'not handled [permissiongenerator]';
		// 	}
		// });

		// return listOfCases;
	}
	static getReferencedNodeName(graph: any, enumRef: any, type: string) {
		return GetNodeProp(PermissionGenerator.getReferencedValue(graph, enumRef, type), NodeProperties.CodeName);
	}
	static getReferencedValue(graph: GraphMethods.Graph, enumRef: { [x: string]: string }, type: string | number) {
		return GraphMethods.GetNode(graph, enumRef[type]);
	}
	static getReference(enumRef: { [x: string]: any }, type: string) {
		return enumRef[type];
	}
	static GenerateCases(state: any, permission: { id: any }, agent: any, model: any) {
		var graph = GetCurrentGraph(state);
		let _manyToManyMatchCondition = fs.readFileSync(MATCH_TO_MANY_REFERENCE_PARAMETER, 'utf8');
		let _matchReferenceCondition = fs.readFileSync(MATCH_REFERENCE, 'utf8');
		let result: any = {};
		if (permission) {
			for (var method in Methods) {
				var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
				if (permissionsEnabledFor && permissionsEnabledFor[method]) {
					let cases: {
						template: any;
						options?: any;
						methodProps?: any;
						sameInstance?: boolean;
						variable: string;
						arbiter?: any;
					}[] = [];
					let conditions = GraphMethods.GetLinkChain(state, {
						id: permission.id,
						links: [
							{
								type: LinkType.Condition,
								direction: GraphMethods.SOURCE
							}
						]
					});
					if (conditions && conditions.length) {
						conditions.map((t: any, index: string) => {
							var variable = 'variable_' + index;
							switch (GetNodeProp(t, NodeProperties.ConditionType)) {
								case ConditionTypes.MatchReference:
									var mmrp = GetNodeProp(t, NodeProperties.MatchReference);
									if (mmrp) {
										var propNode = GraphMethods.GetNode(graph, mmrp[ConditionTypeParameters.Ref1]);
										var methods = GraphMethods.GetLinkChain(state, {
											id: permission.id,
											links: [
												{
													type: LinkType.Condition,
													direction: GraphMethods.TARGET
												},
												{
													type: LinkType.FunctionOperator,
													direction: GraphMethods.TARGET
												}
											]
										});
										let method = methods.find((x: any) => x);
										if (method) {
											let methodProps = GetNodeProp(method, NodeProperties.MethodProps);
											if (methodProps) {
												var ref1UseId = mmrp[ConditionTypeParameters.Ref1UseId]; // GraphMethods.GetNode(graph, methodProps[mmrp[ConditionTypeParameters.Ref1UseId]]);
												var ref2UseId = mmrp[ConditionTypeParameters.Ref2UseId]; // GraphMethods.GetNode(graph, methodProps[mmrp[ConditionTypeParameters.Ref2UseId]]);

												cases.push({
													template: bindTemplate(_matchReferenceCondition, {
														variable,
														value_property: ref1UseId
															? 'Id'
															: GetNodeCode(
																	graph,
																	mmrp[ConditionTypeParameters.Ref1Property]
																),
														data_property: ref2UseId
															? 'Id'
															: GetNodeCode(
																	graph,
																	mmrp[ConditionTypeParameters.Ref2Property]
																),
														relationship: GetNodeProp(
															relationship,
															NodeProperties.CodeName
														),
														property: GetNodeProp(propNode, NodeProperties.CodeName)
													}),
													options: mmrp,
													methodProps,
													sameInstance: !!(
														methodProps[mmrp[ConditionTypeParameters.Ref1]] &&
														methodProps[mmrp[ConditionTypeParameters.Ref2]]
													),
													variable
												});
											}
										}
									}
									break;
								case ConditionTypes.MatchManyReferenceParameter:
									var mmrp = GetNodeProp(t, NodeProperties.MatchManyReferenceParameter);
									if (mmrp) {
										var propNode = GraphMethods.GetNode(
											graph,
											mmrp[ConditionTypeParameters.RefManyToManyProperty]
										);
										var methods = GraphMethods.GetLinkChain(state, {
											id: permission.id,
											links: [
												{
													type: LinkType.Condition,
													direction: GraphMethods.TARGET
												},
												{
													type: LinkType.FunctionOperator,
													direction: GraphMethods.TARGET
												}
											]
										});
										let method = methods.find((x: any) => x);
										if (method) {
											let methodProps = GetNodeProp(method, NodeProperties.MethodProps);
											if (methodProps) {
												let parms = [
													ConditionTypeParameters.Ref1,
													ConditionTypeParameters.Ref2
												];
												var relationship: any = GraphMethods.GetNode(
													graph,
													methodProps[mmrp[ConditionTypeParameters.RefManyToMany]]
												);
												let use_parent = parms.find(
													(p) =>
														mmrp[p] === INTERNAL_TEMPLATE_REQUIREMENTS.PARENT &&
														methodProps.model &&
														methodProps.model !== methodProps.parent
												);
												cases.push({
													arbiter: GetNodeProp(relationship, NodeProperties.CodeName),
													template: bindTemplate(_manyToManyMatchCondition, {
														variable,
														data: use_parent
															? INTERNAL_TEMPLATE_REQUIREMENTS.PARENT
															: 'data',
														relationship: GetNodeProp(
															relationship,
															NodeProperties.CodeName
														),
														property: GetNodeProp(propNode, NodeProperties.CodeName)
													}),
													methodProps,
													options: mmrp,
													variable
												});
											}
										}
									}
									break;
								case ConditionTypes.InEnumerable:
									var ine = GetNodeProp(t, NodeProperties.EnumerationReference);
									if (ine) {
										let ref1 = ine[ConditionTypeParameters.Ref1];

										let enumerationNode = GraphMethods.GetNode(
											graph,
											ine[NodeProperties.Enumeration]
										);
										if (enumerationNode) {
											let casename =
												GetNodeProp(t, NodeProperties.CodeName) ||
												GetNodeProp(t, NodeProperties.NODEType);
											let name = `${casename}_valid_items`;
											let permissionCaseEnumerationTemplate = fs.readFileSync(
												PERMISSIONS_CASE_ENUMERATION,
												'utf8'
											);
											let enumInstance = PermissionGenerator.createStringList({
												name,
												constants_allowed: ine[NodeProperties.AllowedEnumValues],
												enumerationName: GetNodeProp(enumerationNode, NodeProperties.CodeName)
											});
											let propertyNodeLinkedToByDependencyPermissionNode = GraphMethods.GetNode(
												graph,
												ine[ConditionTypeParameters.Ref1Property]
											);
											var tempBindingValues = {
												method,
												value: `${ref1 !== 'model' ? 'value' : 'data'}`.toLowerCase(),
												value_property: GetNodeProp(
													propertyNodeLinkedToByDependencyPermissionNode,
													NodeProperties.CodeName
												),
												model:
													GetNodeProp(model, NodeProperties.CodeName) ||
													GetNodeProp(model, NodeProperties.NODEType),
												casename,
												'allowed-values-list': name,
												instance_list: enumInstance
											};
											let temp = bindTemplate(
												permissionCaseEnumerationTemplate,
												tempBindingValues
											);

											cases.push({
												variable: `can${tempBindingValues.method}${tempBindingValues.model}${tempBindingValues.casename}`,
												template: temp
											});
										}
									}
									break;
							}
						});
					}
					result[method] = cases;
				}
			}
		}
		return result;
	}

	static EnumerateCases(cases: any[]) {
		let vects = cases.map((x: { values: string | any[]; neg: string | any[] }) => {
			return (x && x.values ? x.values.length : 0) + (x && x.neg ? x.neg.length : 0);
		});
		return enumerate(vects);
	}
	static EnumeratePermissionCases(
		graph: GraphMethods.Graph,
		permission: GraphMethods.Node | null,
		method: string,
		agent: GraphMethods.Node | null,
		model: GraphMethods.Node | null
	) {
		if (!permission || !method || !agent || !model) {
			return [];
		}

		let cases = PermissionGenerator.GetTestExtensionNodeValues(graph, permission, method, agent, model);
		let enums = PermissionGenerator.EnumerateCases(cases);
		let testCaseProperty = fs.readFileSync(TEST_CASE_PROPERTY, 'utf8');
		let methodNode = GetLinkChainItem({
			id: permission.id,
			links: [
				{
					type: LinkType.FunctionOperator,
					direction: GraphMethods.TARGET
				}
			]
		});

		let methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps);

		let res = enums.map((_enum) => {
			let props: { props: any; type: any; setup_cases?: string[]; sameInstance?: boolean }[] = [];
			let properties: {
				property?: string;
				value?: string;
				props?:
					| { property: string; value: string }
					| { property: any; value: any }
					| { property: any; value: any };
				type?: any;
			}[] = [];
			let setup_cases: any[] = [];
			let ispositive = true;
			_enum.map((which, index) => {
				let _case: any = cases[index];
				ispositive = ispositive && _case.values.length > which;
				let is_model_parameter: any;
				switch (_case.type) {
					case ConditionTypes.MatchManyReferenceParameter:
						if (
							_case.options &&
							_case.options[ConditionTypeParameters.Ref1] &&
							_case.options[ConditionTypeParameters.Ref2] &&
							methodProps &&
							methodProps[_case.options[ConditionTypeParameters.Ref1]] &&
							methodProps[_case.options[ConditionTypeParameters.Ref2]] &&
							_case.options[ConditionTypeParameters.Ref1] !== _case.options[ConditionTypeParameters.Ref2]
						) {
							let ref2Model = _case.options[ConditionTypeParameters.Ref2];
							switch (_case.options[ConditionTypeParameters.Ref2]) {
								case FunctionTemplateKeys.AgentType:
									throw 'this should be agent now';
							}
							if (ref2Model) {
								let ref1Property = 'Id';
								if (!_case.options[ConditionTypeParameters.Ref1UseId]) {
									ref1Property = _case.options[ConditionTypeParameters.Ref1Property];
								}
								let template;
								let propType = _case.options[ConditionTypeParameters.Ref1];

								switch (propType) {
									case FunctionTemplateKeys.Agent:
									case FunctionTemplateKeys.Model:
									case FunctionTemplateKeys.Parent:
										template = bindTemplate(testCaseProperty, {
											model: propType,
											property: `.${ref1Property}`,
											value: `"wrong"`
										});
										props.push({
											props: ispositive ? '' : template,
											type: _case.type
										});
										properties.push({
											property: `.${ref1Property}`,
											value: `${ref2Model}.Id`
										});
										break;
									case FunctionTemplateKeys.AgentType:
										throw 'This should be agent now';
									default:
										throw 'this hasnt been defined yet';
								}
							}
						}
						break;
					case ConditionTypes.MatchReference:
						if (
							_case.options &&
							_case.options[ConditionTypeParameters.Ref1] &&
							_case.options[ConditionTypeParameters.Ref2] &&
							_case.options[ConditionTypeParameters.Ref1] !== _case.options[ConditionTypeParameters.Ref2]
						) {
							let ref2Model = _case.options[ConditionTypeParameters.Ref2];
							let mmrp = _case.options;
							switch (_case.options[ConditionTypeParameters.Ref2]) {
								case FunctionTemplateKeys.AgentType:
									throw 'this should be agent now';
							}

							if (ref2Model) {
								let ref1Property = 'Id';
								if (!_case.options[ConditionTypeParameters.Ref1UseId]) {
									ref1Property = _case.options[ConditionTypeParameters.Ref1Property];
									ref1Property = GetCodeName(ref1Property);
								}
								let ref2Property = 'Id';
								if (!_case.options[ConditionTypeParameters.Ref2UseId]) {
									ref2Property = _case.options[ConditionTypeParameters.Ref2Property];
									ref2Property = GetCodeName(ref2Property);
								}
								let template;
								let propType = _case.options[ConditionTypeParameters.Ref1];
								let propType2 = _case.options[ConditionTypeParameters.Ref2];
								switch (propType) {
									case FunctionTemplateKeys.Agent:
									case FunctionTemplateKeys.Model:
									case FunctionTemplateKeys.Parent:
										template = bindTemplate(testCaseProperty, {
											model: propType,
											property: `.${ref1Property}`,
											value: !ispositive ? '"wrong"' : `${ref2Model}.${ref2Property}`
										});
										setup_cases.push(template);
										props.push({
											setup_cases: [ 'asdf' ],
											props: template,
											sameInstance: !!(
												methodProps[mmrp[ConditionTypeParameters.Ref1]] &&
												methodProps[mmrp[ConditionTypeParameters.Ref2]]
											),
											type: ConditionTypes.MatchReference
										});
										properties.push({
											props: {
												property: `.${ref1Property}`,
												value: `${ref2Model}.${ref2Property}`
											},
											type: propType
										});
										break;
									case FunctionTemplateKeys.AgentType:
										throw 'This should be agent now';
									default:
										throw 'this hasnt been defined yet';
								}
							}
						}
						break;
					default:
						is_model_parameter = _case.ref === 'model';
						let value =
							_case.values.length <= which ? _case.neg[which - _case.values.length] : _case.values[which];
						let temp = bindTemplate(testCaseProperty, {
							model: is_model_parameter ? 'model' : 'agent', // THis may need to expand
							property: `.${_case.property}`,
							value: value
						});
						if (is_model_parameter) {
							props.push({ props: temp, type: FunctionTemplateKeys.Model });
							properties.push({
								props: {
									property: _case.property,
									value
								},
								type: FunctionTemplateKeys.Model
							});
						} else {
							props.push({ props: temp, type: FunctionTemplateKeys.Agent });
							properties.push({
								props: {
									property: _case.property,
									value
								},
								type: FunctionTemplateKeys.Agent
							});
						}
						break;
				}
			});
			return {
				setup_cases: setup_cases,
				props: [ ...props ],
				properties: [ ...properties ],
				resultSuccess: ispositive
			};
		});

		return res;
	}
	static GenerateTestCases(state: any, permission: any, agent: any, model: any, pindex: any) {
		var graph: any = GetCurrentGraph(state);
		let parent: any = null;
		let manyToMany: any = null;
		let many_to_many_register: any = '';
		let many_to_many_constructor: any = '';
		let testCase: any = fs.readFileSync(TEST_CASE, 'utf8');
		let result: any = [];
		let methodNode = permission
			? GetLinkChainItem({
					id: permission.id,
					links: [
						{
							type: LinkType.FunctionOperator,
							direction: GraphMethods.TARGET
						}
					]
				})
			: null;
		parent = GetMethodPropNode(graph, methodNode, FunctionTemplateKeys.Parent);
		manyToMany = GetMethodPropNode(graph, methodNode, FunctionTemplateKeys.ManyToManyModel);

		if (GetCodeName(parent)) {
			many_to_many_register = fs.readFileSync(
				'./app/templates/permissions/tests/many_to_many_register.tpl',
				'utf8'
			);

			switch (GetNodeProp(methodNode, NodeProperties.FunctionType)) {
				case FunctionTypes.Get_ManyToMany_Agent_Value__IListChild:
					testCase = fs.readFileSync(
						'./app/templates/permissions/tests/Get_ManyToMany_Agent_Value__IListChild.tpl',
						'utf8'
					);
					if (model) {
						many_to_many_register = bindTemplate(many_to_many_register, {
							ref1type: GetCodeName(parent),
							ref1: FunctionTemplateKeys.Parent,
							ref2type: GetCodeName(model),
							ref2: FunctionTemplateKeys.Model
						});
					} else {
						many_to_many_register = '';
					}
					break;
				case FunctionTypes.Create_Parent$Child_Agent_Value__IListChild:
					testCase = fs.readFileSync(
						'./app/templates/permissions/tests/Create_Parent$Child_Agent_Value__IListChild.tpl',
						'utf8'
					);
					if (agent) {
						many_to_many_register = bindTemplate(many_to_many_register, {
							ref1type: GetCodeName(parent),
							ref1: FunctionTemplateKeys.Parent,
							ref2type: GetCodeName(agent),
							ref2: FunctionTemplateKeys.Agent
						});
					} else {
						many_to_many_register = '';
					}
					break;
				case FunctionTypes.Get_Parent$Child_Agent_Value__IListChild:
					testCase = fs.readFileSync(
						'./app/templates/permissions/tests/Get_Parent$Child_Agent_Value__IListChild.tpl',
						'utf8'
					);
					if (agent) {
						many_to_many_register = bindTemplate(many_to_many_register, {
							ref1type: GetCodeName(parent),
							ref1: FunctionTemplateKeys.Parent,
							ref2type: GetCodeName(agent),
							ref2: FunctionTemplateKeys.Agent
						});
					} else {
						many_to_many_register = '';
					}
					break;
				default:
					many_to_many_register = '';
					break;
			}
		}
		switch (GetNodeProp(methodNode, NodeProperties.FunctionType)) {
			case FunctionTypes.Get_Object_Agent_Value__Object:
				many_to_many_register = fs.readFileSync(
					'./app/templates/permissions/tests/many_to_many_register.tpl',
					'utf8'
				);
				if (model) {
					many_to_many_register = bindTemplate(many_to_many_register, {
						ref1type: GetCodeName(manyToMany.properties.logicalChildrenTypes[0]),
						ref1: FunctionTemplateKeys.Agent,
						ref2type: GetCodeName(manyToMany.properties.logicalChildrenTypes[1]),
						ref2: FunctionTemplateKeys.Model
					});

					many_to_many_constructor = bindTemplate(fs.readFileSync(MANY_TO_MANY_CONSTRUCTOR, 'utf8'), {
						many_to_many: GetCodeName(manyToMany)
					});
				} else {
					many_to_many_register = '';
				}
				break;
		}
		if (!manyToMany) {
			many_to_many_register = '';
		}
		if (methodNode) {
			for (var method in Methods) {
				var permissionsEnabledFor = GetNodeProp(permission, NodeProperties.UIPermissions);
				if (permission && permissionsEnabledFor && permissionsEnabledFor[method]) {
					let modelCodeName = GetNodeProp(model, NodeProperties.CodeName);
					var permissionNode = permission;
					let permissionValueType = GetNodeProp(permissionNode, NodeProperties.PermissionValueType);

					let methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps);
					if (permissionValueType && methodProps) {
						modelCodeName = GetCodeName(methodProps[permissionValueType]);
					}

					let res = PermissionGenerator.EnumeratePermissionCases(graph, permission, method, agent, model);

					res = res.map((t: any, testIndex: any) => {
						var { props, resultSuccess, templates = {}, setup_cases = [] } = t;

						return bindTemplate(
							bindTemplate(testCase, {
								many_to_many_register
							}),
							{
								setup_cases: setup_cases.join(NEW_LINE),
								set_agent_properties: props
									.filter((x: { type: string }) => x.type === FunctionTemplateKeys.Agent)
									.map((t: { props: any }) => t.props)
									.join(NEW_LINE),
								set_model_properties: props
									.filter((x: { type: string }) => x.type === FunctionTemplateKeys.Model)
									.map((t: { props: any }) => t.props)
									.join(NEW_LINE),
								set_parent_properties: props
									.filter((x: { type: string }) => x.type === FunctionTemplateKeys.Parent)
									.map((t: { props: any }) => t.props)
									.join(NEW_LINE),
								set_match_reference_properties: props
									.filter((x: { type: string }) => x.type === ConditionTypes.MatchReference)
									.map((t: { props: any }) => t.props)
									.join(NEW_LINE),
								set_match_many_reference_properties: props
									.filter(
										(x: { type: string }) => x.type === ConditionTypes.MatchManyReferenceParameter
									)
									.map((t: { props: any }) => t.props)
									.join(NEW_LINE),
								agent_type: GetCodeName(agent),
								parent_setup: '',
								many_to_many_constructor,
								model: modelCodeName,
								many_to_many: GetCodeName(manyToMany),
								many_to_many_arbiter_constructor: manyToMany
									? bindTemplate(
											`var manyToManyArbiter = RedStrapper.Resolve<IRedArbiter<{{many_to_many}}>>();`,
											{
												many_to_many: GetCodeName(manyToMany)
											}
										)
									: '',
								parent: GetCodeName(parent),
								parent_agent_are_the_same:
									resultSuccess && parent && agent && parent.id && agent.id && parent.id === agent.id
										? `parent = agent;`
										: '',
								method,
								test: `_${GetCodeName(agent)}_${GetCodeName(
									model
								)}_${method}_${testIndex}_case${pindex}`,
								result: resultSuccess ? 'true' : 'false',
								function_name: GetCodeName(permission) + method,
								...templates
							}
						);
					});
					result = [ ...result, ...res ];
				}
			}
		}
		return result;
	}

	static Generate(options: { state: any; key: any }) {
		var { state, key } = options;
		let models = NodesByType(state, NodeTypes.Model);
		let permissions = NodesByType(state, NodeTypes.Permission);
		let agents = models.filter((x: any) => GetNodeProp(x, NodeProperties.IsAgent));
		let graphRoot = GetRootGraph(state);

		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		let _testTemplate = fs.readFileSync(TEST_CLASS, 'utf8');
		let _permissionInterface = fs.readFileSync(PERMISSIONS_INTERFACE, 'utf8');
		let _permissionImplementation = fs.readFileSync(PERMISSIONS_IMPL, 'utf8');
		let _permissionInterfaceMethods = fs.readFileSync(PERMISSIONS_INTERFACE_METHODS, 'utf8');
		let _permissionMethods = fs.readFileSync(PERMISSIONS_METHODS, 'utf8');
		let _permissionArbiters = fs.readFileSync(PERMISSIONS_ARBITER_PROP, 'utf8');
		let result: any = {};

		agents.map((agent: any) => {
			let streamProcessChangeClassExtension = _permissionImplementation;
			let permissionInterface = _permissionInterface;
			let testPermission = _testTemplate;
			let methodImplementations: any[] = [];
			let methodInterfaces: any[] = [];
			let testMethodPermisionCases: any[] = [];
			let arbiters: any[] = [];
			models
				.map((model: { id: any }) => {
					let matchingPermissionNodes = permissions.filter((permission: any) =>
						PermissionGenerator.PermissionMatches(permission, agent, model)
					);
					if (!matchingPermissionNodes || !matchingPermissionNodes.length) {
						return;
					}
					let permissionCases: {}[] = [];
					let permissionCodeNames: any[] = [];
					matchingPermissionNodes.map((matchingPermissionNode: any, pindex: any) => {
						if (matchingPermissionNode) {
							permissionCodeNames.push(GetNodeProp(matchingPermissionNode, NodeProperties.CodeName));
							let temp = PermissionGenerator.GenerateCases(state, matchingPermissionNode, agent, model);
							let testTemp = PermissionGenerator.GenerateTestCases(
								state,
								matchingPermissionNode,
								agent,
								model,
								pindex
							);
							permissionCases.push(temp);
							testMethodPermisionCases.push(...testTemp);
						}
					});
					permissionCases.map((perms: any, index: any) => {
						for (var permKey in perms) {
							let cases = perms[permKey];
							let parent_setup = '';
							let parent_type = '';
							cases.map(
								(t: {
									arbiter: any;
									options: { [x: string]: string };
									methodProps: { [x: string]: any; parent: any };
								}) => {
									if (t && t.arbiter) {
										arbiters.push(t);
									}
									if (t && t.options && t.methodProps) {
										let parms = [ ConditionTypeParameters.Ref1, ConditionTypeParameters.Ref2 ];
										parms.map((parm) => {
											if (t.methodProps[t.options[parm]]) {
												let arbiter = GetCodeName(t.methodProps[t.options[parm]]);
												if (t.options[parm] === INTERNAL_TEMPLATE_REQUIREMENTS.PARENT) {
													if (t.methodProps.parent !== model.id) parent_type = arbiter;
												}
												if (arbiter) {
													arbiters.push({
														arbiter
													});
												}
											}
										});
									}
								}
							);

							parent_setup = parent_type
								? `var parent = data.${parent_type} != null ? (await arbiter${parent_type}.Get<${parent_type}>(data.${parent_type})) : null;`
								: 'var parent = data;';
							let modelCodeName = GetNodeProp(model, NodeProperties.CodeName);
							var permissionNode = matchingPermissionNodes[index];
							let permissionValueType = GetNodeProp(permissionNode, NodeProperties.PermissionValueType);
							var methodNode = permissionNode
								? GetLinkChainItem({
										id: permissionNode.id,
										links: [
											{
												direction: GraphMethods.TARGET,
												type: LinkType.FunctionOperator
											}
										]
									})
								: null;

							let methodProps = GetNodeProp(methodNode, NodeProperties.MethodProps);
							if (permissionValueType && methodProps) {
								modelCodeName = GetCodeName(methodProps[permissionValueType]);
							}
							let permissionMethods: any = _permissionMethods;
							let permissionInterfaceMethods: any = _permissionInterfaceMethods;
							permissionMethods = bindTemplate(permissionMethods, {
								model: modelCodeName,
								value: `data`,
								agent_type: GetNodeProp(agent, NodeProperties.CodeName),
								function_name: permissionCodeNames[index] + permKey,
								agent: `value`,
								parent_setup,
								method: permKey,
								cases: cases.map((c: { template: string }) => jNL + Tabs(4) + c.template).join(''),
								case_result:
									jNL +
									Tabs(4) +
									`result = ${cases.map((c: { variable: any }) => c.variable).join(' && ')};`
							});
							permissionInterfaceMethods = bindTemplate(permissionInterfaceMethods, {
								model: modelCodeName,
								function_name: permissionCodeNames[index] + permKey,
								value: `data`,
								agent_type: GetNodeProp(agent, NodeProperties.CodeName),
								agent: `value`,
								method: permKey
							});
							methodInterfaces.push(permissionInterfaceMethods);
							methodImplementations.push(permissionMethods);
						}
					});
				})
				.join(jNL);
			arbiters = arbiters
				.map((t: any) => t.arbiter)
				.unique((x: any) => x)
				.map((t: any) => {
					return bindTemplate(_permissionArbiters, {
						arbiter: t
					});
				})
				.join(jNL);
			streamProcessChangeClassExtension = bindTemplate(streamProcessChangeClassExtension, {
				agent_type: GetNodeProp(agent, NodeProperties.CodeName),
				arbiters,
				methods: methodImplementations.unique().join(jNL + jNL)
			});
			permissionInterface = bindTemplate(permissionInterface, {
				agent_type: GetNodeProp(agent, NodeProperties.CodeName),
				methods: methodInterfaces.unique().join(jNL + jNL)
			});
			let hasExtensions = NodesByType(state, NodeTypes.ExtensionType).length;
			result[GetNodeProp(agent, NodeProperties.CodeName)] = {
				name: `Permissions${GetNodeProp(agent, NodeProperties.CodeName)}`,
				tname: `Permissions${GetNodeProp(agent, NodeProperties.CodeName)}Tests`,
				iname: `IPermissions${GetNodeProp(agent, NodeProperties.CodeName)}`,
				template: NamespaceGenerator.Generate({
					template: streamProcessChangeClassExtension,
					usings: [
						...STANDARD_CONTROLLER_USING,
						hasExtensions ? `${namespace}${NameSpace.Extensions}` : false,
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Interface}`,
						arbiters && arbiters.length ? `${namespace}${NameSpace.Controllers}` : null,
						`${namespace}${NameSpace.Constants}`
					].filter((x) => x),
					namespace,
					space: NameSpace.Permissions
				}),
				interface: NamespaceGenerator.Generate({
					template: permissionInterface,
					usings: [
						...STANDARD_CONTROLLER_USING,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.Model}`
					],
					namespace,
					space: NameSpace.Interface
				}),
				test: NamespaceGenerator.Generate({
					template: bindTemplate(testPermission, {
						tests: testMethodPermisionCases.join(NEW_LINE),
						name: `Permissions${GetNodeProp(agent, NodeProperties.CodeName)}`
					}),
					usings: [
						...STANDARD_CONTROLLER_USING,
						...STANDARD_TEST_USING,
						`${namespace}${NameSpace.Interface}`,
						`${namespace}${NameSpace.Permissions}`,
						hasExtensions ? `${namespace}${NameSpace.Extensions}` : false,
						`${namespace}${NameSpace.Constants}`,
						`${namespace}${NameSpace.Model}`
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

function Tabs(c: any) {
	let res = '';
	for (var i = 0; i < c; i++) {
		res += TAB;
	}
	return res;
}
