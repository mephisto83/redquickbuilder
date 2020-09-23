// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import { EnumerationConfig, RouteDescription, RouteSourceType } from '../interface/methodprops';
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
import TextInput from './textinput';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { ValidationColors } from '../interface/methodprops';
import { GetNLMeaning, GetNaturalLanguageMeaning } from './validationcomponentitem';
import { NLMeaning } from '../service/naturallang';
import { ViewTypes } from '../constants/viewtypes';
import { NEW_LINE } from '../constants/nodetypes';
const ResponsiveGridLayout = WidthProvider(Responsive);

export default class RoutingInput extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { sentences: '' };
	}
	componentWillUpdate(prevProps: any) {
		if (prevProps && prevProps.routing && prevProps.routing.routes) {
			let routes: RouteDescription[] = prevProps.routing.routes;
			let sentences = routes.map((route: RouteDescription) => route.name).filter((v) => v).join(NEW_LINE);
			if (this.state.routes !== routes && sentences !== this.state.sentences) {
				this.setState({ sentences, routes });
			}
		}
	}
	render() {
		let props: any = this.props;
		const { state } = this.props;

		let valid = !!this.state.sentences;

		return (
			<TreeViewMenu
				open={this.state.open}
				color={this.state.sentences ? ValidationColors.Ok : ValidationColors.Neutral}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Routing}
			>
				<TreeViewItemContainer>
					<TextInput
						texteditor
						active={this.state.open}
						label={'Sentences'}
            immediate
            context={{
							agent: this.props.agent,
							model: this.props.model,
							methodContext: []
						}}
						value={this.state.sentences}
						onChange={(val: string) => {
							this.setState({ sentences: val });
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						icon="fa fa-star"
						onClick={() => {
							this.buildRoutes();
						}}
					/>
					<TreeViewGroupButton
						icon="fa fa-ship"
						title={ViewTypes.GetAll}
						onClick={() => {
							let agentName = UIA.GetCodeName(this.props.agent).toLocaleLowerCase();
							let modelName = UIA.GetCodeName(this.props.model).toLocaleLowerCase();
							let sentences = [
								`The ${agentName} navigates to the ${modelName}'s Get screen with the ${modelName}'s id as model`,
								`The ${agentName} navigates to the ${modelName}'s Create screen`
							].join(NEW_LINE);

							this.setState(
								{
									sentences
								},
								() => {
									this.buildRoutes();
								}
							);
						}}
					/>
					<TreeViewGroupButton
						title={ViewTypes.Get}
						icon="fa fa-wheelchair"
						onClick={() => {
							let agentName = UIA.GetCodeName(this.props.agent).toLocaleLowerCase();
							let modelName = UIA.GetCodeName(this.props.model).toLocaleLowerCase();
							let sentences = [
								`The ${agentName} navigates to the ${modelName}'s Update screen with the ${modelName}'s id as model`,
								`The ${agentName} navigates to the ${modelName}'s Create screen`
							].join(NEW_LINE);

							this.setState(
								{
									sentences
								},
								() => {
									this.buildRoutes();
								}
							);
						}}
					/>
					<TreeViewGroupButton
						title={ViewTypes.Get}
						icon="fa  fa-tripadvisor"
						onClick={() => {
							let agentName = UIA.GetCodeName(this.props.agent).toLocaleLowerCase();
							let modelName = UIA.GetCodeName(this.props.model).toLocaleLowerCase();
							let sentences = [
								`The ${agentName} navigates to the ${modelName}'s GetAll screen`,
								`The ${agentName} navigates to the ${modelName}'s Create screen`
							].join(NEW_LINE);

							this.setState(
								{
									sentences
								},
								() => {
									this.buildRoutes();
								}
							);
						}}
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}

	private buildRoutes() {
		let results: NLMeaning[] = GetNaturalLanguageMeaning({
			methodDescription: {
				agent: this.props.agent,
				model: this.props.model
			},
			sentences: this.state.sentences
		});

		if (results) {
			let newroutes = results
				.map((meaning: NLMeaning) => {
					let source: any =
						meaning.targetClause &&
						meaning.targetClause.argument &&
						meaning.targetClause.argument.as &&
						meaning.targetClause.argument.useArgument
							? {
									[meaning.targetClause.argument.as]: {
										model: meaning.targetClause.argument.useArgument,
										type: RouteSourceType.UrlParameter
									}
								}
							: null;
					if (
						!source &&
						meaning.targetClause &&
						meaning.targetClause.argument &&
						meaning.targetClause.argument.subClause &&
						meaning.targetClause.argument.as
					) {
						source = {
							[meaning.targetClause.argument.as]: {
								model: meaning.targetClause.argument.subClause.agent,
								property: meaning.targetClause.argument.subClause.property,
								type:
									meaning.targetClause.argument.subClause.agent === this.props.agent
										? RouteSourceType.Agent
										: RouteSourceType.Model
							}
						};
					}
					let route: RouteDescription = {
						agent: this.props.agent || '',
						model: meaning.targetClause.agent || '',
						viewType: meaning.viewType || '',
						id: UIA.GUID(),
						name: meaning.text
					};
					if (meaning.targetClause && meaning.targetClause.dashboard) {
						route.dashboard = meaning.targetClause.dashboard;
						route.isDashboard = true;
					}
					if (this.props.viewType === ViewTypes.GetAll && meaning.viewType !== ViewTypes.Create) {
						route.isItemized = true;
					}
					if (source) {
						route.source = source;
					}
					return route;
				})
				.filter((v) => v);
			if (this.props.onNewRoutes) {
				this.props.onNewRoutes(newroutes);
			}
		}
	}
}
