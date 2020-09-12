// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import MainSideBar from './mainsidebar';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import SideBar from './sidebar';
import TreeViewMenu from './treeviewmenu';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import {
	NodeProperties,
	NodeTypes,
	LinkEvents,
	LinkType,
	LinkProperties,
	GroupProperties
} from '../constants/nodetypes';
import {
	addValidatator,
	TARGET,
	createEventProp,
	GetNode,
	GetLinkChain,
	GetLinkChainItem,
	createExecutor,
	GetLinkBetween
} from '../methods/graph_methods';
import SideBarMenu from './sidebarmenu';
import { FunctionTypes, FunctionTemplateKeys } from '../constants/functiontypes';
import { DataChainContextMethods } from '../constants/datachain';
import { Node } from '../methods/graph_types';

class CheckRelationships extends Component<any, any> {
	render() {
		var { state } = this.props;

		var currentNode: Node = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (!currentNode) {
			return <div />;
		}

		let modelRef = UIA.GetModelReferencedByProperty(currentNode.id);
		return (
			<MainSideBar active={true} relative>
				<SideBar relative style={{ paddingTop: 0 }}>
					<SideBarMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'Property-Relationships')}
							active={true}
							title={Titles.Properties}
							toggle={() => {
								this.props.toggleVisual('Property-Relationships');
							}}
						>
							<TreeViewMenu active={modelRef} title={`-> ${UIA.GetNodeTitle(modelRef)}`} />
						</TreeViewMenu>
					</SideBarMenu>
				</SideBar>
			</MainSideBar>
		);
	}
}

export default UIConnect(CheckRelationships);
