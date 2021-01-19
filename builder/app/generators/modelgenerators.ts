/* eslint-disable no-underscore-dangle */
import * as GraphMethods from '../methods/graph_methods';
import {
	GetNodeProp,
	NodeProperties,
	GetRootGraph,
	NodesByType,
	NodePropertyTypes,
	NEW_LINK,
	GetCurrentGraph,
	GetCodeName,
	GetModelPropertyChildren,
	GetLinkProperty,
	GetNodeType,
	GetJSCodeName,
	GetNodeByProperties,
	GetSnakeCase,
	GetModelPropertyNodes,
	GetState,
	GetNodeTitle
} from '../actions/uiActions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	Usings,
	ValidationRules,
	NameSpace,
	NodeTypes,
	STANDARD_CONTROLLER_USING,
	NEW_LINE,
	LinkProperties,
	LinkPropertyKeys
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

import { Node } from '../methods/graph_types';
const MODEL_TEMPLATE = './app/templates/models/model.tpl';
const MODEL_TEMPLATE_TS = './app/templates/models/model-ts.tpl';
const MODEL_PROPERTY_TEMPLATE = './app/templates/models/model_property.tpl';
const MODEL_PROPERTY_TEMPLATE_TS = './app/templates/models/model_property-ts.tpl';
const MODEL_STATIC_TEMPLATES = './app/templates/models/model_statics.tpl';
const MODEL_ATTRIBUTE_TEMPLATE = './app/templates/models/model_attributes.tpl';
export default class ModelGenerator {
	static GenerateModelPropertyDefaults(
		modelId: any,
		codeSymbol: string,
		language: string = ProgrammingLanguages.CSHARP
	) {
		let graph = GetCurrentGraph();
		let propertyNodes: any[] = GetModelPropertyNodes(modelId);
		let result: any[] = [];
		propertyNodes.forEach((property: Node) => {
			let enumeration = GraphMethods.GetNodeLinkedTo(graph, {
				id: property.id,
				link: LinkType.Enumeration,
				direction: GraphMethods.SOURCE
			});
			if (enumeration) {
				let link = GraphMethods.GetLinkBetween(property.id, enumeration.id, graph);
				if (link) {
					let defaultValues = GetLinkProperty(link, LinkPropertyKeys.DefaultValue);
					if (defaultValues && defaultValues.length) {
						let defaultValue = defaultValues[0];
						if (language === ProgrammingLanguages.CSHARP) {
							let eumerationValues = GetNodeProp(enumeration, NodeProperties.Enumeration) || [];
							if (eumerationValues) {
								let enumerationValue = eumerationValues.find(
									(enem: { id: string }) => enem.id === defaultValue
								);
								if (enumerationValue) {
									result.push(
										`${codeSymbol}.${GetCodeName(property)} = ${GetCodeName(
											enumeration
										)}.${`${enumerationValue.value}`.toUpperCase()};`
									);
								}
							}
						}
					}
				}
			}
		});
		return result.join(NEW_LINE);
	}
	static Generate(options: { state: any; key?: any; language?: any }) {
		const { state } = options;
		const graphRoot = GetRootGraph(state);
		const models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => {
				if (GetNodeProp(x, NodeProperties.ExcludeFromController)) {
					if (GetNodeProp(x, NodeProperties.ComplexType)) {
						return true;
					}
					return false;
				}
				return true;
			})
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
		const result: any = {};
		models.map((model: { id: any }) => {
			const res: any = ModelGenerator.GenerateModel({
				graph: graphRoot,
				nodeId: model.id,
				state
			});
			result[res.id] = res;
		});

