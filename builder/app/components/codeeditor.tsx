// @flow
import React, { Component } from 'react';
import TopViewer from './topviewer';
import MonacoEditor from 'react-monaco-editor';
import Box from './box';
import * as monaco from 'monaco-editor';
import Javascript from './codeditor/javascript';
import {
	SIDE_PANEL_OPEN,
	SELECTED_NODE,
	CHANGE_NODE_PROPERTY,
	NodeTypes,
	NodesByType,
	GetCodeName,
	GetLambdaVariableTitle
} from '../actions/uiActions';
import { UIConnect } from '../utils/utils';
import { GetNodeProp, GetNodesLinkedTo } from '../methods/graph_methods';
import { NodeProperties, NEW_LINE, MakeConstant, LinkType } from '../constants/nodetypes';
import fs from 'fs';
import * as UIA from '../actions/uiActions';
import ModelGenerator, { fs_readFileSync } from '../generators/modelgenerators';
import { Node } from '../methods/graph_types';
import ConstantsGenerator from '../generators/constantsgenerator';
import { GenerateModelKeys } from '../service/keyservice';

class CodeEditor extends Component<any, any> {
	constructor(props: any) {
		super(props);

		let definitions = '';
		try {
			definitions = fs_readFileSync('./app/templates/reactweb/v1/src/actions/uiactions.d.ts', 'utf8');
		} catch (e) {
			console.error(e);
			try {
				definitions = fs_readFileSync('./templates/reactweb/v1/src/actions/uiactions.d.ts', 'utf8');
			} catch (e) {}
		}
		this.state = {
			original: '',
			value: '',
			definitions
		};
	}
	editorWillMount() {}

	componentDidUpdate(prevProps: any) {
		// Typical usage (don't forget to compare props):
		if (this.props.value !== prevProps.value) {
			const { state } = this.props;
			const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
			this.setState({
				value: GetNodeProp(currentNode, this.props.prop || NodeProperties.Lambda)
			});
		}
		if (this.props.language !== prevProps.language) {
			this.setState({ language: this.props.language });
		}
	}
	componentDidMount() {
		this.editorWillMount();
	}
	render() {
		if (!this.props.active) {
			return <div />;
		}
		const { state } = this.props;
		const options = {
			selectOnLineNumbers: true
		};
		let offsetWidth = UIA.Visual(state, SIDE_PANEL_OPEN) ? 250 : 0;
		const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
		const code = GetNodeProp(currentNode, NodeProperties.Lambda);
		const defs = '//<!-uiactions - defs->';
		let value: string = this.state.value || this.props.value || '';
		if (!GetNodeProp(currentNode, NodeProperties.CS)) value = this.untransformLambda(value);
		if (!GetNodeProp(currentNode, NodeProperties.CS))
			if (value.indexOf(defs) === -1) {
				let tsModels = ModelGenerator.GenerateTs({ state: this.props.state });
				let contextInterfaces = this.generateContextInterfaces();
				let temps = GenerateModelKeys({
					state,
					codeGenerator: true
				});
				let modelkey_stuff = '';
				temps.map((t: any) => {
					if (t && t.template) modelkey_stuff += t.template + NEW_LINE;
				});
				const enumerations_ts = NodesByType(state, NodeTypes.Enumeration).map((node: any) => {
					const enums_ts = GetNodeProp(node, NodeProperties.Enumeration) || [];
					const larg_ts: any = {};
					enums_ts.forEach((t: { value: any }) => {
						larg_ts[MakeConstant(t.value || t)] = t.value;
					});
					return {
						name: GetNodeProp(node, NodeProperties.CodeName),
						model: larg_ts
					};
				});

				let common_functions: any = ModelGenerator.GenerateCommon({ state: this.props.state });
				let _consts = ConstantsGenerator.GenerateTs({
					values: [ ...enumerations_ts ],
					state: this.props.state
				});
				let constants = Object.keys(_consts)
					.map((key: string) => {
						let { template } = _consts[key];
						return `
          ${template || ''}`;
					})
					.join(NEW_LINE);
				let modelTsScript = Object.keys(tsModels)
					.map((key: string) => {
						let { template } = tsModels[key];
						return `
        ${template || ''}`;
					})
					.join(NEW_LINE);
				value += `
${defs}
//#region
${contextInterfaces}
//#endregion
//#region constants
${constants}
//#endregion
//#region models
${modelTsScript}
//#endregion
//#region
${modelkey_stuff}
//#endregion
//#region mocks
export const titleService = {
  get: (str: string): string => { return ''; }
};
//#endregion
//#region common functions
${Object.keys(common_functions)
					.map((key: string) => {
						let { template } = common_functions[key];
						return `
  ${template || ''}`;
					})
					.join(NEW_LINE)}
//#endregion
//#region section
${this.state.definitions}
//#endregion
  `;
			}
		return (
			<TopViewer active={this.props.active} style={{ width: `calc(100% - ${offsetWidth}px)` }}>
				<div style={{ position: 'relative', height: '100%' }}>
					<Box title={'Editor'}>
						<div className="text-left" style={{ display: currentNode ? '' : 'none' }}>
							<a
								className="btn btn-social-icon btn-bitbucket"
								onClick={() => {
									const id = currentNode.id;
									let lambdaValue = `${this.state.value}`.split(defs)[0] || '';
									let _insertArgs: any;
									if (!GetNodeProp(currentNode, NodeProperties.CS))
										lambdaValue = this.transformLambdaValue(lambdaValue, (insertArgs: any) => {
											_insertArgs = insertArgs;
										});
									this.props.graphOperation(CHANGE_NODE_PROPERTY, {
										prop: this.props.prop || NodeProperties.Lambda,
										id,
										value: lambdaValue
									});
									if (_insertArgs) {
										this.props.graphOperation(CHANGE_NODE_PROPERTY, {
											prop: this.props.prop || NodeProperties.LambdaInsertArguments,
											id,
											value: _insertArgs
										});
									}
								}}
							>
								<i className="fa fa-save" />
							</a>
						</div>
						<div style={{ margin: 0 }}>
							<MonacoEditor
								height="700"
								width={'100%'}
								editorWillMount={(editor) => {
									monaco.editor.setTheme('vs-dark');
								}}
								language={
									this.props.language ||
									(currentNode && GetNodeProp(currentNode, NodeProperties.CS) ? 'csharp' : null) ||
									'typescript'
								}
								onChange={(val: string) => {
									this.setState({ value: `${val}` });
								}}
								value={value}
								options={options}
							/>
						</div>
					</Box>
				</div>
			</TopViewer>
		);
	}
	generateContextInterfaces(): string {
		let result = '';
		let { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
		if (!currentNode) {
			return '';
		}
		let screenEffectApis = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
			id: currentNode.id,
			link: LinkType.ScreenEffectApi
		}).map((node: Node) => {
			return UIA.GetJSCodeName(node);
		});
		let contextParameters: string[] = [];
		GetNodesLinkedTo(UIA.GetCurrentGraph(), {
			id: currentNode.id,
			link: LinkType.ScreenEffectApi
		}).forEach((node: Node) => {
			let nodeParams = GetNodeProp(node, NodeProperties.ContextParams) || [];
			contextParameters.push(...nodeParams);
		});

