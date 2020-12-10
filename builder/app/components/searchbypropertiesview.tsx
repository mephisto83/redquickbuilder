// @flow
import React, { Component } from 'react';

import TreeViewMenu from './treeviewmenu';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import { NodeProperties } from '../constants/nodetypes';
import SearchByPropertiesViewItem, { SearchPropertyViewItem } from './searchbypropertiesviewitem';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';

const NODE_MANAGEMENT = 'NODE_MANAGEMENT';
export default class SearchByPropertiesView extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            filter: '',
            options: []
        };
    }
    toFilterString(node) {
        return `${UIA.GetNodeProp(node, NodeProperties.CodeName)} ${node.id} ${UIA.GetNodeProp(
            node,
            NodeProperties.UIText
        )} ${UIA.GetNodeProp(node, NodeProperties.NODEType)}`.toLowerCase();
    }
    render() {
        let me = this;
        let { state } = me.props;

        var graph = UIA.GetCurrentGraph(state);
        let { options } = this.state;
        return (
            <TreeViewMenu
                title={`${Titles.Nodes} ${graph ? Object.keys(graph.visibleNodes || {}).length : ''}`}
                icon={'fa fa-object-group'}
                open
                active
                onClick={() => {
                    // this.props.toggleVisual(NODE_MANAGEMENT);
                }}
            >
                <TreeViewButtonGroup>
                    <TreeViewGroupButton
                        title={`Add`}
                        onClick={() => {
                            options.push({
                                property: '',
                                excludedProperty: '',
                                value: '',
                                id: UIA.GUID()
                            })
                            this.setState({ options })
                        }}
                        icon="fa fa-plus"
                    />
                    <TreeViewGroupButton
                        title={`Search`}
                        onClick={() => {
                            if (this.props.onSearch) {
                                this.props.onSearch(options);
                            }
                        }}
                        icon="fa fa-search"
                    />
                </TreeViewButtonGroup>
                {this.state.options.map((item: SearchPropertyViewItem) => {
                    return <SearchByPropertiesViewItem key={item.id} item={item}
                        onDelete={() => {
                            let index: number = options.findIndex((opt: SearchPropertyViewItem) => opt.id === item.id);
                            if (index !== -1 && options) {
                                options.splice(index, 1);
                                this.setState({ turn: UIA.GUID() });
                            }
                        }} />
                })}
            </TreeViewMenu>
        );
    }
}
