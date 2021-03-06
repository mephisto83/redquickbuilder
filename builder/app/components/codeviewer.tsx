// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
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
import DashboardContainer from './dashboardcontainer';
import Panel from './panel';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import NodeViewer from './nodeview';
import { Visual } from '../actions/uiActions';
import { QuickAccess, GraphLink } from '../methods/graph_types';
import RenderedCode from './renderedcode';
const ResponsiveGridLayout = WidthProvider(Responsive);

class CodeViewer extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	minified() {
		const { state } = this.props;
		return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
	}

	render() {
		let props: any = this.props;
		const { state } = this.props;
		let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
		let enumerations: { id: string; value: string }[] = [];
		if (enumerationConfig && enumerationConfig.enumerationType) {
			enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
		}
		const Deflayout = [
			{ i: 'a', x: 0, y: 0, w: 6, h: 6 },
			{ i: 'b', x: 6, y: 0, w: 3, h: 6 },
			{ i: 'c', x: 0, y: 6, w: 1, h: 2 }
		];
		const layout = {
			lg: Deflayout,
			md: Deflayout,
			sm: Deflayout,
			xs: Deflayout,
			xxs: Deflayout
		};
		let currentViewNode: string | null = Visual(state, UIA.CURRENT_VIEW_NODE);
		let node: Node = UIA.GetNodeForView(state, currentViewNode);
		let connections: QuickAccess<string> = UIA.GetNodeConnectionsForView(state, currentViewNode);
		let links: GraphLink[] = [];
		let linkConnections: QuickAccess<string> = UIA.GetNodeLinksForView(state, currentViewNode);
		let connectedNodes = linkConnections
			? Object.entries(linkConnections).map((item) => {
					let [ key, value ] = item;
					links.push(UIA.GetLinkForView(state, value));
					return UIA.GetNodeForView(state, key);
				})
			: [];
		return (
			<DashboardContainer minified={UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU)}>
				{/* <ResponsiveGridLayout
					className="layout"
					draggableHandle={'.box-header'}
					breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
					layout={layout}
					cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
				>
					<div key="a">
						<Panel stretch title={node ? UIA.GetNodeTitle(node) : 'Current Node'}>
						</Panel>
					</div>
				</ResponsiveGridLayout> */}
				<RenderedCode value={UIA.Visual(state, UIA.VIEW_CODE)} />
			</DashboardContainer>
		);
	}
}

export default UIConnect(CodeViewer);
