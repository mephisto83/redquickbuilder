import { InstanceTypeSelectorFunction } from "../constants/componenttypes";
import { NodesByType, GetState, GetNodeProp, GetJSCodeName, GetSelectorsNodes } from "../actions/uiactions";
import { NodeTypes, NEW_LINE, NodeProperties } from "../constants/nodetypes";
import { addNewLine } from "../utils/array";

export default class SelectorGenerator {

    static Generate(options) {
        let funcs = GenerateSelectorFunctions();
        let temps = [{
            template: `import * as UIA from './uiActions';
${funcs}`,
            relative: './src/actions',
            relativeFilePath: `./selector.js`,
            name: 'selector'
        }];

        let result = {};

        temps.map(t => {
            result[t.name] = t;
        });

        return result;
    }
}



export function GenerateSelectorFunctions() {
    let nodes = NodesByType(GetState(), NodeTypes.Selector);

    return nodes.map(node => {
        return GenerateSelectorFunction(node);
    });
}
export function GenerateSelectorFunction(node) {
    let _parts = GetSelectorsNodes(node.id);

    let parts = _parts.map(part => {
        switch (GetNodeProp(part, NodeProperties.NODEType)) {
            case NodeTypes.ViewModel:
                let instanceType = GetNodeProp(part, NodeProperties.InstanceType)
                let method = InstanceTypeSelectorFunction[instanceType];
                return `${GetJSCodeName(part)}: UIA.${method}('${GetJSCodeName(part)}')`
            case NodeTypes.Selector:
                return `${GetJSCodeName(part)}: ${GetJSCodeName(part)}()`;
            default:
                throw 'unhandled generate selector function type ' + GetNodeProp(part, NodeProperties.NODEType);
        }
    })
    let result = `
export function ${GetJSCodeName(node)}() {
    return {
${addNewLine(parts.join(',' + NEW_LINE), 2)}
    }
}
`;
    return result;
}