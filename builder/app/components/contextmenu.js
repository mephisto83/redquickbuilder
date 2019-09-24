// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBarHeader from './sidebarheader';
import * as Titles from './titles';
import { LinkType, NodeProperties, NodeTypes, FilterUI } from '../constants/nodetypes';
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
const CONDITION_FILTER_MENU_PARAMETER = 'condition-filter-menu-parameter';
const CONDITION_FILTER_MENU_PARAMETER_PROPERTIES = 'condition-filter-menu-parameter-properties';
const DATA_SOURCE = 'DATA_SOURCE';
class ContextMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        let display = UIA.Visual(state, UIA.CONTEXT_MENU_VISIBLE) ? 'block' : 'none';
        let nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_VISIBLE) ? UIA.GetNodeProp(currentNode, NodeProperties.NODEType) : null;
        return (<div className="context-menu" style={{ position: 'fixed', width: 250, height: 400, display, top: 250, left: 500 }}>
            <GenericPropertyContainer active={true} title='asdf' subTitle='afaf' nodeType={nodeType} >
                <TreeViewMenu
                    open={true}
                    active={true}
                    title={Titles.AppMenu}
                    toggle={() => {
                    }}>
                    <TreeViewMenu hideArrow={true} title={Titles.New} icon={'fa fa-plus'} onClick={() => {
                        this.props.newRedQuickBuilderGraph();
                    }} />
                </TreeViewMenu>
            </GenericPropertyContainer>
        </div>)
    }
}

export default UIConnect(ContextMenu)