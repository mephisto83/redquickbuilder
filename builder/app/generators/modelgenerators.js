import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, GetRootGraph, NodesByType } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, Usings, ValidationRules, NameSpace, NodeTypes } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';
const MODEL_TEMPLATE = './app/templates/models/model.tpl';
const MODEL_PROPERTY_TEMPLATE = './app/templates/models/model_property.tpl';
const MODEL_ATTRIBUTE_TEMPLATE = './app/templates/models/model_attributes.tpl';
export default class ModelGenerator {
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let models = NodesByType(state, NodeTypes.Model);
        let result = {};
        models.map(model => {
            var res = ModelGenerator.GenerateModel({
                graph: graphRoot,
                nodeId: model.id,
                state
            });
            result[res.id] = res;
        });

        return result;
    }
    static GenerateModel(options) {
        var { state, graph, nodeId } = options;
        var key = nodeId;
        var usings = [];
        var templateSwapDictionary = {};
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;


        var node = GraphMethods.GetNode(graph, nodeId);
        if (!node) {
            return null;
        }
        templateSwapDictionary.model = GetNodeProp(node, NodeProperties.CodeName);
        var connectedProperties = GraphMethods.getNodesByLinkType(graph, {
            id: node.id,
            type: LinkType.PropertyLink,
            direction: GraphMethods.SOURCE
        });
        let propertyTemplate = fs.readFileSync(MODEL_PROPERTY_TEMPLATE, 'utf-8');
        let attributeTemplate = fs.readFileSync(MODEL_ATTRIBUTE_TEMPLATE, 'utf-8');
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
                    var options_lists = GraphMethods.getNodesByLinkType(graph, {
                        id: attr.id,
                        type: LinkType.Option,
                        direction: GraphMethods.SOURCE
                    });
                    let options_list = [];
                    options_lists.map(ol => {
                        var ols = GraphMethods.getNodesByLinkType(graph, {
                            id: ol.id,
                            type: LinkType.OptionItem,
                            direction: GraphMethods.SOURCE
                        });
                        ols.map(_ols => {
                            if (GetNodeProp(_ols, NodeProperties.UseCustomUIOption)) {
                                options_list.push(GetNodeProp(_ols, NodeProperties.UIOptionTypeCustom));
                            }
                            else {
                                options_list.push(GetNodeProp(_ols, NodeProperties.UIOptionType));
                            }
                        })
                    });
                    options_list = options_list.unique().map(t => `UIAttribute.${t}`);

                    var ReverseRules = {};
                    Object.keys(ValidationRules).map(_key => {
                        ReverseRules[ValidationRules[_key]] = _key;
                    })
                    var validations = [];
                    if (GetNodeProp(attr, NodeProperties.UseUIValidations)) {
                        GraphMethods.getNodesByLinkType(graph, {
                            id: attr.id,
                            type: LinkType.Validation,
                            direction: GraphMethods.SOURCE
                        }).map(vnode => {
                            GraphMethods.getNodesByLinkType(graph, {
                                id: vnode.id,
                                type: LinkType.ValidationItem,
                                direction: GraphMethods.SOURCE
                            }).map(vnodeItem => {
                                validations.push(`ValidationRules.${ReverseRules[GetNodeProp(vnodeItem, NodeProperties.UIValidationType)]}`)
                            })
                        });
                    }
                    let choice_name = null;
                    if (GetNodeProp(attr, NodeProperties.UIExtensionList)) {
                        GraphMethods.getNodesByLinkType(graph, {
                            id: attr.id,
                            type: LinkType.Extension,
                            direction: GraphMethods.SOURCE
                        }).map(vnode => {
                            choice_name = GetNodeProp(vnode, NodeProperties.CodeName)
                        });
                    }

                    let options = options_list && options_list.length ? bindTemplate(`Options = new string[] { {{options_list}} },`, {
                        options_list: options_list.map(t => `${t}`).join(', ')
                    }) : '';

                    let validation_rules = validations && validations.length ? bindTemplate(`ValidationRules = new string[] { {{validation_list}} }),`, {
                        validation_list: validations.map(t => `${t}`).join(', ')
                    }) : '';

                    let choice_type_list = [];
                    let choice_type = choice_name ? bindTemplate('ChoiceType = {{choice_type}}.Name,', {
                        choice_type: choice_name
                    }) : '';

                    let attributeSwapDictionary = {
                        property: GetNodeProp(propNode, NodeProperties.CodeName),
                        property_type: GetNodeProp(propNode, NodeProperties.UseModelAsType) ? GetNodeProp(propNode, NodeProperties.UIModelType) : GetNodeProp(propNode, NodeProperties.UIAttributeType),
                        ui_title: GetNodeProp(propNode, NodeProperties.UIName),
                        singular: GetNodeProp(propNode, NodeProperties.UISingular) ? 'true' : 'false',
                        options,
                        choice_type,
                        validation_rules
                    }
                    if (attr && attr.uiValidationType) {
                    }
                    return bindTemplate(attributeTemplate, attributeSwapDictionary);
                }).filter(x => x).join('\r\n')
            }

            property_instance_template = bindTemplate(property_instance_template, propSwapDictionary);

            return property_instance_template;
        });
        templateSwapDictionary.properties = properties.join('');
        console.log(templateSwapDictionary.properties)
        let modelTemplate = fs.readFileSync(MODEL_TEMPLATE, 'utf-8');
        modelTemplate = bindTemplate(modelTemplate, templateSwapDictionary);

        var result = {
            id: GetNodeProp(node, NodeProperties.CodeName),
            name: GetNodeProp(node, NodeProperties.CodeName),
            template: NamespaceGenerator.Generate({
                template: modelTemplate,
                usings,
                namespace,
                space: NameSpace.Model
            })
        };
        return result;
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