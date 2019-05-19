// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
class PropertyActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Property);

        return (
            <TabPane active={active}>
                <ControlSideBarMenuHeader title={Titles.ModelActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_ATTRIBUTE_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE)
                        });
                    }} icon={'fa fa-puzzle-piece'} title={Titles.AddAttribute} description={Titles.AddAttributeDescription} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(PropertyActivityMenu)