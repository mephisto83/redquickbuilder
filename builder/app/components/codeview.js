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
import ExtensionsGenerator from '../generators/extensiongenerator';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import TextInput from './textinput';
import { GraphKeys } from '../methods/graph_methods';

import Tab from './tab';
import TabContainer from './tabcontainer';
import TabContent from './tabcontent';
import Tabs from './tabs';

const MODEL_CODE = 'MODEL_CODE';
const SELECTED_CODE_VIEW_TYPE = 'SELECTED_CODE_VIEW_TYPE';
const EXTENSION = 'EXTENSION';
const CODE_VIEW_TAB = 'CODE_VIEW_TAB';
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
        let extensions = [];
        if (state && graphRoot) {
            let temp = ExtensionsGenerator.Generate({ state });
            extensions = Object.keys(temp).map(t => {
                return {
                    value: temp[t],
                    title: t
                }
            });
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
                            <Box title={Titles.Extensions}>
                                <SelectInput options={extensions}
                                    label={Titles.Extensions}
                                    onChange={(value) => {
                                        var code = NamespaceGenerator.Generate({
                                            template: value,
                                            usings: [],
                                            namespace,
                                            space: NameSpace.Extensions
                                        })
                                        this.props.setVisual(EXTENSION, code);
                                    }}
                                    value={UIA.Visual(state, EXTENSION)} />
                            </Box>
                        </div>
                        <div className="col-md-10">
                            <TabContainer>
                                <Tabs>
                                    <Tab active={UIA.VisualEq(state, CODE_VIEW_TAB, Titles.Models)}
                                        title={Titles.Models} onClick={() => {
                                            this.props.setVisual(CODE_VIEW_TAB, Titles.Models)
                                        }} />
                                    <Tab active={UIA.VisualEq(state, CODE_VIEW_TAB, Titles.Extensions)}
                                        title={Titles.Extensions} onClick={() => {
                                            this.props.setVisual(CODE_VIEW_TAB, Titles.Extensions)
                                        }} />
                                </Tabs>
                            </TabContainer>
                            <TabContent>
                                <TabPane active={UIA.VisualEq(state, CODE_VIEW_TAB, Titles.Models)}>
                                    <Box title={Titles.Code} primary={true}>
                                        {codeString ? <SyntaxHighlighter language='csharp' style={docco}>{codeString}</SyntaxHighlighter> : null}
                                    </Box>
                                </TabPane>
                                <TabPane active={UIA.VisualEq(state, CODE_VIEW_TAB, Titles.Extensions)}>
                                    <Box title={Titles.Code} primary={true}>
                                        {UIA.Visual(state, EXTENSION) ? <SyntaxHighlighter language='csharp' style={docco}>{UIA.Visual(state, EXTENSION)}</SyntaxHighlighter> : null}
                                    </Box>
                                </TabPane>
                            </TabContent>
                        </div>
                    </div>
                </section>
            </TopViewer>
        );
    }
}

export default UIConnect(CodeView)