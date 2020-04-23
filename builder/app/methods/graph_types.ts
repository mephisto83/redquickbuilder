export interface Graph {
	id: string;
	version: Version;
	workspace: string;
	title: string;
	namespace: string;
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
export interface Version {}
export interface Group {
	id: any;
	leaves: string[];
	groups: any;
}
export interface Node {
	properties: any;
	id: string;
	dirty: any;
}

export interface GraphLink {
	id: string;
	source: string;
	target: string;
	properties: { [index: string]: any };
}
