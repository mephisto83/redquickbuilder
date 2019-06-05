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
import TextBox from './textinput';
import TextInput from './textinput';
import EnumerationEditMenu from './enumerationeditmenu';
import { NodeProperties } from '../constants/nodetypes';

class EnumerationActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Enumeration);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var enums = UIA.GetNodeProp(currentNode, NodeProperties.Enumeration) || [];

        return (
            <TabPane active={active} >
                <EnumerationEditMenu onComplete={(val) => {
                    if (val) {
                        var enums = UIA.GetNodeProp(currentNode, NodeProperties.Enumeration) || [];

                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.Enumeration,
                            id: currentNode.id,
                            value: [...enums, val].unique()
                        });
                    }
                }
                } />
                {active && enums && enums.length ? enums.map((_enum) => {
                    return <div className="external-event bg-red" style={{ cursor: 'pointer' }} onClick={() => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.Enumeration,
                            id: currentNode.id,
                            value: [...enums].filter(x => x !== _enum)
                        });
                    }} > {_enum}</div>;
                }) : null}
            </TabPane>
        );
    }
}

export default UIConnect(EnumerationActivityMenu);