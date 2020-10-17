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
import DashboardContainer from './dashboardcontainer';
import Panel from './panel';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout';
import NodeViewer from './nodeview';
import { Visual } from '../actions/uiactions';
import { QuickAccess, GraphLink } from '../methods/graph_types';
import NodeViewList from './nodeviewlist';
import LinkViewList from './linkviewlist';
const ResponsiveGridLayout = WidthProvider(Responsive);
import FlowCode, { SetFlowCodeModel } from './flowcode';
import { DeclartionColors, IFlowCodeConfig, IFlowCodeStatements, LoadFileSource } from '../constants/flowcode_ast';

class FlowCodeViewer extends Component<any, any> {
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
			{ i: 'a', x: 0, y: 0, w: 6, h: 6 }
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

		return (
			<DashboardContainer flex minified={UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU)} sideBar={this.getSideBar()}>
				<Panel stretch title={node ? UIA.GetNodeTitle(node) : 'Current Node'}>
					<FlowCode fileSource={this.state.fileSource} code={this.state.code} functionName={this.state.functionName} />
				</Panel>
			</DashboardContainer>
		);
	}
	getSideBar() {
		let flows = Visual(this.props.state, UIA.FLOW_CODE_FLOWS);
		console.log(flows);
		let typescriptFlows: any[] = [];
		if (flows) {
			Object.entries(flows).map((item: [string, any], index: number) => {
				let [key, flow] = item;
				typescriptFlows.push(<TreeViewMenu
					active
					title={key}
					key={`${key}-${index}`}
					icon="fa fa-map"
					onClick={() => {
						// SetFlowCodeModel(flow, key);
						this.setState({ functionName: key, code: flow });
					}}
				/>)
			})
		}
		return [<TreeViewMenu
			key="typescriptflows"
			title="Typescript"
			active
			open={this.state.typescriptFlowMenu}
			onClick={() => {
				this.setState({ typescriptFlowMenu: !this.state.typescriptFlowMenu })
			}}>
			<TreeViewMenu title="load" onClick={() => {
				LoadFileSource().then((res) => {
					this.setState({ fileSource: res })
				})
			}} />
			{typescriptFlows}
			{this.getTypescriptAsts()}
		</TreeViewMenu>];
	}
	getTypescriptAsts() {
		let result: any[] = [];

		if (this.state.fileSource) {
			Object.entries(this.state.fileSource).map((item: any[]) => {
				let [key, obj] = item;
				let statements: IFlowCodeStatements = obj;
				result.push(<TreeViewMenu active key={key} open={this.state[`${key}`]} title={key} onClick={() => {
					this.setState({ [`${key}`]: !this.state[`${key}`] });
				}}>
					{this.getTypescriptASTFunctions(statements, key)}
				</TreeViewMenu>)
			})
		}

		return result;
	}
	getTypescriptASTFunctions(statements: IFlowCodeStatements, file: string): any {
		let result: any[] = [];

		Object.entries(statements).map((value: [string, IFlowCodeConfig]) => {
			let [key, config] = value;
			let colorKey: any = config.ast ? config.ast.kind : '';
			result.push(<TreeViewMenu active title={key} key={key} color={DeclartionColors[colorKey] || config.color} onDragStart={(event: any) => {
				event.dataTransfer.setData('storm-diagram-node', JSON.stringify({ type: key, file: file, color: DeclartionColors[colorKey] || config.color }));
			}} />)
		})

		return result;
	}
}

export default UIConnect(FlowCodeViewer);
