import {
	MethodDescription,
	DataChainConfiguration,
	RelationType,
	SkipSettings,
	SetProperty,
	SetPropertyType,
	ReturnSetting,
	CompareEnumeration,
	ReturnSettingConfig
} from '../../interface/methodprops';
import { FunctionMethodTypes, MethodFunctions, bindTemplate } from '../../constants/functiontypes';
import {
	CreateNewNode,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty,
	GetJSCodeName,
	GetNodeById,
	GetCodeName
} from '../../actions/uiactions';
import {
	NodeProperties,
	NodeTypes,
	NEW_LINE,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages
} from '../../constants/nodetypes';
import { DataChainFunctionKeys } from '../../constants/datachain';
import { updateNodeProperty, codeTypeWord, GetNodeProp } from '../../methods/graph_methods';
import AfterEffectSetupProperty from '../../components/aftereffectsetproperty';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to?: MethodDescription;
	dataChain?: string;
	afterEffectParent?: string;
	afterEffectChild?: string;
	name: string;
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
		afterEffectParent,
		afterEffectChild,
		name
	} = args;
	let checking_existence: string = '';
	let get_existing: string = '#{{"key":"model"}}.Create()';
	let set_properties: string = '';
	let compare_enumeration: string = '';
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
			let onFalse = '';
			if (returnSetting && returnSetting.enabled) {
				switch (returnSetting.setting) {
					case ReturnSetting.ReturnFalse:
						onTrue = 'return false';
						onFalse = 'return true';
						break;
					case ReturnSetting.ReturnTrue:
						onTrue = 'return true';
						onFalse = 'return false';
						break;
				}
			}

			checking_existence = checkExistenceFunction(
				relationType,
				skipSettings,
				checking_existence,
				targetProperty,
				onTrue,
				returnSetting,
				type
			);
		}
		if (dataChainConfigOptions.getExisting && dataChainConfigOptions.getExisting.enabled) {
			if (dataChainConfigOptions.checkExistence && dataChainConfigOptions.checkExistence.enabled) {
				get_existing = 'checkModel.FirstOrDefault()';
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

					let prop_string = `value.#{{"key":"model.${GetJSCodeName(
						targetProperty
					)}","type":"property","model":"model"}}#`;
					tempLambdaInsertArgumentValues[`model.${GetJSCodeName(targetProperty)}`] = {
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
          var arbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var arbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();
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
      public static async Task<bool> Execute(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"agent"}}#ChangeBy#{{"key":"model"}}#)
      {
          Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#, Task> func = async (#{{"key":"agent"}}# agent, #{{"key":"model"}}# fromModel, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change) => {
          var arbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var arbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();
          var toArbiter#{{"key":"tomodel"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"tomodel"}}#>>();
          {{checking_existence}}
          var value = {{get_existing}};
          // build model value here.
          {{copy_config}}
          {{set_properties}}

          var parameters = #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#.Create(agent, value, FunctionName.{{default_executor_function_name}});
          #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}#.UpdatePath(parameters, change, AfterEffectChains.{{after_effect_parent}}.{{after_effect_child}});
          await StreamProcess.#{{"key":"model"}}#_#{{"key":"agent"}}#(parameters, false);
       };

       await func(agent, fromModel, change);
      }
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
						[NodeProperties.Lambda]: from_parameter_template
					},
					(res: Node) => {
						if (res && callback) callback(res);
					}
				)
			)(GetDispatchFunc(), GetStateFunc());
		}
	}
}
function checkExistenceFunction(
	relationType: RelationType,
	skipSettings: SkipSettings,
	checking_existence: string,
	targetProperty: string,
	onTrue: string,
	returnSetting: ReturnSettingConfig,
	type: DataChainType
) {
	if (type === DataChainType.AfterEffect) {
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
