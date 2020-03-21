/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
/* eslint-disable default-case */
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
  LinkPropertyKeys,
  MediaQueries,
  StyleNodeProperties
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
  ComponentEventStandardHandler,
  GetFormItemNode,
  ComponentTypeKeys
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
  GetLinkBetween,
  existsLinkBetween
} from "../methods/graph_methods";
import { HandlerType } from "../components/titles";
import { addNewLine } from "../utils/array";
import { StyleLib } from "../constants/styles";
import { ViewTypes } from "../constants/viewtypes";

export function GenerateScreens(options) {
  const { language } = options;
  const temps = BindScreensToTemplate(language || UITypes.ReactNative);
  const result = {};

  temps.map(t => {
    result[path.join(t.relative, t.name)] = t;
  });

  return result;
}

export function GenerateScreenMarkup(id, language) {
  const screen = GetNodeById(id);
  const screenOption = GetScreenOption(id, language);
  if (screenOption) {
    const imports = GetScreenImports(id, language);
    const elements = [GenerateMarkupTag(screenOption, language, screen)];
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
  const listItemNode = GetListItemNode(node.id);
  imports.push(GenerateComponentImport(listItemNode, node, language));
  const properties = WriteDescribedApiProperties(listItemNode, {
    listItem: true
  });
  return `({item, index, separators, key})=>{
    let value = item;
    return  <${GetCodeName(
    listItemNode
  )} ${properties} value={value}  key={item && item.id !== undefined && item.id !== null  ? item.id : item}/>
  }`;
}
export function GetFormRender(node, imports, language) {
  const listItemNode = GetFormItemNode(node.id);
  if (!listItemNode) {
    return "";
  }
  imports.push(GenerateComponentImport(listItemNode, node, language));
  const properties = WriteDescribedApiProperties(listItemNode, {
    listItem: true
  });
  return `({item, index, separators, key})=>{
    let value = item;
    return  <${GetCodeName(
    listItemNode
  )} ${properties} value={value} key={item && item.id !== undefined && item.id !== null  ? item.id : item}/>
  }`;
}
export function GetItemRenderImport(node) {
  const listItemNode = GetListItemNode(node.id);
  const properties = WriteDescribedApiProperties(listItemNode, {
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
  const rules = Object.keys(css)
    .map(v => {
      const style = css[v].style;

      const props = Object.keys(style)
        .map(key => {
          const temp = key.replace(/([a-z])([A-Z])/g, "$1-$2");
          const value = style[key];
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

export function GetStylesFor(node, tag) {
  if (typeof node === "string") {
    node = GetNodeById(node);
  }
  const graph = GetCurrentGraph();
  const styleNodes = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.Style
  }).filter(
    x => (GetNodeProp(x, NodeProperties.GridAreas) || []).indexOf(tag) !== -1
  );

  const dataChainsConnectedToStyle = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.DataChain
  }).filter(x => {
    const connectedStyleNodes = GetNodesLinkedTo(graph, {
      id: x.id,
      link: LinkType.Style
    });
    return connectedStyleNodes.some(x => {
      return styleNodes.some(node => node.id === x.id);
    });
  });

  return styleNodes.map(styleNode => {
    const dataChainTest = dataChainsConnectedToStyle
      .filter(dc => {
        return existsLinkBetween(graph, {
          source: dc.id,
          target: styleNode.id
        });
      })
      .map(dc => {
        const selector = GetNodesLinkedTo(graph, {
          id: dc.id,
          link: LinkType.SelectorLink
        })[0];
        let input = "";
        if (selector) {
          const inputs = GetNodesLinkedTo(graph, {
            id: selector.id,
            link: LinkType.SelectorInputLink
          }).filter(
            x =>
              GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentApi
          );
          input = `S.${GetCodeName(selector)}({${inputs
            .map(
              input => `${GetCodeName(input)}: this.state.${GetCodeName(input)}`
            )
            .join()}})`;
        }
        return `DC.${GetCodeName(dc, { includeNameSpace: true })}(${input})`;
      })
      .join(" && ");
    if (!dataChainTest) {
      return `$\{styles.${GetJSCodeName(styleNode)}}`;
    }
    return `$\{${dataChainTest} ? styles.${GetJSCodeName(styleNode)} : '' }`;
  });
}
/*
A  node that is connected to style node, will generate the guts of the style to be named elsewhere.
*/
export function buildStyle(node) {
  const graph = GetCurrentGraph();
  if (typeof node === "string") {
    node = GetNodeById(node, graph);
  }
  const styleNodes = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.Style
  });

  const styleSheetRules = styleNodes
    .map(styleNode => {
      const style = GetNodeProp(styleNode, NodeProperties.Style);
      const styleSelectors = StyleNodeProperties.filter(x =>
        GetNodeProp(styleNode, x)
      ).map(styleProp => {
        return styleProp;
      });
      const areas = GetNodeProp(styleNode, NodeProperties.GridAreas);
      const gridRowCount = parseInt(
        GetNodeProp(styleNode, NodeProperties.GridRowCount) || 1,
        10
      );
      const gridplacement = GetNodeProp(styleNode, NodeProperties.GridPlacement);
      const styleObj = GetNodeProp(styleNode, NodeProperties.Style);
      const useMediaQuery = GetNodeProp(style, NodeProperties.UseMediaQuery);
      let mediaquery_start = "";
      let mediaquery_end = "";
      if (useMediaQuery) {
        mediaquery_start =
          MediaQueries[GetNodeProp(styleNode, NodeProperties.MediaQuery)];
        if (mediaquery_start) {
          mediaquery_start = `${mediaquery_start} {`;
          mediaquery_end = `}`;
        }
      }
      const styleName = GetJSCodeName(styleNode);
      const stylesSelectorsName = styleSelectors
        .map(styleSelector => {
          return `${styleName}${styleSelector}`;
        })
        .join();
      const stylesheet = `${mediaquery_start}
    .${stylesSelectorsName || styleName} {
      ${Object.keys(styleObj)
          .map(s => {
            return `${StyleLib.js[s]}: ${styleObj[s]};`;
          })
          .join(NEW_LINE)}
    }
    ${mediaquery_end}`;

      return stylesheet;
    })
    .join(NEW_LINE);
  return styleSheetRules;
}

export function GetItemData(node) {
  const dataSourceNode = GetDataSourceNode(node.id);
  const connectedNode = GetNodeProp(dataSourceNode, NodeProperties.DataChain);
  const instanceType = GetNodeProp(dataSourceNode, NodeProperties.InstanceType);
  const defaultValue = GetDefaultComponentValue(node);
  if (connectedNode) {
    // data = `D.${GetJSCodeName(connectedNode)}(${data})`;
    return `(()=> {
    return DC.${GetCodeName(connectedNode, {
      includeNameSpace: true
    })}(${defaultValue});
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
  const layoutObj = GetNodeProp(node, NodeProperties.Layout);
  const componentType = GetNodeProp(node, NodeProperties.ComponentType);
  const { specialLayout, template } = ComponentTypes[language][componentType]
    ? ComponentTypes[language][componentType]
    : {};

  let imports = [];
  const extraimports = [];
  const css = {};
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
    const data = GetItemData(node);
    const item_render = GetItemRender(node, extraimports, language);
    const form_render = GetFormRender(node, extraimports, language);
    const apiProperties = WriteDescribedApiProperties(node);
    layoutSrc = bindTemplate(fs.readFileSync(template, "utf8"), {
      item_render: item_render,
      form_render,
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
          const { onPress } = ComponentTypes[language][componentType].properties;
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
  let ending = ".js";
  switch (language) {
    case UITypes.ElectronIO:
      ending = ".tsx";
      templateStr = fs.readFileSync(
        "./app/templates/screens/el_screenoption.tpl",
        "utf8"
      );
      const styleRules = buildStyle(node);
      cssFile = constructCssFile(
        css,
        `.${(GetCodeName(node) || "").toJavascriptName()}`
      );
      cssFile = cssFile + styleRules;

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
  const results = [];
  imports
    .filter(x => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent))
    .map(t => {
      const relPath = relativePath
        ? `${relativePath}/${(GetCodeName(node) || "").toJavascriptName()}`
        : `./src/components/${(GetCodeName(node) || "").toJavascriptName()}`;
      results.push(...GenerateRNComponents(GetNodeById(t), relPath, language));
    });
  imports = imports
    .unique()
    .map(t => GenerateComponentImport(t, node, language));

  const _consts = GetRNConsts(node.id ? node.id : node) || [];
  const modelInstances = GetRNModelInstances(node.id ? node.id : node) || [];
  const screen_options = addNewLine(
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
      relativeFilePath: `./${(
        GetCodeName(node) || ""
      ).toJavascriptName()}${ending}`,
      name:
        (relativePath || "./src/components/") +
        `${(GetCodeName(node) || "").toJavascriptName()}${ending}`
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
    const template = fs.readFileSync(componentBindingDefinition.template, "utf8");
    const { properties } = componentBindingDefinition;
    const bindProps = {};
    Object.keys(properties).map(key => {
      if (properties[key] && properties[key].nodeProperty) {
        bindProps[key] = GetNodeProp(node, properties[key].nodeProperty);
        if (properties[key].parameterConfig) {
          const parameterConfig = GetNodeProp(node, properties[key].nodeProperty);
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
    const eventHandlers = cevents
      .map(t => getMethodInstancesForEvntType(node, ComponentEvents[t]))
      .map((methodInstances, i) => {
        const invocations = methodInstances
          .map(methodInstanceCall => {
            if (!methodInstanceCall) debugger;
            let invocationDependsOnState = null;
            const temp = getMethodInvocation(methodInstanceCall, args => {
              const { statePropertiesThatCauseInvocation } = args;
              invocationDependsOnState = (
                statePropertiesThatCauseInvocation || []
              ).length;
            }, { component: node });
            if (invocationDependsOnState) return false;
            return temp;
          })
          .filter(x => x)
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
  const onpress = GetNodeProp(node, "onPress");
  switch (onpress) {
    case APP_METHOD:
      const key = "onPress";
      const methodParams =
        GetNodeProp(node, NodeProperties.ClientMethodParameters) || {};
      const clientMethod = GetNodeProp(node, NodeProperties.ClientMethod);
      let bodytext = "let body = null;";
      const parameterstext = `let parameters = null;`;
      if (clientMethod) {
        const jsClientMethodName = GetJSCodeName(clientMethod);
        const methodParameters = GetMethodParameters(clientMethod);
        if (methodParameters) {
          const { parameters, body } = methodParameters;
          if (body) {
            const componentNodeProperties = GetComponentNodeProperties();
            const instanceType = getClientMethod(
              methodParams,
              key,
              "body",
              "instanceType"
            );
            const componentModel = getClientMethod(
              methodParams,
              key,
              "body",
              "componentModel"
            );
            const c_props = componentNodeProperties.find(
              x =>
                x.id === getClientMethod(methodParams, key, "body", "component")
            );
            const c_props_options =
              c_props && c_props.componentPropertiesList
                ? c_props.componentPropertiesList
                : [];
            if (c_props_options.length) {
              const c_prop_option = c_props_options.find(
                v => v.value === componentModel
              );
              if (c_prop_option) {
                const componentModelName = c_prop_option.value;
                bodytext = `let body = Get${instanceType}Object('${componentModelName}');`;
              }
            }
          }
          if (parameters) {
            // TODO: Handle parameters;
          }
          const pressfunc = `this.props.${jsClientMethodName}({ body, parameters })`;
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
      const navigation = GetNodeProp(node, NodeProperties.Navigation);
      const targetScreen = GetNodeById(navigation);
      const screenParameters = GetNodeProp(
        targetScreen,
        NodeProperties.ScreenParameters
      );
      const params = [];
      if (screenParameters) {
        const navigationProperties = GetNodeProp(
          node,
          NodeProperties.NavigationParameters
        );
        const parameterProperty =
          GetNodeProp(node, NodeProperties.NavigationParametersProperty) || {};
        const componentProperties = GetNodeProp(
          node,
          NodeProperties.ComponentProperties
        );
        screenParameters.map(sparam => {
          const { title, id } = sparam;
          const propName = navigationProperties[id];
          if (propName) {
            const propPropName = parameterProperty[propName];
            if (propPropName) {
              let listitem = "";
              if (
                GetNodeProp(node, NodeProperties.ComponentType) ===
                ComponentTypes.ReactNative.ListItem.key
              ) {
                listitem = ".item";
              }
              const propertyNode = GetNodeById(propPropName);
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
        const navfunc = `navigate('${GetCodeName(navigation)}', {${params.join(
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
  const result = [];
  const layoutObj = GetNodeProp(node, NodeProperties.Layout);
  let fileEnding = ".js";
  switch (language) {
    case UITypes.ElectronIO:
      fileEnding = ".tsx";
      break;
  }
  const componentType = GetNodeProp(node, NodeProperties.ComponentType);
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
            const { onPress, nowrap } = ComponentTypes[language][
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
        const component_did_update = GetComponentDidUpdate(node);

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
          ).toJavascriptName()}${fileEnding}`,
          name:
            (relative || "./src/components") +
            `/${(GetCodeName(node) || "").toJavascriptName()}${fileEnding}`,
          template
        });
        break;
    }
    return result;
  } else {
    const src = GenerateRNScreenOptionSource(
      node,
      relative || "./src/components",
      language
    );
    if (src) result.push(...src);
  }

  const components = GetNodeComponents(layoutObj).filter(
    x => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent)
  );
  components.map(component => {
    const relPath = relative
      ? `${relative}/${(GetCodeName(node) || "").toJavascriptName()}`
      : `./src/components/${(GetCodeName(node) || "").toJavascriptName()}`;
    const temp = GenerateRNComponents(component, relPath, language);
    result.push(...temp);
  });
  return result;
}
export function GenerateCss(id, language) {
  const screen = GetNodeById(id);
  const screenOption = GetScreenOption(id, language);
  if (screenOption) {
    const imports = GetScreenImports(id, language);
    const elements = [GenerateMarkupTag(screenOption, language, screen)];
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
      const temp = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
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
            !!GetNodeProp(x, NodeProperties.IsPluralComponent) ===
            !!isPluralComponent
        )
        .find(x => x);
      node = temp || node;
      break;
    default: break;
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
          describedApi = WriteDescribedApiProperties(node, {
            listItem:
              GetNodeProp(node, NodeProperties.ComponentType) ===
              ComponentTypeKeys.ListItem
          });
        }
      }
      return `<${GetCodeName(node)} ${describedApi} />`;
  }
}
function WriteDescribedStateUpdates(parent) {
  let result = ``;
  const graph = GetCurrentGraph(GetState());
  if (typeof parent === "string") {
    parent = GetNodeById(parent, graph);
  }
  const componentInternalApis = GetNodesLinkedTo(graph, {
    id: parent.id,
    link: LinkType.ComponentInternalApi
  });
  result = componentInternalApis
    .unique(x => GetJSCodeName(x))
    .map(componentInternalApi => {
      const externalApiNode = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.ComponentInternalConnection
      }).find(x => x);

      const dataChain = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.DataChainLink
      }).find(x => x);

      const selector = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.SelectorLink
      }).find(x => x);

      let innerValue = null;
      const externalKey = GetJSCodeName(externalApiNode);
      innerValue = externalKey;
      if (innerValue) {
        if (selector) {
          const addiontionalParams = getUpdateFunctionOption(
            selector.id,
            externalApiNode.id,
            `, { update: true }/*s => e*/`
          );
          innerValue = `S.${GetJSCodeName(
            selector
          )}({{temp}}, this.state.viewModel${addiontionalParams} /* state update */)`;
        } else {
          innerValue = "{{temp}}";
        }
        if (dataChain) {
          innerValue = `DC.${GetCodeName(dataChain, {
            includeNameSpace: true
          })}(${innerValue})`;
        }
        const temp_prop = GetJSCodeName(componentInternalApi);
        result = `
            var new_${externalKey} = ${bindTemplate(innerValue, {
          temp: `this.props.${externalKey}`
        })};
            if ( new_${externalKey} !== this.state.${temp_prop}) {
          {{step}}
        }`;

        return bindTemplate(result, {
          temp: innerValue,
          step: `updated = true;
            updates = {...updates, ${GetJSCodeName(
            componentInternalApi
          )}:  new_${externalKey} };`
        });
      }
    })
    .filter(x => x)
    .join(NEW_LINE);

  const methodInstances = getMethodInstancesForLifeCylcEvntType(
    parent,
    ComponentLifeCycleEvents.ComponentDidMount
  );

  const invocations = (methodInstances || [])
    .map(methodInstanceCall => {
      let invocationDependsOnState = false;
      let dependentStateProperties = [];
      const temp = getMethodInvocation(methodInstanceCall, args => {
        const { statePropertiesThatCauseInvocation } = args;
        dependentStateProperties = statePropertiesThatCauseInvocation;
        invocationDependsOnState = (statePropertiesThatCauseInvocation || [])
          .length;
      }, { component: parent });
      if (!invocationDependsOnState) {
        return false;
      }
      const ifstatement = dependentStateProperties
        .map(v => `updates.hasOwnProperty('${v}')`)
        .join(" || ");
      return `if(${ifstatement}) {
        ${temp}
      }`;
    })
    .filter(x => x)
    .join(NEW_LINE);

  return `
  let updated = false;
  let updates = {};
  ${result}
  if(updated) {
    this.setState((state, props) => {
        return updates;
    }, () => {
      // do stuff here;
      ${invocations}
    })
  }
  `;
}
function GetDefaultComponentValue(node, key) {
  let result = ``;
  const graph = GetCurrentGraph(GetState());
  if (typeof node === "string") {
    node = GetNodeById(node, graph);
  }
  const componentInternalApis = [
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
      const dataChain = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.DataChainLink
      }).find(x => x);

      const selector = GetNodesLinkedTo(graph, {
        id: componentInternalApi.id,
        link: LinkType.SelectorLink
      }).find(x => x);

      let innerValue = null;
      const externalKey = GetJSCodeName(componentInternalApi);
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
          innerValue = `DC.${GetCodeName(dataChain, {
            includeNameSpace: true
          })}(${innerValue})`;
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
  const componentExternalApis = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.ComponentExternalApi
  });

  const componentEventHandlers = GetNodesLinkedTo(graph, {
    id: node.id,
    link: LinkType.EventMethod
  });

  const isViewType =
    GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.ViewType;

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
            noDataChain = false;
            break;
          default:
            stateKey = "value";
            break;
        }
      }

      const titleService = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.TitleServiceLink
      }).find(x => x);

      const query = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.QueryLink
      }).find(x => x);

      const dataChain = GetNodesLinkedTo(graph, {
        id: componentExternalApi.id,
        link: LinkType.DataChainLink
      }).find(x => x);

      const selector = GetNodesLinkedTo(graph, {
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
        } else if (options.listItem) {
          const listItemAttribute = GetJSCodeName(externalConnection);
          innerValue = !GetNodeProp(
            externalConnection,
            NodeProperties.AsLocalContext
          )
            ? `this.state.${listItemAttribute}`
            : listItemAttribute;
        } else {
          const defaulComponentValue =
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
      let addiontionalParams;
      if (!noSelector && selector) {
        addiontionalParams =
          componentExternalApi && externalConnection
            ? getUpdateFunctionOption(
              componentExternalApi.id,
              externalConnection.id,
              `, { update: true }/*c => e*/`
            )
            : "";
        if (isViewType) {
          addiontionalParams =
            componentExternalApi && node
              ? getUpdateFunctionOption(node.id, componentExternalApi.id,
                `, { update: true }/*n => c*/`)
              : "";

          innerValue = `S.${GetJSCodeName(
            selector
          )}(${innerValue}, this.state.viewModel${addiontionalParams})`;
        } else {
          //TODO: this might be able to go away;
          innerValue = `S.${GetJSCodeName(
            selector
          )}(${innerValue}, this.state.viewModel${addiontionalParams})`;
        }
      }
      if (!noDataChain && dataChain) {
        innerValue = `DC.${GetCodeName(dataChain, {
          includeNameSpace: true
        })}(${innerValue})`;
      }
      if (innerValue) {
        return `${GetJSCodeName(componentExternalApi)}={${innerValue}}`;
      }
    })
    .filter(x => x);

  const res = componentEventHandlers
    .unique(x => GetJSCodeName(x))
    .map(componentEventHandler => {
      const eventInstances = GetNodesLinkedTo(graph, {
        id: componentEventHandler.id,
        link: LinkType.EventMethodInstance
      });
      return eventInstances
        .map(eventInstance => {
          const eventMethodHandlers = GetNodesLinkedTo(graph, {
            id: eventInstance.id,
            link: LinkType.EventHandler
          });
          const method_calls = eventMethodHandlers.map(eventMethodHandler => {
            const property = GetNodesLinkedTo(graph, {
              id: eventMethodHandler.id,
              link: LinkType.PropertyLink
            }).find(x => x);
            const viewModel = GetNodesLinkedTo(graph, {
              id: eventMethodHandler.id,
              link: LinkType.ViewModelLink
            }).find(x => x);
            const eventType = GetNodeProp(
              eventMethodHandler,
              NodeProperties.EventType
            );
            const useValue = GetNodeProp(
              eventMethodHandler,
              NodeProperties.UseValue
            )
              ? "value"
              : "text";
            const addiontionalParams =
              componentEventHandler && eventInstance
                ? getUpdateFunctionOption(
                  componentEventHandler.id,
                  eventInstance.id,
                  `, { update: true, value: this.state.value/*hard coded*/ }`
                )
                : "";

            let method_call = null;
            const modelProperty = GetJSCodeName(property);
            const screenOrModel = GetNodeProp(
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
                method_call = `this.props.update${screenOrModel}Instance(this.state.viewModel, '${modelProperty}', arg.nativeEvent.${useValue}${addiontionalParams})`;
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
  const componentType = GetNodeProp(node, NodeProperties.ComponentType);
  const uiType = GetNodeProp(node, NodeProperties.UIType);
  if (ComponentTypes[uiType] && ComponentTypes[uiType][componentType]) {
    const { events } = ComponentTypes[uiType][componentType];
    for (var _event in events) {
      switch (_event) {
        case ComponentEvents.onChange:
          result.push(ComponentEventStandardHandler[_event]);
          break;
      }
    }
  }
  result.push(...res);
  return NEW_LINE + result.join(NEW_LINE);
}
export function writeApiProperties(apiConfig) {
  var result = "";
  var res = [];

  if (apiConfig) {
    for (var i in apiConfig) {
      let property = null;
      const {
        instanceType,
        model,
        selector,
        modelProperty,
        apiProperty,
        handlerType,
        isHandler,
        dataChain
      } = apiConfig[i];
      const modelJsName = GetJSCodeName(model) || model;
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
          const codeName = GetCodeName(dataChain, {
            includeNameSpace: true
          });
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
  const screen = GetNodeById(id);
  const screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
  if (screenOptions && screenOptions.length) {
    const reactScreenOption = screenOptions.find(
      x => GetNodeProp(x, NodeProperties.UIType) === language
    );
    if (reactScreenOption) {
      return reactScreenOption;
    }
  }
  return null;
}

export function GetScreenImports(id, language) {
  const screen = GetNodeById(id);
  const screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
  if (screenOptions && screenOptions.length) {
    const reactScreenOption = screenOptions.find(
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
  const graph = GetCurrentGraph(GetState());
  const methods = getNodesByLinkType(graph, {
    id: node.id,
    type: LinkType.LifeCylceMethod,
    direction: TARGET,
    exist: true
  }).filter(x => GetNodeProp(x, NodeProperties.EventType) === evtType);
  const methodInstances = [];
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
  const graph = GetCurrentGraph(GetState());
  const methods = getNodesByLinkType(graph, {
    id: node.id,
    type: LinkType.EventMethod,
    direction: TARGET,
    exist: true
  }).filter(x => GetNodeProp(x, NodeProperties.EventType) === evtType);
  const methodInstances = [];
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
export function getMethodInvocation(methodInstanceCall, callback = () => { }, options = {}) {
  const graph = GetCurrentGraph(GetState());
  const method = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.MethodCall,
    direction: SOURCE
  }).find(x => x);
  const navigationMethod = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.NavigationMethod,
    direction: SOURCE
  }).find(x => x);
  const dataChain = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.DataChainLink,
    direction: SOURCE
  }).find(x => x);

  const internalApiConnection = getNodesByLinkType(graph, {
    id: methodInstanceCall.id,
    type: LinkType.ComponentApi,
    direction: SOURCE
  }).find(x => x);
  const statePropertiesThatCauseInvocation = [];
  if (method) {
    const parts = [];
    const body = getNodesByLinkType(graph, {
      id: method.id,
      type: LinkType.MethodApiParameters,
      direction: TARGET
    }).find(x => GetNodeProp(x, NodeProperties.UriBody));
    const queryObject = getNodesByLinkType(graph, {
      id: method.id,
      type: LinkType.MethodApiParameters,
      direction: TARGET
    }).find(x => GetNodeProp(x, NodeProperties.QueryParameterObject));
    const templateObject = getNodesByLinkType(graph, {
      id: method.id,
      type: LinkType.MethodApiParameters,
      direction: TARGET
    }).find(x => GetNodeProp(x, NodeProperties.TemplateParameter));

    const dataChain = GetNodesLinkedTo(graph, {
      id: methodInstanceCall.id,
      link: LinkType.DataChainLink
    }).find(x => {
      return GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.DataChain;
    });
    const methodInstanceSource = GetNodesLinkedTo(graph, {
      id: methodInstanceCall.id,
      link: LinkType.EventMethodInstance
    }).find(x => {
      return GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.EventMethod;
    });
    let body_input = null;
    if (body) {
      const body_param = getNodesByLinkType(graph, {
        id: body.id,
        type: LinkType.ComponentApiConnection,
        direction: TARGET
      }).find(x => x);
      if (body_param) {
        const body_selector = getNodesByLinkType(graph, {
          id: body_param.id,
          type: LinkType.ComponentApiConnection,
          direction: SOURCE
        }).find(
          x_temp =>
            GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.Selector
        );
        let innervalue = "";
        if (body_selector) {
          const addiontionalParams = getUpdateFunctionOption(
            methodInstanceSource ? methodInstanceSource.id : null,
            methodInstanceCall ? methodInstanceCall.id : null,
            `, { update: true }/*m => mi*/`
          );

          innervalue = `S.${GetJSCodeName(
            body_selector
          )}(this.state.value, this.state.viewModel${addiontionalParams})`;
        }
        const body_value = getNodesByLinkType(graph, {
          id: body_param.id,
          type: LinkType.ComponentApiConnection,
          direction: SOURCE
        }).find(
          x_temp =>
            GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.DataChain
        );
        if (body_value) {
          body_input = `body: DC.${GetCodeName(body_value, {
            includeNameSpace: true
          })}(${innervalue})`;
        }
      }
      if (body_input) {
        parts.push(`${body_input}`);
      }
    }
    if (templateObject) {
      const templateParameters = GetNodesLinkedTo(graph, {
        id: templateObject.id,
        type: LinkType.MethodApiParameters,
        direction: SOURCE
      }).filter(x => GetNodeProp(x, NodeProperties.TemplateParameter));

      const queryParameterValues = templateParameters
        .map(queryParameter => {
          return extractApiJsCode({
            node: queryParameter,
            options,
            graph,
            callback: list => {
              statePropertiesThatCauseInvocation.push(...list);
            }
          });
        })
        .filter(temp => temp);
      parts.push(
        `template: {${addNewLine(queryParameterValues.join(", " + NEW_LINE))}}`
      );
    }
    if (queryObject) {
      const queryParameters = getNodesByLinkType(graph, {
        id: queryObject.id,
        type: LinkType.MethodApiParameters,
        direction: SOURCE
      }).filter(x => GetNodeProp(x, NodeProperties.QueryParameterParam));

      const queryParameterValues = queryParameters
        .map(queryParameter => {
          return extractApiJsCode({
            node: queryParameter,
            graph,
            options,
            internalApiConnection,
            callback: list => {
              statePropertiesThatCauseInvocation.push(...list);
            }
          });
        })
        .filter(temp => temp);
      parts.push(
        `query: {${addNewLine(queryParameterValues.join(", " + NEW_LINE))}}`
      );
    }
    if (callback) {
      callback({ statePropertiesThatCauseInvocation });
    }
    let dataChainInput = "";
    if (dataChain) {
      dataChainInput =
        (parts.length ? "," : "") +
        `dataChain: DC.${GetCodeName(dataChain, {
          includeNameSpace: true
        })}`;
    }
    const query = parts.join();
    return `this.props.${GetJSCodeName(method)}({${query}${dataChainInput}});`;
  } else if (navigationMethod) {
    return `this.props.${GetNodeProp(
      navigationMethod,
      NodeProperties.NavigationAction
    )}();`;
  } else if (dataChain) {
    //Buttons need to use this.state.value, so a new property for datachains should exist.
    if (internalApiConnection) {
      return `DC.${GetCodeName(dataChain, {
        includeNameSpace: true
      })}(this.state.${GetJSCodeName(internalApiConnection)});`;
    }
    return `DC.${GetCodeName(dataChain, {
      includeNameSpace: true
    })}(value);`;
  }
}

export function getUpdateFunctionOption(
  methodId,
  methodInstanceCallId,
  addParams
) {
  let addiontionalParams = "";
  if (methodId && methodInstanceCallId) {
    const linkBetweenNodes = GetLinkBetween(
      methodId,
      methodInstanceCallId,
      GetCurrentGraph()
    );
    if (linkBetweenNodes) {
      const instanceUpdate = GetLinkProperty(
        linkBetweenNodes,
        LinkPropertyKeys.InstanceUpdate
      );
      if (instanceUpdate) {
        addiontionalParams = addParams || `, { update: true }/*getUpdateFunctionOption*/`;
      }
    }
  }
  return addiontionalParams;
}
export function GetComponentDidUpdate(parent, options = {}) {
  const { isScreen } = options;
  let describedApi = "";
  if (parent) {
    describedApi = WriteDescribedStateUpdates(parent).trim();
  }
  const componentDidMount = GetComponentDidMount(parent, {
    skipOutOfBand: true,
    skipSetGetState: true
  });
  const componentDidUpdate =
    `componentDidUpdate(prevProps) {
        this.captureValues(prevProps);
      }
      ` +
    (!isScreen ? componentDidMount : "") +
    `
      captureValues(prevProps){
        ${describedApi}
      }`;

  return componentDidUpdate;
}
export function GetComponentDidMount(screenOption, options = {}) {
  const events = GetNodeProp(screenOption, NodeProperties.ComponentDidMountEvent);
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
  const methodInstances = getMethodInstancesForLifeCylcEvntType(
    screenOption,
    ComponentLifeCycleEvents.ComponentDidMount
  );

  const invocations = (methodInstances || [])
    .map(methodInstanceCall => {
      let invocationDependsOnState = false;
      const temp = getMethodInvocation(methodInstanceCall, args => {
        const { statePropertiesThatCauseInvocation } = args;
        invocationDependsOnState = (statePropertiesThatCauseInvocation || [])
          .length;
      }, { screenOption });
      if (invocationDependsOnState) {
        return false;
      }
      return temp;
    })
    .filter(x => x)
    .join(NEW_LINE);

  const componentDidMount = `componentDidMount(value) {
        ${options.skipSetGetState ? "" : `this.props.setGetState();`}
        this.captureValues({});
        ${options.skipOutOfBand ? "" : outOfBandCall}
        ${invocations}
{{handles}}
}
`;
  let evntHandles = [];
  if (events && events.length) {
    evntHandles = events
      .map(evt => {
        const methodNode = GetNodeById(evt);
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
  const template = `<Route path={routes.{{route_name}}} render={({ match, history, location }) => {
    console.log(match.params);
    let {{{screenApiParams}}} = match.params;
    {{overrides}}
    setParameters({{{screenApiParams}}});
    return <{{component}} {{screenApi}} />}} />
  }`;
  const routefile = fs.readFileSync(
    "./app/templates/electronio/routes.tpl",
    "utf8"
  );
  const import_ = `import {{name}} from './screens/{{jsname}}';`;
  const routes = [];
  const _screens = [];
  screens.map(screen => {
    const screenApis = getNodesByLinkType(GetCurrentGraph(), {
      id: screen.id,
      type: LinkType.ComponentExternalApi,
      direction: SOURCE
    });
    const screenApi = screenApis
      .map(v => `${GetJSCodeName(v)}={${GetJSCodeName(v)}}`)
      .join(" ");
    const viewModel = screenApis.find(x => GetNodeTitle(x) === "viewModel");
    let overrides = "";
    if (viewModel) {
      const viewModelDataLink = getNodesByLinkType(GetCurrentGraph(), {
        id: viewModel.id,
        type: LinkType.DataChainLink,
        direction: SOURCE
      }).find(x => x);
      if (viewModelDataLink) {
        overrides = `viewModel = DC.${GetCodeName(viewModelDataLink, {
          includeNameSpace: true
        })}();`;
      }
    }
    const screenApiParams = screenApis.map(v => `${GetJSCodeName(v)}`).join();

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
  const routeFile = bindTemplate(routefile, {
    routes: routes.sort((a, b) => b.length - a.length).join(NEW_LINE),
    route_imports: _screens.join(NEW_LINE)
  });
  return {
    template: routeFile,
    relative: "./src",
    relativeFilePath: `./Routes.tsx`,
    name: `Routes.tsx`
  };
}
export function BindScreensToTemplate(language = UITypes.ReactNative) {
  var screens = GetScreens();
  let template = fs.readFileSync("./app/templates/screens/screen.tpl", "utf8");
  const moreresults = [];
  let fileEnding = ".js";
  switch (language) {
    case UITypes.ElectronIO:
      fileEnding = ".tsx";
      break;
  }

  const result = screens
    .map(screen => {
      const screenOptions = GetConnectedScreenOptions(screen.id);
      if (screenOptions && screenOptions.length) {
        const reactScreenOption = screenOptions.find(
          x => GetNodeProp(x, NodeProperties.UIType) === language
        );
        if (reactScreenOption) {
          template = GenerateScreenMarkup(screen.id, language);
          const screenOptionSrc = GenerateScreenOptionSource(
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
        relativeFilePath: `./${GetCodeName(
          screen
        ).toJavascriptName()}${fileEnding}`,
        name: GetCodeName(screen)
      };
    })
    .filter(x => x);
  switch (language) {
    case UITypes.ElectronIO:
      moreresults.push(GenerateElectronIORoutes(screens));
      break;
  }
  const all_nodes = NodesByType(GetState(), [NodeTypes.ComponentNode]);
  const sharedComponents = all_nodes.filter(x =>
    GetNodeProp(x, NodeProperties.SharedComponent)
  );
  const relPath = "./src/shared";
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

/**
 * Links the api together.
 * @param {object} args
 */
function extractApiJsCode(args = { node, graph }) {
  let { node, graph } = args;
  const { options, callback = () => { } } = args;
  const requiredChanges = [];
  const temp = queryParameter => {
    const param = getNodesByLinkType(graph, {
      id: queryParameter.id,
      type: LinkType.ComponentApiConnection,
      direction: TARGET
    }).filter(item => {
      const { screenOption, component } = options;
      return GetNodesLinkedTo(null, {
        id: item.id,
        link: LinkType.ComponentApiConnector
      }).find(instanceEvent => {
        return [...GetNodesLinkedTo(null, {
          id: instanceEvent.id,
          link: LinkType.LifeCylceMethodInstance
        }), ...GetNodesLinkedTo(null, {
          id: instanceEvent.id,
          link: LinkType.EventMethodInstance
        })].find(lifeCycleMethod => {
          return (screenOption && existsLinkBetween(graph, {
            source: lifeCycleMethod.id,
            target: screenOption.id
          })) || (component && existsLinkBetween(graph, {
            source: lifeCycleMethod.id,
            target: component.id
          }))
        })
      });
    }).filter(x => {

      return x;
    }).find(x_temp => x_temp);

    if (param) {
      const internalApiConnection = getNodesByLinkType(graph, {
        id: param.id,
        type: LinkType.ComponentApi,
        direction: SOURCE
      }).find(x => x);

      const value = getNodesByLinkType(graph, {
        id: param.id,
        type: LinkType.ComponentApiConnection,
        direction: SOURCE
      }).find(
        x_temp =>
          GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.DataChain
      );
      if (value) {
        let input_ = "this.props.state";
        if (internalApiConnection) {
          requiredChanges.push(GetJSCodeName(internalApiConnection));
          input_ = `this.state.${GetJSCodeName(internalApiConnection)}`;
        }
        return `${GetJSCodeName(queryParameter)}: DC.${GetCodeName(value, {
          includeNameSpace: true
        })}(${input_})`;
      } else if (internalApiConnection) {
        requiredChanges.push(GetJSCodeName(internalApiConnection));
        const input_ = `this.state.${GetJSCodeName(internalApiConnection)}`;
        return `${GetJSCodeName(queryParameter)}:  ${input_}`;
      }
      else {
      }
    }
  };
  const result = temp(node);
  callback(requiredChanges.unique());
  return result;
}
