import path from 'path';
import * as _ from '../utils/array';
import fs from 'fs';
export const MenuDataSourcePurpose = {
	Navigation: 'Navigation',
	Logout: 'Logout',
	Execute: 'Execute'
}
export const NodeTypes = {
	Concept: 'concept',
	Model: 'model',
	DataSource: 'data-source',
	Property: 'model-property',
	UserOfAgentType: 'UserOfAgentType',
	StateKey: 'StateKey',
	CustomComponent: 'CustomComponent',
	ModelFilter: 'model-filter',
	Struct: 'struct',
	UIMethod: 'UIMethod',
	MethodApiParameters: 'method-api-parameters',
	EventHandler: 'EventHandler',
	ComponentApiConnector: 'component-api-connector',
	ScreenContainer: 'screen-container',
	ScreenEffect: 'ScreenEffect',
	Swagger: 'Swagger',
	SwaggerApiPath: 'SwaggerApiPath',
	SwaggerApiDescription: 'SwaggerApiDescription',
	ScreenEffectApi: 'ScreenEffectApi',
	ComponentDidMountEffectApi: 'ComponentDidMountEffectApi',
	RootNode: 'composition-rootNode',
	LeafNode: 'composition-leafNode',
	ANDNode: 'composition-andNode',
	ORNode: 'composition-orNode',
	ContextualParameters: 'ContextualParameters',
	Screen: 'screen',
	EventMethod: 'EventMethod',
	VisualInsertLabel: 'VisualInsertLabel',
	NavigationAction: 'NavigationAction',
	NavigationScreen: 'NavigationScreen',
	Lists: 'Lists',
	EventMethodInstance: 'EventMethodInstance',
	PermissionDataChain: 'PermissionDataChain',
	ValidationDataChain: 'ValidationDataChain',
	ExecutionDataChain: 'ExecutionDataChain',
	LifeCylceMethod: 'LifeCylceMethod',
	EventArgument: 'EventArgument',
	LifeCylceMethodInstance: 'LifeCylceMethodInstance',
	Selector: 'selector',
	ComponentApi: 'ComponentApi',
	ComponentExternalApi: 'ComponentExternalApi',
	ScreenCollection: 'screen-collection',
	TitleService: 'titleService',
	ScreenItem: 'screen-item',
	Attribute: 'attribute-property',
	ChoiceList: 'choice-list',
	Permission: 'permission',
	MenuDataSource: 'MenuDataSource',
	Configuration: 'configuration',
	PermissionDependency: 'permission-dependency',
	ComponentNode: 'component-node',
	Condition: 'condition',
	ModelItemFilter: 'model-item-filter',
	Enumeration: 'enumeration', //Basically a list of const string.
	// ChoiceListItem: 'choice-list-item',
	ValidationList: 'validation-list',
	ValidationListItem: 'validation-list-item',
	ViewType: 'view-type',
	Validator: 'validator',
	Executor: 'executor', // performs the final acts or data manipulation.
	OptionList: 'option-list',
	OptionListItem: 'option-list-item',
	OptionCustom: 'option-custom',
	ScreenOption: 'screen-option',
	ExtensionTypeList: 'extension-type-list',
	ExtensionType: 'extension-type',
	Function: 'function',
	Method: 'method', //NGRX like effect
	AfterEffect: 'after-effect', // executes after a method finishes successfully.
	Action: 'action', //NGRX like action
	AgentAccessDescription: 'AgentAccessDescription', // Describes what agents will have access to in general.
	Parameter: 'parameter',
	ClaimService: 'ClaimService',
	FunctionOutput: 'function-output',
	Controller: 'controller',
	Maestro: 'maestro',
	Services: 'services',
	ReferenceNode: 'referenceNode', //Is a standing for a node that is at a higher level,
	ClassNode: 'class-node',
	DataChain: 'data-chain',
	ServiceInterface: 'service-interface',
	DefaultValue: 'default-value',
	ServiceInterfaceMethod: 'service-interface-method',
	ViewModel: 'view-model',
	FetchService: 'FetchService',
	Style: 'Style',
	Theme: 'Theme',
	DataChainCollection: 'DataChainCollection',
	PermissionTemplate: 'PermissionTemplate',
	ConditionTemplate: 'ConditionTemplate',
	VisualInsert: 'VisualInsert'
};

export const ConditionTypes = {
	Enumeration: 'Enumeration'
};

function fs_readdirSync(pa: string): string[] {
	let _path = path;
	try {
		return fs.readdirSync(pa);
	}
	catch {
		if (pa.indexOf('./app') !== -1) {
			try {
				return fs.readdirSync('./' + pa.substring('./app'.length));
			} catch (e) {
				try {
					return fs.readdirSync(_path.join('./resources/app.asar/', pa.substring('./app'.length)))
				} catch (e) {

				}
				return [];
			}
		}
	}
	return [];
}



export const NodeTypeIcons: any = {};
export function GetNodeTypeIcon(type: string | number) {
	if (!NodeTypeIcons[type]) {
		let files: string[] = [];
		try {
			files = fs_readdirSync('./app/css/svg');
		} catch (e) {
			console.log(e);
			try {
				files = [
					'001-flan.svg',
					'002-ice cream.svg',
					'003-cupcake.svg',
					'004-donut.svg',
					'005-milkshake.svg',
					'006-ice cream cup.svg',
					'007-chocolate bar.svg',
					'008-candy.svg',
					'009-ice cream cup.svg',
					'010-apple pie.svg',
					'011-cookie.svg',
					'012-piece of cake.svg',
					'013-cake.svg',
					'014-bread roll.svg',
					'015-croissant.svg',
					'016-pancakes.svg',
					'017-lollipop.svg',
					'018-cotton candy.svg',
					'019-chocolate bar.svg',
					'020-marshmallow.svg',
					'021-jelly.svg',
					'022-jam.svg',
					'023-honey.svg',
					'024-macaron.svg',
					'025-candy cane.svg',
					'026-popsicle.svg',
					'027-meringue.svg',
					'028-cookie.svg',
					'029-cake pop.svg',
					'030-candy.svg',
					'031-apple.svg',
					'032-candy.svg',
					'033-watermelon.svg',
					'034-ice cream sandwich.svg',
					'035-bread roll.svg',
					'036-jelly beans.svg',
					'037-crepe.svg',
					'038-waffle.svg',
					'039-cookie jar.svg',
					'040-cookie.svg',
					'041-strawberry.svg',
					'042-candy jar.svg',
					'043-hot chocolate.svg',
					'044-orange juice.svg',
					'045-gummy.svg',
					'046-bonbon.svg',
					'047-chocolate sticks.svg',
					'048-bread roll.svg',
					'049-lollipop.svg',
					'050-lollipop.svg'
				];
			} catch (e) {
				console.log(e);
			}
		}

		Object.values(NodeTypes).map((key, index) => {
			NodeTypeIcons[key] = `./css/svg/${files[index % files.length]}`;
		});
	}
	return NodeTypeIcons[type];
}
export const ExcludeDefaultNode = {
	[NodeTypes.Condition]: true,
	[NodeTypes.ModelItemFilter]: false
};
export const GeneratedTypes = {
	ChangeParameter: 'change-parameter',
	CSDataChain: 'data-chain-cs',
	ChangeResponse: 'change-response',
	Constants: 'constants',
	Validators: 'validator-generated',
	Permissions: 'permissions-generated',
	Executors: 'executors',
	StreamTypeService: 'stream-type-service',
	ModelItemFilter: 'model-item-filter',
	ModelReturn: 'model-return',
	ModelGet: 'model-get',
	ModelExceptions: 'model-exceptions',
	StreamProcess: 'stream-process',
	StreamProcessOrchestration: 'stream-process-orchestration',
	CustomService: 'custom-service'
	//  ValidationRule: 'validation-rule'
};
export const ReactNativeTypes = {
	Screens: 'screens',
	Navigation: 'navigation',
	ConstantsTs: 'constantsts',
	Keys: 'keys',
	ModelInterfaces: 'model-interfaces',
	ControllerActions: 'controller-actions',
	TitleService: 'title-service',
	Menus: 'menus',
	Configuration: 'configuration',
	CustomComponents: 'custom-components',
	Selectors: 'selectors',
	DataChainFunctions: 'data-chain',
	Lists: 'lists'
};
export const IdentityManagement = {
	RedQuickViews: 'RedQuickViews'
};
export const STANDARD_TEST_USING = [
	'Microsoft.VisualStudio.TestTools.UnitTesting',
	'RedQuick.Storage',
	'RedQuickCore.Worker',
	'Moq',
	'Autofac',
	'RedQuickCore.Worker.Hosts',
	'RedQuick.Configuration',
	'Microsoft.Extensions.Configuration.Json'
];
export const STANDARD_CONTROLLER_USING = [
	'RedQuick.Data',
	'RedQuick.Attributes',
	'RedQuick.Interfaces',
	'RedQuick.Validation',
	'RedQuickCore.Identity',
	'RedQuickCore.Validation.Rules',
	'RedQuickCore.Data',
	'RedQuick.Interfaces.Arbiter',
	'RedQuick.Configuration',
	'RedQuick.Util',
	'RedQuick.Interfaces',
	'RedQuick.Interfaces.Data',
	'RedQuick.UI',
	'System',
	'System.Collections',
	'System.Collections.Generic',
	'System.Linq',
	'System.Net',
	'System.Net.Http',
	'System.Threading.Tasks'
];
export const GeneratedConstants = {
	Methods: 'Methods',
	StreamTypes: 'StreamType',
	FunctionName: 'FunctionName'
};
export const GeneratedTypesMatch = {
	[GeneratedTypes.ChangeParameter]: NodeTypes.Model
};
export const ColorStates = {
	Error: 'Error'
};
export const NotSelectableNodeTypes = {
	[NodeTypes.ReferenceNode]: true,
	[NodeTypes.PermissionDependency]: true,
	[NodeTypes.Condition]: true
};

