// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
class CommonActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        return (
            <TabPane active={true}>
                {currentNode ? (<FormControl>
                    <TextBox
                        label={Titles.CodeName}
                        value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.CodeName] : ''}
                        onChange={(value) => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.CodeName,
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