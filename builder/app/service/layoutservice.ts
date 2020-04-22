import { UITypes, NEW_LINE, NodeTypes } from '../constants/nodetypes';
import { GetNodeById, NodeProperties, GetNodeProp, GetCodeName } from '../actions/uiactions';
import { GenerateMarkupTag, ConvertViewTypeToComponentNode, GetStylesFor } from './screenservice';
import { GetCellProperties, getComponentProperty } from '../methods/graph_methods';
import { InstanceTypes } from '../constants/componenttypes';
import { addNewLine } from '../utils/array';
import * as GraphMethods from '../methods/graph_methods';

export function GetPropertyConsts(id: string, language = UITypes.ReactNative) {
	const node = GetNodeById(id);
	const layout = GetNodeProp(node, NodeProperties.Layout);
	const components = GetNodeComponents(layout);
	return components.map((v: GraphMethods.Node | null) => ConvertViewTypeToComponentNode(v, language)).unique();
}

export function GetModelConsts(id: string, language = UITypes.ReactNative) {
	const node = GetNodeById(id);
	const layout = GetNodeProp(node, NodeProperties.Layout);
	return GetNodeComponentsKeys(layout)
		.map((cell: string | number) => {
			const cellProperties = GetCellProperties(layout, cell);

			if (cellProperties && cellProperties.cellModel) {
				return cellProperties.cellModel[cell];
			}
		})
		.filter((x: any) => x)
		.map((v: GraphMethods.Node | null) => ConvertViewTypeToComponentNode(v, language))
		.unique();
}

export function GetModelPropertyConsts(id: string, language = UITypes.ReactNative) {
	const node = GetNodeById(id);
	const layout = GetNodeProp(node, NodeProperties.Layout);
	return GetNodeComponentsKeys(layout)
		.map((cell: string | number) => {
			// console.log(cell);
			const cellProperties = GetCellProperties(layout, cell);
			// console.log(cellProperties);

			if (cellProperties && cellProperties.cellModelProperty) {
				return cellProperties.cellModelProperty[cell];
			}
		})
		.filter((x: any) => x)
		.map((v: GraphMethods.Node | null) => ConvertViewTypeToComponentNode(v, language))
		.unique();
}

export function GetRNModelInstances(id: string) {
	const node = GetNodeById(id);
	const layout = GetNodeProp(node, NodeProperties.Layout);
	const componentProperties = GetNodeProp(node, NodeProperties.ComponentProperties);
	return GetNodeComponentsKeys(layout)
		.map((cell: string | number) => {
			// console.log(componentProperties);
			const cellProperties = GetCellProperties(layout, cell);
			// console.log(cellProperties);
			// let loginModel = GetScreenInstance(state, ScreenInstances.LoginForm, const_loginModel) || CreateDefaultLoginModel();
			if (cellProperties && cellProperties.cellModel && cellProperties.cellModel[cell]) {
				const instanceType = getComponentProperty(
					componentProperties,
					cellProperties.cellModel[cell],
					'instanceTypes'
				);
				if (
					instanceType != InstanceTypes.PropInstance &&
					instanceType != InstanceTypes.ScreenParam &&
					instanceType
				)
					return `let ${cellProperties.cellModel[cell]} = Get${instanceType}(${instanceType}.${GetCodeName(
						id
					)}, const_${cellProperties.cellModel[cell]}) || {};`; // CreateDefault${GetCodeName(id)}()
			}
		})
		.filter((x: any) => x)
		.unique();
}

export function GetRNConsts(id: any) {
	const prop_consts: any = []; // GetPropertyConsts(id);
	const model_consts: any = []; // GetModelConsts(id);
	const model_propconsts: any = []; // GetModelPropertyConsts(id);

	return [
		...prop_consts.map(
			(x: any) =>
				`const const_${(GetCodeName(x) || '').toJavascriptName()} = '${(GetCodeName(x) || '')
					.toJavascriptName()}';`
		),
		...model_consts.map((x: any) => GetRNModelConst(x)),
		...model_propconsts.map(
			(x: any) =>
				`const const_${(GetCodeName(x) || '').toJavascriptName()} = '${(GetCodeName(x) || '')
					.toJavascriptName()}';`
		)
	];
}

export function GetRNModelConst(x: any) {
	return `const const_${(x || '').toJavascriptName()} = '${(x || '').toJavascriptName()}';`;
}
export function GetRNModelConstValue(x: any) {
	return `const_${(x || '').toJavascriptName()}`;
}