export const NodeTypeColors = {
	[ColorStates.Error]: '#FF0000',
	[NodeTypes.Concept]: '#DD4B39',
	[NodeTypes.ModelItemFilter]: '#4ECDC4',
	[NodeTypes.DefaultValue]: '#34EF2',
	[NodeTypes.ViewType]: '#412451',
	[NodeTypes.Model]: '#713E5A',
	[NodeTypes.Property]: '#484349',
	[NodeTypes.Screen]: '#3A405A',
	[NodeTypes.RootNode]: '#44CCFF',
	[NodeTypes.ANDNode]: '#35FF69',
	[NodeTypes.ORNode]: '#D138BF',
	[NodeTypes.Attribute]: '#414770',
	[NodeTypes.ChoiceList]: '#457B9D',
	[NodeTypes.ValidationList]: '#A8DADC',
	[NodeTypes.ValidationListItem]: '#EA526F',
	[NodeTypes.Selector]: '#20063B',
	[NodeTypes.OptionList]: '#2EC4B6',
	[NodeTypes.OptionListItem]: '#856A5D',
	[NodeTypes.MenuDataSource]: '#3B429F',
	[NodeTypes.OptionCustom]: '#403F4C',
	[NodeTypes.ExtensionTypeList]: '#2C2B3C',
	[NodeTypes.ExtensionType]: '#1B2432',
	[NodeTypes.Method]: '#BE95C4',
	[NodeTypes.Permission]: '#383F51',
	[NodeTypes.Function]: '#553D36',
	[NodeTypes.AgentAccessDescription]: '#2B59C3',
	[NodeTypes.Parameter]: '#684A52',
	[NodeTypes.FunctionOutput]: '#857885',
	[NodeTypes.Services]: '#59FFA0',
	[NodeTypes.ClassNode]: '#C3BAAA',
	[NodeTypes.Maestro]: '#780116',
	[NodeTypes.Swagger]: '#E952DE',
	[NodeTypes.SwaggerApiPath]: '#B24C63',
	[NodeTypes.SwaggerApiDescription]: '#386641',
	[NodeTypes.Condition]: '#CAFE48',
	[NodeTypes.Validator]: '#151522',
	[NodeTypes.ModelFilter]: '#312313',
	[NodeTypes.Executor]: '#2176FF',
	[NodeTypes.ReferenceNode]: '#F7B538',
	[NodeTypes.ScreenCollection]: '#A9DBB8',
	[NodeTypes.ScreenItem]: '#020887',
	[NodeTypes.ScreenContainer]: '#60B2E5',
	[NodeTypes.ComponentNode]: '#B7245C',
	[NodeTypes.DataSource]: '#002500',
	[NodeTypes.Condition]: '#F90093',
	[NodeTypes.DataChain]: '#FF6B6B',
	[NodeTypes.ServiceInterface]: '#4A6D7C',
	[NodeTypes.MethodApiParameters]: '#ff0001',
	[NodeTypes.ComponentApi]: '#E2C044',
	[NodeTypes.ComponentExternalApi]: '#2E5266',
	[NodeTypes.NavigationAction]: '#1282A2',
	[NodeTypes.NavigationScreen]: '#148222',
	[NodeTypes.Lists]: '#2DC7FF',
	[NodeTypes.ClaimService]: '#034748',
	[NodeTypes.FetchService]: '#BA1200',
	[NodeTypes.Style]: '#f12100',
	[NodeTypes.DataChainCollection]: '#2191FB'
};

export const NavigateTypes: any = {
	Back: 'GoBack',
	Replace: 'Replace',
	Forward: 'GoForward',
	Go: 'Go'
};

export const FunctionGroups = {
	External: 'external',
	Internal: 'internal',
	Core: 'core'
};
export const GroupProperties = {
	IsExternal: 'isExternal',
	FunctionGroup: 'FunctionGroup',
	GroupEntryNode: 'GroupEntryNode',
	GroupExitNode: 'GroupExitNode',
	ExternalExitNode: 'ExternalExitNode',
	ExternalEntryNode: 'ExternalEntryNode'
};
export const NameSpace = {
	Model: '.Models',
	StreamProcess: '.ActionStream',
	Executors: '.Executors',
	Tests: '.Tests',
	Extensions: '.Extensions',
	Controllers: '.Controllers',
	Validations: '.Validations',
	Constants: '.Constants',
	Permissions: '.Permissions',
	Parameters: '.Parameters',
	Interface: '.Interface'
};

export const MAIN_CONTENT = 'MAIN_CONTENT';
export const MIND_MAP = 'MIND_MAP';
export const CODE_VIEW = 'CODE_VIEW';
export const ANALYSIS_VIEW = 'ANALYSIS_VIEW';
export const LAYOUT_VIEW = 'LAYOUT_VIEW';
export const TRANSLATION_VIEW = 'TRANSLATION_VIEW';
export const PROGRESS_VIEW = 'PROGRESS_VIEW';
export const CODE_EDITOR = 'CODE_EDITOR';
export const THEME_VIEW = 'THEME_VIEW';
export const COMPONENT_EDITOR = 'COMPONENT_EDITOR';
export const AGENT_ACCESS_VIEW = 'AGENT_ACCESS_VIEW';

export const GeneratedDataTypes = {
	FirstName: 'First Name',
	LastName: 'Last Name',
	Name: 'Name',
	Date: 'Date',
	Id: 'Id',
	Ids: 'Ids',
	ProfileImage: 'Profile Image',
	LoremIpsum: 'Lorem-Ipsum',
	Guid: 'Guid',
	ListOfGuids: 'Guids',
	Number: 'Number'
};

export const ConfigurationProperties = {
	Domain: 'Configuration_Domain'
};

export const ApiNodeKeys = {
	ViewModel: 'viewModel',
	ViewId: 'viewId'
};
export const SelectorPropertyKeys = {
	Dirty: 'dirty',
	Focused: 'focused',
	Focus: 'focus',
	Object: 'object',
	Blur: 'blur'
};
export const MediaQueries: any = {
	['Extra small devices']: '@media only screen and (max-width: 600px)',
	['Small devices']: '@media only screen and (min-width: 600px)',
	['Media devices']: '@media only screen and (min-width: 768px)',
	['Large devices']: '@media only screen and (min-width: 992px)',
	['Extra devices']: '@media only screen and (min-width: 1200px)'
};
export const SelectorType = {
	InternalProperties: 'InternalProperties'
};

export const DefaultPropertyValueType = {
	Enumeration: 'Enumeration'
};

export const EventArgumentTypes = {
	RouteSource: 'RouteSource'
};

export const PropertyCentricTypes = {
	Route: 'Route',
	Effect: 'Effect'
};
export const UIActionMethods = {
	GetModelProperty: 'GetModelProperty',
	LoadModel: 'LoadModel',
	StoreResultInReducer: 'StoreResultInReducer',
	NavigateToScreen: 'NavigateToScreen',
	StoreInLake: 'StoreInLake',
	NavigateToRoute: 'NavigateToRoute',
	GetMenuDataSource: 'GetMenuDataSource',
	StoreModelArray: 'StoreModelArray'
};
export const UIActionMethodParameterTypes = {
	Model: 'model',
	ModelKey: 'modelKey',
	Property: 'property',
	Navigate: 'Navigate',
	StateKey: 'stateKey',
	StateViewModel: 'StateViewModel',
	Routes: 'Routes',
	RouteDescription: 'RouteDescription',
	ScreenRoute: 'ScreenRoute',
	FunctionParameter: 'FunctionParameter',
	NullParameter: 'NullParameter',
	GetMenuSource: 'GetMenuSource',
	FetchModel: 'fetchModel',
	ViewModelKey: 'viewModelKey',
	RedGraph: 'RedGraph',
	RetrieveParameters: 'RetrieveParameters'
};

export enum StandardVisuals {
	Register = 'Register',
	ContinueAs = 'ContinueAs',
	Authenticate = 'Authenticate',
	ForgotLogin = 'ForgotLogin',
	AnonymousGuest = 'AnonymousGuest',
	HomeView = 'HomeView'
}

