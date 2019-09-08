import { UITypes, NEW_LINE } from "../constants/nodetypes";
import { GetNodeById } from "../actions/uiactions";
import { GenerateMarkupTag } from "./screenservice";

export function GetNodeComponents(layoutObj, item, currentRoot) {
    let imports = [];
    let { layout, properties } = layoutObj;
    if (!currentRoot) {
        currentRoot = layout;
    }

    Object.keys(currentRoot).map((item) => {
        imports = [...imports, ...GetNodeComponents(layoutObj, item, currentRoot[item])];
        if (properties[item]) {
            let children = properties[item].children || {};
            imports.push(children[item]);
        }
    });

    return imports;
}

export function buildLayoutTree(layoutObj, currentRoot, language, imports = []) {
    let result = [];
    let { layout, properties } = layoutObj;
    if (!currentRoot) {
        currentRoot = layout;
    }
    Object.keys(currentRoot).map((item, index) => {
        result.push(createSection(layoutObj, item, currentRoot[item], index + 1, language, imports));
    })
    return result;
}
export function createSection(layoutObj, item, currentRoot, index, language, imports) {
    let { properties } = layoutObj;
    let style = properties[item].style || {};
    let children = properties[item].children || {};
    let tree = Object.keys(currentRoot).length ? buildLayoutTree(layoutObj, currentRoot, language, imports) : [];
    console.log(children);
    console.log(item);
    if (children && children[item]) {
        imports.push(children[item]);
        tree = [addNewLine(GenerateMarkupTag(GetNodeById(children[item]), language), 2)];
        console.log(tree);
    }

    let _style = { ...style };
    ["borderStyle", "borderWidth", "borderColor"].map(t => {
        delete _style[t];
    });
    _style.backgroundColor = '#' + ('dd4b39-3a405a-553d36-684a52-857885-94e8b4-72bda3-5e8c61-4e6151-3b322c-cfdbd5-e8eddf-f5cb5c-242423-333533'.split('-')[Math.floor(Math.random() * 5)]);
    switch (language) {
        case UITypes.ReactNative:
            return (
                `
<View style={${JSON.stringify({ ..._style }, null, 4)}}>
${addNewLine(tree.join(NEW_LINE))}
</View>
            `);
    }

}

export function addNewLine(str, count) {
    let spaces = [].interpolate(0, count || 1, () => `    `).join('');
    return (str || '').split(NEW_LINE).join(NEW_LINE + spaces)
}