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
import { GraphKeys, SetCellsLayout, GetCellProperties, FindLayoutRoot, RemoveCellLayout } from '../methods/graph_methods';

import Tab from './tab';
import TabContainer from './tabcontainer';
import TabContent from './tabcontent';
import Tabs from './tabs';
import Generator from '../generators/generator';
import ButtonList from './buttonlist';
import LayoutCreator from './layoutcreator';


class LayoutView extends Component {
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

        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let namespace = 'namespace';
        let nodeLayout = UIA.GetNodeProp(currentNode, NodeProperties.Layout);
        let cellProperties;
        let cellStyle = null;
        let selectedLayoutRoot = null;
        if (nodeLayout && this.state.selectedCell) {
            cellProperties = GetCellProperties(nodeLayout, this.state.selectedCell);
            if (cellProperties) {
                cellStyle = cellProperties.style;
            }
            selectedLayoutRoot = FindLayoutRoot(this.state.selectedCell, nodeLayout.layout) || nodeLayout.layout;
        }
        return (
            <TopViewer active={active}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-2">
                            <Box primary={true} title={Titles.Layout}>
                                {this.state.selectedCell ? (<button onClick={() => {
                                    let layout = UIA.GetNodeProp(currentNode, NodeProperties.Layout) || CreateLayout();
                                    layout = RemoveCellLayout(layout, this.state.selectedCell);
                                    this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                        prop: UIA.NodeProperties.Layout,
                                        id: currentNode.id,
                                        value: layout
                                    });
                                    this.setState({ selectedCell: null })
                                }}>Remove Selected</button>) : null}
                                <SelectInput
                                    options={[].interpolate(1, 12, (t) => ({ title: t, value: t }))}
                                    onChange={(val) => {
                                        let layout = UIA.GetNodeProp(currentNode, NodeProperties.Layout) || CreateLayout();
                                        layout = SetCellsLayout(layout, val, this.state.selectedCell)
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.Layout,
                                            id: currentNode.id,
                                            value: layout
                                        });
                                    }}
                                    label={Titles.Sections}
                                    value={Object.keys(selectedLayoutRoot || {}).length} />
                                {cellStyle ? (<SelectInput
                                    options={['column', 'row'].map((t) => ({ title: t, value: t }))}
                                    onChange={(val) => {
                                        let layout = nodeLayout || CreateLayout();
                                        cellStyle.flexDirection = val;
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.Layout,
                                            id: currentNode.id,
                                            value: layout
                                        });
                                    }}
                                    label={Titles.FlexDirection}
                                    value={cellStyle.flexDirection} />) : null}
                                {cellStyle ? (<SelectInput
                                    options={[].interpolate(0, 12, (t) => ({ title: t, value: t }))}
                                    onChange={(val) => {
                                        let layout = nodeLayout || CreateLayout();
                                        if (!parseInt(val))
                                            cellStyle.flex = null;
                                        else
                                            cellStyle.flex = parseInt(val);
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.Layout,
                                            id: currentNode.id,
                                            value: layout
                                        });
                                    }}
                                    label={Titles.Flex}
                                    value={cellStyle.flex} />) : null}
                                {cellStyle ? (<TextInput
                                    onChange={(val) => {
                                        let layout = nodeLayout || CreateLayout();
                                        cellStyle.height = val === '' ? null : parseInt(val);
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.Layout,
                                            id: currentNode.id,
                                            value: layout
                                        });
                                    }}
                                    label={Titles.Height}
                                    value={cellStyle.height} />) : null}
                                {cellStyle ? (<TextInput
                                    onChange={(val) => {
                                        let layout = nodeLayout || CreateLayout();
                                        cellStyle.width = val === '' ? null : parseInt(val);
                                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                            prop: UIA.NodeProperties.Layout,
                                            id: currentNode.id,
                                            value: layout
                                        });
                                    }}
                                    label={Titles.Width}
                                    value={cellStyle.width} />) : null}
                            </Box>

                        </div>
                        <div className="col-md-10">
                            <LayoutCreator
                                selectedCell={this.state.selectedCell}
                                layout={UIA.GetNodeProp(currentNode, NodeProperties.Layout)}
                                onSelectionClick={(item) => {
                                    this.setState({ selectedCell: this.state.selectedCell !== item ? item : null })
                                }}
                                style={{ height: 500 }} />
                        </div>
                    </div>
                </section>
            </TopViewer >
        );
    }
}

export default UIConnect(LayoutView)