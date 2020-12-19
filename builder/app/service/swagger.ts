import { GetNodesByProperties } from '../methods/graph_methods';
import {
	GetCurrentGraph,
	removeNodeById,
	CreateNewNode,
	AddLinkBetweenNodes,
	graphOperation,
	GetDispatchFunc,
	GetStateFunc,
	GetNodeByProperties,
	GUID
} from '../actions/uiActions';
import { NodeProperties, NodeTypes, LinkProperties } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';
import { NodePropertyTypes } from '../actions/uiActions';
import { REMOVE_NODE } from '../actions/uiActions';

export function SwaggerProcessData(nodeId: string, rawSwagger: SwaggerApi) {
	let swaggerNodes = GetNodesByProperties(
		{
			[NodeProperties.SwaggerNode]: nodeId
		},
		GetCurrentGraph()
	);
	let operations: any[] = [];
	swaggerNodes.forEach((node: Node) => {
		operations.push({
			operation: REMOVE_NODE,
			options: { id: node.id }
		});
	});

	Object.keys(rawSwagger.components.schemas).forEach((className: string) => {
		let newNode: Node | null = null;
		operations.push(
			CreateNewNode(
				{
					nodeType: NodeTypes.Model,
					[NodeProperties.UIText]: `${rawSwagger.info.title} ${className}`,
					[NodeProperties.SwaggerClassName]: className,
					[NodeProperties.SwaggerNode]: nodeId
				},
				(_newNode: Node) => {
					newNode = _newNode;
				}
			),
			() => {
				if (newNode) {
					return AddLinkBetweenNodes(nodeId, newNode.id, LinkProperties.SwaggerClass);
				}
			}
		);
	});
	Object.keys(rawSwagger.components.schemas).forEach((className: string) => {
		operations.push(() => {
			let newClassObject = rawSwagger.components.schemas[className];
			let result: any[] = [];
			switch (newClassObject.type) {
				case SwaggerType.Object:
					Object.keys(newClassObject.properties).map((propName: string) => {
						let propNode: Node | null = null;
						result.push(
							CreateNewNode(
								{
									[NodeProperties.UIText]: `${propName}`,
									[NodeProperties.SwaggerNode]: nodeId,
									[NodeProperties.NODEType]: NodeTypes.Property,
									[NodeProperties.CodePropertyType]: ConvertSwaggerType(
										newClassObject.properties[propName],
										rawSwagger,
										result,
										propName,
										nodeId
									)
								},
								(_propNode: Node) => {
									propNode = _propNode;
								}
							),
							() => {
								let swaggerClass = GetNodeByProperties({
									[NodeProperties.UIText]: `${rawSwagger.info.title} ${className}`,
									[NodeProperties.SwaggerClassName]: className
								});
								if (propNode && swaggerClass) {
									return AddLinkBetweenNodes(
										swaggerClass.id,
										propNode.id,
										LinkProperties.PropertyLink
									);
								}
							}
						);
					});
					break;
			}

			return result;
		});
	});
	Object.keys(rawSwagger.paths).forEach((path_key: string) => {
		operations.push(() => {
			let result: any[] = [];
			let swaggerPathNode: Node | null = null;
			result.push(
				CreateNewNode(
					{
						[NodeProperties.UIText]: `${rawSwagger.info.title} ${path_key}`,
						[NodeProperties.SwaggerNode]: nodeId,
						[NodeProperties.NODEType]: NodeTypes.SwaggerApiPath,
						[NodeProperties.SwaggerPath]: path_key
					},
					(_swaggerPathNode: Node) => {
						swaggerPathNode = _swaggerPathNode;
					}
				),
				() => {
					if (swaggerPathNode) {
						return AddLinkBetweenNodes(nodeId, swaggerPathNode.id, LinkProperties.SwaggerPaths);
					}
				},
				() => {
					let res: any[] = [];
					if (swaggerPathNode) {
						let methodCalls = rawSwagger.paths[path_key];
						if (methodCalls) {
							if (methodCalls.post) {
								swaggerApiMethod({
									method: 'Post',
									path_key,
									nodeId,
									methodCalls: methodCalls.post,
									swaggerPathNode,
									res
								});
							}
							if (methodCalls.put) {
								swaggerApiMethod({
									method: 'Put',
									path_key,
									nodeId,
									methodCalls: methodCalls.put,
									swaggerPathNode,
									res
								});
							}
							if (methodCalls.get) {
								swaggerApiMethod({
									method: 'Get',
									path_key,
									nodeId,
									methodCalls: methodCalls.get,
									swaggerPathNode,
									res
								});
							}
						}
					}
					return res;
				}
			);
			return result;
		});
	});
	graphOperation(operations)(GetDispatchFunc(), GetStateFunc());
}
function swaggerApiMethod(args: {
	path_key: string;
	method: string;
	nodeId: string;
	methodCalls: SwaggerEndpointDescription;
	swaggerPathNode: Node;
	res: any[];
}) {
	let newNode: Node | null = null;
	let { method, path_key, nodeId, methodCalls, swaggerPathNode, res } = args;
	let temp: any = CreateNewNode(
		{
			[NodeProperties.UIText]: ` ${path_key} ${method}`,
			[NodeProperties.SwaggerNode]: nodeId,
			[NodeProperties.NODEType]: NodeTypes.SwaggerApiDescription,
			[NodeProperties.SwaggerPath]: path_key,
			[NodeProperties.SwaggerMethodDefinition]: methodCalls
		},
		(_newNode: Node) => {
			newNode = _newNode;
		}
	);
	temp[0].parent = swaggerPathNode.id;
	res.push(temp);
	res.push(() => {
		if (newNode) {
			return AddLinkBetweenNodes(swaggerPathNode.id, newNode.id, LinkProperties.SwaggerMethodDescription);
		}
	});
}

