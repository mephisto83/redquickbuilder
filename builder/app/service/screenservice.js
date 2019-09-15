import { GetScreenNodes, GetCodeName, GetNodeTitle, GetConnectedScreenOptions, GetNodeProp, GetNodeById, NodesByType, GetState, GetJSCodeName, GetDataSourceNode } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { NodeProperties, UITypes, NEW_LINE, NodeTypes } from "../constants/nodetypes";
import { buildLayoutTree, addNewLine, GetNodeComponents, GetRNConsts, GetRNModelInstances, GetRNModelConst, GetRNModelConstValue } from "./layoutservice";
import { ComponentTypes, GetListItemNode, InstanceTypes } from "../constants/componenttypes";
import { getComponentProperty } from "../methods/graph_methods";

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
    let screenOption = GetScreenOption(id, language);
    if (screenOption) {
        let imports = GetScreenImports(id, language);
        let elements = [GenerateMarkupTag(screenOption, language)];
        let template = fs.readFileSync('./app/templates/screens/rn_screen.tpl', 'utf8');

        return bindTemplate(template, {
            name: GetCodeName(screen),
            title: `"${GetNodeTitle(screen)}"`,
            imports: imports.join(NEW_LINE),
            elements: elements.join(NEW_LINE),
            component_did_mount: GetComponentDidMount(screenOption)
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
export function GetItemRender(node, imports, language) {
    let listItemNode = GetListItemNode(node.id);
    imports.push(GenerateComponentImport(listItemNode, node, language))

    return `(item)=> <${GetCodeName(listItemNode)} data={item} />`;
}
export function GetItemRenderImport(node) {
    let listItemNode = GetListItemNode(node.id);

    return `(item)=> <${GetCodeName(listItemNode)} data={item} />`;
}

export function GetItemData(node) {
    let dataSourceNode = GetDataSourceNode(node.id);

    return `(()=> {
    return GetItems(Models.${GetCodeName(GetNodeProp(dataSourceNode, NodeProperties.UIModelType))});
})()`
}

export function GenerateRNScreenOptionSource(node, relativePath, language) {
    let layoutObj = GetNodeProp(node, NodeProperties.Layout);
    let componentType = GetNodeProp(node, NodeProperties.ComponentType);
    let { specialLayout, template } = ComponentTypes[language][componentType] ? ComponentTypes[language][componentType] : {};

    let imports = [];
    let extraimports = [];
    let layoutSrc;
    if (!specialLayout) { // if not a List or something like that 
        layoutSrc = layoutObj ? buildLayoutTree(layoutObj, null, language, imports, node).join(NEW_LINE) : GetDefaultElement();
    }
    else {
        extraimports.push(`import * as Models from '${relativePath.split('/').map(t => `../`).subset(2).join('')}model_keys.js';`)
        if (layoutObj) {
            buildLayoutTree(layoutObj, null, language, imports, node).join(NEW_LINE)
        };
        layoutSrc = bindTemplate(fs.readFileSync(template, 'utf8'), {
            item_render: GetItemRender(node, extraimports, language),
            data: GetItemData(node)
        });
    }
    let templateStr = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');

    let results = [];
    imports.map(t => {
        let relPath = relativePath ? `${relativePath}/${(GetCodeName(node) || '').toJavascriptName()}` : `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
        results.push(...GenerateRNComponents(GetNodeById(t), relPath, language))
    });
    imports = imports.unique().map(t => GenerateComponentImport(t, node, language));

    let _consts = GetRNConsts(node.id ? node.id : node) || [];
    let modelInstances = GetRNModelInstances(node.id ? node.id : node) || [];
    let screen_options = addNewLine([..._consts, ...modelInstances].unique().join(NEW_LINE), 4);


    templateStr = bindTemplate(templateStr, {
        name: GetCodeName(node),
        relative_depth: [].interpolate(0, relativePath ? relativePath.split('/').length - 2 : 1, () => '../').join(''),
        title: `"${GetNodeTitle(node)}"`,
        screen_options,
        imports: [...imports, ...extraimports].join(NEW_LINE),
        elements: addNewLine(layoutSrc, 4)
    });
    return [{
        template: templateStr,
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
            if (properties[key] && properties[key].nodeProperty) {
                bindProps[key] = GetNodeProp(node, properties[key].nodeProperty);
                if (properties[key].template) {
                    let temp = bindProps[key];
                    bindProps[key] = bindTemplate(properties[key].template, {
                        value: temp
                    })
                }
            }
            if (!bindProps[key])
                bindProps[key] = '';
        });

        return bindTemplate(template, bindProps);
    }
}
export function GenerateRNComponents(node, relative = './src/components', language = UITypes.ReactNative) {
    let result = [];
    let layoutObj = GetNodeProp(node, NodeProperties.Layout);
    let componentType = GetNodeProp(node, NodeProperties.ComponentType);
    if (!layoutObj && (
        !ComponentTypes[language] ||
        !ComponentTypes[language][componentType] ||
        !ComponentTypes[language][componentType].specialLayout)) {
        switch (GetNodeProp(node, NodeProperties.NODEType)) {
            case NodeTypes.ComponentNode:
                let template = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');
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
                            screen_options: '',
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

export function GenerateMarkupTag(node, language, parent, params) {
    let {
        children,
        cellModel,
        cellModelProperty,
        item
    } = (params || {});
    switch (language) {
        case UITypes.ReactNative:
            // let layout = GetNodeProp(parent, NodeProperties.Layout);
            let onChange = '';
            let dataBinding = '';
            let instanceType = '';
            let model = '';
            let property = '';
            let componentProperties;
            let modelName = '';
            let propertyName = '';
            if (parent && children && cellModel && cellModelProperty && cellModel[item] && cellModelProperty[item]) {
                componentProperties = GetNodeProp(parent, NodeProperties.ComponentProperties);
                instanceType = getComponentProperty(componentProperties, cellModel[item], 'instanceTypes');
                model = GetRNModelConstValue(cellModel[item]);
                modelName = `${cellModel[item]}`.toJavascriptName();
                propertyName = (GetCodeName(cellModelProperty[item]) || '').toJavascriptName();
                property = GetRNModelConstValue(propertyName);
            };
            switch (instanceType) {
                case InstanceTypes.PropInstance:
                    if (model && property) {
                        dataBinding = `data={this.props.${modelName} ? this.props.${modelName}.${propertyName} : null}`
                    }
                    else if (model) {
                        dataBinding = `data={this.props.${modelName}}`
                    }
                    break;
                default:
                    onChange = `onChange={value => {
    this.props.update${instanceType}(${instanceType}.${GetCodeName(parent)}, ${model}, ${property}, value);
}}`;
                    break;
            }
            return `<${GetCodeName(node)} ${dataBinding} ${onChange}/>`;
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

export function GetComponentDidMount(screenOption) {
    let events = GetNodeProp(screenOption, NodeProperties.ComponentDidMountEvent);
    if (events && events.length) {
        let evntHandles = events.map(evt => {
            let methodNode = GetNodeById(evt);
            return `this.props.${GetJSCodeName(methodNode)}();`;
        }).join(NEW_LINE);
        let componentDidMount = `componentDidMount() {
{{handles}}
}
`;
        return addNewLine(bindTemplate(componentDidMount, {
            handles: addNewLine(evntHandles, 1)
        }), 1)
    }
    return '';
}


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

    moreresults.push({
        template: bindTemplate(`{{source}}`, {
            source: NodesByType(GetState(), [NodeTypes.Screen, NodeTypes.ScreenOption, NodeTypes.ComponentNode]).map(t => `export const ${GetCodeName(t)} = '${GetCodeName(t)}';`).join(NEW_LINE)
        }),
        relative: './src/actions',
        relativeFilePath: `./screenInstances.js`,
        name: ``
    })

    return [...result, ...moreresults];
}