import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';

const VALIDATION_CLASS = './app/templates/validation/validation_class.tpl';
const VALIDATION_PROPERTY = './app/templates/validation/validation_property.tpl';

export default class ValidationRuleGenerator {
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let nodes = NodesByType(state, NodeTypes.Validator);
        let _validation_class = fs.readFileSync(VALIDATION_CLASS, 'utf-8');
        let _validation_property = fs.readFileSync(VALIDATION_PROPERTY, 'utf-8');

        nodes.map(node => {
            var agent = GetNodeProp(node, NodeProperties.ValidatorAgent);
            var model = GetNodeProp(node, NodeProperties.ValidatorModel);
            var funct = GetNodeProp(node, NodeProperties.ValidatorFunction);
            var validator = GetNodeProp(node, NodeProperties.Validator);
            let validatorProperties = GraphMethods.getValidatorProperties(validator);
            let propertyValidationStatements = Object.keys(validatorProperties).map(property => {
                let propertyNode = GraphMethods.GetNode(graph, property);
                let validatorPs = validatorProperties[property];
                return Object.keys(validatorPs.validators).map(vld => {
                    let validators = validatorPs.validators[vld];
                    let node = GraphMethods.GetNode(graph, validators.node);
                    let attribute_type_arguments = '';
                    if (node) {
                        switch (GetNodeProp(node, NodeProperties.NODEType)) {
                            case NodeTypes.ExtensionType:
                                if (validators && validators.extension) {
                                    attribute_type_arguments = Object.keys(validators.extension).map(ext => {
                                        if (validators.extension[ext]) {
                                            return `${GetNodeProp(node, NodeProperties.CodeName)}.${MakeConstant(ext)}`;
                                        }
                                    }).filter(x => x).join();
                                    attribute_type_arguments = `new List<string> () {
                ${attribute_type_arguments}
            }`
                                }
                                break;
                            case NodeTypes.Enumeration:
                                break;
                        }
                    }

                    var templateRes = bindTemplate(_validation_property, {
                        attribute_type: validators.code[ProgrammingLanguages.CSHARP],
                        attribute_type_arguments,
                        model_property: `.${GetNodeProp(propertyNode, NodeProperties.CodeName)}`
                    });
                    return templateRes + NEW_LINE
                }).join('');
            }).join('');

            var templateRes = bindTemplate(_validation_class, {
                model: GetNodeProp(node, NodeProperties.CodeName),
                properties: propertyValidationStatements,
                type: GetNodeProp(GraphMethods.GetNode(graph, model), NodeProperties.CodeName),
            });



            result[GetNodeProp(node, NodeProperties.CodeName)] = {
                id: GetNodeProp(node, NodeProperties.CodeName),
                name: `${GetNodeProp(node, NodeProperties.CodeName)}Attribute`,
                template: NamespaceGenerator.Generate({
                    template: templateRes,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Constants}`,
                        `${namespace}${NameSpace.Interface}`],
                    namespace,
                    space: NameSpace.Validations
                })
            };
        });


        return result;
    }
}