import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiActions';
import {
	LinkType,
	NodePropertyTypesByLanguage,
	ProgrammingLanguages,
	NameSpace,
	MakeConstant,
	ConstantsDeclaration,
	STANDARD_CONTROLLER_USING
} from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
import { fs_readFileSync } from './modelgenerators';

const EXTENSION_CLASS_TEMPLATE = './app/templates/extensions/extensions.tpl';
const EXTENSION_PROPERTY_TEMPLATE = './app/templates/extensions/extension_properties.tpl';
const EXTENSION_NEW_INSTANCE = './app/templates/extensions/extension_new_instance.tpl';
const EXTENSION_NEW_PROPERTY = './app/templates/extensions/extension_new_instance_properties.tpl';

const EXTENSION_NEW_INSTANCE_LIST = './app/templates/extensions/extension_new_instance_list.tpl';
const EXTENSION_NEW_INSTANCE_LIST_ADD = './app/templates/extensions/extension_new_instance_list_add.tpl';

const EXTENSION_NEW_INSTANCE_DICTIONARY = './app/templates/extensions/extension_new_instance_dictionary.tpl';
const EXTENSION_NEW_INSTANCE_DICTIONARY_ADD = './app/templates/extensions/extension_new_instance_dictionary_add.tpl';
const EXTENSION_NEW_TEMPLATE_LIST = './app/templates/extensions/create_new_list_instance.tpl';
const PROPERTY_TABS = 6;
export default class ExtensionGenerator {
	static Tabs(c: number) {
		let res = '';
		for (var i = 0; i < c; i++) {
			res += TAB;
		}
		return res;
	}
	static GetExtensionNodeValues(extensionNode: any) {
		var def = GetNodeProp(extensionNode, NodeProperties.UIExtensionDefinition);
		if (def && def.config) {
			if (def.config.isEnumeration) {
				var extensionValues = def.config.list.map((t: { [x: string]: any }) => {
					return def.config.keyField ? t[def.config.keyField] : t[Object.keys(t)[0]];
				});
				return extensionValues;
			}
		}
		throw new Error('unhandled - getting extensions nodes not as an enumeration');
	}
	static CreateListInstanceTemplate(options: { node: any; name: any }) {
		let { node, name } = options;
		let _newTemplateList = fs_readFileSync(EXTENSION_NEW_TEMPLATE_LIST, 'utf8');
		return bindTemplate(_newTemplateList, {
			name,
			model: GetNodeProp(node, NodeProperties.CodeName)
		});
	}
	static Generate(options: { state: any; key: any; language?: any }) {
		var { state, key } = options;
		let extensions = NodesByType(state, NodeTypes.ExtensionType);
		let graphRoot = GetRootGraph(state);
		let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

		let _extensionClassTemplate = fs_readFileSync(EXTENSION_CLASS_TEMPLATE, 'utf8');
		let _extensionPropertyTemplate = fs_readFileSync(EXTENSION_PROPERTY_TEMPLATE, 'utf8');
		let _extensionNewInstance = fs_readFileSync(EXTENSION_NEW_INSTANCE, 'utf8');
		let _extensionNewProperty = fs_readFileSync(EXTENSION_NEW_PROPERTY, 'utf8');
		let _extensionNewInstanceList = fs_readFileSync(EXTENSION_NEW_INSTANCE_LIST, 'utf8');
		let _extensionNewInstanceListAdd = fs_readFileSync(EXTENSION_NEW_INSTANCE_LIST_ADD, 'utf8');
		let _extensionNewInstanceDictionary = fs_readFileSync(EXTENSION_NEW_INSTANCE_DICTIONARY, 'utf8');
		let _extensionNewInstanceDictionaryAdd = fs_readFileSync(EXTENSION_NEW_INSTANCE_DICTIONARY_ADD, 'utf8');
		let result: any = {};
		extensions.map((extension: any) => {
			let extensionClassTemplate = _extensionClassTemplate;
			let properties = '';
			let statics = '';
			var constants: any[] = [];
			let uiExtensionDefinition = GetNodeProp(extension, NodeProperties.UIExtensionDefinition);
			if (uiExtensionDefinition) {
				let modelName = GetNodeProp(extension, NodeProperties.CodeName);
				let { config, definition } = uiExtensionDefinition;
				if (definition) {
					definition = { ...definition, Value: 'string' };
					properties = Object.keys(definition)
						.map((e) => {
							var extensionPropertyTemplate = _extensionPropertyTemplate;

							extensionPropertyTemplate = bindTemplate(extensionPropertyTemplate, {
								name: modelName,
								property: e,
								type: definition[e]
							});
							return extensionPropertyTemplate;
						})
						.join('');
					if (config) {
						var instances = [];
						let instance = '';
						if (config.isEnumeration) {
							instances = config.list.map((item: { [x: string]: any }, item_index: number) => {
								item = { ...item, Value: item_index + 1 };
								let temp;
								let props = Object.keys(item)
									.map((key) => {
										let temp = _extensionNewProperty;
										temp = bindTemplate(temp, {
											property: key,
											value: MakeConstant(item[key])
										});
										if (isNaN(item[key]))
											constants.push({
												name: MakeConstant(item[key]),
												value: `"${item[key]}"`
											});
										return temp;
									})
									.join(`,${NL}`);
								temp = _extensionNewInstance;
								temp = bindTemplate(temp, {
									properties: jNL + ExtensionGenerator.Tabs(PROPERTY_TABS) + props,
									model: modelName
								});
								return temp;
							});
						} else {
							let temp;
							let props = Object.keys(config.dictionary)
								.map((key) => {
									let temp = _extensionNewProperty;
									let item = { ...config.dictionary };
									temp = bindTemplate(temp, {
										property: key,
										value: MakeConstant(item[key])
									});
									if (isNaN(item[key]))
										constants.push({
											name: MakeConstant(item[key]),
											value: `"${item[key]}"`
										});
									return temp;
								})
								.join(`,${NL}`);
							temp = _extensionNewInstance;
							temp = bindTemplate(temp, {
								properties: jNL + ExtensionGenerator.Tabs(PROPERTY_TABS) + props,
								model: modelName
							});
							instance = temp;
							let temp_instance = _extensionNewInstanceDictionary;
							temp_instance = bindTemplate(temp_instance, {
								instance,
								model: modelName
							});
							instance = temp_instance;
						}
						instances = instances.map((inst: any) => {
							let temp = _extensionNewInstanceListAdd;

							temp = bindTemplate(temp, {
								instance: inst
							});
							return temp;
						});

						let templist = _extensionNewInstanceList;
						statics =
							bindTemplate(templist, {
								addings: instances.join(''),
								model: modelName
							}) +
							jNL +
							instance;
					}
				}
			}
			extensionClassTemplate = bindTemplate(extensionClassTemplate, {
				name: GetNodeProp(extension, NodeProperties.CodeName),
				properties,
				statics: statics,
				constants: constants
					.unique((x: any) => x)
					.map((co: { name: any; value: any }) => jNL + ExtensionGenerator.Tabs(3) + ConstantsDeclaration(co))
					.join('')
			});

			result[GetNodeProp(extension, NodeProperties.CodeName)] = {
				id: GetNodeProp(extension, NodeProperties.CodeName),
				name: GetNodeProp(extension, NodeProperties.CodeName),
				template: NamespaceGenerator.Generate({
					template: extensionClassTemplate,
					usings: [ ...STANDARD_CONTROLLER_USING ],
					namespace,
					space: NameSpace.Extensions
				})
			};
		});

		return result;
	}
}
const NL = `
                    `;
const jNL = `
`;
const TAB = `   `;
