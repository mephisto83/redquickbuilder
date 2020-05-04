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

class SectionEdit extends Component<any, any> {
    render() {
        var { state } = this.props;

        var section = UIA.GetCurrentScopedGraph(state);
        return (
            <FormControl sidebarform={true}>
                <TextInput value={section ? section.title : ''} onChange={(value) => {
                    this.props.graphOperation(UIA.UPDATE_GRAPH_TITLE, { text: value });
                }} inputgroup={true} placeholder={Titles.SectionEdit} />
            </FormControl>
        );
    }
}

export default UIConnect(SectionEdit)
