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
	CopyEnumerationConfig,
	ValidationConfig,
	ValueOperationConfig,
	NextStepConfiguration,
	GetOrExistenceCheckConfig,
	ConnectionChainItem,
	SetPropertiesConfig
} from '../../interface/methodprops';
import { MethodFunctions, bindTemplate } from '../../constants/functiontypes';
import {
	CreateNewNode,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	updateComponentProperty,
	GetCodeName,
	GetNodeById,
	GetNodeTitle,
	GetPropertyModel,
	GetNodeByProperties,
	ensureRouteSource,
	IsModel,
	GetCurrentGraph
} from '../../actions/uiActions';
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
	NodesByType,
	GetNodeLinkedTo
} from '../../methods/graph_methods';
import { ReferenceInsertType } from '../../components/lambda/BuildLambda';
import { SimpleValidation, NodeType } from '../../components/titles';
import SimpleValidationComponent from '../../components/simplevalidationconfig';
import { equal } from 'assert';
import { Node, Graph } from '../../methods/graph_types';
import { LinkType } from '../../../app/constants/nodetypes';
import { stringify } from 'querystring';
import { NodePropertyTypes } from '../../actions/uiActions';

export interface AfterEffectConvertArgs {
	from: MethodDescription;
	to?: MethodDescription;
	dataChain?: string;
	afterEffectParent?: string;
	afterEffectChild?: string;
	afterEffect?: AfterEffect;
	override?: boolean;
	currentDescription?: MountingDescription;
	validationConfig?: ValidationConfig;
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
export const DataChainTypeParameters = {
	[DataChainType.Permission]: ['model', 'agent']
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
		validationConfig,
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
	let concat_collection: string = '';
	let concat_config: string = '';
	let outputType: string = '';
	let simplevalidation: string = '';
	let next_steps: string = '';
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
		let {
			compareEnumeration,
			compareEnumerations,
			concatenateString,
			concatenateCollection,
			copyConfig,
			copyEnumeration
		} = dataChainConfigOptions;
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
		if (concatenateString && concatenateString.enabled) {
			({ concat_config } = setConcatenateConfig({
				concatenateString,
				from,
				tempLambdaInsertArgumentValues,
				to,
				outputType
			}));
		}
		if (concatenateCollection && concatenateCollection.enabled) {
			({ concat_collection } = setConcatenateCollectionConfig({
				concatenateCollection,
				tempLambdaInsertArgumentValues
			}));
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

		if (afterEffect) {
			({ next_steps, staticMethods } = setupAfterEffect(
				afterEffect,
				staticMethods,
				methods,
				tempLambdaInsertArgumentValues
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
						get_existing = `(await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetCodeName(
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
					let prop_string = `value.#{{"key":"${model_to}.${GetCodeName(
						targetProperty
					)}","type":"property","model":"${model_to}"}}#`;
					let targetModel = GetPropertyModel(targetProperty);
					tempLambdaInsertArgumentValues[`${model_to}.${GetCodeName(targetProperty)}`] = {
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
							tempLambdaInsertArgumentValues[GetCodeName(enumeration)] = { enumeration: enumeration };
							tempLambdaInsertArgumentValues[`${GetCodeName(enumeration)}.${enumProp.value}`] = {
								enumeration,
								enumerationvalue: enumerationValue
							};
							return `${prop_string} = #{{"key":"${GetCodeName(
								enumeration
							)}","type":"enumeration" }}#.#{{"key":"${GetCodeName(
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
								? GetCodeName(agentProperty)
								: GetCodeName(modelProperty)}`;
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
			let parentParameter = '';
			if (from.properties.parent) {
				parentParameter = `, #{{"key":"parent"}}# parent = null`;
			}
			from_parameter_template = `
      public static async Task<bool> Execute(#{{"key":"model"}}# model = null, #{{"key":"agent"}}# agent = null${parentParameter})
      {

        Func<Task<bool>> func = async () => {
          // build model value here.

          {{compare_enumeration}}
          {{simplevalidation}}
          return true;
        };

        return await func();
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
      public static async Task<bool> Execute(#{{"key":"model"}}# model = null, #{{"key":"agent"}}# agent = null, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change_parameter = null)
      {
        Func<Task<bool>> func = async () => {

          {{checking_existence}}
          // build model value here.

          {{guts}}

          {{simplevalidation}}

          return true;
       };

       return await func();
      }
  `;
			break;
		case DataChainType.Execution:
			can_complete = true;
			from_parameter_template = `
      public static async Task Execute(#{{"key":"model"}}# model = null, #{{"key":"agent"}}# agent = null, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change = null, #{{"key":"result"}}# result = null)
      {
          Func<Task> func =
            async () => {
              {{simplevalidation}}
              {{copy_config}}
              {{concat_config}}
              {{concat_collection}}
          };

           await func();
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
    public static async Task<Func<#{{"key":"model"}}#, bool>> Filter(#{{"key":"agent"}}# agent = null, #{{"key":"model"}}# model = null${parent_input})
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
			can_complete = true;
			from_parameter_template = `
      public static async Task Execute(#{{"key":"model"}}# model = null, #{{"key":"agent"}}# agent = null, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change = null)
      {
          Func<Task> func = async () => {

          {{next_steps}}
      };

       await func();
      }
      ${staticMethods.join(NEW_LINE)}
  `;
			break;
		default:
			if (to && to.functionType) {
				if (from && from.functionType) {
					can_complete = true;
				}
			}
			from_parameter_template = `
      public static async Task Execute(#{{"key":"model"}}# model = null, #{{"key":"agent"}}# agent = null, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change = null)
      {
          Func<Task> func = async () => {

          {{checking_existence}}

          // build model value here.
          {{copy_config}}
          {{concat_config}}
          {{set_properties}}
          {{get_existing}}
          {{route_config}}
       };

       await func();
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
		next_steps,
		concat_collection,
		copy_config,
		concat_config,
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

		let autoCalculate = afterEffect
			? afterEffect.autoCalculate
			: false || validationConfig ? validationConfig.autoCalculate : false;
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
			updateComponentProperty(dataChain, NodeProperties.AutoCalculate, autoCalculate);
			updateComponentProperty(
				dataChain,
				NodeProperties.DataChainNameSpace,
				dataChainConfigOptions.namespaceConfig ? dataChainConfigOptions.namespaceConfig.space : null
			);
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
						[NodeProperties.AutoCalculate]: autoCalculate,
						[NodeProperties.CS]: true,
						[NodeProperties.CSEntryPoint]: true,
						[NodeProperties.DataChainTypeCategory]: type,
						[NodeProperties.ArbiterModels]: arbiterModels,
						[NodeProperties.CompleteFunction]: true,
						[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
						[NodeProperties.DataChainNameSpace]: dataChainConfigOptions.namespaceConfig
							? dataChainConfigOptions.namespaceConfig.space
							: null,
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
function setConcatenateCollectionConfig({
	concatenateCollection,
	tempLambdaInsertArgumentValues
}: {
	concatenateCollection: ValueOperationConfig;
	tempLambdaInsertArgumentValues: any;
}): { concat_collection: string } {
	let {
		parameters,
		relationType,
		agentProperty,
		modelProperty,
		modelOutputProperty,
		parentProperty
	} = concatenateCollection;
	let internalFunctionProp = ConvertToFunctionProp(relationType);

	setupLambdaInsertArgs(tempLambdaInsertArgumentValues, GetRelationProp(concatenateCollection), 'result');
	let init_section = `
  result.#{${captureTemplate(
		GetRelationProp(concatenateCollection),
		'result',
		GetRelationProp(concatenateCollection)
	)}}# = result.#{${captureTemplate(
		GetRelationProp(concatenateCollection),
		'result',
		GetRelationProp(concatenateCollection)
	)}}# ?? new List<string>{};
`;
	let resultSection = `result.#{${captureTemplate(
		GetRelationProp(concatenateCollection),
		'result',
		GetRelationProp(concatenateCollection)
	)}}#`;
	let concat_section = '';
	if (parameters) {
		concat_section = parameters
			.map((parameter) => {
				let { relationType, property } = parameter;
				let internalFunctionProp = ConvertToFunctionProp(relationType);
				setupLambdaInsertArgs(tempLambdaInsertArgumentValues, property, internalFunctionProp);
				return `
          if(${internalFunctionProp}.#{${captureTemplate(
					property,
					internalFunctionProp,
					property
				)}}# != null && ${internalFunctionProp}.#{${captureTemplate(
					property,
					internalFunctionProp,
					property
				)}}#.Any()) {
        ${resultSection} = ${resultSection}.Concat(${internalFunctionProp}.#{${captureTemplate(
					property,
					internalFunctionProp,
					property
				)}}#).ToList();
          }`;
			})
			.join(NEW_LINE);
	}

	return {
		concat_collection: `
    ${init_section}
   ${concat_section};`
	};
}

function setConcatenateConfig({
	concatenateString,
	from,
	tempLambdaInsertArgumentValues,
	to,
	outputType
}: {
	concatenateString: ValueOperationConfig;
	from: MethodDescription;
	tempLambdaInsertArgumentValues: any;
	to: MethodDescription | undefined;
	outputType: string;
}): { concat_config: string } {
	let {
		parameters,
		relationType,
		agentProperty,
		modelProperty,
		modelOutputProperty,
		parentProperty
	} = concatenateString;
	let internalFunctionProp = ConvertToFunctionProp(relationType);

	setupLambdaInsertArgs(tempLambdaInsertArgumentValues, GetRelationProp(concatenateString), 'result');
	let resultSection = `result.#{${captureTemplate(
		GetRelationProp(concatenateString),
		'result',
		GetRelationProp(concatenateString)
	)}}#`;
	let concat_section = '';
	if (parameters) {
		concat_section = parameters
			.map((parameter) => {
				let { relationType, property } = parameter;
				let internalFunctionProp = ConvertToFunctionProp(relationType);
				setupLambdaInsertArgs(tempLambdaInsertArgumentValues, property, internalFunctionProp);
				return `${internalFunctionProp}.#{${captureTemplate(property, internalFunctionProp, property)}}#`;
			})
			.join(concatenateString.with ? ` + "${concatenateString.with}" + ` : ' + ');
	}

	return { concat_config: `${resultSection} = ${concat_section};` };
}
function GetRelationProp(relation: HalfRelation) {
	switch (relation.relationType) {
		case RelationType.Agent:
			return relation.agentProperty;
		case RelationType.ModelOutput:
			return relation.modelOutputProperty;
		case RelationType.Model:
			return relation.modelProperty;
		case RelationType.Parent:
			return relation.parentProperty;
	}
}
function ConvertToFunctionProp(relationType: RelationType) {
	switch (relationType) {
		case RelationType.Agent:
			return 'agent';
		case RelationType.ModelOutput:
			return 'model_output';
		case RelationType.Model:
			return 'model';
		case RelationType.Parent:
			return 'parent';
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

	tempLambdaInsertArgumentValues[`result`] = {
		[ReferenceInsertType.Model]: from.properties.model ? from.properties.model : ''
	};
	let targetTemplate = '';
	let targetTemplate2 = '';
	if (targetProperty) {
		switch (GetNodeProp(targetProperty, NodeProperties.NODEType)) {
			case NodeTypes.Model:
				targetTemplate = `{"key":"result.${GetCodeName(targetProperty)}","type":"model"}`;
				targetTemplate2 = `{"key":"${relProp}.${GetCodeName(props)}","type":"model"}`;
				break;
			case NodeTypes.Property:
				targetTemplate = `{"key":"result.${GetCodeName(targetProperty)}","type":"property","model":"result"}`;
				targetTemplate2 = `{"key":"${relProp}.${GetCodeName(props)}","type":"property","model":"${relProp}"}`;
				break;
		}
	}
	copy_config = `result.#{${targetTemplate}}# = ${relProp}.#{${targetTemplate2}}#;`;
	return { target_property: targetProperty, outputType, copy_config };
}
function captureTemplate(targetProperty: string, relProp: string, props: string): string {
	let template: string | undefined;
	if (targetProperty) {
		switch (GetNodeProp(targetProperty, NodeProperties.NODEType)) {
			case NodeTypes.Model:
				template = `{"key":"${relProp}.${GetCodeName(props)}","type":"model"}`;
				break;
			case NodeTypes.Property:
				template = `{"key":"${relProp}.${GetCodeName(props)}","type":"property","model":"${relProp}"}`;
				break;
		}
	}
	return template || '';
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
	tempLambdaInsertArgumentValues[GetCodeName(enumeration)] = { enumeration: enumeration };
	let enumertions: { id: string; value: string }[] = GetNodeProp(enumeration, NodeProperties.Enumeration) || [];
	let enum_set: string = '';
	let enumProp = enumertions.find((e) => e.id == copyEnumeration.enumeration);
	if (enumProp) {
		tempLambdaInsertArgumentValues[`${GetCodeName(enumeration)}.${enumProp.value}`] = {
			enumeration,
			enumerationvalue: copyEnumeration.enumeration
		};
		copy_config = `return #{{"key":"${GetCodeName(enumeration)}","type":"enumeration" }}#.#{{"key":"${GetCodeName(
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
					false
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
			if (simpleValidation.date && simpleValidation.date.enabled) {
				checks.push({
					template: `${valuePropString} != default(DateTime)`,
					id: simpleValidation.id
				});
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
			if (simpleValidation.referencesExisting && simpleValidation.referencesExisting.enabled) {
				let relationType = simpleValidation.referencesExisting.relationType;
				let agentOrModel = '';
				switch (relationType) {
					case RelationType.Agent:
						agentOrModel = 'agent';
						break;
					case RelationType.Model:
						agentOrModel = 'model';
						break;
					case RelationType.Parent:
						agentOrModel = 'parent';
						break;
					case RelationType.ModelOutput:
						agentOrModel = 'model_output';
						break;
				}

				setupLambdaInsertArgs(
					tempLambdaInsertArgumentValues,
					simpleValidation.referencesExisting.model,
					agentOrModel
				);
				let classModelKey = 'unknown';
				if (simpleValidation.referencesExisting.modelProperty) {
					let modelType = GetNodeLinkedTo(GetCurrentGraph(), {
						id: simpleValidation.referencesExisting.modelProperty,
						link: LinkType.ModelTypeLink,
						componentType: NodeTypes.Model
					});
					if (modelType) {
						classModelKey = `class.${GetCodeName(modelType)}`;
						tempLambdaInsertArgumentValues[classModelKey] = {
							model: modelType.id
						};
					}
				}
				let refExists: any;
				switch (GetNodeProp(simpleValidation.referencesExisting.modelProperty, NodeProperties.NODEType)) {
					case NodeTypes.Model:
						if (!classModelKey) {
							classModelKey = classModelKey || `class.${GetCodeName(simpleValidation.referencesExisting.model)}`;
							tempLambdaInsertArgumentValues[classModelKey] = {
								model: simpleValidation.referencesExisting.model
							};
						}
						tempLambdaInsertArgumentValues[
							`${agentOrModel}.${GetCodeName(simpleValidation.referencesExisting.model)}`
						] = {
							model: simpleValidation.referencesExisting.model
						};
						refExists = `(await (RedStrapper.Resolve<IRedArbiter<#{{"key":"${classModelKey}"}}#>>()).Get<#{{"key":"${classModelKey}"}}#>(${agentOrModel}.#{{"key":"${agentOrModel}.${GetCodeName(
							simpleValidation.referencesExisting.model
						)}","type":"model"}}#)) != null`;
						checks.push({ template: refExists, id: simpleValidation.id });
						break;
					case NodeTypes.Property:
						tempLambdaInsertArgumentValues[
							`${classModelKey}.${GetCodeName(simpleValidation.referencesExisting.modelProperty)}`
						] = {
							property: simpleValidation.referencesExisting.modelProperty
						};
						tempLambdaInsertArgumentValues[
							`${classModelKey}.${GetCodeName(simpleValidation.referencesExisting.model)}`
						] = {
							model: simpleValidation.referencesExisting.model
						};
						refExists = `(await (RedStrapper.Resolve<IRedArbiter<#{{"key":"${classModelKey}"}}#>>()).Get<#{{"key":"${classModelKey}"}}#>(${agentOrModel}.#{{"key":"${classModelKey}.${GetCodeName(
							simpleValidation.referencesExisting.modelProperty
						)}","model":"${classModelKey}","type":"property"}}#)) != null`;
						checks.push({ template: refExists, id: simpleValidation.id });
						break;
				}
				// let refExists = `await (RedStrapper.Resolve<IRedArbiter<#{{"key":"${classModelKey}"}}#>>()).Get<#{{"key":"${classModelKey}"}}#>(${agentOrModel}.#{{"key":"${agentOrModel}.${GetCodeName(
				// 	simpleValidation.referencesExisting.modelProperty
				// )}","type":"model"}}#)`;
				// checks.push({ template: refExists, id: simpleValidation.id });
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
					model: targetModel ? targetModel.id : '',
					// property: ops.targetProperty,
					type: ReferenceInsertType.Model
				};
				if (!tempLambdaInsertArgumentValues[`result`])
					tempLambdaInsertArgumentValues[`result`] = tempLambdaInsertArgumentValues['model'];
			} else {
				if (ops.targetProperty && tempLambdaInsertArgumentValues[`result.${GetCodeName(ops.targetProperty)}`]) {
					tempLambdaInsertArgumentValues[`result.${GetCodeName(ops.targetProperty)}`] = {
						property: ops.targetProperty,
						model: targetModel ? targetModel.id : '',
						type: ReferenceInsertType.Property
					};
					if (tempLambdaInsertArgumentValues[`result`])
						tempLambdaInsertArgumentValues[`result`] = {
							model: targetModel ? targetModel.id : '',
							type: ReferenceInsertType.Model
						};
				}
			}
			returnStatement = '';
			// returnStatement = `return result.#{{"key":"result.${GetCodeName(
			// 	ops.targetProperty
			// )}","type":"property","model":"result"}}#`;
			break;
		default:
			returnStatement = 'return false';
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
						[...visitedNodes, ...unvisitedChildren.map((v) => v.id)].unique()
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

	return `${not
		? '!'
		: ''}(${valuePropString} != null && ${valuePropString}.AsQueryable().Intersect(${equalityTo}).Any())`;
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
		case RelationType.ModelOutput:
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
	let _path: string = simpleValidation.path || '';
	if (_path) {
		_path = `.${_path}`
	}
	switch (relationType) {
		case RelationType.Agent:
			valuePropString = `agent.#{{"key":"agent.${GetCodeName(
				simpleValidation.agentProperty
			)}","type":"property","model":"agent"}}#${_path}`;
			break;
		case RelationType.Model:
			valuePropString = `model.#{{"key":"model.${GetCodeName(
				simpleValidation.modelProperty
			)}","type":"property","model":"model"}}#${_path}`;
			break;
		case RelationType.ModelOutput:
			valuePropString = `model_output.#{{"key":"model_output.${GetCodeName(
				simpleValidation.modelOutputProperty || simpleValidation.modelProperty
			)}","type":"property","model":"model_output"}}#${_path}`;
			break;
		case RelationType.Parent:
			valuePropString = `parent.#{{"key":"parent.${GetCodeName(
				simpleValidation.parentProperty
			)}","type":"property","model":"parent"}}#${_path}`;
			break;
	}
	return valuePropString;
}
function GenerateOneOf(valuePropString: string, oneOf: EnumerationConfig, tempLambdaInsertArgumentValues: any): string {
	let result: string = '';
	if (oneOf.enabled) {
		let enumeration = oneOf.enumerationType;
		tempLambdaInsertArgumentValues[GetCodeName(enumeration)] = { enumeration: enumeration };
		let enumertions: { id: string; value: string }[] = GetNodeProp(enumeration, NodeProperties.Enumeration) || [];
		let enum_set: string[] = [];
		oneOf.enumerations.forEach((eni: string) => {
			let enumProp = enumertions.find((e) => e.id == eni);
			if (enumProp) {
				tempLambdaInsertArgumentValues[`${GetCodeName(enumeration)}.${enumProp.value}`] = {
					enumeration,
					enumerationvalue: eni
				};
				enum_set.push(
					` #{{"key":"${GetCodeName(enumeration)}","type":"enumeration" }}#.#{{"key":"${GetCodeName(
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
	let getClause = ` (await arbiter#{{"key":"tomodel"}}#Static.GetBy(v => v.#{{"key":"tomodel.${GetCodeName(
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
		if (ifFalse && ifFalse.enabled) {
			GenerateIfBranch(ifFalse, routes, result, methodDescriptions);
		}
		if (ifTrue && ifTrue.enabled) {
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
	afterEffect?: AfterEffect;
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
	route?: AfterEffect,
	ops?: { updatePath: boolean }
) {
	let methodType = 'Create';
	if (mountDescription) {
		methodType = mountDescription.viewType;
	}
	ops = ops || { updatePath: false };
	let updatePath = ops.updatePath
		? `  #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.UpdatePath(parameters, AfterEffectChains.{{after_effect_parent}}.${codeTypeWord(
			route ? route.name : ''
		)});`
		: '';
	let method = `
        public static async Task ${funcName}(#{{"key":"model"}}# model, #{{"key":"agent"}}# agent, #{{"key":"model"}}#ChangeBy#{{"key":"agent"}}# change${ifAfterEffect}) {
          var value = checkModel;
          var parameters = #{{"key":"tomodel"}}#ChangeBy#{{"key":"agent"}}#.${methodType}(agent, value, FunctionName.#{{"key":"${codeTypeWord(
		route ? route.name : ''
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
						let getClause = ` (await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetCodeName(
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
						let getModelClause = `(await toArbiter#{{"key":"tomodel"}}#.GetBy(v => v.#{{"key":"tomodel.${GetCodeName(
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
          var checkModel = (await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetCodeName(
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
          var checkModel = (await toArbiter#{{"key":"model"}}#.GetBy(v => v.#{{"key":"model.${GetCodeName(
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

	setupLambdaInsertArgs(tempLambdaInsertArgumentValues, agentProperty, 'agent');
	setupLambdaInsertArgs(tempLambdaInsertArgumentValues, modelProperty, 'model');
	setupLambdaInsertArgs(tempLambdaInsertArgumentValues, relationsConfig.parentProperty, 'parent');
	setupLambdaInsertArgs(tempLambdaInsertArgumentValues, modelOutputProperty, 'model_output');

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
	} else if (targetProperty) {
		setupLambdaInsertArgs(tempLambdaInsertArgumentValues, targetProperty, 'result');
	}
}
function setupLambdaInsertArgs(tempLambdaInsertArgumentValues: any, targetProperty: string, key: string) {
	switch (GetNodeProp(targetProperty, NodeProperties.NODEType)) {
		case NodeTypes.Model:
			tempLambdaInsertArgumentValues[`${key}.${GetCodeName(targetProperty)}`] = {
				[ReferenceInsertType.Model]: targetProperty,
				type: ReferenceInsertType.Model
			};
			break;
		case NodeTypes.Property:
			let targetModel = GetPropertyModel(targetProperty);
			tempLambdaInsertArgumentValues[`${key}.${GetCodeName(targetProperty)}`] = {
				[ReferenceInsertType.Property]: targetProperty,
				[ReferenceInsertType.Model]: targetModel ? targetModel.id : '',
				type: ReferenceInsertType.Property
			};
			tempLambdaInsertArgumentValues[`${key}`] = {
				[ReferenceInsertType.Model]: targetModel ? targetModel.id : '',
				type: ReferenceInsertType.Model
			};
			break;
	}
}
function setupLambdaModelArgs(tempLambdaInsertArgumentValues: any, model: string) {
	tempLambdaInsertArgumentValues[`${GetCodeName(model)}`] = {
		[ReferenceInsertType.Model]: model,
		type: ReferenceInsertType.Model
	};
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
			tempLambdaInsertArgumentValues[GetCodeName(enumeration)] = { enumeration: enumeration };
			tempLambdaInsertArgumentValues[`${GetCodeName(enumeration)}.${enumProp.value}`] = {
				enumeration,
				enumerationvalue: value
			};
			tempLambdaInsertArgumentValues[`${relative_type_name}.${propName}`] = { property: prop_string };
			compare_enumeration = `if(${relative_type_name}.#{{"key":"${relative_type_name}.${propName}","type":"property","model":"${relative_type_name}"}}# != #{{"key":"${GetCodeName(
				enumeration
			)}","type":"enumeration" }}#.#{{"key":"${GetCodeName(
				enumeration
			)}.${enumProp.value}","type":"enumerationvalue"}}#) {
          return false;
        }`;
		}
	}
	return compare_enumeration;
}

function setupAfterEffect(
	afterEffect: AfterEffect,
	staticMethods: string[],
	methods: MountingDescription[],
	tempLambdaInsertArgumentValues: any
): { next_steps: string; staticMethods: string[] } {
	let next_steps: string = '';

	if (afterEffect) {
		if (afterEffect.dataChainOptions && afterEffect.dataChainOptions.nextStepsConfiguration) {
			afterEffect.dataChainOptions.nextStepsConfiguration.steps.forEach((step: NextStepConfiguration) => {
				if (step.existenceCheck && step.existenceCheck.enabled) {
					let { result } = setupExistenceCheck(
						step.existenceCheck,
						staticMethods,
						tempLambdaInsertArgumentValues,
						OutputType.Existence
					);

					next_steps += `
          if(!(await ${result})) {
            return;
          }`;
				}

				let resultVariable = 'existing';
				if (step.getExisting && step.getExisting.enabled) {
					let { result } = setupExistenceCheck(
						step.getExisting,
						staticMethods,
						tempLambdaInsertArgumentValues,
						OutputType.Model
					);

					next_steps += `
          let ${resultVariable} = await ${result};
          `;
				}

				if (step.createNew && step.createNew.enabled) {
					let targetModel = '';
					if (
						afterEffect.dataChainOptions.nextStepsConfiguration &&
						afterEffect.dataChainOptions.nextStepsConfiguration.descriptionId
					) {
						let { descriptionId } = afterEffect.dataChainOptions.nextStepsConfiguration;
						methods.forEach((value: MountingDescription) => {
							if (value.id === descriptionId) {
								if (value.methodDescription) {
									let { model, parent } = value.methodDescription.properties;
									if (model) {
										targetModel = model;
									} else if (parent) {
										targetModel = parent;
									}

									tempLambdaInsertArgumentValues[`${GetCodeName(targetModel)}`] = {
										model: targetModel ? targetModel : '',
										type: ReferenceInsertType.Model
									};
								}
							}
						});
					}

					next_steps += `
            let ${resultVariable} =  #{{"key":"${GetCodeName(targetModel)}"}}#.GetDefaultModel();
            `;
				}

				if (
					step.constructModel &&
					step.constructModel.enabled &&
					step.constructModel.setProperties &&
					step.constructModel.setProperties.properties
				) {
					next_steps += `
          ${setupSetProperties(
						`${resultVariable}`,
						step.constructModel.setProperties,
						tempLambdaInsertArgumentValues
					)}`;
				}

				if (step.sendMessageToLakeConfig && step.sendMessageToLakeConfig.enabled) {
					let targetModel = '';
					let targetAgent = '';
					let functionName = '';
					if (
						afterEffect.dataChainOptions.nextStepsConfiguration &&
						afterEffect.dataChainOptions.nextStepsConfiguration.descriptionId
					) {
						let { descriptionId } = afterEffect.dataChainOptions.nextStepsConfiguration;
						methods.forEach((value: MountingDescription) => {
							if (value.id === descriptionId) {
								if (value.methodDescription) {
									functionName = value.name;
									let { model, parent, agent } = value.methodDescription.properties;
									if (model) {
										targetModel = model;
									} else if (parent) {
										targetModel = parent;
									}
									if (agent) {
										targetAgent = agent;
									}

									tempLambdaInsertArgumentValues[`${GetCodeName(targetAgent)}`] = {
										model: targetAgent ? targetAgent : '',
										type: ReferenceInsertType.Model
									};
									tempLambdaInsertArgumentValues[`${GetCodeName(targetModel)}`] = {
										model: targetModel ? targetModel : '',
										type: ReferenceInsertType.Model
									};
								}
							}
						});
					}

					next_steps += `

          var parameters = #{{"key":"${GetCodeName(targetModel)}"}}#ChangeBy#{{"key":"${GetCodeName(
						targetAgent
					)}"}}#.Update(agent, ${resultVariable}, FunctionName.#{{"key":"${codeTypeWord(
						functionName
					)}","type":"method"}}#);
          await StreamProcess.#{{"key":"${GetCodeName(targetModel)}"}}#_#{{"key":"${GetCodeName(
						targetAgent
					)}"}}#(parameters);
        `;
				}
			});
		}
	}

	return { next_steps, staticMethods };
}

function setupSetProperties(
	outputModelName: string,
	setProperties: SetPropertiesConfig,
	tempLambdaInsertArgumentValues: any
) {
	if (setProperties && setProperties.enabled) {
		let set_properties = setProperties.properties
			.map((setupProperty: SetProperty) => {
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
					relationType
				} = setupProperty;

				let targetModel = GetPropertyModel(targetProperty);
				let prop_string = `${outputModelName}.#{{"key":"${GetCodeName(targetModel)}.${GetCodeName(
					targetProperty
				)}","type":"property","model":"${GetCodeName(targetModel)}"}}#`;
				let isStringList: boolean =
					GetNodeProp(targetProperty, NodeProperties.UIAttributeType) === NodePropertyTypes.LISTOFSTRINGS;
				let isStringDict: boolean =
					GetNodeProp(targetProperty, NodeProperties.UIAttributeType) === NodePropertyTypes.DICTSTRING;
				tempLambdaInsertArgumentValues[`${GetCodeName(targetModel)}.${GetCodeName(targetProperty)}`] = {
					property: targetProperty,
					model: targetModel ? targetModel.id : '',
					type: ReferenceInsertType.Property
				};

				tempLambdaInsertArgumentValues[`${GetCodeName(targetModel)}`] = {
					model: targetModel ? targetModel.id : '',
					type: ReferenceInsertType.Model
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
						tempLambdaInsertArgumentValues[GetCodeName(enumeration)] = { enumeration: enumeration };
						tempLambdaInsertArgumentValues[`${GetCodeName(enumeration)}.${enumProp.value}`] = {
							enumeration,
							enumerationvalue: enumerationValue
						};
						return `${prop_string} = #{{"key":"${GetCodeName(
							enumeration
						)}","type":"enumeration" }}#.#{{"key":"${GetCodeName(
							enumeration
						)}.${enumProp.value}","type":"enumerationvalue"}}#;`;
					case SetPropertyType.String:
						// TODO: Escape string value for C#;
						return `${prop_string} = ${stringValue ? `"${stringValue}"` : 'string.Empty'};`;
					case SetPropertyType.Boolean:
						return `${prop_string} = ${booleanValue};`;
					case SetPropertyType.Property:
						let fromPropModel = RelationToVariable(relationType);
						let keyname = `${GetModelName(setupProperty)}.${GetModelPropertyName(setupProperty)}`;
						setupLambdaInsertArgs(
							tempLambdaInsertArgumentValues,
							GetModelProperty(setupProperty),
							GetModelName(setupProperty)
						);
						if (isStringDict) {
							let func = 'Add';
							if (
								GetNodeProp(GetModelProperty(setupProperty), NodeProperties.UIAttributeType) ===
								NodePropertyTypes.DICTSTRING
							) {
								func = 'AddRange';
								return `
							${prop_string} = ${prop_string} ?? new Dictionary<string, string>();
							foreach(var d in ${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${GetModelName(
									setupProperty
								)}"}}#.Keys)
							{
								${prop_string}.TryAdd(d, ${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${GetModelName(
									setupProperty
								)}"}}#[d]);
							}
							${prop_string}.${func}(${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${GetModelName(
									setupProperty
								)}"}}#);`;
							}
							else {
								return `${prop_string} = ${prop_string} ?? new Dictionary<string, string>();`
							}
						}
						if (isStringList) {
							let func = 'Add';
							if (
								GetNodeProp(GetModelProperty(setupProperty), NodeProperties.UIAttributeType) ===
								NodePropertyTypes.LISTOFSTRINGS
							) {
								func = 'AddRange';
							}
							return `
              ${prop_string} = ${prop_string} ?? new List<string>();
              ${prop_string}.${func}(${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${GetModelName(
								setupProperty
							)}"}}#);`;
						}
						return `${prop_string} = ${fromPropModel}.#{{"key":"${keyname}","type":"property","model":"${GetModelName(
							setupProperty
						)}"}}#;`;
				}
			})
			.join(NEW_LINE);

		return set_properties;
	}

	return '';
}

function setupExistenceCheck(
	existenceCheck: GetOrExistenceCheckConfig,
	staticMethods: string[],
	tempLambdaInsertArgumentValues: any,
	outputAs: OutputType
): { name: string; result: string } {
	let result = '';
	let name = '';
	if (existenceCheck && existenceCheck.enabled) {
		let item = existenceCheck.orderedCheck[existenceCheck.orderedCheck.length - 1];
		name =
			existenceCheck.name ||
			`${outputAs === OutputType.Existence ? 'CheckingFor' : 'Getting'}${GetCodeName(item.model)}By${GetModelName(
				existenceCheck.head
			)}`;

		setupLambdaModelArgs(tempLambdaInsertArgumentValues, GetModel(existenceCheck.head));

		result = `${name}(${RelationToVariable(existenceCheck.head.relationType)})`;
		let headProperty = existenceCheck.orderedCheck ? existenceCheck.orderedCheck[0].previousModelProperty : '';
		setupLambdaInsertArgs(tempLambdaInsertArgumentValues, headProperty, GetModelName(existenceCheck.head));
		let arbiters: string[] = [];
		let steps: string[] = [];
		let lastModelType = '';
		existenceCheck.orderedCheck.forEach((item: ConnectionChainItem, index: number) => {
			setupLambdaInsertArgs(tempLambdaInsertArgumentValues, item.modelProperty, GetCodeName(item.model));
			arbiters.push(
				`let arbiter#{{"key":"${GetCodeName(
					item.model
				)}"}}# = RedStrapper.Resolve<IRedArbiter<#{{"key":"${GetCodeName(item.model)}"}}#>>();`
			);
			let prev =
				index === 0
					? `${RelationToVariable(existenceCheck.head.relationType)}.#{{"key":"${GetModelName(
						existenceCheck.head
					)}.${GetCodeName(headProperty)}","type":"property","model":"${GetModelName(
						existenceCheck.head
					)}"}}#`
					: `step${index - 1}.#{{"key":"${GetCodeName(
						existenceCheck.orderedCheck[index - 1].model
					)}.${GetCodeName(item.previousModelProperty)}","type":"property","model":"${GetCodeName(
						existenceCheck.orderedCheck[index - 1].model
					)}"}}#`;
			setupLambdaModelArgs(tempLambdaInsertArgumentValues, item.model);
			lastModelType = GetCodeName(item.model);
			steps.push(`let step${index} = ${index
				? `step${index - 1}`
				: `${RelationToVariable(
					existenceCheck.head.relationType
				)}`} != null ? (await arbiter#{{"key":"${GetCodeName(
					item.model
				)}"}}#.GetBy(v => v.#{{"key":"${GetCodeName(item.model)}.${GetCodeName(
					item.modelProperty
				)}","type":"property","model":"${GetCodeName(item.model)}"}}# == ${prev})) : null;
      `);
		});
		let test = existenceCheck.opposite ? '!=' : '==';
		let outputType = outputAs === OutputType.Existence ? 'bool' : `#{{"key":"${lastModelType}"}}#`;
		staticMethods.push(`static Task<${outputType}> ${name}(#{{"key":"${RelationToVariable(
			existenceCheck.head.relationType
		)}"}}# ${RelationToVariable(existenceCheck.head.relationType)}) {
      ${arbiters.unique().join(NEW_LINE)}

      ${steps.join(NEW_LINE)}

      ${outputAs === OutputType.Existence
				? 'return step' + (steps.length - 1) + ` ${test} null`
				: 'return step' + (steps.length - 1) + ''}
    }`);
	}

	return { name, result };
}
enum OutputType {
	Existence = 'Existence',
	Model = 'Model'
}
function RelationToVariable(relationType: RelationType): string {
	switch (relationType) {
		case RelationType.Agent:
			return 'agent';
		case RelationType.Model:
			return 'model';
		case RelationType.ModelOutput:
			return 'data';
		case RelationType.Parent:
			return 'parent';
	}
}
function GetModelName(half: HalfRelation): string {
	switch (half.relationType) {
		case RelationType.Agent:
			return half.agent ? GetCodeName(half.agent) : GetCodeName(GetPropertyModel(half.agentProperty));
		case RelationType.Model:
			return half.model ? GetCodeName(half.model) : GetCodeName(GetPropertyModel(half.modelProperty));
		case RelationType.ModelOutput:
			return half.modelOutput
				? GetCodeName(half.modelOutput)
				: GetCodeName(GetPropertyModel(half.modelOutputProperty));
		case RelationType.Parent:
			return half.parent ? GetCodeName(half.parent) : GetCodeName(GetPropertyModel(half.parentProperty));
	}
}
function GetModel(half: HalfRelation): string {
	switch (half.relationType) {
		case RelationType.Agent:
			return half.agent;
		case RelationType.Model:
			return half.model;
		case RelationType.ModelOutput:
			return half.modelOutput;
		case RelationType.Parent:
			return half.parent;
	}
}
function GetModelPropertyName(half: HalfRelation): string {
	switch (half.relationType) {
		case RelationType.Agent:
			return GetCodeName(half.agentProperty);
		case RelationType.Model:
			return GetCodeName(half.modelProperty);
		case RelationType.ModelOutput:
			return GetCodeName(half.modelOutputProperty);
		case RelationType.Parent:
			return GetCodeName(half.parentProperty);
	}
}
function GetModelProperty(half: HalfRelation): string {
	switch (half.relationType) {
		case RelationType.Agent:
			return half.agentProperty;
		case RelationType.Model:
			return half.modelProperty;
		case RelationType.ModelOutput:
			return half.modelOutputProperty;
		case RelationType.Parent:
			return half.parentProperty;
	}
}
