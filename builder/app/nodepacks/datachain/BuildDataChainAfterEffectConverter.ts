import {
	MethodDescription,
	DataChainConfiguration,
	RelationType,
	SkipSettings,
	SetProperty,
	SetPropertyType,
	ReturnSetting,
	CompareEnumeration,
	ReturnSettingConfig,
	CheckExistenceConfig,
	BranchConfig,
	AfterEffect,
	MountingDescription,
	EnumerationConfig,
	AfterEffectRelations,
	StretchPathItem,
	SimpleValidationConfig,
	AreEqualConfig,
	HalfRelation,
	IsContainedConfig,
	CopyConfig,
	CopyEnumerationConfig
} from '../../interface/methodprops';
import { MethodFunctions, bindTemplate } from '../../constants/functiontypes';
import {
	CreateNewNode,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty,
	GetJSCodeName,
	GetNodeById,
	GetCodeName,
	GetNodeTitle,
	GetPropertyModel,
	GetNodeByProperties,
	ensureRouteSource,
	IsModel
} from '../../actions/uiactions';
import {
	NodeProperties,
	NodeTypes,
	NEW_LINE,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages
} from '../../constants/nodetypes';
import { DataChainFunctionKeys } from '../../constants/datachain';
import {
	codeTypeWord,
	GetNodeProp,
	getNodesLinkedTo,
	GetNodesLinkedTo,
	SOURCE,
	NodesByType
} from '../../methods/graph_methods';
import { ReferenceInsertType } from '../../components/lambda/BuildLambda';
import { code } from '../../components/editor.main.css';
import { SimpleValidation, NodeType } from '../../components/titles';
import SimpleValidationComponent from '../../components/simplevalidationconfig';
import { equal } from 'assert';
import { Node, Graph } from '../../methods/graph_types';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to?: MethodDescription;
	dataChain?: string;
	afterEffectParent?: string;
	afterEffectChild?: string;
	afterEffect?: AfterEffect;
	override?: boolean;
	currentDescription?: MountingDescription;
	name: string;
	routes: AfterEffect[];
	methods: MountingDescription[];
	afterEffectOptions: DataChainConfiguration;
	type: DataChainType;
}
export enum DataChainType {
	Validation = 'Validation',
	Filter = 'Filter',
	Permission = 'Permission',
	Execution = 'Execution',
	AfterEffect = 'AfterEffect'
}
export default function BuildDataChainAfterEffectConverter(args: AfterEffectConvertArgs, callback: Function) {
	let {
		from,
		to,
		type,
		currentDescription,
		afterEffect,
		dataChain,
		afterEffectOptions: dataChainConfigOptions,
		routes,
		methods,
		afterEffectParent,
		override,
		afterEffectChild,
		name
	} = args;
	let checking_existence: string = '';
	let get_existing: string = ''; //var value = #{{"key":"model"}}.Create()
	let set_properties: string = '';
	let compare_enumeration: string = '';
	let staticMethods: string[] = [];
	let guts: string = '';
	let copy_config: string = '';
	let outputType: string = '';
	let simplevalidation: string = '';
	let route_config: string = '';
	let can_complete = false;
	let arbiterModels: string[] = [];
	let target_property = '';
	let tempLambdaInsertArgumentValues: any = {};
	tempLambdaInsertArgumentValues.model = { model: from.properties.model };
	tempLambdaInsertArgumentValues.agent = { model: from.properties.agent };
	tempLambdaInsertArgumentValues.parent = { model: from.properties.parent };
	tempLambdaInsertArgumentValues.model_output = { model: from.properties.model_output || from.properties.model };
	if (from.properties.model) arbiterModels.push(from.properties.model);
	if (from.properties.agent) arbiterModels.push(from.properties.agent);
	if (from.properties.parent) arbiterModels.push(from.properties.parent);
	if (dataChainConfigOptions) {
		let { compareEnumeration, compareEnumerations, copyConfig, copyEnumeration } = dataChainConfigOptions;
		if (compareEnumeration) {
			compare_enumeration = CompareEnumerationFunc(compareEnumeration, tempLambdaInsertArgumentValues);
		}
		if (compareEnumerations) {
			compare_enumeration = compareEnumerations
				.filter((v) => v.enabled)
				.map((compareEnumeration: CompareEnumeration) => {
					return CompareEnumerationFunc(compareEnumeration, tempLambdaInsertArgumentValues);
				})
				.join(NEW_LINE);
		}
		if (copyConfig && copyConfig.enabled) {
			({ target_property, outputType, copy_config } = setupCopyConfig(
				copyConfig,
				from,
				target_property,
				tempLambdaInsertArgumentValues,
				to,
				outputType,
				copy_config
			));
		}
		if (copyEnumeration && copyEnumeration.enabled) {
			({ target_property, outputType, copy_config } = setupCopyEnumeration(
				copyEnumeration,
				from,
				target_property,
				tempLambdaInsertArgumentValues,
				to,
				outputType,
				copy_config
			));
		}

		if (dataChainConfigOptions.checkExistence && dataChainConfigOptions.checkExistence.enabled) {
			let {
				relationType,
				modelProperty,
				modelOutputProperty,
				modelOutput,
				agentProperty,
				targetProperty,
				skipSettings,
				returnSetting
			} = dataChainConfigOptions.checkExistence;

			setLambdaProperties(
				tempLambdaInsertArgumentValues,
				agentProperty,
				modelProperty,
				targetProperty,
				{
					from,
					to
				},
				modelOutputProperty,
				modelOutput,
				dataChainConfigOptions.checkExistence
			);

			let onTrue = '';
			if (returnSetting && returnSetting.enabled) {
				switch (returnSetting.setting) {
					case ReturnSetting.ReturnFalse:
						onTrue = 'return false';
						break;
					case ReturnSetting.ReturnTrue:
						onTrue = 'return true';
						break;
				}
			}

			checking_existence = checkExistenceFunction(
				dataChainConfigOptions.checkExistence,
				relationType,
				skipSettings,
				checking_existence,
				targetProperty,
				onTrue,
				returnSetting,
				type
			);
			staticMethods.push(
				...GenerateStretchMethods(
					dataChainConfigOptions.checkExistence,
					tempLambdaInsertArgumentValues,
					arbiterModels
				)
			);
			staticMethods.push(...GenerateBranchMethods(dataChainConfigOptions, routes, methods));
		}

		if (
			dataChainConfigOptions.routeConfig &&
			dataChainConfigOptions.routeConfig.enabled &&
			dataChainConfigOptions.routeConfig.pushChange
		) {
			route_config = `await _${codeTypeWord(name)}(model, agent, change, value);`;
			staticMethods.push(
				...GeneratePushChange({
					methods,
					afterEffect,
					name: codeTypeWord(name)
				})
			);
		}

		if (dataChainConfigOptions.getExisting && dataChainConfigOptions.getExisting.enabled) {
			if (dataChainConfigOptions.checkExistence && dataChainConfigOptions.checkExistence.enabled) {
				get_existing = 'var value = checkModel.FirstOrDefault()';
			} else {
				let {
					relationType,
					modelProperty,
					agentProperty,
					targetProperty,
					modelOutput,
					modelOutputProperty
				} = dataChainConfigOptions.getExisting;

				setLambdaProperties(
					tempLambdaInsertArgumentValues,
					agentProperty,
					modelProperty,
					targetProperty,
					{
						from,
						to
					},
					modelOutput,
					modelOutputProperty,
					dataChainConfigOptions.getExisting
				);

				switch (relationType) {
					case RelationType.Model:
					case RelationType.Agent:
						get_existing = `(await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetJSCodeName(
							targetProperty
						)}","type":"property","model":"model"}}# == ${relationType == RelationType.Agent
							? 'agent'
							: 'fromModel'}.#{{"key":"${relationType}.prop","type":"property","model":"${relationType}"}}#)).FirstOrDefault()`;
						break;
				}
			}
		}
		if (dataChainConfigOptions.setProperties && dataChainConfigOptions.setProperties.enabled) {
			set_properties = dataChainConfigOptions.setProperties.properties
				.map((afterEffectSetupProperty: SetProperty) => {
					let {
						setPropertyType,
						stringValue,
						doubleValue,
						integerValue,
						booleanValue,
						floatValue,
						enumerationValue,
						targetProperty,
						enumeration,
						agentProperty,
						modelProperty,
						relationType
					} = afterEffectSetupProperty;
					let model_to = type === DataChainType.AfterEffect ? 'tomodel' : 'model';
					let prop_string = `value.#{{"key":"${model_to}.${GetJSCodeName(
						targetProperty
					)}","type":"property","model":"${model_to}"}}#`;
					let targetModel = GetPropertyModel(targetProperty);
					tempLambdaInsertArgumentValues[`${model_to}.${GetJSCodeName(targetProperty)}`] = {
						property: targetProperty,
						model: targetModel ? targetModel.id : '',
						type: ReferenceInsertType.Property
					};
					if (type === DataChainType.AfterEffect) {
						tempLambdaInsertArgumentValues[`${model_to}`] = {
							model: targetModel ? targetModel.id : '',
							type: ReferenceInsertType.Model
						};
					}
					switch (setPropertyType) {
						case SetPropertyType.Integer:
							return `${prop_string} = ${integerValue};`;
						case SetPropertyType.Float:
							return `${prop_string} = ${floatValue};`;
						case SetPropertyType.Double:
							return `${prop_string} = ${doubleValue};`;
						case SetPropertyType.Enumeration:
							let enumNode = GetNodeById(enumeration);
							let enumprops = GetNodeProp(enumNode, NodeProperties.Enumeration) || [];
							let enumProp: { value: string; id: string } = enumprops.find(
								(v: { id: string }) => v.id === enumerationValue
							);
							tempLambdaInsertArgumentValues[GetJSCodeName(enumeration)] = { enumeration: enumeration };
							tempLambdaInsertArgumentValues[`${GetJSCodeName(enumeration)}.${enumProp.value}`] = {
								enumeration,
								enumerationvalue: enumerationValue
							};
							return `${prop_string} = #{{"key":"${GetJSCodeName(
								enumeration
							)}","type":"enumeration" }}#.#{{"key":"${GetJSCodeName(
								enumeration
							)}.${enumProp.value}","type":"enumerationvalue"}}#;`;
						case SetPropertyType.String:
							// TODO: Escape string value for C#;
							return `${prop_string} = ${stringValue ? `"${stringValue}"` : 'string.Empty'};`;
						case SetPropertyType.Boolean:
							return `${prop_string} = ${booleanValue};`;
						case SetPropertyType.Property:
							let fromPropModel = relationType === RelationType.Agent ? 'agent' : 'model';
							let keyname = `${fromPropModel}.${relationType === RelationType.Agent
								? GetJSCodeName(agentProperty)
								: GetJSCodeName(modelProperty)}`;
							let agent = GetPropertyModel(agentProperty);
							let model = GetPropertyModel(modelProperty);
							tempLambdaInsertArgumentValues[keyname] = {
								property: relationType === RelationType.Agent ? agentProperty : modelProperty,
								type: ReferenceInsertType.Property,
								model:
									relationType === RelationType.Agent
										? agent ? agent.id : null
										: model ? model.id : null
							};
							return `${prop_string} = ${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${fromPropModel}"}}#;`;
					}
				})
				.join(NEW_LINE);
		}
		if (dataChainConfigOptions) {
			simplevalidation = GenerateSimpleValidations(dataChainConfigOptions, tempLambdaInsertArgumentValues, {
				type,
				targetProperty: target_property
			});
		}
	}
	let from_parameter_template = '';
	switch (type) {
		case DataChainType.Permission:
			can_complete = true;
			from_parameter_template = `
      public static async Task<bool> Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent)
      {

        Func<#{{"key":"model"}}#, #{{"key":"agent"}}#, Task<bool>> func = async (#{{"key":"model"}}# model, #{{"key":"agent"}}# agent) => {
          // build model value here.

          {{compare_enumeration}}
          {{simplevalidation}}
          return true;
        };

        return await func(model, agent);
      }
  `;
			break;
		case DataChainType.Validation:
			if (from && from.functionType) {
				can_complete = true;
			}
			let to_arbiter = '';
			if (checking_existence) {
				to_arbiter = `
        `;
				if (to && to.properties && to.properties.agent) {
					arbiterModels.push(to.properties.agent);
				}
				if (to && to.properties && (to.properties.model || to.properties.model_output)) {
					arbiterModels.push(to.properties.model || to.properties.model_output || '');
				}
			}
			from_parameter_template = `
      public static async Task<bool> Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change_parameter)
      {
        Func<#{{"key":"model"}}#, #{{"key":"agent"}}#, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#, Task<bool>> func = async (#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change_parameter) => {

          {{checking_existence}}
          // build model value here.

          {{guts}}

          {{simplevalidation}}

          return true;
       };

       return await func(model, agent, change_parameter);
      }
  `;
			break;
		case DataChainType.Execution:
			can_complete = true;
			from_parameter_template = `
      public static async Task<${outputType ||
			'bool'}> Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change, #{{"key":"result"}}# result)
      {
          Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#, Task<${outputType ||
				'bool'}>> func = async (#{{"key":"agent"}}# agent, #{{"key":"model"}}# model, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change) => {
              {{simplevalidation}}
              {{copy_config}}
          };

          return await func(model, agent, change);
      }
  `;
			break;
		case DataChainType.Filter:
			can_complete = true;
			let parent_input = '';
			if (from.properties.parent) {
				parent_input = ', #{{"key":"parent"}}# parent = null';
			}

			from_parameter_template = `
    public static async Task<#{{"key":"model"}}#, bool> Filter(#{{"key":"agent"}}# agent = null, #{{"key":"model"}}# model = null${parent_input})
    {
        Func<#{{"key":"model_output"}}#, bool> func = (#{{"key":"model_output"}}# model_output) => {
            {{simplevalidation}}

            return true;
        };

        return func;
    }
`;
			break;
		case DataChainType.AfterEffect:
		default:
			if (to && to.functionType) {
				if (from && from.functionType) {
					can_complete = true;
				}
			}
			from_parameter_template = `
      public static async Task Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change)
      {
          Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#, Task> func = async (#{{"key":"agent"}}# agent, #{{"key":"model"}}# fromModel, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change) => {

          {{checking_existence}}

          // build model value here.
          {{copy_config}}
          {{set_properties}}
          {{get_existing}}
          {{route_config}}
       };

       await func(agent, model, change);
      }
      ${staticMethods.join(NEW_LINE)}
  `;
			break;
	}

	from_parameter_template = bindTemplate(from_parameter_template, {
		checking_existence,
		get_existing,
		compare_enumeration,
		route_config,
		set_properties,
		copy_config,
		guts,
		simplevalidation,
		from_model: `${GetCodeName(from.properties.model_output || from.properties.model || from.properties.agent)}`,
		agent_type: `${GetCodeName(from.properties.agent || from.properties.model_output || from.properties.model)}`,
		model: `${GetCodeName(
			to
				? to.properties.model || to.properties.agent
				: from.properties.model_output || from.properties.model || from.properties.agent
		)}`,
		after_effect_parent: codeTypeWord(afterEffectParent),
		after_effect_child: codeTypeWord(afterEffectChild)
	});
	if (can_complete) {
		let methodFunction = MethodFunctions[from.functionType];
		const lambdaInsertArgumentValues = GetNodeProp(dataChain, NodeProperties.LambdaInsertArguments) || {};

		if (dataChain) {
			let lambdaInsert = {
				...tempLambdaInsertArgumentValues,
				...lambdaInsertArgumentValues
			};
			if (override) {
				lambdaInsert = { ...tempLambdaInsertArgumentValues };
			}
			fixLambdaInsertArguments(tempLambdaInsertArgumentValues, lambdaInsert);
			updateComponentProperty(dataChain, NodeProperties.LambdaInsertArguments, lambdaInsert);
			updateComponentProperty(dataChain, NodeProperties.Lambda, from_parameter_template);
			updateComponentProperty(dataChain, NodeProperties.DataChainTypeCategory, type);
			updateComponentProperty(dataChain, NodeProperties.CompleteFunction, true);
			updateComponentProperty(dataChain, NodeProperties.ArbiterModels, arbiterModels);
			updateComponentProperty(dataChain, NodeProperties.UIText, name);
			updateComponentProperty(
				dataChain,
				NodeProperties.AfterEffectKey,
				`AfterEffectChains.${codeTypeWord(afterEffectParent)}.${codeTypeWord(afterEffectChild)}`
			);
			updateComponentProperty(dataChain, NodeProperties.TargetProperty, target_property);
			if (dataChain && callback) callback(GetNodeById(dataChain));
		} else if (methodFunction) {
			graphOperation(
				CreateNewNode(
					{
						[NodeProperties.UIText]: name,
						[NodeProperties.NODEType]: NodeTypes.DataChain,
						[NodeProperties.CS]: true,
						[NodeProperties.CSEntryPoint]: true,
						[NodeProperties.DataChainTypeCategory]: type,
						[NodeProperties.ArbiterModels]: arbiterModels,
						[NodeProperties.CompleteFunction]: true,
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
						[NodeProperties.LambdaInsertArguments]: lambdaInsertArgumentValues,
						[NodeProperties.TargetProperty]: target_property,
						[NodeProperties.Lambda]: from_parameter_template,
						[NodeProperties.AfterEffectKey]: `AfterEffectChains.${codeTypeWord(
							afterEffectParent
						)}.${codeTypeWord(afterEffectChild)}`
					},
					(res: Node) => {
						if (res && callback) callback(res);
					}
				)
			)(GetDispatchFunc(), GetStateFunc());
		}
	}
}
function setupCopyConfig(
	copyConfig: CopyConfig,
	from: MethodDescription,
	target_property: string,
	tempLambdaInsertArgumentValues: any,
	to: MethodDescription | undefined,
	outputType: string,
	copy_config: string
) {
	let { agentProperty, modelProperty, relationType, targetProperty, modelOutput, modelOutputProperty } = copyConfig;
	let props = agentProperty;
	let relProp = 'agent';
	let agentOrModel = from.properties.agent;
	if (relationType === RelationType.Model) {
		props = modelProperty;
		relProp = 'model';
		agentOrModel = from.properties.model;
	}
	target_property = targetProperty;
	setLambdaProperties(
		tempLambdaInsertArgumentValues,
		agentProperty,
		modelProperty,
		targetProperty,
		{
			from,
			to
		},
		modelOutput,
		modelOutputProperty,
		copyConfig
	);
	let attributeType = GetNodeProp(props, NodeProperties.UIAttributeType);
	outputType = NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][attributeType];
	tempLambdaInsertArgumentValues[`${relProp}.${GetJSCodeName(props)}`] = {
		[ReferenceInsertType.Property]: props,
		[ReferenceInsertType.Model]: agentOrModel
	};
	copy_config = `return ${relProp}.#{{"key":"${relProp}.${GetJSCodeName(
		props
	)}","type":"property","model":"${relProp}"}}#;`;
	return { target_property, outputType, copy_config };
}
function setupCopyEnumeration(
	copyEnumeration: CopyEnumerationConfig,
	from: MethodDescription,
	target_property: string,
	tempLambdaInsertArgumentValues: any,
	to: MethodDescription | undefined,
	outputType: string,
	copy_config: string
) {
	let { targetProperty } = copyEnumeration;
	let enumeration = copyEnumeration.enumerationType;
	tempLambdaInsertArgumentValues[GetJSCodeName(enumeration)] = { enumeration: enumeration };
	let enumertions: { id: string; value: string }[] = GetNodeProp(enumeration, NodeProperties.Enumeration) || [];
	let enum_set: string = '';
	let enumProp = enumertions.find((e) => e.id == copyEnumeration.enumeration);
	if (enumProp) {
		tempLambdaInsertArgumentValues[`${GetJSCodeName(enumeration)}.${enumProp.value}`] = {
			enumeration,
			enumerationvalue: copyEnumeration.enumeration
		};
		copy_config = `return #{{"key":"${GetJSCodeName(
			enumeration
		)}","type":"enumeration" }}#.#{{"key":"${GetJSCodeName(
			enumeration
		)}.${enumProp.value}","type":"enumerationvalue"}}#`;
	}

	let attributeType = GetNodeProp(targetProperty, NodeProperties.UIAttributeType);
	outputType = NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][attributeType];
	target_property = targetProperty;

	return { target_property, outputType, copy_config };
}

