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
import { NodeTypes, NodeProperties, NameSpace, GeneratedTypes, GeneratedTypesMatch, GeneratedConstants, IdentityManagement } from '../constants/nodetypes';
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
import ButtonList from './buttonlist';

const MODEL_CODE = 'MODEL_CODE';
const SELECTED_CODE_TYPE = 'SELECTED_CODE_TYPE';
const CLASS_KEY = 'CLASS_KEY';
const CODE_VIEW_TAB = 'CODE_VIEW_TAB';

class CodeView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    active() {
        return !!this.props.active;
    }
    render() {
        var { state } = this.props;
        let active = this.active();

        let codeString = '';
        let info = UIA.Visual(state, MODEL_CODE) || null;
        let graphRoot = UIA.GetRootGraph(state);
        let namespace = graphRoot ? graphRoot[GraphKeys.NAMESPACE] : null;
        let projectname = graphRoot ? graphRoot[GraphKeys.PROJECTNAME] : null;
        let colorscheme  = graphRoot ? graphRoot[GraphKeys.COLORSCHEME] : null;
        let server_side_setup = graphRoot ? graphRoot[GraphKeys.SERVER_SIDE_SETUP] : null;


        let controllers = [];
        let generatedContent = null;
        if (state && graphRoot && active) {
            var viewTab = UIA.Visual(state, CODE_VIEW_TAB);
            var classKey = this.state[UIA.Visual(state, CODE_VIEW_TAB)];

            var temp = Generator.generate({
                type: viewTab,
                key: classKey,
                state
            });
            generatedContent = temp;

            if (temp && temp[classKey]) {
                codeString = temp[classKey].template;
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
        if (generatedContent) {
            Object.keys(generatedContent).map(gcKey => {
                models.push({
                    id: gcKey,
                    title: generatedContent[gcKey].name,
                    value: generatedContent[gcKey].name
                })
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
                                        this.props.setAppsettingsAssemblyPrefixes(val);
                                    }}
                                    label={Titles.NameSpace}
                                    value={namespace} />
                                <TextInput
                                    onChange={(val) => {
                                        this.props.setRootGraph(GraphKeys.PROJECTNAME, val);
                                    }}
                                    label={Titles.ProjectName}
                                    value={projectname} />
                                <TextInput
                                    onChange={(val) => {
                                        this.props.setRootGraph(GraphKeys.COLORSCHEME, val);
                                    }}
                                    label={Titles.ColorScheme}
                                    value={colorscheme} />
                                <SelectInput
                                    label={Titles.ServerSideSetup}
                                    options={Object.keys(IdentityManagement).map(t => {
                                        return { title: t, value: IdentityManagement[t] };
                                    })}
                                    onChange={(value) => {
                                        this.props.setRootGraph(GraphKeys.SERVER_SIDE_SETUP, value);
                                    }}
                                    value={server_side_setup} />
                            </Box>
                            <Box primary={true} title={Titles.CodeTypes}>
                                <ButtonList active={true} isSelected={(item) => {
                                    return item && this.state[UIA.Visual(state, CODE_VIEW_TAB)] === item.id;
                                }}
                                    items={models}
                                    onClick={(item) => {
                                        this.setState({
                                            [UIA.Visual(state, CODE_VIEW_TAB)]: item.id
                                        });
                                    }} />
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