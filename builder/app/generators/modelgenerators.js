import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, Usings } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
const MODEL_TEMPLATE = './app/templates/models/model.tpl';
const NAME_SPACE_TEMPLATE = './app/templates/namespace.tpl';
const MODEL_PROPERTY_TEMPLATE = './app/templates/models/model_property.tpl';
const MODEL_ATTRIBUTE_TEMPLATE = './app/templates/models/model_attributes.tpl';
export default class ModelGenerator {
    static GenerateModel(options) {
        var { graph, nodeId } = options;
        var usings = [];
        var templateSwapDictionary = {};
        var node = GraphMethods.GetNode(graph, nodeId);
        templateSwapDictionary.model = GetNodeProp(node, NodeProperties.CodeName);
        var connectedProperties = GraphMethods.getNodesByLinkType(graph, {
            id: node.id,
            type: LinkType.PropertyLink,
            direction: GraphMethods.SOURCE
        });
        let propertyTemplate = fs.readFileSync(MODEL_PROPERTY_TEMPLATE, 'utf-8');
        let properties = connectedProperties.map(propNode => {
            var connectedAttributes = GraphMethods.getNodesByLinkType(graph, {
                id: propNode.id,
                type: LinkType.AttributeLink,
                direction: GraphMethods.SOURCE
            });
            let property_instance_template = propertyTemplate;
            let np = GetNodeProp(propNode, NodeProperties.UIAttributeType);
            if (Usings[ProgrammingLanguages.CSHARP][np]) {
                usings.push(...Usings[ProgrammingLanguages.CSHARP][np])
            }
            let propType = NodePropertyTypesByLanguage[ProgrammingLanguages.CSHARP][np];
            let propSwapDictionary = {
                property_type: propType,
                property: GetNodeProp(propNode, NodeProperties.CodeName),
                attributes: connectedAttributes.map(attr => {
                }).filter(x => x).join('\r\n')
            }

            property_instance_template = bindTemplate(property_instance_template, propSwapDictionary)
            return property_instance_template.padding(20);
        });
        templateSwapDictionary.properties = properties.join('');
        console.log(templateSwapDictionary.properties)
        let modelTemplate = fs.readFileSync(MODEL_TEMPLATE, 'utf-8');
        modelTemplate = bindTemplate(modelTemplate, templateSwapDictionary);

        return {
            template: modelTemplate,
            usings
        };
    }
    static tabs(c) {
        let res = '';
        var TAB = "\t";
        for (var i = 0; i < c; i++) {
            res = res + TAB;
        }
        return res;
    }
}