		return result;
	}

	static GenerateCommon(options: { state: any }) {
		let template = fs_readFileSync('./app/templates/common/common.d.ts', 'utf8');
		let userModel = GetNodeByProperties({
			[NodeProperties.IsUser]: true,
			[NodeProperties.NODEType]: NodeTypes.Model
		});
		let modelconsts =
			`
      const Models = { ` +
			NodesByType(GetState(), NodeTypes.Model)
				.map((g: any) => `${GetCodeName(g)}: '${GetCodeName(g)}'`)
				.join(',' + NEW_LINE) +
			'};';
		return {
			common: {
				template:
					bindTemplate(template, {
						user_type: GetCodeName(userModel)
					}) + modelconsts
			}
		};
	}

	static GenerateTs(options: { state: any; key?: any; language?: any; includeImports?: boolean }) {
		const { includeImports, state } = options;
		const graphRoot = GetRootGraph(state);
		const models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
		const result: any = {};
		models.map((model: { id: any }) => {
			const res: any = ModelGenerator.GenerateModelTs({
				graph: graphRoot,
				nodeId: model.id,
				state,
				includeImports: includeImports || false
			});
			result[res.id] = res;
		});

		return result;
	}
	static GenerateModel(options: { graph: any; nodeId: any; state: any }) {
		const { state, graph, nodeId } = options;
		const usings: string[] = [];
		const templateSwapDictionary: any = {};
		const graphRoot = GetRootGraph(state);
		const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		const node = GraphMethods.GetNode(graph, nodeId);
		if (!node) {
			return null;
		}

		templateSwapDictionary.model = GetNodeProp(node, NodeProperties.CodeName);
		templateSwapDictionary.base_model = GetNodeProp(node, NodeProperties.IsUser) ? 'RedUser' : 'DBaseData';
		templateSwapDictionary.account_enabling_func = '';
		if (GetNodeProp(node, NodeProperties.IsUser)) {
			templateSwapDictionary.account_enabling_func = `

        public static User Create(RedExternalLoginViewModel model)
        {
            return new User
            {
                Email = model.Email,
                UserName = model.UserName
            };
        }
        public static User Create(RedRegisterViewModel model)
        {
            return new User
            {
                Email = model.Email,
                UserName = model.UserName
            };
        }`;
		}
		let defaultModelFunc = this.GenerateDefaultModelFunc(node);
		templateSwapDictionary.default_model_create = defaultModelFunc;
		templateSwapDictionary.attributes = '';
		let connectedProperties = GetModelPropertyChildren(node.id); //Get all properties including link to other models
		//  GraphMethods.getNodesByLinkType(graph, {
		//   id: node.id,
		//   type: LinkType.PropertyLink,
		//   direction: GraphMethods.SOURCE
		// });
		const logicalParents: any[] = []; // No more having parents referencing back.
		//  GraphMethods.getNodesByLinkType(graph, {
		//   id: node.id,
		//   type: LinkType.LogicalChildren,
		//   direction: GraphMethods.TARGET
		// }).filter(x => x.id !== node.id);
		connectedProperties = [...connectedProperties, ...logicalParents];
		const propertyTemplate = fs_readFileSync(MODEL_PROPERTY_TEMPLATE, 'utf8');
		const attributeTemplate = fs_readFileSync(MODEL_ATTRIBUTE_TEMPLATE, 'utf8');
		const staticFunctionTemplate = fs_readFileSync(MODEL_STATIC_TEMPLATES, 'utf8');

		const validatorFunctions = GraphMethods.getNodesByLinkType(graph, {
			id: nodeId,
			type: LinkType.ValidatorModel,
			direction: GraphMethods.TARGET
		})
			.map((t) => GetNodeProp(t, NodeProperties.CodeName))
			.map((t) => ModelGenerator.tabs(1) + `[${t}]` + NEW_LINE)
			.join('');
		templateSwapDictionary.attributes = validatorFunctions;

		const staticFunctions = [];
		const properties = connectedProperties
			.filter((x: any) => !GetNodeProp(x, NodeProperties.IsDefaultProperty))
			.filter((x: { id: any }) => x.id !== nodeId)
			.map((propNode: { id: any }) => {
				const connectedAttributes = GraphMethods.getNodesByLinkType(graph, {
					id: propNode.id,
					type: LinkType.AttributeLink,
					direction: GraphMethods.SOURCE
				});
				let propertyInstanceTemplate = propertyTemplate;
				const np = GetNodeProp(propNode, NodeProperties.UIAttributeType) || NodePropertyTypes.STRING;
				if (Usings[ProgrammingLanguages.CSHARP][np]) {
					usings.push(
						...Usings[ProgrammingLanguages.CSHARP][np],
						`${namespace}${NameSpace.Model}`,
						`${namespace}${NameSpace.Extensions}`
					);
				}
				let propType = NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][np];

				if (GetNodeProp(propNode, NodeProperties.IsTypeList)) {
					const types = GraphMethods.GetNodesLinkedTo(graph, {
						id: propNode.id,
						link: LinkType.ModelTypeLink
					});
					if (types && types.length) {
						propType = GetCodeName(types[0]);
						propType = `IList<${propType}>`;
					}
				} else if (
					GetNodeProp(propNode, NodeProperties.UseComplexAsType) &&
					GetNodeProp(propNode, NodeProperties.ComplexAsType)) {
					propType = GetCodeName(GetNodeProp(propNode, NodeProperties.ComplexAsType));
				} else if (
					GetNodeProp(propNode, NodeProperties.UIModelType) &&
					GetNodeProp(propNode, NodeProperties.UseModelAsType)
				) {
					propType = 'string';
				} else if (GetNodeProp(propNode, NodeProperties.NODEType) === NodeTypes.Model) {
					let propLink = GraphMethods.GetLinkBetween(nodeId, propNode.id, graph);
					if (propLink) {
						switch (GetLinkProperty(propLink, LinkPropertyKeys.TYPE)) {
							case LinkType.UserLink:
								throw new Error('unhandled');
							default:
								propType = 'IList<string>'; // changed from string => ilist<string> cause we are keeping references with the model.
								break;
						}
					} else {
						propLink = GraphMethods.GetLinkBetween(propNode.id, nodeId, graph);
						switch (GetLinkProperty(propLink, LinkPropertyKeys.TYPE)) {
							case LinkType.UserLink:
								propType = 'string';
								return false;
							default:
								propLink = GraphMethods.GetLinkBetween(nodeId, propNode.id, graph);
								if (!propLink) {
									console.warn('unhandled: modelgenerator.ts');
								}
						}
					}
				}
				if (GetNodeProp(propNode, NodeProperties.UseModelAsType)) {
					if (GetNodeProp(propNode, NodeProperties.IsReferenceList)) {
						propType = `IList<${propType}>`;
					}
				}

				const propSwapDictionary = {
					model: GetNodeProp(node, NodeProperties.CodeName),
					property_type: propType,
					property: GetNodeProp(propNode, NodeProperties.CodeName),
					attributes: connectedAttributes
						.map((attr: any) => {
							const optionLists = GraphMethods.getNodesByLinkType(graph, {
								id: attr.id,
								type: LinkType.Option,
								direction: GraphMethods.SOURCE
							});
							let optionsList: any[] = [];
							optionLists.map((ol: any) => {
								const ols: any = GraphMethods.getNodesByLinkType(graph, {
									id: ol.id,
									type: LinkType.OptionItem,
									direction: GraphMethods.SOURCE
								});
								ols.map((_ols: any) => {
									if (GetNodeProp(_ols, NodeProperties.UseCustomUIOption)) {
										optionsList.push(GetNodeProp(_ols, NodeProperties.UIOptionTypeCustom));
									} else {
										optionsList.push(GetNodeProp(_ols, NodeProperties.UIOptionType));
									}
								});
							});
							optionsList = optionsList.unique().map((t: any) => `UIAttribute.${t}`);

							const ReverseRules: any = {};
							Object.keys(ValidationRules).forEach((ruleKey) => {
								ReverseRules[ValidationRules[ruleKey]] = ruleKey;
							});
							const validations: string[] = [];
							if (GetNodeProp(attr, NodeProperties.UseUIValidations)) {
								GraphMethods.getNodesByLinkType(graph, {
									id: attr.id,
									type: LinkType.Validation,
									direction: GraphMethods.SOURCE
								}).map((vnode: any) => {
									GraphMethods.getNodesByLinkType(graph, {
										id: vnode.id,
										type: LinkType.ValidationItem,
										direction: GraphMethods.SOURCE
									}).map((vnodeItem) => {
										validations.push(
											`ValidationRules.${ReverseRules[
											GetNodeProp(vnodeItem, NodeProperties.UIValidationType)
											]}`
										);
									});
								});
							}
							let choiceName = null;
							if (GetNodeProp(attr, NodeProperties.UIExtensionList)) {
								GraphMethods.getNodesByLinkType(graph, {
									id: attr.id,
									type: LinkType.Extension,
									direction: GraphMethods.SOURCE
								}).map((vnode) => {
									choiceName = GetNodeProp(vnode, NodeProperties.CodeName);
								});
							}

							const options2 =
								optionsList && optionsList.length
									? bindTemplate(`Options = new string[] { {{options_list}} },`, {
										options_list: optionsList.map((t: any) => `${t}`).join(', ')
									})
									: '';

							const validationRules =
								validations && validations.length
									? bindTemplate(`ValidationRules = new string[] { {{validation_list}} },`, {
										validation_list: validations.map((t) => `${t}`).join(', ')
									})
									: '';

							const choiceType = choiceName
								? bindTemplate('ChoiceType = {{choice_type}}.Name,', {
									choice_type: choiceName
								})
								: '';

							const attributeSwapDictionary = {
								property: GetNodeProp(propNode, NodeProperties.CodeName),
								property_type: GetNodeProp(propNode, NodeProperties.UseModelAsType)
									? GetNodeProp(propNode, NodeProperties.UIModelType)
									: GetNodeProp(propNode, NodeProperties.UIAttributeType),
								ui_title: GetNodeProp(propNode, NodeProperties.UIName),
								singular: !!GetNodeProp(propNode, NodeProperties.UISingular),
								options: options2,
								choice_type: choiceType,
								validation_rules: validationRules
							};

							return bindTemplate(attributeTemplate, attributeSwapDictionary);
						})
						.filter((x) => x)
						.join('\r\n')
				};

				propertyInstanceTemplate = bindTemplate(propertyInstanceTemplate, propSwapDictionary);
				return propertyInstanceTemplate;
			})
			.filter((x: any) => x);
		if (GetNodeProp(node, NodeProperties.HasLogicalChildren) && GetNodeProp(node, NodeProperties.ManyToManyNexus)) {
			(GetNodeProp(node, NodeProperties.LogicalChildrenTypes) || []).map((t: string) => {
				const propNode = GraphMethods.GetNode(GetCurrentGraph(state), t);
				const propSwapDictionary = {
					property_type: NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][NodePropertyTypes.STRING],
					property: GetNodeProp(propNode, NodeProperties.CodeName),
					attributes: ''
				};

				properties.push(bindTemplate(propertyTemplate, propSwapDictionary));
			});
		}

		const staticDic: any = {
			model: GetNodeProp(node, NodeProperties.CodeName)
		};

		const _properties = GetModelPropertyChildren(node.id, {
			skipLogicalChildren: false // now we are switching to references being held with the object.
		})
			.map((v: any) => {
				const propType = GetNodeProp(v, NodeProperties.UIAttributeType);
				const nodeType = GetNodeType(v);
				const useComplexAsType = GetNodeProp(v, NodeProperties.UseComplexAsType);
				const complexAsType = GetNodeProp(v, NodeProperties.ComplexAsType);
				if (nodeType === NodeTypes.Model) {
					const modelLink =
						GraphMethods.GetLinkBetween(v.id, node.id, graph) ||
						GraphMethods.GetLinkBetween(node.id, v.id, graph);
					if (GetLinkProperty(modelLink, LinkPropertyKeys.TYPE) === LinkType.UserLink) {
						return `if(a.${GetCodeName(v)} == null) {
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
					}
					switch (propType) {
						case NodePropertyTypes.STRING:

							return `if(string.IsNullOrEmpty(a.${GetCodeName(v)})){
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
					}
					return `if(a.${GetCodeName(v)} == null || a.${GetCodeName(v)}.Count == 0) {
            model.${GetCodeName(v)} = b.${GetCodeName(v)};
          }`;
				}
				switch (propType) {
					case NodePropertyTypes.STRING:
						if (useComplexAsType && complexAsType) {
							return `if(a.${GetCodeName(v)} != null && b.${GetCodeName(v)} != null) {
			  model.${GetCodeName(v)} = ${GetCodeName(complexAsType)}.Merge(a.${GetCodeName(v)}, b.${GetCodeName(v)});
			} else if(a.${GetCodeName(v)} == null && b.${GetCodeName(v)} != null) { 
				model.${GetCodeName(v)} = b.${GetCodeName(v)};
			}`;
						}
						return `if(string.IsNullOrEmpty(a.${GetCodeName(v)})){
            model.${GetCodeName(v)} = b.${GetCodeName(v)};
          }`;
					case NodePropertyTypes.LISTOFSTRINGS:
					case NodePropertyTypes.DICTSTRING:
					case NodePropertyTypes.PHONENUMBER:
					case NodePropertyTypes.EMAIL:
					case NodePropertyTypes.DATETIME:
						return `if(a.${GetCodeName(v)} == null){
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
					case NodePropertyTypes.BOOLEAN:
						return `if(!a.${GetCodeName(v)}){
              model.${GetCodeName(v)} = b.${GetCodeName(v)};
            }`;
					case NodePropertyTypes.DOUBLE:
					case NodePropertyTypes.FLOAT:
					case NodePropertyTypes.INT:
						return `if(a.${GetCodeName(v)} == 0){
                  model.${GetCodeName(v)} = b.${GetCodeName(v)};
                }`;
					default:
						break;
				}
				return null;
			})
			.filter((x: any) => x)
			.join(NEW_LINE);
		staticDic.property_set_merge = _properties;

		staticFunctions.push(bindTemplate(staticFunctionTemplate, staticDic));

		if (GetNodeProp(node, NodeProperties.IsUser)) {
			const agenNodes = NodesByType(state, NodeTypes.Model).filter(
				(x: { id: string }) => x.id !== node.id && GetNodeProp(x, NodeProperties.IsAgent)
			);
			agenNodes.map((agent: any) => {
				let propertyInstanceTemplate = propertyTemplate;
				const propSwapDictionary = {
					property_type: NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][NodePropertyTypes.STRING],
					property: GetNodeProp(agent, NodeProperties.CodeName),
					attributes: ''
				};
				propertyInstanceTemplate = bindTemplate(propertyInstanceTemplate, propSwapDictionary);
				properties.push(propertyInstanceTemplate);
			});
		}
		templateSwapDictionary.properties = properties.join('');
		templateSwapDictionary.staticFunctions = staticFunctions.unique((x: any) => x).join('\n');

		let modelTemplate = fs_readFileSync(MODEL_TEMPLATE, 'utf8');
		modelTemplate = bindTemplate(modelTemplate, templateSwapDictionary);

		const result = {
			id: GetNodeProp(node, NodeProperties.CodeName),
			name: GetNodeProp(node, NodeProperties.CodeName),
			template: NamespaceGenerator.Generate({
				template: modelTemplate,
				usings: [...usings, `RedQuickCore.Identity`, ...STANDARD_CONTROLLER_USING],
				namespace,
				space: NameSpace.Model
			})
		};
		return result;
	}
	static GenerateDefaultModelFunc(node: Node) {
		let properties = GetModelPropertyNodes(node.id);
		let items = ``;
		properties.filter((x) => GetNodeProp(x, NodeProperties.UseDefaultValue)).forEach((property) => {
			let type = GetNodeProp(property, NodeProperties.UIAttributeType);
			switch (type) {
				case NodePropertyTypes.PHONENUMBER:
				case NodePropertyTypes.EMAIL:
				case NodePropertyTypes.STRING:
					items =
						items +
						`
        result.${GetCodeName(property)} = "${GetNodeProp(property, NodeProperties.DefaultValue)}";
        `;
					break;
				case NodePropertyTypes.BOOLEAN:
				case NodePropertyTypes.DOUBLE:
				case NodePropertyTypes.FLOAT:
				case NodePropertyTypes.INT:
					items =
						items +
						`
          result.${GetCodeName(property)} = ${GetNodeProp(property, NodeProperties.DefaultValue)};
          `;
					break;
			}
		});
		let template = `public static ${GetCodeName(node)}  GetDefaultModel() {
      var result = Create();

${items}

      return result;
    }`;

		return template;
	}
	static ModelImports(options: { graph: any; rel: any }) {
		const state = GetState();
		let { rel } = options;

		let result: string[] = [];
		const models = NodesByType(state, NodeTypes.Model)
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
			.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));

		result = models.map((model: { id: any }) => {
			return `import { ${GetCodeName(model)} } from '../${rel}models/${GetSnakeCase(model)}';`;
		});

		return result.join(NEW_LINE);
	}
	static GenerateModelTs(options: { graph: any; nodeId: any; state: any; includeImports: boolean }) {
		const { state, graph, nodeId } = options;

		const { includeImports } = options;
		const usings: string[] = [];
		const templateSwapDictionary: any = {};
		const graphRoot = GetRootGraph(state);
		const namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		const node = GraphMethods.GetNode(graph, nodeId);
		if (!node) {
			return null;
		}
		templateSwapDictionary.model = GetNodeProp(node, NodeProperties.CodeName);
		templateSwapDictionary.account_enabling_func = '';

		templateSwapDictionary.attributes = '';
		let connectedProperties = GetModelPropertyChildren(node.id); //Get all properties including link to other models
		const logicalParents: any[] = []; // No more having parents referencing back.
		connectedProperties = [...connectedProperties, ...logicalParents];
		const propertyTemplate = fs_readFileSync(MODEL_PROPERTY_TEMPLATE_TS, 'utf8');
		const staticFunctionTemplate = fs_readFileSync(MODEL_STATIC_TEMPLATES, 'utf8');

		let imports: string[] = [];
		const staticFunctions = [];
		const properties = connectedProperties
			// .filter((x: any) => !GetNodeProp(x, NodeProperties.IsDefaultProperty))
			.filter((x: { id: any }) => x.id !== nodeId)
			.map((propNode: { id: any }) => {
				let propertyInstanceTemplate = propertyTemplate;
				const np = GetNodeProp(propNode, NodeProperties.UIAttributeType) || NodePropertyTypes.STRING;

				let propType = NodePropertyTypesByLanguage[ProgrammingLanguages.JavaScript][np];

				if (GetNodeProp(propNode, NodeProperties.IsTypeList)) {
					const types = GraphMethods.GetNodesLinkedTo(graph, {
						id: propNode.id,
						link: LinkType.ModelTypeLink
					});
					if (types && types.length) {
						propType = GetCodeName(types[0]);
						imports.push(`import { ${GetCodeName(types[0])} } from './${GetSnakeCase(types[0])}';`);
						propType = `${propType}[]`;
					}
				} else if (
					GetNodeProp(propNode, NodeProperties.UIModelType) &&
					GetNodeProp(propNode, NodeProperties.UseModelAsType)
				) {
					propType = 'string';
				} else if (GetNodeProp(propNode, NodeProperties.NODEType) === NodeTypes.Model) {
					let propLink = GraphMethods.GetLinkBetween(nodeId, propNode.id, graph);
					if (propLink) {
						switch (GetLinkProperty(propLink, LinkPropertyKeys.TYPE)) {
							case LinkType.UserLink:
								throw new Error('unhandled');
							default:
								propType = 'string[]'; // changed from string => ilist<string> cause we are keeping references with the model.
								break;
						}
					} else {
						propLink = GraphMethods.GetLinkBetween(propNode.id, nodeId, graph);
						switch (GetLinkProperty(propLink, LinkPropertyKeys.TYPE)) {
							case LinkType.UserLink:
								propType = 'string';
								return false;
							default:
								propLink = GraphMethods.GetLinkBetween(nodeId, propNode.id, graph);
								if (!propLink) {
									console.warn('unhandled: modelgenerator.ts');
								}
						}
					}
				}
				if (GetNodeProp(propNode, NodeProperties.UseModelAsType)) {
					if (GetNodeProp(propNode, NodeProperties.IsReferenceList)) {
						propType = `${propType}[]`;
					}
				}

				const propSwapDictionary = {
					model: GetJSCodeName(node),
					property_type: propType,
					property: GetJSCodeName(propNode)
				};

				propertyInstanceTemplate = bindTemplate(propertyInstanceTemplate, propSwapDictionary);
				return propertyInstanceTemplate;
			})
			.filter((x: any) => x);
		if (GetNodeProp(node, NodeProperties.HasLogicalChildren) && GetNodeProp(node, NodeProperties.ManyToManyNexus)) {
			(GetNodeProp(node, NodeProperties.LogicalChildrenTypes) || []).map((t: string) => {
				const propNode = GraphMethods.GetNode(GetCurrentGraph(state), t);
				const propSwapDictionary = {
					property_type:
						NodePropertyTypesByLanguage[ProgrammingLanguages.JavaScript][NodePropertyTypes.STRING],
					property: GetJSCodeName(propNode),
					attributes: ''
				};
				imports.push(`import { ${GetCodeName(t)} } from './${GetSnakeCase(t)}';`);
				properties.push(bindTemplate(propertyTemplate, propSwapDictionary));
			});
		}

		if (GetNodeProp(node, NodeProperties.IsUser)) {
			const agenNodes = NodesByType(state, NodeTypes.Model).filter(
				(x: { id: string }) => x.id !== node.id && GetNodeProp(x, NodeProperties.IsAgent)
			);
			agenNodes.map((agent: any) => {
				let propertyInstanceTemplate = propertyTemplate;
				const propSwapDictionary = {
					property_type: NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][NodePropertyTypes.STRING],
					property: GetJSCodeName(agent),
					attributes: ''
				};
				propertyInstanceTemplate = bindTemplate(propertyInstanceTemplate, propSwapDictionary);
				properties.push(propertyInstanceTemplate);
			});
		}
		templateSwapDictionary.properties = properties.unique().join('');

		let modelTemplate = fs_readFileSync(MODEL_TEMPLATE_TS, 'utf8');
		templateSwapDictionary.imports = includeImports ? imports.join(NEW_LINE) : '';
		modelTemplate = bindTemplate(modelTemplate, templateSwapDictionary);

		const result = {
			id: `${GetNodeProp(node, NodeProperties.CodeName)}.ts`,
			name: `${GetNodeProp(node, NodeProperties.CodeName)}.ts`,
			relative: './src/models',
			relativeFilePath: `/${GetSnakeCase(node)}.ts`,
			template: modelTemplate
		};
		return result;
	}

	static tabs(c: number) {
		let res = '';
		const TAB = '\t';
		for (let i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}
}

export function fs_readFileSync(pa: string, typ: string = 'utf-8'): string {
	try {
		return fs.readFileSync(pa, typ);
	}
	catch {
		if (pa.indexOf('./app') !== -1) {
			try {
				return fs.readFileSync('./' + pa.substring('./app'.length), 'utf8');
			} catch (e) {
				return '';
			}
		}
	}
	return '';
}


export function fs_existsSync(pa: string): boolean {
	try {
		return fs.existsSync(pa);
	}
	catch {
		if (pa.indexOf('./app') !== -1) {
			try {
				return fs.existsSync('./' + pa.substring('./app'.length));
			} catch (e) {
				return false;
			}
		}
	}
	return false;
}

export function fs_readdirSync(pa: string): string[] {
	try {
		return fs.readdirSync(pa);
	}
	catch {
		if (pa.indexOf('./app') !== -1) {
			try {
				return fs.readdirSync('./' + pa.substring('./app'.length));
			} catch (e) {
				return [];
			}
		}
	}
	return [];
}