function fixLambdaInsertArguments(tempLambdaInsertArgumentValues: any, lambdaInsert: any) {
	Object.keys(tempLambdaInsertArgumentValues).map((key: string) => {
		if (tempLambdaInsertArgumentValues[key]) {
			let { type } = tempLambdaInsertArgumentValues[key];
			switch (type) {
				case ReferenceInsertType.Property:
					if (!lambdaInsert[key].model || !lambdaInsert[key].property) {
						lambdaInsert[key] = tempLambdaInsertArgumentValues[key];
					}
					break;
				case ReferenceInsertType.PropertyType:
					if (!lambdaInsert[key].model || !lambdaInsert[key].propertyType) {
						lambdaInsert[key] = tempLambdaInsertArgumentValues[key];
					}
					break;
			}
		}
	});
}

function GenerateSimpleValidations(
	dataChainConfigOptions: DataChainConfiguration,
	tempLambdaInsertArgumentValues: any,
	ops: { type: DataChainType; targetProperty: string }
): string {
	let result: string = '';
	let valuePropString = '';

	let { simpleValidations, simpleValidationConfiguration } = dataChainConfigOptions;
	let checks: { template: string; id: string }[] = [];
	if (simpleValidations) {
		simpleValidations.filter((sv: SimpleValidationConfig) => sv.enabled).forEach((simpleValidation) => {
			let { relationType } = simpleValidation;
			SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, relationType, simpleValidation);
			valuePropString = GetRelationTypeValuePropString(relationType, simpleValidation);
			if (simpleValidation.areEqual && simpleValidation.areEqual.enabled) {
				let equality = GenerateEqualityComparer(
					simpleValidation,
					simpleValidation.areEqual,
					tempLambdaInsertArgumentValues
				);
				checks.push({ template: equality, id: simpleValidation.id });
			}
			if (simpleValidation.isNotContained && simpleValidation.isNotContained.enabled) {
				let equality = GenerateIsContainedComparer(
					simpleValidation,
					simpleValidation.isNotContained,
					tempLambdaInsertArgumentValues,
					true
				);
				checks.push({ template: equality, id: simpleValidation.id });
			}
			if (simpleValidation.isIntersecting && simpleValidation.isIntersecting.enabled) {
				let equality = GenerateIsIntersectingComparer(
					simpleValidation,
					simpleValidation.isIntersecting,
					tempLambdaInsertArgumentValues,
					true
				);
				checks.push({ template: equality, id: simpleValidation.id });
			}
			if (simpleValidation.isContained && simpleValidation.isContained.enabled) {
				let equality = GenerateIsContainedComparer(
					simpleValidation,
					simpleValidation.isContained,
					tempLambdaInsertArgumentValues,
					false
				);
				checks.push({ template: equality, id: simpleValidation.id });
			}
			if (simpleValidation.oneOf && simpleValidation.oneOf.enabled) {
				let oneOf = GenerateOneOf(valuePropString, simpleValidation.oneOf, tempLambdaInsertArgumentValues);
				checks.push({ template: oneOf, id: simpleValidation.id });
			}
			if (simpleValidation.isFalse && simpleValidation.isFalse.enabled) {
				checks.push({ template: `!${valuePropString}`, id: simpleValidation.id });
			}
			if (simpleValidation.isTrue && simpleValidation.isTrue.enabled) {
				checks.push({ template: `${valuePropString}`, id: simpleValidation.id });
			}
			if (simpleValidation.alphaOnlyWithSpaces && simpleValidation.alphaOnlyWithSpaces.enabled) {
				let oneOf = `await new AlphaOnlyWithSpacesAttribute().IsOk(${valuePropString})`;
				checks.push({ template: oneOf, id: simpleValidation.id });
			}
			if (simpleValidation.isNotNull && simpleValidation.isNotNull.enabled) {
				let oneOf = `await new IsNotNullAttribute().IsOk(${valuePropString})`;
				checks.push({ template: oneOf, id: simpleValidation.id });
			}
			if (simpleValidation.isNull && simpleValidation.isNull.enabled) {
				let oneOf = `await new IsNullAttribute().IsOk(${valuePropString})`;
				checks.push({ template: oneOf, id: simpleValidation.id });
			}
			if (simpleValidation.maxLength && simpleValidation.maxLength.enabled) {
				let oneOf = `await new MaxLengthAttribute(${simpleValidation.maxLength.value},${simpleValidation
					.maxLength.equal
					? 'true'
					: 'false'}).IsOk(${valuePropString})`;
				checks.push({ template: oneOf, id: simpleValidation.id });
			}
			if (simpleValidation.minLength && simpleValidation.minLength.enabled) {
				let oneOf = `await new MinLengthAttribute(${simpleValidation.minLength.value},${simpleValidation
					.maxLength.equal
					? 'true'
					: 'false'}).IsOk(${valuePropString})`;
				checks.push({ template: oneOf, id: simpleValidation.id });
			}
			// if (simpleValidation.) {
			// 	let oneOf = `await new MinLengthAttribute(${simpleValidation.minLength.value}).IsOk(${valuePropString});`;
			// 	checks.push(oneOf);
			// }
		});
	}
	let returnStatement = '';
	switch (ops.type) {
		case DataChainType.Execution:
			let targetModel = IsModel(ops.targetProperty)
				? GetNodeById(ops.targetProperty)
				: GetPropertyModel(ops.targetProperty);
			if (IsModel(ops.targetProperty)) {
				tempLambdaInsertArgumentValues[`result.${GetCodeName(ops.targetProperty)}`] = {
					model: targetModel ? targetModel.id : ''
				};
				tempLambdaInsertArgumentValues[`result`] = tempLambdaInsertArgumentValues['model'];
			} else {
				tempLambdaInsertArgumentValues[`result.${GetCodeName(ops.targetProperty)}`] = {
					property: ops.targetProperty,
					model: targetModel ? targetModel.id : ''
				};
				tempLambdaInsertArgumentValues[`result`] = {
					model: targetModel ? targetModel.id : ''
				};
			}
			returnStatement = `return result.#{{"key":"result.${GetCodeName(
				ops.targetProperty
			)}","type":"property","model":"result"}}#`;
			break;
		default:
			returnStatement = 'result false';
	}
	if (!(simpleValidationConfiguration && simpleValidationConfiguration.enabled)) {
		result = checks
			.map((check: { template: string; id: string }, index: number) => {
				if (!index) return `var test_${index} = ${check.template};`;
				return `var test_${index} = test_${index - 1} && ${check.template};`;
			})
			.join(NEW_LINE);

		if (checks.length)
			return `${result}
    if(!test_${checks.length - 1}) {
      ${returnStatement};
    }
  `;
	} else if (simpleValidationConfiguration && simpleValidationConfiguration.enabled) {
		let { graph } = simpleValidationConfiguration.composition;
		let res = ProductIfStatementComposition(graph, checks);
		return `let result = ${res};
      if(!result) {
        ${returnStatement};
      }
    `;
	}
	return '';
}

