import { GetScreenNodes, GetCodeName, GetNodeTitle, GetConnectedScreenOptions, GetNodeProp, GetNodeById } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { NodeProperties, UITypes, NEW_LINE, NodeTypes } from "../constants/nodetypes";
import { buildLayoutTree, addNewLine, GetNodeComponents } from "./layoutservice";
import { ComponentTypes } from "../constants/componenttypes";

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
            return GenerateRNScreenOptionSource(node, null, language);
    }
}

export function GetDefaultElement(language) {
    return '<View><Text>DE</Text></View>';
}
export function GenerateRNScreenOptionSource(node, relativePath, language) {
    let layoutObj = GetNodeProp(node, NodeProperties.Layout);

    let imports = [];
    let layoutSrc = layoutObj ? buildLayoutTree(layoutObj, null, language, imports).join(NEW_LINE) : GetDefaultElement();
    let template = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');

    let results = [];
    imports.map(t => {
        let relPath = relativePath ? `${relativePath}/${(GetCodeName(node) || '').toJavascriptName()}` : `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
        results.push(...GenerateRNComponents(GetNodeById(t), relPath, language))
    });
    imports = imports.unique().map(t => GenerateComponentImport(t, node, language));
    template = bindTemplate(template, {
        name: GetCodeName(node),
        relative_depth: [].interpolate(0, relativePath ? relativePath.split('/').length - 2 : 1, () => '../').join(''),
        title: `"${GetNodeTitle(node)}"`,
        imports: imports.join(NEW_LINE),
        elements: addNewLine(layoutSrc, 4)
    });
    return [{
        template: template,
        relative: relativePath ? relativePath : './src/components',
        relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}.js`,
        name: GetCodeName(node)
    }, ...results];
}
export function bindComponent(node, componentBindingDefinition) {
    if (componentBindingDefinition && componentBindingDefinition.template) {
        let template = fs.readFileSync(componentBindingDefinition.template, 'utf8');
        let { properties } = componentBindingDefinition;
        let bindProps = {};
        Object.keys(properties).map(key => {
            bindProps[key] = '';
        });

        return bindTemplate(template, bindProps);
    }
}
export function GenerateRNComponents(node, relative = './src/components', language = UITypes.ReactNative) {
    let result = [];
    let layoutObj = GetNodeProp(node, NodeProperties.Layout);
    if (!layoutObj) {
        switch (GetNodeProp(node, NodeProperties.NODEType)) {
            case NodeTypes.ComponentNode:
                let template = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');
                let componentType = GetNodeProp(node, NodeProperties.ComponentType);
                let elements = null;
                if (ComponentTypes[language] && ComponentTypes[language][componentType]) {
                    elements = bindComponent(node, ComponentTypes[language][componentType]);
                }
                result.push(
                    {
                        relative: relative ? relative : './src/components',
                        relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}.js`,
                        name: GetCodeName(node),
                        template: bindTemplate(template, {
                            name: GetCodeName(node),
                            imports: '',
                            relative_depth: [].interpolate(0, relative ? relative.split('/').length - 2 : 1, () => '../').join(''),
                            elements: elements || GetDefaultElement(),

                        })
                    });
                break;
        }
        return result;
    }
    else {
        let src = GenerateRNScreenOptionSource(node, relative || './src/components', language);
        if (src)
            result.push(...src);
    }
    let components = GetNodeComponents(layoutObj);
    components.map(component => {
        let relPath = relative ? `${relative}/${(GetCodeName(node) || '').toJavascriptName()}` : `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
        let temp = GenerateRNComponents(component, relPath, language);
        result.push(...temp);
    })
    return result;
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

0
export function GenerateImport(node, parentNode, language) {
    switch (language) {
        case UITypes.ReactNative:
            if (node) {
                return `import ${GetCodeName(node)} from '../components/${(GetCodeName(node) || '').toJavascriptName()}'`;
            }
    }
}

export function GenerateComponentImport(node, parentNode, language) {
    switch (language) {
        case UITypes.ReactNative:
            if (node) {
                return `import ${GetCodeName(node)} from './${(GetCodeName(parentNode) || '').toJavascriptName()}/${(GetCodeName(node) || '').toJavascriptName()}'`;
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
    let moreresults = [];
    let result = screens.map(screen => {
        let screenOptions = GetConnectedScreenOptions(screen.id);
        if (screenOptions && screenOptions.length) {
            let reactScreenOption = screenOptions.find(x => GetNodeProp(x, NodeProperties.UIType) === UITypes.ReactNative);
            if (reactScreenOption) {
                template = GenerateScreenMarkup(screen.id, language);
                let screenOptionSrc = GenerateScreenOptionSource(reactScreenOption, screen, language);
                if (screenOptionSrc) {
                    moreresults.push(...screenOptionSrc.filter(x => x));
                }
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
    });
    return [...result, ...moreresults];
}