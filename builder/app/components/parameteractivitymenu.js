// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import SelectInput from './selectinput';
import TabPane from './tabpane';
import * as Titles from './titles';
class ParameterActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Parameter);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        return (
            <TabPane active={active}>
                {currentNode ? (<SelectInput
                    label={Titles.ParameterType}
                    options={Object.keys(UIA.NodePropertyTypes).sort((a, b) => a.localeCompare(b)).map(x => {
                        return {
                            value: UIA.NodePropertyTypes[x],
                            title: x
                        }
                    })}
                    onChange={(value) => {
                        var id = currentNode.id;

                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.CodePropertyType,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.CodePropertyType] : ''} />) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ParameterActivityMenu)