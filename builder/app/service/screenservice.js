import {
  GetScreenNodes,
  GetCodeName,
  GetNodeTitle,
  GetConnectedScreenOptions,
  GetNodeProp,
  GetNodeById,
  NodesByType,
  GetState,
  GetJSCodeName,
  GetDataSourceNode,
  GetMethodParameters,
  GetComponentNodeProperties,
  GetLinkChainItem,
  ViewTypes,
  GetCurrentGraph,
  GetNodeByProperties,
  GetNodes,
  GetLinkProperty
} from "../actions/uiactions";
import fs from "fs";
import path from "path";
import { bindTemplate } from "../constants/functiontypes";
import {
  NodeProperties,
  UITypes,
  NEW_LINE,
  NodeTypes,
  LinkType,
  ProgrammingLanguages,
  NodePropertiesDirtyChain,
  LinkPropertyKeys
} from "../constants/nodetypes";
import {
  buildLayoutTree,
  GetNodeComponents,
  GetRNConsts,
  GetRNModelInstances,
  GetRNModelConst,
  GetRNModelConstValue
} from "./layoutservice";
import {
  ComponentTypes,
  GetListItemNode,
  InstanceTypes,
  NAVIGATION,
  APP_METHOD,
  HandlerTypes,
  ComponentLifeCycleEvents,
  ComponentEvents,
  ComponentEventStandardHandler
} from "../constants/componenttypes";
import {
  getComponentProperty,
  getClientMethod,
  TARGET,
  SOURCE,
  GetConnectedNodeByType,
  GetNodesLinkedTo,
  GetConnectedNodesByType,
  GetLinkByNodes,
  getNodesByLinkType,
  getNodesLinkedTo,
  getNodesLinkedFrom,
  GetLinkBetween
} from "../methods/graph_methods";
import { HandlerType } from "../components/titles";
import { addNewLine } from "../utils/array";

export function GenerateScreens(options) {
  let { language } = options;
  let temps = BindScreensToTemplate(language || UITypes.ReactNative);
  let result = {};

  temps.map(t => {
    result[path.join(t.relative, t.name)] = t;
  });

  return result;
}

export function GenerateScreenMarkup(id, language) {
  let screen = GetNodeById(id);
  let screenOption = GetScreenOption(id, language);
  if (screenOption) {
    let imports = GetScreenImports(id, language);
    let elements = [GenerateMarkupTag(screenOption, language, screen)];
    let template = null;
    switch (language) {
      case UITypes.ElectronIO:
        template = fs.readFileSync(
          "./app/templates/screens/el_screen.tpl",
          "utf8"
        );
        break;
      case UITypes.ReactNative:
      default:
        template = fs.readFileSync(
          "./app/templates/screens/rn_screen.tpl",
          "utf8"
        );
        break;
    }
    return bindTemplate(template, {
      name: GetCodeName(screen),
      title: `"${GetNodeTitle(screen)}"`,
      imports: imports.join(NEW_LINE),
      elements: elements.join(NEW_LINE),
      component_did_update: GetComponentDidUpdate(screenOption, {
        isScreen: true
      }),
      component_did_mount: GetComponentDidMount(screenOption)
    });
  }
}

export function GenerateScreenOptionSource(node, parent, language) {
  switch (language) {
    case UITypes.ReactNative:
    case UITypes.ElectronIO:
      return GenerateRNScreenOptionSource(node, null, language);
  }
}

export function GetDefaultElement(language) {
  return "<View><Text>DE</Text></View>";
}
export function GetItemRender(node, imports, language) {
  let listItemNode = GetListItemNode(node.id);
  imports.push(GenerateComponentImport(listItemNode, node, language));
  let properties = WriteDescribedApiProperties(listItemNode, {
    listItem: true
  });
  return `({item, index, separators, key})=>{
    let value = item;
    return  <${GetCodeName(
      listItemNode
    )} ${properties} key={item && item.id !== undefined && item.id !== null  ? item.id : item}/>
  }`;
}
export function GetItemRenderImport(node) {
  let listItemNode = GetListItemNode(node.id);
  let properties = WriteDescribedApiProperties(listItemNode, {
    listItem: true
  });

  return `({item, index, separators, key})=> <${GetCodeName(
    listItemNode
  )} ${properties} />`;
}

function getCssClassName(css, id) {
  var res = id;
  if (css[id] && css[id].parent) {
    res = `${getCssClassName(css, css[id].parent)} .${res}`;
  } else {
    res = `.${res}`;
  }
  return res;
}
export function constructCssFile(css, clsName) {
  let rules = Object.keys(css)
    .map(v => {
      let style = css[v].style;

      let props = Object.keys(style)
        .map(key => {
          let temp = key.replace(/([a-z])([A-Z])/g, "$1-$2");
          let value = style[key];
          if (!isNaN(value)) {
            // value = `${value}px`;
          }
          return `${temp.toLowerCase()}: ${value};`;
        })
        .join(NEW_LINE);
      return `${getCssClassName(css, v)} {
      ${props}
    }`;
    })
    .join(NEW_LINE);

  return rules;
}

