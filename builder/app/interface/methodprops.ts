import { Config } from 'electron';
import { GetModelPropertyChildren } from '../actions/uiactions';

export interface DashboardAccessProps {
	access: false;
}
export interface DashboardEffect {
	effect: Effect;
}
export interface DashboardRouting {
	routing: Routing;
}
export interface DashboardViewMount {
	mount: ViewMounting;
}
export default interface MethodProps {
	GetAll?: MethodDescription;
	Get?: MethodDescription;
	Create?: MethodDescription;
	Delete?: MethodDescription;
	Update?: MethodDescription;
};

export interface RoutingProps {
	GetAll?: Routing;
	Get?: Routing;
	Create?: Routing;
	Delete?: Routing;
	Update?: Routing;
}
export interface EffectProps {
	GetAll?: Effect;
	Get?: Effect;
	Create?: Effect;
	Delete?: Effect;
	Update?: Effect;
}
export interface ScreenEffectApiProps {
	GetAll?: ScreenEffectApi[];
	Get?: ScreenEffectApi[];
	Create?: ScreenEffectApi[];
	Delete?: ScreenEffectApi[];
	Update?: ScreenEffectApi[];
}
export interface DashboardScreenEffectApiProps {
	apis: ScreenEffectApi[];
}

export interface ViewMoutingProps {
	GetAll?: ViewMounting;
	Get?: ViewMounting;
	Create?: ViewMounting;
	Delete?: ViewMounting;
	Update?: ViewMounting;
}
export interface ViewMounting {
	mountings: MountingDescription[]; // an array of mounting events
	clearScreen?: boolean;
	validationTargetMethod?: string; // The mounting description that will be used a validation method.
}
export interface MountingDescription {
	// ------
	// use these properties to identify the screen
	viewType: string;
	model: string;
	agent: string;
	// ------
	id: string;
	name: string;
	methodDescription?: MethodDescription;
	source?: { [key: string]: RouteSource }; // This is what the button will use to populate the parameter for navigating to the next page.
	screenEffect: ScreenEffect[]; // List of internal api nodes to add to the screen, connected to datachains that will supply the values.
	afterEffects: AfterEffect[];
	validations: ValidationConfig[];
	permissions: PermissionConfig[];
	executions: ExecutionConfig[];
	excludeFromController: boolean;
}
export interface DataChainConfiguration {
	checkExistence?: CheckExistenceConfig;
	simpleValidation?: SimpleValidationConfig;
	copyConfig?: CopyConfig;
	setBoolean?: SetBoolean;
	setInteger?: SetInteger;
	incrementInteger?: IncrementInteger;
	incrementDouble?: IncrementDouble;
	getExisting?: GetExistingConfig;
	setProperties?: SetPropertiesConfig;
}

export interface SetPropertiesConfig extends ConfigItem {
	properties: SetProperty[];
}
export function CreateSetProperties(): SetPropertiesConfig {
	return {
		enabled: false,
		properties: []
	};
}
export function CheckAfterEffectDataChainConfiguration(options: DataChainConfiguration) {
	return (
		(!options.getExisting || CheckGetExisting(options.getExisting)) &&
		(!options.checkExistence || CheckIsExisting(options.checkExistence)) &&
		(!options.setProperties || CheckSetProperties(options.setProperties))
	);
}
export function CreateSetProperty(): SetProperty {
	return {
		agentProperty: '',
		doubleValue: '',
		enumeration: '',
		floatValue: '',
		integerValue: '',
		modelProperty: '',
		relationType: RelationType.Agent,
		setPropertyType: SetPropertyType.String,
		stringValue: '',
		targetProperty: '',
		enumerationValue: '',
		booleanValue: 'false'
	};
}
export function CheckSetProperties(setProperties: SetPropertiesConfig) {
	if (!setProperties.enabled) {
		return true;
	}

	if (setProperties && setProperties.properties) {
		return !setProperties.properties.find(CheckSetProperty);
	}
	return false;
}
export function CheckSetProperty(setProperty: SetProperty): boolean {
	switch (setProperty.setPropertyType) {
		case SetPropertyType.Double:
			return isNaN(parseFloat(setProperty.doubleValue));
		case SetPropertyType.Enumeration:
			return !!!setProperty.enumeration;
		case SetPropertyType.Float:
			return isNaN(parseFloat(setProperty.doubleValue));
		case SetPropertyType.Integer:
			return isNaN(parseInt(setProperty.integerValue));
		case SetPropertyType.Property:
			return setProperty.relationType === RelationType.Agent
				? !!!setProperty.agentProperty || !setProperty.targetProperty
				: !!!setProperty.modelProperty || !setProperty.targetProperty;
		case SetPropertyType.String:
			return !(setProperty.stringValue !== undefined && setProperty.stringValue !== null);
	}
	return false;
}
export interface SetProperty {
	setPropertyType: SetPropertyType;
	relationType: RelationType;
	agentProperty: string; // The property used to find the model.
	modelProperty: string; // The property used to find the model
	targetProperty: string;
	floatValue: string;
	doubleValue: string;
	booleanValue: string;
	integerValue: string;
	stringValue: string;
	enumeration: string;
	enumerationValue: string;
}
export enum SetPropertyType {
	Property = 'Property',
	Enumeration = 'Enumeration',
	String = 'String',
	Integer = 'Integer',
	Float = 'Float',
	Boolean = 'Boolean',
	Double = 'Double'
}