function ProductIfStatementComposition(graph: Graph, checks: { template: string; id: string }[]) {
	let root = NodesByType(graph, NodeTypes.RootNode, { skipCache: true }).find((v: Node) =>
		GetNodeProp(v, NodeProperties.IsRoot)
	);
	if (!root) {
		return 'return false; /* missing composition */';
	}
	return produceIfStatementComposition(root, graph, checks, []);
}
function produceIfStatementComposition(
	root: Node,
	graph: Graph,
	checks: { template: string; id: string }[],
	visitedNodes: string[]
): string {
	let clause = '';
	let operation =
		GetNodeProp(root, NodeProperties.IsRoot) || GetNodeProp(root, NodeProperties.NODEType) === NodeTypes.ANDNode
			? '&&'
			: '||';
	let children: Node[] = GetNodesLinkedTo(graph, {
		direction: SOURCE,
		id: root.id
	});
	let unvisitedChildren = children.filter((node: Node) => visitedNodes.indexOf(node.id) === -1);
	if (unvisitedChildren.length === children.length) {
		let statements = unvisitedChildren.map((child: Node) => {
			let nodeType: string = GetNodeProp(child, NodeProperties.NODEType);
			switch (nodeType) {
				case NodeTypes.ANDNode:
				case NodeTypes.ORNode:
					let orstatement = produceIfStatementComposition(
						child,
						graph,
						checks,
						[ ...visitedNodes, ...unvisitedChildren.map((v) => v.id) ].unique()
					);
					return `(${orstatement})`;
				case NodeTypes.LeafNode:
					let check = checks.find((v) => {
						return v.id === GetNodeProp(child, NodeProperties.ValidationConfigurationItem);
					});
					if (check) {
						return `(${check.template})`;
					} else {
						throw new Error('missing validation check');
					}
					break;
			}
			throw new Error('composition: unhandled node type: ' + nodeType);
		});
		return statements.join(` ${operation} `);
	} else {
		throw new Error('circular relation');
	}
	return clause;
}
function GenerateEqualityComparer(
	simpleValidation: SimpleValidationConfig,
	areEqual: AreEqualConfig,
	tempLambdaInsertArgumentValues: any,
	equal: string = '=='
) {
	let { relationType } = simpleValidation;
	let valuePropString = GetRelationTypeValuePropString(relationType, simpleValidation);
	let equalityTo = GetRelationTypeValuePropString(areEqual.relationType, areEqual);
	SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, relationType, simpleValidation);
	SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, areEqual.relationType, areEqual);

	return `${valuePropString} ${equal} ${equalityTo}`;
}

