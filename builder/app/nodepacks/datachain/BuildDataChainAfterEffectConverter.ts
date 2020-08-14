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
	EnumerationConfig
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
	GetNodeTitle
} from '../../actions/uiactions';
import {
	NodeProperties,
	NodeTypes,
	NEW_LINE,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages
} from '../../constants/nodetypes';
import { DataChainFunctionKeys } from '../../constants/datachain';
import { codeTypeWord, GetNodeProp } from '../../methods/graph_methods';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to?: MethodDescription;
	dataChain?: string;
	afterEffectParent?: string;
	afterEffectChild?: string;
	name: string;
	routes: AfterEffect[];
	methods: MountingDescription[];
	afterEffectOptions: DataChainConfiguration;
	type: DataChainType;
}
export enum DataChainType {
	Validation = 'Validation',
	Permission = 'Permission',
	Execution = 'Execution',
	AfterEffect = 'AfterEffect'
}
export default function BuildDataChainAfterEffectConverter(args: AfterEffectConvertArgs, callback: Function) {
	let {
		from,
		to,
		type,
		dataChain,
		afterEffectOptions: dataChainConfigOptions,
		routes,
		methods,
		afterEffectParent,
		afterEffectChild,
		name
	} = args;
	let checking_existence: string = '';
	let get_existing: string = ''; //var value = #{{"key":"model"}}.Create()
	let set_properties: string = '';
	let compare_enumeration: string = '';
	let branchMethods: string[] = [];
	let guts: string = '';
	let copy_config: string = '';
	let outputType: string = '';
	let simplevalidation: string = '';
	let can_complete = false;
	let target_property = '';
	let tempLambdaInsertArgumentValues: any = {};
	tempLambdaInsertArgumentValues.model = { model: from.properties.model };
	tempLambdaInsertArgumentValues.agent = { model: from.properties.agent };
	if (dataChainConfigOptions) {
		let { compareEnumeration, compareEnumerations, copyConfig } = dataChainConfigOptions;
		if (compareEnumeration) {
			compare_enumeration = CompareEnumerationFunc(compareEnumeration, tempLambdaInsertArgumentValues);
		}
		if (compareEnumerations) {
			compare_enumeration = compareEnumerations
				.map((compareEnumeration: CompareEnumeration) => {
					return CompareEnumerationFunc(compareEnumeration, tempLambdaInsertArgumentValues);
				})
				.join(NEW_LINE);
		}
		if (copyConfig) {
			let { agentProperty, modelProperty, relationType, targetProperty } = copyConfig;
			let props = agentProperty;
			let relProp = 'agent';
			if (relationType === RelationType.Model) {
				props = modelProperty;
				relProp = 'model';
			}
			target_property = targetProperty;
			setLambdaProperties(tempLambdaInsertArgumentValues, agentProperty, modelProperty, targetProperty);
			let attributeType = GetNodeProp(props, NodeProperties.UIAttributeType);
			outputType = NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][attributeType];
			copy_config = `return ${relProp}.#{{"key":"${relProp}.${GetJSCodeName(
				props
			)}","type":"property","model":"${relProp}"}}#;`;
		}

		if (dataChainConfigOptions.checkExistence && dataChainConfigOptions.checkExistence.enabled) {
			let {
				relationType,
				modelProperty,
				agentProperty,
				targetProperty,
				skipSettings,
				returnSetting
			} = dataChainConfigOptions.checkExistence;
			tempLambdaInsertArgumentValues['agent.prop'] = { property: agentProperty };
			tempLambdaInsertArgumentValues['model.prop'] = { property: modelProperty };
			setLambdaProperties(tempLambdaInsertArgumentValues, agentProperty, modelProperty, targetProperty);

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

			branchMethods.push(...GenerateBranchMethods(dataChainConfigOptions, routes, methods));
		}
		if (dataChainConfigOptions.getExisting && dataChainConfigOptions.getExisting.enabled) {
			if (dataChainConfigOptions.checkExistence && dataChainConfigOptions.checkExistence.enabled) {
				get_existing = 'var value = checkModel.FirstOrDefault()';
			} else {
				let { relationType, modelProperty, agentProperty, targetProperty } = dataChainConfigOptions.getExisting;

				setLambdaProperties(tempLambdaInsertArgumentValues, agentProperty, modelProperty, targetProperty);

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
					tempLambdaInsertArgumentValues[`${model_to}.${GetJSCodeName(targetProperty)}`] = {
						property: targetProperty
					};
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
							let fromPropModel = relationType === RelationType.Agent ? 'agent' : 'fromModel';
							let keyname = `${fromPropModel}.${relationType === RelationType.Agent
								? GetJSCodeName(agentProperty)
								: GetJSCodeName(modelProperty)}`;
							tempLambdaInsertArgumentValues[keyname] = {
								model: relationType === RelationType.Agent ? agentProperty : modelProperty
							};
							return `${prop_string} = ${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${fromPropModel}"}}#;`;
					}
				})
				.join(NEW_LINE);
		}
		if (dataChainConfigOptions.simpleValidation) {
			simplevalidation = GenerateSimpleValidations(dataChainConfigOptions, tempLambdaInsertArgumentValues);
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
        var toArbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();`;
			}
			from_parameter_template = `
      public static async Task<bool> Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change_parameter)
      {
        Func<#{{"key":"model"}}#, #{{"key":"agent"}}#, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#, Task<bool>> func = async (#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change_parameter) => {
          var agentArbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var modelArbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();
          ${to_arbiter}
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
		'bool'}> Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change)
    {
        Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#, Task<${outputType ||
			'bool'}>> func = async (#{{"key":"agent"}}# agent, #{{"key":"model"}}# model, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change) => {
            {{copy_config}}
        };

        return await func(model, agent, change);
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
          var agentArbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var modelArbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();
          var toArbiter#{{"key":"tomodel"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"tomodel"}}#>>();
          {{checking_existence}}

          // build model value here.
          {{copy_config}}
          {{set_properties}}
          {{get_existing}}

       };

       await func(agent, model, change);
      }
      ${branchMethods.join(NEW_LINE)}
  `;
			break;
	}

	from_parameter_template = bindTemplate(from_parameter_template, {
		checking_existence,
		get_existing,
		compare_enumeration,
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
			updateComponentProperty(dataChain, NodeProperties.LambdaInsertArguments, {
				...tempLambdaInsertArgumentValues,
				...lambdaInsertArgumentValues
			});
			updateComponentProperty(dataChain, NodeProperties.Lambda, from_parameter_template);
			updateComponentProperty(dataChain, NodeProperties.DataChainTypeCategory, type);
			updateComponentProperty(dataChain, NodeProperties.CompleteFunction, true);
			updateComponentProperty(dataChain, NodeProperties.UIText, name);
			updateComponentProperty(
				dataChain,
				NodeProperties.AfterEffectKey,
				`AfterEffectChains.${codeTypeWord(afterEffectParent)}.${codeTypeWord(afterEffectChild)}`
			);
			updateComponentProperty(dataChain, NodeProperties.TargetProperty, target_property);
		} else if (methodFunction) {
			graphOperation(
				CreateNewNode(
					{
						[NodeProperties.UIText]: name,
						[NodeProperties.NODEType]: NodeTypes.DataChain,
						[NodeProperties.CS]: true,
						[NodeProperties.CSEntryPoint]: true,
						[NodeProperties.DataChainTypeCategory]: type,
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
function GenerateSimpleValidations(
	dataChainConfigOptions: DataChainConfiguration,
	tempLambdaInsertArgumentValues: any
): string {
	let result: string = '';
	let valuePropString = '';

	let { simpleValidations } = dataChainConfigOptions;
	let checks: string[] = [];
	if (simpleValidations) {
		simpleValidations.forEach((simpleValidation) => {
			let { relationType } = simpleValidation;
			let temp = '';
			switch (relationType) {
				case RelationType.Agent:
					temp = 'agent';
					valuePropString = `agent.#{{"key":"agent.${GetCodeName(
						simpleValidation.agentProperty
					)}","type":"property","model":"agent"}}#`;
					tempLambdaInsertArgumentValues[`agent.${GetCodeName(simpleValidation.agentProperty)}`] = {
						property: simpleValidation.agentProperty
					};
					break;
				case RelationType.Model:
					temp = 'model';
					tempLambdaInsertArgumentValues[`model.${GetCodeName(simpleValidation.modelProperty)}`] = {
						property: simpleValidation.modelProperty
					};
					valuePropString = `model.#{{"key":"model.${GetCodeName(
						simpleValidation.modelProperty
					)}","type":"property","model":"model"}}#`;
					break;
			}
			if (simpleValidation.oneOf && simpleValidation.oneOf.enabled) {
				let oneOf = GenerateOneOf(valuePropString, simpleValidation.oneOf, tempLambdaInsertArgumentValues);
				checks.push(oneOf);
			}
			if (simpleValidation.alphaOnlyWithSpaces && simpleValidation.alphaOnlyWithSpaces.enabled) {
				let oneOf = `await new AlphaOnlyWithSpacesAttribute().IsOk(${valuePropString});`;
				checks.push(oneOf);
			}
			if (simpleValidation.isNotNull && simpleValidation.isNotNull.enabled) {
				let oneOf = `await new IsNotNullAttribute().IsOk(${valuePropString});`;
				checks.push(oneOf);
			}
			if (simpleValidation.isNull && simpleValidation.isNull.enabled) {
				let oneOf = `await new IsNullAttribute().IsOk(${valuePropString});`;
				checks.push(oneOf);
			}
			if (simpleValidation.maxLength && simpleValidation.maxLength.enabled) {
				let oneOf = `await new MaxLengthAttribute(${simpleValidation.maxLength.value},${simpleValidation
					.maxLength.equal
					? 'true'
					: 'false'}).IsOk(${valuePropString});`;
				checks.push(oneOf);
			}
			if (simpleValidation.minLength && simpleValidation.minLength.enabled) {
				let oneOf = `await new MinLengthAttribute(${simpleValidation.minLength.value},${simpleValidation
					.maxLength.equal
					? 'true'
					: 'false'}).IsOk(${valuePropString});`;
				checks.push(oneOf);
			}
			// if (simpleValidation.) {
			// 	let oneOf = `await new MinLengthAttribute(${simpleValidation.minLength.value}).IsOk(${valuePropString});`;
			// 	checks.push(oneOf);
			// }
		});
	}
	result = checks
		.map((check: string, index: number) => {
			if (!index) return `var test_${index} = ${check};`;
			return `var test_${index} = test_${index - 1} && ${check};`;
		})
		.join(NEW_LINE);

	if (checks.length)
		return `${result}
    if(!test_${checks.length - 1}) {
      return false;
    }
  `;
	return '';
}
function GenerateOneOf(valuePropString: string, oneOf: EnumerationConfig, tempLambdaInsertArgumentValues: any): string {
	let result: string = '';
	if (oneOf.enabled) {
		oneOf.enumerationType;
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
				enum_set.push(` #{{"key":"${GetJSCodeName(
					enumeration
				)}","type":"enumeration" }}#.#{{"key":"${GetJSCodeName(
					enumeration
				)}.${enumProp.value}","type":"enumerationvalue"}}#`);
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
function GetCheckModelExistPart(relationType: RelationType, targetProperty: string) {
	let rel = relationType == RelationType.Agent ? 'agent' : 'fromModel';
	return ` var exists = false;
  var checkModel = (await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
		targetProperty
	)}","type":"property","model":"tomodel"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();
  exists  = checkModel != null;`;
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
			let methodType = 'Create';
			if (mountDescription) {
				methodType = mountDescription.viewType;
			}
			let method = `
        public static async Task ${funcName}(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change${ifAfterEffect}) {
          var value = checkModel;
          var parameters = #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.${methodType}(agent, value, FunctionName.#{{"key":"${codeTypeWord(
				route.name
			)}","type":"method"}}#);

          #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.UpdatePath(parameters, AfterEffectChains.{{after_effect_parent}}.${codeTypeWord(
				route.name
			)});
          await StreamProcess.#{{"key":"tomodel"}}#_#{{"key":"agent"}}#(parameters, false);
        }
      `;

			result.push(method);
		}
	}
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
	let { ifTrue, ifFalse } = checkExistence;

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
			let checkModelExistsPart = GetCheckModelExistPart(relationType, targetProperty);
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
						checking_existence = `
          var exists = false;
          var checkModel = (await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
				targetProperty
			)}","type":"property","model":"tomodel"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();
          exists  = checkModel != null;
         ${onTrue && ifvalue
				? ` if(${ifvalue}exists) {
            ${onTrue || 'return'};
          }`
				: ''}
        `;
					} else if (returnSetting.enabled) {
						let rel = relationType == RelationType.Agent ? 'agent' : 'model';
						checking_existence = `
          var exists = false;
          var checkModel = (await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
				targetProperty
			)}","type":"property","model":"model"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();
          exists  = checkModel != null;
          ${onTrue && ifvalue
				? ` if(${ifvalue}exists) {
                ${onTrue || 'return'};
              }`
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
	targetProperty: string
) {
	tempLambdaInsertArgumentValues['agent.prop'] = tempLambdaInsertArgumentValues['agent.prop'] || {
		property: agentProperty
	};
	tempLambdaInsertArgumentValues['model.prop'] = tempLambdaInsertArgumentValues['model.prop'] || {
		property: modelProperty
	};
	if (targetProperty)
		tempLambdaInsertArgumentValues[`model.${GetJSCodeName(targetProperty)}`] = {
			property: targetProperty
		};
}

function CompareEnumerationFunc(compareEnumeration: CompareEnumeration, tempLambdaInsertArgumentValues: any) {
	let compare_enumeration = '';
	if (compareEnumeration) {
		let { enabled, relationType, agentProperty, modelProperty, enumeration, value } = compareEnumeration;
		if (enabled) {
			let prop_string: string;
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
