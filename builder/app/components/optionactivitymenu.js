// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
class OptionActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.OptionList);

        return (
            <TabPane active={active}>
                <ControlSideBarMenuHeader title={Titles.OptionListActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_OPTION_ITEM_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: { ...UIA.LinkProperties.OptionItemLink }
                            }
                        });
                    }}
                        icon={'fa fa-puzzle-piece'}
                        title={Titles.AddOptionItem}
                        description={Titles.AddOptionItemDescription} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(OptionActivityMenu)