function GenerateIsContainedComparer(
	simpleValidation: SimpleValidationConfig,
	areEqual: IsContainedConfig,
	tempLambdaInsertArgumentValues: any,
	not: boolean
) {
	let { relationType } = simpleValidation;
	let valuePropString = GetRelationTypeValuePropString(relationType, simpleValidation);
	let equalityTo = GetRelationTypeValuePropString(areEqual.relationType, areEqual);
	SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, relationType, simpleValidation);
	SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, areEqual.relationType, areEqual);

	return `${not ? '!' : ''}(${valuePropString} != null && ${valuePropString}.Contains(${equalityTo}))`;
}

function GenerateIsIntersectingComparer(
	simpleValidation: SimpleValidationConfig,
	areEqual: IsContainedConfig,
	tempLambdaInsertArgumentValues: any,
	not: boolean
) {
	let { relationType } = simpleValidation;
	let valuePropString = GetRelationTypeValuePropString(relationType, simpleValidation);
	let equalityTo = GetRelationTypeValuePropString(areEqual.relationType, areEqual);
	SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, relationType, simpleValidation);
	SetLambdaInsertArgumentValues(tempLambdaInsertArgumentValues, areEqual.relationType, areEqual);

	return `${not ? '!' : ''}(${valuePropString} != null && ${valuePropString}.AsQueryable().Intersect(${equalityTo}))`;
}

