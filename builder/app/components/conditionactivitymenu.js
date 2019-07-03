// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import { ConditionTypes, LinkType } from '../constants/nodetypes';
import SelectInput from './selectinput';
import { TARGET, GetLinkChain, SOURCE } from '../methods/graph_methods';
class ConditionActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Condition);
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var conditionType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ConditionType);
        var methods = currentNode ? GetLinkChain(state, {
            id: currentNode.id,
            links: [{
                type: LinkType.Condition,
                direction: TARGET
            }, {
                type: LinkType.FunctionOperator,
                direction: SOURCE
            }]
        }) : [];
        return (
            <TabPane active={active}>
                <SelectInput
                    label={Titles.ConditionType}
                    options={Object.keys(ConditionTypes).map(t => ({ title: t, value: ConditionTypes[t] }))}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            prop: UIA.NodeProperties.ConditionType,
                            id: currentNode.id,
                            value
                        });
                    }}
                    value={conditionType} />
            </TabPane>
        );
    }
}

export default UIConnect(ConditionActivityMenu)