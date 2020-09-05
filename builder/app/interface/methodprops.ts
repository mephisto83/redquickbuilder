import { Config } from 'electron';
import { GetModelPropertyChildren, GUID, setRouteSource, GetModelCodeProperties } from '../actions/uiactions';
import datachainactivitymenu from '../components/datachainactivitymenu';
import SimpleValidationComponent from '../components/simplevalidationconfig';
import { Graph } from '../methods/graph_types';
import {
	createGraph,
	addNewNodeOfType,
	addLinkBetweenNodes,
	removeNode,
	removeLink,
	updateNodeProperty
} from '../methods/graph_methods';
import { NodeTypes, NodeProperties, LinkProperties } from '../constants/nodetypes';
import SwaggerCallConfig from '../components/swaggercallconfig';
import { SwaggerPathDescription, SwaggerParameters, SwaggerEndpointDescription } from '../service/swagger';

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
	staticParameters?: StaticParameters;
	name: string;
	methodDescription?: MethodDescription;
	source?: { [key: string]: RouteSource }; // This is what the button will use to populate the parameter for navigating to the next page.
	screenEffect: ScreenEffect[]; // List of internal api nodes to add to the screen, connected to datachains that will supply the values.
	afterEffects: AfterEffect[];
	autoSetup: AutoSetupConfiguration;
	validations: ValidationConfig[];
	permissions: PermissionConfig[];
	filters: FilterConfig[];
	filterItem: { [str: string]: FilterConfig };
	executions: ExecutionConfig[];
	excludeFromController: boolean;
}
export interface AutoSetupConfiguration {
	executionAutoCopy: boolean;
}
export interface DataChainConfiguration {
	checkExistence?: CheckExistenceConfig;
	simpleValidation?: SimpleValidationConfig;
	simpleValidationConfiguration?: SimpleValidationsConfiguration;
	simpleValidations?: SimpleValidationConfig[];
	copyConfig?: CopyConfig;
	copyEnumeration?: CopyEnumerationConfig;
	setBoolean?: SetBoolean;
	setInteger?: SetInteger;
	swaggerCall?: SwaggerCall;
	incrementInteger?: IncrementInteger;
	incrementDouble?: IncrementDouble;
	compareEnumeration?: CompareEnumeration;
	compareEnumerations?: CompareEnumeration[];
	routeConfig?: RouteConfig;
	getExisting?: GetExistingConfig;
	setProperties?: SetPropertiesConfig;
	directExecute?: boolean;
}