export const NodeProperties = {
	ViewPackage: 'view-package',
	DataChainCollectionChildrenCount: 'DataChainCollectionChildrenCount',
	Screen: 'Screen',
	MenuRootNode: 'MenuRootNode',
	IsFetchOutput: 'IsFetchOutput',
	Implementation: 'Implementation',
	UIActionMethod: 'UIActionMethod',
	HideStyle: 'HideStyle',
	VisualInsert: 'VisualInsert',
	IsPropertyCentric: 'IsPropertyCentric',
	RouteInjection: 'RouteInjection',
	PropertyCentricType: 'PropertyCentricType',
	PropertyBeingUsed: 'PropertyBeingUsed',
	IsFetchParameter: 'IsFetchParameter',
	OriginalConfig: 'OriginalConfig',
	ViewModelKey: 'ViewModelKey',
	DataChainPurpose: 'DataChainPurpose',
	UserOfAgent: 'UserOfAgent',
	StateKey: 'StateKey',
	AutoCalculate: 'AutoCalculate',
	DefaultPropertyValueType: 'DefaultPropertyValueType',
	DefaultPropertyValue: 'DefaultPropertyValue',
	SwaggerNode: 'SwaggerNode',
	SwaggerClassName: 'SwaggerClassName',
	GridPlacement: 'GridPlacement',
	CompleteFunction: 'CompleteFunction',
	ArbiterModels: 'ArbiterModels',
	IsFetchDataChainStorage: 'IsFetchDataChainStorage',
	IsDashboard: 'IsDashboard',
	GridRowCount: 'GridRowCount',
	MergeNode: 'MergeNode',
	DataChainTypeName: 'DataChainTypeName',
	DataChainSourceFile: 'DataChainSourceFile',
	DataChainTypeCategory: 'DataChainTypeCategory',
	IsHomeLaunchView: 'IsHomeLaunchView',
	UseDefaultValue: 'UseDefaultValue',
	DefaultValue: 'DefaultValue',
	HoverStyle: ':hover',
	IsRoot: 'composition-isRoot',
	AfterEffectMethodChain: 'AfterEffectMethodChain',
	IsHomeView: 'IsHomeView',
	AsLocalContext: 'AsLocalContext',
	GeneratedConcept: 'GeneratedConcept',
	DataChainName: 'DataChainName',
	ActiveStyle: ':active',
	Themes: 'Themes',
	IsCompositionLeaf: 'IsCompositionLeaf',
	SharedReferenceCollection: 'SharedReferenceCollection',
	BeforeStyle: '::before',
	ValidationConfigurationItem: 'ValidationConfigurationItem',
	AfterEffectKey: 'AfterEffectKey',
	GridAreas: 'GridAreas',
	AfterStyle: '::after',
	LastViewPackage: 'LastViewPackage',
	MediaQuery: 'MediaQuery',
	UseMediaQuery: 'UseMediaQuery',
	UseValue: 'UseValue',
	CheckedStyle: ':checked',
	DisabledStyle: ':disabled',
	EmptyStyle: ':empty',
	EnabledStyle: ':enabled',
	FirstChildStyle: ':first-child',
	LastChildStyle: ':last-child',
	FocusStyle: ':focus',
	ReadOnlyStyle: ':read-only',
	DefaultComponentApiValue: 'DefaultComponentApiValue',
	ExcludeFromGeneration: 'ExcludeFromGeneration',
	ViewPackageTitle: 'view-package-title',
	ComponentApi: 'component-api',
	DefaultViewModel: 'DefaultViewModel',
	SelectorType: 'selector-type',
	UseInstanceType: 'UseInstanceType',
	SharedComponent: 'SharedComponent',
	EventType: 'EventType',
	EnabledMenu: 'EnabledMenu',
	InstanceType: 'InstanceType',
	ComponentParameters: 'ComponentParameters',
	NavigationParameters: 'NavigationParameters',
	UseNavigationParams: 'UseNavigationParams',
	ClientMethod: 'ClientMethod',
	MethodParameters: 'MethodParameters',
	NavigationParametersProperty: 'NavigationParametersProperty',
	ExecuteButton: 'ExecuteButton',
	MethodParameterProperty: 'MethodParameterProperty',
	ScreenParameters: 'ScreenParameters',
	Method: 'Method',
	SelectedLayoutCell: 'SelectedLayoutCell',
	ChainParent: 'ChainParent',
	Navigation: 'Navigation',
	ValidationMethodTarget: 'ValidationMethodTarget',
	ClientMethodParameters: 'ClientMethodParameters',
	DashboardViewComponent: 'DashboardViewComponent',
	AsOutput: 'AsOutput',
	UIAgnostic: 'UIAgnostic',
	EntryPoint: 'EntryPoint',
	CSEntryPoint: 'CSEntryPoint',
	CS: 'CS',
	IsUserOfAgentType: 'IsUserOfAgentType',
	UpdateAgentPostRegistrationMethod: 'UpdateAgentPostRegistrationMethod',
	Property: 'Property',
	DataChainEntry: 'DataChainEntry',
	MergeChain: 'MergeChain',
	ComponentProperties: 'ComponentProperties',
	Layout: 'Layout',
	Domain: 'Domain',
	Priority: 'Priority',
	DataChain: 'DataChain',
	OnBlur: 'onBlur',
	Selector: 'Selector',
	ScreenOption: 'ScreenOption',
	SelectorProperty: 'SelectorProperty',
	Value: 'Value',
	ContextParams: 'ContextParams',
	value: 'value',
	viewId: 'viewId',
	Number: 'Number',
	OnFocus: 'onFocus',
	Purpose: 'Purpose',
	OnChange: 'onChangeText',
	SharedMenuCollection: 'SharedMenuCollection',
	UIType: 'UIType',
	DashboardButtons: 'DashboardButtons',
	TextType: 'TextType',
	Enumeration: 'Enumeration',
	ConditionType: 'ConditionType',
	MatchReference: 'MatchReference',
	MatchManyReferenceParameter: 'MatchManyReferenceParameter',
	EnumerationReference: 'EnumerationReference',
	AllowedExtensionValues: 'AllowedExtensionValues',
	ServiceType: 'ServiceType',
	DisallowedExtensionValues: 'DisallowedExtensionValues',
	AllowedEnumValues: 'AllowedEnumerationValue',
	DisallowedEnumValues: 'DisallowedEnumValues',
	Condition: 'Condition',
	ServiceTypeSettings: 'ServiceTypeSettings',
	ValidatorModel: 'ValidatorModel',
	ExecutorAgent: 'ExecutorAgent',
	ExecutorFunction: 'ExecutorFunction',
	ExecutorModel: 'ExecutorModel',
	ExecutorModelOutput: 'ExecutorModelOutput',
	ExecutorFunctionType: 'ExecutorFunctionType',
	ValidatorFunction: 'ValidatorFunction',
	UseEnumeration: 'UseEnumeration',
	NameSpace: 'namespace',
	FilterModel: 'filtermodel',
	FilterAgent: 'filteragent',
	Validator: 'Validator',
	ModelItemFilter: 'ModelItemFilter',
	Executor: 'Executor',
	ValidatorAgent: 'ValidatorAgent',
	Collapsed: 'collapsed',
	UseExtension: 'usextension',
	IncludedInList: 'includedInList',
	IsShared: 'IsShared',
	Pinned: 'Pinned',
	UseInView: 'UseInView',
	Selected: 'Selected',
	ExcludedFromList: 'excludedInList',
	IgnoreInView: 'IgnoreInView',
	UseEqual: 'UseEqual',
	IsEqualTo: 'IsEqualTo',
	CodeUser: 'codeUser',
	HttpRoute: 'HttpRoute',
	HttpMethod: 'HttpMethod',
	ExcludeFromController: 'ExcludeFromController',
	IsAgent: 'isAgent',
	CancelButton: 'CancelButton',
	ComplexType: 'ComplexType',
	IsCompositeInput: 'IsCompositeInput',
	IsParent: 'isParent', //This is a program setting. Just for allowing us to hide and show the model picker.
	IsUser: 'IsUser', //User is the object directly associated with a IdentityProvider.
	IsOwnedByAgents: 'IsOwnedByAgents',
	UIUser: 'uiUser',
	IsSharedResource: 'isSharedResource', // Not sure if this helps anything.
	UIPermissions: 'uiPermissions',
	IsOwned: 'isOwned',
	UIName: 'uiName', // The name used in the ui.
	QueryParameterObjectExtendible: 'QueryParameterObjectExtendible',
	QueryParameterObject: 'QueryParameterObject',
	QueryParameterParam: 'QueryParameterParam',
	DefaultAgent: 'DefaultAgent',
	QueryParameterParamType: 'QueryParameterParamType',
	TemplateParameter: 'TemplateParameter',
	TemplateParameterType: 'TemplateParameterType',
	IsQuery: 'query',
	AutoDelete: 'AutoDelete', // Anything matching the properties etc, will auto delete along with the current node.
	UriBody: 'UriBody',
	UriParameter: 'UriParameter',
	NodePackage: 'NodePackage',
	NodePackageType: 'NodePackageType',
	NodePackageAgent: 'NodePackageAgent',
	IsPagingModel: 'IsPagingModel',
	PagingSkip: 'Skip',
	IsPaging: 'IsPaging',
	PagingTake: 'Take',
	PagingFilter: 'Filter',
	PagingSort: 'PagingSort',
	IsViewModel: 'IsViewModel',
	// ComponentApiKey: 'ComponentApiKey',
	IsDataChainPagingSkip: 'IsDataChainPagingSkip',
	BooleanType: 'composition-boolean',
	IsDataChainPagingTake: 'IsDataChainPagingTake',
	UIText: 'text',
	Target: 'Target',
	SwaggerPath: 'SwaggerPath',
	UseAsValue: 'UseAsValue',
	IsUrlParameter: 'IsUrlParameter',
	PermissionSummary: 'PermissionSummary',
	ValidationSummary: 'ValidationSummary',
	ExecutionSummary: 'ExecutionSummary',
	NavigationAction: 'NavigationAction',
	AgentBasedMethod: 'AgentBasedMethod',
	ViewType: 'view-type',

	IsReferenceList: 'isReferenceList',
	UseHttps: 'UseHttps',
	Description: 'description',
	IsSwagger: 'IsSwagger',
	SwaggerMethodDefinition: 'SwaggerMethodDefinition',
	SwaggerEndpoint: 'SwaggerEndpoint',
	UISingular: 'uiSingular',
	UIChoice: 'uiChoice',
	UIChoiceType: 'uiChoiceType',
	UIChoiceNode: 'uiChoiceNode', //A node that the "parameter" node points to.
	PermissionRequester: 'permissions-requester', // The agent that is requesting permission to do something
	PermissionManyToMany: 'permissions-many-to-many',
	MatchIds: 'matchs-ids',
	ConnectionExists: 'connection-exists',
	PermissionTarget: 'permissions-target',
	// Property has a dependent property
	UIDependsOn: 'uiDependsOn',
	UseUIDependsOn: 'UseuiDependsOn',
	UseUIOptions: 'UseuiOptions',
	UIOptionType: 'uiOptionType',

	//Use a custom option
	UseCustomUIOption: 'useCustomUIOption',
	UIOptionTypeCustom: 'uiOptionTypeCustom',
	//An option
	UIOption: 'uiOption',
	//Use Extensions
	UseUIExtensionList: 'UseuiExtensionList',
	UIExtensionList: 'uiExtensionList',
	UIExtension: 'uiExtension',
	UIExtensionDefinition: 'uiExtensionDefinition',
	Label: 'Label',
	Error: 'Error',
	Placeholder: 'Placeholder',
	Options: 'Options',
	Success: 'Success',
	Style: 'Style',
	MethodProps: 'methodProperties',
	FilterPropreties: 'filterproperties',
	UIValidationType: 'uiValidationType',
	UseUIValidations: 'UseuiValidations',
	NODEType: 'nodeType',
	DefaultViewTypeGet: 'DefaultViewTypeGet',
	DefaultViewTypeGetAll: 'DefaultViewTypeGetAll',
	DefaultViewTypeUpdate: 'DefaultViewTypeUpdate',
	DefaultViewTypeDelete: 'DefaultViewTypeDelete',
	DefaultViewTypeCreate: 'DefaultViewTypeCreate',
	ComponentType: 'component-type',
	UseCustomComponent: 'UseCustomComponent',
	CustomComponent: 'CustomComponent',
	UsingSharedComponent: 'UsingSharedComponent',
	ReferenceType: 'referenceType', //Reference nodes will have this type.

	ComponentDidMountEvent: 'component-did-mount',
	UIAttributeType: 'uiAttributeType',
	PermissionValueType: 'PermissionValueType',
	UseModelAsType: 'useModelAsType',
	UseComplexAsType: 'UseComplexAsType',

	IsDefaultProperty: 'isDefaultProperty',
	ExecuteComponent: 'ExecuteComponent',
	ComplexAsType: 'ComplexAsType',
	HasLogicalChildren: 'hasLogicalChildren',
	LogicalChildrenTypes: 'logicalChildrenTypes',
	HasLogicalNieces: 'hasLogicalNieces',
	LogicalNieceTypes: 'logicalNieceTypes',
	ValidationPropertyName: 'ValidationPropertyName',
	IsPluralComponent: 'IsPluralComponent',
	DataGenerationType: 'data-generation-type',

	ManyToManyNexus: 'manyToManyNexux',
	ManyToManyNexusType: 'manyToManyNexusType',
	ManyToManyNexusTypes: 'manyToManyNexusTypes',

	MethodType: 'MethodType',
	ChainNodeInput2: 'ChainNodeInput2',
	ScreenInstance: 'ScreenInstance',
	Model: 'Model',
	NavigationScreen: 'NavigationScreen',
	Agent: 'Agent',
	ChainNodeInput1: 'ChainNodeInput1',
	List: 'List',
	UIModelType: 'uiModelType',
	IsTypeList: 'IsTypeList',
	DataChainReferences: 'DataChainReferences',
	Lambda: 'Lambda',
	LambdaInsertArguments: 'LambdaInsertArguments',
	RouteSource: 'RouteSource',
	ParameterName: 'ParameterName',
	EventArgumentType: 'EventArgumentType',
	TargetProperty: 'TargetProperty',
	ModelKey: 'ModelKey',
	DataChainReference: 'DataChainReference',
	NumberParameter: 'NumberParameter',

	UseScopeGraph: 'UseScopeGraph',
	ScopeGraph: 'scopedGraph',

	DataChainFunctionType: 'DataChainFunctionType',
	DataChainNameSpace: 'DataChainNameSpace',
	DataChainProperty: 'DataChainProperty',
	QueryParameterType: 'QueryParameterType',
	Component: 'Component',

	AfterMethod: 'after-method',
	AfterMethodSetup: 'after-method-setup',

	//The name used for code.
	Groups: 'groups',
	GroupParent: 'groupParent',
	CodeName: 'codeName',
	CssName: 'cssName',
	ValueName: 'valueName', //The name of the instance variable to be used
	AgentName: 'agentName', //The name of the instance variable to be used
	CodePropertyType: 'codeProperty',
	FunctionType: 'functionType',
	MethodFunctionValidation: 'method-function-validation',
	NotIncludedInController: 'not-included-in-controller',
	PermissionImpl: 'permission-implementation',
	NoApiPrefix: 'no-api-prefix',
	AsForm: 'as-form',
	CollectCookies: 'collect-cookies',
	AsText: 'as-text',
	ClassConstructionInformation: 'ClassConstructionInformation',
	DataChainCollection: 'DataChainCollection'
};
export const StyleNodeProperties = [
	NodeProperties.ActiveStyle,
	NodeProperties.HoverStyle,
	NodeProperties.CheckedStyle,
	NodeProperties.DisabledStyle,
	NodeProperties.EmptyStyle,
	NodeProperties.EnabledStyle,
	NodeProperties.FirstChildStyle,
	NodeProperties.LastChildStyle,
	NodeProperties.FocusStyle,
	NodeProperties.ReadOnlyStyle,
	NodeProperties.BeforeStyle,
	NodeProperties.AfterStyle
];
export const DIRTY_PROP_EXT = '$ _dirty_ $';

