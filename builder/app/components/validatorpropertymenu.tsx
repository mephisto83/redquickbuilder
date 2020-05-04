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
import { getNodesByLinkType, SOURCE, createValidator, addValidatator, TARGET, createEventProp, GetNode } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';

class ValidatorPropertyMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Validator);
        var graph = UIA.GetCurrentGraph(state);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var validator;
        if (currentNode && UIA.GetNodeProp(currentNode, UIA.NodeProperties.ValidatorModel)) {
            var propertyNodes = getNodesByLinkType(graph, {
                id: UIA.GetNodeProp(currentNode, UIA.NodeProperties.ValidatorModel),
                direction: SOURCE,
                type: LinkType.PropertyLink
            }).filter(x => UIA.GetNodeProp(x, NodeProperties.NODEType) !== NodeTypes.Model).map(t => {
                return {
                    title: UIA.GetNodeTitle(t),
                    value: t.id
                }
            });
            validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator);
        }
        let propertyValidations = [];
        if (validator && validator.properties) {
            propertyValidations = Object.keys(validator.properties).map(key => {
                let visualKey = `ValidatorPropertyMenu${key}-${currentNode.id}`;
                return (
                    <TreeViewMenu
                        key={visualKey}
                        open={UIA.Visual(state, visualKey)}
                        active={UIA.Visual(state, visualKey)}
                        title={UIA.GetNodeTitle(GetNode(graph, key))}
                        toggle={() => {
                            this.props.toggleVisual(visualKey)
                        }}>
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
                </div>);
        }

        return (
            <TabPane active={active}>
                {currentNode&&false ? (<FormControl>
                    <SelectInput
                        options={propertyNodes}
                        defaultSelectText={Titles.SelectProperty}
                        label={Titles.Property}
                        onChange={(value) => {
                            var id = currentNode.id;
                            var validator = UIA.GetNodeProp(currentNode, NodeProperties.Validator) || createValidator();
                            validator = addValidatator(validator, { id: value });
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                id,
                                prop: NodeProperties.Validator,
                                value: validator
                            })
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: {
                                    ...UIA.LinkProperties.ValidatorModelLink,
                                    ...createEventProp(LinkEvents.Remove, {
                                        function: 'OnRemoveValidationPropConnection'
                                    })
                                }
                            });
                        }}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ValidatorModel] : ''} />
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ValidatorPropertyMenu)
