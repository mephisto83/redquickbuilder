import { UITypes, NEW_LINE } from "../constants/nodetypes";
import { GetNodeById, NodeProperties, GetNodeProp, GetCodeName } from "../actions/uiactions";
import { GenerateMarkupTag } from "./screenservice";
import { GetCellProperties, getComponentProperty } from "../methods/graph_methods";


export function GetPropertyConsts(id, language = UITypes.ReactNative) {
    let node = GetNodeById(id);
    let layout = GetNodeProp(node, NodeProperties.Layout);
    let components = GetNodeComponents(layout);
    return components;
}

export function GetModelConsts(id, language = UITypes.ReactNative) {
    let node = GetNodeById(id);
    let layout = GetNodeProp(node, NodeProperties.Layout);
    return GetNodeComponentsKeys(layout).map(cell => {
        //console.log(cell);
        let cellProperties = GetCellProperties(layout, cell);
        console.log(cellProperties);

        if (cellProperties && cellProperties.cellModel) {
            return cellProperties.cellModel[cell];
        }
    }).filter(x => x).unique();
}

export function GetModelPropertyConsts(id, language = UITypes.ReactNative) {
    let node = GetNodeById(id);
    let layout = GetNodeProp(node, NodeProperties.Layout);
    return GetNodeComponentsKeys(layout).map(cell => {
        //console.log(cell);
        let cellProperties = GetCellProperties(layout, cell);
        // console.log(cellProperties);

        if (cellProperties && cellProperties.cellModelProperty) {
            return cellProperties.cellModelProperty[cell];
        }
    }).filter(x => x).unique();
}

export function GetRNModelInstances(id) {
    let node = GetNodeById(id);
    let layout = GetNodeProp(node, NodeProperties.Layout);
    let componentProperties = GetNodeProp(node, NodeProperties.ComponentProperties)
    return GetNodeComponentsKeys(layout).map(cell => {
        // console.log(componentProperties);
        let cellProperties = GetCellProperties(layout, cell);
        // console.log(cellProperties);
        // let loginModel = GetScreenInstance(state, ScreenInstances.LoginForm, const_loginModel) || CreateDefaultLoginModel();
        if (cellProperties &&
            cellProperties.cellModel &&
            cellProperties.cellModel[cell]) {
            let instanceType = getComponentProperty(componentProperties, cellProperties.cellModel[cell], 'instanceTypes');
            return `let ${(cellProperties.cellModel[cell])} = Get${instanceType}(state, ${instanceType}.${GetCodeName(id)}, const_${(cellProperties.cellModel[cell])}) || {};` // CreateDefault${GetCodeName(id)}()
        }
    }).filter(x => x).unique();
}

export function GetRNConsts(id) {
    let prop_consts = GetPropertyConsts(id);
    let model_consts = GetModelConsts(id);
    let model_propconsts = GetModelPropertyConsts(id);

    return [...prop_consts.map(x => {
        return `const const_${(GetCodeName(x) || '').toJavascriptName()} = '${(GetCodeName(x) || '').toJavascriptName()}';`
    }), ...model_consts.map(x => {
        return GetRNModelConst(x);
    }), ...model_propconsts.map(x => {
        return `const const_${(GetCodeName(x) || '').toJavascriptName()} = '${(GetCodeName(x) || '').toJavascriptName()}';`
    })]
}

export function GetRNModelConst(x) {
    return `const const_${(x || '').toJavascriptName()} = '${(x || '').toJavascriptName()}';`
}
export function GetRNModelConstValue(x) {
    return `const_${(x || '').toJavascriptName()}`;
}

export function GetNodeComponents(layoutObj, item, currentRoot) {
    let imports = [];
    if (!layoutObj) { return imports; }
    let { layout, properties } = layoutObj;
    if (!currentRoot) {
        currentRoot = layout;
    }

    Object.keys(currentRoot).map((item) => {
        imports = [...imports, ...GetNodeComponents(layoutObj, item, currentRoot[item])];
        if (properties[item]) {
            let children = properties[item].children || {};
            if (children[item])
                imports.push(children[item]);
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

    Object.keys(currentRoot).map((item) => {
        imports = [...imports, ...GetNodeComponentsKeys(layoutObj, item, currentRoot[item])];
        if (properties[item]) {
            let children = properties[item].children || {};
            if (children[item])
                imports.push(item);
        }
    });

    return imports;
}

export function buildLayoutTree(layoutObj, currentRoot, language, imports = [], node = null) {
    let result = [];
    let { layout, properties } = layoutObj;
    if (!currentRoot) {
        currentRoot = layout;
    }
    Object.keys(currentRoot).map((item, index) => {
        result.push(createSection(layoutObj, item, currentRoot[item], index + 1, language, imports, node));
    })
    return result;
}
export function createSection(layoutObj, item, currentRoot, index, language, imports, node) {
    let { properties } = layoutObj;
    let style = properties[item].style || {};
    let children = properties[item].children || {};
    let cellModel = properties[item].cellModel || {};
    let cellModelProperty = properties[item].cellModelProperty || {};
    // <UserName value={loginModel.userName} onChange={value => {
    //     this.props.updateScreenInstance(ScreenInstances.LoginForm, const_loginModel, const_userName, value);
    // }} />
    let tree = Object.keys(currentRoot).length ? buildLayoutTree(layoutObj, currentRoot, language, imports, node) : [];
    if (children && children[item]) {
        imports.push(children[item]);
        tree = [addNewLine(GenerateMarkupTag(GetNodeById(children[item]), language, node, {
            children,
            cellModel,
            cellModelProperty,
            item
        }), 2)];
    }

    let _style = { ...style };
    ["borderStyle", "borderWidth", "borderColor", 'display'].map(t => {
        delete _style[t];
    });
    // _style.backgroundColor = '#' + ('dd4b39-3a405a-553d36-684a52-857885-94e8b4-72bda3-5e8c61-4e6151-3b322c-cfdbd5-e8eddf-f5cb5c-242423-333533'.split('-')[Math.floor(Math.random() * 5)]);
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
    return ((str ? NEW_LINE : '') + (str || '')).split(NEW_LINE).join(NEW_LINE + spaces)
}