export function CreateCheckExistence(): CheckExistenceConfig {
	return {
		relationType: RelationType.Agent,
		agentProperty: '',
		modelProperty: '',
		targetProperty: '',
		enabled: false,
		skipSettings: SkipSettings.DontSkip,
		returnSetting: {
			enabled: false,
			setting: ReturnSetting.ReturnFalse
		}
	};
}
export function CheckCopyConfig(copyConfig: HalfRelation) {
	if (!copyConfig.enabled) {
		return true;
	}
	if (copyConfig.agentProperty && copyConfig.relationType === RelationType.Agent) {
		return true;
	}
	if (copyConfig.modelProperty && copyConfig.relationType === RelationType.Model) {
		return true;
	}
	return false;
}

export function CreateCopyConfig(): CopyConfig {
	return {
		agentProperty: '',
		enabled: false,
		modelProperty: '',
		relationType: RelationType.Model
	};
}

export function CreateHalf(): HalfRelation {
	return {
		agentProperty: '',
		enabled: false,
		modelProperty: '',
		relationType: RelationType.Agent
	};
}

export function CreateSetInteger(): SetInteger {
	return { ...CreateHalf(), value: '0' };
}

export function CreateSetBoolean(): SetBoolean {
	return { ...CreateHalf(), value: 'false' };
}

export function CreateIncrementDouble(): IncrementDouble {
	return { ...CreateHalf(), value: '1.0' };
}

export function CreateIncrementInteger(): IncrementInteger {
	return { ...CreateHalf(), value: '1' };
}

export function CreateSimpleValidation(): SimpleValidationConfig {
	return {
		relationType: RelationType.Agent,
		agentProperty: '',
		modelProperty: '',
		targetProperty: '',
		enabled: false,
		alphaOnlyWithSpaces: {
			enabled: false
		},
		isNotNull: {
			enabled: false
		},
		isNull: {
			enabled: false
		},
		maxLength: {
			enabled: false,
			value: '500'
		},
		minLength: {
			enabled: false,
			value: '1'
		}
	};
}
export function SetupConfigInstanceInformation(
	dataChainOptions: DataChainConfiguration,
	methodDescription: MethodDescription
) {

	dataChainOptions.checkExistence = dataChainOptions.checkExistence || CreateCheckExistence();
	dataChainOptions.simpleValidation = dataChainOptions.simpleValidation || CreateSimpleValidation();
	dataChainOptions.copyConfig = dataChainOptions.copyConfig || CreateCopyConfig();
	dataChainOptions.setInteger = dataChainOptions.setInteger || CreateSetInteger();
	dataChainOptions.setBoolean = dataChainOptions.setBoolean || CreateSetBoolean();
	dataChainOptions.incrementDouble = dataChainOptions.incrementDouble || CreateIncrementDouble();
	dataChainOptions.incrementInteger = dataChainOptions.incrementInteger || CreateIncrementInteger();

	let checkExistence = dataChainOptions.checkExistence;
	let properties: any[] = [];
	let targetProperties: any[] = [];
	if (methodDescription && checkExistence && checkExistence.relationType) {
		switch (checkExistence.relationType) {
			case RelationType.Agent:
				if (methodDescription.properties && methodDescription.properties.agent) {
					properties = GetModelPropertyChildren(methodDescription.properties.agent).toNodeSelect();
				}
				break;
			case RelationType.Model:
				if (
					methodDescription.properties &&
					(methodDescription.properties.model_output || methodDescription.properties.model)
				) {
					properties = GetModelPropertyChildren(
						methodDescription.properties.model_output || methodDescription.properties.model || ''
					).toNodeSelect();
				}
				break;
		}
	}
	if (methodDescription && methodDescription.properties && methodDescription.properties.model) {
		targetProperties = GetModelPropertyChildren(methodDescription.properties.model).toNodeSelect();
	}
	return {
		checkExistence,
		methodDescription,
		properties,
		targetProperties,
		copyConfig: dataChainOptions.copyConfig,
		simpleValidation: dataChainOptions.simpleValidation,
		incrementDouble: dataChainOptions.incrementDouble,
		incrementInteger: dataChainOptions.incrementInteger,
		setBoolean: dataChainOptions.setBoolean,
		setInteger: dataChainOptions.setInteger
	};
}