function SetLambdaInsertArgumentValues(
	tempLambdaInsertArgumentValues: any,
	relationType: RelationType,
	simpleValidation: HalfRelation
) {
	switch (relationType) {
		case RelationType.Agent:
			tempLambdaInsertArgumentValues[`agent.${GetCodeName(simpleValidation.agentProperty)}`] = {
				property: simpleValidation.agentProperty,
				model: simpleValidation.agent
			};
			break;
		case RelationType.Model:
			tempLambdaInsertArgumentValues[`model.${GetCodeName(simpleValidation.modelProperty)}`] = {
				property: simpleValidation.modelProperty,
				model: simpleValidation.model
			};
			break;
		case RelationType.Parent:
			tempLambdaInsertArgumentValues[`parent.${GetCodeName(simpleValidation.parentProperty)}`] = {
				property: simpleValidation.parentProperty,
				model: simpleValidation.parent
			};
			break;
		case RelationType.ModelOuput:
			tempLambdaInsertArgumentValues[
				`model_output.${GetCodeName(simpleValidation.modelOutputProperty || simpleValidation.modelProperty)}`
			] = {
				property: simpleValidation.modelOutputProperty || simpleValidation.modelProperty,
				model: simpleValidation.modelOutput || simpleValidation.model
			};
			break;
	}
}
function GetRelationTypeValuePropString(relationType: RelationType, simpleValidation: HalfRelation): string {
	let valuePropString: string = '';
	switch (relationType) {
		case RelationType.Agent:
			valuePropString = `agent.#{{"key":"agent.${GetCodeName(
				simpleValidation.agentProperty
			)}","type":"property","model":"agent"}}#`;
			break;
		case RelationType.Model:
			valuePropString = `model.#{{"key":"model.${GetCodeName(
				simpleValidation.modelProperty
			)}","type":"property","model":"model"}}#`;
			break;
		case RelationType.ModelOuput:
			valuePropString = `model_output.#{{"key":"model_output.${GetCodeName(
				simpleValidation.modelOutputProperty || simpleValidation.modelProperty
			)}","type":"property","model":"model_output"}}#`;
			break;
		case RelationType.Parent:
			valuePropString = `parent.#{{"key":"parent.${GetCodeName(
				simpleValidation.parentProperty
			)}","type":"property","model":"parent"}}#`;
			break;
	}
	return valuePropString;
}
function GenerateOneOf(valuePropString: string, oneOf: EnumerationConfig, tempLambdaInsertArgumentValues: any): string {
	let result: string = '';
	if (oneOf.enabled) {
		let enumeration = oneOf.enumerationType;
		tempLambdaInsertArgumentValues[GetJSCodeName(enumeration)] = { enumeration: enumeration };
		let enumertions: { id: string; value: string }[] = GetNodeProp(enumeration, NodeProperties.Enumeration) || [];
		let enum_set: string[] = [];
		oneOf.enumerations.forEach((eni: string) => {
			let enumProp = enumertions.find((e) => e.id == eni);
			if (enumProp) {
				tempLambdaInsertArgumentValues[`${GetJSCodeName(enumeration)}.${enumProp.value}`] = {
					enumeration,
					enumerationvalue: eni
				};
				enum_set.push(
					` #{{"key":"${GetJSCodeName(enumeration)}","type":"enumeration" }}#.#{{"key":"${GetJSCodeName(
						enumeration
					)}.${enumProp.value}","type":"enumerationvalue"}}#`
				);
			}
		});
		result = `(new List<string> { ${enum_set.join()} }).Contains(${valuePropString})`;
	}
	return result;
}
function GenerateCodePath(if_: BranchConfig) {
	let ifTrueCodeName = codeTypeWord(if_.name);
	return `await ${ifTrueCodeName}(model, agent, change, checkModel);`;
}
function GetCheckModelExistPart(relationType: RelationType, targetProperty: string, stretchClause: string) {
	let rel = relationType == RelationType.Agent ? 'agent' : 'fromModel';
	let getClause = ` (await arbiter#{{"key":"tomodel"}}#Static.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
		targetProperty
	)}","type":"property","model":"tomodel"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault()`;
	return ` var exists = false;
  #{{"key":"tomodel"}}# checkModel = ${stretchClause || getClause};
  exists  = checkModel != null;`;
}

