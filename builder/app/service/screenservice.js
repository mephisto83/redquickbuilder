import { GetScreenNodes, GetCodeName, GetNodeTitle, GetConnectedScreenOptions, GetNodeProp, GetNodeById } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { NodeProperties, UITypes, NEW_LINE } from "../constants/nodetypes";
import { buildLayoutTree } from "./layoutservice";

export function GenerateScreens(options) {
    let temps = BindScreensToTemplate();
    let result = {};

    temps.map(t => {
        result[t.name] = t;
    });

    return result;
}

export function GenerateScreenMarkup(id, language) {
    let screen = GetNodeById(id);
    let screenOptions = GetScreenOption(id, language);
    if (screenOptions) {
        let imports = GetScreenImports(id, language);
        let elements = [GenerateMarkupTag(screenOptions, language)];
        let template = fs.readFileSync('./app/templates/screens/rn_screen.tpl', 'utf8');

        return bindTemplate(template, {
            name: GetCodeName(screen),
            title: `"${GetNodeTitle(screen)}"`,
            imports: imports.join(NEW_LINE),
            elements: elements.join(NEW_LINE)
        })
    }
}

export function GenerateScreenOptionSource(node, parent, language) {
    switch (language) {
        case UITypes.ReactNative:
            return GenerateRNScreenOptionSource(node, parent, language);
    }
}
export function GenerateRNScreenOptionSource(node, parent, language) {
    let layoutObj = GetNodeProp(node, NodeProperties.Layout);
    let layoutSrc = buildLayoutTree(layoutObj, null, language).join(NEW_LINE);
    let template = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');
    let imports = [];
    return  bindTemplate(template, {
        name: GetCodeName(node),
        title: `"${GetNodeTitle(node)}"`,
        imports: imports.join(NEW_LINE),
        elements: layoutSrc
    })
}
export function GenerateMarkupTag(node, language) {

    switch (language) {
        case UITypes.ReactNative:
            return `<${GetCodeName(node)} />`;
    }
}
export function GetScreenOption(id, type) {
    let screen = GetNodeById(id);
    let screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
    if (screenOptions && screenOptions.length) {
        let reactScreenOption = screenOptions.find(x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative);
        if (reactScreenOption) {
            return reactScreenOption;
        }
    }
    return null;
}

export function GetScreenImports(id, language) {
    let screen = GetNodeById(id);
    let screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
    if (screenOptions && screenOptions.length) {
        let reactScreenOption = screenOptions.find(x => GetNodeProp(x, NodeProperties.UIType) === language);
        if (reactScreenOption) {
            return [GenerateImport(reactScreenOption, screen, language)];
        }
    }
    return null;
}


export function GenerateImport(node, parentNode, language) {
    switch (language) {
        case UITypes.ReactNative:
            if (node) {
                return `import ${GetCodeName(node)} from '../components/${(GetCodeName(parentNode) || '').toJavascriptName()}/${(GetCodeName(node) || '').toJavascriptName()}'`;
            }
    }
}

export function GetScreens() {
    var screens = GetScreenNodes();
    return screens
}

export function BindScreensToTemplate(language = UITypes.ReactNative) {
    var screens = GetScreens();
    let template = fs.readFileSync('./app/templates/screens/screen.tpl', 'utf8');

    return screens.map(screen => {
        let screenOptions = GetConnectedScreenOptions(screen.id);
        if (screenOptions && screenOptions.length) {
            let reactScreenOption = screenOptions.find(x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative);
            if (reactScreenOption) {
                template = GenerateScreenMarkup(screen.id, language)
            }
        }
        return {
            template: bindTemplate(template, {
                name: GetCodeName(screen),
                title: `"${GetNodeTitle(screen)}"`
            }),
            relative: './src/screens',
            relativeFilePath: `./${GetCodeName(screen).toJavascriptName()}.js`,
            name: GetCodeName(screen)
        }
    })
}