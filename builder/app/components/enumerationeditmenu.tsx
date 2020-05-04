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

export default class EnumerationEditMenu extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = { value: '' };
    }
    render() {
        var { state } = this.props;

        return (
            <FormControl sidebarform={true}>
                <TextInput onClick={() => {
                    if (this.props.onComplete) {
                        this.props.onComplete(this.state.value);
                        this.setState({ value: '' })
                    }
                }} value={this.state.value} onChange={(value) => {
                    this.setState({ value })
                }} inputgroup={true} placeholder={Titles.Enumeration} />
            </FormControl>
        );
    }
}