		if (currentNode) {
			result = `
let $internalComponentState: ComponentState;
interface ComponentState {
  ${[ ...screenEffectApis, ...contextParameters ]
		.unique()
		.map((param: string) => {
			return `${param}: string | number | null,`;
		})
		.join(NEW_LINE)}
  viewModel: string,
  value: string,
  model: string
}


export declare const BATCH = "BATCH";
export declare const UI_UPDATE = "UI_UPDATE";
export declare const UISI_UPDATE = "UISI_UPDATE";
export declare const UISMI_UPDATE = "UISMI_UPDATE";
export declare const UISMI_UPDATE_OBJECT = "UISMI_UPDATE_OBJECT";
export declare const UISP_UPDATE = "UISP_UPDATE";
export declare const UIMI_UPDATE = "UIMI_UPDATE";
export declare const UI_MODELS = "UI_MODELS";
export declare const SITE = "SITE";
export declare const RESET_ALL = "RESET_ALL";
export declare const SCREEN_PROPERTIES = "SCREEN_PROPERTIES";
export declare const MODEL_INSTANCE = "MODEL_INSTANCE";
export declare const MODEL_INSTANCE_DIRTY = "MODEL_INSTANCE_DIRTY";
export declare const MODEL_INSTANCE_ON_BLUR = "MODEL_INSTANCE_ON_BLUR";
export declare const MODEL_INSTANCE_FOCUSED = "MODEL_INSTANCE_FOCUSED";
export declare const MODEL_INSTANCE_ON_FOCUS = "MODEL_INSTANCE_ON_FOCUS";
export declare const APP_STATE = "APP_STATE";
export declare const SCREEN_INSTANCE = "SCREEN_INSTANCE";
export declare const SCREEN_MODEL_INSTANCE = "SCREEN_MODEL_INSTANCE";
export declare const SCREEN_MODEL_INSTANCE_OBJECT = "SCREEN_MODEL_INSTANCE_OBJECT";
export declare const SCREEN_INSTANCE_DIRTY = "SCREEN_INSTANCE_DIRTY";
export declare const SCREEN_INSTANCE_ON_BLUR = "SCREEN_INSTANCE_ON_BLUR";
export declare const SCREEN_INSTANCE_FOCUSED = "SCREEN_INSTANCE_FOCUSED";
export declare const SCREEN_INSTANCE_ON_FOCUS = "SCREEN_INSTANCE_ON_FOCUS";
export declare const VISUAL = "VISUAL";
export declare const UIKeys: {
    HAS_CREDENTIALS: string;
    CREDENTIALS: string;
    USER_ID: string;
};
export declare function GetItems(modelType: any): unknown[];
export declare function GetScreenProperties(screen: any): any;
export declare function UISP(screen: any, property: any, value: any): {
    type: string;
    key: string;
    screen: any;
    property: any;
    value: any;
};
export declare function GetItem(modelType: any, id: any): any;
export declare function setGetState(): (dispatch: any, getState: any) => void;
export declare function GetDispatch(): any;
export declare function GetState(): any;
export declare function setTestGetState(func: any): void;
export declare function setDispatch(func: any): void;
export declare function UIV(item: any, value: any): {
    type: string;
    item: any;
    value: any;
    section: any;
};
export declare function UIC(section: any, item: any, value: any): {
    type: string;
    item: any;
    value: any;
    section: any;
};
export declare function UIModels(model: any, value: any): {
    type: string;
    model: any;
    value: any;
};
export declare function Chain(id: any, funcs: any): any;
export declare function UISI(form: any, model: any, item: any, value: any): {
    type: string;
    key: string;
    form: any;
    model: any;
    item: any;
    value: any;
};
export declare function UISMI(form: any, model: any, instance: any, item: any, value: any): {
    type: string;
    key: string;
    form: any;
    model: any;
    instance: any;
    item: any;
    value: any;
};
export declare function UISMIO(form: any, model: any, instance: any, value: any): {
    type: string;
    key: string;
    form: any;
    model: any;
    instance: any;
    value: any;
};
export declare function UIMI(form: any, model: any, instance: any, item: any, value: any): {
    type: string;
    key: string;
    form: any;
    model: any;
    instance: any;
    item: any;
    value: any;
};
export declare function Batch(a: any, b?: any, c?: any, d?: any, e?: any, f?: any, g?: any, h?: any, i?: any): {
    type: string;
    batch: any[];
};
export declare function Visual(state: any, key: any): any;
export declare function GetC(state: any, key: any, id: any): any;
export declare function GetK(state: any, key: any, id: any, instance: any): any;
export declare function Get(state: any, key: any): any;
export declare function setNavigate(navigation: any): void;
export declare function navigate(a: any, b: any, c: any): any;
export declare function GetScreenParam(param: any): any;
export declare function GetScreenInstance(key: any, id: any): any;
export declare function GetModelInstance(key: any, instance: any, id: any): any;
export declare function GetScreenInst(state: any): any;
export declare function GetScreenModelInst(state: any, instance: any, id: any): any;
export declare function GetScreenModelDirtyInst(state: any, instance: any, id: any): any;
export declare function GetScreenModelFocusedInst(state: any, instance: any, id: any): any;
export declare function GetScreenModelBlurInst(state: any, instance: any, id: any): any;
export declare function GetScreenModelFocusInst(state: any, instance: any, id: any): any;
export declare function GetAppState(state: any): any;
export declare function GetModelInst(state: any, instance?: any, id?: any): any;
export declare function GetScreenInstanceBlur(key: any, id: any): any;
export declare function GetModelInstanceBlur(key: any, instance: any, id: any): any;
export declare function GetScreenInstanceBlurObject(key: any): any;
export declare function GetModelInstanceBlurObject(key: any, instance: any): any;
export declare function GetScreenInstBlur(state: any): any;
export declare function GetModelInstBlur(state: any, instance: any): any;
export declare function GetScreenInstanceFocus(key: any, id: any): any;
export declare function GetModelInstanceFocus(key: any, instance: any, id: any): any;
export declare function GetScreenInstanceFocusObject(key: any): any;
export declare function GetModelInstanceFocusObject(key: any, instance: any): any;
export declare function GetScreenInstFocus(state: any): any;
export declare function GetModelInstFocus(state: any, instance: any): any;
export declare function GetScreenInstanceDirty(key: any, id: any): any;
export declare function GetModelInstanceDirty(key: any, instance: any, id: any): any;
export declare function GetScreenInstanceDirtyObject(key: any): any;
export declare function GetModelInstanceDirtyObject(key: any, instance: any): any;
export declare function GetScreenInstDirty(state: any): any;
export declare function GetModelInstDirty(state: any, instance: any): any;
export declare function GetScreenInstanceFocused(key: any, id: any): any;
export declare function GetModelInstanceFocused(key: any, instance: any, id: any): any;
export declare function GetScreenInstanceFocusedObject(key: any): any;
export declare function GetModelInstanceFocusedObject(key: any, instance: any): any;
export declare function GetScreenInstFocused(state: any): any;
export declare function GetModelInstFocused(state: any, instance: any): any;
export declare function GetScreenInstanceObject(key: any): any;
export declare function GetScreenModelInstance(key: any, viewModel: any): any;
export declare function GetScreenModelBlurInstance(key: any, viewModel: any): any;
export declare function GetScreenModelDirtyInstance(key: any, viewModel: any): any;
export declare function GetScreenModelFocusInstance(key: any, viewModel: any): any;
export declare function GetScreenModelFocusedInstance(key: any, viewModel: any): any;
export declare function GetAppStateObject(key: any): any;
export declare function GetModelInstanceObject(key: any, instance: any): any;
export declare function updateScreenInstance(model: any, id: any, value: any, options?: any): (dispatch: any, getState: any) => void;
export declare function updateScreenInstanceObject(model: any, instance: any, value: any): (dispatch: any, getState: any) => void;
export declare function clearScreenInstance(model: any, id: any, options?: any): (dispatch: any) => void;
export declare function updateScreenInstanceBlur(model: any, id: any, options?: any): (dispatch: any, getState: any) => void;
export declare function updateScreenInstanceFocus(model: any, id: any, options?: any): (dispatch: any, getState: any) => void;
export declare function updateModelInstance(model: any, instance: any, id: any, value: any): (dispatch: any, getState: any) => void;
export declare function clearModelInstance(model: any, instance: any, id: any): (dispatch: any, getState: any) => void;
export declare function updateModelInstanceBlur(model: any, instance: any, id: any): (dispatch: any, getState: any) => void;
export declare function updateModelInstanceFocus(model: any, instance: any, id: any): (dispatch: any, getState: any) => void;
export declare function GetModelProperty($id: any, modelType: string, propertyName: string, fetchModel: Function): any;
export declare function LoadModel(viewModelDefault: string, modelKey: string, retrieveParameters: Function): any;
export declare function StoreInLake(a: any, modelKey: string): any;
export declare function StoreModelArray(a: any[], modelType: string, stateKey: string): any[];
export declare function GetMenuDataSource(GetMenuSource: any, RedGraph: any): any;
export declare function StoreResultInReducer(x: any, modelType: string, navigate: any): void;
export declare function NavigateToRoute(id: string, navigate: any, routes: any): void;
export declare function NavigateToScreen($id?: any, $internalComponentState?: {
    [str: string]: any;
    label?: string | number | null;
    viewModel?: string | number | null;
    value?: string | number | null;
    model?: string | number | null;
} | null, route?: string, navigate?: any): {
    value: any;
};
      `;
		}
		return result;
	}
	untransformLambda(value: string): string {
		let { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
		if (currentNode) {
			const models: Node[] = NodesByType(state, [ NodeTypes.Model, NodeTypes.Enumeration ])
				.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
				.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
			models.sort((a, b) => GetCodeName(a).length - GetCodeName(b).length).forEach((item) => {
				var regex = new RegExp(`${GetLambdaVariableTitle(item, true)}`, 'g');
				value = value.replace(regex, GetCodeName(item));
			});
		}
		return value;
	}
	transformLambdaValue(lambdaValue: string, callback?: Function): string {
		let { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
		if (currentNode) {
			let tempvalue = GetNodeProp(currentNode, NodeProperties.LambdaInsertArguments) || {};
			const models: Node[] = NodesByType(state, [ NodeTypes.Model, NodeTypes.Enumeration ])
				.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromController))
				.filter((x: any) => !GetNodeProp(x, NodeProperties.ExcludeFromGeneration));
			models.sort((a, b) => GetCodeName(a).length - GetCodeName(b).length).forEach((item: Node) => {
				var regex = new RegExp('\\b' + `${GetCodeName(item)}` + '\\b', 'g');
				let before = lambdaValue;
				lambdaValue = lambdaValue.replace(regex, GetLambdaVariableTitle(item));
				if (before !== lambdaValue) {
					tempvalue[GetLambdaVariableTitle(item, false, true)] = item.id;
				}
			});
			if (callback) {
				callback(tempvalue);
			}
		}
		return lambdaValue;
	}
}

export default UIConnect(CodeEditor);

let running = false;
let changed = false;
function throttled(func: Function) {
	if (!running) {
		running = true;
		setTimeout(() => {
			if (changed) {
				changed = false;
				throttled(func);
			} else {
				changed = false;
				running = false;
				func();
			}
		}, 1000);
	} else {
		changed = true;
	}
}