export function GetItemData(node) {
  let dataSourceNode = GetDataSourceNode(node.id);
  let connectedNode = GetNodeProp(dataSourceNode, NodeProperties.DataChain);
  let instanceType = GetNodeProp(dataSourceNode, NodeProperties.InstanceType);
  let defaultValue = GetDefaultComponentValue(node);
  if (connectedNode) {
    // data = `D.${GetJSCodeName(connectedNode)}(${data})`;
    return `(()=> {
    return DC.${GetCodeName(connectedNode)}(${defaultValue});
})()`;
  }
  return `(()=> {
    return ${defaultValue};
})()`;
}
export function getRelativePathPrefix(relativePath) {
  return relativePath
    ? relativePath
        .split("/")
        .map(t => `../`)
        .subset(2)
        .join("")
    : relativePath;
}
export function GenerateRNScreenOptionSource(node, relativePath, language) {
  let layoutObj = GetNodeProp(node, NodeProperties.Layout);
  let componentType = GetNodeProp(node, NodeProperties.ComponentType);
  let { specialLayout, template } = ComponentTypes[language][componentType]
    ? ComponentTypes[language][componentType]
    : {};

  let imports = [];
  let extraimports = [];
  let css = {};
  let layoutSrc;
  if (!specialLayout) {
    // if not a List or something like that
    layoutSrc = layoutObj
      ? buildLayoutTree({
          layoutObj,
          currentRoot: null,
          language,
          imports,
          node,
          css
        }).join(NEW_LINE)
      : GetDefaultElement();
  } else {
    extraimports.push(
      `import * as Models from '${getRelativePathPrefix(
        relativePath
      )}model_keys.js';`
    );
    if (layoutObj) {
      buildLayoutTree({
        layoutObj,
        currentRoot: null,
        language,
        imports,
        node,
        css
      }).join(NEW_LINE);
    }
    let data = GetItemData(node);
    let item_render = GetItemRender(node, extraimports, language);
    let apiProperties = WriteDescribedApiProperties(node);
    layoutSrc = bindTemplate(fs.readFileSync(template, "utf8"), {
      item_render: item_render,
      data: data,
      apiProperties
    });
  }

  if (ComponentTypes) {
    if (ComponentTypes[language]) {
      if (ComponentTypes[language][componentType]) {
        if (
          ComponentTypes[language][componentType].properties &&
          ComponentTypes[language][componentType].properties
        ) {
          let { onPress } = ComponentTypes[language][componentType].properties;
          if (onPress) {
            layoutSrc = wrapOnPress(layoutSrc, onPress, node);
          }
        }
      }
    }
  }

  let cssFile = null;
  let cssImport = null;
  let templateStr = null;
  switch (language) {
    case UITypes.ElectronIO:
      templateStr = fs.readFileSync(
        "./app/templates/screens/el_screenoption.tpl",
        "utf8"
      );
      cssFile = constructCssFile(
        css,
        `.${(GetCodeName(node) || "").toJavascriptName()}`
      );
      cssImport = `import styles from './${(
        GetCodeName(node) || ""
      ).toJavascriptName()}.css'`;
      break;
    case UITypes.ReactNative:
    default:
      templateStr = fs.readFileSync(
        "./app/templates/screens/rn_screenoption.tpl",
        "utf8"
      );
      break;
  }
  let results = [];
  imports
    .filter(x => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent))
    .map(t => {
      let relPath = relativePath
        ? `${relativePath}/${(GetCodeName(node) || "").toJavascriptName()}`
        : `./src/components/${(GetCodeName(node) || "").toJavascriptName()}`;
      results.push(...GenerateRNComponents(GetNodeById(t), relPath, language));
    });
  imports = imports
    .unique()
    .map(t => GenerateComponentImport(t, node, language));

  let _consts = GetRNConsts(node.id ? node.id : node) || [];
  let modelInstances = GetRNModelInstances(node.id ? node.id : node) || [];
  let screen_options = addNewLine(
    [..._consts, ...modelInstances].unique().join(NEW_LINE),
    4
  );

  templateStr = bindTemplate(templateStr, {
    name: GetCodeName(node),
    title: `"${GetNodeTitle(node)}"`,
    screen_options,
    component_did_update: GetComponentDidUpdate(node),
    imports: [...imports, cssImport, ...extraimports].unique().join(NEW_LINE),
    elements: addNewLine(layoutSrc, 4)
  });
  templateStr = bindTemplate(templateStr, {
    relative_depth: []
      .interpolate(
        0,
        relativePath ? relativePath.split("/").length - 2 : 1,
        () => "../"
      )
      .join("")
  });
  return [
    {
      template: templateStr,
      relative: relativePath || "./src/components",
      relativeFilePath: `./${(GetCodeName(node) || "").toJavascriptName()}.js`,
      name:
        (relativePath || "./src/components/") +
        `${(GetCodeName(node) || "").toJavascriptName()}.js`
    },
    cssFile
      ? {
          template: cssFile,
          relative: relativePath || "./src/components",
          relativeFilePath: `./${(
            GetCodeName(node) || ""
          ).toJavascriptName()}.css`,
          name:
            (relativePath || "./src/components/") +
            `${(GetCodeName(node) || "").toJavascriptName()}.css`
        }
      : null,
    ...results
  ].filter(x => x);
}
export function bindComponent(node, componentBindingDefinition) {
  if (componentBindingDefinition && componentBindingDefinition.template) {
    let template = fs.readFileSync(componentBindingDefinition.template, "utf8");
    let { properties } = componentBindingDefinition;
    let bindProps = {};
    Object.keys(properties).map(key => {
      if (properties[key] && properties[key].nodeProperty) {
        bindProps[key] = GetNodeProp(node, properties[key].nodeProperty);
        if (properties[key].parameterConfig) {
          let parameterConfig = GetNodeProp(node, properties[key].nodeProperty);
          if (parameterConfig && parameterConfig[key]) {
            bindProps[key] = writeApiProperties({
              [key]: parameterConfig[key]
            });
          }
        } else if (properties[key].template) {
          bindProps[key] = GetDefaultComponentValue(node, key);
        }
      }
      if (!bindProps[key]) bindProps[key] = "";
    });
    var cevents =
      componentBindingDefinition.eventApi || Object.keys(ComponentEvents);
    let eventHandlers = cevents
      .map(t => getMethodInstancesForEvntType(node, ComponentEvents[t]))
      .map((methodInstances, i) => {
        let invocations = methodInstances
          .map(methodInstanceCall => {
            if (!methodInstanceCall) debugger;
            return getMethodInvocation(methodInstanceCall);
          })
          .join(NEW_LINE);
        return `${ComponentEvents[cevents[i]]}={(value)=> {
${invocations}
    }}`;
      });

    if (eventHandlers && eventHandlers.length) {
      bindProps["events"] = eventHandlers.join(NEW_LINE);
    }
    return bindTemplate(template, bindProps);
  }
}
export function wrapOnPress(elements, onPress, node, options) {
  let onpress = GetNodeProp(node, "onPress");
  switch (onpress) {
    case APP_METHOD:
      let key = "onPress";
      let methodParams =
        GetNodeProp(node, NodeProperties.ClientMethodParameters) || {};
      let clientMethod = GetNodeProp(node, NodeProperties.ClientMethod);
      let bodytext = "let body = null;";
      let parameterstext = `let parameters = null;`;
      if (clientMethod) {
        let jsClientMethodName = GetJSCodeName(clientMethod);
        let methodParameters = GetMethodParameters(clientMethod);
        if (methodParameters) {
          let { parameters, body } = methodParameters;
          if (body) {
            let componentNodeProperties = GetComponentNodeProperties();
            let instanceType = getClientMethod(
              methodParams,
              key,
              "body",
              "instanceType"
            );
            let componentModel = getClientMethod(
              methodParams,
              key,
              "body",
              "componentModel"
            );
            let c_props = componentNodeProperties.find(
              x =>
                x.id === getClientMethod(methodParams, key, "body", "component")
            );
            let c_props_options =
              c_props && c_props.componentPropertiesList
                ? c_props.componentPropertiesList
                : [];
            if (c_props_options.length) {
              let c_prop_option = c_props_options.find(
                v => v.value === componentModel
              );
              if (c_prop_option) {
                let componentModelName = c_prop_option.value;
                bodytext = `let body = Get${instanceType}Object('${componentModelName}');`;
              }
            }
          }
          if (parameters) {
            // TODO: Handle parameters;
          }
          let pressfunc = `this.props.${jsClientMethodName}({ body, parameters })`;
          if (options && options.onPress && options.onPress.nowrap) {
            elements = bindTemplate(elements, {
              onPressEvent: `onPress={() => {
${parameterstext}
${bodytext}
${pressfunc} }}`
            });
          } else {
            elements = bindTemplate(elements, { onPressEvent: "" });
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
      let screenParameters = GetNodeProp(
        targetScreen,
        NodeProperties.ScreenParameters
      );
      let params = [];
      if (screenParameters) {
        let navigationProperties = GetNodeProp(
          node,
          NodeProperties.NavigationParameters
        );
        let parameterProperty =
          GetNodeProp(node, NodeProperties.NavigationParametersProperty) || {};
        let componentProperties = GetNodeProp(
          node,
          NodeProperties.ComponentProperties
        );
        screenParameters.map(sparam => {
          let { title, id } = sparam;
          let propName = navigationProperties[id];
          if (propName) {
            let propPropName = parameterProperty[propName];
            if (propPropName) {
              let listitem = "";
              if (
                GetNodeProp(node, NodeProperties.ComponentType) ===
                ComponentTypes.ReactNative.ListItem.key
              ) {
                listitem = ".item";
              }
              let propertyNode = GetNodeById(propPropName);
              if (propertyNode) {
                params.push(
                  `${title}: this.props.${propName}${listitem}.${GetJSCodeName(
                    propertyNode
                  )}`
                );
              } else {
                params.push(`${title}: this.props.${propName}${listitem}`);
              }
            }
          }
        });
      }
      if (navigation && params) {
        let navfunc = `navigate('${GetCodeName(navigation)}', {${params.join(
          ", "
        )}})`;
        if (options && options.onPress && options.onPress.nowrap) {
          elements = bindTemplate(elements, {
            onPressEvent: `onPress={() => { ${navfunc} }}`
          });
        } else {
          elements = bindTemplate(elements, { onPressEvent: "" });
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
export function GenerateRNComponents(
  node,
  relative = "./src/components",
  language = UITypes.ReactNative
) {
  let result = [];
  let layoutObj = GetNodeProp(node, NodeProperties.Layout);
  let componentType = GetNodeProp(node, NodeProperties.ComponentType);
  if (
    !layoutObj &&
    (!ComponentTypes[language] ||
      !ComponentTypes[language][componentType] ||
      !ComponentTypes[language][componentType].specialLayout)
  ) {
    switch (GetNodeProp(node, NodeProperties.NODEType)) {
      case NodeTypes.ComponentNode:
        let template = null;
        switch (language) {
          case UITypes.ElectronIO:
            template = fs.readFileSync(
              "./app/templates/screens/el_screenoption.tpl",
              "utf8"
            );
            break;
          case UITypes.ReactNative:
          default:
            template = fs.readFileSync(
              "./app/templates/screens/rn_screenoption.tpl",
              "utf8"
            );
            break;
        }

        let elements = null;
        if (
          ComponentTypes[language] &&
          ComponentTypes[language][componentType]
        ) {
          elements = bindComponent(
            node,
            ComponentTypes[language][componentType]
          );
          if (
            ComponentTypes[language][componentType].properties &&
            ComponentTypes[language][componentType].properties
          ) {
            let { onPress, nowrap } = ComponentTypes[language][
              componentType
            ].properties;
            if (onPress) {
              elements = wrapOnPress(
                elements,
                onPress,
                node,
                ComponentTypes[language][componentType].properties
              );
            }
          }
        }
        let component_did_update = GetComponentDidUpdate(node);

        template = bindTemplate(template, {
          name: GetCodeName(node),
          imports: "",
          component_did_update,
          screen_options: "",
          elements: elements || GetDefaultElement()
        });
        template = bindTemplate(template, {
          relative_depth: []
            .interpolate(
              0,
              relative ? relative.split("/").length - 2 : 1,
              () => "../"
            )
            .join("")
        });
        result.push({
          relative: relative || "./src/components",
          relativeFilePath: `./${(
            GetCodeName(node) || ""
          ).toJavascriptName()}.js`,
          name:
            (relative || "./src/components") +
            `/${(GetCodeName(node) || "").toJavascriptName()}.js`,
          template
        });
        break;
    }
    return result;
  } else {
    let src = GenerateRNScreenOptionSource(
      node,
      relative || "./src/components",
      language
    );
    if (src) result.push(...src);
  }

  let components = GetNodeComponents(layoutObj).filter(
    x => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent)
  );
  components.map(component => {
    let relPath = relative
      ? `${relative}/${(GetCodeName(node) || "").toJavascriptName()}`
      : `./src/components/${(GetCodeName(node) || "").toJavascriptName()}`;
    let temp = GenerateRNComponents(component, relPath, language);
    result.push(...temp);
  });
  return result;
}
export function GenerateCss(id, language) {
  let screen = GetNodeById(id);
  let screenOption = GetScreenOption(id, language);
  if (screenOption) {
    let imports = GetScreenImports(id, language);
    let elements = [GenerateMarkupTag(screenOption, language, screen)];
    let template = null;
    switch (language) {
      case UITypes.ElectronIO:
        template = fs.readFileSync(
          "./app/templates/screens/el_screen.tpl",
          "utf8"
        );
        break;
      case UITypes.ReactNative:
      default:
        template = fs.readFileSync(
          "./app/templates/screens/rn_screen.tpl",
          "utf8"
        );
        break;
    }
    return bindTemplate(template, {
      name: GetCodeName(screen),
      title: `"${GetNodeTitle(screen)}"`,
      imports: imports.join(NEW_LINE),
      elements: elements.join(NEW_LINE),
      component_did_update: GetComponentDidUpdate(screenOption),
      component_did_mount: GetComponentDidMount(screenOption)
    });
  }
}
export function ConvertViewTypeToComponentNode(
  node,
  language,
  isPluralComponent
) {
  let wasstring = false;
  if (typeof node === "string") {
    node = GetNodeById(node);
    wasstring = true;
  }

  switch (GetNodeProp(node, NodeProperties.NODEType)) {
    case NodeTypes.ViewType:
      let temp = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
        id: node.id,
        link: LinkType.DefaultViewType
      })
        .filter(x =>
          [NodeTypes.ComponentNode].some(
            v => v === GetNodeProp(x, NodeProperties.NODEType)
          )
        )
        .filter(x => GetNodeProp(x, NodeProperties.UIType) === language)
        .filter(
          x =>
            GetNodeProp(x, NodeProperties.IsPluralComponent) ===
            isPluralComponent
        )
        .find(x => x);
      node = temp || node;
      break;
  }
  if (wasstring) {
    return node.id;
  }
  return node;
}
export function GenerateMarkupTag(node, language, parent) {
  let viewTypeNode = null;
  if (GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.ViewType) {
    viewTypeNode = node;
  }
  node = ConvertViewTypeToComponentNode(node, language);
  switch (language) {
    case UITypes.ReactNative:
    case UITypes.ElectronIO:
      let describedApi = "";
      if (node && parent) {
        if (viewTypeNode) {
          describedApi = WriteDescribedApiProperties(viewTypeNode, {
            listitem: false,
            parent
          });
        }
        if (!describedApi) {
          describedApi = WriteDescribedApiProperties(node);
        }
      }
      return `<${GetCodeName(node)} ${describedApi} />`;
  }
}
function WriteDescribedStateUpdates(parent) {
  let result = ``;
  let graph = GetCurrentGraph(GetState());
  if (typeof parent === "string") {
    parent = GetNodeById(parent, graph);
  }
  let componentInternalApis = GetNodesLinkedTo(graph, {
    id: parent.id,
    link: LinkType.ComponentInternalApi
  });
  result = componentInternalApis
    .unique(x => GetJSCodeName(x))
    .map(componentInternalApi => {
      let externalApiNode = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.ComponentInternalConnection
      }).find(x => x);

      let dataChain = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.DataChainLink
      }).find(x => x);

      let selector = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.SelectorLink
      }).find(x => x);

      let innerValue = null;
      let externalKey = GetJSCodeName(externalApiNode);
      innerValue = externalKey;
      if (innerValue) {
        if (selector) {
          let addiontionalParams = getUpdateFunctionOption(
            selector.id,
            externalApiNode.id
          );
          innerValue = `S.${GetJSCodeName(
            selector
          )}({{temp}}, this.state.viewModel${addiontionalParams})`;
        } else {
          innerValue = "{{temp}}";
        }
        if (dataChain) {
          innerValue = `DC.${GetCodeName(dataChain)}(${innerValue})`;
        }

        result = `
            var new_${externalKey} = ${bindTemplate(innerValue, {
          temp: `this.props.${externalKey}`
        })};
            if ( new_${externalKey} !== this.state.${GetJSCodeName(
          componentInternalApi
        )}) {

            {{step}}
        }`;

        return bindTemplate(result, {
          temp: innerValue,
          step: `this.setState((state, props) => {
                return { ${GetJSCodeName(
                  componentInternalApi
                )}:  new_${externalKey} };
              });`
        });
      }
    })
    .filter(x => x)
    .join(NEW_LINE);
  return result;
}
function GetDefaultComponentValue(node, key) {
  let result = ``;
  let graph = GetCurrentGraph(GetState());
  if (typeof node === "string") {
    node = GetNodeById(node, graph);
  }
  let componentInternalApis = [
    GetNodesLinkedTo(graph, {
      id: node.id,
      link: LinkType.ComponentInternalApi
    })
      .filter(x => GetNodeProp(x, NodeProperties.UIText) === key)
      .find(x => x)
  ].filter(x => x);

  result = componentInternalApis
    .unique(x => GetJSCodeName(x))
    .map(componentInternalApi => {
      let dataChain = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.DataChainLink
      }).find(x => x);

      let selector = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.SelectorLink
      }).find(x => x);

      let innerValue = null;
      let externalKey = GetJSCodeName(componentInternalApi);
      innerValue = externalKey;
      if (innerValue) {
        if (selector) {
          innerValue = `S.${GetJSCodeName(
            selector
          )}({{temp}}, this.state.viewModel$)`;
        } else {
          innerValue = "{{temp}}";
        }
        if (dataChain) {
          innerValue = `DC.${GetCodeName(dataChain)}(${innerValue})`;
        }

        result = `${bindTemplate(innerValue, {
          temp: `this.state.${externalKey}`
        })}`;
        return result;
      }
    })
    .filter(x => x)
    .join(NEW_LINE);
  return result;
}
function WriteDescribedApiProperties(node, options = { listItem: false }) {
  let result = "";
  if (typeof node === "string") {
    node = GetNodeById(node, graph);
  }

  let graph = GetCurrentGraph(GetState());
  let componentExternalApis = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.ComponentExternalApi
  });

  let componentEventHandlers = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.EventMethod
  });

  let isViewType =
    GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.ViewType;
  let componentType = GetNodeProp(node, NodeProperties.ComponentType);
  let uiType = GetNodeProp(node, NodeProperties.UIType);
  if (ComponentTypes[uiType] && ComponentTypes[uiType][componentType]) {
    let { events } = ComponentTypes[uiType][componentType];
    for (var _event in events) {
      switch (_event) {
        case ComponentEvents.onChange:
          result.push(ComponentEventStandardHandler[_event]);
          break;
      }
    }
  }
  result = componentExternalApis
    .unique(x => GetJSCodeName(x))
    .map(componentExternalApi => {
      let stateKey = false;
      let noSelector = false;
      let noDataChain = false;
      let externalConnection = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.ComponentExternalConnection
      }).find(x => x);

      if (isViewType && !externalConnection) {
        // If the view-type node doesn't have an external connection
        // Then conventions will be assumed.
        externalConnection = componentExternalApi;
        switch (GetNodeTitle(externalConnection)) {
          case "label":
          case "error":
          case "success":
          case "placeholder":
            return;
          case "viewModel":
            noSelector = true;
            noDataChain = true;
          default:
            stateKey = "value";
            break;
        }
      }

      let titleService = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.TitleServiceLink
      }).find(x => x);

      let query = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.QueryLink
      }).find(x => x);

      let dataChain = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.DataChainLink
      }).find(x => x);

      let selector = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.SelectorLink
      }).find(x => x);

      let innerValue = "";
      if (titleService) {
        innerValue = `titleService.get('${GetNodeProp(
          node,
          NodeProperties.Label
        )}')`;
      } else if (externalConnection || query) {
        if (query && GetNodeProp(query, NodeProperties.QueryParameterObject)) {
          innerValue = `GetScreenParam('query')`;
        } else {
          if (options.listItem) {
            let listItemAttribute = GetJSCodeName(externalConnection);
            innerValue =
              listItemAttribute === "viewModel"
                ? `this.state.${listItemAttribute}`
                : listItemAttribute;
          } else {
            let defaulComponentValue =
              GetNodeProp(
                externalConnection,
                NodeProperties.DefaultComponentApiValue
              ) || "";
            if (defaulComponentValue) {
              // Create/Update case
              innerValue = `ViewModelKeys.${defaulComponentValue}`;
            } else {
              // Get/GetAll/Delete
              innerValue = `this.state.${stateKey ||
                GetJSCodeName(externalConnection)}`;
            }
          }
        }
      }
      if (!noSelector && selector) {
        let addiontionalParams =
          componentExternalApi && externalConnection
            ? getUpdateFunctionOption(
                componentExternalApi.id,
                externalConnection.id
              )
            : "";

        innerValue = `S.${GetJSCodeName(
          selector
        )}(${innerValue}, this.state.viewModel${addiontionalParams})`;
      }
      if (!noDataChain && dataChain) {
        innerValue = `DC.${GetCodeName(dataChain)}(${innerValue})`;
      }
      if (innerValue) {
        return `${GetJSCodeName(componentExternalApi)}={${innerValue}}`;
      }
    })
    .filter(x => x);

  let res = componentEventHandlers
    .unique(x => GetJSCodeName(x))
    .map(componentEventHandler => {
      let eventInstances = GetNodesLinkedTo(graph, {
        id: componentEventHandler.id,
        link: LinkType.EventMethodInstance
      });
      return eventInstances
        .map(eventInstance => {
          let eventMethodHandlers = GetNodesLinkedTo(graph, {
            id: eventInstance.id,
            link: LinkType.EventHandler
          });
          let method_calls = eventMethodHandlers.map(eventMethodHandler => {
            let property = GetNodesLinkedTo(graph, {
              id: eventMethodHandler.id,
              link: LinkType.PropertyLink
            }).find(x => x);
            let viewModel = GetNodesLinkedTo(graph, {
              id: eventMethodHandler.id,
              link: LinkType.ViewModelLink
            }).find(x => x);
            let eventType = GetNodeProp(
              eventMethodHandler,
              NodeProperties.EventType
            );
            let addiontionalParams =
              componentEventHandler && eventInstance
                ? getUpdateFunctionOption(
                    componentEventHandler.id,
                    eventInstance.id,
                    `, { update: true, value: this.state.value/*hard coded*/ }`
                  )
                : "";

            let method_call = null;
            let modelProperty = GetJSCodeName(property);
            let screenOrModel = GetNodeProp(
              eventMethodHandler,
              NodeProperties.InstanceType
            )
              ? "Model"
              : "Screen";
            switch (eventType) {
              case ComponentEvents.onBlur:
                method_call = `this.props.update${screenOrModel}InstanceBlur(this.state.viewModel, '${modelProperty}'${addiontionalParams})`;
                break;
              case ComponentEvents.onFocus:
                method_call = `this.props.update${screenOrModel}InstanceFocus(this.state.viewModel, '${modelProperty}'${addiontionalParams})`;
                break;
              case ComponentEvents.onChangeText:
                method_call = `this.props.update${screenOrModel}Instance(this.state.viewModel, '${modelProperty}', arg${addiontionalParams})`;
                break;
              case ComponentEvents.onChange:
                method_call = `this.props.update${screenOrModel}Instance(this.state.viewModel, '${modelProperty}', arg.nativeEvent.text${addiontionalParams})`;
                break;
            }
            return method_call;
          });
          if (method_calls && method_calls.length) {
            return `${GetNodeProp(
              eventInstance,
              NodeProperties.EventType
            )}={arg => {
                    ${method_calls.join(NEW_LINE)}
                }}`;
          }
        })
        .filter(x => x)
        .join(NEW_LINE);
    });

  result.push(...res);
  return NEW_LINE + result.join(NEW_LINE);
}
export function writeApiProperties(apiConfig) {
  var result = "";
  var res = [];

  if (apiConfig) {
    for (var i in apiConfig) {
      let property = null;
      let {
        instanceType,
        model,
        selector,
        modelProperty,
        apiProperty,
        handlerType,
        isHandler,
        dataChain
      } = apiConfig[i];
      let modelJsName = GetJSCodeName(model) || model;
      switch (instanceType) {
        case InstanceTypes.ScreenInstance:
          switch (handlerType) {
            case HandlerTypes.Blur:
              property = `() => this.props.updateScreenInstanceBlur(this.state.viewModel, const_${GetJSCodeName(
                modelProperty
              )})`;
              break;
            case HandlerTypes.Focus:
              property = `() => this.props.updateScreenInstanceFocus(this.state.viewModel, const_${GetJSCodeName(
                modelProperty
              )})`;
              break;
            case HandlerTypes.ChangeText:
              property = `(v) => this.props.updateScreenInstance(this.state.viewModel, const_${GetJSCodeName(
                modelProperty
              )}, v)`;
              break;
            case HandlerTypes.Change:
              property = `(v) => this.props.updateScreenInstance(this.state.viewModel, const_${GetJSCodeName(
                modelProperty
              )}, v.nativeEvent.text)`;
              break;
            case HandlerTypes.Property:
            default:
              if (modelProperty) {
                property = `GetScreenInstance(this.state.viewModel, const_${GetJSCodeName(
                  modelProperty
                )})`;
              } else {
                property = `GetScreenInstanceObject(this.state.viewModel)`;
              }
              break;
          }
          break;
        case InstanceTypes.ModelInstance:
          switch (handlerType) {
            case HandlerTypes.Blur:
              property = `() => this.props.updateModelInstanceBlur(this.state.viewModel, this.props.value, '${GetJSCodeName(
                modelProperty
              )}')`;
              break;
            case HandlerTypes.Focus:
              property = `() => this.props.updateModelInstanceFocus(this.state.viewModel, this.props.value, '${GetJSCodeName(
                modelProperty
              )}')`;
              break;
            case HandlerTypes.ChangeText:
              property = `(v) => this.props.updateModelInstance(this.state.viewModel, this.props.value, '${GetJSCodeName(
                modelProperty
              )}', v)`;
              break;
            case HandlerTypes.Change:
              property = `(v) => this.props.updateModelInstance(this.state.viewModel, this.props.value, '${GetJSCodeName(
                modelProperty
              )}', v.nativeEvent.text)`;
              break;
            case HandlerTypes.Property:
            default:
              if (modelProperty) {
                property = `GetModelInstance(this.state.viewModel, this.props.value, '${GetJSCodeName(
                  modelProperty
                )}')`;
              } else {
                property = `GetModelInstanceObject(this.state.viewModel, this.props.value)`;
              }
              break;
          }
          break;
        default:
          break;
        // throw 'write api properties unhandled case ' + instanceType;
      }
      if (property) {
        if (dataChain) {
          let codeName = GetCodeName(dataChain);
          property = `DC.${codeName}(${property})`;
        }
        // There is an opportunity to wrapp the result in a getter.
        res.push(`${NEW_LINE}${i}={${property}}`);
      }
    }
  }

  result = res.join(" ");

  return result;
}
export function GetScreenOption(id, language) {
  let screen = GetNodeById(id);
  let screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
  if (screenOptions && screenOptions.length) {
    let reactScreenOption = screenOptions.find(
      x => GetNodeProp(x, NodeProperties.UIType) === language
    );
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
    let reactScreenOption = screenOptions.find(
      x => GetNodeProp(x, NodeProperties.UIType) === language
    );
    if (reactScreenOption) {
      return [GenerateImport(reactScreenOption, screen, language)];
    }
    return [];
  }
  return null;
}

