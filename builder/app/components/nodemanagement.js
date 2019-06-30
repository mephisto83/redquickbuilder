// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


import TreeViewMenu from './treeviewmenu';
import TextInput from './textinput';
import TreeViewItem from './treeviewitem';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import { NodeProperties } from '../constants/nodetypes';

const NODE_MANAGEMENT = 'NODE_MANAGEMENT';
class NodeManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: ''
        };
    }
    toFilterString(node) {
        return `${UIA.GetNodeProp(node, NodeProperties.CodeName)} ${UIA.GetNodeProp(node, NodeProperties.UIText)} ${UIA.GetNodeProp(node, NodeProperties.NODEType)}`.toLowerCase();
    }
    render() {
        let me = this;
        let { state } = me.props;

        var graph = UIA.GetCurrentGraph(state);
        let filter = (this.state.filter || '').toLowerCase();
        let groups = UIA.GetNodes(state).filter(x => {
            if (!filter) {
                return false;
            }
            var str = this.toFilterString(x);
            return str.indexOf(filter) !== -1;
        }).groupBy(x => UIA.GetNodeProp(x, NodeProperties.NODEType));
        let body = [];
        body = Object.keys(groups).filter(group => groups[group].length).map((group, gi) => {
            let groupKey = `NodeManagement-${group}`;
            let groupNodes = groups[group].map((gn, gni) => {
                return (
                    <TreeViewMenu key={`node-${group}-${gi}-${gni}`}
                        hideArrow={true}
                        title={UIA.GetNodeProp(gn, NodeProperties.UIText)}
                        icon={!UIA.GetNodeProp(gn, NodeProperties.Pinned) ? "fa fa-circle-o" : 'fa fa-check-circle-o'}
                        toggle={() => {
                            this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
                                prop: UIA.NodeProperties.Pinned,
                                id: gn.id,
                                value: !UIA.GetNodeProp(gn, NodeProperties.Pinned)
                            });
                        }}>
                    </TreeViewMenu>
                );
            })
            return (
                <TreeViewMenu title={group} key={`node-${group}-${gi}`}
                    icon="fa fa-dot-circle-o"
                    open={UIA.Visual(state, groupKey)}
                    active={UIA.Visual(state, groupKey)}
                    right={<span className="label label-primary ">{groups[group].length}</span>}
                    toggle={() => {
                        this.props.toggleVisual(groupKey)
                    }}>
                    {groupNodes}
                </TreeViewMenu>
            );
        })
        return (
            <TreeViewMenu
                title={Titles.Nodes}
                icon={'fa fa-object-group'}
                open={UIA.Visual(state, NODE_MANAGEMENT)}
                active={UIA.Visual(state, NODE_MANAGEMENT)}
                onClick={() => {
                    this.props.toggleVisual(NODE_MANAGEMENT)
                }}>
                <FormControl sidebarform={true}>
                    <TextInput value={this.state.filter} onChange={(value) => {
                        this.setState({ filter: value });
                    }} inputgroup={true} placeholder={Titles.SectionEdit} />
                </FormControl>
                {body}
            </TreeViewMenu>
        );
    }
}
export default UIConnect(NodeManagement);