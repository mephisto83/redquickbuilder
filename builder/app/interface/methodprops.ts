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
	dashboard?: string;
	viewType: string;
	model: string;
	agent: string;
	id: string;
	name: string;
	targetMethodDescription?: MethodDescription;
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
