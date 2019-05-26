// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';


import TreeViewMenu from './treeviewmenu';
import TreeViewItem from './treeviewitem';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';

const SECTION_LIST = 'SECTION_LIST';
class SectionList extends Component {
    render() {
        let me = this;
        let { state } = me.props;
        let sections = [];
        let subGraphs = UIA.GetSubGraphs(state);
        let rootGraph = UIA.GetRootGraph(state);
        if (subGraphs) {
            subGraphs.map(sg => {
                sections.push((
                    <TreeViewItem
                        key={sg.id}
                        title={sg.title || Titles.Unknown}
                        right={<span class="label label-primary pull-right">{sg.nodes.length}</span>}
                        onClick={() => {
                            me.props.setApplication(UIA.GRAPH_SCOPE, [sg.id]);
                        }} ></TreeViewItem>
                ))
            })
        }
        let body = sections;
        if (rootGraph) {
            body = (
                <TreeViewMenu
                    hideIcon={true}
                    right={<span class="label label-primary pull-right">{rootGraph.nodes.length}</span>}
                    title={rootGraph.title || Titles.Unknown}
                    hideArrow={true}
                    open={true}
                    active={true}
                    onClick={() => {
                        me.props.setApplication(UIA.GRAPH_SCOPE, null);
                    }}>
                    {sections}
                </TreeViewMenu>)
        }
        return (
            <TreeViewMenu
                title={Titles.Sections}
                icon={'fa fa-cart-plus'}
                open={UIA.Visual(state, SECTION_LIST)}
                active={UIA.Visual(state, SECTION_LIST)}
                onClick={() => {
                    this.props.toggleVisual(SECTION_LIST)
                }}>
                {body}
            </TreeViewMenu>
        );
    }
}
export default UIConnect(SectionList);