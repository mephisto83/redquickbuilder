import { UITypes, NEW_LINE, NodeTypes } from "../constants/nodetypes";
import {
  GetNodeById,
  NodeProperties,
  GetNodeProp,
  GetCodeName
} from "../actions/uiactions";
import {
  GenerateMarkupTag,
  ConvertViewTypeToComponentNode,
  GetStylesFor
} from "./screenservice";
import {
  GetCellProperties,
  getComponentProperty
} from "../methods/graph_methods";
import { InstanceTypes } from "../constants/componenttypes";
import { addNewLine } from "../utils/array";

export function GetPropertyConsts(id, language = UITypes.ReactNative) {
  let node = GetNodeById(id);
  let layout = GetNodeProp(node, NodeProperties.Layout);
  let components = GetNodeComponents(layout);
  return components.map(ConvertViewTypeToComponentNode).unique();
}

export function GetModelConsts(id, language = UITypes.ReactNative) {
  let node = GetNodeById(id);
  let layout = GetNodeProp(node, NodeProperties.Layout);
  return GetNodeComponentsKeys(layout)
    .map(cell => {
      let cellProperties = GetCellProperties(layout, cell);

      if (cellProperties && cellProperties.cellModel) {
        return cellProperties.cellModel[cell];
      }
    })
    .filter(x => x)
    .map(ConvertViewTypeToComponentNode)
    .unique();
}

export function GetModelPropertyConsts(id, language = UITypes.ReactNative) {
  let node = GetNodeById(id);
  let layout = GetNodeProp(node, NodeProperties.Layout);
  return GetNodeComponentsKeys(layout)
    .map(cell => {
      //console.log(cell);
      let cellProperties = GetCellProperties(layout, cell);
      // console.log(cellProperties);

      if (cellProperties && cellProperties.cellModelProperty) {
        return cellProperties.cellModelProperty[cell];
      }
    })
    .filter(x => x)
    .map(ConvertViewTypeToComponentNode)
    .unique();
}

export function GetRNModelInstances(id) {
  let node = GetNodeById(id);
  let layout = GetNodeProp(node, NodeProperties.Layout);
  let componentProperties = GetNodeProp(
    node,
    NodeProperties.ComponentProperties
  );
  return GetNodeComponentsKeys(layout)
    .map(cell => {
      // console.log(componentProperties);
      let cellProperties = GetCellProperties(layout, cell);
      // console.log(cellProperties);
      // let loginModel = GetScreenInstance(state, ScreenInstances.LoginForm, const_loginModel) || CreateDefaultLoginModel();
      if (
        cellProperties &&
        cellProperties.cellModel &&
        cellProperties.cellModel[cell]
      ) {
        let instanceType = getComponentProperty(
          componentProperties,
          cellProperties.cellModel[cell],
          "instanceTypes"
        );
        if (
          instanceType != InstanceTypes.PropInstance &&
          instanceType != InstanceTypes.ScreenParam &&
          instanceType
        )
          return `let ${
            cellProperties.cellModel[cell]
            } = Get${instanceType}(${instanceType}.${GetCodeName(id)}, const_${
            cellProperties.cellModel[cell]
            }) || {};`; // CreateDefault${GetCodeName(id)}()
      }
    })
    .filter(x => x)
    .unique();
}

export function GetRNConsts(id) {
  let prop_consts = []; // GetPropertyConsts(id);
  let model_consts = []; // GetModelConsts(id);
  let model_propconsts = []; //GetModelPropertyConsts(id);

  return [
    ...prop_consts.map(x => {
      return `const const_${(GetCodeName(x) || "").toJavascriptName()} = '${(
        GetCodeName(x) || ""
      ).toJavascriptName()}';`;
    }),
    ...model_consts.map(x => {
      return GetRNModelConst(x);
    }),
    ...model_propconsts.map(x => {
      return `const const_${(GetCodeName(x) || "").toJavascriptName()} = '${(
        GetCodeName(x) || ""
      ).toJavascriptName()}';`;
    })
  ];
}

export function GetRNModelConst(x) {
  return `const const_${(x || "").toJavascriptName()} = '${(
    x || ""
  ).toJavascriptName()}';`;
}
export function GetRNModelConstValue(x) {
  return `const_${(x || "").toJavascriptName()}`;
}

