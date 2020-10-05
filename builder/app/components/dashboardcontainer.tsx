// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import { EnumerationConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';
import DashboardLogo from './dashboardlogo';
import DashboardNavBar from './dashboardnavbar';
import { NodesByType, GetNodeProp } from '../methods/graph_methods';
import MainSideBar from './mainsidebar';
import SidebarToggle from './sidebartoggle';
import SideBarMenu from './sidebarmenu';
import SideBarHeader from './sidebarheader';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import Header from './header';
import Content from './content';
import { UIConnect } from '../utils/utils';
import NavBarMenu from './navbarmenu';

export default class DashboardContainer extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	minified() {
		const { state } = this.props;
		return this.props.minified ? 'sidebar-collapse' : '';
	}

	render() {
		let props: any = this.props;
		let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
		let enumerations: { id: string; value: string }[] = [];
		if (enumerationConfig && enumerationConfig.enumerationType) {
			enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
		}
		return (
			<div
				className={`skin-red sidebar-mini skin-red ${this.minified()} ${this.state.small ? 'small' : ''}`}
				style={{
					height: 'auto',
					minHeight: '100vh'
				}}
			>
				<div className="wrapper" style={{ height: '100vh' }}>
					<Header>
						<DashboardLogo word="Viewer" />
						<DashboardNavBar>
							<SidebarToggle />
							<NavBarMenu />
						</DashboardNavBar>
						<MainSideBar overflow>
							<SideBarMenu>
								<SideBarHeader
									title={Titles.Viewer}
									onClick={() => {
										this.props.toggleVisual('MAIN_NAV');
									}}
								/>
							</SideBarMenu>
						</MainSideBar>
						<Content flex={this.props.flex}>{this.props.children}</Content>
					</Header>
				</div>
			</div>
		);
	}
}

