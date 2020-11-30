// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiActions';
import SideBarContent from './sidebarcontent';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import ExecutorItem from './executoritem';
import * as Titles from './titles';
import { NodeProperties, ExecutorUI } from '../constants/nodetypes';
import { createValidator, addValidatator, GetNode } from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { uuidv4 } from '../utils/array';

import SideBarHeader from './sidebarheader';
class GenericPropertyContainer extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = this.props.active || UIA.IsCurrentNodeA(state, this.props.nodeType);
		if (!active) {
			return <div />;
		}

		return (
			<MainSideBar relative={true}>
				<SideBar style={this.props.sideBarStyle || {}} relative={true}>
					{this.props.top ? this.props.top : null}
					<SideBarMenu>{this.props.children}</SideBarMenu>
				</SideBar>
			</MainSideBar>
		);
	}
}

export default UIConnect(GenericPropertyContainer);
