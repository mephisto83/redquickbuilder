import {
	MethodDescription,
	AfterEffectDataChainConfiguration,
	RelationType,
	SkipSettings,
	AfterEffectSetProperty,
	SetPropertyType
} from '../../interface/methodprops';
import { FunctionMethodTypes, MethodFunctions, bindTemplate } from '../../constants/functiontypes';
import {
	CreateNewNode,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetCodeName,
	updateComponentProperty,
	GetNodeCode,
	GetJSCodeName,
	GetNodeById
} from '../../actions/uiactions';
import { NodeProperties, NodeTypes } from '../../constants/nodetypes';
import { DataChainFunctionKeys } from '../../constants/datachain';
import { updateNodeProperty, codeTypeWord, GetNodeProp } from '../../methods/graph_methods';
import AfterEffectSetupProperty from '../../components/aftereffectsetproperty';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to: MethodDescription;
	dataChain?: string;
	afterEffectParent: string;
	afterEffectChild: string;
	name: string;
	afterEffectOptions: AfterEffectDataChainConfiguration;
}
export default function BuildDataChainAfterEffectConverter(args: AfterEffectConvertArgs, callback: Function) {
	let { from, to, dataChain, afterEffectOptions, afterEffectParent, afterEffectChild, name } = args;
	let checking_existence: string = '';
	let get_existing: string = '#{{"key":"tomodel"}}.Create()';
	let set_properties: string = '';
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
				skipSettings
			} = afterEffectOptions.checkExistence;
			tempLambdaInsertArgumentValues['agent.prop'] = { property: agentProperty };
			tempLambdaInsertArgumentValues['model.prop'] = { property: modelProperty };
			switch (relationType) {
				case RelationType.Agent:
				case RelationType.Model:
					let ifvalue = skipSettings === SkipSettings.SkipIfFlase ? '!' : '';
					if (skipSettings !== SkipSettings.DontSkip) {
						checking_existence = `
          var exists = false;
          var checkModel = await arbiter#{{"key":"agent"}}#.GetBy(x => x.#{{"key":"agent.prop","type":"property","model":"${relationType}"}}#);
          exists  = checkModel.Any();
          if(${ifvalue}exists) {
            return;
          }
        `;
					}
					break;
			}
		}
		if (afterEffectOptions.getExisting && afterEffectOptions.getExisting.enabled) {
			if (afterEffectOptions.checkExistence && afterEffectOptions.checkExistence.enabled) {
				get_existing = 'checkModel.FirstOrDefault()';
			} else {
				let { relationType, modelProperty, agentProperty } = afterEffectOptions.getExisting;

				tempLambdaInsertArgumentValues['agent.prop'] = tempLambdaInsertArgumentValues['agent.prop'] || {
					property: agentProperty
				};
				tempLambdaInsertArgumentValues['model.prop'] = tempLambdaInsertArgumentValues['model.prop'] || {
					property: modelProperty
				};

				switch (relationType) {
					case RelationType.Model:
					case RelationType.Agent:
						get_existing = `(await arbiter#{{"key":"${relationType}"}}#.GetBy(v => v.#{{"key":"${relationType}.prop","type":"property","model":"${relationType}"}}#)).FirstOrDefault()`;
						break;
				}
			}
		}
		if (afterEffectOptions.setProperties && afterEffectOptions.setProperties.enabled) {
			afterEffectOptions.setProperties.properties.map((afterEffectSetupProperty: AfterEffectSetProperty) => {
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

				tempLambdaInsertArgumentValues['agent.prop'] = { property: agentProperty };
				tempLambdaInsertArgumentValues['model.prop'] = { property: modelProperty };
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
							(v: { value: string }) => v.value === enumerationValue
						);
						tempLambdaInsertArgumentValues[GetCodeName(enumeration)] = { enumeration: enumeration };
						tempLambdaInsertArgumentValues[`${GetCodeName(enumeration)}.${enumProp.value}`] = {
							enumerationvalue: enumerationValue
						};
						return `${prop_string} = #{{"key":"${GetCodeName(
							enumeration
						)}","type":"enumeration" }}#.#{{"key":"${GetCodeName(
							enumeration
						)}.${enumProp.value}","type":"enumerationvalue"}}#;`;
					case SetPropertyType.String:
						// TODO: Escape string value for C#;
						return `${prop_string} = ${stringValue ? `"${stringValue}"` : 'strin.Empty'};`;
					case SetPropertyType.Boolean:
						return `${prop_string} = ${booleanValue};`;
					case SetPropertyType.Property:
						let fromPropModel = relationType === RelationType.Agent ? 'agent' : 'fromModel';
						return `${prop_string} = ${fromPropModel}.#{{"key":"${relationType === RelationType.Agent
							? 'agent'
							: 'fromModel'}.${relationType === RelationType.Agent
							? GetCodeName(agentProperty)
							: GetCodeName(modelProperty)}","type":"property","model":"${fromPropModel}"}}#;`;
				}
			});
		}
	}
	let from_parameter_template = `
        Func<#{{"key":"agent"}}#, #{{"key":"model"}}#, #{{"key":"agent"}}#ChangeBy#{{"key":"model"}}#, Task> func = async (#{{"key":"agent"}}# agent, #{{"key":"model"}}# fromModel, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change) => {
          var arbiter#{{"key":"agent"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"agent"}}#>>();
          var arbiter#{{"key":"model"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"model"}}#>>();
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

	from_parameter_template = bindTemplate(from_parameter_template, {
		checking_existence,
		get_existing,
		set_properties,
		from_model: `${GetCodeName(from.properties.model_output || from.properties.model || from.properties.agent)}`,
		agent_type: `${GetCodeName(from.properties.agent || from.properties.model_output || from.properties.model)}`,
		model: `${GetCodeName(to.properties.model || to.properties.agent)}`,
		after_effect_parent: codeTypeWord(afterEffectParent),
		after_effect_child: codeTypeWord(afterEffectChild)
	});
	if (to && to.functionType) {
		if (from && from.functionType) {
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
}