function GenerateStretchMethods(
	config: AfterEffectRelations,
	tempLambdaInsertArgumentValues: any,
	arbiterModels: string[]
) {
	let result: string[] = [];

	if (config && config.isStrech && config.stretchPath) {
		let { name } = config.stretchPath;
		name = codeTypeWord(name);
		let steps = config.stretchPath.path
			.map((item: StretchPathItem, index: number) => {
				tempLambdaInsertArgumentValues[`stretch.${name}.${GetCodeName(item.model)}`] = {
					type: ReferenceInsertType.Model,
					[ReferenceInsertType.Model]: item.model
				};
				tempLambdaInsertArgumentValues[
					`stretch.${name}.${GetCodeName(item.model)}.${GetCodeName(item.property)}`
				] = {
					type: ReferenceInsertType.Property,
					[ReferenceInsertType.Property]: item.property,
					[ReferenceInsertType.Model]: item.model
				};
				if (!index) {
					arbiterModels.push(item.model);
					return `#{{"key":"stretch.${name}.${GetCodeName(
						item.model
					)}"}}# item_0 = (await arbiter#{{"key":"stretch.${name}.${GetCodeName(
						item.model
					)}"}}#Static.GetBy(v => v.#{{"key":"stretch.${name}.${GetCodeName(item.model)}.${GetCodeName(
						item.property
					)}","model":"stretch.${name}.${GetCodeName(
						item.model
					)}","type":"property"}}# == value)).FirstOrDefault();`;
				} else {
					if (config.stretchPath) {
						let previousModel = config.stretchPath.path[index - 1].model;
						let fromProperty = item.fromProperty;
						tempLambdaInsertArgumentValues[`stretch.${name}.${GetCodeName(previousModel)}`] = {
							type: ReferenceInsertType.Model,
							[ReferenceInsertType.Model]: previousModel
						};
						tempLambdaInsertArgumentValues[
							`stretch.${name}.${GetCodeName(previousModel)}.${GetCodeName(fromProperty)}`
						] = {
							type: ReferenceInsertType.Property,
							[ReferenceInsertType.Model]: previousModel,
							[ReferenceInsertType.Property]: fromProperty
						};
						arbiterModels.push(item.model);
						return `#{{"key":"stretch.${name}.${GetCodeName(item.model)}"}}# item_${index} = item_${index -
							1} != null ? (await arbiter#{{"key":"stretch.${name}.${GetCodeName(
							item.model
						)}"}}#Static.GetBy(v => v.#{{"key":"stretch.${name}.${GetCodeName(item.model)}.${GetCodeName(
							item.property
						)}","model":"stretch.${name}.${GetCodeName(item.model)}","type":"property"}}# == item_${index -
							1}.#{{"key":"stretch.${name}.${GetCodeName(previousModel)}.${GetCodeName(
							fromProperty
						)}","model":"stretch.${name}.${GetCodeName(
							previousModel
						)}","type":"property"}}#)).FirstOrDefault() : null;`;
					}
				}
				return false;
			})
			.filter((v: any) => v);

		tempLambdaInsertArgumentValues[
			`stretch.${name}.${GetCodeName(
				config.stretchPath.path[config.stretchPath.path.length - 1].model
			)}.${GetCodeName(config.stretchPath.path[config.stretchPath.path.length - 1].property)}`
		] = {
			[ReferenceInsertType.Property]: config.stretchPath.path[config.stretchPath.path.length - 1].property,
			[ReferenceInsertType.Model]: config.stretchPath.path[config.stretchPath.path.length - 1].model,
			type: ReferenceInsertType.Property
		};
		tempLambdaInsertArgumentValues[`stretch.${name}.${GetCodeName(config.stretchPath.path[0].model)}`] = {
			[ReferenceInsertType.Model]: config.stretchPath.path[0].model,
			type: ReferenceInsertType.Model
		};

		let _prop = config.relationType == RelationType.Agent ? config.agentProperty : config.modelProperty;
		let _model = GetPropertyModel(_prop);
		if (_model) {
			tempLambdaInsertArgumentValues[`stretch.type.${name}.${GetCodeName(_model)}.${GetCodeName(_prop)}`] = {
				[ReferenceInsertType.PropertyType]: _prop,
				[ReferenceInsertType.Model]: _model.id,
				type: ReferenceInsertType.PropertyType
			};
			tempLambdaInsertArgumentValues[`stretch.${name}.${GetCodeName(_model)}.${GetCodeName(_prop)}`] = {
				[ReferenceInsertType.Property]: _prop,
				[ReferenceInsertType.Model]: _model.id,
				type: ReferenceInsertType.Property
			};
			tempLambdaInsertArgumentValues[`stretch.${name}.${GetCodeName(_model)}`] = {
				[ReferenceInsertType.Model]: _model.id,
				type: ReferenceInsertType.Model
			};
		}

		let output = `#{{"key":"stretch.${name}.${GetCodeName(
			config.stretchPath.path[config.stretchPath.path.length - 1].model
		)}"}}#`;

		let fromPropertyType = `#{{"type":"propertyType","key":"stretch.type.${name}.${GetCodeName(
			_model ? _model.id : ''
		)}.${GetCodeName(_prop)}","model":"stretch.${name}.${GetCodeName(_model ? _model.id : '')}"}}#`;
		let func = `public static async Task<${output}> ${codeTypeWord(
			config.stretchPath.name
		)}(${fromPropertyType} value) {
      ${steps.join(NEW_LINE)}
      return item_${config.stretchPath.path.length - 1};
    }`;
		result.push(func);
	}

	return result;
}
function GenerateBranchMethods(
	dataChainConfigOptions: DataChainConfiguration,
	routes: AfterEffect[],
	methodDescriptions: MountingDescription[]
): string[] {
	let result: string[] = [];
	let { checkExistence } = dataChainConfigOptions;
	if (checkExistence) {
		let { ifFalse, ifTrue } = checkExistence;
		if (ifFalse.enabled) {
			GenerateIfBranch(ifFalse, routes, result, methodDescriptions);
		}
		if (ifTrue.enabled) {
			GenerateIfBranch(ifTrue, routes, result, methodDescriptions);
		}
	}
	return result;
}