export function getMethodInstancesForLifeCylcEvntType(node, evtType) {
  if (typeof node === "string") {
    node = GetNodeById(node);
  }
  let graph = GetCurrentGraph(GetState());
  let methods = getNodesByLinkType(graph, {
    id: node.id,
    type: LinkType.LifeCylceMethod,
    direction: TARGET,
    exist: true
  }).filter(x => GetNodeProp(x, NodeProperties.EventType) === evtType);
  let methodInstances = [];
  methods.map(method => {
    methodInstances.push(
      ...getNodesLinkedTo(graph, {
        id: method.id,
        exist: true
      }).filter(x =>
        [NodeTypes.LifeCylceMethodInstance].some(
          v => v === GetNodeProp(x, NodeProperties.NODEType)
        )
      )
    );
  });

  return methodInstances;
}

export function getMethodInstancesForEvntType(node, evtType) {
  if (typeof node === "string") {
    node = GetNodeById(node);
  }
  let graph = GetCurrentGraph(GetState());
  let methods = getNodesByLinkType(graph, {
    id: node.id,
    type: LinkType.EventMethod,
    direction: TARGET,
    exist: true
  }).filter(x => GetNodeProp(x, NodeProperties.EventType) === evtType);
  let methodInstances = [];
  methods.map(method => {
    methodInstances.push(
      ...getNodesLinkedTo(graph, {
        id: method.id,
        exist: true
      }).filter(x =>
        [NodeTypes.EventMethodInstance].some(
          v => v === GetNodeProp(x, NodeProperties.NODEType)
        )
      )
    );
  });

  return methodInstances;
}
export function getMethodInvocation(methodInstanceCall) {
  let graph = GetCurrentGraph(GetState());
  let method = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.MethodCall,
    direction: SOURCE
  }).find(x => x);
  let navigationMethod = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.NavigationMethod,
    direction: SOURCE
  }).find(x => x);
  let dataChain = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.DataChainLink,
    direction: SOURCE
  }).find(x => x);
  let internalApiConnection = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.ComponentApi,
    direction: SOURCE
  }).find(x => x);
  if (method) {
    let parts = [];
    let body = getNodesByLinkType(graph, {
      id: method.id,
      type: LinkType.MethodApiParameters,
      direction: TARGET
    }).find(x => GetNodeProp(x, NodeProperties.UriBody));
    let queryObject = getNodesByLinkType(graph, {
      id: method.id,
      type: LinkType.MethodApiParameters,
      direction: TARGET
    }).find(x => GetNodeProp(x, NodeProperties.QueryParameterObject));

    let dataChain = GetNodesLinkedTo(graph, {
      id: methodInstanceCall.id,
      link: LinkType.DataChainLink
    }).find(x => {
      return GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataChain;
    });
    let methodInstanceSource = GetNodesLinkedTo(graph, {
      id: methodInstanceCall.id,
      link: LinkType.EventMethodInstance
    }).find(x => {
      return GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.EventMethod;
    });
    let body_input = null;
    if (body) {
      let body_param = getNodesByLinkType(graph, {
        id: body.id,
        type: LinkType.ComponentApiConnection,
        direction: TARGET
      }).find(x => x);
      if (body_param) {
        let body_selector = getNodesByLinkType(graph, {
          id: body_param.id,
          type: LinkType.ComponentApiConnection,
          direction: SOURCE
        }).find(
          x_temp =>
            GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.Selector
        );
        let innervalue = "";
        if (body_selector) {
          let addiontionalParams = getUpdateFunctionOption(
            methodInstanceSource ? methodInstanceSource.id : null,
            methodInstanceCall ? methodInstanceCall.id : null
          );

          innervalue = `S.${GetJSCodeName(
            body_selector
          )}(this.state.value, this.state.viewModel${addiontionalParams})`;
        }
        let body_value = getNodesByLinkType(graph, {
          id: body_param.id,
          type: LinkType.ComponentApiConnection,
          direction: SOURCE
        }).find(
          x_temp =>
            GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.DataChain
        );
        if (body_value) {
          body_input = `body: DC.${GetCodeName(body_value)}(${innervalue})`;
        }
      }
      if (body_input) {
        parts.push(`${body_input}`);
      }
    }
    if (queryObject) {
      let queryParameters = getNodesByLinkType(graph, {
        id: queryObject.id,
        type: LinkType.MethodApiParameters,
        direction: SOURCE
      });
      queryParameters = queryParameters.filter(x =>
        GetNodeProp(x, NodeProperties.QueryParameterParam)
      );

      let queryParameterValues = queryParameters
        .map(queryParameter => {
          let param = getNodesByLinkType(graph, {
            id: queryParameter.id,
            type: LinkType.ComponentApiConnection,
            direction: TARGET
          }).find(x_temp => x_temp);
          if (param) {
            let value = getNodesByLinkType(graph, {
              id: param.id,
              type: LinkType.ComponentApiConnection,
              direction: SOURCE
            }).find(
              x_temp =>
                GetNodeProp(x_temp, NodeProperties.NODEType) ===
                NodeTypes.DataChain
            );
            if (value) {
              return `${GetJSCodeName(queryParameter)}: DC.${GetCodeName(
                value
              )}(this.props.state)`;
            }
          }
        })
        .filter(temp => temp);
      parts.push(
        `query: {${addNewLine(queryParameterValues.join(", " + NEW_LINE))}}`
      );
    }
    let dataChainInput = "";
    if (dataChain) {
      dataChainInput =
        (parts.length ? "," : "") + `dataChain: DC.${GetCodeName(dataChain)}`;
    }
    let query = parts.join();
    return `this.props.${GetJSCodeName(method)}({${query}${dataChainInput}});`;
  } else if (navigationMethod) {
    return `this.props.${GetNodeProp(
      navigationMethod,
      NodeProperties.NavigationAction
    )}();`;
  } else if (dataChain) {
    //Buttons need to use this.state.value, so a new property for datachains should exist.
    if (internalApiConnection) {
      return `DC.${GetCodeName(dataChain)}(this.state.${GetJSCodeName(
        internalApiConnection
      )});`;
    }
    return `DC.${GetCodeName(dataChain)}(value);`;
  }
}

