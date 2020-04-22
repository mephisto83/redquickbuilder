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
import TextInput from './textinput';
import { Functions, FunctionConstraintKeys, HTTP_METHODS } from '../constants/functiontypes';
import { getNodesLinkedTo } from '../methods/graph_methods';
import { LinkPropertyKeys, NodeProperties, ExcludeDefaultNode } from '../constants/nodetypes';

class ControllerActivityMenu extends Component {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Controller);
        var graph = UIA.GetCurrentGraph(state);
        var functions = UIA.NodesByType(state, UIA.NodeTypes.Maestro).map(funcKey => {
            return {
                title: UIA.GetNodeTitle(funcKey),
                value: funcKey.id
            }
        });

        return (
            <TabPane active={active}>
                {currentNode ? (<SelectInput
                    label={Titles.Maestros}
                    options={functions}
                    defaultSelectText={Titles.AddMaestros}
                    onChange={(value) => {
                        let id = currentNode.id;
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: {
                                ...UIA.LinkProperties.MaestroLink
                            }
                        });
                    }}
                    value={''} />) : null}
                {currentNode ? (<TextInput
                    label={Titles.CodeUser}
                    value={UIA.GetNodeProp(currentNode, NodeProperties.CodeUser)}
                    onChange={(value) => {
                        this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                            id: currentNode.id,
                            value,
                            prop: NodeProperties.CodeUser
                        })
                    }} />) : null}
            </TabPane>
        );
    }
}

export default UIConnect(ControllerActivityMenu)