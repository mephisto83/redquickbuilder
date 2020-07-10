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
} from '../actions/uiactions';
import { UIConnect } from '../utils/utils';
import { GetNodeProp, GetNodesLinkedTo } from '../methods/graph_methods';
import { NodeProperties, NEW_LINE, MakeConstant, LinkType } from '../constants/nodetypes';
import fs from 'fs';
import * as UIA from '../actions/uiactions';
import ModelGenerator from '../generators/modelgenerators';
import { Node } from '../methods/graph_types';
import ConstantsGenerator from '../generators/constantsgenerator';
import { GenerateModelKeys } from '../service/keyservice';

class CodeEditor extends Component<any, any> {
	constructor(props: any) {
		super(props);
		let definitions = fs.readFileSync('./app/templates/reactweb/v1/src/actions/uiactions.d.ts', 'utf8');
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
		value = this.untransformLambda(value);
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
				<div style={{ position: 'relative' }}>
					<Box title={'Editor'}>
						<div className="text-left" style={{ display: currentNode ? '' : 'none' }}>
							<a
								className="btn btn-social-icon btn-bitbucket"
								onClick={() => {
									const id = currentNode.id;
									let lambdaValue = `${this.state.value}`.split(defs)[0] || '';
									let _insertArgs: any;
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
		if (currentNode) {
			result = `
let $internalComponentState: ComponentState;
interface ComponentState {
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
