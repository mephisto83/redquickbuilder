import * as GraphMethods from '../methods/graph_methods';
import {
    GetCurrentGraph,
    NodesByType,
    GetState,
    NodeTypes,
    GetJSCodeName,
    GetNodeProp,
    GetCodeName
} from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import { NEW_LINE, NodeProperties, UITypes } from '../constants/nodetypes';
export default class CustomComponentGenerator {
    static GenerateCustomComponentList() {
        let components = NodesByType(GetState(), NodeTypes.CustomComponent);
        return components.map((component: Node) => {
            return GetCodeName(component);
        });
    }
    static Generate(options: any) {
        var { state, key, language } = options;
        let components = NodesByType(GetState(), NodeTypes.CustomComponent);

        let result: any = {};
        let index_template = ``;
        let export_template: string[] = [];
        components.map((component: Node) => {
            let filename = `${GetJSCodeName(component)}.tsx`;
            let implementations = GetNodeProp(component, NodeProperties.Implementation) || {};
            if (implementations) {
                let template = implementations[language] ||
                    implementations[UITypes.ReactWeb] ||
                    implementations[UITypes.ReactNative] ||
                    implementations[UITypes.ElectronIO] ||
                    implementations[UITypes.VR] ||
                    implementations[UITypes.AR];
                if (template) {
                    index_template += `import ${GetCodeName(component)} from './${GetJSCodeName(component)}';
`;

                    export_template.push(GetCodeName(component));
                    result[filename] = {
                        relative: './app/custom-components',
                        relativeFilePath: filename,
                        template
                    };
                }
            }
        });
        index_template += `
export {
    ${export_template.join(`,${NEW_LINE}`)}
};
        `;

        result['custom-export-index'] = {
            relative: './app/custom-components',
            relativeFilePath: 'index.tsx',
            template: index_template
        };

        return result;
    }
}