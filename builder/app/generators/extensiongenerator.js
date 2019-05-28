import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';

const EXTENSION_CLASS_TEMPLATE = './app/templates/extensions/extensions.tpl';
const EXTENSION_PROPERTY_TEMPLATE = './app/templates/extensions/extension_properties.tpl';
const EXTENSION_NEW_INSTANCE = './app/templates/extensions/extension_new_instance.tpl';
const EXTENSION_NEW_PROPERTY = './app/templates/extensions/extension_new_instance_properties.tpl';
const EXTENSION_NEW_INSTANCE_LIST = './app/templates/extensions/extension_new_instance_list.tpl';
const EXTENSION_NEW_INSTANCE_LIST_ADD = './app/templates/extensions/extension_new_instance_list_add.tpl';

export default class ExtensionGenerator {
    static Generate(options) {
        var { state } = options;
        let extensions = NodesByType(state, NodeTypes.ExtensionType);

        let _extensionClassTemplate = fs.readFileSync(EXTENSION_CLASS_TEMPLATE, 'utf-8');
        let _extensionPropertyTemplate = fs.readFileSync(EXTENSION_PROPERTY_TEMPLATE, 'utf-8');
        let _extensionNewInstance = fs.readFileSync(EXTENSION_NEW_INSTANCE, 'utf-8');
        let _extensionNewProperty = fs.readFileSync(EXTENSION_NEW_PROPERTY, 'utf-8');
        let _extensionNewInstanceList = fs.readFileSync(EXTENSION_NEW_INSTANCE_LIST, 'utf-8');
        let _extensionNewInstanceListAdd = fs.readFileSync(EXTENSION_NEW_INSTANCE_LIST_ADD, 'utf-8');
        let result = {};
        extensions.map(extension => {
            let extensionClassTemplate = _extensionClassTemplate;
            let properties = '';
            let statics = '';
            let uiExtensionDefinition = GetNodeProp(extension, NodeProperties.UIExtensionDefinition);
            if (uiExtensionDefinition) {
                let modelName = GetNodeProp(extension, NodeProperties.CodeName);
                let { config, definition } = uiExtensionDefinition;
                if (definition) {
                    definition = { ...definition, Value: 'string' };
                    properties = Object.keys(definition).map(e => {
                        var extensionPropertyTemplate = _extensionPropertyTemplate;

                        extensionPropertyTemplate = bindTemplate(extensionPropertyTemplate, {
                            name: modelName,
                            property: e,
                            type: definition[e]
                        });
                        return extensionPropertyTemplate;
                    }).join('');
                    if (config) {
                        var instances = [];
                        if (config.isEnumeration) {
                            instances = config.list.map((item, item_index) => {
                                item = { ...item, Value: (item_index + 1) }
                                let temp;
                                let props = Object.keys(item).map(key => {
                                    let temp = _extensionNewProperty;
                                    temp = bindTemplate(temp, {
                                        property: key,
                                        value: `"${item[key]}"`
                                    });
                                    return temp;
                                }).join(`,${NL}`);
                                temp = _extensionNewInstance;
                                temp = bindTemplate(temp, {
                                    properties: props,
                                    model: modelName
                                });
                                return temp;
                            })
                        }
                        instances = instances.map(inst => {
                            let temp = _extensionNewInstanceListAdd;

                            temp = bindTemplate(temp, {
                                instance: inst
                            })
                            return temp;
                        });

                        let templist = _extensionNewInstanceList;
                        statics = bindTemplate(templist, {
                            addings: instances.join(''),
                            model: modelName
                        })
                    }
                }
            }
            extensionClassTemplate = bindTemplate(extensionClassTemplate, {
                name: GetNodeProp(extension, NodeProperties.CodeName),
                properties,
                statics: statics
            });

            result[GetNodeProp(extension, NodeProperties.CodeName)] = extensionClassTemplate;
        })

        return result;
    }
}
const NL = `
                    `