export function GetNodeComponents(layoutObj: any, item?: any, currentRoot?: any) {
	let imports: any = [];
	if (!layoutObj) {
		return imports;
	}
	const { layout, properties } = layoutObj;
	if (!currentRoot) {
		currentRoot = layout;
	}

	Object.keys(currentRoot).map((item) => {
		imports = [ ...imports, ...GetNodeComponents(layoutObj, item, currentRoot[item]) ];
		if (properties[item]) {
			const children = properties[item].children || {};
			if (children[item]) imports.push(children[item]);
		}
	});

	return imports;
}
export function GetNodeComponentsKeys(layoutObj: any, item?: any, currentRoot?: any) {
	let imports: any = [];
	if (!layoutObj) {
		return imports;
	}

	const { layout, properties } = layoutObj;
	if (!currentRoot) {
		currentRoot = layout;
	}

	Object.keys(currentRoot).map((item) => {
		imports = [ ...imports, ...GetNodeComponentsKeys(layoutObj, item, currentRoot[item]) ];
		if (properties[item]) {
			const children = properties[item].children || {};
			if (children[item]) imports.push(item);
		}
	});

	return imports;
}

export function buildLayoutTree(args: {
	layoutObj: any;
	currentRoot: any;
	language: any;
	imports: any;
	node: any;
	section?: any;
	css: any;
}) {
	let { layoutObj, currentRoot, language, imports = [], node = null, css, section = 'section' } = args;
	const result: (string | undefined)[] = [];
	const { layout, properties } = layoutObj;
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
		if (section !== 'section') {
			css[`${section}_${index}`].parent = section;
		}
	});
	if (css[`${section}`]) {
		css[`${section}`].children = Object.keys(currentRoot).map((_, index) => `${section}_${index}`);
	}
	return result;
}
export function createSection(args: {
	layoutObj: any;
	item: any;
	currentRoot: any;
	index: any;
	css: any;
	language: any;
	imports: any;
	node: any;
	section: any;
}) {
	const { layoutObj, item, currentRoot, index, language, imports, node, section, css } = args;
	const { properties } = layoutObj;
	const style = properties[item].style || {};
	const children: any = properties[item].children || {};
	const cellModel: any = properties[item].cellModel || {};
	const cellRoot: any = (properties[item].cellRoot = {});
	const layoutProperties: any = properties[item].properties || {};
	const cellModelProperty: any = properties[item].cellModelProperty || {};
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
		if (!imports.some((v: any) => v === children[item])) imports.push(children[item]);
		tree = [
			addNewLine(
				GenerateMarkupTag(
					GetNodeById(children[item]),
					language,
					node
					// , {
					// 	children,
					// 	cellModel,
					// 	cellModelProperty,
					// 	item
					// }
				),
				2
			)
		];
	}

	const _style = {
		...style
	};
	[
		'borderStyle',
		'borderWidth',
		'borderColor',
		...(language === UITypes.ReactNative ? [] : [ 'display', 'flex' ])
	].forEach((t) => {
		delete _style[t];
	});
	Object.keys(_style).map((t) => {
		if (_style[t] === null) {
			delete _style[t];
		}
	});
	if (layoutProperties && layoutProperties.tags && layoutProperties.tags.length) {
		// _style.gridArea = layoutProperties.tags[0];
	}
	css[section] = { style: { ..._style } };
	let control = 'View';
	let className = '';
	let tagclasses = '';
	let tagBasedStyles = '';
	switch (language) {
		case UITypes.ReactNative:
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			if (Object.keys(_style).length < 2 || cellRoot[item]) {
				// return tree.tightenPs();
			}
			switch (GetNodeProp(node, NodeProperties.ComponentType)) {
				case 'Form':
					control = GetNodeProp(node, NodeProperties.ComponentType);
					break;
				default:
					const nodeType = GetNodeProp(node, NodeProperties.NODEType);
					const isScreenOption = nodeType === NodeTypes.ScreenOption;
					if (isScreenOption) {
						control = 'div';
					}
					break;
			}
			if (layoutProperties && layoutProperties.componentType) {
				control = layoutProperties.componentType;
			}
			if (UITypes.ReactNative !== language) {
				if (layoutProperties && layoutProperties.tags && Object.keys(layoutProperties.tags).length) {
					tagclasses = layoutProperties.tags.join(' ');
					tagBasedStyles = layoutProperties.tags
						.map((tag: any) => GetStylesFor(node, tag).join(' '))
						.filter((x: any) => x)
						.join(' ');
				}
				if (UITypes.ReactWeb === language) {
					className = `className={\`${tagBasedStyles} ${tagclasses} \`}`;
				} else {
					className = `className={\`$\{styles.${section}} ${tagBasedStyles} ${tagclasses} \`}`;
				}
			} else {
				className = `style={${JSON.stringify({ ..._style }, null, 4)}}`;
			}
			return `
<${control} ${className} >
${addNewLine(tree.tightenPs())}
</${control}>
            `;
		default:
			break;
	}
}
