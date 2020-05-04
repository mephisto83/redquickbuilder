
// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import { LinkType } from '../constants/nodetypes';
class ViewTypeMenu extends Component<any, any> {
    render() {
        var { state } = this.props;
        var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

        return (
            <TreeViewMenu
                open={true}
                active={true}
                title={Titles.Select}
                toggle={() => {
                }}>
                <TreeViewMenu title={LinkType.ComponentInternalApi} hideArrow={true} onClick={() => {
                    this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.ComponentInternalApi);
                }} />
                <TreeViewMenu title={LinkType.ComponentExternalApi} hideArrow={true} onClick={() => {
                    this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.ComponentExternalApi);
                }} />
                <TreeViewMenu title={LinkType.DefaultViewType} hideArrow={true} onClick={() => {
                    this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.DefaultViewType);
                }} />
            </TreeViewMenu>)
    }
}

export default UIConnect(ViewTypeMenu)
