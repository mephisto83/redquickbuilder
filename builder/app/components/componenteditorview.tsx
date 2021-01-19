// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import GenericPropertyContainer from './genericpropertycontainer';
import TreeViewMenu from './treeviewmenu';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
import TopViewer from './topviewer';
import { NodeProperties, NodeTypes, UITypes } from '../constants/nodetypes';
import { Node } from '../methods/graph_types';
import TreeViewGroupButton from './treeviewgroupbutton';
import { ADD_NEW_NODE } from '../actions/uiActions';
import TreeViewButtonGroup from './treeviewbuttongroup';
import { GetNodeProp } from '../methods/graph_methods';
import TextInput from './textinput';
import TreeViewItemContainer from './treeviewitemcontainer';
class ComponentEditorView extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }
    active() {
        return !!this.props.active;
    }
    render() {
        var { state } = this.props;
        let active = this.active();

        if (!active) {
            return <div />;
        }
        let customComponentNodes = UIA.NodesByType(state, NodeTypes.CustomComponent);

        const options = {
            selectOnLineNumbers: true
        };
        let currentNode = UIA.GetNodeById(this.state.openNode);
        let value = currentNode ? GetNodeProp(currentNode, NodeProperties.Implementation) : null;
        return (
            <TopViewer active={active}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-2">
                            <GenericPropertyContainer
                                sideBarStyle={{ right: 0 }} active>
                                <TreeViewMenu active title="Components" open={this.state.open} onClick={() => {
                                    this.setState({
                                        open: !this.state.open
                                    });
                                }}>
                                    <TreeViewButtonGroup>
                                        <TreeViewGroupButton title={Titles.Add} icon={'fa fa-plus'} onClick={() => {
                                            const operations = [];
                                            operations.push({
                                                operation: ADD_NEW_NODE,
                                                options() {
                                                    return {
                                                        nodeType: NodeTypes.CustomComponent,
                                                        properties: {
                                                            [NodeProperties.UIText]: 'New Custom Component',
                                                            [NodeProperties.Implementation]: {
                                                                [UITypes.ElectronIO]: '',
                                                                [UITypes.AR]: '',
                                                                [UITypes.ReactNative]: '',
                                                                [UITypes.ReactWeb]: '',
                                                                [UITypes.VR]: ''
                                                            }
                                                        },
                                                        links: []
                                                    };
                                                }
                                            });
                                            UIA.PerformGraphOperation(operations)(UIA.GetDispatchFunc(), UIA.GetStateFunc());
                                        }} />
                                    </TreeViewButtonGroup>
                                    {customComponentNodes.map((node: Node) => {
                                        return <TreeViewMenu active={this.state.openNode === node.id} open={this.state.openNode === node.id} title={UIA.GetNodeTitle(node)} onClick={() => {
                                            this.setState({
                                                currentNode: node,
                                                openNode: node.id
                                            })
                                        }} >
                                            <TreeViewItemContainer>
                                                <TextInput label={Titles.Name} value={GetNodeProp(currentNode, NodeProperties.UIText)} onChange={(val: string) => {
                                                    UIA.updateComponentProperty(currentNode.id, NodeProperties.UIText, val);
                                                    // this.setState({ turn: Date.now() });
                                                }} />
                                            </TreeViewItemContainer>
                                            <TreeViewMenu title={Titles.Web} onClick={() => {
                                                this.setState({
                                                    ui: UITypes.ReactWeb
                                                })
                                            }} />
                                            <TreeViewMenu title={Titles.ReactNative} onClick={() => {
                                                this.setState({
                                                    ui: UITypes.ReactNative
                                                })
                                            }} />
                                            <TreeViewMenu title={Titles.Desktop} onClick={() => {
                                                this.setState({
                                                    ui: UITypes.ElectronIO
                                                })
                                            }} />
                                        </TreeViewMenu>
                                    })}
                                </TreeViewMenu>
                            </GenericPropertyContainer>
                        </div>
                        <div className="col-md-10">
                            {!value || !this.state.ui ? null : <MonacoEditor
                                height="1200"
                                width={'100%'}
                                editorWillMount={(editor) => {
                                    monaco.editor.setTheme('vs-dark');
                                }}
                                language={'tsx'}
                                onChange={(val: string) => {
                                    if (currentNode.properties[NodeProperties.Implementation]) {
                                        currentNode.properties[NodeProperties.Implementation][this.state.ui] = val;
                                    }
                                }}
                                value={value[this.state.ui]}
                                options={options}
                            />}
                        </div>
                    </div>
                </section>
            </TopViewer>
        );
    }
}

export default UIConnect(ComponentEditorView);
