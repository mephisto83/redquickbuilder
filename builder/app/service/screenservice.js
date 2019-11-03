import { GetScreenNodes, GetCodeName, GetNodeTitle, GetConnectedScreenOptions, GetNodeProp, GetNodeById, NodesByType, GetState, GetJSCodeName, GetDataSourceNode, GetMethodParameters, GetComponentNodeProperties, GetLinkChainItem } from "../actions/uiactions";
import fs from 'fs';
import { bindTemplate } from "../constants/functiontypes";
import { NodeProperties, UITypes, NEW_LINE, NodeTypes, LinkType } from "../constants/nodetypes";
import { buildLayoutTree, GetNodeComponents, GetRNConsts, GetRNModelInstances, GetRNModelConst, GetRNModelConstValue } from "./layoutservice";
import { ComponentTypes, GetListItemNode, InstanceTypes, NAVIGATION, APP_METHOD, HandlerTypes, InstanceTypeSelectorFunction } from "../constants/componenttypes";
import { getComponentProperty, getClientMethod, TARGET, SOURCE } from "../methods/graph_methods";
import { HandlerType } from "../components/titles";
import { addNewLine } from "../utils/array";

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
export function getRelativePathPrefix(relativePath) {
    return relativePath ? relativePath.split('/').map(t => `../`).subset(2).join('') : relativePath;
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
        extraimports.push(`import * as Models from '${getRelativePathPrefix(relativePath)}model_keys.js';`)
        if (layoutObj) {
            buildLayoutTree(layoutObj, null, language, imports, node).join(NEW_LINE)
        };
        layoutSrc = bindTemplate(fs.readFileSync(template, 'utf8'), {
            item_render: GetItemRender(node, extraimports, language),
            data: GetItemData(node)
        });
    }

    if (ComponentTypes) {
        if (ComponentTypes[language]) {
            if (ComponentTypes[language][componentType]) {
                if (ComponentTypes[language][componentType].properties && ComponentTypes[language][componentType].properties) {
                    let { onPress } = ComponentTypes[language][componentType].properties;
                    if (onPress) {
                        layoutSrc = wrapOnPress(layoutSrc, onPress, node);
                    }
                }
            }
        }
    }

    let templateStr = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');

    let results = [];
    imports.filter(x => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent)).map(t => {
        let relPath = relativePath ? `${relativePath}/${(GetCodeName(node) || '').toJavascriptName()}` : `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
        results.push(...GenerateRNComponents(GetNodeById(t), relPath, language))
    });
    imports = imports.unique().map(t => GenerateComponentImport(t, node, language));

    let _consts = GetRNConsts(node.id ? node.id : node) || [];
    let modelInstances = GetRNModelInstances(node.id ? node.id : node) || [];
    let screen_options = addNewLine([..._consts, ...modelInstances].unique().join(NEW_LINE), 4);


    templateStr = bindTemplate(templateStr, {
        name: GetCodeName(node),
        title: `"${GetNodeTitle(node)}"`,
        screen_options,
        imports: [...imports, ...extraimports].unique().join(NEW_LINE),
        elements: addNewLine(layoutSrc, 4)
    });
    templateStr = bindTemplate(templateStr, {
        relative_depth: [].interpolate(0, relativePath ? relativePath.split('/').length - 2 : 1, () => '../').join('')
    })
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
                if (properties[key].parameterConfig) {
                    let parameterConfig = GetNodeProp(node, properties[key].nodeProperty);
                    if (parameterConfig && parameterConfig[key]) {
                        bindProps[key] = writeApiProperties({ [key]: parameterConfig[key] });
                    }
                }
                else if (properties[key].template) {
                    if (typeof (properties[key].template) === 'function') {
                        bindProps[key] = properties[key].template(node);
                    }
                    else {
                        let temp = bindProps[key];
                        bindProps[key] = bindTemplate(properties[key].template, {
                            value: temp
                        })
                    }
                }

            }
            if (!bindProps[key])
                bindProps[key] = '';
        });

        return bindTemplate(template, bindProps);
    }
}
export function wrapOnPress(elements, onPress, node, options) {

    let onpress = GetNodeProp(node, 'onPress');
    switch (onpress) {
        case APP_METHOD:
            let key = 'onPress';
            let methodParams = GetNodeProp(node, NodeProperties.ClientMethodParameters) || {};
            let clientMethod = GetNodeProp(node, NodeProperties.ClientMethod);
            let bodytext = 'let body = null;';
            let parameterstext = `let parameters = null;`
            if (clientMethod) {
                let jsClientMethodName = GetJSCodeName(clientMethod);
                let methodParameters = GetMethodParameters(clientMethod);
                if (methodParameters) {

                    let { parameters, body } = methodParameters;
                    if (body) {
                        let componentNodeProperties = GetComponentNodeProperties();
                        let instanceType = getClientMethod(methodParams, key, 'body', 'instanceType');
                        let componentModel = getClientMethod(methodParams, key, 'body', 'componentModel')
                        let c_props = componentNodeProperties.find(x => x.id === getClientMethod(methodParams, key, 'body', 'component'));
                        let c_props_options = c_props && c_props.componentPropertiesList ? c_props.componentPropertiesList : []
                        if (c_props_options.length) {
                            let c_prop_option = c_props_options.find(v => v.value === componentModel);
                            if (c_prop_option) {
                                let componentModelName = c_prop_option.value;
                                bodytext = `let body = Get${instanceType}Object('${componentModelName}');`
                            }
                        }
                    }
                    let pressfunc = `this.props.${jsClientMethodName}({ body, parameters })`;
                    if (options && options.onPress && options.onPress.nowrap) {
                        elements = bindTemplate(elements, {
                            onPressEvent: `onPress={() => {
${parameterstext}
${bodytext}
${pressfunc} }}`
                        })
                    }
                    else {
                        elements = bindTemplate(elements, { onPressEvent: '' });
                        elements = `
                        <TouchableOpacity onPress={() => {
    ${parameterstext}
    ${bodytext}
    ${pressfunc} }}>
                ${elements}
                        </TouchableOpacity>`;

                    }

                }
            }
            break;
        case NAVIGATION:
            let navigation = GetNodeProp(node, NodeProperties.Navigation);
            let targetScreen = GetNodeById(navigation);
            let screenParameters = GetNodeProp(targetScreen, NodeProperties.ScreenParameters);
            let params = [];
            if (screenParameters) {
                let navigationProperties = GetNodeProp(node, NodeProperties.NavigationParameters);
                let parameterProperty = GetNodeProp(node, NodeProperties.NavigationParametersProperty) || {};
                let componentProperties = GetNodeProp(node, NodeProperties.ComponentProperties);
                screenParameters.map(sparam => {
                    let { title, id } = sparam;
                    let propName = navigationProperties[id];
                    if (propName) {
                        let propPropName = parameterProperty[propName];
                        if (propPropName) {
                            let listitem = '';
                            if (GetNodeProp(node, NodeProperties.ComponentType) === ComponentTypes.ReactNative.ListItem.key) {
                                listitem = '.item';
                            }
                            let propertyNode = GetNodeById(propPropName);
                            if (propertyNode) {
                                params.push(`${title}: this.props.${propName}${listitem}.${GetJSCodeName(propertyNode)}`);
                            }
                            else {
                                params.push(`${title}: this.props.${propName}${listitem}`);
                            }
                        }
                    }
                });
            }
            if (navigation && params) {
                let navfunc = `navigate('${GetCodeName(navigation)}', {${(params).join(', ')}})`;
                if (options && options.onPress && options.onPress.nowrap) {
                    elements = bindTemplate(elements, {
                        onPressEvent: `onPress={() => { ${navfunc} }}`
                    })
                }
                else {
                    elements = bindTemplate(elements, { onPressEvent: '' });
                    elements = `
    <TouchableOpacity onPress={() => { ${navfunc} }}>
${elements}
    </TouchableOpacity>`;
                }
            }
            break;
    }

    return elements;
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
                    if (ComponentTypes[language][componentType].properties && ComponentTypes[language][componentType].properties) {
                        let { onPress, nowrap } = ComponentTypes[language][componentType].properties;
                        if (onPress) {
                            elements = wrapOnPress(elements, onPress, node, ComponentTypes[language][componentType].properties);
                        }
                    }
                }
                template = bindTemplate(template, {
                    name: GetCodeName(node),
                    imports: '',
                    screen_options: '',
                    elements: elements || GetDefaultElement(),

                });
                template = bindTemplate(template, {
                    relative_depth: [].interpolate(0, relative ? relative.split('/').length - 2 : 1, () => '../').join('')
                });
                result.push(
                    {
                        relative: relative ? relative : './src/components',
                        relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}.js`,
                        name: GetCodeName(node),
                        template
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

    let components = GetNodeComponents(layoutObj).filter(x => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent));
    components.map(component => {
        let relPath = relative ? `${relative}/${(GetCodeName(node) || '').toJavascriptName()}` : `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
        let temp = GenerateRNComponents(component, relPath, language);
        result.push(...temp);
    })
    return result;
}
function ConvertViewTypeToComponentNode(node) {
    let wasstring = false;
    if (typeof node === 'string') {
        node = GetNodeById(node);
        wasstring = true;
    }
    switch (GetNodeProp(node, NodeProperties.NODEType)) {
        case NodeTypes.ViewType:
            node = GetLinkChainItem({
                id: node.id,
                links: [{
                    type: LinkType.SharedComponent,
                    direction: SOURCE
                }]
            }) || node;
            break;
    }
    if (wasstring) {
        return node.id;
    }
    return node;
}
export function GenerateMarkupTag(node, language, parent, params) {
    let {
        children,
        cellModel,
        cellModelProperty,
        item
    } = (params || {});
    let listItem = '';
    node = ConvertViewTypeToComponentNode(node);
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
            let parentLayoutProperties = null;
            let propertyName = '';
            let parentComponentApiConfig = null;
            if (parent) {
                componentProperties = GetNodeProp(parent, NodeProperties.ComponentProperties);
                parentLayoutProperties = GetNodeProp(parent, NodeProperties.Layout);
                var { componentApi } = getComponentProperty(parentLayoutProperties, item) || {};
                parentComponentApiConfig = componentApi;

                if (parent && children && cellModel && cellModelProperty && cellModel[item] && cellModelProperty[item]) {
                    instanceType = getComponentProperty(componentProperties, cellModel[item], 'instanceTypes');
                    model = GetRNModelConstValue(cellModel[item]);
                    modelName = `${cellModel[item]}`.toJavascriptName();
                    propertyName = (GetCodeName(cellModelProperty[item]) || '').toJavascriptName();
                    property = GetRNModelConstValue(propertyName);

                };
                if (parent && language === 'ReactNative' && GetNodeProp(parent, NodeProperties.ComponentType) === ComponentTypes[language].ListItem.key) {
                    listItem = '.item';
                }
            }
            switch (instanceType) {
                case InstanceTypes.PropInstance:
                    if (model && property) {
                        dataBinding = `this.props.${modelName} && this.props.${modelName}${listItem} ? this.props.${modelName}${listItem}.${propertyName} : null`
                    }
                    else if (model) {
                        dataBinding = `this.props.${modelName}${listItem}`
                    }
                    break;
                case InstanceTypes.ScreenParam:
                    dataBinding = `GetScreenParam('${modelName}')`;
                    break;
                case InstanceTypes.ApiProperty:
                    debugger;
                    break
                default:
                    if (model && property && GetCodeName(parent))
                        //                         onChange = `onChange={value => {
                        //     this.props.update${instanceType}(${model}, ${property}, value);
                        // }}`;
                        break;
            }
            let apiProperties = '';
            if (parentComponentApiConfig) {
                apiProperties = writeApiProperties(parentComponentApiConfig);
            }
            if (dataBinding) {
                dataBinding = `data={${dataBinding}}`;
            }
            return `<${GetCodeName(node)} ${dataBinding} ${apiProperties} ${onChange}/>`;
    }
}
export function writeApiProperties(apiConfig) {
    var result = '';
    var res = [];

    if (apiConfig) {
        for (var i in apiConfig) {
            let property = null;
            let { instanceType, model, selector, modelProperty, apiProperty, handlerType, isHandler, dataChain } = apiConfig[i];
            let modelJsName = GetJSCodeName(model) || model;
            switch (instanceType) {
                case InstanceTypes.ScreenInstance:
                    switch (handlerType) {
                        case HandlerTypes.Blur:
                            property = `() => this.props.updateScreenInstanceBlur(const_${modelJsName}, const_${GetJSCodeName(modelProperty)})`;
                            break;
                        case HandlerTypes.Focus:
                            property = `() => this.props.updateScreenInstanceFocus(const_${modelJsName}, const_${GetJSCodeName(modelProperty)})`;
                            break;
                        case HandlerTypes.ChangeText:
                            property = `(v) => this.props.updateScreenInstance(const_${modelJsName}, const_${GetJSCodeName(modelProperty)}, v)`;
                            break;
                        case HandlerTypes.Change:
                            property = `(v) => this.props.updateScreenInstance(const_${modelJsName}, const_${GetJSCodeName(modelProperty)}, v.nativeEvent.text)`;
                            break;
                        case HandlerTypes.Property:
                        default:
                            if (modelProperty) {
                                property = `GetScreenInstance(const_${modelJsName}, const_${GetJSCodeName(modelProperty)})`;
                            }
                            else {
                                property = `GetScreenInstanceObject(const_${modelJsName})`;
                            }
                            break;
                    }
                    break;
                case InstanceTypes.ApiProperty:
                    property = `this.props.${apiProperty}${isHandler ? ' || (() => {})' : ''}`;
                    break;
                case InstanceTypes.Selector:
                    property = `S.${GetJSCodeName(selector)}()`;
                    break;
                case InstanceTypes.Boolean:
                    property = `true`;
                    break;
                default:
                    break;
                //throw 'write api properties unhandled case ' + instanceType;
            }
            if (property) {
                if (dataChain) {
                    let codeName = GetCodeName(dataChain);
                    property = `DC.${codeName}(${property})`;
                }
                //There is an opportunity to wrapp the result in a getter.
                res.push(`${NEW_LINE}${i}={${property}}`);
            }
        }
    }

    result = res.join(' ');

    return result;
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
    let componentDidMount = `componentDidMount() {
        this.props.setGetState();
{{handles}}
}
`;
    let evntHandles = [];
    if (events && events.length) {
        evntHandles = events.map(evt => {
            let methodNode = GetNodeById(evt);
            return `this.props.${GetJSCodeName(methodNode)}();`;
        }).join(NEW_LINE);

    }
    else {
        evntHandles = '';
    }

    return addNewLine(bindTemplate(componentDidMount, {
        handles: addNewLine(evntHandles, 1)
    }), 1)
}


export function GenerateImport(node, parentNode, language) {

    node = ConvertViewTypeToComponentNode(node);

    switch (language) {
        case UITypes.ReactNative:
            if (node) {
                if (GetNodeProp(node, NodeProperties.SharedComponent)) {
                    return `import ${GetCodeName(node)} from '../shared/${(GetCodeName(node) || '').toJavascriptName()}'`;
                }
                return `import ${GetCodeName(node)} from '../components/${(GetCodeName(node) || '').toJavascriptName()}'`;
            }
    }
}

export function GenerateComponentImport(node, parentNode, language) {
    node = ConvertViewTypeToComponentNode(node);

    switch (language) {
        case UITypes.ReactNative:
            if (node) {
                if (GetNodeProp(node, NodeProperties.SharedComponent)) {
                    return `import ${GetCodeName(node)} from '{{relative_depth}}shared/${(GetCodeName(node) || '').toJavascriptName()}'`;
                }
                return `import ${GetCodeName(node)} from './${(GetCodeName(parentNode) || '').toJavascriptName()}/${(GetCodeName(node) || '').toJavascriptName()}'`;
            }
    }
}

export function GetScreens() {
    var screens = GetScreenNodes();
    return screens;
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
    let all_nodes = NodesByType(GetState(), [NodeTypes.ComponentNode]);
    let sharedComponents = all_nodes.filter(x => GetNodeProp(x, NodeProperties.SharedComponent));
    let relPath = './src/shared'
    sharedComponents.map(sharedComponent => {
        moreresults.push(...GenerateRNComponents(sharedComponent, relPath, language))
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