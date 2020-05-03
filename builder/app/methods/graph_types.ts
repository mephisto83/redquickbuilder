export interface Graph {
	id: string;
	version: Version;
	workspace: string;
	title: string;
	namespace: string;
	graphFile?: string;
	path: string[];
	groups: string[];
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