export function ConvertSwaggerType(
	property: SwaggerDefinitionProperty,
	rawSwagger: SwaggerApi,
	result: any[],
	propName: string,
	swaggerNode: string
) {
	if (property && property.type) {
		switch (property.type) {
			case SwaggerType.Object:
				return NodePropertyTypes.OBJECT;
			case SwaggerType.String:
				if (property.enum) {
					result.push(
						CreateNewNode({
							[NodeProperties.NODEType]: NodeTypes.Enumeration,
							[NodeProperties.UIText]: `${propName[0].toUpperCase()}${propName
								.split('')
								.slice(1)
								.join('')} Enum`,
							[NodeProperties.SwaggerNode]: swaggerNode,
							[NodeProperties.Enumeration]: property.enum.map((v) => ({ value: v, id: GUID() }))
						})
					);
				}
				return NodePropertyTypes.STRING;
			case SwaggerType.Integer:
				if (property.format === 'int64') {
					return NodePropertyTypes.LONG;
				}
				return NodePropertyTypes.INT;
			case SwaggerType.Array:
				if (property && property.items && property.items.type) {
					switch (property.items.type) {
						case SwaggerType.String:
							return NodePropertyTypes.LISTOFSTRINGS;
					}
				}
				break;
			case SwaggerType.Boolean:
				return NodePropertyTypes.BOOLEAN;
			default:
				throw new Error(`unhandled swagger type: ${property.type}`);
		}
	} else if (property && property.$ref) {
		let className = property.$ref.split('/').reverse()[0];
		let swaggerClass = GetNodeByProperties(
			{
				[NodeProperties.UIText]: `${rawSwagger.info.title} ${className}`,
				[NodeProperties.SwaggerClassName]: className
			},
			GetCurrentGraph()
		);
		if (swaggerClass) {
			return swaggerClass.id;
		}
		return NodePropertyTypes.REFERENCE;
	}
	return NodePropertyTypes.STRING;
}

export enum SwaggerType {
	Object = 'object',
	String = 'string',
	Integer = 'integer',
	Boolean = 'boolean',
	Array = 'array'
}

export interface SwaggerApi {
	components: SwaggerComponents;
	info: SwaggerInfo;
	openapi: string;
	paths: SwaggerPaths
}
export interface SwaggerPaths {
	[str: string]: SwaggerPathDescription
}
export interface SwaggerPath {
	get?: SwaggerMethod
}
export interface SwaggerMethod {
	parameters: SwaggerParameters
}
export interface SwaggerComponents {
	schemas: {
		[str: string]: SwaggerDefinition
	}
}
export interface SwaggerDefinitions {
	[className: string]: SwaggerDefinition;
}
export interface SwaggerDefinition {
	type: SwaggerType;
	properties: SwaggerDefinitionProperties;
}
export interface SwaggerDefinitionProperties {
	[property: string]: SwaggerDefinitionProperty;
}
export interface SwaggerDefinitionProperty {
	type: string;
	format: string;
	enum: string[];
	$ref: string;
	xml?: { wrapped: boolean };
	items?: {
		type: string;
		xml: { [str: string]: string };
		$ref?: string;
	};
}
export interface SwaggerSecurityDefinitions {
	api_key: SwaggerApiKey;
	[str: string]: SwaggerApiKey;
}
export interface SwaggerApiKey {
	type: string;
	name: string;
	in: SwaggerInOptions;
	flow: string;
	scopes: { [str: string]: string };
}
export enum SwaggerInOptions {
	Query = 'query',
	Body = 'body',
	Path = 'path',
	FormData = 'formData',
	Header = 'header'
}
export interface SwaggerPathDescription {
	post?: SwaggerEndpointDescription;
	put?: SwaggerEndpointDescription;
	get?: SwaggerEndpointDescription;
}
export interface SwaggerEndpointDescription {
	tags: string[];
	summary: string;
	description: string;
	operationId: string;
	consumes: string[];
	produces: string[];
	parameters: SwaggerParameters[];
	responses: SwaggerReponses;
	security: SwaggerSecurity[];
}
export interface SwaggerSecurity {
	[str: string]: string[];
}
export interface SwaggerReponses {
	'200': SwaggerResponse;
}
export interface SwaggerResponse {
	description: string;
	schema: SwaggerSchema;
}
export interface SwaggerSchema {
	$ref: string;
}
export interface SwaggerParameters {
	name: string;
	in: SwaggerInOptions;
	description: string;
	required: boolean;
	type: string;
	format?: string;
}
export interface SwaggerTags {
	name: string;
	description: string;
	externalDocs: SwaggerExternalDocuments;
}
export interface SwaggerInfo {
	title: string;
	version: string;
}
export interface SwaggerContact {
	email: string;
}

export interface SwaggerLicense {
	name: string;
	url: string;
}

export interface SwaggerExternalDocuments {
	description: string;
	url: string;
}