function GenerateIfBranch(
	ifBranch: BranchConfig,
	routes: AfterEffect[],
	result: string[],
	methods: MountingDescription[]
) {
	let { routeConfig } = ifBranch.dataChainOptions;
	if (routeConfig) {
		let funcName = codeTypeWord(ifBranch.name);
		let ifAfterEffect = ', #{{"key":"tomodel"}}# checkModel';
		let route = routes.find((route: AfterEffect) => {
			return routeConfig && route.id === routeConfig.targetId;
		});
		if (route) {
			let mountDescription = methods.find((v) => route && v.id === route.target);
			if (mountDescription) {
				let method = CreateStreamProcessFunc(mountDescription, funcName, ifAfterEffect, route, {
					updatePath: true
				});
				result.push(method);
			}
		}
	}
}
function GeneratePushChange(args: {
	afterEffect: AfterEffect;
	methods: MountingDescription[];
	name: string;
}): string[] {
	let result: string[] = [];

	let { afterEffect, name, methods } = args;

	let currentDescription: MountingDescription | undefined = (methods || []).find((method: MountingDescription) => {
		return afterEffect && method.id === afterEffect.target;
	});
	if (currentDescription) {
		result.push(
			CreateStreamProcessFunc(
				currentDescription,
				`_${codeTypeWord(name)}`,
				', #{{"key":"tomodel"}}# checkModel',
				afterEffect,
				{ updatePath: false }
			)
		);
	}
	return result;
}

function CreateStreamProcessFunc(
	mountDescription: MountingDescription,
	funcName: any,
	ifAfterEffect: string,
	route: AfterEffect,
	ops: { updatePath: boolean }
) {
	let methodType = 'Create';
	if (mountDescription) {
		methodType = mountDescription.viewType;
	}
	let updatePath = ops.updatePath
		? `  #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.UpdatePath(parameters, AfterEffectChains.{{after_effect_parent}}.${codeTypeWord(
				route.name
			)});`
		: '';
	let method = `
        public static async Task ${funcName}(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change${ifAfterEffect}) {
          var value = checkModel;
          var parameters = #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.${methodType}(agent, value, FunctionName.#{{"key":"${codeTypeWord(
		route.name
	)}","type":"method"}}#);

            ${updatePath}

          await StreamProcess.#{{"key":"tomodel"}}#_#{{"key":"agent"}}#(parameters, false);
        }
      `;
	return method;
}

