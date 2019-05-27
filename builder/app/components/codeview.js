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
import SelectInput from './selectinput';
import { NodeTypes } from '../constants/nodetypes';
const SELECTED_CODE_VIEW_TYPE = 'SELECTED_CODE_VIEW_TYPE';
class CodeView extends Component {
    active() {
        return !!this.props.active;
    }
    render() {
        var { state } = this.props;
        let active = this.active();
        let models = UIA.NodesByType(state, NodeTypes.Model, { useRoot: true, excludeRefs: true }).map(t => {
            return {
                title: UIA.GetNodeTitle(t),
                value: t.id
            }
        })
        return (
            <TopViewer active={active}>
                <section className="content">
                    <div className="row">
                        <div className="col-md-2">
                            <Box primary={true} title={Titles.Models}>
                                <SelectInput options={models}
                                    label={Titles.Models}
                                    onChange={(value) => {
                                        this.props.setVisual(SELECTED_CODE_VIEW_TYPE, value)
                                    }}
                                    value={UIA.Visual(state, SELECTED_CODE_VIEW_TYPE)} />
                            </Box>
                        </div>
                        <div className="col-md-10">
                            <Box title={Titles.Code}></Box>
                        </div>
                    </div>
                </section>
            </TopViewer>
        );
    }
}

export default UIConnect(CodeView)