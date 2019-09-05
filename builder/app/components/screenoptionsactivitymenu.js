// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import ButtonList from './buttonlist';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties, NodeProperties, UITypes, MAIN_CONTENT, MIND_MAP, LAYOUT_VIEW } from '../constants/nodetypes';
import { GetNode, CreateLayout } from '../methods/graph_methods';
class ScreenOptionsActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ScreenOption);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        if (currentNode) {

        }
        return (
            <TabPane active={active}>
                <ControlSideBarMenuHeader title={Titles.ScreenOptions} />
                <SelectInput
                    label={Titles.UIType}
                    options={Object.keys(UITypes).map(t => ({ title: t, value: t }))}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.UIType,
                            id: currentNode.id,
                            value: value
                        });
                    }}

                    value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType)} />
                <CheckBox
                    label={Titles.EnableMenu}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.EnabledMenu)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.EnabledMenu,
                            id: currentNode.id,
                            value
                        });
                    }} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.Layout,
                            id: currentNode.id,
                            value: UIA.GetNodeProp(currentNode, NodeProperties.Layout) || CreateLayout()
                        });
                        this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
                    }} icon={'fa fa-puzzle-piece'} title={Titles.SetupLayout} description={Titles.SetupLayout} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(ScreenOptionsActivityMenu)