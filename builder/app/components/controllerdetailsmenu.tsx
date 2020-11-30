// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import { Functions } from '../constants/functiontypes';
import { getNodesLinkedFrom, getNodesLinkedTo } from '../methods/graph_methods';
import TreeViewMenu from './treeviewmenu';
import TreeViewItem from './treeviewitem';
const CONTROLLER_DETAILS_MENU = 'CONTROLLER_DETAILS_MENU';

class ControllerDetailsMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Maestro);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var othernodes = currentNode ? getNodesLinkedTo(UIA.GetCurrentGraph(state), { id: currentNode.id }) : [];
        if (!active) {
            return <div></div>
        }
        return (
            <TreeViewMenu
                open={UIA.Visual(state, CONTROLLER_DETAILS_MENU)}
                active={UIA.Visual(state, CONTROLLER_DETAILS_MENU)}
                title={Titles.MaestroDetails}
                toggle={() => {
                    this.props.toggleVisual(CONTROLLER_DETAILS_MENU)
                }}>
                {othernodes.map((onode, index) => {
                    return (
                        <TreeViewItem key={`tree-view-item-controller-details${index}`} title={`${UIA.GetNodeTitle(onode)}`} onClick={() => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: onode.id,
                                source: id
                            })
                        }} />
                    );
                })}
            </TreeViewMenu>
        );
    }
}

export default UIConnect(ControllerDetailsMenu)
