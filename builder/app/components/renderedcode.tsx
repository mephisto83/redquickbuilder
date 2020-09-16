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

export default class RenderedCode extends Component<any, any> {
	constructor(props: any) {
		super(props);
	}
	render() {
		const { state } = this.props;
		const options = {
			automaticLayout: true,
			selectOnLineNumbers: true
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, SELECTED_NODE));
		let value: string = this.props.value || '';
		return (
			<Box title={'Editor'}>
				<MonacoEditor
					height="700"
					width={'100%'}
					editorWillMount={(editor) => {
						monaco.editor.setTheme('vs-dark');
					}}
					language={this.props.language || 'csharp'}
					onChange={(val: string) => {}}
					value={value}
					options={options}
				/>
			</Box>
		);
	}
}
