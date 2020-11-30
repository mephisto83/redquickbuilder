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
	editorWillMount() {}

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
		this.editorWillMount();
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
										[ /\[error.*/, 'custom-error' ],
										[ /\[notice.*/, 'custom-notice' ],
										[ /\[info.*/, 'custom-info' ],
										[ /\[[a-zA-Z 0-9:]+\]/, 'custom-date' ]
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
											suggestions: [ ...suggestions ]
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
							this.setState({ value: `${val}` });
							if (this.props.onChange) {
								this.props.onChange({ target: { value: val } });
							}
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
function getGlobalSuggestions(): any[] {
	return [
		{
			label: 'Navigate to dashboard',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [ 'The ${1:agent} navigates to the dashboard ${2:dashboard}.' ].join(''),
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
			insertText: [ 'Execute the function ${1:method}' ].join(''),
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
			insertText: [ 'Append the output ${1:property} property to the existing ${2:model} ${3:property}.' ].join(
				''
			),
			documentation: 'Append a value to a list property.'
		},
		{
			label: 'Set to models property with property',
			kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
			insertText: [ 'Set the output ${1:property} property to the existing ${2:model} ${3:property}.' ].join(''),
			documentation: 'Set to models property to a model property.'
		}
	];
}
