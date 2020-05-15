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
import { Functions, FunctionConstraintKeys } from '../constants/functiontypes';
import { getNodesLinkedTo } from '../methods/graph_methods';
import { LinkPropertyKeys } from '../constants/nodetypes';

class MaestroActivityMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Maestro);
        if (!active) {
          return <div />;
        }
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
        var graph = UIA.GetCurrentGraph(state);
        var functions = UIA.NodesByType(state, [UIA.NodeTypes.Function, UIA.NodeTypes.Method]).map(funcKey => {
            return {
                title: UIA.GetNodeTitle(funcKey),
                value: funcKey.id
            }
        });

        return (
            <TabPane active={active}>
                {currentNode ? (<SelectInput
                    label={Titles.Functions}
                    options={functions}
                    defaultSelectText={Titles.AddFunction}
                    onChange={(value) => {
                        let id = currentNode.id;
                        this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                            target: value,
                            source: id,
                            properties: {
                                ...UIA.LinkProperties.FunctionLink
                            }
                        });

                        var inputVariables = getNodesLinkedTo(graph, {
                            id: value,
                            constraints: {
                                [FunctionConstraintKeys.IsInputVariable]: true
                            }
                        });

                        inputVariables.map(inputVariable => {
                            this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
                                source: inputVariable.id,
                                target: id,
                                properties: {
                                    ...UIA.LinkProperties.FunctionVariable,
                                    [LinkPropertyKeys.FUNCTION_ID]: value
                                }
                            });
                        })
                    }}
                    value={''} />) : null}
            </TabPane>
        );
    }
}

export default UIConnect(MaestroActivityMenu)
