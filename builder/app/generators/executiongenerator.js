import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodesByType, NodeTypes, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NEW_LINE, ConstantsDeclaration, MakeConstant, NameSpace, STANDARD_CONTROLLER_USING, ValidationCases, STANDARD_TEST_USING, Methods, ExecutorRules } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import { NodeType } from '../components/titles';
import NamespaceGenerator from './namespacegenerator';
import { enumerate } from '../utils/utils';

const EXECUTOR_CLASS = './app/templates/executor/executor_class.tpl';
const EXECUTOR_INTERFACE = './app/templates/executor/executor_class_interface.tpl';
const EXECUTOR_CREATE = './app/templates/executor/create.tpl';
const EXECUTOR_ENTRY_METHODS = './app/templates/executor/executor_entry_methods.tpl';
const EXECUTOR_ENTRY_METHODS_INTERFACE = './app/templates/executor/executor_entry_methods_interface.tpl';
const EXECUTOR_METHOD_CASE = './app/templates/executor/entry_method_case.tpl';
const EXECUTOR_UPDATE = './app/templates/executor/update.tpl';
const EXECUTOR_GET = './app/templates/executor/get.tpl';
const TEST_CLASS = './app/templates/tests/tests.tpl';
const EXECUTOR_METHODS = './app/templates/executor/executor_methods.tpl';
const EXECUTOR_METHODS_INTERFACE = './app/templates/executor/executor_methods_interface.tpl';

