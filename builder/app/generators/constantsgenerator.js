import * as GraphMethods from '../methods/graph_methods';
import { GetNodeProp, NodeProperties, NodeTypes, NodesByType, GetRootGraph } from '../actions/uiactions';
import { LinkType, NodePropertyTypesByLanguage, ProgrammingLanguages, NameSpace, Methods, STANDARD_CONTROLLER_USING } from '../constants/nodetypes';
import fs from 'fs';
import { bindTemplate } from '../constants/functiontypes';
import NamespaceGenerator from './namespacegenerator';

const CONSTANTS_CLASS = './app/templates/constants.tpl';

export default class ConstantsGenerator {
    static Tabs(c) {
        let res = '';
        for (var i = 0; i < c; i++) {
            res += TAB;
        }
        return res;
    }
    static Generate(options) {
        var { values = [], state } = options;
        let graphRoot = GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphMethods.GraphKeys.NAMESPACE] : null;

        let _constantsClass = fs.readFileSync(CONSTANTS_CLASS, 'utf-8');
        let result = {};
        values.map(value => {
            let { model, name } = value;
            let constantsClass = _constantsClass;
            let constructors = [];
            var consts = Object.keys(model).map(key => {
                let template = `public const string {{name}} = "{{value}}";`
                let temp = bindTemplate(template, {
                    name: key,
                    value: model[key]
                });
                return ConstantsGenerator.Tabs(2) + temp;
            }).join(jNL)

            constantsClass = bindTemplate(constantsClass, {
                constants: consts,
                constants_type: name
            });

            result[name] = {
                id: name,
                name: name,
                template: NamespaceGenerator.Generate({
                    template: constantsClass,
                    usings: [...STANDARD_CONTROLLER_USING],
                    namespace,
                    space: NameSpace.Constants
                })
            };
        })

        return result;
    }
} 
const NL = `
                    `
const jNL = `
`
const TAB = `   `;