const letters = 'abcdefghijklmnopqrstuvwxyz';
const alphanumerics = letters + '0123456789';
const allowedchars = alphanumerics + ' ';
export function MakeConstant(val: any | string | number | string[]) {
	if (val) {
		if (!isNaN(val)) {
			return `"${val}"`;
		}
		val = `${val}`;
		val = val.split('').filter((x: string) => allowedchars.indexOf(x.toLowerCase()) !== -1).join('');
		if (letters.indexOf(val[0].toLowerCase()) === -1) {
			val = '_' + val;
		}
		return val.split(' ').join('_').toUpperCase();
	}
	throw 'needs to have value';
}

export function ConstantsDeclaration(options: { name: any; value: any }) {
	var { name, value } = options;

	return `public const string ${name} = ${value};`;
}

export function CreateStringList(options: { name: any; list: any; instance: any }) {
	var { name, list, instance } = options;
	return `${instance ? '' : 'public'} IList<string> ${name} = new List<string> {
        ${list}
    }`;
}
export const LinkEvents = {
	Remove: 'remove'
};
export const LinkType = {
	Choice: 'choice',
	MethodApiParameters: 'MethodApiParameters',
	DefaultViewType: 'DefaultViewType',
	SharedComponent: 'SharedComponent',
	ScreenEffect: 'ScreenEffect', // Screen effects link to datachains, that can be used for defining $internalComponentState
	// Connections to arguments used inside a lambda
	ScreenEffectApi: 'ScreenEffectApi', // Screen effects api link to a datachain ,with the assumption that they will be an
	ComponentDidMountEffectApi: 'ComponentDidMountEffectApi',
	// internal component api
	ScreenVisualInsert: 'ScreenVisualInsert',
	LambdaInsertArguments: 'LambdaInsertArguments',
	ClaimServiceAuthorizationMethod: 'ClaimServiceAuthorizationMethod',
	ClaimServiceUpdateUserMethod: 'ClaimServiceUpdateUserMethod',
	ExecutorServiceMethod: 'ExecutorServiceMethod',
	DataChainAfterEffectConverter: 'DataChainAfterEffectConverter',
	DataChainAfterEffectConverterTarget: 'DataChainAfterEffectConverterTarget',
	UserOfAgentType: 'UserOfAgentType',
	DataChainShouldShow: 'DataChainShouldShow',
	ContextParameters: 'ContextParameters',
	PermissionDataChain: 'PermissionDataChain',
	ValidationDataChain: 'ValidationDataChain',
	ExecutionDataChain: 'ExecutionDataChain',
	DataChainIsDisabled: 'DataChainIsDisabled',
	Composition: 'Composition',
	DataChainLogout: 'DataChainLogout',
	VisualInsertLabel: 'VisualInsertLabel',
	SwaggerClass: 'SwaggerClass',
	UIMethod: 'UIMethod',
	SwaggerMethodDescription: 'SwaggerMethodDescription',
	SwaggerPaths: 'SwaggerPaths',
	StateKey: 'StateKey',
	DataChainScreenEffect: 'DataChainScreenEffect',
	DataChainScreenEffectImpl: 'DataChainScreenEffectImpl',
	DefaultValue: 'DefaultValue',
	ComponentNodeLink: 'ComponentNodeLink',
	EventArgument: 'EventArgument',
	MethodArgumentSoure: 'MethodArgumentSoure',
	LifeCylceMethodInstance: 'LifeCylceMethodInstance',
	ModelKey: 'ModelKey',
	AgentAccess: 'AgentAccess',
	ModelAccess: 'ModelAccess',
	DashboardAccess: 'DashboardAccess',
	MenuLink: 'MenuLink',
	AccessScreen: 'AccessScreen',
	NavigationScreen: 'NavigationScreen',
	NavigationScreenImplementation: 'NavigationScreenImplementation',
	ViewModelKey: 'ViewModelKey',
	LifeCylceMethod: 'LifeCylceMethod',
	ConditionTemplate: 'ConditionTemplate',
	ComponentApiConnector: 'Component Api Connector',
	EventMethod: 'EventMethod',
	UsingSharedComponent: 'UsingSharedComponent',
	EventMethodInstance: 'EventMethodInstance',
	NavigationMethod: 'NavigationMethod',
	MethodCall: 'MethodCall',
	ValidatorServiceMethod: 'ValidatorServiceMethod',
	PermissionServiceMethod: 'PermissionServiceMethod',
	ComponentApiConnection: 'ComponentApiConnection',
	Lists: 'Lists',
	EventHandler: 'EventHandler',
	SharedComponentInstance: 'SharedComponentInstance',
	Executor: 'executor',
	ExecutorItem: 'executor-item',
	ExecutorProperty: 'executor-property',
	ServiceInterfaceMethod: 'service-interface-method',
	ExecutorModel: 'executor-model',

	Condition: 'condtion',
	ModelItemFilter: 'model-item-filter',

	AfterMethod: 'after-method',

	Validation: 'validation',
	ValidationItem: 'validation-item',
	Validator: 'validator',
	ValidatorProperty: 'validator-property',
	ValidatorModel: 'validator-model',
	Configuration: 'configuration',
	ExecutorFunction: 'executor-function',
	ValidatorFunction: 'validator-function',
	ValidatorModelItem: 'validator-model-item',
	ValidatorAgent: 'validator-agent',
	Option: 'option',
	OptionItem: 'option-item',
	OptionCustom: 'option-custom',
	DependsOn: 'depends-on',
	ExtensionList: 'extension-list',
	Extension: 'extension',
	ScreenOptions: 'screen-options',
	ListItem: 'list-item',
	FetchService: 'FetchService',
	FetchServiceOuput: 'FetchServiceOuput',
	FetchSserviceAgent: 'FetchSserviceAgent',
	Enumeration: 'enumeration',
	ClientMethod: 'ClientMethod',
	DataSource: 'DataSource',
	ComponentApi: 'ComponentApi',
	ComponentInternalConnection: 'component-internal-connection',
	ComponentExternalConnection: 'component-external-connection',
	ComponentExternalApi: 'component-external-api',
	ComponentInternalApi: 'component-internal-api',
	ViewModelLink: 'view-model-link',
	Component: 'component',
	DataChainInputLink: 'DataChainInputLink',
	DataChainLink: 'data-chain-link',
	PreDataChainLink: 'PreDataChainLink',
	CallDataChainLink: 'CallDataChainLink',
	QueryLink: 'query-link',
	SelectorLink: 'selector-link',
	SelectorInputLink: 'selector-input-link',
	TitleServiceLink: 'title-service-link',
	ComponentProperty: 'component-link',
	EnumerationReference: 'enumeration-reference',
	GeneralLink: 'GeneralLink',
	DataChainAfterEffectSubsequentCall: 'DataChainAfterEffectSubsequentCall',
	LogicalChildren: 'logical-children',
	LogicalNieces: 'logical-nieces',
	ManyToManyLink: 'ManyToManyLink',
	Permission: 'permission',
	AppliedPermissionLink: 'applied-permission',
	RequestorPermissionLink: 'request-permission-link', //the agent/node that is requesting permissions
	ManyToManyPermissionLink: 'many-to-many-permission-link',
	ExtensionDependencyLink: 'extension-dependency-link',
	FunctionOperator: 'function-operator',
	FunctionLink: 'function-link',
	OnScreenLink: 'screen-link',
	OnSuccessLink: 'on-success-link',
	OnFailureLink: 'on-failure-link',
	OnAction: 'on-action',
	ChildLink: 'child-link', //describing a link between screens
	OnItemSelection: 'on-item-selection',
	FunctionVariable: 'function-variable',
	PropertyLink: 'property-link',
	ParentLink: 'parent-link',
	FunctionConstraintLink: 'function-constraint-link',
	ErrorLink: 'error-link',
	RequiredClassLink: 'required-class-link',
	ModelTypeLink: 'model-type-link',
	AgentTypeLink: 'agent-type-link',
	UserLink: 'user-link', // A link between a user and a personal ([Customer, Manager, Hero])
	MaestroLink: 'maestro-link',
	AttributeLink: 'attribute-link',
	PermissionFunction: 'permission-function',
	Exist: 'exist', //A node that points with this link type, requires that the node exists, if it doesn't the link and the other node should dissapear.
	PermissionPropertyDependency: 'permission-property-dependency', //There is a link between a permision and a property.
	PermissionDependencyProperty: 'permission-dependency-property', //There is a link bewteen a property and a dependency
	PermissionDependencyPropertyManyToManyLink: 'permission-dependency-property-many-to-many', //There is a link between a property and a dependency in a many to many situation.
	PermissionPropertyDependencyManyToManyLink: 'permission-property-dependency-many-to-many', //There is a link between a permision and a property in a many to many situnation.
	Style: 'Style',
	DataChainCollection: 'DataChainCollection',
	DataChainCollectionReference: 'DataChainCollectionReference',
	DataChainStyleLink: 'DataChainStyleLink',
	StyleArgument: 'StyleArgument',
	AgentLink: 'AgentLink'
};
const VIKTIG_LINKS = 5;
export const LinkStyles = {
	[LinkType.FunctionLink]: {
		type: LinkType.FunctionLink,
		stroke: NodeTypeColors[NodeTypes.Function]
	},
	[LinkType.ScreenEffect]: {
		type: LinkType.ScreenEffect
	},
	[LinkType.ComponentInternalConnection]: {
		stroke: NodeTypeColors[NodeTypes.ComponentApi],
		type: LinkType.ComponentInternalConnection
	},
	[LinkType.StyleArgument]: {
		type: LinkType.StyleArgument
	},
	[LinkType.DefaultViewType]: {
		type: LinkType.DefaultViewType
	},
	[LinkType.ErrorLink]: {
		type: LinkType.ErrorLink,
		stroke: NodeTypeColors[ColorStates.Error]
	},
	[LinkType.OnScreenLink]: {
		type: LinkType.OnScreenLink,
		stroke: '#E1CE7A',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.DataChainLink]: {
		type: LinkType.DataChainLink,
		stroke: '#33673B',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.SelectorLink]: {
		type: LinkType.SelectorLink,
		stroke: '#20063B'
	},
	[LinkType.OnSuccessLink]: {
		type: LinkType.OnSuccessLink,
		stroke: '#A23B72',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.OnFailureLink]: {
		type: LinkType.OnFailureLink,
		stroke: '#3B1F2B',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.OnItemSelection]: {
		type: LinkType.OnItemSelection,
		stroke: '#2E86AB',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.OnAction]: {
		type: LinkType.OnAction,
		stroke: '#A3320B',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.ChildLink]: {
		type: LinkType.ChildLink,
		stroke: '#47A025',
		strokeWidth: VIKTIG_LINKS
	},
	[LinkType.FunctionConstraintLink]: {
		type: LinkType.FunctionConstraintLink,
		stroke: NodeTypeColors[NodeTypes.Function]
	},
	[LinkType.FunctionOperator]: {
		type: LinkType.FunctionOperator,
		stroke: NodeTypeColors[NodeTypes.Function]
	},
	[LinkType.PropertyLink]: {
		type: LinkType.PropertyLink,
		stroke: NodeTypeColors[NodeTypes.Property]
	},
	[LinkType.Choice]: {
		type: LinkType.Choice,
		stroke: NodeTypeColors[NodeTypes.ChoiceList]
	},
	[LinkType.Permission]: {
		type: LinkType.Permission,
		stroke: NodeTypeColors[NodeTypes.Permission]
	},
	[LinkType.AppliedPermissionLink]: {
		type: LinkType.AppliedPermissionLink,
		stroke: NodeTypeColors[NodeTypes.Permission]
	},
	[LinkType.Validation]: {
		type: LinkType.Validation,
		stroke: NodeTypeColors[NodeTypes.ValidationList]
	},
	[LinkType.Validator]: {
		type: LinkType.Validator,
		stroke: NodeTypeColors[NodeTypes.Validator]
	},
	[LinkType.Option]: {
		type: LinkType.Option,
		stroke: NodeTypeColors[NodeTypes.OptionList]
	},
	// Options for custom defined options, that need to be made later.
	[LinkType.OptionCustom]: {
		type: LinkType.OptionCustom,
		stroke: NodeTypeColors[NodeTypes.OptionCustom]
	},
	[LinkType.DependsOn]: {
		type: LinkType.DependsOn,
		stroke: NodeTypeColors[NodeTypes.Property]
	},
	[LinkType.ExtensionList]: {
		type: LinkType.ExtensionList,
		stroke: NodeTypeColors[NodeTypes.ExtensionTypeList]
	},
	[LinkType.Extension]: {
		type: LinkType.Extension,
		stroke: NodeTypeColors[NodeTypes.ExtensionType]
	},
	//This link is between an extension with a dependsOn property
	// It describes a link between a property and a secondary property.
	[LinkType.ExtensionDependencyLink]: {
		type: LinkType.ExtensionDependencyLink,
		stroke: NodeTypeColors[NodeTypes.ExtensionTypeList]
	}
};

