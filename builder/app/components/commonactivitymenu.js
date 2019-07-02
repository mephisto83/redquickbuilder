// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
import { ExcludeDefaultNode } from '../constants/nodetypes';
class CommonActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = !ExcludeDefaultNode[UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType)];
        return (
            <TabPane active={active}>
                {currentNode ? (<FormControl>
                    <TextBox
                        label={Titles.CodeName}
                        disabled={!UIA.CanChangeType(currentNode)}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.CodeName] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.CodeName,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    <TextBox
                        label={Titles.ValueName}
                        disabled={!UIA.CanChangeType(currentNode)}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.ValueName] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.ValueName,
                                id: currentNode.id,
                                value
                            });
                        }} />
                    <TextBox
                        label={Titles.AgentName}
                        disabled={!UIA.CanChangeType(currentNode)}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.AgentName] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.AgentName,
                                id: currentNode.id,
                                value
                            });
                        }} />
                </FormControl>) : null}
            </TabPane>
        );
    }
}

export default UIConnect(CommonActivityMenu)