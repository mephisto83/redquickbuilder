/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
/* eslint-disable default-case */
import fs from 'fs';
import path from 'path';
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
	GetLinkProperty,
	GetDataChainArgs,
	GetComponentInternalApiNode,
	GetComponentInternalApiNodes,
	GetComponentApiNodes,
	GetEventArguments,
	GetCssName
} from '../actions/uiactions';
import * as GraphMethods from '../methods/graph_types';
import { bindTemplate } from '../constants/functiontypes';
import {
	NodeProperties,
	UITypes,
	NEW_LINE,
	NodeTypes,
	LinkType,
	ProgrammingLanguages,
	LinkPropertyKeys,
	MediaQueries,
	StyleNodeProperties,
	LinkProperties,
	EventArgumentTypes
} from '../constants/nodetypes';
import {
	buildLayoutTree,
	GetNodeComponents,
	GetRNConsts,
	GetRNModelInstances,
	GetRNModelConst,
	GetRNModelConstValue
} from './layoutservice';
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
	ComponentTypeKeys,
	ComponentTags
} from '../constants/componenttypes';
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
	existsLinkBetween,
	GetNodeLinkedTo
} from '../methods/graph_methods';
import { HandlerType } from '../components/titles';
import { addNewLine } from '../utils/array';
import { StyleLib } from '../constants/styles';
import { ViewTypes } from '../constants/viewtypes';
import { RouteSource, RouteSourceType } from '../interface/methodprops';
import { constructCellStyles } from './sharedservice';

export function GenerateScreens(options: { language: any }) {
	const { language } = options;
	const temps = BindScreensToTemplate(language || UITypes.ReactNative);
	const result: any = {};

	temps.map((t) => {
		result[path.join(t.relative, t.name)] = t;
	});

	return result;
}

export function GenerateScreenMarkup(id: string, language: string) {
	const screen = GetNodeById(id);
	const screenOption = GetScreenOption(id, language);
	if (screenOption) {
		const imports: any = GetScreenImports(id, language);

		const elements: any = [ GenerateMarkupTag(screenOption, language, screen) ];
		let template = null;
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				template = fs.readFileSync('./app/templates/screens/el_screen.tpl', 'utf8');
				break;
			case UITypes.ReactNative:
			default:
				template = fs.readFileSync('./app/templates/screens/rn_screen.tpl', 'utf8');
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

export function GenerateScreenOptionSource(node: any, parent: any, language: string) {
	switch (language) {
		case UITypes.ReactNative:
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			return GenerateRNScreenOptionSource(node, null, language);
	}
}

export function GetDefaultElement(language?: string) {
	return '<View><Text>DE</Text></View>';
}
export function GetItemRender(node: { id: any }, imports: (string | undefined)[], language: any) {
	const listItemNode = GetListItemNode(node.id);
	imports.push(GenerateComponentImport(listItemNode, node, language));
	const properties = WriteDescribedApiProperties(listItemNode, {
		listItem: true
	});
	return `({item, index, separators, key}: any)=>{
    let value = item;
    return  <${GetCodeName(
		listItemNode
	)} ${properties}  key={item && item.id !== undefined && item.id !== null  ? item.id : item}/>
  }`;
}
export function GetFormRender(node: { id: any }, imports: (string | undefined)[], language: any) {
	const listItemNode = GetFormItemNode(node.id);
	if (!listItemNode) {
		return '';
	}
	imports.push(GenerateComponentImport(listItemNode, node, language));
	const properties = WriteDescribedApiProperties(listItemNode, {
		listItem: true
	});
	return `({item, index, separators, key}: any)=>{
    let value = item;
    return  <${GetCodeName(
		listItemNode
	)} ${properties}  key={item && item.id !== undefined && item.id !== null  ? item.id : item}/>
  }`;
}
export function GetItemRenderImport(node: { id: any }) {
	const listItemNode = GetListItemNode(node.id);
	const properties = WriteDescribedApiProperties(listItemNode, {
		listItem: true
	});

	return `({item, index, separators, key}: any)=> <${GetCodeName(listItemNode)} ${properties} />`;
}

function getCssClassName(css: { [x: string]: { parent: any } }, id: string) {
	let res = id;
	if (css[id] && css[id].parent) {
		res = `${getCssClassName(css, css[id].parent)} .${res}`;
	} else {
		res = `.${res}`;
	}
	return res;
}
export function constructCssFile(css: any, clsName: string) {
	const rules = Object.keys(css)
		.map((v) => {
			const style = css[v].style;

			const props = Object.keys(style)
				.map((key) => {
					const temp = key.replace(/([a-z])([A-Z])/g, '$1-$2');
					const value = style[key];
					if (!isNaN(value)) {
						// value = `${value}px`;
					}
					if (![ undefined, null, '' ].some((v) => value === v)) return `${temp.toLowerCase()}: ${value};`;
				})
				.filter((x) => x)
				.join(NEW_LINE);
			return `${getCssClassName(css, v)} {
      ${props}
    }`;
		})
		.join(NEW_LINE);

	return rules || '.no-rule-yet { display: block; }';
}

export function GetStylesFor(node: any, tag: any) {
	if (typeof node === 'string') {
		node = GetNodeById(node);
	}
	const graph = GetCurrentGraph();
	const styleNodes = GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.Style
	}).filter((x: any) => (GetNodeProp(x, NodeProperties.GridAreas) || []).indexOf(tag) !== -1);

	const dataChainsConnectedToStyle = GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.DataChainLink
	}).filter((x: { id: any }) => {
		const connectedStyleNodes = GetNodesLinkedTo(graph, {
			id: x.id,
			link: LinkType.Style
		});
		return connectedStyleNodes.some((x: { id: any }) => styleNodes.some((node: { id: any }) => node.id === x.id));
	});

	return styleNodes.map((styleNode: GraphMethods.Node) => {
		const dataChainTest = dataChainsConnectedToStyle
			.filter((dc: { id: any }) =>
				existsLinkBetween(graph, {
					source: dc.id,
					target: styleNode.id
				})
			)
			.map((dc: { id: any }) => {
				const selector = GetNodesLinkedTo(graph, {
					id: dc.id,
					link: LinkType.SelectorLink
				})[0];
				let input = '';
				if (selector) {
					const inputs = GetNodesLinkedTo(graph, {
						id: selector.id,
						link: LinkType.SelectorInputLink
					}).filter((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.ComponentApi);
					input = `S.${GetCodeName(selector)}({${inputs
						.map((input: any) => `${GetCodeName(input)}: this.state.${GetCodeName(input)}`)
						.join()}})`;
				}
				return `DC.${GetCodeName(dc, { includeNameSpace: true })}(${input})`;
			})
			.join(' && ');
		if (!dataChainTest) {
			return `$\{styles.${GetJSCodeName(styleNode)}}`;
		}
		return `$\{${dataChainTest} ? styles.${GetJSCodeName(styleNode)} : '' }`;
	});
}
/*
A  node that is connected to style node, will generate the guts of the style to be named elsewhere.
*/
export function buildStyle(node: any) {
	const graph = GetCurrentGraph();
	if (typeof node === 'string') {
		node = GetNodeById(node, graph);
	}
	let topCssStyle = GetCssName(node) || GetCodeName(node);
	const styleNodes = GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.Style
	});

	const styleSheetRules = styleNodes
		.map((styleNode: GraphMethods.Node) => {
			const style = GetNodeProp(styleNode, NodeProperties.Style);
			const styleSelectors = StyleNodeProperties.filter((x) => GetNodeProp(styleNode, x)).map(
				(styleProp) => styleProp
			);
			const areas = GetNodeProp(styleNode, NodeProperties.GridAreas);
			const gridRowCount = parseInt(GetNodeProp(styleNode, NodeProperties.GridRowCount) || 1, 10);
			const gridplacement = GetNodeProp(styleNode, NodeProperties.GridPlacement);
			const styleObj = GetNodeProp(styleNode, NodeProperties.Style);
			const useMediaQuery = GetNodeProp(style, NodeProperties.UseMediaQuery);
			let mediaquery_start = '';
			let mediaquery_end = '';
			if (useMediaQuery) {
				mediaquery_start = MediaQueries[GetNodeProp(styleNode, NodeProperties.MediaQuery)];
				if (mediaquery_start) {
					mediaquery_start = `${mediaquery_start} {`;
					mediaquery_end = `}`;
				}
			}
			const styleName = GetJSCodeName(styleNode);
			const stylesSelectorsName = styleSelectors.map((styleSelector) => `${styleName}${styleSelector}`).join();
			const stylesheet = `${mediaquery_start}
    .${stylesSelectorsName || styleName} {
      ${Object.keys(styleObj).map((s) => `${StyleLib.js[s]}: ${styleObj[s]};`).join(NEW_LINE)}
    }
    ${mediaquery_end}`;

			return stylesheet;
		})
		.join(NEW_LINE);
	return `.${topCssStyle} {
    ${styleSheetRules}
  }`;
}