export default class ExecutorGenerator {
    static enumerateValidationTestVectors(validation_test_vectors) {
        var vects = validation_test_vectors.map(x => Object.keys(x.values.cases).length);

        var enumeration = ExecutorGenerator.EnumerateCases(vects);
        return enumeration;
    }
    static EnumerateCases(vects, j = 0) {
        return enumerate(vects, j);
    }
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += `    `;
        }
        return res;
    }
    static Generate(options) {
        var { state, key } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;
        let graph = GetRootGraph(state);
        let result = {};

        let nodes = NodesByType(state, NodeTypes.Executor);
        let _executor_class = fs.readFileSync(EXECUTOR_CLASS, 'utf8');
        let _executor_class_interface = fs.readFileSync(EXECUTOR_INTERFACE, 'utf8');
        let _executor_methods = fs.readFileSync(EXECUTOR_METHODS, 'utf8');
        let _executor_methods_interface = fs.readFileSync(EXECUTOR_METHODS_INTERFACE, 'utf8');
        let _executor_create = fs.readFileSync(EXECUTOR_CREATE, 'utf8');
        let _executor_update = fs.readFileSync(EXECUTOR_UPDATE, 'utf8');
        let _executor_get = fs.readFileSync(EXECUTOR_GET, 'utf8');
        let _exe_method = fs.readFileSync(EXECUTOR_ENTRY_METHODS, 'utf8');
        let _exe_method_interface = fs.readFileSync(EXECUTOR_ENTRY_METHODS_INTERFACE, 'utf8');
        let _exe_case = fs.readFileSync(EXECUTOR_METHOD_CASE, 'utf8');
        let _testClass = fs.readFileSync(TEST_CLASS, 'utf8');
        let agentFunctionDic = {};
        let agentFunctionInterfaceDic = {};
        let executor_entry_methods = [];
        let agentModelDic = {};
        let agmCombos = [];
        let allmodels = NodesByType(state, NodeTypes.Model);
        let allagents = allmodels.filter(x => GetNodeProp(x, NodeProperties.IsAgent));
        let allfunctions = NodesByType(state, [NodeTypes.Function, NodeTypes.Method]);
        allmodels.map(model => {
            allagents.map(agent => {
                Object.keys(Methods).map(meth => {
                    let found = false;
                    allfunctions.filter(x => GetNodeProp(x, NodeProperties.MethodType) === meth).map(fun => {
                        found = true;
                        agmCombos.push({
                            agent: GetNodeProp(agent, NodeProperties.CodeName),
                            model: GetNodeProp(model, NodeProperties.CodeName),
                            function: GetNodeProp(fun, NodeProperties.CodeName),
                            method: GetNodeProp(fun, NodeProperties.MethodType)
                        });
                    });
                    if (!found) {

                        agmCombos.push({
                            agent: GetNodeProp(agent, NodeProperties.CodeName),
                            model: GetNodeProp(model, NodeProperties.CodeName),
                            method: meth
                        });
                    }
                });
            })
        })

        nodes.map(node => {
            var agent = GetNodeProp(node, NodeProperties.ExecutorAgent);
            var model = GetNodeProp(node, NodeProperties.ExecutorModel);
            var modelNode = GraphMethods.GetNode(graph, model);
            var agentNode = GraphMethods.GetNode(graph, agent);
            var funct = GetNodeProp(node, NodeProperties.ExecutorFunction);
            var functNode = GraphMethods.GetNode(graph, funct);
            var functType = GetNodeProp(node, NodeProperties.ExecutorFunctionType);
            var functionNode = GraphMethods.GetNode(graph, funct);
            var executor = GetNodeProp(node, NodeProperties.Executor);
            let executorProperties = GraphMethods.getValidatorProperties(executor);
            var validation_test_vectors = [];
            let amdid = GetNodeProp(agentNode, NodeProperties.CodeName) + GetNodeProp(modelNode, NodeProperties.CodeName) + GetNodeProp(functionNode, NodeProperties.MethodType);
            agentModelDic[amdid] = agentModelDic[amdid] || [];

            agentModelDic[amdid].push({
                agent: GetNodeProp(agentNode, NodeProperties.CodeName),
                model: GetNodeProp(modelNode, NodeProperties.CodeName),
                functType,
                funct: GetNodeProp(functNode, NodeProperties.CodeName)
            })

            let propertyValidationStatements = Object.keys(executorProperties || {}).map(property => {
                let propertyNode = GraphMethods.GetNode(graph, property);
                let validatorPs = executorProperties[property];

                let properties = Object.keys(validatorPs.validators).map(vld => {
                    let validators = validatorPs.validators[vld];
                    let node = GraphMethods.GetNode(graph, validators.node);
                    let attribute_type_arguments = '';
                    if (node) {
                        switch (GetNodeProp(node, NodeProperties.NODEType)) {
                            case NodeTypes.ExtensionType:
                                if (validators && validators.extension) {
                                    let temp = { '_ _': '"_____"' };
                                    attribute_type_arguments = Object.keys(validators.extension).map(ext => {
                                        if (validators.extension[ext]) {
                                            temp[`${ext}`] = `${GetNodeProp(node, NodeProperties.CodeName)}.${MakeConstant(ext)}`;
                                            return temp[`${ext}`];
                                        }
                                    }).filter(x => x);
                                    attribute_type_arguments = temp.filter(x => x).unique(x => x).join();
                                    validation_test_vectors.push({
                                        property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                                        values: { cases: temp }
                                    });
                                    attribute_type_arguments = `new List<string> () {
                ${attribute_type_arguments}
            }`;
                                }
                                break;
                            case NodeTypes.Enumeration:
                                break;
                        }
                    }
                    if (ValidationCases[validators.type]) {
                        validation_test_vectors.push({
                            property: GetNodeProp(propertyNode, NodeProperties.CodeName),
                            values: ValidationCases[validators.type]
                        });
                    }
                    let template = `result{{model_property}} = data{{model_property}};`;
                    switch (validators.type) {
                        case ExecutorRules.AgentReference:
                            template = `result{{model_property}} = agent.Id;`
                            break;
                        case ExecutorRules.ParentReference:
                            template = `result{{model_property}} = data{{model_property}};`
                            break;
                        case ExecutorRules.Copy:
                            break;
                        default:
                            throw 'not handle [execution generator]';
                    }
                    var templateRes = bindTemplate(template, {
                        attribute_type: validators.code[ProgrammingLanguages.CSHARP],
                        attribute_type_arguments,
                        model_property: `.${GetNodeProp(propertyNode, NodeProperties.CodeName)}`
                    });
                    return ExecutorGenerator.Tabs(4) + templateRes + NEW_LINE
                }).unique(x => x).join('');


                return properties;
            }).unique(x => x).join('');
            let template = '{{not-defined template}}';
            switch (functType) {
                case Methods.Create:
                    template = _executor_create;
                    break;
                case Methods.Update:
                    template = _executor_update;
                    break;
                case Methods.Get:
                case Methods.GetAll:
                    template = _executor_get;
                    break;
            }
            var templateRes = bindTemplate(template, {
                property_sets: propertyValidationStatements,
                model: `${GetNodeProp(modelNode, NodeProperties.CodeName)}`
            });

            // var vectors = ExecutorGenerator.enumerateValidationTestVectors(validation_test_vectors);


            var templateRes = bindTemplate(_executor_methods, {
                model: GetNodeProp(modelNode, NodeProperties.CodeName),
                method_name: GetNodeProp(functionNode, NodeProperties.CodeName),
                parameters: bindTemplate(`{{data}} data, {{agent}} agent, {{change}} change`, {
                    data: GetNodeProp(modelNode, NodeProperties.CodeName),
                    agent: GetNodeProp(agentNode, NodeProperties.CodeName),
                    change: `${GetNodeProp(modelNode, NodeProperties.CodeName)}Change`
                }),
                data: GetNodeProp(modelNode, NodeProperties.CodeName),
                agent: GetNodeProp(agentNode, NodeProperties.CodeName),
                change: `${GetNodeProp(modelNode, NodeProperties.CodeName)}Change`,
                method_guts: templateRes,
            });
            var templateResInterface = bindTemplate(_executor_methods_interface, {
                model: GetNodeProp(modelNode, NodeProperties.CodeName),
                method_name: GetNodeProp(functionNode, NodeProperties.CodeName),
                parameters: bindTemplate(`{{data}} data, {{agent}} agent, {{change}} change`, {
                    data: GetNodeProp(modelNode, NodeProperties.CodeName),
                    agent: GetNodeProp(agentNode, NodeProperties.CodeName),
                    change: `${GetNodeProp(modelNode, NodeProperties.CodeName)}Change`
                }),
                data: GetNodeProp(modelNode, NodeProperties.CodeName),
                agent: GetNodeProp(agentNode, NodeProperties.CodeName),
                change: `${GetNodeProp(modelNode, NodeProperties.CodeName)}Change`,
                method_guts: templateRes,
            });

            // var testTemplate = bindTemplate(_testClass, {
            //     name: GetNodeProp(node, NodeProperties.CodeName),
            //     tests: testProps.join(NEW_LINE)
            // });
            agentFunctionInterfaceDic[agent] = agentFunctionInterfaceDic[agent] || [];
            agentFunctionDic[agent] = agentFunctionDic[agent] || [];
            agentFunctionDic[agent].push(templateRes)
            agentFunctionInterfaceDic[agent].push(templateResInterface)

        });
        let lastCase;
        let static_methods = agmCombos.map(amd => {
            var {
                agent,
                model,
                method,
            } = amd;
            let cases = (agentModelDic[agent + model + amd.method] || []).map(_cases => {
                var {
                    agent,
                    model,
                    functType,
                    funct
                } = _cases;
                let _case = bindTemplate(_exe_case, {
                    agent,
                    model,
                    func_name: funct
                });
                return _case + NEW_LINE;
            }).unique(x => x).join('');
            return bindTemplate(_exe_method, {
                agent,
                model,
                cases,
                change: `${model}`,
                method
            }) + NEW_LINE
        });
        let static_methods_interface = agmCombos.map(amd => {
            var {
                agent,
                model,
                method,
            } = amd;
            return bindTemplate(_exe_method_interface, {
                agent,
                model,
                change: `${model}`,
                method
            }) + NEW_LINE
        });
        Object.keys(agentFunctionDic).map(agent => {

            var node = GraphMethods.GetNode(graph, agent);
            let templateRes = bindTemplate(_executor_class, {
                model: GetNodeProp(node, NodeProperties.CodeName),
                methods: agentFunctionDic[agent].join(''),
                staticentry: static_methods.unique(x => x).join('')
            });

            let templateInterfaceRes = bindTemplate(_executor_class_interface, {
                model: GetNodeProp(node, NodeProperties.CodeName),
                methods: agentFunctionInterfaceDic[agent].unique(x => x).join(''),
                staticentry: static_methods_interface.unique(x => x).join('')

            })



            result[GetNodeProp(node, NodeProperties.CodeName)] = {
                id: GetNodeProp(node, NodeProperties.CodeName),
                name: `${GetNodeProp(node, NodeProperties.CodeName)}Executor`,
                tname: `${GetNodeProp(node, NodeProperties.CodeName)}ExecutorTests`,
                iname: `I${GetNodeProp(node, NodeProperties.CodeName)}Executor`,
                template: NamespaceGenerator.Generate({
                    template: templateRes,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Parameters}`,
                        `${namespace}${NameSpace.Interface}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Executors
                }),
                interface: NamespaceGenerator.Generate({
                    template: templateInterfaceRes,
                    usings: [
                        ...STANDARD_CONTROLLER_USING,
                        `${namespace}${NameSpace.Model}`,
                        `${namespace}${NameSpace.Parameters}`,
                        `${namespace}${NameSpace.Constants}`],
                    namespace,
                    space: NameSpace.Interface
                }),
                // test: NamespaceGenerator.Generate({
                //     template: testTemplate,
                //     usings: [
                //         ...STANDARD_CONTROLLER_USING,
                //         ...STANDARD_TEST_USING,
                //         `${namespace}${NameSpace.Executors}`,
                //         `${namespace}${NameSpace.Model}`,
                //         `${namespace}${NameSpace.Constants}`],
                //     namespace,
                //     space: NameSpace.Tests
                // }),
            };
        })

        return result;
    }
}