export function CreateGetExistence(): GetExistingConfig {
	return {
		relationType: RelationType.Agent,
		agentProperty: '',
		modelProperty: '',
		targetProperty: '',
		enabled: false
	};
}
export interface HalfRelation extends ConfigItem {
	relationType: RelationType;
	agentProperty: string; // The property used to find the model.
	modelProperty: string; // The property used to find the model
}
export interface AfterEffectRelations extends HalfRelation {
	targetProperty: string;
}
export interface CheckExistenceConfig extends AfterEffectRelations {
	skipSettings: SkipSettings;
	returnSetting: ReturnSettingConfig;
}
export interface CopyConfig extends HalfRelation {}
export interface Setter extends HalfRelation {
	value: string;
}
export interface SetBoolean extends Setter {
}
export interface SetInteger extends Setter {
}
export interface IncrementInteger extends Setter {
}
export interface IncrementDouble extends Setter {
}

export interface SimpleValidationConfig extends AfterEffectRelations {
	minLength: NumberConfig;
	maxLength: NumberConfig;
	alphaOnlyWithSpaces: BooleanConfig;
	isNotNull: BooleanConfig;
	isNull: BooleanConfig;
}

export interface BooleanConfig extends ConfigItem {}
export interface NumberConfig extends ConfigItem {
	value: string;
}
export interface GetExistingConfig extends AfterEffectRelations {}
/**
 * Describes how the model will be found
 */
export enum RelationType {
	Agent = 'Agent',
	Model = 'Model'
}
export interface ReturnSettingConfig extends ConfigItem {
	setting: ReturnSetting;
}
export function createReturnSetting(): ReturnSettingConfig {
	return {
		setting: ReturnSetting.ReturnTrue,
		enabled: false
	};
}
export enum ReturnSetting {
	ReturnTrue = 'ReturnTrue',
	ReturnFalse = 'ReturnFalse',
	ReturnOther = 'ReturnOther'
}
export enum SkipSettings {
	SkipIfTrue = 'Skip If True',
	SkipIfFlase = 'Skip If False',
	DontSkip = 'Dont Skip'
}
export interface ConfigItem {
	enabled: boolean;
}
export function CheckSimpleValidation(isvalidation: SimpleValidationConfig) {
	if (!isvalidation.enabled) {
		return true;
	}
	return true;
}
export function CheckIsExisting(isExisting: CheckExistenceConfig) {
	if (!isExisting.enabled) {
		return true;
	}
	return isExisting.enabled &&
	isExisting.targetProperty &&
	(isExisting.relationType === RelationType.Agent ? isExisting.agentProperty : isExisting.modelProperty)
		? true
		: false;
}

export function CheckGetExisting(getExisting: GetExistingConfig) {
	if (!getExisting.enabled) {
		return true;
	}
	return getExisting.enabled &&
	getExisting.targetProperty &&
	(getExisting.relationType === RelationType.Agent ? getExisting.agentProperty : getExisting.modelProperty)
		? true
		: false;
}

export interface AfterEffect {
	dataChainOptions: DataChainConfiguration;
	id: string;
	name: string;
	dataChain: string;
	targetType: TargetMethodType;
	target: string;
	afterEffectNode?: string;
}

export interface PermissionConfig extends ValidationConfig {}
export interface ExecutionConfig extends ValidationConfig {}

export interface ValidationConfig {
	id: string;
	name: string;
	dataChain: string;
	dataChainOptions: DataChainConfiguration;
}

export enum TargetMethodType {
	Mounting = 'Mounting',
	Effect = 'Effect'
}

export interface ScreenEffect {
	id: string;
	name: string;
	passDeep: boolean; // pass the component api down the tree to all the nodes.
	dataChain: string;
}
export interface ScreenEffectApi extends ScreenEffect {}
export interface Routing {
	routes: RouteDescription[];
}

export interface EffectDescription extends MountingDescription {
	body: boolean;
}
export interface Effect {
	effects: EffectDescription[];
}

export interface RouteDescription {
	isDashboard?: boolean;
	isItemized?: boolean;
	dashboard?: string;
	viewType: string;
	model: string;
	agent: string;
	id: string;
	name: string;
	targetMethodDescription?: MethodDescription;
	linkId?: string; // a reference to the link
	source?: { [key: string]: RouteSource }; // This is what the button will use to populate the parameter for navigating to the next page.
}
export interface RouteSource {
	model?: string;
	property?: string | null;
	type: RouteSourceType;
}

export enum RouteSourceType {
	Model = 'model', // The value should be retrieved from the model for the page
	Agent = 'agent', // The value should be retrieved from the agent for the page
	Body = 'body',
	UrlParameter = 'urlParameter' // The value should be retrieved from the url parameters for the page
}

export interface MethodDescription {
	methodId: string;
	functionType: string;
	properties: MethodPropsProperties;
}

export interface MethodPropsProperties {
	parent?: string;
	model?: string;
	model_output?: string;
	agent?: string;
}