export function buildStyleJS(node: any) {
	const graph = GetCurrentGraph();
	if (typeof node === 'string') {
		node = GetNodeById(node, graph);
	}
	let topCssStyle = GetCssName(node) || GetCodeName(node);
	const styleNodes = GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.Style
	});

	const styleSheetRules = styleNodes
		.map((styleNode: GraphMethods.Node) => {
			const style = GetNodeProp(styleNode, NodeProperties.Style);
			const styleSelectors = StyleNodeProperties.filter((x) => GetNodeProp(styleNode, x)).map(
				(styleProp) => styleProp
			);
			const areas = GetNodeProp(styleNode, NodeProperties.GridAreas);
			const gridRowCount = parseInt(GetNodeProp(styleNode, NodeProperties.GridRowCount) || 1, 10);
			const gridplacement = GetNodeProp(styleNode, NodeProperties.GridPlacement);
			const styleObj = GetNodeProp(styleNode, NodeProperties.Style);
			const useMediaQuery = GetNodeProp(style, NodeProperties.UseMediaQuery);
			let mediaquery_start = '';
			let mediaquery_end = '';
			if (useMediaQuery) {
				mediaquery_start = MediaQueries[GetNodeProp(styleNode, NodeProperties.MediaQuery)];
				if (mediaquery_start) {
					mediaquery_start = `${mediaquery_start} {`;
					mediaquery_end = `}`;
				}
			}
			const styleName = GetJSCodeName(styleNode);
			const stylesSelectorsName = styleSelectors.map((styleSelector) => `${styleName}${styleSelector}`).join();
			const stylesheet = `
    ${stylesSelectorsName || styleName}: ()=> {

      ${mediaquery_start}
        return {    ${Object.keys(styleObj).map((s) => `${s}: '${styleObj[s]}',`).join(NEW_LINE)}
      };
       ${mediaquery_end}
    }
    `;

			return stylesheet;
		})
		.unique()
		.join(`,${NEW_LINE}`);
	return `export default {
    ${styleSheetRules}
  }`;
}
export function GetItemData(node: any) {
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
export function getRelativePathPrefix(relativePath: any) {
	return relativePath ? relativePath.split('/').map(() => `../`).subset(2).join('') : relativePath;
}
export function GenerateRNScreenOptionSource(node: any, relativePath: any, language: string) {
	const layoutObj = GetNodeProp(node, NodeProperties.Layout);
	const componentType = GetNodeProp(node, NodeProperties.ComponentType);
	const { specialLayout = null, template = null } = ComponentTypes[language][componentType]
		? ComponentTypes[language][componentType]
		: {};

	let imports: any[] = [];
	const extraimports: any[] = [];
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
		// extraimports.push(`import * as Models from '${getRelativePathPrefix(relativePath)}model_keys.js';`);
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
		const itemRender = GetItemRender(node, extraimports, language);
		const formReader = GetFormRender(node, extraimports, language);
		const apiProperties = WriteDescribedApiProperties(node);
		layoutSrc = bindTemplate(fs.readFileSync(template, 'utf8'), {
			item_render: itemRender,
			form_render: formReader,
			data,
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
	let cssJsFile = null;
	let cssImport = null;
	let templateStr = null;
	let ending = '.js';
	let styleRules = null;
	switch (language) {
		case UITypes.ElectronIO:
			ending = '.tsx';
			templateStr = fs.readFileSync('./app/templates/screens/el_screenoption.tpl', 'utf8');
			styleRules = buildStyle(node);
			cssFile = constructCssFile(css, `.${(GetCodeName(node) || '').toJavascriptName()}`);
			cssFile += styleRules;

			cssImport = `import styles from './${(GetCodeName(node) || '').toJavascriptName()}.scss'`;
			break;
		case UITypes.ReactWeb:
			ending = '.tsx';
			templateStr = fs.readFileSync('./app/templates/screens/el_screenoption.tpl', 'utf8');
			styleRules = buildStyle(node);
			cssFile = ''; // constructCssFile(css, `.${(GetCodeName(node) || '').toJavascriptName()}`);
			cssFile += styleRules;

			cssJsFile = buildStyleJS(node);

			cssImport = `import './${(GetCodeName(node) || '').toJavascriptName()}.scss'
      import styles from './${(GetCodeName(node) || '').toJavascriptName()}_css'`;
			break;
		case UITypes.ReactNative:
		default:
			templateStr = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');
			break;
	}
	const results: any[] = [];
	imports.filter((x) => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent)).map((t) => {
		const relPath = relativePath
			? `${relativePath}/${(GetCodeName(node) || '').toJavascriptName()}`
			: `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
		results.push(...GenerateRNComponents(GetNodeById(t), relPath, language));
	});
	imports = imports.unique().map((t: any) => GenerateComponentImport(t, node, language));

	const _consts = GetRNConsts(node.id ? node.id : node) || [];
	const modelInstances = GetRNModelInstances(node.id ? node.id : node) || [];
	const screen_options = addNewLine([ ..._consts, ...modelInstances ].unique().join(NEW_LINE), 4);

	templateStr = bindTemplate(templateStr, {
		name: GetCodeName(node),
		title: `"${GetNodeTitle(node)}"`,
		screen_options,
		component_did_update: GetComponentDidUpdate(node),
		imports: [ ...imports, cssImport, ...extraimports ].unique().join(NEW_LINE),
		elements: addNewLine(layoutSrc, 4)
	});
	templateStr = bindTemplate(templateStr, {
		relative_depth: [].interpolate(0, relativePath ? relativePath.split('/').length - 2 : 1, () => '../').join('')
	});
	return [
		{
			template: templateStr,
			relative: relativePath || './src/components',
			relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}${ending}`,
			name: `${relativePath || './src/components/'}${(GetCodeName(node) || '').toJavascriptName()}${ending}`
		},
		cssJsFile
			? {
					template: cssJsFile,
					relative: relativePath || './src/components',
					relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}_css.ts`,
					name: `${relativePath || './src/components/'}${(GetCodeName(node) || '').toJavascriptName()}_css.ts`
				}
			: null,
		cssFile
			? {
					template: cssFile,
					relative: relativePath || './src/components',
					relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}.scss`,
					name: `${relativePath || './src/components/'}${(GetCodeName(node) || '').toJavascriptName()}.scss`
				}
			: null,
		...results
	].filter((x) => x);
}
export function bindComponent(node: any, componentBindingDefinition: any, language: string) {
	if (componentBindingDefinition && componentBindingDefinition.template) {
		const template: any = fs.readFileSync(componentBindingDefinition.template, 'utf8');
		const { properties } = componentBindingDefinition;
		const graph: any = GetCurrentGraph();
		const bindProps: any = {};

		Object.keys(properties).map((key) => {
			if (properties[key] && properties[key].style) {
				const styles: string[] = [];
				const nodeId = typeof node === 'string' ? node : node.id;
				// const dataChainStyleLinks = GetNodesLinkedTo(graph, {
				//   id: node.id,
				//   link: LinkType.DataChainStyleLink
				// });
				const styleNodes = GetNodesLinkedTo(graph, {
					id: nodeId,
					link: LinkType.Style,
					properties: {
						[LinkPropertyKeys.ComponentTag]: ComponentTags.Self
					}
				});

				styleNodes.forEach((styleNode: GraphMethods.Node) => {
					const styleNodeDataChain = GetNodeLinkedTo(graph, {
						id: styleNode.id,
						link: LinkType.DataChainStyleLink
					});
					if (styleNodeDataChain) {
						let args = '';
						const styleArguments = GetNodesLinkedTo(graph, {
							id: styleNode.id,
							link: LinkType.StyleArgument
						});
						if (styleArguments && styleArguments.length) {
							args = styleArguments
								.map((styleArg: GraphMethods.Node) => {
									const nodeType = GetNodeProp(styleArg, NodeProperties.NODEType);
									switch (nodeType) {
										case NodeTypes.ComponentExternalApi:
											return `${GetJSCodeName(styleArg)}: this.props.${GetJSCodeName(styleArg)}`;
										case NodeTypes.ComponentApi:
											return `${GetJSCodeName(styleArg)}: this.state.${GetJSCodeName(styleArg)}`;
										default:
											return false;
									}
								})
								.filter((x: any) => x)
								.join();
						}
						let styleExpression = '';
						switch (language) {
							case UITypes.ReactWeb:
								styleExpression = `'${GetJSCodeName(styleNode)}'`;
								break;
							default:
								styleExpression = `styles['${GetJSCodeName(styleNode)}']`;
								break;
						}
						styles.push(
							`\${ DC.${GetCodeName(styleNodeDataChain, {
								includeNameSpace: true
							})}(${args}) ? ${styleExpression} : '' }`
						);
					} else {
						let styleExpression = '';
						switch (language) {
							case UITypes.ReactWeb:
								styleExpression = `'${GetJSCodeName(styleNode)}'`;
								break;
							default:
								styleExpression = `styles['${GetJSCodeName(styleNode)}']`;
								break;
						}
						styles.push(`${styleExpression}`);
					}
				});

				if (styles.length) {
					bindProps[key] = `className={\`${styles.join(' ')}\`}`;
				}
			} else if (properties[key] && properties[key].localStateProperty) {
				bindProps[key] = `${key}={this.state.${key}}`;
			} else if (properties[key] && properties[key].nodeProperty) {
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

			if (!bindProps[key]) bindProps[key] = '';
		});

		const cevents = componentBindingDefinition.eventApi || Object.keys(ComponentEvents);
		const eventHandlers = cevents
			.map((t: string | number) => getMethodInstancesForEvntType(node, ComponentEvents[t]))
			.map((methodInstances: any[], i: string | number) => {
				const invocations = methodInstances
					.map((methodInstanceCall: any) => {
						let invocationDependsOnState = null;
						const temp = getMethodInvocation(
							methodInstanceCall,
							(args: { statePropertiesThatCauseInvocation: any }) => {
								const { statePropertiesThatCauseInvocation } = args;
								invocationDependsOnState = (statePropertiesThatCauseInvocation || []).length;
							},
							{ component: node }
						);
						if (invocationDependsOnState) return false;
						return temp;
					})
					.filter((x: any) => x)
					.join(NEW_LINE);
				return `${ComponentEvents[cevents[i]]}={(value: any)=> {
        //  warning
${invocations}
    }}`;
			});

		if (eventHandlers && eventHandlers.length) {
			bindProps.events = eventHandlers.join(NEW_LINE);
		}
		return bindTemplate(template, bindProps);
	}
}
export function wrapOnPress(
	elements: string,
	onPress: any,
	node: any,
	options?: { onPress: { nowrap: any } } | undefined
) {
	const onpress = GetNodeProp(node, 'onPress');
	switch (onpress) {
		case APP_METHOD:
			const key = 'onPress';
			const methodParams = GetNodeProp(node, NodeProperties.ClientMethodParameters) || {};
			const clientMethod = GetNodeProp(node, NodeProperties.ClientMethod);
			let bodytext = 'let body = null;';
			const parameterstext = `let parameters = null;`;
			if (clientMethod) {
				const jsClientMethodName = GetJSCodeName(clientMethod);
				const methodParameters = GetMethodParameters(clientMethod);
				if (methodParameters) {
					const { parameters, body } = methodParameters;
					if (body) {
						const componentNodeProperties = GetComponentNodeProperties();
						const instanceType = getClientMethod(methodParams, key, 'body', 'instanceType');
						const componentModel = getClientMethod(methodParams, key, 'body', 'componentModel');
						const c_props = componentNodeProperties.find(
							(x) => x.id === getClientMethod(methodParams, key, 'body', 'component')
						);
						const c_props_options =
							c_props && c_props.componentPropertiesList ? c_props.componentPropertiesList : [];
						if (c_props_options.length) {
							const c_prop_option = c_props_options.find((v) => v.value === componentModel);
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
			const navigation = GetNodeProp(node, NodeProperties.Navigation);
			const targetScreen = GetNodeById(navigation);
			const screenParameters = GetNodeProp(targetScreen, NodeProperties.ScreenParameters);
			const params: string[] = [];
			if (screenParameters) {
				const navigationProperties = GetNodeProp(node, NodeProperties.NavigationParameters);
				const parameterProperty = GetNodeProp(node, NodeProperties.NavigationParametersProperty) || {};
				const componentProperties = GetNodeProp(node, NodeProperties.ComponentProperties);
				screenParameters.map((sparam: { title: any; id: any }) => {
					const { title, id } = sparam;
					const propName = navigationProperties[id];
					if (propName) {
						const propPropName = parameterProperty[propName];
						if (propPropName) {
							let listitem = '';
							if (
								GetNodeProp(node, NodeProperties.ComponentType) ===
								ComponentTypes.ReactNative.ListItem.key
							) {
								listitem = '.item';
							}
							const propertyNode = GetNodeById(propPropName);
							if (propertyNode) {
								params.push(
									`${title}: this.props.${propName}${listitem}.${GetJSCodeName(propertyNode)}`
								);
							} else {
								params.push(`${title}: this.props.${propName}${listitem}`);
							}
						}
					}
				});
			}
			if (navigation && params) {
				const navfunc = `navigate('${GetCodeName(navigation)}', {${params.join(', ')}})`;
				if (options && options.onPress && options.onPress.nowrap) {
					elements = bindTemplate(elements, {
						onPressEvent: `onPress={() => { ${navfunc} }}`
					});
				} else {
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
export function GenerateRNComponents(
	node: GraphMethods.Node | null,
	relative = './src/components',
	language = UITypes.ReactNative
) {
	const result = [];
	const layoutObj: any = GetNodeProp(node, NodeProperties.Layout);
	let fileEnding = '.js';
	switch (language) {
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			fileEnding = '.tsx';
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
					case UITypes.ReactWeb:
						template = fs.readFileSync('./app/templates/screens/el_screenoption.tpl', 'utf8');
						break;
					case UITypes.ReactNative:
					default:
						template = fs.readFileSync('./app/templates/screens/rn_screenoption.tpl', 'utf8');
						break;
				}

				let elements = null;
				if (ComponentTypes[language] && ComponentTypes[language][componentType]) {
					elements = bindComponent(node, ComponentTypes[language][componentType], language);
					if (
						ComponentTypes[language][componentType].properties &&
						ComponentTypes[language][componentType].properties
					) {
						const { onPress, nowrap } = ComponentTypes[language][componentType].properties;
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
				const css = {};
				let cssFile = '';
				let cssJsFile = '';
				let cssImport = '';
				let styleRules = null;
				const component_did_update = GetComponentDidUpdate(node);
				switch (language) {
					case UITypes.ElectronIO:
						styleRules = buildStyle(node);
						cssFile = constructCssFile(css, `.${(GetCodeName(node) || '').toJavascriptName()}`);
						cssFile += styleRules;

						cssImport = `import styles from './${(GetCodeName(node) || '').toJavascriptName()}.scss'`;
						break;
					case UITypes.ReactWeb:
						styleRules = buildStyle(node);
						cssFile = ''; // constructCssFile(css, `.${(GetCodeName(node) || '').toJavascriptName()}`);
						cssFile += styleRules;
						cssJsFile = buildStyleJS(node);
						cssImport = `import './${(GetCodeName(node) || '').toJavascriptName()}.scss'
            import styles from './${(GetCodeName(node) || '').toJavascriptName()}_css'`;
						break;
					default:
						break;
				}
				template = bindTemplate(template, {
					name: GetCodeName(node),
					imports: [ cssImport ].join(NEW_LINE),
					component_did_update,
					screen_options: '',
					elements: elements || GetDefaultElement()
				});
				template = bindTemplate(template, {
					relative_depth: []
						.interpolate(0, relative ? relative.split('/').length - 2 : 1, () => '../')
						.join('')
				});
				result.push(
					cssFile
						? {
								template: cssFile,
								relative: relative || './src/components',
								relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}.scss`,
								name: `${relative || './src/components/'}${(GetCodeName(node) || '')
									.toJavascriptName()}.scss`
							}
						: null,
					cssJsFile
						? {
								template: cssJsFile,
								relative: relative || './src/components',
								relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}_css.ts`,
								name: `${relative || './src/components/'}${(GetCodeName(node) || '')
									.toJavascriptName()}_css.ts`
							}
						: null,
					{
						relative: relative || './src/components',
						relativeFilePath: `./${(GetCodeName(node) || '').toJavascriptName()}${fileEnding}`,
						name: `${relative || './src/components'}/${(GetCodeName(node) || '')
							.toJavascriptName()}${fileEnding}`,
						template
					}
				);
				break;
		}
		return result.filter((x) => x);
	}
	const src = GenerateRNScreenOptionSource(node, relative || './src/components', language);
	if (src) result.push(...src);

	const components = GetNodeComponents(layoutObj).filter(
		(x: string) => !GetNodeProp(GetNodeById(x), NodeProperties.SharedComponent)
	);
	components.map((component: any) => {
		const relPath = relative
			? `${relative}/${(GetCodeName(node) || '').toJavascriptName()}`
			: `./src/components/${(GetCodeName(node) || '').toJavascriptName()}`;
		const temp = GenerateRNComponents(component, relPath, language);
		result.push(...temp);
	});
	return result;
}
export function GenerateCss(id: string, language: any) {
	const screen = GetNodeById(id);
	const screenOption = GetScreenOption(id, language);
	if (screenOption) {
		const imports: any = GetScreenImports(id, language);
		const elements: any = [ GenerateMarkupTag(screenOption, language, screen) ];
		let template = null;
		switch (language) {
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				template = fs.readFileSync('./app/templates/screens/el_screen.tpl', 'utf8');
				break;
			case UITypes.ReactNative:
			default:
				template = fs.readFileSync('./app/templates/screens/rn_screen.tpl', 'utf8');
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
export function ConvertViewTypeToComponentNode(node: any, language: string) {
	let wasstring = false;
	if (typeof node === 'string') {
		node = GetNodeById(node);
		wasstring = true;
	}

	switch (GetNodeProp(node, NodeProperties.NODEType)) {
		case NodeTypes.ViewType:
			const temp = GetNodesLinkedTo(GetCurrentGraph(GetState()), {
				id: node.id,
				link: LinkType.DefaultViewType,
				componentType: NodeTypes.ComponentNode
			})
				.filter((x: any) => {
					let temp = GetNodeProp(x, NodeProperties.UIType) === language;
					return temp;
				})
				.filter(
					(x: any) =>
						!!GetNodeProp(x, NodeProperties.IsPluralComponent) ===
						!!GetNodeProp(node, NodeProperties.IsPluralComponent)
				)
				.find((x: any) => x);
			if (!temp) {
				var asdf = 1;
			}
			node = temp || node;
			break;
		default:
			break;
	}
	if (wasstring) {
		return node.id;
	}
	return node;
}

export function GenerateMarkupTag(node: any, language: any, parent: any, cellStyleArray: any[] = []) {
	let viewTypeNode = null;
	if (GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.ViewType) {
		viewTypeNode = node;
	}
	node = ConvertViewTypeToComponentNode(node, language);
	switch (language) {
		case UITypes.ReactNative:
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			let describedApi = '';
			if (node && parent) {
				if (viewTypeNode) {
					describedApi = WriteDescribedApiProperties(viewTypeNode, {
						listitem: false,
						parent
					});
				}
				if (!describedApi) {
					describedApi = WriteDescribedApiProperties(node, {
						listItem: GetNodeProp(node, NodeProperties.ComponentType) === ComponentTypeKeys.ListItem
					});
				}
			}
			let {
				cellStyles,
				cellStylesReact
			}: { cellStyles: string; cellStylesReact: string[] } = constructCellStyles(cellStyleArray, true);
			let styleOrCss: string = '';
			let stylization = '';
			if (cellStyleArray && cellStylesReact.length) {
				stylization = `style={{${cellStylesReact.join()}}}`;
			}

			switch (language) {
				case UITypes.ReactNative:
					if (cellStylesReact.length) styleOrCss = stylization;
					break;
				default:
					if (cellStyles) styleOrCss = `${stylization}`;
					break;
			}
			return `<${GetCodeName(node)} ${styleOrCss} ${describedApi} />`;
	}
}

function computeScreenEffectInputs(parent: any) {
	const graph = GetCurrentGraph(GetState());
	const componentInternalApis = GetNodesLinkedTo(graph, {
		id: parent.id,
		link: LinkType.ComponentInternalApi
	});

	return `{${componentInternalApis
		.unique((x: GraphMethods.Node) => GetJSCodeName(x))
		.map((node: GraphMethods.Node) => {
			return `${GetJSCodeName(node)}: this.state.${GetJSCodeName(node)}`;
		})
		.join(`,${NEW_LINE}`)}}`;
}
function WriteDescribedStateUpdates(parent: any) {
	let result = ``;
	const graph = GetCurrentGraph(GetState());
	if (typeof parent === 'string') {
		parent = GetNodeById(parent, graph);
	}
	const componentInternalApis = GetNodesLinkedTo(graph, {
		id: parent.id,
		link: LinkType.ComponentInternalApi
	});
	result = componentInternalApis
		.unique((x: GraphMethods.Node) => GetJSCodeName(x))
		.map((componentInternalApi: GraphMethods.Node) => {
			const externalApiNode = GetNodesLinkedTo(graph, {
				id: componentInternalApi.id,
				link: LinkType.ComponentInternalConnection
			}).find((x: any) => x);
			const dataChainScreenEffect = GetNodeLinkedTo(graph, {
				id: componentInternalApi.id,
				link: LinkType.DataChainScreenEffect
			});
			const dataChain = GetNodesLinkedTo(graph, {
				id: componentInternalApi.id,
				link: LinkType.DataChainLink
			}).find((x: any) => x);

			const selector = GetNodesLinkedTo(graph, {
				id: componentInternalApi.id,
				link: LinkType.SelectorLink
			}).find((x: any) => x);

			let innerValue = null;
			const externalKey = GetJSCodeName(externalApiNode);
			innerValue = externalKey;
			if (innerValue) {
				if (selector) {
					const addiontionalParams = getUpdateFunctionOption(selector.id, externalApiNode.id, `/*s => e*/`);
					innerValue = `S.${GetJSCodeName(
						selector
					)}({{temp}}, this.state.viewModel${addiontionalParams} /* state update */)`;
				} else {
					innerValue = '{{temp}}';
				}
				if (dataChain) {
					innerValue = `DC.${GetCodeName(dataChain, {
						includeNameSpace: true
					})}(${innerValue})`;
				}
				const temp_prop = GetJSCodeName(componentInternalApi);

				let temp_prop_source_value: string = bindTemplate(innerValue, {
					temp: `this.props.${externalKey}`
				});
				result = `
            var new_${externalKey} = ${temp_prop_source_value};
            if ( new_${externalKey} !== this.state.${temp_prop}) {
          {{step}}
        }`;

				return bindTemplate(result, {
					temp: innerValue,
					step: `updated = true;
            updates = {...updates, ${GetJSCodeName(componentInternalApi)}:  new_${externalKey} };`
				});
			} else if (dataChainScreenEffect) {
				//Screen Effects
				let internalKey = GetJSCodeName(componentInternalApi);
				result = `
        var new_${internalKey} = DC.${GetCodeName(dataChainScreenEffect, {
					includeNameSpace: true
				})}(${computeScreenEffectInputs(parent)});
        if ( new_${internalKey} !== this.state.${internalKey}) {
      {{step}}
    }`;
				return bindTemplate(result, {
					temp: innerValue,
					step: `updated = true;
        updates = {...updates, ${GetJSCodeName(componentInternalApi)}:  new_${internalKey} };`
				});
			}
		})
		.filter((x: any) => x)
		.join(NEW_LINE);

	const methodInstances = getMethodInstancesForLifeCylcEvntType(parent, ComponentLifeCycleEvents.ComponentDidMount);

	const invocations = (methodInstances || [])
		.map((methodInstanceCall) => {
			let invocationDependsOnState = false;
			let dependentStateProperties: any[] = [];
			const temp = getMethodInvocation(
				methodInstanceCall,
				(args: { statePropertiesThatCauseInvocation: any }) => {
					const { statePropertiesThatCauseInvocation } = args;
					dependentStateProperties = statePropertiesThatCauseInvocation;
					invocationDependsOnState = (statePropertiesThatCauseInvocation || []).length;
				},
				{ component: parent }
			);
			if (!invocationDependsOnState) {
				return false;
			}
			const ifstatement = dependentStateProperties.map((v) => `updates.hasOwnProperty('${v}')`).join(' || ');
			return `if(${ifstatement}) {
        ${temp}
      }`;
		})
		.filter((x) => x)
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
function GetDefaultComponentValue(node: any, key?: string | undefined) {
	let result = ``;
	const graph = GetCurrentGraph(GetState());
	if (typeof node === 'string') {
		node = GetNodeById(node, graph);
	}
	const componentInternalApis = [
		GetNodesLinkedTo(graph, {
			id: node.id,
			link: LinkType.ComponentInternalApi
		})
			.filter((x: any) => GetNodeProp(x, NodeProperties.UIText) === key)
			.find((x: any) => x)
	].filter((x) => x);

	result = componentInternalApis
		.unique((x: GraphMethods.Node) => GetJSCodeName(x))
		.map((componentInternalApi: GraphMethods.Node) => {
			const dataChain = GetNodesLinkedTo(graph, {
				id: componentInternalApi.id,
				link: LinkType.DataChainLink
			}).find((x: any) => x);

			const selector = GetNodesLinkedTo(graph, {
				id: componentInternalApi.id,
				link: LinkType.SelectorLink
			}).find((x: any) => x);

			let innerValue = null;
			const externalKey = GetJSCodeName(componentInternalApi);
			innerValue = externalKey;
			if (innerValue) {
				if (selector) {
					innerValue = `S.${GetJSCodeName(selector)}({{temp}}, this.state.viewModel$)`;
				} else {
					innerValue = '{{temp}}';
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
		.filter((x: any) => x)
		.join(NEW_LINE);
	return result;
}

function WriteDescribedApiProperties(node: GraphMethods.Node | null, options: any = { listItem: false }) {
	let result: any = '';
	if (typeof node === 'string') {
		node = GetNodeById(node);
	}

	let graph = GetCurrentGraph(GetState());
	const componentExternalApis = GetNodesLinkedTo(graph, {
		id: node ? node.id : null,
		link: LinkType.ComponentExternalApi
	});

	const componentEventHandlers = GetNodesLinkedTo(graph, {
		id: node ? node.id : null,
		link: LinkType.EventMethod
	});

	const isViewType = GetNodeProp(node, NodeProperties.NODEType) === NodeTypes.ViewType;

	result = componentExternalApis
		.unique((x: GraphMethods.Node) => GetJSCodeName(x))
		.map((componentExternalApi: GraphMethods.Node) => {
			let stateKey: any = false;
			let noSelector: any = false;
			let noDataChain: any = false;
			let externalConnection: any = GetNodesLinkedTo(graph, {
				id: componentExternalApi.id,
				link: LinkType.ComponentExternalConnection
			}).find((x: any) => x);

			if (isViewType && !externalConnection) {
				// If the view-type node doesn't have an external connection
				// Then conventions will be assumed.
				externalConnection = componentExternalApi;
				switch (GetNodeTitle(externalConnection)) {
					case 'label':
					case 'placeholder':
					case 'success':
						return;
					case 'viewModel':
						noSelector = true;
						noDataChain = false;
						break;
					case 'error':
					default:
						stateKey = GetNodeTitle(externalConnection);
						// stateKey = 'value';
						break;
				}
			}

			const titleService = GetNodesLinkedTo(graph, {
				id: componentExternalApi.id,
				link: LinkType.TitleServiceLink
			}).find((x: any) => x);

			const query = GetNodesLinkedTo(graph, {
				id: componentExternalApi.id,
				link: LinkType.QueryLink
			}).find((x: any) => x);

			const dataChain = GetNodesLinkedTo(graph, {
				id: componentExternalApi.id,
				link: LinkType.DataChainLink
			}).find((x: any) => x);

			const selector = GetNodesLinkedTo(graph, {
				id: componentExternalApi.id,
				link: LinkType.SelectorLink
			}).find((x: any) => x);

			let innerValue = '';
			if (titleService) {
				innerValue = `titleService.get(\`${GetNodeProp(node, NodeProperties.Label)}\`)`;
			} else if (externalConnection || query) {
				if (query && GetNodeProp(query, NodeProperties.QueryParameterObject)) {
					innerValue = `GetScreenParam('query')`;
				} else if (options.listItem) {
					const listItemAttribute = GetJSCodeName(externalConnection);
					const notRequiredListItemAttribute =
						[ 'value', 'separators', 'index' ].indexOf(listItemAttribute) === -1;
					innerValue =
						notRequiredListItemAttribute && !GetNodeProp(externalConnection, NodeProperties.AsLocalContext)
							? `this.state.${listItemAttribute}`
							: listItemAttribute;
				} else {
					const defaulComponentValue =
						GetNodeProp(externalConnection, NodeProperties.DefaultComponentApiValue) || '';
					if (defaulComponentValue) {
						// Create/Update case
						innerValue = `ViewModelKeys.${defaulComponentValue}`;
					} else {
						// Get/GetAll/Delete
						innerValue = `this.state.${stateKey || GetJSCodeName(externalConnection)}`;
					}
				}
			}
			let addiontionalParams;
			if (!noSelector && selector) {
				addiontionalParams =
					componentExternalApi && externalConnection
						? getUpdateFunctionOption(componentExternalApi.id, externalConnection.id, ``)
						: '';
				if (isViewType) {
					addiontionalParams =
						componentExternalApi && node
							? getUpdateFunctionOption(node.id, componentExternalApi.id, ``)
							: '';

					innerValue = `S.${GetJSCodeName(
						selector
					)}(${innerValue}, this.state.viewModel${addiontionalParams})`;
				} else {
					// TODO: this might be able to go away;
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
		.filter((x: any) => x);

	if (options.listItem && result.indexOf('value={value}') === -1) {
		result.push('value={value}');
	}
	if (
		options.listItem &&
		GetNodeProp(node, NodeProperties.SharedComponent) &&
		result.indexOf('viewModel={this.state.viewModel}') !== -1
	) {
		let tempIndex = result.indexOf('viewModel={this.state.viewModel}');
		result.splice(tempIndex, 1);
	}
	if (
		options.listItem &&
		GetNodeProp(node, NodeProperties.SharedComponent) &&
		!result.find((v: string) => v.indexOf('selected=') !== -1)
	) {
		result.push('selected={((this.props.value||[]).indexOf(value) !== -1)}');
	}

	const res = componentEventHandlers
		.unique((x: GraphMethods.Node) => GetJSCodeName(x))
		.map((componentEventHandler: { id: any }) => {
			const eventInstances = GetNodesLinkedTo(graph, {
				id: componentEventHandler.id,
				link: LinkType.EventMethodInstance
			});
			return eventInstances
				.map((eventInstance: { id: any }) => {
					const eventMethodHandlers = GetNodesLinkedTo(graph, {
						id: eventInstance.id,
						link: LinkType.EventHandler
					});
					const method_calls = eventMethodHandlers.map((eventMethodHandler: { id: any }) => {
						const property = GetNodesLinkedTo(graph, {
							id: eventMethodHandler.id,
							link: LinkType.PropertyLink
						}).find((x: any) => x);
						const viewModel = GetNodesLinkedTo(graph, {
							id: eventMethodHandler.id,
							link: LinkType.ViewModelLink
						}).find((x: any) => x);
						const eventType = GetNodeProp(eventMethodHandler, NodeProperties.EventType);
						const useValue = GetNodeProp(eventMethodHandler, NodeProperties.UseValue) ? 'value' : 'text';
						const addiontionalParams =
							componentEventHandler && eventInstance
								? getUpdateFunctionOption(
										componentEventHandler.id,
										eventInstance.id,
										`, { update: true, value: this.state.value/*hard coded*/ }`
									)
								: '';

						let method_call = null;
						const modelProperty = GetJSCodeName(property);
						const screenOrModel = GetNodeProp(eventMethodHandler, NodeProperties.InstanceType)
							? 'Model'
							: 'Screen';
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
							default:
								break;
						}
						return method_call;
					});
					if (method_calls && method_calls.length) {
						return `${GetNodeProp(eventInstance, NodeProperties.EventType)}={(arg: any) => {
                    ${method_calls.join(NEW_LINE)}
                }}`;
					}
				})
				.filter((x: any) => x)
				.join(NEW_LINE);
		});
	const componentType = GetNodeProp(node, NodeProperties.ComponentType);
	const uiType = GetNodeProp(node, NodeProperties.UIType);
	if (ComponentTypes[uiType] && ComponentTypes[uiType][componentType]) {
		const { events } = ComponentTypes[uiType][componentType];
		for (const _event in events) {
			switch (_event) {
				case ComponentEvents.onChange:
					result.push(ComponentEventStandardHandler[_event]);
					break;
				default:
					break;
			}
		}
	}

	result.push(...res);
	return NEW_LINE + result.join(NEW_LINE);
}
export function writeApiProperties(apiConfig: { [x: string]: any }) {
	let result = '';
	const res = [];

	if (apiConfig) {
		for (const i in apiConfig) {
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

	result = res.join(' ');

	return result;
}
export function GetScreenOption(id: string, language: any) {
	const screen = GetNodeById(id);
	const screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
	if (screenOptions && screenOptions.length) {
		const reactScreenOption = screenOptions.find((x: any) => GetNodeProp(x, NodeProperties.UIType) === language);
		if (reactScreenOption) {
			return reactScreenOption;
		}
	}
	return null;
}

export function GetScreenImports(id: string, language: any) {
	const screen = GetNodeById(id);
	const screenOptions = screen ? GetConnectedScreenOptions(screen.id) : null;
	if (screenOptions && screenOptions.length) {
		const reactScreenOption = screenOptions.find((x: any) => GetNodeProp(x, NodeProperties.UIType) === language);
		if (reactScreenOption) {
			return [ GenerateImport(reactScreenOption, screen, language) ];
		}
		return [];
	}
	return null;
}

export function getMethodInstancesForLifeCylcEvntType(node: any, evtType: string) {
	if (typeof node === 'string') {
		node = GetNodeById(node);
	}
	const graph = GetCurrentGraph(GetState());
	const methods = getNodesByLinkType(graph, {
		id: node.id,
		type: LinkType.LifeCylceMethod,
		direction: TARGET,
		exist: true
	}).filter((x) => GetNodeProp(x, NodeProperties.EventType) === evtType);
	const methodInstances: any[] = [];
	methods.map((method: any) => {
		methodInstances.push(
			...getNodesLinkedTo(graph, {
				id: method.id,
				exist: true
			}).filter((x) =>
				[ NodeTypes.LifeCylceMethodInstance ].some((v) => v === GetNodeProp(x, NodeProperties.NODEType))
			)
		);
	});

	return methodInstances;
}

export function getMethodInstancesForEvntType(node: any, evtType: any) {
	if (typeof node === 'string') {
		node = GetNodeById(node);
	}
	const graph = GetCurrentGraph(GetState());
	const methods = GetNodesLinkedTo(graph, {
		id: node.id,
		link: LinkType.EventMethod
	}).filter((x: any) => GetNodeProp(x, NodeProperties.EventType) === evtType);
	const methodInstances: any[] = [];
	methods.map((method: { id: any }) => {
		methodInstances.push(
			...getNodesLinkedTo(graph, {
				id: method.id,
				exist: true
			}).filter((x) =>
				[ NodeTypes.EventMethodInstance ].some((v) => v === GetNodeProp(x, NodeProperties.NODEType))
			)
		);
	});

	return methodInstances;
}
export function getMethodInvocation(methodInstanceCall: { id: any }, callback: any = () => {}, options = {}) {
	const graph = GetCurrentGraph(GetState());
	const method = getNodesByLinkType(graph, {
		id: methodInstanceCall.id,
		type: LinkType.MethodCall,
		direction: SOURCE
	}).find((x) => x);
	const navigationMethod = getNodesByLinkType(graph, {
		id: methodInstanceCall.id,
		type: LinkType.NavigationMethod,
		direction: SOURCE
	}).find((x) => x);
	let dataChain = getNodesByLinkType(graph, {
		id: methodInstanceCall.id,
		type: LinkType.DataChainLink,
		direction: SOURCE
	}).find((x) => x);

	const internalApiConnection = getNodesByLinkType(graph, {
		id: methodInstanceCall.id,
		type: LinkType.ComponentApi,
		direction: SOURCE
	}).find((x) => x);
	const statePropertiesThatCauseInvocation: any[] = [];
	if (method) {
		const parts = [];
		const body = getNodesByLinkType(graph, {
			id: method.id,
			type: LinkType.MethodApiParameters,
			direction: TARGET
		}).find((x) => GetNodeProp(x, NodeProperties.UriBody));
		const queryObject = getNodesByLinkType(graph, {
			id: method.id,
			type: LinkType.MethodApiParameters,
			direction: TARGET
		}).find((x) => GetNodeProp(x, NodeProperties.QueryParameterObject));
		const templateObject = getNodesByLinkType(graph, {
			id: method.id,
			type: LinkType.MethodApiParameters,
			direction: TARGET
		}).find((x) => GetNodeProp(x, NodeProperties.TemplateParameter));

		dataChain = GetNodeLinkedTo(graph, {
			id: methodInstanceCall.id,
			link: LinkType.DataChainLink,
			componentType: NodeTypes.DataChain
		});
		const screenEffects = GetNodesLinkedTo(graph, {
			id: methodInstanceCall.id,
			link: LinkType.DataChainScreenEffectImpl
		});

		const preDataChain = GetNodeLinkedTo(graph, {
			id: methodInstanceCall.id,
			link: LinkType.PreDataChainLink,
			componentType: NodeTypes.DataChain
		});

		const methodInstanceSource = GetNodesLinkedTo(graph, {
			id: methodInstanceCall.id,
			link: LinkType.EventMethodInstance
		}).find((x: any) => GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.EventMethod);
		let body_input = null;
		if (body) {
			const body_param = getNodesByLinkType(graph, {
				id: body.id,
				type: LinkType.ComponentApiConnection,
				direction: TARGET
			}).find((x) => x);
			if (body_param) {
				const body_selector = getNodesByLinkType(graph, {
					id: body_param.id,
					type: LinkType.ComponentApiConnection,
					direction: SOURCE
				}).find((x_temp) => GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.Selector);
				let innervalue = '';
				if (body_selector) {
					const addiontionalParams = getUpdateFunctionOption(
						methodInstanceSource ? methodInstanceSource.id : null,
						methodInstanceCall ? methodInstanceCall.id : null,
						``
					);

					innervalue = `S.${GetJSCodeName(
						body_selector
					)}(this.state.value, this.state.viewModel${addiontionalParams})`;
				}
				const body_value = getNodesByLinkType(graph, {
					id: body_param.id,
					type: LinkType.ComponentApiConnection,
					direction: SOURCE
				}).find((x_temp) => GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.DataChain);
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
				link: LinkType.MethodApiParameters,
				direction: SOURCE
			}).filter((x: any) => GetNodeProp(x, NodeProperties.TemplateParameter));

			const queryParameterValues = templateParameters
				.map((queryParameter: any) =>
					extractApiJsCode({
						node: queryParameter,
						options,
						graph,
						callback: (list: any) => {
							statePropertiesThatCauseInvocation.push(...list);
						}
					})
				)
				.filter((temp: any) => temp);
			parts.push(`template: {${addNewLine(queryParameterValues.join(`, ${NEW_LINE}`))}}`);
		}
		if (queryObject) {
			const queryParameters = getNodesByLinkType(graph, {
				id: queryObject.id,
				type: LinkType.MethodApiParameters,
				direction: SOURCE
			}).filter((x) => GetNodeProp(x, NodeProperties.QueryParameterParam));

			const queryParameterValues = queryParameters
				.map((queryParameter) =>
					extractApiJsCode({
						node: queryParameter,
						graph,
						options,
						internalApiConnection,
						callback: (list: any) => {
							statePropertiesThatCauseInvocation.push(...list);
						}
					})
				)
				.filter((temp) => temp);
			parts.push(`query: {${addNewLine(queryParameterValues.join(`, ${NEW_LINE}`))}}`);
		}
		if (callback) {
			callback({ statePropertiesThatCauseInvocation });
		}
		let dataChainInput = '';
		if (dataChain) {
			dataChainInput = `${parts.length ? ',' : ''}dataChain: DC.${GetCodeName(dataChain, {
				includeNameSpace: true
			})}`;
		}
		let preDataChainInput = '';
		if (preDataChain) {
			preDataChainInput = `${parts.length ? ',' : ''}preChain: DC.${GetCodeName(preDataChain, {
				includeNameSpace: true
			})}`;
		}
		let screenEffectsInput = '';
		let screenEffectContext = '';
		if (screenEffects && screenEffects.length) {
			screenEffectsInput = `${parts.length || dataChainInput || preDataChainInput
				? ','
				: ''}screenEffects: [${screenEffects
				.map((se: GraphMethods.Node) => {
					return `DC.${GetCodeName(se, { includeNameSpace: true })}`;
				})
				.join(',' + NEW_LINE)}]`;
			let screenEffect = screenEffects[0];
			let componentConnectedToScreenEffect = GetNodeLinkedTo(graph, {
				id: screenEffect.id,
				link: LinkType.ComponentNodeLink
			});
			screenEffectContext = `${parts.length || dataChainInput || preDataChainInput || screenEffectsInput
				? ','
				: ''}screenContext:{ ${GetComponentContextScript(componentConnectedToScreenEffect)} }`;
		}

		const query = parts.join();
		return `this.props.${GetJSCodeName(
			method
		)}({${query}${dataChainInput}${preDataChainInput}${screenEffectsInput}${screenEffectContext}});`;
	}
	if (navigationMethod) {
		return `this.props.${GetNodeProp(navigationMethod, NodeProperties.NavigationAction)}();`;
	}
	if (dataChain) {
		// Buttons need to use this.state.value, so a new property for datachains should exist.
		if (internalApiConnection) {
			return `DC.${GetCodeName(dataChain, {
				includeNameSpace: true
			})}(this.state.${GetJSCodeName(internalApiConnection)});`;
		}
		let argumentSource: GraphMethods.Node = GetNodeLinkedTo(GetCurrentGraph(), {
			id: dataChain.id,
			link: LinkType.MethodArgumentSoure
		});
		if (argumentSource) {
			let apiInternalNodes = GetComponentInternalApiNodes(argumentSource.id);
			let calculateEventArguments = GetEventArguments(argumentSource.id);
			let internalApiArgs = createInternalApiArgumentsCode(apiInternalNodes, calculateEventArguments);
			return `DC.${GetCodeName(dataChain, {
				includeNameSpace: true
			})}(value, ${internalApiArgs});`;
		}
		return `DC.${GetCodeName(dataChain, {
			includeNameSpace: true
		})}(value/*hi*/);`;
	}
}

function GetComponentContextScript(component: GraphMethods.Node) {
	let internalNodes = GetComponentApiNodes(component.id);

	let res = `${internalNodes
		.unique((v: GraphMethods.Node) => GetJSCodeName(v))
		.map((internalNode: GraphMethods.Node) => {
			return `${GetJSCodeName(internalNode)}: this.state.${GetJSCodeName(internalNode)}`;
		})
		.join(`,${NEW_LINE}`)}`;

	return res;
}
function createInternalApiArgumentsCode(
	apiInternalNodes: GraphMethods.Node[],
	calculateEventArguments: GraphMethods.Node[]
) {
	let methodParamNames: string[] = [];
	let methodParams = (calculateEventArguments || [])
		.map((node: GraphMethods.Node) => {
			switch (GetNodeProp(node, NodeProperties.EventArgumentType)) {
				case EventArgumentTypes.RouteSource:
					let routeSource: RouteSource = GetNodeProp(node, NodeProperties.RouteSource);
					let screen = GetNodeProp(node, NodeProperties.Screen);
					let viewType = GetNodeProp(screen, NodeProperties.ViewType);
					let paramName = GetNodeProp(node, NodeProperties.ParameterName).toJavascriptName();
					switch (routeSource.type) {
						case RouteSourceType.Agent:
						case RouteSourceType.Model:
							methodParamNames.push(paramName);
							return `${paramName}: (() => {
                let model = GetC(this.props.state, SITE, Models.${GetCodeName(routeSource.model)});
                if(model) {
                  return model.${GetJSCodeName(routeSource.property)};
                }
                return null;
              })()`;
						case RouteSourceType.Item:
							methodParamNames.push(paramName);
							return `${paramName}: (() => {
                let model = GetItem(Models.${GetCodeName(routeSource.model)}, this.state.value);
                if(model) {
                  return model.${GetJSCodeName(routeSource.property)};
                }
                return null;
              })()`;
						case RouteSourceType.UrlParameter:
							methodParamNames.push(paramName);
							return `${paramName}: this.state.${`${routeSource.model}`.toJavascriptName()}`;
						case RouteSourceType.Body:
							switch (viewType) {
								case ViewTypes.Update:
									methodParamNames.push(paramName);
									return `${paramName}: (()=>{
                let model = UIA.GetScreenModelInstance(this.state.value, this.state.viewModel);
              return model;
              })()`;
								case ViewTypes.Create:
									methodParamNames.push(paramName);
									return `${GetNodeProp(
										node,
										NodeProperties.ParameterName
									).toJavascriptName()}: (()=>{
                    let model = UIA.GetScreenInstanceObject(this.state.viewModel);
                    return model;
                  })()`;
								case ViewTypes.Get:
								case ViewTypes.GetAll:
									methodParamNames.push(paramName);
									return `${GetNodeProp(
										node,
										NodeProperties.ParameterName
									).toJavascriptName()}: (()=>{
                    let model = UIA.GetModelInstanceObject(this.state.value, this.state.viewModel);
                    return model;
                  })()`;
							}
					}
					break;
			}
			return null;
		})
		.filter((x) => x);

	let result = '';
	result = `{ ${[
		...apiInternalNodes
			.filter((node: GraphMethods.Node) => {
				return methodParamNames.indexOf(GetNodeTitle(node)) === -1;
			})
			.map((node: GraphMethods.Node) => {
				return `${GetNodeTitle(node)}: this.state.${GetNodeTitle(node)}`;
			}),
		...methodParams
	].join(', ' + NEW_LINE)} }`;
	return result;
}

export function getUpdateFunctionOption(methodId: any, methodInstanceCallId: any, addParams: string) {
	let addiontionalParams = '';
	if (methodId && methodInstanceCallId) {
		const linkBetweenNodes = GetLinkBetween(methodId, methodInstanceCallId, GetCurrentGraph());
		if (linkBetweenNodes) {
			const instanceUpdate = GetLinkProperty(linkBetweenNodes, LinkPropertyKeys.InstanceUpdate);
			if (instanceUpdate) {
				addiontionalParams = addParams || ``;
			}
		}
	}
	return addiontionalParams;
}
export function GetComponentDidUpdate(parent: any, options: any = {}) {
	const { isScreen } = options;
	let describedApi = '';
	if (parent) {
		describedApi = WriteDescribedStateUpdates(parent).trim();
	}
	const componentDidMount = GetComponentDidMount(parent, {
		skipOutOfBand: true,
		skipSetGetState: true
	});
	const componentDidUpdate = `componentDidUpdate(prevProps: any) {
        this.captureValues(prevProps);
      }
      ${!isScreen ? componentDidMount : ''}
      captureValues(prevProps: any){
        ${describedApi}
      }`;

	return componentDidUpdate;
}
export function GetComponentDidMount(screenOption: any, options: any = {}) {
	const events = GetNodeProp(screenOption, NodeProperties.ComponentDidMountEvent);
	let outOfBandCall = '';
	if (GetNodeProp(screenOption, NodeProperties.InstanceType) === InstanceTypes.ModelInstance) {
		if (GetNodeProp(screenOption, NodeProperties.ViewType) === ViewTypes.GetAll) {
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
		.map((methodInstanceCall) => {
			let invocationDependsOnState = false;
			const temp = getMethodInvocation(
				methodInstanceCall,
				(args: any) => {
					const { statePropertiesThatCauseInvocation } = args;
					invocationDependsOnState = (statePropertiesThatCauseInvocation || []).length;
				},
				{ screenOption }
			);
			if (invocationDependsOnState) {
				return false;
			}
			return temp;
		})
		.filter((x) => x)
		.join(NEW_LINE);
	const chainInvocations = (methodInstances || [])
		.map((mi) => {
			const chains = GetNodesLinkedTo(null, {
				id: mi.id,
				link: LinkType.CallDataChainLink
			});

			return chains
				.map((chain: { id: any }) => {
					const input = GetDataChainInputArgs(chain.id);
					return `DC.${GetCodeName(chain, { includeNameSpace: true })}(${input});//here`;
				})
				.join(NEW_LINE);
		})
		.filter((x) => x)
		.join('');
	const componentDidMount = `componentDidMount() {
    // here 3
        ${options.skipSetGetState ? '' : `this.props.setGetState();`}
        this.captureValues({});
        ${options.skipOutOfBand ? '' : outOfBandCall}
        ${invocations}
        ${chainInvocations}
{{handles}}
}
`;
	let evntHandles: any = [];
	if (events && events.length) {
		evntHandles = events
			.map((evt: string) => {
				const methodNode: any = GetNodeById(evt);
				return `this.props.${GetJSCodeName(methodNode)}();`;
			})
			.join(NEW_LINE);
	} else {
		evntHandles = '';
	}

	return addNewLine(
		bindTemplate(componentDidMount, {
			handles: addNewLine(evntHandles, 1)
		}),
		1
	);
}
export function GetDataChainInputArgs(id: any) {
	const inputs = GetNodesLinkedTo(null, {
		id,
		link: LinkType.DataChainInputLink
	});

	let res: any = '';
	if (inputs && inputs.length) {
		res = [];
		inputs.forEach((input: GraphMethods.Node) => {
			const nodeType = GetNodeProp(input, NodeProperties.NODEType);
			switch (nodeType) {
				case NodeTypes.ComponentApi:
					res.push(`${GetJSCodeName(input)}: this.state.${GetJSCodeName(input)}`);
					break;
				case NodeTypes.ComponentExternalApi:
					res.push(`${GetJSCodeName(input)}: this.props.${GetJSCodeName(input)}`);
					break;
			}
		});

		res = res.join(', ');
		res = `{${res}}`;
	}
	return res;
}
export function GenerateImport(node: any, parentNode: GraphMethods.Node | null, language: any) {
	node = ConvertViewTypeToComponentNode(node, language);

	switch (language) {
		case UITypes.ReactNative:
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			if (node) {
				if (GetNodeProp(node, NodeProperties.SharedComponent)) {
					return `import ${GetCodeName(node)} from '../shared/${(GetCodeName(node) || '')
						.toJavascriptName()}'`;
				}
				return `import ${GetCodeName(node)} from '../components/${(GetCodeName(node) || '')
					.toJavascriptName()}'`;
			}
	}
}

export function GenerateComponentImport(node: any, parentNode: any, language: any) {
	node = ConvertViewTypeToComponentNode(node, language);

	switch (language) {
		case UITypes.ElectronIO:
		case UITypes.ReactNative:
		case UITypes.ReactWeb:
			if (node) {
				if (GetNodeProp(node, NodeProperties.SharedComponent)) {
					return `import ${GetCodeName(node)} from '{{relative_depth}}shared/${(GetCodeName(node) || '')
						.toJavascriptName()}'`;
				}
				return `import ${GetCodeName(node)} from './${(GetCodeName(parentNode) || '')
					.toJavascriptName()}/${(GetCodeName(node) || '').toJavascriptName()}'`;
			}
	}
}

export function GetScreens() {
	const screens = GetScreenNodes();
	return screens;
}
function GenerateElectronIORoutes(screens: any[], language: string) {
	const template = `<Route path={routes.{{route_name}}} render={({ match, history, location }: any) => {
    console.log(match.params);
    let {{{screenApiParamsWithDefaults}}} = match.params;
    {{overrides}}
    setParameters({{{screenApiParams}}});
    return <{{component}} {{screenApi}} />}} />
  `;
	let routefile;
	switch (language) {
		case UITypes.ReactWeb:
			routefile = fs.readFileSync('./app/templates/reactweb/routes.tpl', 'utf8');
			break;
		default:
			routefile = fs.readFileSync('./app/templates/electronio/routes.tpl', 'utf8');
			break;
	}
	const import_ = `import {{name}} from './screens/{{jsname}}';`;
	const routes: any[] = [];
	const _screens: any[] = [];
	screens.map((screen: GraphMethods.Node) => {
		const screenApis = getNodesByLinkType(GetCurrentGraph(), {
			id: screen.id,
			type: LinkType.ComponentExternalApi,
			direction: SOURCE
		});
		const screenApi = screenApis.map((v) => `${GetJSCodeName(v)}={${GetJSCodeName(v)}}`).join(' ');
		const viewModel = screenApis.find((x) => GetNodeTitle(x) === 'viewModel');
		let overrides = '';
		if (viewModel) {
			const viewModelDataLink = getNodesByLinkType(GetCurrentGraph(), {
				id: viewModel.id,
				type: LinkType.DataChainLink,
				direction: SOURCE
			}).find((x) => x);
			if (viewModelDataLink) {
				overrides = `viewModel = DC.${GetCodeName(viewModelDataLink, {
					includeNameSpace: true
				})}();`;
			}
		}
		const screenApiParams = screenApis.map((v) => `${GetJSCodeName(v)}`).join();
		const screenApiParamsWithDefaults = screenApis
			.map((v: Node | null | any) => {
				let code = GetJSCodeName(v);
				if (code === 'viewModel') {
					code = `${code} = ViewModelKeys.${GetCodeName(screen)}`;
				}
				return `${code}`;
			})
			.join();
		routes.push(
			bindTemplate(template, {
				route_name: `${GetCodeName(screen)}`,
				overrides,
				component: GetCodeName(screen),
				screenApiParams,
				screenApiParamsWithDefaults,
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
		relative: './src',
		relativeFilePath: `./Routes.tsx`,
		name: `Routes.tsx`
	};
}
export function BindScreensToTemplate(language = UITypes.ReactNative) {
	const screens = GetScreens();
	let template = fs.readFileSync('./app/templates/screens/screen.tpl', 'utf8');
	const moreresults = [];
	let fileEnding = '.js';
	switch (language) {
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			fileEnding = '.tsx';
			break;
	}

	const result = screens
		.map((screen: { id: string }) => {
			const screenOptions = GetConnectedScreenOptions(screen.id);
			if (screenOptions && screenOptions.length) {
				const reactScreenOption = screenOptions.find(
					(x: any) => GetNodeProp(x, NodeProperties.UIType) === language
				);
				if (reactScreenOption) {
					template = GenerateScreenMarkup(screen.id, language);
					const screenOptionSrc = GenerateScreenOptionSource(reactScreenOption, screen, language);
					if (screenOptionSrc) {
						moreresults.push(...screenOptionSrc.filter((x) => x));
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
				relative: './src/screens',
				relativeFilePath: `./${GetCodeName(screen).toJavascriptName()}${fileEnding}`,
				name: GetCodeName(screen)
			};
		})
		.filter((x: any) => x);
	switch (language) {
		case UITypes.ElectronIO:
		case UITypes.ReactWeb:
			moreresults.push(GenerateElectronIORoutes(screens, language));
			break;
	}
	const all_nodes = NodesByType(GetState(), [ NodeTypes.ComponentNode ]);
	const sharedComponents = all_nodes.filter((x: any) => GetNodeProp(x, NodeProperties.SharedComponent));
	const relPath = './src/shared';
	sharedComponents.map((sharedComponent: any) => {
		moreresults.push(...GenerateRNComponents(sharedComponent, relPath, language));
	});

	moreresults.push({
		template: bindTemplate(
			`{{source}}
  `,
			{
				source: NodesByType(GetState(), [ NodeTypes.Screen, NodeTypes.ScreenOption, NodeTypes.ComponentNode ])
					.filter((node: GraphMethods.Node) => {
						switch (GetNodeProp(node, NodeProperties.NODEType)) {
							case NodeTypes.ComponentNode:
								return GetNodeProp(node, NodeProperties.IsShared);
						}
						return true;
					})
					.map((t: any) => `export const ${GetCodeName(t)} = '${GetCodeName(t)}';`)
					.unique()
					.join(NEW_LINE)
			}
		),
		relative: './src/actions',
		relativeFilePath: `./screenInstances.ts`,
		name: `screenInstances.ts`
	});
	moreresults.push({
		template: bindTemplate(
			`
    export const $CreateModels = {
      {{create_viewmodels}}
    };
    export const $UpdateModels = {
        {{update_viewmodels}}
    };`,
			{
				update_viewmodels: NodesByType(GetState(), [ NodeTypes.Screen ])
					.filter((a: GraphMethods.Node) => {
						return GetNodeProp(a, NodeProperties.ViewType) === ViewTypes.Update;
					})
					.map((t: GraphMethods.Graph) => {
						return `${GetCodeName(t)}: '${GetCodeName(t)}'`;
					})
					.join(',' + NEW_LINE),
				create_viewmodels: NodesByType(GetState(), [ NodeTypes.Screen ])
					.filter((a: GraphMethods.Node) => {
						return GetNodeProp(a, NodeProperties.ViewType) === ViewTypes.Create;
					})
					.map((t: GraphMethods.Graph) => {
						return `${GetCodeName(t)}: '${GetCodeName(t)}'`;
					})
					.join(',' + NEW_LINE)
			}
		),
		relative: './src/actions',
		relativeFilePath: `./screenInfo.ts`,
		name: `screenInfo.ts`
	});

	return [ ...result, ...moreresults ];
}

/**
 * Links the api together.
 * @param {object} args
 */
function extractApiJsCode(args: any = {}) {
	let { node, graph } = args;
	const { options, callback = () => {} } = args;
	const requiredChanges: any[] = [];
	const temp = (queryParameter: GraphMethods.Node) => {
		const param = getNodesByLinkType(graph, {
			id: queryParameter.id,
			type: LinkType.ComponentApiConnection,
			direction: TARGET
		})
			.filter((item) => {
				const { screenOption, component } = options;
				return GetNodesLinkedTo(null, {
					id: item ? item.id : null,
					link: LinkType.ComponentApiConnector
				}).find((instanceEvent: { id: any }) =>
					[
						...GetNodesLinkedTo(null, {
							id: instanceEvent.id,
							link: LinkType.LifeCylceMethodInstance
						}),
						...GetNodesLinkedTo(null, {
							id: instanceEvent.id,
							link: LinkType.EventMethodInstance
						})
					].find(
						(lifeCycleMethod) =>
							(screenOption &&
								existsLinkBetween(graph, {
									source: lifeCycleMethod.id,
									target: screenOption.id
								})) ||
							(component &&
								existsLinkBetween(graph, {
									source: lifeCycleMethod.id,
									target: component.id
								}))
					)
				);
			})
			.filter((x) => x)
			.find((x_temp) => x_temp);

		if (param) {
			const internalApiConnection = getNodesByLinkType(graph, {
				id: param.id,
				type: LinkType.ComponentApi,
				direction: SOURCE
			}).find((x) => x);

			const value = getNodesByLinkType(graph, {
				id: param.id,
				type: LinkType.ComponentApiConnection,
				direction: SOURCE
			}).find((x_temp) => GetNodeProp(x_temp, NodeProperties.NODEType) === NodeTypes.DataChain);
			if (value) {
				let input_ = 'this.props.state';
				if (internalApiConnection) {
					requiredChanges.push(GetJSCodeName(internalApiConnection));
					input_ = `this.state.${GetJSCodeName(internalApiConnection)}`;
				}
				return `${GetJSCodeName(queryParameter)}: DC.${GetCodeName(value, {
					includeNameSpace: true
				})}(${input_})`;
			}
			if (internalApiConnection) {
				requiredChanges.push(GetJSCodeName(internalApiConnection));
				const input_ = `this.state.${GetJSCodeName(internalApiConnection)}`;
				return `${GetJSCodeName(queryParameter)}:  ${input_}`;
			}
		}
	};
	const result = temp(node);
	callback(requiredChanges.unique());
	return result;
}
