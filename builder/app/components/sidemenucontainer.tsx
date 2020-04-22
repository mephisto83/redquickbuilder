// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import MainSideBar from './mainsidebar';
import FormControl from './formcontrol';
import SideBar from './sidebar';
import TextBox from './textinput';
import { ExcludeDefaultNode, NodeTypes, NodeProperties, MAIN_CONTENT, LAYOUT_VIEW, LinkProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { ComponentTypes, NAVIGATION } from '../constants/componenttypes';
import { GetConnectedNodeByType, CreateLayout, TARGET, GetParameterName, getComponentPropertyList, GetNodesLinkedTo, SOURCE } from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import SideBarMenu from './sidebarmenu';
import TreeViewItem from './treeviewitem';
const NAVIGATION_PARAMETERS = 'NAVIGATION_PARAMETERS';
const SELECTED_TAB = 'SELECTED_TAB'
class SideMenuContainer extends Component {
    render() {
        var { state } = this.props;
        if (this.props.tab && !UIA.VisualEq(state, SELECTED_TAB, this.props.tab)) {
            return <div></div>
        }
        return (
            <div style={{ position: 'relative' }}>
                <MainSideBar notactive={!this.props.active} relative={true}>
                    <SideBar relative={true} style={{ paddingTop: 0 }}>
                        <SideBarMenu>
                            <TreeViewMenu
                                title={`${this.props.title}`}
                                icon={(this.props.icon || 'fa fa-object-group')}
                                open={UIA.Visual(state, this.props.visual)}
                                active={UIA.Visual(state, this.props.visual)}
                                onClick={() => {
                                    this.props.toggleVisual(this.props.visual)
                                }}>
                                <br />
                                {this.props.children}
                            </TreeViewMenu>
                        </SideBarMenu>
                    </SideBar>
                </MainSideBar>
            </div>
        );
    }
}

export default UIConnect(SideMenuContainer)