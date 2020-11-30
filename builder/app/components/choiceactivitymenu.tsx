// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
class ChoiceActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.ChoiceList);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        var def = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIExtensionDefinition);

        return (
            <TabPane active={active}>
                {/* <ControlSideBarMenuHeader title={Titles.ChoiceListActions} />
                <ControlSideBarMenu>
                    <ControlSideBarMenuItem onClick={() => {
                        this.props.graphOperation(UIA.NEW_CHOICE_ITEM_NODE, {
                            parent: UIA.Visual(state, UIA.SELECTED_NODE)
                        });
                    }}
                        icon={'fa fa-puzzle-piece'}
                        title={Titles.AddChoiceItem}
                        description={Titles.AddChoiceItemDescription} />
                </ControlSideBarMenu> */}
                <ul>
                    {def ? Object.keys(def.definition).map((x, xi) => {
                        return (<li key={`clist${x}-${xi}`}>{x}</li>);
                    }) : null}
                </ul>
            </TabPane>
        );
    }
}

export default UIConnect(ChoiceActivityMenu)
