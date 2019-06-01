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
import { NodeTypes, NodeProperties, NameSpace, GeneratedTypes, GeneratedTypesMatch, GeneratedConstants } from '../constants/nodetypes';
import ModelGenerator from '../generators/modelgenerators';
import NamespaceGenerator from '../generators/namespacegenerator';
import ExtensionsGenerator from '../generators/extensiongenerator';
import ControllerGenerator from '../generators/controllergenerator';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import TextInput from './textinput';
import { GraphKeys } from '../methods/graph_methods';

import Tab from './tab';
import TabContainer from './tabcontainer';
import TabContent from './tabcontent';
import Tabs from './tabs';
import Generator from '../generators/generator';

const MODEL_CODE = 'MODEL_CODE';
const SELECTED_CODE_TYPE = 'SELECTED_CODE_TYPE';
const CLASS_KEY = 'CLASS_KEY';
const CODE_VIEW_TAB = 'CODE_VIEW_TAB';

class CodeView extends Component {
    active() {
        return !!this.props.active;
    }
    render() {
        var { state } = this.props;
        let active = this.active();

        let codeString;
        let info = UIA.Visual(state, MODEL_CODE) || null;
        let graphRoot = UIA.GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphKeys.NAMESPACE] : null;


        let controllers = [];
        if (state && graphRoot) {
            var viewTab = UIA.Visual(state, CODE_VIEW_TAB);
            var classKey = UIA.Visual(state, CLASS_KEY);
            if (classKey) {
                var temp = Generator.generate({
                    type: viewTab,
                    key: classKey,
                    state
                });
                if (temp && temp[classKey]) {
                    codeString = temp[classKey].template;
                }
            }
        }


        var code_types = [
            NodeTypes.Controller,
            NodeTypes.Model,
            NodeTypes.ExtensionType,
            NodeTypes.Maestro,
            ...Object.values(GeneratedTypes)
        ];
        let modelType = UIA.Visual(state, CODE_VIEW_TAB);
        let models = [];
        if (modelType && Object.values(NodeTypes).indexOf(modelType) !== -1) {
            models = UIA.NodesByType(state, modelType, { useRoot: true, excludeRefs: true }).map(t => {
                return {
                    title: UIA.GetNodeTitle(t),
                    value: t.id
                }
            });
        }
        else if (modelType === GeneratedTypes.Constants) {
            models = [{ title: Titles.GeneratedMethodsConstants, value: GeneratedConstants.Methods }]
        }
        else if (modelType && Object.values(GeneratedTypes).indexOf(modelType) !== -1) {
            models = UIA.NodesByType(state, GeneratedTypesMatch[modelType], { useRoot: true, excludeRefs: true }).map(t => {
                return {
                    title: UIA.GetNodeTitle(t),
                    value: t.id
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
                            <Box primary={true} title={Titles.CodeTypes}>
                                <SelectInput options={models}
                                    label={Titles.Code}
                                    onChange={(value) => {
                                        this.props.setVisual(CLASS_KEY, value);
                                    }}
                                    value={UIA.Visual(state, CLASS_KEY)} />
                            </Box>
                        </div>
                        <div className="col-md-10">
                            <TabContainer>
                                <Tabs>
                                    {code_types ? code_types.map(ct => {
                                        return (<Tab key={ct} active={UIA.VisualEq(state, CODE_VIEW_TAB, ct)}
                                            title={ct} onClick={() => {
                                                this.props.setVisual(CODE_VIEW_TAB, ct)
                                            }} />
                                        );
                                    }) : null}
                                </Tabs>
                            </TabContainer>
                            <TabContent>
                                <TabPane active={UIA.Visual(state, CODE_VIEW_TAB)}>
                                    <Box title={Titles.Code} primary={true} maxheight={700}>
                                        {codeString ? <SyntaxHighlighter language='csharp' style={docco}>{codeString}</SyntaxHighlighter> : null}
                                    </Box>
                                </TabPane>
                            </TabContent>
                        </div>
                    </div>
                </section>
            </TopViewer >
        );
    }
}

export default UIConnect(CodeView)