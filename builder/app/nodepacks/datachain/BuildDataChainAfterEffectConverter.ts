import {
	MethodDescription,
	DataChainConfiguration,
	RelationType,
	SkipSettings,
	SetProperty,
	SetPropertyType,
	ReturnSetting
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
import { NodeProperties, NodeTypes, NEW_LINE } from '../../constants/nodetypes';
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
	type?: DataChainType;
}
export enum DataChainType {
	Validation = 'Validation',
	AfterEffect = 'AfterEffect'
}
export default function BuildDataChainAfterEffectConverter(args: AfterEffectConvertArgs, callback: Function) {
	let { from, to, type, dataChain, afterEffectOptions, afterEffectParent, afterEffectChild, name } = args;
	let checking_existence: string = '';
	let get_existing: string = '#{{"key":"tomodel"}}.Create()';
	let set_properties: string = '';
	let guts: string = '';
	let can_complete = false;
	let tempLambdaInsertArgumentValues: any = {};
	tempLambdaInsertArgumentValues.model = { model: from.properties.model };
	tempLambdaInsertArgumentValues.agent = { model: from.properties.agent };
	if (afterEffectOptions) {
		if (afterEffectOptions.checkExistence && afterEffectOptions.checkExistence.enabled) {
			let {
				relationType,
				modelProperty,
				agentProperty,
				targetProperty,
				skipSettings,
				returnSetting
			} = afterEffectOptions.checkExistence;
			tempLambdaInsertArgumentValues['agent.prop'] = { property: agentProperty };
			tempLambdaInsertArgumentValues['model.prop'] = { property: modelProperty };
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
          exists  = checkModel.Any();
          if(${ifvalue}exists) {
            ${onTrue || 'return'};
          }
          ${onFalse}
        `;
					} else if (returnSetting.enabled) {
						let rel = relationType == RelationType.Agent ? 'agent' : 'model';
						checking_existence = `
          var exists = false;
          var checkModel = (await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetJSCodeName(
				targetProperty
			)}","type":"property","model":"model"}}# == ${rel}.#{{"key":"${rel}.prop","type":"property","model":"${rel}"}}#)).FirstOrDefault();
          exists  = checkModel.Any();
          if(${ifvalue}exists) {
            ${onTrue || 'return'};
          }
          ${onFalse}
        `;
					}
					break;
			}
		}
		if (afterEffectOptions.getExisting && afterEffectOptions.getExisting.enabled) {
			if (afterEffectOptions.checkExistence && afterEffectOptions.checkExistence.enabled) {
				get_existing = 'checkModel.FirstOrDefault()';
			} else {
				let { relationType, modelProperty, agentProperty, targetProperty } = afterEffectOptions.getExisting;

				tempLambdaInsertArgumentValues['agent.prop'] = tempLambdaInsertArgumentValues['agent.prop'] || {
					property: agentProperty
				};
				tempLambdaInsertArgumentValues['model.prop'] = tempLambdaInsertArgumentValues['model.prop'] || {
					property: modelProperty
				};

				switch (relationType) {
					case RelationType.Model:
					case RelationType.Agent:
						get_existing = `(await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetJSCodeName(
							targetProperty
						)}","type":"property","model":"tomodel"}}# == ${relationType == RelationType.Agent
							? 'agent'
							: 'fromModel'}.#{{"key":"${relationType}.prop","type":"property","model":"${relationType}"}}#)).FirstOrDefault()`;
						break;
				}
			}
		}
		if (afterEffectOptions.setProperties && afterEffectOptions.setProperties.enabled) {
			set_properties = afterEffectOptions.setProperties.properties
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

					let prop_string = `value.#{{"key":"tomodel.${GetJSCodeName(
						targetProperty
					)}","type":"property","model":"tomodel"}}#`;
					tempLambdaInsertArgumentValues[`tomodel.${GetJSCodeName(targetProperty)}`] = {
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
							return `${prop_string} = ${stringValue ? `"${stringValue}"` : 'strin.Empty'};`;
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
	}
	let from_parameter_template = '';
	switch (type) {
		case DataChainType.Validation:
			if (from && from.functionType) {
				can_complete = true;
			}
			from_parameter_template = `
        Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"agent"}}#ChangeBy#{{"key":"model"}}#, Task<bool>> func = async (#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change_parameter) => {
          var arbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var arbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();

          {{checking_existence}}
          // build model value here.

          {{guts}}

          return true;
       };

       return await func(agent, model, change_parameter);
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
        Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"agent"}}#ChangeBy#{{"key":"model"}}#, Task> func = async (#{{"key":"agent"}}# agent, #{{"key":"model"}}# fromModel, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change) => {
          var arbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var arbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();
          var toArbiter#{{"key":"tomodel"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"tomodel"}}#>>();
          {{checking_existence}}
          var value = {{get_existing}};
          // build model value here.

          {{set_properties}}

          var parameters = #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.Create(agent, value, FunctionName.{{default_executor_function_name}});
          #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.UpdatePath(parameters, change, AfterEffectChains.{{after_effect_parent}}.{{after_effect_child}});
          await StreamProcess.#{{"key":"tomodel"}}#_#{{"key":"agent"}}#(parameters, false);
       };

       await func(agent, fromModel, change);
  `;
			break;
	}

	from_parameter_template = bindTemplate(from_parameter_template, {
		checking_existence,
		get_existing,
		set_properties,
		guts,
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
			updateComponentProperty(dataChain, NodeProperties.UIText, name);
		} else if (methodFunction) {
			graphOperation(
				CreateNewNode(
					{
						[NodeProperties.UIText]: name,
						[NodeProperties.NODEType]: NodeTypes.DataChain,
						[NodeProperties.CS]: true,
						[NodeProperties.CSEntryPoint]: true,
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
						[NodeProperties.LambdaInsertArguments]: lambdaInsertArgumentValues,
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