export const LinkPropertyKeys = {
	TYPE: 'type',
	CONSTRAINTS: 'constraints',
	VALID_CONSTRAINTS: 'valid-constraints',
	BeforeCall: 'BeforeCall',
	FUNCTION_ID: 'function-id',
	InstanceUpdate: 'InstanceUpdate',
	ComponentTag: 'ComponentTag',
	Sibling: 'sibling',
	Parameters: 'parameters',
	Model: 'model',
	ViewModelKey: 'viewModelKey',
	ModelKey: 'modelKey',
	ComponentStyle: 'ComponentStyle',
	MethodProps: 'methodProps',
	MountingProps: 'mountingProps',
	ScreenEffectApiProps: 'screenEffectApiProps',
	DashboardScreenEffectApiProps: 'dashboardScreenEffectApiProps',
	ScreenVisualInsertApiProps: 'screenVisualInsertApiProps',
	DashboardScreenVisualInsertApiProps: 'dashboardScreenVisualInsertApiProps',
	ComponentDidMountApiProps: 'componentDidMountApiProps',
	DashboardComponentDidMountApiProps: 'dashboardComponentDidMountApiProps',
	RoutingProps: 'routingProps',
	EffectProps: 'effectProps',
	ComponentProperty: 'ComponentProperty',
	ViewType: 'viewType',
	DashboardAccessProps: 'dashboardAccessProps',
	DashboardViewMountProps: 'dashboardViewMountProps',
	DashboardRoutingProps: 'dashboardRoutingProps',
	DashboardEffectProps: 'dashboardEffectProps',
	AgentAccess: 'AgentAccess',
	RoutingDescriptionId: 'RoutingDescriptionId',
	Enumeration: 'Enumeration',
	AsForm: 'AsForm',
	DefaultValue: 'DefaultValue'
};

export const LinkProperties = {
	SharedComponent: {
		type: LinkType.SharedComponent
	},
	UserOfAgentType: {
		type: LinkType.UserOfAgentType
	},
	SwaggerClass: {
		type: LinkType.SwaggerClass
	},
	VisualInsertLabel: {
		type: LinkType.VisualInsertLabel
	},
	UIMethod: {
		type: LinkType.UIMethod
	},
	SwaggerPaths: {
		type: LinkType.SwaggerPaths
	},
	Composition: {
		type: LinkType.Composition
	},
	DataChainAfterEffectConverter: {
		type: LinkType.DataChainAfterEffectConverter
	},
	PermissionDataChain: {
		type: LinkType.PermissionDataChain
	},
	ValidationDataChain: {
		type: LinkType.ValidationDataChain
	},
	SwaggerMethodDescription: {
		type: LinkType.SwaggerMethodDescription
	},
	ExecutionDataChain: {
		type: LinkType.ExecutionDataChain
	},
	DataChainAfterEffectConverterTarget: {
		type: LinkType.DataChainAfterEffectConverterTarget
	},
	ScreenEffect: {
		type: LinkType.ScreenEffect
	},
	ScreenEffectApi: {
		type: LinkType.ScreenEffectApi
	},
	ScreenVisualInsert: {
		type: LinkType.ScreenVisualInsert
	},
	ComponentDidMountEffectApi: {
		type: LinkType.ComponentDidMountEffectApi
	},
	DataChainScreenEffect: {
		type: LinkType.DataChainScreenEffect
	},
	DataChainScreenEffectImpl: {
		type: LinkType.DataChainScreenEffectImpl
	},
	ContextualParameters: {
		type: LinkType.ContextParameters
	},
	ComponentNodeLink: {
		type: LinkType.ComponentNodeLink
	},
	MethodArgumentSoure: {
		type: LinkType.MethodArgumentSoure
	},
	EventArgument: {
		type: LinkType.EventArgument
	},
	AccessScreen: {
		type: LinkType.AccessScreen
	},
	AgentAccess: {
		type: LinkType.AgentAccess
	},
	DataChainShouldShow: {
		type: LinkType.DataChainShouldShow
	},
	DataChainIsDisabled: {
		type: LinkType.DataChainIsDisabled
	},
	DataChainLogout: {
		type: LinkType.DataChainLogout
	},
	NavigationScreen: {
		type: LinkType.NavigationScreen
	},
	NavigationScreenImplementation: {
		type: LinkType.NavigationScreenImplementation
	},
	DefaultValue: {
		type: LinkType.DefaultValue
	},
	MenuLink: {
		type: LinkType.MenuLink
	},
	ModelAccess: {
		type: LinkType.ModelAccess
	},
	LambdaInsertArguments: {
		type: LinkType.LambdaInsertArguments
	},
	ConditionTemplate: {
		type: LinkType.ConditionTemplate
	},
	ComponentApiConnector: {
		type: LinkType.ComponentApiConnector
	},
	DataChainCollection: {
		type: LinkType.DataChainCollection
	},
	DataChainCollectionReference: {
		type: LinkType.DataChainCollectionReference
	},
	DataChainStyleLink: {
		type: LinkType.DataChainStyleLink
	},
	StyleArgument: {
		type: LinkType.StyleArgument
	},
	LifeCylceMethodInstance: {
		type: LinkType.LifeCylceMethodInstance
	},
	ClaimServiceAuthorizationMethod: {
		type: LinkType.ClaimServiceAuthorizationMethod
	},
	ClaimServiceUpdateUserMethod: {
		type: LinkType.ClaimServiceUpdateUserMethod
	},
	ViewModelKey: {
		type: LinkType.ViewModelKey
	},
	ModelKey: {
		type: LinkType.ModelKey
	},
	StateKey: {
		type: LinkType.StateKey
	},
	MethodCall: {
		type: LinkType.MethodCall
	},
	LifeCylceMethod: {
		type: LinkType.LifeCylceMethod
	},
	EventMethod: {
		type: LinkType.EventMethod
	},
	EventMethodInstance: {
		type: LinkType.EventMethodInstance
	},
	NavigationMethod: {
		type: LinkType.NavigationMethod
	},
	MethodApiParameters: {
		type: LinkType.MethodApiParameters
	},
	PermissionServiceMethod: {
		type: LinkType.PermissionServiceMethod,
		nodeTypes: [NodeTypes.ServiceInterfaceMethod]
	},
	Lists: {
		type: LinkType.Lists
	},
	Style: {
		type: LinkType.Style
	},
	ComponentApiConnection: {
		type: LinkType.ComponentApiConnection
	},
	EventHandler: {
		type: LinkType.EventHandler
	},
	ExecutorServiceMethod: {
		type: LinkType.ExecutorServiceMethod,
		nodeTypes: [NodeTypes.ServiceInterfaceMethod]
	},
	ValidatorServiceMethod: {
		type: LinkType.ValidatorServiceMethod,
		nodeTypes: [NodeTypes.ServiceInterfaceMethod]
	},
	ServiceInterfaceMethod: {
		type: LinkType.ServiceInterfaceMethod
	},
	SharedComponentInstance: {
		type: LinkType.SharedComponentInstance
	},
	DefaultViewType: {
		type: LinkType.DefaultViewType
	},
	EnumerationLink: {
		type: LinkType.Enumeration
	},
	FetchService: {
		type: LinkType.FetchService
	},
	FetchSserviceAgent: {
		type: LinkType.FetchSserviceAgent
	},
	FetchServiceOuput: {
		type: LinkType.FetchServiceOuput
	},
	ClientMethodLink: {
		type: LinkType.ClientMethod
	},
	ComponentApi: {
		type: LinkType.ComponentApi
	},
	DataSourceLink: {
		type: LinkType.DataSource
	},
	ViewModelLink: {
		type: LinkType.ViewModelLink
	},
	ComponentInternalConnection: {
		type: LinkType.ComponentInternalConnection
	},
	ComponentExternalConnection: {
		type: LinkType.ComponentExternalConnection
	},
	ComponentExternalApi: {
		type: LinkType.ComponentExternalApi
	},
	ComponentInternalApi: {
		type: LinkType.ComponentInternalApi
	},
	SelectorLink: {
		type: LinkType.SelectorLink
	},
	GeneralLink: {
		type: LinkType.GeneralLink
	},
	SelectorInputLink: {
		type: LinkType.SelectorInputLink
	},
	TitleServiceLink: {
		type: LinkType.TitleServiceLink
	},
	QueryLink: {
		type: LinkType.QueryLink
	},
	DataChainLink: {
		type: LinkType.DataChainLink
	},
	DataChainInputLink: {
		type: LinkType.DataChainInputLink
	},
	PreDataChainLink: {
		type: LinkType.PreDataChainLink
	},
	CallDataChainLink: {
		type: LinkType.CallDataChainLink
	},
	ListItem: {
		type: LinkType.ListItem
	},
	ComponentLink: {
		type: LinkType.Component,
		stroke: NodeTypeColors[NodeTypes.ComponentNode]
	},
	ComponentPropertyLink: {
		type: LinkType.ComponentProperty,
		stroke: NodeTypeColors[NodeTypes.Property]
	},
	ScreenOptionsLink: {
		type: LinkType.ScreenOptions
	},
	ModelItemFilter: {
		type: LinkType.ModelItemFilter
	},
	AfterMethod: {
		type: LinkType.AfterMethod
	},
	DataChainAfterEffectSubsequentCall: {
		type: LinkType.DataChainAfterEffectSubsequentCall
	},
	EnumerationReferenceLink: {
		type: LinkType.EnumerationReference
	},
	ConditionLink: {
		type: LinkType.Condition
	},
	LogicalChildren: {
		type: LinkType.LogicalChildren
	},
	LogicalNieces: {
		type: LinkType.LogicalNieces
	},
	ManyToManyLink: {
		type: LinkType.ManyToManyLink
	},
	PermissionFunctionLink: {
		type: LinkType.PermissionFunction
	},
	FunctionVariable: {
		type: LinkType.FunctionVariable,
		[LinkPropertyKeys.FUNCTION_ID]: null
	},
	PermissionDependencyPropertyLink: {
		type: LinkType.PermissionDependencyProperty
	},
	PermissionDependencyPropertyManyToManyLink: {
		type: LinkType.PermissionDependencyPropertyManyToManyLink
	},
	PermissionPropertyDependencyLink: {
		type: LinkType.PermissionPropertyDependency
	},
	PermissionPropertyDependencyManyToManyLink: {
		type: LinkType.PermissionPropertyDependencyManyToManyLink
	},
	AttributeLink: {
		type: LinkType.AttributeLink
	},
	ExistLink: {
		exist: LinkType.Exist
	},
	ModelTypeLink: {
		type: LinkType.ModelTypeLink
	},
	AgentTypeLink: {
		type: LinkType.AgentTypeLink
	},
	RequiredClassLink: {
		type: LinkType.RequiredClassLink
	},
	OnScreenLink: {
		type: LinkType.OnScreenLink
	},
	OnSuccessLink: {
		type: LinkType.OnSuccessLink
	},
	OnFailureLink: {
		type: LinkType.OnFailureLink
	},
	OnItemSelection: {
		type: LinkType.OnItemSelection
	},
	OnAction: {
		type: LinkType.OnAction
	},
	ChildLink: {
		type: LinkType.ChildLink
	},
	FunctionLink: {
		type: LinkType.FunctionLink
	},
	FunctionOperator: {
		type: LinkType.FunctionOperator
	},
	FunctionConstraintLink: {
		type: LinkType.FunctionConstraintLink
	},
	ChoiceLink: {
		type: LinkType.Choice
	},
	PermissionLink: {
		type: LinkType.Permission
	},
	AppliedPermissionLink: {
		type: LinkType.AppliedPermissionLink
	},
	RequestorPermissionLink: {
		type: LinkType.RequestorPermissionLink
	},
	ManyToManyPermissionLink: {
		type: LinkType.ManyToManyPermissionLink
	},
	ValdationLink: {
		type: LinkType.Validation
	},
	ValidationLinkItem: {
		type: LinkType.ValidationItem
	},
	AgentLink: {
		type: LinkType.AgentLink
	},
	ValidatorAgentLink: {
		type: LinkType.ValidatorAgent
	},
	ValidatorModelLink: {
		type: LinkType.ValidatorModel
	},
	ValidatorModelItemLink: {
		type: LinkType.ValidatorModelItem
	},
	ValidatorPropertyLink: {
		type: LinkType.ValidatorProperty
	},

	ExecutorLink: {
		type: LinkType.Executor
	},
	ExecutorLinkItem: {
		type: LinkType.ExecutorItem
	},
	ExecutorAgentLink: {
		type: LinkType.ValidatorAgent
	},
	ExecutorModelLink: {
		type: LinkType.ExecutorModel
	},
	ExecutorModelItemLink: {
		type: LinkType.ValidatorModelItem
	},
	ExecutorPropertyLink: {
		type: LinkType.ValidatorProperty
	},

	ValidatorFunctionLink: {
		type: LinkType.ValidatorFunction
	},
	ExecutorFunctionLink: {
		type: LinkType.ExecutorFunction
	},
	OptionLink: {
		type: LinkType.Option
	},
	OptionItemLink: {
		type: LinkType.OptionItem
	},
	// Options for custom defined options, that need to be made later.
	OptionCustomLink: {
		type: LinkType.OptionCustom
	},
	DependsOnLink: {
		type: LinkType.DependsOn
	},
	ExtensionListLink: {
		type: LinkType.ExtensionList
	},
	ExtensionLink: {
		type: LinkType.Extension
	},
	//This link is between an extension with a dependsOn property
	// It describes a link between a property and a secondary property.
	ExtensionDependencyLink: {
		type: LinkType.ExtensionDependencyLink
	},
	PropertyLink: {
		type: LinkType.PropertyLink
	},
	ParentLink: {
		type: LinkType.ParentLink
	},
	UserLink: {
		type: LinkType.UserLink
	},
	MaestroLink: {
		type: LinkType.MaestroLink
	}
};
Object.keys(LinkProperties).map((propTypes: string) => {
	if (LinkProperties[propTypes] && LinkProperties[propTypes].type) {
		LinkProperties[propTypes][LinkProperties[propTypes].type] = {};
	}
});
export const Methods = {
	Create: 'Create',
	Get: 'Get',
	GetAll: 'GetAll',
	Update: 'Update',
	Delete: 'Delete'
};
export const ValidationVector = {
	Content: 'content'
};
export const UITypes = {
	ReactNative: 'ReactNative',
	ReactWeb: 'ReactWeb',
	VR: 'VR',
	AR: 'AR',
	ElectronIO: 'ElectronIO'
};
export const ValidationRules: { [str: string]: string } = {
	CVV: 'cvv',
	AlphaNumericLike: 'alphanumericlike',
	AlphaNumeric: 'alphanumeric',
	AlphaNumericPuncLike: 'alphaNumericpunclike',
	AlphaOnly: 'alphaonly',
	NumericOnly: 'numericonly',
	Numeric: 'numeric',
	Empty: 'empty',
	AlphaOnlyWithSpaces: 'alphaonlywithspaces',
	NotEmpty: 'notempty',
	MaxLength: 'maxlength',
	EqualsModelProperty: 'equals-model-property',
	MinLength: 'minLength',
	MaxLengthEqual: 'maxlengthEqual',
	MinLengthEqual: 'minLengthEqual',
	MaxValue: 'maxValue',
	MinValue: 'minValue',
	MaxValueEqual: 'maxValueEqual',
	MinValueEqual: 'minValueEqual',
	UrlEmpty: 'url_empty',
	IsTrue: 'is_true',
	IsFalse: 'is_false',
	GreaterThan: 'greater_than',
	GreaterThanOrEqualTo: 'greater_than_equal_to',
	LessThan: 'less_than',
	LessThanOrEqualTo: 'less_than_equal_to',
	EqualTo: 'equal_to',
	Any: 'any',
	Url: 'url',
	EmailEmpty: 'email_empty',
	Credit: 'credit',
	Email: 'email',
	ExpirationMonth: 'expirationMonth',
	BeforeNow: 'beforenow',
	Year: 'year',
	Debit: 'debit',
	ExpirationYear: 'expirationYear',
	PastDate: 'pastdate',
	ZipEmpty: 'zipempty',
	Zip: 'zip',
	SocialSecurity: 'socialsecurity',
	ListOfGuids: 'listofguids',
	IsNull: 'isNull',
	IsNotNull: 'isNotNull',
	OneOf: 'one-of'
};

