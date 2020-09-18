// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import {
	EnumerationConfig,
	RouteDescription,
	RouteSourceType,
	AfterEffect,
	NextStepConfiguration,
	SetProperty
} from '../interface/methodprops';
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
const AFTER_EFFECT_DELIMITER = '----------';

function captureAfterEffectSentence(afterEffect: AfterEffect) {
	if (
		afterEffect &&
		afterEffect.dataChainOptions &&
		afterEffect.dataChainOptions.nextStepsConfiguration &&
		afterEffect.dataChainOptions.nextStepsConfiguration.steps
	) {
		return afterEffect.dataChainOptions.nextStepsConfiguration.steps
			.map((step: NextStepConfiguration) => {
				return captureStepSentences(step).join(NEW_LINE + AFTER_EFFECT_DELIMITER + NEW_LINE);
			})
			.join();
	}
	return '';
}
function captureStepSentences(step: NextStepConfiguration): string[] {
	let result: string[] = [];
	if (step && step.enabled) {
		if (step.existenceCheck && step.existenceCheck.enabled) {
			if (step.existenceCheck.description) result.push(step.existenceCheck.description);
		}
		if (step.getExisting && step.getExisting.enabled) {
			if (step.getExisting.description) result.push(step.getExisting.description);
		}
		if (step.constructModel && step.constructModel.enabled) {
			if (step.constructModel.description) result.push(step.constructModel.description);
			if (step.constructModel.setProperties && step.constructModel.setProperties.properties) {
				step.constructModel.setProperties.properties.forEach((prop: SetProperty) => {
					result.push(prop.description);
				});
			}
		}
	}
	return result;
}
export default class AfterEffectInput extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { sentences: '' };
	}
	componentWillUpdate(prevProps: any) {
		if (prevProps && prevProps.afterEffects && prevProps.afterEffects.routes) {
			let afterEffects: AfterEffect[] = prevProps.afterEffects;
			let sentences = afterEffects
				.map((afterEffect: AfterEffect) => captureAfterEffectSentence(afterEffect))
				.filter((v) => v)
				.join(NEW_LINE);
			if (this.state.afterEffects !== afterEffects && sentences !== this.state.sentences) {
				this.setState({ sentences, afterEffects: afterEffects });
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
			// let newroutes = results
			// 	.map((meaning: NLMeaning) => {
			// 		let source: any =
			// 			meaning.targetClause &&
			// 			meaning.targetClause.argument &&
			// 			meaning.targetClause.argument.as &&
			// 			meaning.targetClause.argument.useArgument
			// 				? {
			// 						[meaning.targetClause.argument.as]: {
			// 							model: meaning.targetClause.argument.useArgument,
			// 							type: RouteSourceType.UrlParameter
			// 						}
			// 					}
			// 				: null;
			// 		if (
			// 			!source &&
			// 			meaning.targetClause &&
			// 			meaning.targetClause.argument &&
			// 			meaning.targetClause.argument.subClause &&
			// 			meaning.targetClause.argument.as
			// 		) {
			// 			source = {
			// 				[meaning.targetClause.argument.as]: {
			// 					model: meaning.targetClause.argument.subClause.agent,
			// 					property: meaning.targetClause.argument.subClause.property,
			// 					type:
			// 						meaning.targetClause.argument.subClause.agent === this.props.agent
			// 							? RouteSourceType.Agent
			// 							: RouteSourceType.Model
			// 				}
			// 			};
			// 		}
			// 		let route: RouteDescription = {
			// 			agent: this.props.agent || '',
			// 			model: meaning.targetClause.agent || '',
			// 			viewType: meaning.viewType || '',
			// 			id: UIA.GUID(),
			// 			name: meaning.text
			// 		};
			// 		if (meaning.targetClause && meaning.targetClause.dashboard) {
			// 			route.dashboard = meaning.targetClause.dashboard;
			// 			route.isDashboard = true;
			// 		}
			// 		if (this.props.viewType === ViewTypes.GetAll && meaning.viewType !== ViewTypes.Create) {
			// 			route.isItemized = true;
			// 		}
			// 		if (source) {
			// 			route.source = source;
			// 		}
			// 		return route;
			// 	})
			// 	.filter((v) => v);
			// if (this.props.onNewRoutes) {
			// 	this.props.onNewRoutes(newroutes);
			// }
		}
	}
}