export function GetNodeComponents(layoutObj, item, currentRoot) {
  let imports = [];
  if (!layoutObj) {
    return imports;
  }
  let { layout, properties } = layoutObj;
  if (!currentRoot) {
    currentRoot = layout;
  }

  Object.keys(currentRoot).map(item => {
    imports = [
      ...imports,
      ...GetNodeComponents(layoutObj, item, currentRoot[item])
    ];
    if (properties[item]) {
      let children = properties[item].children || {};
      if (children[item]) imports.push(children[item]);
    }
  });

  return imports;
}
export function GetNodeComponentsKeys(layoutObj, item, currentRoot) {
  let imports = [];
  if (!layoutObj) {
    return imports;
  }

  let { layout, properties } = layoutObj;
  if (!currentRoot) {
    currentRoot = layout;
  }

  Object.keys(currentRoot).map(item => {
    imports = [
      ...imports,
      ...GetNodeComponentsKeys(layoutObj, item, currentRoot[item])
    ];
    if (properties[item]) {
      let children = properties[item].children || {};
      if (children[item]) imports.push(item);
    }
  });

  return imports;
}

export function buildLayoutTree(args) {
  let {
    layoutObj,
    currentRoot,
    language,
    imports = [],
    node = null,
    css,
    section = "section"
  } = args;
  let result = [];
  let { layout, properties } = layoutObj;
  if (!currentRoot) {
    currentRoot = layout;
  }
  Object.keys(currentRoot).map((item, index) => {
    result.push(
      createSection({
        layoutObj,
        item,
        currentRoot: currentRoot[item],
        index: index + 1,
        css,
        language,
        imports,
        node,
        section: `${section}_${index}`
      })
    );
    if (section !== "section") {
      css[`${section}_${index}`].parent = section;
    }
  });
  if (css[`${section}`]) {
    css[`${section}`].children = Object.keys(currentRoot).map(
      (_, index) => `${section}_${index}`
    );
  }
  return result;
}
export function createSection(args) {
  let {
    layoutObj,
    item,
    currentRoot,
    index,
    language,
    imports,
    node,
    section,
    css
  } = args;
  let { properties } = layoutObj;
  let style = properties[item].style || {};
  let children = properties[item].children || {};
  let cellModel = properties[item].cellModel || {};
  let cellRoot = (properties[item].cellRoot = {});
  let layoutProperties = properties[item].properties || {};
  let cellModelProperty = properties[item].cellModelProperty || {};
  let tree = Object.keys(currentRoot).length
    ? buildLayoutTree({
      layoutObj,
      currentRoot,
      language,
      imports,
      node,
      section,
      css
    })
    : [];
  if (children && children[item]) {
    if (!imports.some(v => v === children[item])) imports.push(children[item]);
    tree = [
      addNewLine(
        GenerateMarkupTag(GetNodeById(children[item]), language, node, {
          children,
          cellModel,
          cellModelProperty,
          item
        }),
        2
      )
    ];
  }

  let _style = { ...style };
  ["borderStyle", "borderWidth", "borderColor"].map(t => {
    delete _style[t];
  });
  Object.keys(_style).map(t => {
    if (_style[t] === null) {
      delete _style[t];
    }
  });
  css[section] = { style: { ..._style } };
  let control = "View";
  let className = "";
  let tagBasedStyles = "";
  switch (language) {
    case UITypes.ReactNative:
    case UITypes.ElectronIO:
      if (Object.keys(_style).length < 2 || cellRoot[item]) {
        // return tree.tightenPs();
      }
      switch (GetNodeProp(node, NodeProperties.ComponentType)) {
        case "Form":
          control = GetNodeProp(node, NodeProperties.ComponentType);
          break;
        default:
          let nodeType = GetNodeProp(node, NodeProperties.NODEType);
          let isScreenOption = nodeType === NodeTypes.ScreenOption;
          if (isScreenOption) {
            control = "Content";
          }
          break;
      }
      if (layoutProperties && layoutProperties.componentType) {
        control = layoutProperties.componentType;
      }
      if (UITypes.ReactNative !== language) {
        if (
          layoutProperties &&
          layoutProperties.tags &&
          Object.keys(layoutProperties.tags).length
        ) {

          tagBasedStyles = layoutProperties.tags
            .map(tag => {
              return GetStylesFor(node, tag).join(' ');
            })
            .filter(x => x).join(' ');
        }
        className = `className={\`$\{styles.${section}} ${tagBasedStyles} \`}`;
      } else {
        className = `style={${JSON.stringify({ ..._style }, null, 4)}}`;
      }
      return `
<${control} ${className} >
${addNewLine(tree.tightenPs())}
</${control}>
            `;
    default: break;
  }
}
