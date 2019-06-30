// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import FormControl from './formcontrol';

import RadioButton from './radiobutton';
import * as UIA from '../actions/uiactions';
import { NodeProperties } from '../constants/nodetypes';
import Box from './box';
import * as Titles from './titles';

class NodeManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: ''
        };
    }
    toFilterString(node) {
        return `${UIA.GetNodeProp(node, NodeProperties.CodeName)} ${node.id} ${UIA.GetNodeProp(node, NodeProperties.UIText)} ${UIA.GetNodeProp(node, NodeProperties.NODEType)}`.toLowerCase();
    }
    render() {
        let me = this;
        let { state } = me.props;

        var graph = UIA.GetCurrentGraph(state);
        if (!graph) {

            return <div></div>
        }
        return (
            <Box title={Titles.Depth}>
                <FormControl>
                    <RadioButton value={graph.depth} onChange={(val) => {
                        this.props.graphOperation([{ operation: UIA.SET_DEPTH, options: { depth: val } }]);
                    }} values={[].interpolate(0, 7, x => ({ title: 'Depth  ' + x, value: x }))} />
                </FormControl>
            </Box>
        );
    }
}
export default UIConnect(NodeManagement);