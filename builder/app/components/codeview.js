// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
import TopViewer from './topviewer';
import Box from './box';
import SelectInput from './selectinput';
import { NodeTypes, NodeProperties, NameSpace } from '../constants/nodetypes';
import ModelGenerator from '../generators/modelgenerators';
import NamespaceGenerator from '../generators/namespacegenerator';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import TextInput from './textinput';
import { GraphKeys } from '../methods/graph_methods';

const MODEL_CODE = 'MODEL_CODE';
const SELECTED_CODE_VIEW_TYPE = 'SELECTED_CODE_VIEW_TYPE';
class CodeView extends Component {
    active() {
        return !!this.props.active;
    }
    render() {
        var { state } = this.props;
        let active = this.active();
        let models = UIA.NodesByType(state, NodeTypes.Model, { useRoot: true, excludeRefs: true }).map(t => {
            return {
                title: UIA.GetNodeTitle(t),
                value: t.id
            }
        });
        let codeString;
        let info = UIA.Visual(state, MODEL_CODE) || null;
        let graphRoot = UIA.GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphKeys.NAMESPACE] : null;
        if (namespace) {
            codeString = NamespaceGenerator.Generate({
                ...info,
                namespace,
                space: NameSpace.Model
            })
        }
        return (
            <TopViewer active={active}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-2">
                            <Box primary={true} title={Titles.Project}>
                                <TextInput
                                    onChange={(val) => {
                                        this.props.setRootGraph(GraphKeys.NAMESPACE, val);
                                    }}
                                    label={Titles.NameSpace}
                                    value={namespace} />
                            </Box>
                            <Box primary={true} title={Titles.Models}>
                                <SelectInput options={models}
                                    label={Titles.Models}
                                    onChange={(value) => {
                                        this.props.setVisual(SELECTED_CODE_VIEW_TYPE, value);
                                        var graph = UIA.GetRootGraph(state);
                                        let modelCode = ModelGenerator.GenerateModel({ graph, nodeId: value });
                                        this.props.setVisual(MODEL_CODE, modelCode);
                                    }}
                                    value={UIA.Visual(state, SELECTED_CODE_VIEW_TYPE)} />
                            </Box>
                        </div>
                        <div className="col-md-10">
                            <Box title={Titles.Code} primary={true}>
                                {codeString ? <SyntaxHighlighter language='javascript' style={docco}>{codeString}</SyntaxHighlighter> : null}
                            </Box>
                        </div>
                    </div>
                </section>
            </TopViewer>
        );
    }
}

export default UIConnect(CodeView)