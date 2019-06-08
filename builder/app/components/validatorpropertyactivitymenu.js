// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import { NodeProperties, NodeTypes, LinkEvents, LinkType } from '../constants/nodetypes';
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode, removeValidator } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ValidatorPropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Validator);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var validator;
        if (active && currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ValidatorModel)) {

            validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator);
        }
        let propertyValidations = <div></div>;
        if (validator && validator.properties) {
            propertyValidations = Object.keys(validator.properties).map(key => {
                let visualKey = `ValidatorPropertyActivityMenu${key}-${currentNode.id}`;
                return (
                    <TreeViewMenu
                        key={visualKey}
                        open={UIA.Visual(state, visualKey)}
                        active={UIA.Visual(state, visualKey)}
                        title={UIA.GetNodeTitle(GetNode(graph, key))}
                        toggle={() => {
                            this.props.toggleVisual(visualKey)
                        }}>
                        <TreeViewMenu hideArrow={true} title={Titles.RemoveValidation} icon={'fa fa-minus'} onClick={() => {
                            let id = currentNode.id;
                            
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: key,
                                source: id,
                            });
                        }} />
                    </TreeViewMenu>
                );
            });
            propertyValidations = (
                <div style={{ position: 'relative' }}>
                    <MainSideBar>
                        <SideBar>
                            <SideBarMenu>
                                {propertyValidations}
                            </SideBarMenu>
                        </SideBar>
                    </MainSideBar>
                </div>
            );
        }

        return (
            propertyValidations
        );
    }
}

export default UIConnect(ValidatorPropertyActivityMenu)