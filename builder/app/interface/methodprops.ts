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
export interface Routing {
	routes: RouteDescription[];
}

export interface RouteDescription {
	viewType: string;
	model: string;
	agent: string;
	id: string;
	name: string;
	targetMethodDescription?: MethodDescription;
	source?: RouteSource; // This is what the button will use to populate the parameter for navigating to the next page.
}
export interface RouteSource {
	model?: string;
	property?: string | null;
	type: RouteSourceType;
}

export enum RouteSourceType {
	Model = 'model', // The value should be retrieved from the model for the page
	Agent = 'agent', // The value should be retrieved from the agent for the page
	UrlParameter = 'urlParameter' // The value should be retrieved from the url parameters for the page
}

export interface MethodDescription {
	functionType: string;
	properties: MethodPropsProperties;
}

export interface MethodPropsProperties {
	parent: string;
	model: string;
	model_output: string;
}
