import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';

const VALIDATION_CLASS = './app/templates/validation/validation_class.tpl';
const VALIDATION_TEST = './app/templates/validation/tests/validation.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const VALIDATION_PROPERTY = './app/templates/validation/validation_property.tpl';

export default class ValidationRuleGenerator {
    static enumerateValidationTestVectors(validation_test_vectors) {
        var vects = validation_test_vectors.map(x => {
            return Object.keys(x.values.cases).length
        });

        var enumeration = ValidationRuleGenerator.enumerate(vects);
        return enumeration;
    }
    static enumerate(vects, j = 0) {
        var results = [];

        if (j < vects.length)
            for (var i = 0; i < vects[j]; i++) {
                var rest = ValidationRuleGenerator.enumerate(vects, j + 1);
                var temp = [i];
                if (rest.length) {
                    rest.map(r => {
                        results.push([...temp, ...r])
                    });
                }
                else {
                    results.push(temp);
                }
            }
        return results;
    }
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += `    `;
        }
        return res;
    }
    static GenerateValidationCases(graph, validatorNode) {

        var model = GetNodeProp(validatorNode, NodeProperties.ValidatorModel);
        var validator = GetNodeProp(validatorNode, NodeProperties.Validator);
        let validatorProperties = GraphMethods.getValidatorProperties(validator);
        var validation_test_vectors = [];
        Object.keys(validatorProperties).map(property => {
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
                                let temp = { '_ _': '"__ _ __"' };
                                attribute_type_arguments = Object.keys(validators.extension).map(ext => {
                                    if (validators.extension[ext]) {
                                        temp[`$${ext}`] = `${GetNodeProp(node, NodeProperties.CodeName)}.${MakeConstant(ext)}`;
                                        return temp[`$${ext}`];
                                    }
                                }).filter(x => x);
                                // attribute_type_arguments = temp.filter(x => x).join();
                                validation_test_vectors.push({
                                    property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                                    values: { cases: temp, invalid: { '_ _': true } }
                                });
                                attribute_type_arguments = `new List<string> () {
                ${attribute_type_arguments.join(', ')}
            }`;
                            }
                            break;
                        case NodeTypes.Enumeration:
                            if (validators && validators.enumeration) {
                                let enumNode = GraphMethods.GetNode(graph, validators.node);
                                let enumName = GetNodeProp(enumNode, NodeProperties.CodeName);
                                attribute_type_arguments = Object.keys(validators.enumeration).map(ext => {
                                    if (validators.enumeration[ext]) {
                                        return `${enumName}.${MakeConstant(ext)}`
                                    }
                                }).filter(x => x);
                                // attribute_type_arguments = temp.filter(x => x).join();
                                validation_test_vectors.push({
                                    property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                                    values: { cases: [...attribute_type_arguments], invalid: { '_ _': true } }
                                });
                                attribute_type_arguments = `new List<string> () {
                    ${attribute_type_arguments.join(', ')}
                }`;
                            }
                            break;
                    }
                }
                if (ValidationCases[validators.type]) {
                    validation_test_vectors.push({
                        property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                        values: ValidationCases[validators.type]
                    });
                }
            });
        });
        var vectors = ValidationRuleGenerator.enumerateValidationTestVectors(validation_test_vectors);

        let testProps = vectors.map((vector, index) => {
            let successCase = true;
            let propertyInformation = [];
            let properylines = vector.map((v, vindex) => {
                var projected_value = Object.values(validation_test_vectors[vindex].values.cases)[v];
                var _case = Object.keys(validation_test_vectors[vindex].values.cases)[v];
                if (typeof (projected_value) === 'function') {
                    projected_value = projected_value();
                }
                else {
                    if (validation_test_vectors[vindex] && validation_test_vectors[vindex].values && validation_test_vectors[vindex].values.invalid && !validation_test_vectors[vindex].values.invalid[_case]) {
                        _case = '$$';
                    }
                }
                successCase = successCase && (_case || [false])[0] === '$';
                let propline = ValidationRuleGenerator.Tabs(3) + `{{model}}.${validation_test_vectors[vindex].property} = ${projected_value};`;
                propertyInformation.push({
                    set_properties: propline,
                    property: validation_test_vectors[vindex].property,
                    type: GetNodeProp(GraphMethods.GetNode(graph, model), NodeProperties.CodeName),
                })
                return propline;
            }).join(NEW_LINE);
            let temp = {
                resultSuccess: successCase,
                propertyInformation,
                set_properties: properylines,
                type: GetNodeProp(GraphMethods.GetNode(graph, model), NodeProperties.CodeName),
            };

            return temp;
        });
        return testProps;
    }
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let nodes = NodesByType(state, NodeTypes.Validator);
        let _validation_class = fs.readFileSync(VALIDATION_CLASS, 'utf-8');
        let _validation_property = fs.readFileSync(VALIDATION_PROPERTY, 'utf-8');
        let _validation_test = fs.readFileSync(VALIDATION_TEST, 'utf-8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf-8');
        nodes.map(node => {
            var agent = GetNodeProp(node, NodeProperties.ValidatorAgent);
            var model = GetNodeProp(node, NodeProperties.ValidatorModel);
            var modelNode = GraphMethods.GetNode(graph, model);
            var funct = GetNodeProp(node, NodeProperties.ValidatorFunction);
            var functNode = GraphMethods.GetNode(graph, funct);
            var validator = GetNodeProp(node, NodeProperties.Validator);
            let validatorProperties = GraphMethods.getValidatorProperties(validator);
            var validation_test_vectors = [];
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
                                    let temp = { '_ _': '"__ _ __"' };
                                    attribute_type_arguments = Object.keys(validators.extension).map(ext => {
                                        if (validators.extension[ext]) {
                                            temp[`$${ext}`] = `${GetNodeProp(node, NodeProperties.CodeName)}.${MakeConstant(ext)}`;
                                            return temp[`$${ext}`];
                                        }
                                    }).filter(x => x);
                                    // attribute_type_arguments = temp.filter(x => x).join();
                                    validation_test_vectors.push({
                                        property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                                        values: { cases: temp, invalid: { '_ _': true } }
                                    });
                                    attribute_type_arguments = `new List<string> () {
                ${attribute_type_arguments.join(', ')}
            }`;
                                }
                                break;
                            case NodeTypes.Enumeration:
                                if (validators && validators.enumeration) {
                                    let enumNode = GraphMethods.GetNode(graph, validators.node);
                                    let enumName = GetNodeProp(enumNode, NodeProperties.CodeName);
                                    attribute_type_arguments = Object.keys(validators.enumeration).map(ext => {
                                        if (validators.enumeration[ext]) {
                                            return `${enumName}.${MakeConstant(ext)}`
                                        }
                                    }).filter(x => x);
                                    // attribute_type_arguments = temp.filter(x => x).join();
                                    validation_test_vectors.push({
                                        property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                                        values: { cases: [...attribute_type_arguments], invalid: { '_ _': true } }
                                    });
                                    attribute_type_arguments = `new List<string> () {
                    ${attribute_type_arguments.join(', ')}
                }`;
                                }
                                break;
                        }
                    }
                    if (ValidationCases[validators.type]) {
                        validation_test_vectors.push({
                            property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                            values: ValidationCases[validators.type]
                        });
                    }
                    var templateRes = bindTemplate(_validation_property, {
                        attribute_type: validators.code[ProgrammingLanguages.CSHARP],
                        attribute_type_arguments,
                        model_property: `.${GetNodeProp(propertyNode, NodeProperties.CodeName)}`
                    });
                    return templateRes + NEW_LINE
                }).join('');
            }).join('');
            var vectors = ValidationRuleGenerator.enumerateValidationTestVectors(validation_test_vectors);

            let testProps = vectors.map((vector, index) => {
                let validation_test = _validation_test;
                let successCase = true;
                let properylines = vector.map((v, vindex) => {
                    var projected_value = Object.values(validation_test_vectors[vindex].values.cases)[v];
                    var _case = Object.keys(validation_test_vectors[vindex].values.cases)[v];
                    if (typeof (projected_value) === 'function') {
                        projected_value = projected_value();
                    }
                    else {
                        if (validation_test_vectors[vindex] && validation_test_vectors[vindex].values && validation_test_vectors[vindex].values.invalid && !validation_test_vectors[vindex].values.invalid[_case]) {
                            _case = '$$';
                        }
                    }
                    successCase = successCase && (_case || [false])[0] === '$';
                    return ValidationRuleGenerator.Tabs(3) + `model.${validation_test_vectors[vindex].property} = ${projected_value};`;
                }).join(NEW_LINE);
                let temp = bindTemplate(_validation_test, {
                    model: GetNodeProp(modelNode, NodeProperties.CodeName),
                    test_name: `Test${index}`,
                    attribute_parameters: "",
                    expected_value: successCase ? 'true' : 'false',
                    set_properties: properylines,
                    attribute_type: `${GetNodeProp(node, NodeProperties.CodeName)}Attribute`,
                    properties: propertyValidationStatements,
                    type: GetNodeProp(GraphMethods.GetNode(graph, model), NodeProperties.CodeName),
                });

                return temp;
            });

            var templateRes = bindTemplate(_validation_class, {
                model: GetNodeProp(node, NodeProperties.CodeName),
                function_name: GetNodeProp(functNode, NodeProperties.CodeName),
                properties: propertyValidationStatements,
                type: GetNodeProp(GraphMethods.GetNode(graph, model), NodeProperties.CodeName),
            });
            var testTemplate = bindTemplate(_testClass, {
                name: GetNodeProp(node, NodeProperties.CodeName),
                tests: testProps.join(NEW_LINE)
            })

            templateRes = bindTemplate(_validation_class, {
                model: GetNodeProp(node, NodeProperties.CodeName),
                function_name: GetNodeProp(functNode, NodeProperties.CodeName),
                properties: propertyValidationStatements,
                type: GetNodeProp(GraphMethods.GetNode(graph, model), NodeProperties.CodeName),
            });



            result[GetNodeProp(node, NodeProperties.CodeName)] = {
                id: GetNodeProp(node, NodeProperties.CodeName),
                name: `${GetNodeProp(node, NodeProperties.CodeName)}Attribute`,
                tname: `${GetNodeProp(node, NodeProperties.CodeName)}AttributeTests`,
                template: NamespaceGenerator.Generate({
                    template: templateRes,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Extensions}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Validations
                }),
                test: NamespaceGenerator.Generate({
                    template: testTemplate,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        ...STANDARD_TEST_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Validations}`,
                        `${namespace}${NameSpace.Extensions}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Tests
                }),
            };
        });


        return result;
    }
}