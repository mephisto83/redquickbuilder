// @flow
import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import {
	editorBackground,
	editorForeground,
	editorInactiveSelection,
	editorSelectionHighlight,
	editorActiveIndentGuides,
	editorIndentGuides
} from 'monaco-editor/esm/vs/platform/theme/common/colorRegistry';
import {
	SIDE_PANEL_OPEN,
	SELECTED_NODE,
	CHANGE_NODE_PROPERTY,
	NodeTypes,
	NodesByType,
	GetCodeName,
	GetLambdaVariableTitle
} from '../actions/uiActions';
import { GetNodeProp, GetNodesLinkedTo } from '../methods/graph_methods';
import { NodeProperties, NEW_LINE, LinkType } from '../constants/nodetypes';
import * as UIA from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import { getTextEditorSuggestions } from '../service/naturallang';

export default class TextAreaEditor extends Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {
			original: '',
			value: ''
		};
	}

	componentDidUpdate(prevProps: any) {
		// Typical usage (don't forget to compare props):
		if (prevProps.active !== this.props.active && this.props.active && this.state.editor) {
		}
		if (this.props.value !== this.state.value) {
			this.setState({ value: this.props.value });
		}
		if (this.props.language !== prevProps.language) {
			this.setState({ language: this.props.language });
		}
	}
	componentDidMount() {
	}
	render() {
		// if (!this.props.active) {
		// 	return <div />;
		// }
		const { state } = this.props;
		const options = {
			automaticLayout: true,
			selectOnLineNumbers: true
		};
		let offsetWidth = UIA.Visual(state, SIDE_PANEL_OPEN) ? 250 : 0;
		const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
		const code = GetNodeProp(currentNode, NodeProperties.Lambda);
		const defs = '//<!-uiactions - defs->';
		let value: string = this.props.value || '';

		return (
			<div style={{ position: 'relative' }}>
				<div style={{ margin: 0 }}>
					<MonacoEditor
						height={this.props.active ? '250' : '10'}
						width={'100%'}
						editorWillMount={(editor) => {
							// Register a new language
							monaco.languages.register({ id: 'mySpecialLanguage' });
							this.setState({ editor });
							// Register a tokens provider for the language
							monaco.languages.setMonarchTokensProvider('mySpecialLanguage', {
								tokenizer: {
									root: [
										[/\[error.*/, 'custom-error'],
										[/\[notice.*/, 'custom-notice'],
										[/\[info.*/, 'custom-info'],
										[/\[[a-zA-Z 0-9:]+\]/, 'custom-date']
									]
								}
							});

							// Define a new theme that contains only rules that match this language
							monaco.editor.defineTheme('myCoolTheme', {
								base: 'vs-dark',
								colors: {
									[editorBackground]: '#1E1E1E',
									[editorForeground]: '#D4D4D4',
									[editorInactiveSelection]: '#3A3D41',
									[editorIndentGuides]: '#404040',
									[editorActiveIndentGuides]: '#707070',
									[editorSelectionHighlight]: '#ADD6FF26'
								},
								inherit: true,
								rules: [
									{ token: 'custom-info', foreground: '808080' },
									{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
									{ token: 'custom-notice', foreground: 'FFA500' },
									{ token: 'custom-date', foreground: '008800' }
								]
							});

							// Register a completion item provider for the new language
							monaco.languages.registerCompletionItemProvider('mySpecialLanguage', {
								provideCompletionItems: (model, position) => {
									console.log(model);
									console.log(position);

									var textUntilPosition = model.getValueInRange({
										startLineNumber: position.lineNumber,
										startColumn: 1,
										endLineNumber: position.lineNumber,
										endColumn: position.column
									});
									let lastIndex = textUntilPosition.lastIndexOf(' ');
									let searchText = textUntilPosition.substring(lastIndex);
									let suggestions = getTextEditorSuggestions(searchText, textUntilPosition, this.props.context);
									if (suggestions && suggestions.length) {
										return {
											suggestions: [...suggestions]
										};
									}
									suggestions = getGlobalSuggestions();
									return { suggestions: suggestions };
								}
							});
							monaco.editor.setTheme('vs');
						}}
						language={'mySpecialLanguage'}
						theme="myCoolTheme"
						onChange={(val: string) => {
							let old_value = this.state.value;

							this.setState({ value: `${val}` }, () => {
								if (this.props.onChange && val !== old_value) {
									this.props.onChange({ target: { value: val } });
								}
							});
						}}
						value={value}
						options={options}
					/>
				</div>
			</div>
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
  ${[...screenEffectApis, ...contextParameters]
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
export declare function GetModelInstanceObject(key: any, instance: any, fetchModel?: Function): any;
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
			const models: Node[] = NodesByType(state, [NodeTypes.Model, NodeTypes.Enumeration])
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
			const models: Node[] = NodesByType(state, [NodeTypes.Model, NodeTypes.Enumeration])
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
function getGlobalSuggestions(): any[] {
	return [
		{
			label: 'Navigate to dashboard',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: ['The ${1:agent} navigates to the dashboard ${2:dashboard}.'].join(''),
			documentation: 'Navigates to the dashboard.'
		},
		{
			label: 'Navigates to the agent page',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [
				"The ${1:agent} navigates to the ${2:model} ${3:viewtype} screen with the ${4:model}'s ${3:property} as ${3:argtype}."
			].join(''),
			documentation: 'Navigates to the agent page.'
		},
		{
			label: 'Execute func',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: ['Execute the function ${1:method}'].join(''),
			documentation: 'Define which method will be called in an after effect'
		},
		{
			label: 'Create new',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [
				'Create a new ${0:model}.'
			].join(''),
			documentation: 'Create a new instance of a model.'
		},
		{
			label: 'Check existing',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [
				'Check for an existing ${1:model} instance with an ${2:agent} ${3:property} equaling the ${4:model} ${5:property} property.'
			].join(''),
			documentation: 'Checks for an existing model, exiting if not found.'
		},
		{
			label: `Check doesn't existing`,
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [
				'Check for a nonexisting ${1:model} instance with an ${2:agent} ${3:property} equaling the ${4:model} ${5:property} property.'
			].join(''),
			documentation: 'Checks for an existing model, exiting if not found.'
		},
		{
			label: 'Find existing',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [
				'Find an existing ${1:model} instance with an ${2:agent} ${3:property} equaling the ${4:model} ${5:property} property.'
			].join(''),
			documentation: 'Checks for an existing model, exiting if not found.'
		},
		{
			label: 'Append to models list property',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: ['Append the output ${1:property} property to the existing ${2:model} ${3:property}.'].join(
				''
			),
			documentation: 'Append a value to a list property.'
		},
		{
			label: 'Set to models property with property',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: ['Set the output ${1:property} property to the existing ${2:model} ${3:property}.'].join(''),
			documentation: 'Set to models property to a model property.'
		}
	];
}
