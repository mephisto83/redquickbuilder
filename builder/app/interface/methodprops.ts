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
	excludeFromController: boolean;
}
export interface AfterEffectDataChainConfiguration {
	checkExistence?: AfterEffectCheckExistence;
	getExisting?: AfterEffectGetExisting;
	setProperties?: AfterEffectSetProperties;
}

export interface AfterEffectSetProperties extends AfterEffectConfigItem {
	properties: AfterEffectSetProperty[];
}
export function CreateSetProperties(): AfterEffectSetProperties {
	return {
		enabled: false,
		properties: []
	};
}
export function CheckAfterEffectDataChainConfiguration(options: AfterEffectDataChainConfiguration) {
	return (
		(!options.getExisting || CheckGetExisting(options.getExisting)) &&
		(!options.checkExistence || CheckIsExisting(options.checkExistence)) &&
		(!options.setProperties || CheckSetProperties(options.setProperties))
	);
}
export function CreateSetProperty(): AfterEffectSetProperty {
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
		enumerationValue: ''
	};
}
export function CheckSetProperties(setProperties: AfterEffectSetProperties) {
	if (!setProperties.enabled) {
		return true;
	}

	if (setProperties && setProperties.properties) {
		return !setProperties.properties.find(CheckSetProperty);
	}
	return false;
}
export function CheckSetProperty(setProperty: AfterEffectSetProperty): boolean {
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
export interface AfterEffectSetProperty {
	setPropertyType: SetPropertyType;
	relationType: RelationType;
	agentProperty: string; // The property used to find the model.
	modelProperty: string; // The property used to find the model
	targetProperty: string;
	floatValue: string;
	doubleValue: string;
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
	Double = 'Double'
}

export function CreateCheckExistence(): AfterEffectCheckExistence {
	return {
		relationType: RelationType.Agent,
		agentProperty: '',
		modelProperty: '',
		targetProperty: '',
		enabled: false,
		skipSettings: SkipSettings.DontSkip
	};
}
export function CreateGetExistence(): AfterEffectGetExisting {
	return {
		relationType: RelationType.Agent,
		agentProperty: '',
		modelProperty: '',
		targetProperty: '',
		enabled: false
	};
}
export interface AfterEffectRelations extends AfterEffectConfigItem {
	relationType: RelationType;
	agentProperty: string; // The property used to find the model.
	modelProperty: string; // The property used to find the model
	targetProperty: string;
}
export interface AfterEffectCheckExistence extends AfterEffectRelations {
	skipSettings: SkipSettings;
}
export interface AfterEffectGetExisting extends AfterEffectRelations {}
/**
 * Describes how the model will be found
 */
export enum RelationType {
	Agent = 'Agent',
	Model = 'Model'
}
export enum SkipSettings {
	SkipIfTrue = 'Skip If True',
	SkipIfFlase = 'Skip If False',
	DontSkip = 'Dont Skip'
}
export interface AfterEffectConfigItem {
	enabled: boolean;
}

export function CheckIsExisting(isExisting: AfterEffectCheckExistence) {
	if (!isExisting.enabled) {
		return true;
	}
	return isExisting.enabled &&
	isExisting.targetProperty &&
	(isExisting.relationType === RelationType.Agent ? isExisting.agentProperty : isExisting.modelProperty)
		? true
		: false;
}

export function CheckGetExisting(getExisting: AfterEffectGetExisting) {
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
	dataChainOptions: AfterEffectDataChainConfiguration;
	id: string;
	name: string;
	dataChain: string;
	targetType: TargetMethodType;
	target: string;
	afterEffectNode?: string;
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
