import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';

const EXTENSION_CLASS_TEMPLATE = './app/templates/extensions/extensions.tpl';
const EXTENSION_PROPERTY_TEMPLATE = './app/templates/extensions/extension_properties.tpl';

export default class ExtensionGenerator {
    static Generate(options) {
        var { state } = options;
        let extensions = NodesByType(state, NodeTypes.ExtensionType);

        let _extensionClassTemplate = fs.readFileSync(EXTENSION_CLASS_TEMPLATE, 'utf-8');
        let _extensionPropertyTemplate = fs.readFileSync(EXTENSION_PROPERTY_TEMPLATE, 'utf-8');
        let result = {};
        extensions.map(extension => {
            let extensionClassTemplate = _extensionClassTemplate;
            let properties = '';
            let uiExtensionDefinition = GetNodeProp(extension, NodeProperties.UIExtensionDefinition);
            if (uiExtensionDefinition) {
                let { config, definition } = uiExtensionDefinition;
                if (definition) {
                    properties = Object.keys(definition).map(e => {
                        var extensionPropertyTemplate = _extensionPropertyTemplate;

                        extensionPropertyTemplate = bindTemplate(extensionPropertyTemplate, {
                            name: GetNodeProp(extension, NodeProperties.CodeName),
                            property: e,
                            type: definition[e]
                        });
                        return extensionPropertyTemplate;
                    }).join('')
                }
            }
            extensionClassTemplate = bindTemplate(extensionClassTemplate, {
                name: GetNodeProp(extension, NodeProperties.CodeName),
                properties
            });

            result[GetNodeProp(extension, NodeProperties.CodeName)] = extensionClassTemplate;
        })

        return result;
    }
}