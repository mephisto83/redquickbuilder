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
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties, NodeProperties } from '../constants/nodetypes';
import { Iterator } from 'webcola';
import { ServiceTypes, ServiceTypeSetups } from '../constants/servicetypes';
import { InstanceTypes } from '../constants/componenttypes';
class ViewModelActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ViewModel);
        var currentNode = active ? UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE)) : null;

        let models = UIA.NodesByType(state, NodeTypes.Model).toNodeSelect();
        return (
            <TabPane active={active}>
                <FormControl>
                    <SelectInput
                        label={Titles.Models}
                        options={models}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Model)}
                        onChange={(value) => {
                            var id = currentNode.id;
                            this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                                target: currentNode.properties[UIA.NodeProperties.Model],
                                source: id
                            })
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Model,
                                id,
                                value
                            });
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                target: value,
                                source: id,
                                properties: { ...UIA.LinkProperties.ViewModelLink }
                            });
                        }} />
                    <SelectInput
                        label={Titles.InstanceType}
                        value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.InstanceType)}
                        options={Object.keys(InstanceTypes).map(t => ({ title: t, value: InstanceTypes[t] }))}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: NodeProperties.InstanceType,
                                id: currentNode.id,
                                value
                            });
                        }} />
                </FormControl>
            </TabPane>
        );
    }
}

export default UIConnect(ViewModelActivityMenu)
