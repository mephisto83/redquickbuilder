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
import ButtonList from './buttonlist';
import TextBox from './textinput';
import { NodeTypes } from '../constants/nodetypes';
import { GetNode } from '../methods/graph_methods';

class NodeList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {

        let nodeProperty = this.props.nodeProperty;
        let currentNode = this.props.node;
        if (!currentNode) {
            return <div></div>
        }
        let linkType = this.props.linkType;
        let items = this.props.items;
        //  (UIA.GetNodeProp(currentNode, nodeProperty) || []).map(t => {
        //     let node = GetNode(UIA.GetCurrentGraph(state), t);
        //     if (node) {
        //         return {
        //             title: UIA.GetNodeTitle(node),
        //             id: node.id
        //         }
        //     }
        // });
        let { state } = this.props;

        return <ButtonList active={true} isSelected={(item) => {
            var types = UIA.GetNodeProp(currentNode, nodeProperty) || [];
            if (types && types.some)
                return item && types.some(x => x === item.id);
        }}
            items={items}
            onClick={(item) => {
                if (this.props.removeLink) {
                    this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
                        target: item.value,
                        source: currentNode.id
                    })
                }
                if (this.props.removeNode) {
                    this.props.graphOperation(UIA.REMOVE_NODE, {
                        id: item.value
                    })
                }
            }} />
    }
}
export default UIConnect(NodeList)