export const ExtensionDefinitionTypes = {
	DictionaryStringString: 'DictionaryStringString',
	DictionaryStringDictionary: 'DictionaryStringDictionary'
};
export const CollectionTypes = {
	DebitCard: 'DebitCard',
	Email: 'Email',
	Telephone: 'Telephone'
};

export const OptionsTypes = {
	CHOICELIST: 'CHOICELIST',
	CAPITALIZE_FIRST_LETTER: 'CAPITALIZE_FIRST_LETTER'
};
export const NodePropertyTypes = {
	STRING: 'STRING',
	DICTSTRING: 'DICTSTRING',
	LISTOFSTRINGS: 'LISTOFSTRINGS',
	DATETIME: 'DATETIME',
	INT: 'INT',
	ADDRESS: 'ADDRESS',
	FLOAT: 'FLOAT',
	AUTOMOBILE: 'AUTOMOBILE',
	LIENHOLDERS: 'LIENHOLDERS',
	LIENHOLDER: 'LIENHOLDER',
	AUTODETAILPOLICY: 'AUTODETAILPOLICY',
	ACCIDENTSANDVIOLATIONS: 'ACCIDENTSANDVIOLATIONS',
	EMPLOYMENTOCCUPATION: 'EMPLOYMENTOCCUPATION',
	GENDER: 'GENDER',
	DOUBLE: 'DOUBLE',
	LONG: 'LONG',
	BOOLEAN: 'BOOLEAN',
	EMAIL: 'EMAIL',
	REFERENCE: 'REFERENCE',
	OBJECT: 'OBJECT',
	PHONENUMBER: 'PHONENUMBER'
};
export const NEW_LINE = `
`;
export const ProgrammingLanguages = {
	CSHARP: 'csharp',
	JavaScript: 'java-script'
};
export const Languages = {
	[`US-English`]: 'US-English',
	[`NB-Norsk`]: 'NB-Norsk',
	[`FR-Francais`]: 'FR-Francais',
	[`DE-Deutsch`]: 'DE-Deutsch'
};
export const LanguagesCode = {
	[`US-English`]: 'en',
	[`NB-Norsk`]: 'nb',
	[`FR-Francais`]: 'fr',
	[`DE-Deutsch`]: 'de'
};

export const NodePropertyTypesByLanguage = {
	[ProgrammingLanguages.CSHARP]: {
		[NodePropertyTypes.DATETIME]: 'DateTime',
		[NodePropertyTypes.STRING]: 'string',
		[NodePropertyTypes.LISTOFSTRINGS]: 'IList<string>',
		[NodePropertyTypes.DICTSTRING]: 'IDictionary<string, string>',
		[NodePropertyTypes.ADDRESS]: 'GoogleAddress',
		[NodePropertyTypes.AUTOMOBILE]: ' AutoModel',
		[NodePropertyTypes.LIENHOLDERS]: 'LienHolders',
		[NodePropertyTypes.AUTODETAILPOLICY]: 'AutoDetailPolicy',
		[NodePropertyTypes.ACCIDENTSANDVIOLATIONS]: 'AccidentViolations',
		[NodePropertyTypes.EMPLOYMENTOCCUPATION]: 'EmploymentOccupation',
		[NodePropertyTypes.GENDER]: 'string',
		[NodePropertyTypes.INT]: 'int',
		[NodePropertyTypes.FLOAT]: 'float',
		[NodePropertyTypes.DOUBLE]: 'double',
		[NodePropertyTypes.BOOLEAN]: 'bool',
		[NodePropertyTypes.EMAIL]: 'Email',
		[NodePropertyTypes.PHONENUMBER]: 'Telephone'
	},
	[ProgrammingLanguages.JavaScript]: {
		[NodePropertyTypes.DATETIME]: 'any',
		[NodePropertyTypes.STRING]: 'string',
		[NodePropertyTypes.ADDRESS]: '{ [str:string]: any }',
		[NodePropertyTypes.AUTOMOBILE]: '{ [str:string]: any }',
		[NodePropertyTypes.LISTOFSTRINGS]: 'IList<string>',
		[NodePropertyTypes.DICTSTRING]: '{ [str: string]: string }',
		[NodePropertyTypes.LIENHOLDERS]: '{ [str:string]: any }',
		[NodePropertyTypes.AUTODETAILPOLICY]: 'any',
		[NodePropertyTypes.ACCIDENTSANDVIOLATIONS]: 'any',
		[NodePropertyTypes.EMPLOYMENTOCCUPATION]: '{ [str:string]: any }',
		[NodePropertyTypes.INT]: 'number',
		[NodePropertyTypes.FLOAT]: 'number',
		[NodePropertyTypes.GENDER]: 'string',
		[NodePropertyTypes.DOUBLE]: 'number',
		[NodePropertyTypes.BOOLEAN]: 'boolean',
		[NodePropertyTypes.EMAIL]: 'string',
		[NodePropertyTypes.PHONENUMBER]: 'string'
	}
};

