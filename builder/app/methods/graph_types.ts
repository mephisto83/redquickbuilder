export interface Graph {
	id: string;
	version: Version;
	workspace: string;
	title: string;
	namespace: string;
	graphFile?: string;
	path: string[];
	linkCount?: number;
	nodeCount?: number;
	groups: string[];
	$vGroups?: string[];
	groupLib: { [index: string]: Group };
	groupsNodes: QuickAccess<boolean>;
	nodesGroups: QuickAccess<boolean>;
	childGroups: QuickAccess<boolean>;
	parentGroup: QuickAccess<boolean>;
	referenceNodes: {};
	nodeLib: { [index: string]: Node };
	nodes: string[];
	nodeLinks: QuickAccess<number>;
	nodeConnections: QuickAccess<string>;
	nodeLinkIds: QuickAccess<string>;
	flowModels: { [str: string]: any };
	linkLib: { [index: string]: GraphLink };
	links: string[];
	graphs: { [index: string]: Graph };
	classNodes: { [index: string]: Node };
	functionNodes: { [index: string]: Node };
	updated?: Date | number | null;
	visibleNodes: { [index: string]: string };
	appConfig: AppConfig;
	themeColors: any;
	themeColorUses: any;
	spaceTheme: any;
	themeOtherUses: any;
	themeGridPlacements: any;
	themeFonts: any;
	themeVariables: any;
}
export interface QuickAccess<T> {
	[index: string]: { [key: string]: T };
}
export interface AppConfig {
	AppSettings: any;
	Logging: any;
}
export interface ComponentLayoutContainer {
	layout: ComponentLayout;
	properties: ComponentProperties;
}
export interface ComponentProperties {
	[key: string]: ComponentProperty;
}
export interface ComponentProperty {
	properties: {
		tags: string[];
	};
	injections: { route: string };
	style: { [key: string]: any };
	children: { [key: string]: any };
	cellModel: { [key: string]: any };
	cellRoot: { [key: string]: any };
	cellModelProperty: { [key: string]: any };
	cellStyleArray: any[];
}
export interface ComponentLayout {
	[key: string]: {};
}
export interface Version {
	major: number;
	minor: number;
	build: number;
}
export interface Group {
	id: any;
	leaves: string[];
	groups: any;
}
export interface Node {
	properties: any;
	propertyVersions?: { [index: string]: any };
	id: string;
	dirty: any;
}

export interface GraphLink {
	id: string;
	source: string;
	target: string;
	propertyVersions?: { [index: string]: any };
	properties: { [index: string]: any };
}

export interface Validator {
	properties: { [str: string]: ValidationContext };
}
export interface ValidationContext {
	validators: { [str: string]: ValidatorItem };
}
export interface ValidatorItem {
	references: { [str: string]: string };
	many2manyMethod: any;
	many2manyProperty: any;
	many2many: any;
	extension: { [str: string]: boolean };
	node: string;
	nodeProperty: string;
	enumeration: { [str: string]: boolean };
	arguments: ValidatorArguments;
	type: string;
	condition: string;
}
export interface Condition {
	type: string;
}
export interface ValidatorArguments {
	reference: ValidatorReference;
	modelproperty: { [str: string]: any };
	method_reference: { [str: string]: any };
	functionvariables: { [str: string]: any };
	model2modelproperty: any;
	condition: Condition;
}
export interface ValidatorReference {
	types: string[];
	title: string;
	properties: { [str: string]: any };
}

export interface Enumeration {
	value: string;
	id: string;
}

export interface LambdaInserts {
	[str: string]: string;
}
