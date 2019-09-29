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

const BATCH_MODEL = 'BATCH_MODEL';
const BATCH_AGENT = 'BATCH_AGENT';
const BATCH_FUNCTION_NAME = 'BATCH_FUNCTION_NAME';
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
                            this.props.setVisual(BATCH_MODEL, value)
                        }}
                        value={UIA.Visual(state, BATCH_MODEL)} />
                    <SelectInput
                        options={UIA.NodesByType(state, NodeTypes.Model).filter(t => UIA.GetNodeProp(t, NodeProperties.IsAgent)).toNodeSelect()}
                        label={Titles.Models}
                        onChange={(value) => {
                            this.props.setVisual(BATCH_AGENT, value);
                        }}
                        value={UIA.Visual(state, BATCH_AGENT)} />
                    <TextInput
                        label={Titles.MethodName}
                        value={UIA.Visual(state, BATCH_FUNCTION_NAME)}
                        onChange={(value) => {
                            this.props.setVisual(BATCH_FUNCTION_NAME, value);
                        }} />
                </FormControl>
            </TabPane>
        );
    }
}

export default UIConnect(BatchMenu)