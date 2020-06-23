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