export function getUpdateFunctionOption(
  methodId,
  methodInstanceCallId,
  addParams
) {
  let addiontionalParams = "";
  if (methodId && methodInstanceCallId) {
    let link_selector = GetLinkBetween(
      methodId,
      methodInstanceCallId,
      GetCurrentGraph()
    );
    if (link_selector) {
      let instanceUpdate = GetLinkProperty(
        link_selector,
        LinkPropertyKeys.InstanceUpdate
      );
      if (instanceUpdate) {
        addiontionalParams = addParams || `, { update: true }`;
      }
    }
  }
  return addiontionalParams;
}
export function GetComponentDidUpdate(parent, options = {}) {
  let { isScreen } = options;
  let describedApi = "";
  if (parent) {
    describedApi = WriteDescribedStateUpdates(parent).trim();
  }

  let componentDidUpdate =
    `componentDidUpdate(prevProps) {
        this.captureValues();
      }
      ` +
    (!isScreen
      ? `componentDidMount(prevProps) {
        this.captureValues();
      }`
      : "") +
    `
      captureValues(){
        ${describedApi}
      }`;

  return componentDidUpdate;
}
export function GetComponentDidMount(screenOption) {
  let events = GetNodeProp(screenOption, NodeProperties.ComponentDidMountEvent);
  let outOfBandCall = "";
  if (
    GetNodeProp(screenOption, NodeProperties.InstanceType) ===
    InstanceTypes.ModelInstance
  ) {
    if (
      GetNodeProp(screenOption, NodeProperties.ViewType) === ViewTypes.GetAll
    ) {
      outOfBandCall = `// fetchModelInstanceChildren(this.props.value, Models.${GetCodeName(
        GetNodeProp(screenOption, NodeProperties.Model)
      )});`;
    } else {
      outOfBandCall = `//  fetchModelInstance(this.props.value, Models.${GetCodeName(
        GetNodeProp(screenOption, NodeProperties.Model)
      )});`;
    }
  }
  let methodInstances = getMethodInstancesForLifeCylcEvntType(
    screenOption,
    ComponentLifeCycleEvents.ComponentDidMount
  );

  let invocations = (methodInstances || [])
    .map(methodInstanceCall => {
      return getMethodInvocation(methodInstanceCall);
    })
    .join(NEW_LINE);

  let componentDidMount = `componentDidMount(value) {
        this.props.setGetState();
        this.captureValues();
        ${outOfBandCall}
        ${invocations}
{{handles}}
}
`;
  let evntHandles = [];
  if (events && events.length) {
    evntHandles = events
      .map(evt => {
        let methodNode = GetNodeById(evt);
        return `this.props.${GetJSCodeName(methodNode)}();`;
      })
      .join(NEW_LINE);
  } else {
    evntHandles = "";
  }

  return addNewLine(
    bindTemplate(componentDidMount, {
      handles: addNewLine(evntHandles, 1)
    }),
    1
  );
}

