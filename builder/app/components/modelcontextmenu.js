
// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBarHeader from './sidebarheader';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes, FilterUI, LAYOUT_VIEW, MAIN_CONTENT, MIND_MAP, CODE_VIEW } from '../constants/nodetypes';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import Box from './box';
import { TARGET, GetLinkChain, SOURCE, GetNode, createExecutor, addMethodValidationForParamter, getMethodValidationForParameter, createValidator, removeMethodValidationParameter } from '../methods/graph_methods';
import { ConditionTypes, ConditionFunctionSetups, ConditionTypeOptions, ConditionTypeParameters } from '../constants/functiontypes';
import CheckBox from './checkbox';
import GenericPropertyMenu from './genericpropertymenu';
import GenericPropertyContainer from './genericpropertycontainer';
import TextInput from './textinput';
import ButtonList from './buttonlist';
import SideBarMenu from './sidebarmenu';
import TreeViewMenu from './treeviewmenu';
import { PERMISSION, FILTER, VALIDATION } from '../constants/condition';
import { DataChainContextMethods } from '../constants/datachain';
const CONDITION_FILTER_MENU_PARAMETER = 'condition-filter-menu-parameter';
const DATA_SOURCE = 'DATA_SOURCE';
class ModelContextMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let display = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? 'block' : 'none';
        let nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? UIA.GetNodeProp(currentNode, NodeProperties.NODEType) : null;
        let menuMode = UIA.Visual(state, UIA.CONTEXT_MENU_MODE);
        let exit = () => {
            this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
        }
        return (
            <TreeViewMenu
                open={true}
                active={true}
                title={Titles.Condition}
                toggle={() => {
                }}>
                <TreeViewMenu title={Titles.SelectProperties} hideArrow={true} onClick={() => {
                    this.props.selectProperties(currentNode.id);
                }} />
            </TreeViewMenu>)
    }
}

export default UIConnect(ModelContextMenu)