export const RED_QUICK_DATA = 'RedQuick.Data';
export const RED_QUICK_ATTRIBUTES = 'RedQuick.Attributes';
export const Usings = {
	[ProgrammingLanguages.CSHARP]: {
		[NodePropertyTypes.EMAIL]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.PHONENUMBER]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.ADDRESS]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.AUTOMOBILE]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.LIENHOLDERS]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.AUTODETAILPOLICY]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.ACCIDENTSANDVIOLATIONS]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.EMPLOYMENTOCCUPATION]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
		[NodePropertyTypes.LIENHOLDER]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES]
	}
};
export const NodeAttributePropertyTypes = {
	ROUTINGNUMBER: 'ROUTINGNUMBER',
	CURRENCY: 'CURRENCY',
	CARMAKE: 'CARMAKE',
	SOCIALSECURITY: 'SOCIALSECURITY',
	EMAIL: 'EMAIL',
	PHONE: 'PHONE',
	CARMODEL: 'CARMODEL',
	CARYEAR: 'CARYEAR',
	VIN: 'VIN',
	LONGSTRING: 'LONGSTRING',
	CREDITCARD: 'CREDITCARD',
	LENGTH: 'LENGTH',
	INCH: 'INCH',
	DIMENSION: 'DIMENSION',
	MONEY: 'MONEY',
	COUNTRY: 'COUNTRY',
	DEBIT: 'DEBIT',
	MONTH: 'MONTH',
	STATE: 'STATE',
	CHOICE: 'CHOICE',
	ZIPCODE: 'ZIPCODE',
	NUMBER: 'NUMBER',
	SLIDER: 'SLIDER',
	DATE: 'DATE',
	TIME: 'TIME',
	BOOLEAN: 'BOOLEAN',
	ACCOUNTNUMBER: 'ACCOUNTNUMBER',
	ADDRESS: 'ADDRESS',
	AUTOMOBILE: 'AUTOMOBILE',
	EMPLOYMENTOCCUPATION: 'EMPLOYMENTOCCUPATION',
	LIENHOLDER: 'LIENHOLDER',
	LIENHOLDERS: 'LIENHOLDERS',
	AUTODETAILPOLICY: 'AUTODETAILPOLICY',
	ACCIDENTSANDVIOLATIONS: 'ACCIDENTSANDVIOLATIONS',
	DRIVERLICENSENUMBER: 'DRIVERLICENSENUMBER',
	COLLECTION: 'COLLECTION',
	OBJECT: 'OBJECT',
	RADIO: 'RADIO',
	CHECKLIST: 'CHECKLIST',
	STRING: 'STRING',
	GEOLOCATION: 'GEOLOCATION',
	YEAR: 'YEAR',
	ENUMERATION: 'ENUMERATION',
	NAME: 'NAME'
};

const COMMON_DATETIME_ARGS = {
	value: {
		type: NodePropertyTypes.DATETIME,
		nodeType: NodeTypes.Property
	}
};

const COMMON_STRING_ARGS = {
	value: {
		type: NodePropertyTypes.STRING,
		nodeType: NodeTypes.Property
	}
};
const COMMON_NUMBER_ARGS = {
	value: {
		type: NodePropertyTypes.INT,
		nodeType: NodeTypes.Property
	},
	condition: {
		type: NodePropertyTypes.INT,
		nodeType: null,
		defaultValue: 0
	}
};
const COMMON_NUMBER__EQ_ARGS = {
	...COMMON_NUMBER_ARGS,
	condition: {
		type: NodePropertyTypes.INT,
		nodeType: null,
		equals: true,
		defaultValue: 0
	}
};

const COMMON_LISTSTRING_ARGS = {
	value: {
		type: NodePropertyTypes.LISTOFSTRINGS,
		nodeType: NodeTypes.Property
	}
};

export function GetValidationsFor(type: any) {
	let result: any = {};
	Object.keys(ValidationCases)
		.filter((x) => {
			return ValidationCases[x].types.some((v: any) => v === type);
		})
		.map((t) => {
			result[t] = ValidationCases[t];
		});

	return result;
}

export function GetMoreCompatibles(a: any, vector: string, result: any = []) {
	var parents = GetValidationParents(a, vector).map((t) => t.id);
	parents = parents.filter((t: any) => result.indexOf(t) === -1);
	result = [a, ...result, ...parents].unique();
	parents.map((t: any) => {
		if (result.indexOf(t) !== -1) {
			result = GetMoreCompatibles(t, vector, result);
		}
	});

	return result;
}
export function AreCompatible(a: any, b: any, vector = ValidationVector.Content) {
	var t = GetMoreCompatibles(a, vector);
	var v = GetMoreCompatibles(b, vector);

	return !!t.intersection(v).length;
}
export function SortValidation(a: any, b: any, vector: any) {
	if (a === b) {
		return 0;
	}
	var t = GetMoreCompatibles(a, vector);
	var v = GetMoreCompatibles(b, vector);
	var bIsIncluded = t.some((_t: any) => _t === b);
	var aIsIncluded = v.some((_v: any) => _v === a);
	if (bIsIncluded && aIsIncluded) {
		return 0;
	} else if (bIsIncluded) {
		return -1;
	} else if (aIsIncluded) {
		return 1;
	}
	return 0;
}
export function GetValidationParents(type: string | number, vector: string | number) {
	var vc = ValidationCases[type];
	if (vc) {
		var vects = vc.vectors[vector];
		if (Array.isArray(vects)) {
			return vects.map((t) => ValidationCases[t]).filter((x) => x);
		} else {
			return Object.keys(vects)
				.map((t) => {
					return ValidationCases[t];
				})
				.filter((x) => x);
		}
	}
	return [];
}
export function GetValidationTypes(type: any) {
	var results: any = [];

	Object.values(ValidationCases).map((t: any) => {
		if (t && t.types && t.types.indexOf(type) !== -1) results.push(t);
	});

	return results;
}

