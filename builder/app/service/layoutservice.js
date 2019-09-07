import { UITypes, NEW_LINE } from "../constants/nodetypes";
import { GetNodeById } from "../actions/uiactions";
import { GenerateMarkupTag } from "./screenservice";

export function buildLayoutTree(layoutObj, currentRoot, language) {
    let result = [];
    let { layout, properties } = layoutObj;
    if (!currentRoot) {
        currentRoot = layout;
    }
    Object.keys(currentRoot).map((item, index) => {
        result.push(createSection(layoutObj, item, currentRoot[item], index + 1, language));
    })
    return result;
}
export function createSection(layoutObj, item, currentRoot, index, language) {
    let { properties } = layoutObj;
    let style = properties[item].style || {};
    let children = properties[item].children || {};
    let tree = Object.keys(currentRoot).length ? buildLayoutTree(layoutObj, currentRoot, language) : [];
    if (children && !tree.length && children[item]) {
      GenerateMarkupTag(  GetNodeById(children[item]))
    }
    switch (language) {
        case UITypes.ReactNative:
            return (`
            <View style={${JSON.stringify(style, null, 4)}}>
                ${tree.join(NEW_LINE)}
            </View>
            `);
    }

}