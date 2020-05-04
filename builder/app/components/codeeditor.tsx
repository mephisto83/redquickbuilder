// @flow
import React, { Component } from 'react';
import TopViewer from './topviewer';
import MonacoEditor from 'react-monaco-editor';
import Box from './box';
import * as monaco from 'monaco-editor';
import Javascript from './codeditor/javascript';

export default class CodeEditor extends Component<any, any> {
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
	}
	render() {
		const options = {
			selectOnLineNumbers: true
		};
		return (
			<TopViewer active={this.props.active}>
				<div style={{ position: 'relative' }}>
					<Box title={'Editor'}>
						<MonacoEditor
							height="600"
							width={'100%'}
							language="typescript"
							value={this.state.value}
							options={options}
						/>
					</Box>
				</div>
			</TopViewer>
		);
	}
}
