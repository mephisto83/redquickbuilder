// @flow
import React, { Component } from 'react';
import TopViewer from './topviewer';
import MonacoEditor from 'react-monaco-editor';
import Box from './box';
import * as monaco from 'monaco-editor';
import Javascript from './codeditor/javascript';
import { SIDE_PANEL_OPEN, Node, SELECTED_NODE, CHANGE_NODE_PROPERTY } from '../actions/uiactions';
import { Visual } from '../templates/electronio/v1/app/actions/uiactions';
import { UIConnect } from '../utils/utils';
import { GetNodeProp } from '../methods/graph_methods';
import { NodeProperties } from '../constants/nodetypes';

class CodeEditor extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			original: '',
			value: ''
		};
	}
	editorWillMount() {
		// Register a new language
		// monaco.languages.register({ id: 'mySpecialLanguage' });


		// Register a tokens provider for the language
		monaco.languages.setMonarchTokensProvider('typescript', Javascript());
		monaco.editor.setTheme('vs-dark');
	}
	componentDidUpdate(prevProps: any) {
		// Typical usage (don't forget to compare props):
		if (this.props.value !== prevProps.value) {
			const { state } = this.props;
			const currentNode = Node(state, Visual(state, SELECTED_NODE));
			this.setState({ value: GetNodeProp(currentNode, this.props.prop || NodeProperties.Lambda) });
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
		let offsetWidth = Visual(state, SIDE_PANEL_OPEN) ? 250 : 0;
		const currentNode = Node(state, Visual(state, SELECTED_NODE));
		const code = GetNodeProp(currentNode, NodeProperties.Lambda);

		return (
			<TopViewer active={this.props.active} style={{ width: `calc(100% - ${offsetWidth}px)` }}>
				<div style={{ position: 'relative' }}>
					<Box title={'Editor'}>
						<div className="text-left" style={{ display: currentNode ? '' : 'none' }}>
							<a
								className="btn btn-social-icon btn-bitbucket"
								onClick={() => {
									const id = currentNode.id;
									this.props.graphOperation(CHANGE_NODE_PROPERTY, {
										prop: this.props.prop || NodeProperties.Lambda,
										id,
										value: this.state.value
									});
								}}
							>
								<i className="fa fa-save" />
							</a>
						</div>
						<div style={{ margin: 0 }}>
							<MonacoEditor
								height="700"
								width={'100%'}
								language={
									this.props.language ||
									(currentNode && GetNodeProp(currentNode, NodeProperties.CS) ? 'csharp' : null) ||
									'typescript'
								}
								onChange={(val: string) => {
									this.setState({ value: val });
								}}
								value={this.state.value || this.props.value}
								options={options}
							/>
						</div>
					</Box>
				</div>
			</TopViewer>
		);
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