function checkExistenceFunction(
	checkExistence: CheckExistenceConfig,
	relationType: RelationType,
	skipSettings: SkipSettings,
	checking_existence: string,
	targetProperty: string,
	onTrue: string,
	returnSetting: ReturnSettingConfig,
	type: DataChainType
) {
	let { ifTrue, ifFalse, isStrech, stretchPath } = checkExistence;
	let stretchClause = '';
	let rel = relationType == RelationType.Agent ? 'agent' : 'model';

	if (isStrech && stretchPath) {
		stretchClause = `await ${codeTypeWord(
			stretchPath.name
		)}(${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#);`;
	}
	if (type === DataChainType.AfterEffect) {
		let trueCodeStatement = '';
		if (ifTrue.enabled) {
			trueCodeStatement = GenerateCodePath(ifTrue);
		}
		let falseCodeStatement = '';
		if (ifFalse.enabled) {
			falseCodeStatement = GenerateCodePath(ifFalse);
		}
		if (falseCodeStatement || trueCodeStatement) {
			let checkModelExistsPart = GetCheckModelExistPart(relationType, targetProperty, stretchClause);
			checking_existence = `
      ${checkModelExistsPart}
      if(exists){
        ${trueCodeStatement}
      }
      else {
        ${falseCodeStatement}
      }
      `;
		} else {
			switch (relationType) {
				case RelationType.Agent:
				case RelationType.Model:
					let ifvalue = skipSettings === SkipSettings.SkipIfFlase ? '!' : '';
					if (skipSettings !== SkipSettings.DontSkip) {
						let rel = relationType == RelationType.Agent ? 'agent' : 'fromModel';
						let getClause = ` (await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
							targetProperty
						)}","type":"property","model":"tomodel"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault()`;
						checking_existence = `
          var exists = false;
          #{{"key":"tomodel"}}# checkModel = ${stretchClause || getClause};
          exists  = checkModel != null;
         ${(onTrue && ifvalue) || skipSettings === SkipSettings.SkipIfFlase
				? ` if(${ifvalue}exists) {
            ${onTrue || 'return'};
          }
          #{{"key":"tomodel"}}# value = checkModel;`
				: ''}
        `;
					} else if (returnSetting.enabled) {
						let getModelClause = `(await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
							targetProperty
						)}","type":"property","model":"model"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();`;
						checking_existence = `
          var exists = false;
          #{{"key":"tomodel"}}# checkModel = ${stretchClause || getModelClause}
          exists  = checkModel != null;
          ${onTrue && ifvalue
				? ` if(${ifvalue}exists) {
                ${onTrue || 'return'};
              }
              #{{"key":"tomodel"}}# value = checkModel;`
				: ''}
        `;
					}

					break;
			}
		}
	} else {
		switch (relationType) {
			case RelationType.Agent:
			case RelationType.Model:
				let ifvalue = skipSettings === SkipSettings.SkipIfFlase ? '!' : '';
				if (skipSettings !== SkipSettings.DontSkip) {
					let rel = relationType == RelationType.Agent ? 'agent' : 'fromModel';
					checking_existence = `
          var exists = false;
          var checkModel = (await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetJSCodeName(
				targetProperty
			)}","type":"property","model":"model"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();
          exists  = checkModel != null;
          if(${ifvalue}exists) {
            ${onTrue || 'return'};
          }
            var value = checkModel;
        `;
				} else if (returnSetting.enabled) {
					let rel = relationType == RelationType.Agent ? 'agent' : 'model';
					checking_existence = `
          var exists = false;
          var checkModel = (await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetJSCodeName(
				targetProperty
			)}","type":"property","model":"model"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();
          exists  = checkModel != null;
          if(${ifvalue}exists) {
            ${onTrue || 'return'};
          }
          var value = checkModel;
        `;
				}
				break;
		}
	}
	return checking_existence;
}

function setLambdaProperties(
	tempLambdaInsertArgumentValues: any,
	agentProperty: string,
	modelProperty: string,
	targetProperty: string,
	ops: { from: any; to: any },
	modelOutputProperty: string,
	modelOutput: string,
	relationsConfig: AfterEffectRelations
) {
	let agent = agentProperty ? GetPropertyModel(agentProperty) : null;
	let model = modelProperty ? GetPropertyModel(modelProperty) : null;

	tempLambdaInsertArgumentValues['agent.prop'] = {
		property: agentProperty,
		model: agent ? agent.id : null,
		type: ReferenceInsertType.Property
	};
	if (agent) {
		tempLambdaInsertArgumentValues['agent'] = {
			model: agent ? agent.id : null,
			type: ReferenceInsertType.Model
		};
	}
	tempLambdaInsertArgumentValues['model.prop'] = {
		property: modelProperty,
		model: model ? model.id : null,
		type: ReferenceInsertType.Property
	};
	if (relationsConfig && relationsConfig.parentProperty) {
		tempLambdaInsertArgumentValues['parent.prop'] = {
			property: relationsConfig.parentProperty,
			model: relationsConfig.parent,
			type: ReferenceInsertType.Property
		};
	}
	if (relationsConfig && relationsConfig.parent) {
		tempLambdaInsertArgumentValues['parent'] = {
			model: relationsConfig.parent,
			type: ReferenceInsertType.Model
		};
	}
	if (modelOutputProperty) {
		tempLambdaInsertArgumentValues['model_output.prop'] = {
			property: modelOutputProperty,
			model: modelOutput,
			type: ReferenceInsertType.Property
		};
	}
	if (modelOutput) {
		tempLambdaInsertArgumentValues['model_output'] = {
			model: modelOutput,
			type: ReferenceInsertType.Model
		};
	}
	if (model) {
		tempLambdaInsertArgumentValues['model'] = {
			model: model ? model.id : null,
			type: ReferenceInsertType.Model
		};
	}

	if (targetProperty && ops && ops.to && ops.to.properties) {
		let target = targetProperty ? GetPropertyModel(targetProperty) : null;
		tempLambdaInsertArgumentValues[`tomodel.prop`] = {
			property: target && target.id ? target.id : null,
			model: ops.to.properties.model,
			type: ReferenceInsertType.Property
		};
		tempLambdaInsertArgumentValues[`tomodel`] = {
			model: ops.to.properties.model,
			type: ReferenceInsertType.Model
		};
	}
}

function CompareEnumerationFunc(compareEnumeration: CompareEnumeration, tempLambdaInsertArgumentValues: any) {
	let compare_enumeration = '';
	if (compareEnumeration) {
		let {
			enabled,
			relationType,
			agentProperty,
			modelProperty,
			parentProperty,
			enumeration,
			value
		} = compareEnumeration;
		if (enabled) {
			let prop_string: string = '';
			let relative_type_name = '';
			switch (relationType) {
				case RelationType.Agent:
					prop_string = agentProperty;
					relative_type_name = 'agent';
					break;
				case RelationType.Model:
					prop_string = modelProperty;
					relative_type_name = 'model';
					break;
				case RelationType.Parent:
					prop_string = parentProperty;
					relative_type_name = 'parent';
					break;
			}
			let enumNode = GetNodeById(enumeration);
			let enumprops = GetNodeProp(enumNode, NodeProperties.Enumeration) || [];
			let propName = GetCodeName(prop_string);
			let enumProp: { value: string; id: string } = enumprops.find((v: { id: string }) => v.id === value);
			tempLambdaInsertArgumentValues[GetJSCodeName(enumeration)] = { enumeration: enumeration };
			tempLambdaInsertArgumentValues[`${GetJSCodeName(enumeration)}.${enumProp.value}`] = {
				enumeration,
				enumerationvalue: value
			};
			tempLambdaInsertArgumentValues[`${relative_type_name}.${propName}`] = { property: prop_string };
			compare_enumeration = `if(${relative_type_name}.#{{"key":"${relative_type_name}.${propName}","type":"property","model":"${relative_type_name}"}}# != #{{"key":"${GetJSCodeName(
				enumeration
			)}","type":"enumeration" }}#.#{{"key":"${GetJSCodeName(
				enumeration
			)}.${enumProp.value}","type":"enumerationvalue"}}#) {
          return false;
        }`;
		}
	}
	return compare_enumeration;
}
