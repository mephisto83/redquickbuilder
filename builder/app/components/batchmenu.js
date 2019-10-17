// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import SelectInput from './selectinput';
import TextInput from './textinput';
import { MethodFunctions } from '../constants/functiontypes';

class BatchMenu extends Component {
    render() {
        var { state } = this.props;
        if (!state || !UIA.HasCurrentGraph()) { return <div></div> }
        return (
            <TabPane active={true}>
                <FormControl>
                    <h3>{Titles.QuickMethods}</h3>
                    <SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).toNodeSelect()}
                        label={Titles.Models}
                        onChange={(value) => {
                            this.props.setVisual(UIA.BATCH_MODEL, value)
                        }}
                        value={UIA.Visual(state, UIA.BATCH_MODEL)} />
                    <SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).filter(t => UIA.GetNodeProp(t, NodeProperties.IsAgent)).toNodeSelect()}
                        label={Titles.Agents}
                        onChange={(value) => {
                            this.props.setVisual(UIA.BATCH_AGENT, value);
                        }}
                        value={UIA.Visual(state, UIA.BATCH_AGENT)} />
                    <SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).toNodeSelect()}
                        label={Titles.Parents}
                        onChange={(value) => {
                            this.props.setVisual(UIA.BATCH_PARENT, value);
                        }}
                        value={UIA.Visual(state, UIA.BATCH_PARENT)} />
                    <SelectInput
                        options={Object.keys(MethodFunctions).map(t => {
                            return {
                                title: MethodFunctions[t] && MethodFunctions[t].title ? MethodFunctions[t].title : t,
                                value: t
                            }
                        })}
                        label={Titles.FunctionTypes}
                        onChange={(value) => {
                            this.props.setVisual(UIA.BATCH_FUNCTION_TYPE, value);
                        }}
                        value={UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)} />
                    <TextInput
                        label={Titles.MethodName}
                        value={UIA.Visual(state, UIA.BATCH_FUNCTION_NAME)}
                        onChange={(value) => {
                            this.props.setVisual(UIA.BATCH_FUNCTION_NAME, value);
                        }} />
                </FormControl>
            </TabPane>
        );
    }
}

export default UIConnect(BatchMenu)