export interface RouteConfig extends ConfigItem {
	targetId: string;
	pushChange: boolean;
}
export function CreateFilterConfig(): FilterConfig {
	return {
		enabled: true,
		dataChain: '',
		dataChainOptions: {},
		autoCalculate: true,
		id: GUID(),
		name: ''
	};
}
export function CreateRouteConfig(): RouteConfig {
	return {
		targetId: '',
		enabled: false,
		pushChange: false,
		id: GUID()
	};
}
export interface SetPropertiesConfig extends ConfigItem {
	properties: SetProperty[];
}
export function CreateSetProperties(): SetPropertiesConfig {
	return {
		enabled: false,
		id: GUID(),
		properties: []
	};
}
export function CheckRouteConfig(routeConfig: RouteConfig): boolean {
	return routeConfig && routeConfig.enabled && (routeConfig.pushChange || !!routeConfig.targetId);
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
		parentProperty: '',
		agent: '',
		model: '',
		parent: '',
		modelOutput: '',
		modelOutputProperty: '',
		targetProperty: '',
		enabled: false,
		id: GUID(),
		skipSettings: SkipSettings.DontSkip,
		ifFalse: CreateBranch(),
		ifTrue: CreateBranch(),
		returnSetting: {
			id: GUID(),
			enabled: false,
			setting: ReturnSetting.ReturnFalse
		}
	};
}
export function CreateBranch(): BranchConfig {
	return {
		dataChainOptions: {},
		enabled: false,
		name: ''
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
	if (copyConfig.modelProperty && copyConfig.relationType === RelationType.Parent) {
		return true;
	}
	return false;
}

export function CheckSetter(copyConfig: Setter) {
	if (!copyConfig.enabled) {
		return true;
	}
	if (copyConfig.value) {
		return true;
	}
	return false;
}

export function CreateCopyConfig(): CopyConfig {
	return {
		agentProperty: '',
		enabled: false,
		modelProperty: '',
		parentProperty: '',
		agent: '',
		model: '',
		modelOutput: '',
		parent: '',
		modelOutputProperty: '',
		id: GUID(),
		relationType: RelationType.Model,
		targetProperty: ''
	};
}
export function CreateCopyEnumerationConfig(): CopyEnumerationConfig {
	return {
		enabled: false,
		enumeration: '',
		enumerationType: '',
		id: GUID(),
		targetProperty: '',
		name: ''
	};
}
export function CreateHalf(): HalfRelation {
	return {
		agentProperty: '',
		enabled: false,
		agent: '',
		model: '',
		parent: '',
		parentProperty: '',
		modelOutput: '',
		modelOutputProperty: '',
		id: GUID(),
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

export function CreateCompareEnumeration(): CompareEnumeration {
	return { ...CreateHalf(), enumeration: '', value: '' };
}
export function CreateSimpleValidationComposition(): SimpleValidationsConfiguration {
	return {
		composition: CreateGraphValidationComposition(),
		enabled: false,
		id: GUID()
	};
}
export function AddLinkBetweenCompositionNodes(graph: Graph, from: string, to: string): Graph {
	graph = addLinkBetweenNodes(
		graph,
		{
			target: to,
			source: from,
			properties: LinkProperties.Composition
		},
		() => {}
	);
	return graph;
}
export function RemoveLinkFromComposition(graph: Graph, linkId: string): Graph {
	graph = removeLink(graph, linkId);

	return graph;
}
export function ChangeNodeType(graph: Graph, nodeId: string, nodeType: string): Graph {
	graph = updateNodeProperty(graph, {
		skipCache: true,
		id: nodeId,
		prop: NodeProperties.NODEType,
		value: nodeType
	});
	return graph;
}
export function ChangeNodeProp(graph: Graph, nodeId: string, prop: string, value: string): Graph {
	graph = updateNodeProperty(graph, {
		skipCache: true,
		id: nodeId,
		prop,
		value
	});
	return graph;
}
export function RemoveNodeFromComposition(graph: Graph, nodeId: string): Graph {
	graph = removeNode(graph, { id: nodeId });
	return graph;
}

export function GetSimpleValidationId(simpleValidation: any, properties: any) {
	let name = '';
	let valid =
		simpleValidation &&
		simpleValidation.enabled &&
		((simpleValidation.relationType === RelationType.Agent && simpleValidation.agentProperty) ||
			(simpleValidation.relationType === RelationType.ModelOuput && simpleValidation.modelProperty) ||
			(simpleValidation.relationType === RelationType.Model && simpleValidation.modelProperty));
	if (valid) {
		switch (simpleValidation.relationType) {
			case RelationType.Agent:
				let prop = properties.find((v: any) => v.id === simpleValidation.agentProperty);
				if (prop) name = `agent.${prop.title}`;
				break;
			case RelationType.Model:
				let prop2 = properties.find((v: any) => v.id === simpleValidation.modelProperty);
				if (prop2) name = `model.${prop2.title}`;
				break;
			case RelationType.ModelOuput:
				let prop3 = properties.find((v: any) => v.id === simpleValidation.modelProperty);
				if (prop3) name = `model_output.${prop3.title}`;
				break;
		}
	}
	return simpleValidation.name || name;
}

export function createStaticParameters(): StaticParameters {
	return {
		parameters: [],
		name: '',
		id: GUID(),
		enabled: false
	};
}
export function createStaticParameter(): StaticParameter {
	return {
		id: GUID(),
		enabled: false,
		enumeration: '',
		enumerationType: '',
		name: '',
		purpose: StaticParameterPurpose.Routing
	};
}
export function setDefaultRouteSource(mountingItem: MountingDescription, urlParameter: string, k: string) {
	if (
		!mountingItem.source &&
		[ 'model', 'agent' ].indexOf(urlParameter) !== -1 &&
		[ 'model', 'agent' ].indexOf(k) !== -1
	) {
		setRouteSource(mountingItem, urlParameter, k, RouteSourceType.UrlParameter);
	}
}

export function AddNewSimpleValidationConfigToGraph(graph: Graph, validationId: string, name: string): Graph {
	graph = addNewNodeOfType(
		graph,
		{
			properties: {
				[NodeProperties.IsRoot]: false,
				[NodeProperties.IsCompositionLeaf]: false,
				[NodeProperties.ValidationConfigurationItem]: validationId,
				[NodeProperties.UIText]: name
			}
		},
		NodeTypes.LeafNode
	);
	return graph;
}
export function AddNewNodeToComposition(graph: Graph): Graph {
	graph = addNewNodeOfType(
		graph,
		{
			properties: {
				[NodeProperties.IsRoot]: false,
				[NodeProperties.UIText]: BooleanTypes.AND,
				[NodeProperties.BooleanType]: BooleanTypes.AND
			}
		},
		NodeTypes.RootNode
	);
	return graph;
}
export enum BooleanTypes {
	OR = 'OR',
	AND = 'AND'
}
export function CreateGraphValidationComposition(): SimpleValidationComposition {
	let graph: Graph = createGraph();

	graph = addNewNodeOfType(
		graph,
		{
			properties: {
				[NodeProperties.IsRoot]: true,
				[NodeProperties.UIText]: 'root',
				[NodeProperties.BooleanType]: BooleanTypes.AND
			}
		},
		NodeTypes.RootNode
	);

	return { graph };
}

export function getRelationProperties(methodDescription: MethodDescription, halfRelation: HalfRelation): Node[] {
	let properties: Node[] = [];
	if (methodDescription && halfRelation && halfRelation.relationType) {
		switch (halfRelation.relationType) {
			case RelationType.Agent:
				if (methodDescription.properties && methodDescription.properties.agent) {
					properties = GetModelCodeProperties(methodDescription.properties.agent).toNodeSelect();
				}
				break;
			case RelationType.ModelOuput:
				if (
					methodDescription.properties &&
					(methodDescription.properties.model_output || methodDescription.properties.model)
				) {
					properties = GetModelCodeProperties(
						methodDescription.properties.model_output || methodDescription.properties.model || ''
					).toNodeSelect();
				}
				break;
			case RelationType.Model:
				if (methodDescription.properties && methodDescription.properties.model) {
					properties = GetModelCodeProperties(methodDescription.properties.model || '').toNodeSelect();
				}
				break;
			case RelationType.Parent:
				if (methodDescription.properties && methodDescription.properties.parent) {
					properties = GetModelCodeProperties(methodDescription.properties.parent || '').toNodeSelect();
				}
				break;
		}
	}

	return properties;
}

export function CreateSimpleValidation(): SimpleValidationConfig {
	return {
		relationType: RelationType.Agent,
		agentProperty: '',
		modelProperty: '',
		parentProperty: '',
		agent: '',
		model: '',
		parent: '',
		modelOutput: '',
		modelOutputProperty: '',

		id: GUID(),
		targetProperty: '',
		enabled: false,
		alphaOnlyWithSpaces: CreateBoolean(),
		isNotNull: CreateBoolean(),
		isNull: CreateBoolean(),
		isTrue: CreateBoolean(),
		isFalse: CreateBoolean(),
		alphaNumeric: CreateBoolean(),
		alphaOnly: CreateBoolean(),
		creditCard: CreateBoolean(),
		email: CreateBoolean(),
		emailEmpty: CreateBoolean(),
		numericInt: CreateBoolean(),
		requireLowercase: CreateBoolean(),
		requireNonAlphanumeric: CreateBoolean(),
		requireUppercase: CreateBoolean(),
		socialSecurity: CreateBoolean(),
		url: CreateBoolean(),
		urlEmpty: CreateBoolean(),
		zip: CreateBoolean(),
		zipEmpty: CreateBoolean(),
		maxLength: {
			id: GUID(),
			enabled: false,
			value: '500'
		},
		minLength: {
			id: GUID(),
			enabled: false,
			value: '1'
		},
		areEqual: CreateAreEqual(),
		isContained: CreateAreEqual(),
		isNotContained: CreateAreEqual(),
		isIntersecting: CreateAreEqual(),
		oneOf: CreateOneOf()
	};
}
export function CreateBoolean(): BooleanConfig {
	return {
		id: GUID(),
		enabled: false
	};
}
export function CreateOneOf(): EnumerationConfig {
	return {
		id: GUID(),
		enabled: false,
		enumerationType: '',
		enumerations: []
	};
}
export function CreateAreEqual(): AreEqualConfig {
	return {
		id: GUID(),
		agentProperty: '',
		agent: '',
		model: '',
		parent: '',
		parentProperty: '',
		modelOutput: '',
		modelOutputProperty: '',
		enabled: false,
		modelProperty: '',
		relationType: RelationType.Agent,
		targetProperty: ''
	};
}
export function SetupConfigInstanceInformation(
	dataChainOptions: DataChainConfiguration,
	methodDescription: MethodDescription
) {
	dataChainOptions.checkExistence = dataChainOptions.checkExistence || CreateCheckExistence();
	dataChainOptions.simpleValidation = dataChainOptions.simpleValidation || CreateSimpleValidation();
	dataChainOptions.simpleValidation.isContained = dataChainOptions.simpleValidation.isContained || CreateAreEqual();
	dataChainOptions.simpleValidation.isNotContained =
		dataChainOptions.simpleValidation.isNotContained || CreateAreEqual();
	dataChainOptions.simpleValidationConfiguration =
		dataChainOptions.simpleValidationConfiguration || CreateSimpleValidationComposition();
	dataChainOptions.simpleValidations = dataChainOptions.simpleValidations || [];
	dataChainOptions.simpleValidations.forEach((item) => {
		item.isContained = item.isContained || CreateAreEqual();
		item.isNotContained = item.isNotContained || CreateAreEqual();
		item.isIntersecting = item.isIntersecting || CreateAreEqual();
		let temp = { ...CreateSimpleValidation(), ...item };
		Object.assign(item, temp);
	});
	dataChainOptions.copyConfig = dataChainOptions.copyConfig || CreateCopyConfig();
	dataChainOptions.copyEnumeration = dataChainOptions.copyEnumeration || CreateCopyEnumerationConfig();
	dataChainOptions.setInteger = dataChainOptions.setInteger || CreateSetInteger();
	dataChainOptions.setBoolean = dataChainOptions.setBoolean || CreateSetBoolean();
	dataChainOptions.incrementDouble = dataChainOptions.incrementDouble || CreateIncrementDouble();
	dataChainOptions.incrementInteger = dataChainOptions.incrementInteger || CreateIncrementInteger();
	dataChainOptions.compareEnumeration = dataChainOptions.compareEnumeration || CreateCompareEnumeration();
	dataChainOptions.compareEnumerations = dataChainOptions.compareEnumerations || [ CreateCompareEnumeration() ];
	dataChainOptions.swaggerCall = dataChainOptions.swaggerCall || CreateSwaggerCall();
	let checkExistence = dataChainOptions.checkExistence;
	let properties: any[] = [];
	let targetProperties: any[] = [];
	if (methodDescription && checkExistence && checkExistence.relationType) {
		switch (checkExistence.relationType) {
			case RelationType.Agent:
				if (methodDescription.properties && methodDescription.properties.agent) {
					properties = GetModelCodeProperties(methodDescription.properties.agent).toNodeSelect();
				}
				break;
			case RelationType.ModelOuput:
				if (
					methodDescription.properties &&
					(methodDescription.properties.model_output || methodDescription.properties.model)
				) {
					properties = GetModelCodeProperties(
						methodDescription.properties.model_output || methodDescription.properties.model || ''
					).toNodeSelect();
				}
				break;
			case RelationType.Model:
				if (methodDescription.properties && methodDescription.properties.model) {
					properties = GetModelCodeProperties(methodDescription.properties.model || '').toNodeSelect();
				}
				break;
			case RelationType.Parent:
				if (methodDescription.properties && methodDescription.properties.parent) {
					properties = GetModelCodeProperties(methodDescription.properties.parent || '').toNodeSelect();
				}
				break;
		}
	}
	if (methodDescription && methodDescription.properties && methodDescription.properties.model) {
		targetProperties = GetModelCodeProperties(methodDescription.properties.model).toNodeSelect();
	}
	return {
		checkExistence,
		methodDescription,
		properties,
		targetProperties,
		copyConfig: dataChainOptions.copyConfig,
		copyEnumeration: dataChainOptions.copyEnumeration,
		simpleValidation: dataChainOptions.simpleValidation,
		incrementDouble: dataChainOptions.incrementDouble,
		incrementInteger: dataChainOptions.incrementInteger,
		simpleValidationConfiguration: dataChainOptions.simpleValidationConfiguration,
		setBoolean: dataChainOptions.setBoolean,
		simpleValidations: dataChainOptions.simpleValidations,
		setInteger: dataChainOptions.setInteger,
		swaggerCall: dataChainOptions.swaggerCall,
		compareEnumeration: dataChainOptions.compareEnumeration,
		compareEnumerations: dataChainOptions.compareEnumerations
	};
}

export function CreateGetExistence(): GetExistingConfig {
	return {
		relationType: RelationType.Agent,
		id: GUID(),
		agent: '',
		parent: '',
		model: '',
		modelOutput: '',
		agentProperty: '',
		modelProperty: '',
		parentProperty: '',
		modelOutputProperty: '',
		targetProperty: '',
		enabled: false
	};
}
export interface HalfRelation extends ConfigItem {
	relationType: RelationType;
	agent: string;
	model: string;
	parent: string;
	modelOutput: string;
	agentProperty: string; // The property used to find the model.
	modelProperty: string; // The property used to find the model
	parentProperty: string;
	modelOutputProperty: string; // The property used to find the model
}
export interface AfterEffectRelations extends HalfRelation {
	targetProperty: string;
	isStrech?: boolean;
	stretchPath?: StretchPath; // The properties+models that will be traversed to get to the final model instance.
}
export interface StretchPath {
	path: StretchPathItem[];
	name: string;
}
export interface StretchPathItem {
	fromProperty: string;
	property: string;
	id: string;
	model: string;
}
export function CreateStretchPath(): StretchPath {
	return {
		name: '',
		path: []
	};
}
export function CreateStretchPathItem(model: string, property: string, fromProperty?: string): StretchPathItem {
	return {
		fromProperty: fromProperty || '',
		property,
		model,
		id: GUID()
	};
}
export interface CompareEnumeration extends HalfRelation {
	enumeration: string;
	value: string;
}
export interface CheckExistenceConfig extends AfterEffectRelations {
	skipSettings: SkipSettings;
	returnSetting: ReturnSettingConfig;
	ifTrue: BranchConfig;
	ifFalse: BranchConfig;
}
export interface BranchConfig {
	name: string;
	enabled: boolean;
	dataChainOptions: DataChainConfiguration;
}
export interface CopyConfig extends AfterEffectRelations {}
export interface AreEqualConfig extends AfterEffectRelations {}
export interface IsContainedConfig extends AfterEffectRelations {}
export interface IsIntersectingConfig extends AfterEffectRelations {}
export interface IsNotContainedConfig extends AfterEffectRelations {}
export interface Setter extends HalfRelation {
	value: string;
}
export interface SetBoolean extends Setter {}
export interface SetInteger extends Setter {}
export interface IncrementInteger extends Setter {}
export interface IncrementDouble extends Setter {}
export interface SwaggerCall extends ConfigItem {
	swagger: string;
	swaggerApiPath: string;
	swaggerApiDescription: string;
	swaggerParameters: SwaggerParameterConfig[];
}
export interface SwaggerParameterConfig extends AfterEffectRelations {
	swaggerParameterName: string;
	swaggerParameterType: string;
	swaggerParameterFormat?: string;
	swaggerParameterRequired: boolean;
}
export function CreateAfterEffectRelations(): AfterEffectRelations {
	return {
		agent: '',
		agentProperty: '',
		enabled: false,
		id: GUID(),
		model: '',
		modelOutput: '',
		modelOutputProperty: '',
		modelProperty: '',
		parent: '',
		parentProperty: '',
		relationType: RelationType.Agent,
		targetProperty: ''
	};
}
export function CreateSwaggerParameters(
	endpointDescription: SwaggerEndpointDescription,
	params: SwaggerParameterConfig[]
): SwaggerParameterConfig[] {
	let result: SwaggerParameterConfig[] = [];
	return result;
}
export function CreateSwaggerParameter(param: SwaggerParameters): SwaggerParameterConfig {
	return {
		...CreateAfterEffectRelations(),
		swaggerParameterFormat: param.format,
		swaggerParameterName: param.name,
		swaggerParameterRequired: param.required,
		swaggerParameterType: param.type
	};
}
export function CreateSwaggerCall(): SwaggerCall {
	return {
		swagger: '',
		swaggerApiDescription: '',
		enabled: false,
		id: '',
		swaggerApiPath: '',
		swaggerParameters: [],
		name: ''
	};
}
export interface SimpleValidationConfig extends AfterEffectRelations {
	minLength: NumberConfig;
	maxLength: NumberConfig;
	alphaOnlyWithSpaces: BooleanConfig;
	alphaNumeric: BooleanConfig;
	alphaOnly: BooleanConfig;
	creditCard: BooleanConfig;
	email: BooleanConfig;
	emailEmpty: BooleanConfig;
	numericInt: BooleanConfig;
	requireLowercase: BooleanConfig;
	requireNonAlphanumeric: BooleanConfig;
	requireUppercase: BooleanConfig;
	socialSecurity: BooleanConfig;
	url: BooleanConfig;
	urlEmpty: BooleanConfig;
	zip: BooleanConfig;
	zipEmpty: BooleanConfig;
	isNotNull: BooleanConfig;
	isTrue: BooleanConfig;
	isFalse: BooleanConfig;
	areEqual: AreEqualConfig;
	isContained: IsContainedConfig;
	isIntersecting: IsIntersectingConfig;
	isNotContained: IsNotContainedConfig;
	isNull: BooleanConfig;
	oneOf: EnumerationConfig;
}
export interface SimpleValidationsConfiguration extends ConfigItem {
	composition: SimpleValidationComposition;
}
export interface SimpleValidationComposition {
	graph: Graph;
}
export interface EnumerationConfig extends ConfigItem {
	enumerations: string[];
	enumerationType: string;
}

export interface CopyEnumerationConfig extends ConfigItem {
	enumeration: string;
	enumerationType: string;
	targetProperty: string;
}

export interface BooleanConfig extends ConfigItem {}
export interface NumberConfig extends ConfigItem {
	value: string;
	equal?: boolean;
}
export interface GetExistingConfig extends AfterEffectRelations {}
/**
 * Describes how the model will be found
 */
export enum RelationType {
	Agent = 'Agent',
	Model = 'Model',
	ModelOuput = 'ModelOutput',
	Parent = 'Parent'
}
export interface ReturnSettingConfig extends ConfigItem {
	setting: ReturnSetting;
}
export function createReturnSetting(): ReturnSettingConfig {
	return {
		id: GUID(),
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
	name?: string;
	enabled: boolean;
	id: string;
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
	autoCalculate: boolean;
	dataChain: string;
	targetType: TargetMethodType;
	target: string;
	afterEffectNode?: string;
}

export interface PermissionConfig extends ValidationConfig {}
export interface ExecutionConfig extends ValidationConfig {}
export interface FilterConfig extends ValidationConfig {}
export interface ValidationConfig {
	id: string;
	name: string;
	dataChain: string;
	enabled: boolean;
	autoCalculate: boolean;
	dataChainOptions: DataChainConfiguration;
}
export interface StaticParameters extends ConfigItem {
	parameters: StaticParameter[];
}
export interface StaticParameter extends ConfigItem {
	enumeration: string;
	enumerationType: string;
	purpose: StaticParameterPurpose;
}
export enum StaticParameterPurpose {
	Routing = 'Routing'
}
export function duplicateValidationConfig(validationConfig: ValidationConfig): ValidationConfig {
	let result = { ...validationConfig };
	result.id = GUID();
	result.dataChainOptions = duplicateDataChainOptions(result.dataChainOptions);
	return result;
}

function duplicateDataChainOptions(dataChainOptions: DataChainConfiguration) {
	let res = JSON.parse(JSON.stringify(dataChainOptions));
	return res;
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
	staticParameters?: StaticParameters;
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
