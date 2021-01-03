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
import LinkViewer from './linkview';
import { Visual } from '../actions/uiActions';
import { QuickAccess, GraphLink } from '../methods/graph_types';
import NodeViewList from './nodeviewlist';
import LinkViewList from './linkviewlist';
const ResponsiveGridLayout = WidthProvider(Responsive);

class ObjectViewer extends Component<any, any> {
	constructor(props: any) {
		super(props);
		const Deflayout = [
			{ i: 'a', x: 3, y: 0, w: 9, h: 3 },
			{ i: 'b', x: 3, y: 3, w: 7, h: 4 },
			{ i: 'c', x: 0, y: 4, w: 3, h: 4 }
		];
		const layout = {
			lg: Deflayout
		};
		this.state = { layout };
	}

	minified() {
		const { state } = this.props;
		return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
	}
	componentDidMount() {
		setTimeout(() => {
			const Deflayout = [
				{ i: 'a', x: 3, y: 0, w: 9, h: 3 },
				{ i: 'b', x: 3, y: 3, w: 7, h: 4 },
				{ i: 'c', x: 0, y: 4, w: 3, h: 4 }
			];
			const layout = {
				lg: Deflayout
			};
			this.setState({
				layout
			})
		}, 5000)
	}

	render() {
		let props: any = this.props;
		const { state } = this.props;
		let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
		let enumerations: { id: string; value: string }[] = [];
		if (enumerationConfig && enumerationConfig.enumerationType) {
			enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
		}
		let currentViewNode: string | null = Visual(state, UIA.CURRENT_VIEW_NODE);
		let currentViewLink: string | null = Visual(state, UIA.CURRENT_VIEW_LINK);
		let node: Node = UIA.GetNodeForView(state, currentViewNode);
		let link: GraphLink = UIA.GetLinkForView(state, currentViewLink);
		let connections: QuickAccess<string> = UIA.GetNodeConnectionsForView(state, currentViewNode);
		let links: GraphLink[] = [];
		let linkConnections: QuickAccess<string> = UIA.GetNodeLinksForView(state, currentViewNode);
		let connectedNodes = linkConnections
			? Object.entries(linkConnections).map((item) => {
				let [key, value] = item;
				links.push(UIA.GetLinkForView(state, value));
				return UIA.GetNodeForView(state, key);
			})
			: [];
		return (
			<DashboardContainer minified={UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU)}>
				<ResponsiveGridLayout
					className="layout"
					draggableHandle={'.box-header'}
					layout={this.state.layout}
					measureBeforeMount={false}
					breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
					cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
				>
					<div key="a" data-grid={{ x: 0, y: 0, w: 12, h: 2 }} >
						<Panel stretch title={node ? UIA.GetNodeTitle(node) : 'Current Node'}>
							<NodeViewer node={node} />
						</Panel>
					</div>
					<div key="b" data-grid={{ x: 0, y: 2, w: 6, h: 2 }}>
						<Panel stretch title={'Connecting Nodes'}>
							{' '}
							<NodeViewList nodes={connectedNodes} />
						</Panel>
					</div>
					<div key="c" data-grid={{ x: 7, y: 2, w: 6, h: 2 }}>
						<Panel stretch title={'Links Nodes'}>
							<LinkViewList
								state={state}
								links={links}
								onSelectNode={(item: any) => {
									this.props.remoteSelectNode(item);
								}}
							/>
						</Panel>
					</div>
					<div key="d" data-grid={{ x: 7, y: 0, w: 12, h: 2 }}>
						<Panel stretch title={'Current Link'}>
							<LinkViewer
								state={state}
								link={link}
								onSelectNode={(item: any) => {
									this.props.remoteSelectNode | (item);
								}}
							/>
						</Panel>
					</div>
				</ResponsiveGridLayout>
			</DashboardContainer>
		);
	}
}

export default UIConnect(ObjectViewer);
