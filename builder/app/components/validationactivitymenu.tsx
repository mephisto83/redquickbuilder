// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
class ValidationActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ValidationList);
        if (!active) {
          return <div />;
        }

        return (
            <TabPane active={active}>
                <ControlSideBarMenuHeader title={Titles.ValidationListActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_VALIDATION_ITEM_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE),
                            groupProperties: {
                            },
                            linkProperties: {
                                properties: {
                                    ...UIA.LinkProperties.ValidationLinkItem
                                }
                            }
                        });
                    }}
                        icon={'fa fa-puzzle-piece'}
                        title={Titles.AddValidationItem}
                        description={Titles.AddValidationItemDescription} />
                </ControlSideBarMenu>
            </TabPane>
        );
    }
}

export default UIConnect(ValidationActivityMenu)