export function GenerateImport(node, parentNode, language) {
  node = ConvertViewTypeToComponentNode(node, language);

  switch (language) {
    case UITypes.ReactNative:
    case UITypes.ElectronIO:
      if (node) {
        if (GetNodeProp(node, NodeProperties.SharedComponent)) {
          return `import ${GetCodeName(node)} from '../shared/${(
            GetCodeName(node) || ""
          ).toJavascriptName()}'`;
        }
        return `import ${GetCodeName(node)} from '../components/${(
          GetCodeName(node) || ""
        ).toJavascriptName()}'`;
      }
  }
}

export function GenerateComponentImport(node, parentNode, language) {
  node = ConvertViewTypeToComponentNode(node, language);

  switch (language) {
    case UITypes.ElectronIO:
    case UITypes.ReactNative:
      if (node) {
        if (GetNodeProp(node, NodeProperties.SharedComponent)) {
          return `import ${GetCodeName(node)} from '{{relative_depth}}shared/${(
            GetCodeName(node) || ""
          ).toJavascriptName()}'`;
        }
        return `import ${GetCodeName(node)} from './${(
          GetCodeName(parentNode) || ""
        ).toJavascriptName()}/${(GetCodeName(node) || "").toJavascriptName()}'`;
      }
  }
}

export function GetScreens() {
  var screens = GetScreenNodes();
  return screens;
}
function GenerateElectronIORoutes(screens) {
  let template = `<Route path={routes.{{route_name}}} render={({ match, history, location }) => {
    console.log(match.params);
    let {{{screenApiParams}}} = match.params;
    {{overrides}}
    setParameters({{{screenApiParams}}});
    return <{{component}} {{screenApi}} />}} />
  }`;
  let routefile = fs.readFileSync(
    "./app/templates/electronio/routes.tpl",
    "utf8"
  );
  let import_ = `import {{name}} from './screens/{{jsname}}';`;
  let routes = [];
  let _screens = [];
  screens.map(screen => {
    let screenApis = getNodesByLinkType(GetCurrentGraph(), {
      id: screen.id,
      type: LinkType.ComponentExternalApi,
      direction: SOURCE
    });
    let screenApi = screenApis
      .map(v => `${GetJSCodeName(v)}={${GetJSCodeName(v)}}`)
      .join(" ");
    let viewModel = screenApis.find(x => GetNodeTitle(x) === "viewModel");
    let overrides = "";
    if (viewModel) {
      let viewModelDataLink = getNodesByLinkType(GetCurrentGraph(), {
        id: viewModel.id,
        type: LinkType.DataChainLink,
        direction: SOURCE
      }).find(x => x);
      if (viewModelDataLink) {
        overrides = `viewModel = DC.${GetCodeName(viewModelDataLink)}();`;
      }
    }
    let screenApiParams = screenApis.map(v => `${GetJSCodeName(v)}`).join();

    routes.push(
      bindTemplate(template, {
        route_name: `${GetCodeName(screen)}`,
        overrides,
        component: GetCodeName(screen),
        screenApiParams,
        screenApi
      })
    );
    _screens.push(
      bindTemplate(import_, {
        name: GetCodeName(screen),
        jsname: GetJSCodeName(screen)
      })
    );
  });
  let routeFile = bindTemplate(routefile, {
    routes: routes.sort((a, b) => b.length - a.length).join(NEW_LINE),
    route_imports: _screens.join(NEW_LINE)
  });
  return {
    template: routeFile,
    relative: "./src",
    relativeFilePath: `./Routes.js`,
    name: `Routes.js`
  };
}
export function BindScreensToTemplate(language = UITypes.ReactNative) {
  var screens = GetScreens();
  let template = fs.readFileSync("./app/templates/screens/screen.tpl", "utf8");
  let moreresults = [];
  let result = screens
    .map(screen => {
      let screenOptions = GetConnectedScreenOptions(screen.id);
      if (screenOptions && screenOptions.length) {
        let reactScreenOption = screenOptions.find(
          x => GetNodeProp(x, NodeProperties.UIType) === language
        );
        if (reactScreenOption) {
          template = GenerateScreenMarkup(screen.id, language);
          let screenOptionSrc = GenerateScreenOptionSource(
            reactScreenOption,
            screen,
            language
          );
          if (screenOptionSrc) {
            moreresults.push(...screenOptionSrc.filter(x => x));
          }
        }
      } else {
        return false;
      }
      return {
        template: bindTemplate(template, {
          name: GetCodeName(screen),
          title: `"${GetNodeTitle(screen)}"`
        }),
        relative: "./src/screens",
        relativeFilePath: `./${GetCodeName(screen).toJavascriptName()}.js`,
        name: GetCodeName(screen)
      };
    })
    .filter(x => x);
  switch (language) {
    case UITypes.ElectronIO:
      moreresults.push(GenerateElectronIORoutes(screens));
      break;
  }
  let all_nodes = NodesByType(GetState(), [NodeTypes.ComponentNode]);
  let sharedComponents = all_nodes.filter(x =>
    GetNodeProp(x, NodeProperties.SharedComponent)
  );
  let relPath = "./src/shared";
  sharedComponents.map(sharedComponent => {
    moreresults.push(
      ...GenerateRNComponents(sharedComponent, relPath, language)
    );
  });

  moreresults.push({
    template: bindTemplate(`{{source}}`, {
      source: NodesByType(GetState(), [
        NodeTypes.Screen,
        NodeTypes.ScreenOption,
        NodeTypes.ComponentNode
      ])
        .map(t => `export const ${GetCodeName(t)} = '${GetCodeName(t)}';`)
        .unique()
        .join(NEW_LINE)
    }),
    relative: "./src/actions",
    relativeFilePath: `./screenInstances.js`,
    name: ``
  });

  return [...result, ...moreresults];
}