export const ValidationCases: any = {
	[ValidationRules.ListOfGuids]: {
		types: [NodePropertyTypes.LISTOFSTRINGS],
		vectors: {
			content: [ValidationRules.Any],
			length: true
		},
		cases: {
			$true: function () {
				return `new List<string> { "${_.uuidv4()}"}`;
			},
			long: function () {
				return `new List<string> { "${_.uuidv4()}asdf" }`;
			},
			$empty: function () {
				return `new List<string>()`;
			}
		}
	},
	[ValidationRules.SocialSecurity]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.AlphaNumericPuncLike],
			length: true
		},
		cases: {
			$true: function () {
				return `"${[].interpolate(0, 9, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			long: function () {
				return `"${[].interpolate(0, 12, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			short: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			invalid: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('a')}"`;
			},
			empty: function () {
				return `"${[].interpolate(0, 0, () => Math.floor(Math.random() * 10)).join('')}"`;
			}
		}
	},
	[ValidationRules.Zip]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.ZipEmpty],
			length: true
		},
		cases: {
			$true: function () {
				return `"${[].interpolate(0, 5, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			long: function () {
				return `"${[].interpolate(0, 12, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			short: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			invalid: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('a')}"`;
			},
			empty: function () {
				return `"${[].interpolate(0, 0, () => Math.floor(Math.random() * 10)).join('')}"`;
			}
		}
	},
	[ValidationRules.ZipEmpty]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: true,
			length: true
		},
		cases: {
			$true: function () {
				return `"${[].interpolate(0, 5, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			long: function () {
				return `"${[].interpolate(0, 12, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			short: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			$empty: function () {
				return `"${[].interpolate(0, 0, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			invalid: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('a')}"`;
			},
			invalid2: function () {
				return `"${[].interpolate(0, 5, () => 'a').join('')}"`;
			}
		}
	},
	[ValidationRules.PastDate]: {
		types: [NodePropertyTypes.DATETIME],
		vectors: {
			value: true
		},
		cases: {
			$true: function () {
				return `Date.UtcNow().AddDays(1)`;
			},
			false: function () {
				return `Date.UtcNow().AddDays(-1)`;
			}
		}
	},

	[ValidationRules.BeforeNow]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			value: true
		},
		cases: {
			$true: function () {
				return `Date.UtcNow().AddDays(-1)`;
			},
			false: function () {
				return `Date.UtcNow().AddDays(1)`;
			}
		}
	},
	[ValidationRules.Email]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: true
		},
		cases: {
			$true: function () {
				return `"asdf@asdf.com"`;
			},
			false: function () {
				return `"asdf@asdfdd@asdf@.com"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.EmailEmpty]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: true
		},
		cases: {
			$true: function () {
				return `"asadf@asdf.com"`;
			},
			false: function () {
				return `"asdf@afsdfdd@asdf@.com"`;
			},
			$empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.Credit]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: true,
			length: true
		},
		cases: {
			$true: function () {
				return `"${[].interpolate(0, 16, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			long: function () {
				return `"${[].interpolate(0, 23, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			short: function () {
				return `"${[].interpolate(0, 3, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			$empty: function () {
				return `"${[].interpolate(0, 0, () => Math.floor(Math.random() * 10)).join('')}"`;
			},
			invalid: function () {
				return `"${[].interpolate(0, 16, () => Math.floor(Math.random() * 10)).join('a')}"`;
			},
			invalid2: function () {
				return `"${[].interpolate(0, 16, () => 'a').join('')}"`;
			}
		}
	},
	[ValidationRules.Url]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.UrlEmpty]
		},
		cases: {
			$true: function () {
				return `"http://yahoo.com"`;
			},
			false: function () {
				return `"asdf@afsdfdd@asdf@.com"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.UrlEmpty]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.Any]
		},
		cases: {
			$true: function () {
				return `"http://yahoo.com"`;
			},
			false: function () {
				return `"asdf@afsdfdd@asdf@.com"`;
			},
			$empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.Empty]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.Any],
			length: true
		},
		cases: {
			false: function () {
				return `"asdf"`;
			},
			$empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.NotEmpty]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.Any],
			length: true
		},
		cases: {
			$false: function () {
				return `"asdf"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.NumericOnly]: {
		vectors: {
			content: [ValidationRules.Numeric]
		},
		types: [NodePropertyTypes.STRING],
		cases: {
			$true: function () {
				return `"1234"`;
			},
			false: function () {
				return `"asdf@ afsdfdd@asdf@.com"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.Numeric]: {
		vectors: {
			content: [ValidationRules.AlphaNumericPuncLike]
		},
		types: [NodePropertyTypes.STRING],
		cases: {
			$true: function () {
				return `"1234.34"`;
			},
			false: function () {
				return `"12QW"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	//Cant be empty, that would  be the only difference between it and Any.
	[ValidationRules.AlphaNumericPuncLike]: {
		vectors: {
			content: [ValidationRules.Any]
		},
		types: [NodePropertyTypes.STRING],
		cases: {
			$true: function () {
				return `"httas21df.!@#$ #$%^^&*^&*()aom"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.AlphaNumericLike]: {
		vectors: {
			content: [ValidationRules.AlphaNumericPuncLike]
		},
		types: [NodePropertyTypes.STRING],
		cases: {
			$true: function () {
				return `"httas21dfaom"`;
			},
			false: function () {
				return `"asdf@ afsdfdd@asdf@.com"`;
			},
			$empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.AlphaOnly]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.AlphaOnlyWithSpaces]
		},
		cases: {
			$true: function () {
				return `"httasdfaom"`;
			},
			false: function () {
				return `"asdf@ afsdfdd@asdf12f@.com"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.AlphaOnlyWithSpaces]: {
		types: [NodePropertyTypes.STRING],
		vectors: {
			content: [ValidationRules.AlphaNumericPuncLike]
		},
		cases: {
			$true: function () {
				return `"httas dfaom"`;
			},
			$false: function () {
				return `"asdf@ afsdfdd@asdf12f@.com"`;
			},
			empty: function () {
				return `""`;
			}
		}
	},
	[ValidationRules.IsTrue]: {
		types: [NodePropertyTypes.BOOLEAN],
		vectors: {
			value: [ValidationRules.Any]
		},
		cases: {
			$true: function () {
				return 'true';
			},
			false: function () {
				return 'false';
			}
		}
	},
	[ValidationRules.IsFalse]: {
		types: [NodePropertyTypes.BOOLEAN],
		vectors: {
			value: [ValidationRules.Any]
		},
		cases: {
			true: function () {
				return 'true';
			},
			$false: function () {
				return 'false';
			}
		}
	},
	[ValidationRules.GreaterThanOrEqualTo]: {
		types: [NodePropertyTypes.DOUBLE, NodePropertyTypes.FLOAT, NodePropertyTypes.INT],
		vectors: {
			value: {
				[ValidationRules.GreaterThan]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.GreaterThanOrEqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.EqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.LessThan]: function () {
					// based on a parameter, determine if there are any possible success cases.
				},
				[ValidationRules.LessThanOrEqualTo]: function () {
					// based on a parameter, determine if there are any possible success cases.
				}
			}
		},
		cases: {
			$greater: function () {
				return ' >= ';
			},
			notgreater: function () {
				return ' >= ';
			}
		}
	},
	[ValidationRules.GreaterThan]: {
		types: [NodePropertyTypes.DOUBLE, NodePropertyTypes.FLOAT, NodePropertyTypes.INT],
		vectors: {
			value: {
				[ValidationRules.GreaterThan]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.GreaterThanOrEqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.EqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.LessThan]: function () {
					// based on a parameter, determine if there are any possible success cases.
				},
				[ValidationRules.LessThanOrEqualTo]: function () {
					// based on a parameter, determine if there are any possible success cases.
				}
			}
		},
		cases: {
			$greater: function () {
				return ' > ';
			},
			notgreater: function () {
				return ' > ';
			}
		}
	},
	[ValidationRules.LessThan]: {
		types: [NodePropertyTypes.DOUBLE, NodePropertyTypes.FLOAT, NodePropertyTypes.INT],
		vectors: {
			value: {
				[ValidationRules.GreaterThan]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.GreaterThanOrEqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.EqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.LessThan]: function () {
					// based on a parameter, determine if there are any possible success cases.
				},
				[ValidationRules.LessThanOrEqualTo]: function () {
					// based on a parameter, determine if there are any possible success cases.
				}
			}
		},
		cases: {
			$less: function () {
				return ' < ';
			},
			notless: function () {
				return ' < ';
			}
		}
	},
	[ValidationRules.EqualTo]: {
		types: [NodePropertyTypes.DOUBLE, NodePropertyTypes.FLOAT, NodePropertyTypes.INT],
		vectors: {
			value: {
				[ValidationRules.GreaterThan]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.GreaterThanOrEqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.EqualTo]: function () {
					// based on a parameter, determining which validation is most restrictive should be possible.
				},
				[ValidationRules.LessThan]: function () {
					// based on a parameter, determine if there are any possible success cases.
				},
				[ValidationRules.LessThanOrEqualTo]: function () {
					// based on a parameter, determine if there are any possible success cases.
				}
			}
		},
		cases: {
			$equal_to: function () {
				return ' = ';
			},
			not_equal: function () {
				return ' = ';
			}
		}
	}
};
Object.keys(ValidationCases).map((t) => {
	ValidationCases[t].id = t;
});

export const ExecutorRules = {
	ModelReference: 'model-reference',
	Copy: 'copy',
	AgentReference: 'agent-reference',
	ParentReference: 'parent-reference',
	AddModelReference: 'add-model-reference',
	SetToDeleted: 'set-to-deleted',
	DataChain: 'data-chain'
};
export const ExecutorUI: any = {
	[ExecutorRules.DataChain]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'DataChain'
		},
		arguments: {
			nodeType: NodeTypes.DataChain,
			reference: {
				types: [NodeTypes.DataChain],
				title: NodeTypes.DataChain,
				properties: {
					[NodeProperties.CS]: true,
					[NodeProperties.NODEType]: NodeTypes.DataChain,
					[NodeProperties.CSEntryPoint]: true
				}
			}
		}
	},
	[ExecutorRules.ModelReference]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'ModelReference'
		},
		arguments: {
			...COMMON_STRING_ARGS,
			nodeType: NodeTypes.Model,
			reference: {
				types: [NodeTypes.Model]
			}
		}
	},
	[ExecutorRules.AgentReference]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AgentReference'
		},
		arguments: {
			...COMMON_STRING_ARGS,
			nodeType: NodeTypes.Model,
			reference: {
				types: [NodeTypes.Model]
			}
		}
	},
	[ExecutorRules.ParentReference]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'ParentReference'
		},
		arguments: {
			...COMMON_STRING_ARGS,
			nodeType: NodeTypes.Model,
			reference: {
				types: [NodeTypes.Model]
			}
		}
	},
	[ExecutorRules.AddModelReference]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AddModelReference'
		},
		arguments: {
			...COMMON_LISTSTRING_ARGS,
			nodeType: NodeTypes.Model,
			method_reference: {
				reference: true
			}
		}
	},
	[ExecutorRules.Copy]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'copy'
		},
		arguments: { ...COMMON_STRING_ARGS }
	}
};
Object.keys(ExecutorUI).map((t) => {
	ExecutorUI[t].type = t;
});
export const FilterRules = {
	EqualsAgent: 'equals-agent',
	EqualsParent: 'equals-parent',
	EqualsTrue: 'equals-true',
	EqualsFalse: 'equals-false',
	EqualsModelRef: 'equals-model-ref',
	EqualsModelProperty: 'equals-model-property',
	IsInModelPropertyCollection: 'is-in-model-property-collection',
	IsNotInModelPropertyCollection: 'is-not-in-model-property-collection',
	Many2ManyPropertyIsTrue: 'many-2-many-property-is-true'
};
export const FilterUI: { [str: string]: any } = {
	[FilterRules.EqualsTrue]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EqualsTrue'
		},
		template: './app/templates/filter/equals_true.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			type: NodePropertyTypes.BOOLEAN
		}
	},
	[FilterRules.EqualsFalse]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EqualsFalse'
		},
		template: './app/templates/filter/equals_false.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			type: NodePropertyTypes.BOOLEAN
		}
	},
	[FilterRules.EqualsParent]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EqualsParent'
		},
		template: './app/templates/filter/equals_parent.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			modelproperty: true
		}
	},
	[FilterRules.EqualsAgent]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EqualsAgent'
		},
		arguments: {
			...COMMON_STRING_ARGS,
			type: NodePropertyTypes.BOOLEAN
		}
	},
	[FilterRules.EqualsModelRef]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EqualsModelRef'
		},
		arguments: {
			...COMMON_STRING_ARGS,
			functionvariables: true
		}
	},
	[FilterRules.EqualsModelProperty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EqualsModelProperty'
		},
		template: './app/templates/filter/equals-model-property.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			modelproperty: true
		}
	},
	[FilterRules.IsInModelPropertyCollection]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'IsInModelPropertyCollection'
		},
		template: './app/templates/filter/is_in_model_property_collection.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			modelproperty: true
		}
	},
	[FilterRules.IsNotInModelPropertyCollection]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'IsNotInModelPropertyCollection'
		},
		template: './app/templates/filter/is_not_in_model_property_collection.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			modelproperty: true
		}
	},
	[FilterRules.Many2ManyPropertyIsTrue]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'Many2ManyPropertyIsTrue'
		},
		template: './app/templates/filter/many_2_many_property_is_true.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			model2modelproperty: true
		}
	},
	[ValidationRules.OneOf]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'OneOfAttribute'
		},
		template: './app/templates/filter/one-of.tpl',
		templatejs: './app/templates/filter/one-ofjs.tpl',
		arguments: {
			...COMMON_STRING_ARGS,
			nodeType: NodeTypes.Enumeration,
			reference: {
				types: [NodeTypes.Enumeration, NodeTypes.ExtensionType]
			}
		}
	},
	[ValidationRules.SocialSecurity]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'SocialSecurityAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.Zip]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'ZipAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.ZipEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'ZipEmptyAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.PastDate]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'PastDateAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_DATETIME_ARGS }
	},
	[ValidationRules.BeforeNow]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'BeforeNowAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_DATETIME_ARGS }
	},
	[ValidationRules.Email]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EmailAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.Credit]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'CreditCardAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.EmailEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EmailEmptyAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.Url]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'UrlAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.UrlEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'UrlEmptyAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.IsNull]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'IsNullAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.IsNotNull]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'IsNotNullAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaNumericLike]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AlphaNumericLikeAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaNumeric]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AlphaNumericAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaOnly]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AlphaOnlyAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaOnlyWithSpaces]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'NotEmptyAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.MaxLength]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MaximumLengthAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER_ARGS }
	},
	[ValidationRules.MinLength]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MinimumLengthAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER_ARGS }
	},
	[ValidationRules.MaxLengthEqual]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MaximumLengthAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER__EQ_ARGS }
	},
	[ValidationRules.MinLengthEqual]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MinAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER__EQ_ARGS }
	},

	[ValidationRules.MaxValue]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MaxAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER_ARGS }
	},
	[ValidationRules.MinValue]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MinAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER_ARGS }
	},
	[ValidationRules.MaxValueEqual]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MaxAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER__EQ_ARGS }
	},
	[ValidationRules.MinValueEqual]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'MinAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_NUMBER__EQ_ARGS }
	},
	[ValidationRules.Email]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EmailAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.EmailEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EmailEmptyAttribute'
		},
		template: './app/templates/validation/validation_generic.tpl',
		templatejs: './app/templates/validation/validation_generic_js.tpl',
		arguments: { ...COMMON_STRING_ARGS }
	}
};
Object.keys(FilterUI).map((t) => {
	FilterUI[t].type = t;
});
export const ValidationUI: any = {
	[ValidationRules.OneOf]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'OneOfAttribute'
		},
		arguments: {
			...COMMON_STRING_ARGS,
			nodeType: NodeTypes.Enumeration,
			reference: {
				types: [NodeTypes.Enumeration, NodeTypes.ExtensionType]
			}
		}
	},
	[ValidationRules.SocialSecurity]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'SocialSecurityAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.Zip]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'ZipAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.ZipEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'ZipEmptyAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.PastDate]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'PastDateAttribute'
		},
		arguments: { ...COMMON_DATETIME_ARGS }
	},
	[ValidationRules.BeforeNow]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'BeforeNowAttribute'
		},
		arguments: { ...COMMON_DATETIME_ARGS }
	},
	[ValidationRules.Email]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EmailAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.Credit]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'CreditCardAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.EmailEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'EmailEmptyAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.Url]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'UrlAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.UrlEmpty]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'UrlEmptyAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaNumericLike]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AlphaNumericLikeAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaNumeric]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AlphaNumericAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaOnly]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'AlphaOnlyAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	},
	[ValidationRules.AlphaOnlyWithSpaces]: {
		code: {
			[ProgrammingLanguages.CSHARP]: 'NotEmptyAttribute'
		},
		arguments: { ...COMMON_STRING_ARGS }
	}
};
Object.keys(ValidationUI).map((t) => {
	ValidationUI[t].type = t;
});

export const UITypeColors: any = {
	[UITypes.ElectronIO]: '#662C91',
	[UITypes.ReactNative]: '#FF7F11',
	[UITypes.ReactWeb]: '#21897E'
};
