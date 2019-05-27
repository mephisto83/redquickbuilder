// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
import TopViewer from './topviewer';
import Box from './box';
class CodeView extends Component {
    active() {
        return !!this.props.active;
    }
    render() {
        var { state } = this.props;
        let active = this.active();
        return (
            <TopViewer active={active}>
                <div className="section">
                    <div className="row">
                        <div className="col-md-2">
                            <Box></Box>
                        </div>
                        <div className="col-md-10">
                            <Box></Box>
                        </div>
                    </div>
                </div>
            </TopViewer>
        );
    }
}

export default UIConnect(CodeView)