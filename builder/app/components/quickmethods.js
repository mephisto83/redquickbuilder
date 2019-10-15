// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import ButtonList from './buttonlist';
import TextBox from './textinput';
import SideMenuContainer from './sidemenucontainer';
import { NodeTypes } from '../constants/nodetypes';
import { GetNode } from '../methods/graph_methods';
import { clipboard } from 'electron';
import { GetSpecificModels, GetAllModels, CreateLoginModels, CreateDefaultView, AddAgentUser } from '../constants/nodepackages';
import TreeViewMenu from './treeviewmenu';
import { PARAMETER_TAB } from './dashboard';
import SideBar from './sidebar';
import SideBarMenu from './sidebarmenu';
import MainSideBar from './mainsidebar';

class QuickMethods extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Model);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        return (
            <MainSideBar relative={true}>
                <SideBar relative={true} style={{ paddingTop: 0 }}>
                    <SideBarMenu>
                        <TreeViewMenu
                            title={Titles.QuickMethods}
                            open={UIA.Visual(state, Titles.QuickMethods)}
                            active={UIA.Visual(state, Titles.QuickMethods)}
                            toggle={() => {
                                this.props.toggleVisual(Titles.QuickMethods)
                            }}
                            icon={'fa fa-tag'}>
                            <TreeViewMenu hideArrow={true} title={GetSpecificModels.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, GetSpecificModels);
                            })} />
                            <TreeViewMenu hideArrow={true} title={GetAllModels.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, GetAllModels);
                            })} />
                            <TreeViewMenu hideArrow={true} title={CreateLoginModels.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, CreateLoginModels);
                            })} />
                            <TreeViewMenu hideArrow={true} title={CreateDefaultView.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, CreateDefaultView);
                            })} />
                            <TreeViewMenu hideArrow={true} title={AddAgentUser.type} icon={'fa fa-plus'} onClick={(() => {
                                this.props.executeGraphOperation(currentNode, AddAgentUser);
                            })} />
                            
                        </TreeViewMenu>
                    </SideBarMenu>
                </SideBar>
            </MainSideBar>
        );
    }
}

export default UIConnect(QuickMethods)