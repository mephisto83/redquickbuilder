/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TopViewer from './topviewer';

import {
	GetCurrentGraph,
	VisualEq,
	NodeProperties,
	GetLinkProperty,
	GetNodeTitle,
	GetNodeProp,
	isAccessNode,
	NodesByType,
	ROUTING_CONTEXT_MENU,
	MOUNTING_CONTEXT_MENU,
	EFFECT_CONTEXT_MENU,
	isAccessNodeForDashboard,
	DASHBOARD_MOUNTING_CONTEXT_MENU,
	DASHBOARD_EFFECT_CONTEXT_MENU,
	DASHBOARD_ROUTING_CONTEXT_MENU,
	AGENT_SCREENEFFECT_CONTEXT_MENU,
	DASHBOARD_SCREENEFFECT_CONTEXT_MENU,
	GUID
} from '../actions/uiactions';
import Box from './box';
import FormControl from './formcontrol';
import * as Titles from './titles';
import CheckBox from './checkbox';
import { NodeTypes, LinkType, LinkPropertyKeys } from '../constants/nodetypes';
import TabContainer from './tabcontainer';
import Tabs from './tabs';
import TabContent from './tabcontent';
import TabPane from './tabpane';
import Tab from './tab';
import {
	GetNodesByProperties,
	existsLinkBetween,
	findLink,
	existsLinksBetween,
	getNodeLinks,
	SOURCE,
	getLink
} from '../methods/graph_methods';
import { ViewTypes } from '../constants/viewtypes';
import BuildAgentAccessWeb from '../nodepacks/BuildAgentAccessWeb';
import SelectInput from './selectinput';
import {
	FunctionTypes,
	MethodFunctions,
	FunctionTemplateKeys,
	GetFunctionTypeOptions
} from '../constants/functiontypes';
import MethodProps, {
	MethodDescription,
	RoutingProps,
	Routing,
	RouteDescription,
	ViewMoutingProps,
	ViewMounting,
	MountingDescription,
	EffectProps,
	Effect,
	DashboardAccessProps,
	DashboardEffect,
	DashboardViewMount,
	DashboardRouting,
	ScreenEffectApiProps,
	ScreenEffectApi
} from '../interface/methodprops';
import { Node, GraphLink } from '../methods/graph_types';

const AGENT_ACCESS_VIEW_TAB = 'agent -access-view-tab';

class AgentAccessView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			agents: [],
			models: [],
			dashboards: [],
			dashboardAccess: {},
			agentAccess: [],
			agentMethod: [],
			agentEffect: [],
			agentScreenEffect: {},
			dashboardScreenEffect: {}
		};
	}

	active() {
		return !!this.props.active;
	}

	setAgentAccess(modelIndex: number, agentIndex: number, v: string, value: boolean) {
		if (!this.state.agentAccess[agentIndex]) {
			this.state.agentAccess[agentIndex] = {};
		}
		if (!this.state.agentAccess[agentIndex][modelIndex]) {
			this.state.agentAccess[agentIndex][modelIndex] = {};
		}
		this.state.agentAccess[agentIndex][modelIndex][v] = value;
	}

	setAgentDashboardAccess(model: string, agent: string, value: boolean) {
		if (!this.state.dashboardAccess[agent]) {
			this.state.dashboardAccess[agent] = {};
		}

		this.state.dashboardAccess[agent][model] = { access: value };
	}

	setAgentMethod(modelIndex: number, agentIndex: number, v: string, functionType: string) {
		if (!this.state.agentMethod[agentIndex]) {
			this.state.agentMethod[agentIndex] = {};
		}
		if (!this.state.agentMethod[agentIndex][modelIndex]) {
			this.state.agentMethod[agentIndex][modelIndex] = {};
		}
		if (typeof this.state.agentMethod[agentIndex][modelIndex][v] === 'string') {
			this.state.agentMethod[agentIndex][modelIndex][v] = {
				functionType: this.state.agentMethod[agentIndex][modelIndex][v]
			};
		}
		if (!this.state.agentMethod[agentIndex][modelIndex][v]) {
			this.state.agentMethod[agentIndex][modelIndex][v] = { properties: {} };
		}
		this.state.agentMethod[agentIndex][modelIndex][v].functionType = functionType;
	}

	setAgentMethodProperty(modelIndex: number, agentIndex: number, v: string, key: string, value: string) {
		if (!this.state.agentMethod[agentIndex]) {
			this.state.agentMethod[agentIndex] = {};
		}
		if (!this.state.agentMethod[agentIndex][modelIndex]) {
			this.state.agentMethod[agentIndex][modelIndex] = {};
		}
		if (typeof this.state.agentMethod[agentIndex][modelIndex][v] === 'string') {
			this.state.agentMethod[agentIndex][modelIndex][v] = {
				functionType: this.state.agentMethod[agentIndex][modelIndex][v]
			};
		}
		if (!this.state.agentMethod[agentIndex][modelIndex][v]) {
			this.state.agentMethod[agentIndex][modelIndex][v] = { properties: {} };
		}
		this.state.agentMethod[agentIndex][modelIndex][v].properties[key] = value;
	}

	private setDefaultAgentMethod(
		value: string,
		v: string,
		modelIndex: number,
		agentIndex: number,
		agent: string,
		model: string
	) {
		if (value) {
			let functionType: string = '';
			switch (v) {
				case ViewTypes.Update:
				case ViewTypes.Get:
					functionType = FunctionTypes.Get_Object_Agent_Value__Object;
					break;
				case ViewTypes.GetAll:
					functionType = FunctionTypes.Get_Agent_Value__IListObject;
					break;
				case ViewTypes.Delete:
				case ViewTypes.Create:
					break;
			}
			if (functionType) {
				let { constraints } = MethodFunctions[functionType];
				[
					FunctionTemplateKeys.Model,
					FunctionTemplateKeys.ModelOutput,
					FunctionTemplateKeys.Agent
				].forEach((constraintKey: string) => {
					if (constraints && constraints[constraintKey]) {
						let temp: string = model;
						if (constraintKey === FunctionTemplateKeys.Agent) {
							temp = agent;
						}
						this.setAgentMethod(modelIndex, agentIndex, v, functionType);
						this.setAgentMethodProperty(modelIndex, agentIndex, v, constraintKey, temp);
					}
				});
			}
		}
	}

	setAgentRoutingProperty(modelIndex: number, agentIndex: number, v: string, routing: Routing) {
		if (!this.state.agentRouting[agentIndex]) {
			this.state.agentRouting[agentIndex] = {};
		}
		if (!this.state.agentRouting[agentIndex][modelIndex]) {
			this.state.agentRouting[agentIndex][modelIndex] = {};
		}
		if (typeof this.state.agentRouting[agentIndex][modelIndex][v] === 'string') {
			this.state.agentRouting[agentIndex][modelIndex][v] = {
				functionType: this.state.agentRouting[agentIndex][modelIndex][v]
			};
		}

		this.state.agentRouting[agentIndex][modelIndex][v] = routing;
	}
	setDashboardAgentRoutingProperty(model: string, agent: string, routing: Routing) {
		if (!this.state.agentRouting[agent]) {
			this.state.agentRouting[agent] = {};
		}
		this.state.agentRouting[agent][model] = routing;
	}
	setAgentMountingProperty(modelIndex: number, agentIndex: number, v: string, mounting: ViewMounting) {
		if (!this.state.agentViewMount[agentIndex]) {
			this.state.agentViewMount[agentIndex] = {};
		}
		if (!this.state.agentViewMount[agentIndex][modelIndex]) {
			this.state.agentViewMount[agentIndex][modelIndex] = {};
		}
		if (typeof this.state.agentViewMount[agentIndex][modelIndex][v] === 'string') {
			this.state.agentViewMount[agentIndex][modelIndex][v] = {
				functionType: this.state.agentViewMount[agentIndex][modelIndex][v]
			};
		}

		this.state.agentViewMount[agentIndex][modelIndex][v] = mounting;
	}
	setDashboardAgentMountingProperty(dashboard: string, agent: string, mounting: ViewMounting) {
		if (!this.state.dashboardViewMount[agent]) {
			this.state.dashboardViewMount[agent] = {};
		}
		if (!this.state.dashboardViewMount[agent][dashboard]) {
			this.state.dashboardViewMount[agent][dashboard] = {};
		}
		if (typeof this.state.dashboardViewMount[agent][dashboard] === 'string') {
			this.state.dashboardViewMount[agent][dashboard] = {
				functionType: this.state.dashboardViewMount[agent][dashboard]
			};
		}

		this.state.dashboardViewMount[agent][dashboard] = mounting;
	}
	setAgentEffectProperty(modelIndex: number, agentIndex: number, v: string, effect: Effect) {
		if (!this.state.agentEffect[agentIndex]) {
			this.state.agentEffect[agentIndex] = {};
		}
		if (!this.state.agentEffect[agentIndex][modelIndex]) {
			this.state.agentEffect[agentIndex][modelIndex] = {};
		}
		if (typeof this.state.agentEffect[agentIndex][modelIndex][v] === 'string') {
			this.state.agentEffect[agentIndex][modelIndex][v] = {
				functionType: this.state.agentEffect[agentIndex][modelIndex][v]
			};
		}

		this.state.agentEffect[agentIndex][modelIndex][v] = effect;
	}

	setDashboardAgentEffectProperty(dashboard: string, agent: string, effect: Effect) {
		if (!this.state.dashboardEffect[agent]) {
			this.state.dashboardEffect[agent] = {};
		}
		if (!this.state.dashboardEffect[agent][dashboard]) {
			this.state.dashboardEffect[agent][dashboard] = {};
		}

		this.state.dashboardEffect[agent][dashboard] = effect;
	}

	render() {
		const active = this.active();

		if (!active) {
			return <div />;
		}
		const graph = GetCurrentGraph();
		if (!graph) {
			return <div />;
		}
		const { state } = this.props;
		const onlyAgents = GetAgentsOnly();
		//  GetNodesByProperties(
		// 	{
		// 		[NodeProperties.NODEType]: NodeTypes.Model,
		// 		[NodeProperties.IsAgent]: true
		// 	},
		// 	graph
		// ).filter((x) => !GetNodeProp(x, NodeProperties.IsUser));
		return (
			<TopViewer active={active}>
				<section className="content">
					<div className="row">
						<div className="col-md-2">
							<Box maxheight={600} title={Titles.Style}>
								<FormControl>
									<CheckBox
										label={Titles.BindAll}
										onChange={(value: any) => {
											this.setState({ bindAll: value });
										}}
										value={this.state.bindAll}
									/>

									<a
										className="btn btn-default btn-flat"
										onClick={(evt) => {
											evt.stopPropagation();
											const accessDescriptions = GetNodesByProperties(
												{
													[NodeProperties.NODEType]: NodeTypes.AgentAccessDescription
												},
												graph
											);
											this.setState({
												agents: onlyAgents.map((v) => v.id),
												models: GetNodesByProperties(
													{
														[NodeProperties.NODEType]: NodeTypes.Model
													},
													graph
												).map((d) => d.id),
												dashboards: GetNodesByProperties(
													{
														[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
														[NodeProperties.IsDashboard]: true
													},
													GetCurrentGraph()
												).map((d: Node) => d.id),
												agentMethod: loadAgentMethods(onlyAgents, accessDescriptions, graph),
												agentRouting: loadAgentRouting(onlyAgents, accessDescriptions, graph),
												dashboardRouting: loadAgentDashboardRouting(
													onlyAgents,
													accessDescriptions,
													graph
												),
												agentScreenEffect: loadAgentScreenEffect(
													onlyAgents,
													accessDescriptions,
													graph
												),
												dashboardScreenEffect: loadDashboardScreenEffect(
													onlyAgents,
													accessDescriptions,
													graph
												),
												agentViewMount: loadAgentViewMount(
													onlyAgents,
													accessDescriptions,
													graph
												),
												dashboardViewMount: loadAgentDashbaordViewMount(
													onlyAgents,
													accessDescriptions,
													graph
												),
												agentEffect: loadAgentEffect(onlyAgents, accessDescriptions, graph),
												dashboardEffect: loadAgentDashboardEffect(
													onlyAgents,
													accessDescriptions,
													graph
												),
												dashboardAccess: loadAgentDashboardAccess(
													onlyAgents,
													accessDescriptions,
													graph
												),
												agentAccess: loadAgentAccess(onlyAgents, accessDescriptions, graph)
											});
											return false;
										}}
									>
										Load Agents
									</a>

									<a
										className="btn btn-default btn-primary"
										onClick={(evt) => {
											evt.stopPropagation();
											BuildAgentAccessWeb({ ...this.state });
											return false;
										}}
									>
										Set
									</a>
								</FormControl>
							</Box>
						</div>
						<div className="col-md-10">
							<TabContainer>
								<Tabs>
									<Tab
										active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentaccessview')}
										title="Access"
										onClick={() => {
											this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'agentaccessview');
										}}
									/>
									<Tab
										active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentmethoduse')}
										title="Mounting"
										onClick={() => {
											this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'agentmethoduse');
										}}
									/>
									<Tab
										active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agenteffects')}
										title="Effects"
										onClick={() => {
											this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'agenteffects');
										}}
									/>
									<Tab
										active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'button_routes')}
										title="Routing"
										onClick={() => {
											this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'button_routes');
										}}
									/>
									<Tab
										active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'screen_effects')}
										title="Screen Effects"
										onClick={() => {
											this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'screen_effects');
										}}
									/>
								</Tabs>
							</TabContainer>
							<TabContent>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentaccessview')}>
									<Box title={'Agent Access'} maxheight={500}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th
																style={{ backgroundColor: '#FEFCAD' }}
																key={`${index}-agent-access-th`}
																colSpan={5}
															>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
												<tr>
													<th />
													{[]
														.interpolate(
															0,
															this.state.agents.length,
															(agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => (
																	<th
																		onClick={() => {
																			const istrue = this.state.models.some(
																				(model: any, modelIndex: number) => {
																					if (
																						this.state.agentAccess[
																							agentIndex
																						] &&
																						this.state.agentAccess[
																							agentIndex
																						][modelIndex]
																					) {
																						return this.state.agentAccess[
																							agentIndex
																						][modelIndex][v];
																					}
																					return false;
																				}
																			);
																			this.state.models.forEach(
																				(model: any, modelIndex: number) => {
																					this.setAgentAccess(
																						modelIndex,
																						agentIndex,
																						v,
																						!istrue
																					);
																				}
																			);
																			this.setState({
																				agentAccess: [
																					...this.state.agentAccess
																				]
																			});
																		}}
																	>
																		{v}
																	</th>
																))
														)
														.flatten()}
												</tr>
											</thead>
											<tbody>
												{this.state.models.map((model: any, modelIndex: number) => {
													const result = [
														<th
															style={{ cursor: 'pointer' }}
															key={`${model}`}
															onClick={() => {
																const istrue = this.state.agents.some(
																	(agent: string, agentIndex: number) => {
																		if (
																			this.state.agentAccess[agentIndex] &&
																			this.state.agentAccess[agentIndex][
																				modelIndex
																			]
																		) {
																			return Object.values(
																				ViewTypes
																			).some((v) => {
																				return this.state.agentAccess[
																					agentIndex
																				][modelIndex][v];
																			});
																		}
																		return false;
																	}
																);
																this.state.agents.forEach(
																	(_: any, agentIndex: number) => {
																		return Object.values(ViewTypes).some((v) => {
																			this.setAgentAccess(
																				modelIndex,
																				agentIndex,
																				v,
																				!istrue
																			);
																		});
																	}
																);
																this.setState({
																	agentAccess: [ ...this.state.agentAccess ]
																});
															}}
														>
															{GetNodeTitle(model)}
														</th>
													];

													result.push(
														...[].interpolate(
															0,
															this.state.agents.length,
															(index: any, agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => {
																	const accessIndex =
																		modelIndex * this.state.agents.length +
																		agentIndex;
																	const agent = this.state.agents[index];
																	return (
																		<td
																			key={`${model} ${modelIndex} ${this.state
																				.agents[index]} ${agentIndex} ${v}`}
																		>
																			<CheckBox
																				label={' '}
																				title={`${GetNodeTitle(
																					agent
																				)} ${GetNodeTitle(model)}`}
																				style={{ height: 30, width: 30 }}
																				onChange={(value: any) => {
																					this.setAgentAccess(
																						modelIndex,
																						agentIndex,
																						v,
																						value
																					);
																					this.setDefaultAgentMethod(
																						value,
																						v,
																						modelIndex,
																						agentIndex,
																						agent.id,
																						model
																					);
																					this.setState({
																						agentAccess: [
																							...this.state.agentAccess
																						]
																					});
																				}}
																				value={this.hasAgentAccess(
																					agentIndex,
																					modelIndex,
																					v
																				)}
																			/>
																		</td>
																	);
																})
														)
													);
													return (
														<tr
															style={{
																backgroundColor:
																	modelIndex % 2 ? '#33333333' : '#eeeeeeee'
															}}
															key={`key${model}`}
														>
															{result.flatten()}
														</tr>
													);
												})}
											</tbody>
										</table>
									</Box>
									<Box title={'Dashboard Access'} maxheight={500}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th
																style={{ backgroundColor: '#FEFCAD' }}
																key={`${index}-agent-access-th`}
															>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
											</thead>
											<tbody>
												{this.state.dashboards.map((dashboard: any, dashboardIndex: number) => {
													const result = [
														<th
															style={{ cursor: 'pointer' }}
															key={`${dashboard}`}
															onClick={() => {}}
														>
															{GetNodeTitle(dashboard)}
														</th>
													];

													result.push(
														...[].interpolate(0, this.state.agents.length, (index: any) => {
															const agent = this.state.agents[index];
															return (
																<td key={`${dashboard} ${dashboardIndex} - ${agent} `}>
																	<CheckBox
																		label={' '}
																		title={`${GetNodeTitle(agent)} ${GetNodeTitle(
																			dashboard
																		)}`}
																		style={{ height: 30, width: 30 }}
																		onChange={(value: any) => {
																			this.setAgentDashboardAccess(
																				dashboard,
																				agent,
																				value
																			);

																			this.setState({
																				dashboardAccess: {
																					...this.state.dashboardAccess
																				}
																			});
																		}}
																		value={this.hasAgentDashboardAccess(
																			agent,
																			dashboard
																		)}
																	/>
																</td>
															);
														})
													);
													return (
														<tr
															style={{
																backgroundColor:
																	dashboardIndex % 2 ? '#33333333' : '#eeeeeeee'
															}}
															key={`dashboard - key${dashboard}`}
														>
															{result.flatten()}
														</tr>
													);
												})}
											</tbody>
										</table>
									</Box>
								</TabPane>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentmethoduse')}>
									<Box maxheight={500} title={'Agent Mounting Methods'}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }} colSpan={5}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
												<tr>
													<th />
													{[]
														.interpolate(0, this.state.agents.length, () =>
															Object.keys(ViewTypes).map((v) => <th>{v}</th>)
														)
														.flatten()}
												</tr>
											</thead>
											<tbody>
												{this.state.models.map((model: string, modelIndex: number) => {
													const result = [ <td>{GetNodeTitle(model)}</td> ];

													result.push(
														...[].interpolate(
															0,
															this.state.agents.length,
															(index: number, agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => {
																	const tdkey = `${model} ${modelIndex} ${this.state
																		.agents[index]} ${agentIndex} ${v}`;
																	if (
																		!this.hasAgentAccess(agentIndex, modelIndex, v)
																	) {
																		return <td key={tdkey} />;
																	}

																	let mounting: ViewMounting = this.getMountingDescription(
																		agentIndex,
																		modelIndex,
																		v
																	);
																	if (!mounting) {
																		mounting = {
																			mountings: []
																		};
																		this.setAgentMountingProperty(
																			modelIndex,
																			agentIndex,
																			v,
																			mounting
																		);
																	}
																	mounting.mountings = mounting.mountings || [];

																	let mountingDescriptionButton = this.createMountingDescriptionButton(
																		agentIndex,
																		onlyAgents,
																		model,
																		modelIndex,
																		v,
																		mounting
																	);
																	return (
																		<td key={tdkey}>{mountingDescriptionButton}</td>
																	);
																})
														)
													);
													return (
														<tr
															style={{
																backgroundColor:
																	modelIndex % 2 ? '#33333333' : '#eeeeeeee'
															}}
															key={`key${model}`}
														>
															{result.flatten()}
														</tr>
													);
												})}
											</tbody>
										</table>
									</Box>
									<Box maxheight={500} title={'Dashboard Mounting Methods'}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
											</thead>
											<tbody>
												{this.state.dashboards.map(
													(dashboard: string, dashboardIndex: number) => {
														const result = [ <td>{GetNodeTitle(dashboard)}</td> ];

														result.push(
															...this.state.agents.map(
																(agent: string, agentIndex: number) => {
																	const tdkey = `${dashboard} ${dashboard} ${agent} ${agentIndex} `;
																	if (
																		!this.hasAgentDashboardAccess(agent, dashboard)
																	) {
																		return <td key={tdkey} />;
																	}

																	let mounting: ViewMounting = this.getDashboardMountingDescription(
																		agent,
																		dashboard
																	);
																	if (!mounting) {
																		mounting = {
																			mountings: []
																		};
																		this.setDashboardAgentMountingProperty(
																			dashboard,
																			agent,
																			mounting
																		);
																	}
																	mounting.mountings = mounting.mountings || [];

																	let mountingDescriptionButton = this.createDashboardMountingDescriptionButton(
																		agent,
																		dashboard,
																		mounting
																	);
																	return (
																		<td key={tdkey}>{mountingDescriptionButton}</td>
																	);
																}
															)
														);
														return (
															<tr
																style={{
																	backgroundColor:
																		dashboardIndex % 2 ? '#33333333' : '#eeeeeeee'
																}}
																key={`key${dashboardIndex}`}
															>
																{result.flatten()}
															</tr>
														);
													}
												)}
											</tbody>
										</table>
									</Box>
								</TabPane>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agenteffects')}>
									<Box maxheight={500} title={'Agent Effect Methods'}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }} colSpan={5}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
												<tr>
													<th />
													{[]
														.interpolate(0, this.state.agents.length, () =>
															Object.keys(ViewTypes).map((v) => <th>{v}</th>)
														)
														.flatten()}
												</tr>
											</thead>
											<tbody>
												{this.state.models.map((model: string, modelIndex: number) => {
													const result = [ <td>{GetNodeTitle(model)}</td> ];

													result.push(
														...[].interpolate(
															0,
															this.state.agents.length,
															(index: number, agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => {
																	const tdkey = `${model} ${modelIndex} ${this.state
																		.agents[index]} ${agentIndex} -effects ${v}`;
																	if (
																		!this.hasAgentAccess(agentIndex, modelIndex, v)
																	) {
																		return <td key={tdkey} />;
																	}

																	let effect: Effect = this.getEffectDescription(
																		agentIndex,
																		modelIndex,
																		v
																	);
																	if (!effect) {
																		effect = {
																			effects: []
																		};
																		this.setAgentEffectProperty(
																			modelIndex,
																			agentIndex,
																			v,
																			effect
																		);
																	}
																	effect.effects = effect.effects || [];

																	let effectDescriptionButton = this.createEffectDescriptionButton(
																		agentIndex,
																		onlyAgents,
																		model,
																		modelIndex,
																		v,
																		effect
																	);
																	return (
																		<td key={tdkey}>{effectDescriptionButton}</td>
																	);
																})
														)
													);
													return (
														<tr
															style={{
																backgroundColor:
																	modelIndex % 2 ? '#33333333' : '#eeeeeeee'
															}}
															key={`key${model}`}
														>
															{result.flatten()}
														</tr>
													);
												})}
											</tbody>
										</table>
									</Box>
									<Box maxheight={500} title={'Dashboard Effect Methods'}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
											</thead>
											<tbody>
												{this.state.dashboards.map(
													(dashboard: string, dashboardIndex: number) => {
														const result = [ <td>{GetNodeTitle(dashboard)}</td> ];

														result.push(
															...this.state.agents.map(
																(agent: string, agentIndex: number) => {
																	const tdkey = `${dashboard} ${dashboardIndex} ${this
																		.state.agents[agent]} ${agentIndex} -effects `;
																	if (
																		!this.hasAgentDashboardAccess(agent, dashboard)
																	) {
																		return <td key={tdkey} />;
																	}

																	let effect: Effect = this.getDashboardEffectDescription(
																		agent,
																		dashboard
																	);
																	if (!effect) {
																		effect = {
																			effects: []
																		};
																		this.setDashboardAgentEffectProperty(
																			dashboard,
																			agent,
																			effect
																		);
																	}
																	effect.effects = effect.effects || [];

																	let effectDescriptionButton = this.createDashboardEffectDescriptionButton(
																		agent,
																		dashboard,
																		effect
																	);
																	return (
																		<td key={tdkey}>{effectDescriptionButton}</td>
																	);
																}
															)
														);
														return (
															<tr
																style={{
																	backgroundColor:
																		dashboardIndex % 2 ? '#33333333' : '#eeeeeeee'
																}}
																key={`key - effect -${dashboard}`}
															>
																{result.flatten()}
															</tr>
														);
													}
												)}
											</tbody>
										</table>
									</Box>
								</TabPane>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'button_routes')}>
									<Box title={'Agent Routing'} maxheight={700}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }} colSpan={5}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
												<tr>
													<th />
													{[]
														.interpolate(
															0,
															this.state.agents.length,
															(agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => (
																	<th onClick={() => {}}>{v}</th>
																))
														)
														.flatten()}
												</tr>
											</thead>
											<tbody>
												{this.state.models.map((model: string, modelIndex: number) => {
													const result = [ <td>{GetNodeTitle(model)}</td> ];

													result.push(
														...[].interpolate(
															0,
															this.state.agents.length,
															(index: number, agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => {
																	const tdkey = `routing- ${model} ${modelIndex} ${this
																		.state.agents[index]} ${agentIndex} ${v}`;
																	if (
																		!this.hasAgentAccess(agentIndex, modelIndex, v)
																	) {
																		return <td key={tdkey} />;
																	}

																	let routing: Routing = {
																		routes: []
																	};
																	if (
																		this.hasFunctionViewTypeValue(
																			agentIndex,
																			modelIndex,
																			v
																		)
																	) {
																		routing =
																			this.getRoutingDescription(
																				agentIndex,
																				modelIndex,
																				v
																			) || routing;
																	}
																	let onComponentMountMethod = this.getMountingDescription(
																		agentIndex,
																		modelIndex,
																		v
																	);
																	let addRoutingDescriptionBtn = this.createRoutingDescriptionButton(
																		agentIndex,
																		onlyAgents,
																		onComponentMountMethod,
																		model,
																		modelIndex,
																		v,
																		routing
																	);
																	let routesDom: any = null;
																	if (routing) {
																		routesDom = routing.routes.map(
																			(route: RouteDescription) => {
																				return (
																					<i
																						title={route.name}
																						className={'fa fa-genderless'}
																						style={{ color: 'orange' }}
																					/>
																				);
																			}
																		);
																	}
																	return (
																		<td key={tdkey}>{addRoutingDescriptionBtn}</td>
																	);
																})
														)
													);
													return (
														<tr
															style={{
																backgroundColor:
																	modelIndex % 2 ? '#33333333' : '#eeeeeeee'
															}}
															key={`key${model}`}
														>
															{result.flatten()}
														</tr>
													);
												})}
											</tbody>
										</table>
									</Box>
									<Box title={'Dashboard Routing'} maxheight={700}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
											</thead>
											<tbody>
												{this.state.dashboards.map(
													(dashboard: string, dashboardIndex: number) => {
														const result = [ <td>{GetNodeTitle(dashboard)}</td> ];

														result.push(
															...this.state.agents.map(
																(agent: string, agentIndex: number) => {
																	const tdkey = `routing- ${dashboard} ${dashboard} ${this
																		.state.agents[agent]} ${agentIndex} s`;
																	if (
																		!this.hasAgentDashboardAccess(agent, dashboard)
																	) {
																		return <td key={tdkey} />;
																	}

																	let routing: Routing = {
																		routes: []
																	};
																	if (this.hasDashboardRouting(agent, dashboard)) {
																		routing =
																			this.getDashboardRoutingDescription(
																				agent,
																				dashboard
																			) || routing;
																	}
																	let onComponentMountMethod = this.getDashboardMountingDescription(
																		agent,
																		dashboard
																	);
																	routing.routes = routing.routes || [];

																	let addRoutingDescriptionBtn = this.createDashboardRoutingDescriptionButton(
																		agent,
																		onComponentMountMethod,
																		dashboard,
																		routing
																	);
																	let routesDom: any = null;
																	if (routing) {
																		routesDom = routing.routes.map(
																			(route: RouteDescription) => {
																				return (
																					<i
																						title={route.name}
																						className={'fa fa-genderless'}
																						style={{ color: 'orange' }}
																					/>
																				);
																			}
																		);
																	}
																	return (
																		<td key={tdkey}>{addRoutingDescriptionBtn}</td>
																	);
																}
															)
														);
														return (
															<tr
																style={{
																	backgroundColor:
																		dashboardIndex % 2 ? '#33333333' : '#eeeeeeee'
																}}
																key={`key${dashboard}`}
															>
																{result.flatten()}
															</tr>
														);
													}
												)}
											</tbody>
										</table>
									</Box>
								</TabPane>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'screen_effects')}>
									<Box title={'Agent Screen Effects'} maxheight={500}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{this.state.agents.map((agent: string) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }} colSpan={5}>
																{GetNodeTitle(agent)}
															</th>
														);
													})}
												</tr>
												<tr>
													<th />
													{this.state.agents
														.map((agent: string) =>
															Object.keys(ViewTypes).map((v) => (
																<th onClick={() => {}}>{v}</th>
															))
														)
														.flatten()}
												</tr>
											</thead>
											<tbody>
												{this.state.models.map((model: string, modelIndex: number) => {
													const result = [ <td>{GetNodeTitle(model)}</td> ];

													result.push(
														...this.state.agents.map((agent: string, agentIndex: number) =>
															Object.keys(ViewTypes).map((v) => {
																const tdkey = `effects screen - ${model} ${model} ${agent} ${agentIndex} ${v}`;
																if (!this.hasAgentAccess(agentIndex, modelIndex, v)) {
																	return <td key={tdkey} />;
																}

																let screenEffectApis: ScreenEffectApi[] = [];

																if (this.hasScreenEffects(agent, model, v)) {
																	screenEffectApis =
																		this.getScreenEffects(agent, model, v) ||
																		screenEffectApis;
																} else {
																	this.setScreenEffects(
																		agent,
																		model,
																		v,
																		screenEffectApis
																	);
																}

																let addRoutingDescriptionBtn = this.createScreenEffectButton(
																	agent,
																	model,
																	v,
																	screenEffectApis
																);
																return <td key={tdkey}>{addRoutingDescriptionBtn}</td>;
															})
														)
													);
													return (
														<tr
															style={{
																backgroundColor:
																	modelIndex % 2 ? '#33333333' : '#eeeeeeee'
															}}
															key={`key${model}`}
														>
															{result.flatten()}
														</tr>
													);
												})}
											</tbody>
										</table>
									</Box>
									<Box title={'Dashboard Screen Effects'} maxheight={500}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th style={{ backgroundColor: '#FEFCAD' }}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
											</thead>
											<tbody>
												{this.state.dashboards.map(
													(dashboard: string, dashboardIndex: number) => {
														const result = [ <td>{GetNodeTitle(dashboard)}</td> ];

														result.push(
															...this.state.agents.map(
																(agent: string, agentIndex: number) => {
																	const tdkey = `screen- defa dashboard- ${dashboard} ${dashboard} ${agent} ${agentIndex} s`;
																	if (
																		!this.hasDashboardScreenEffects(
																			agent,
																			dashboard
																		)
																	) {
																		return <td key={tdkey} />;
																	}

																	let screenEffects: ScreenEffectApi[] = [];
																	if (
																		this.hasDashboardScreenEffects(agent, dashboard)
																	) {
																		screenEffects =
																			this.getDashboardScreenEffects(
																				agent,
																				dashboard
																			) || screenEffects;
																	}

																	let addScreenEffectBtn = this.createDashboardScreenEffectDescriptionButton(
																		agent,
																		dashboard,
																		screenEffects
																	);

																	return <td key={tdkey}>{addScreenEffectBtn}</td>;
																}
															)
														);
														return (
															<tr
																style={{
																	backgroundColor:
																		dashboardIndex % 2 ? '#33333333' : '#eeeeeeee'
																}}
																key={`key${dashboard}`}
															>
																{result.flatten()}
															</tr>
														);
													}
												)}
											</tbody>
										</table>
									</Box>
								</TabPane>
							</TabContent>
						</div>
					</div>
				</section>
			</TopViewer>
		);
	}
	private createScreenEffectButton(agent: string, model: string, v: string, screenEffectApis: ScreenEffectApi[]) {
		return (
			<div className="btn-group">
				<button
					className={screenEffectApis && screenEffectApis.length ? 'btn btn-info' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(AGENT_SCREENEFFECT_CONTEXT_MENU, {
							agent,
							model,
							viewType: v,
							screenEffectApis,
							callback: () => {
								this.setState({
									turn: GUID()
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}
	private createDashboardScreenEffectDescriptionButton(
		agent: string,
		dashboard: string,
		screenEffectApis: ScreenEffectApi[]
	) {
		return (
			<div className="btn-group">
				<button
					className={screenEffectApis && screenEffectApis.length ? 'btn btn-info' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(DASHBOARD_SCREENEFFECT_CONTEXT_MENU, {
							agent,
							dashboard,
							screenEffectApis,
							callback: () => {
								this.setState({
									turn: GUID()
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}
	private createRoutingDescriptionButton(
		agentIndex: number,
		onlyAgents: any[],
		onComponentMountMethod: ViewMounting,
		model: string,
		modelIndex: number,
		v: string,
		routing: Routing
	) {
		routing.routes.forEach((route: RouteDescription) => {
			if (route.viewType && route.model) {
				let targetModelIndex = this.state.models.indexOf(route.model);
				let targetMethodDescription = this.getMethodDescription(agentIndex, targetModelIndex, route.viewType);
				route.targetMethodDescription = targetMethodDescription;
			}
		});
		return (
			<div className="btn-group">
				<button
					className={routing.routes && routing.routes.length ? 'btn btn-info' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(ROUTING_CONTEXT_MENU, {
							agentIndex,
							agent: onlyAgents[agentIndex].id,
							onComponentMountMethod,
							model,
							modelIndex,
							viewType: v,
							routing,
							getMountingDescription: (a: string, m: string, v: string): ViewMounting => {
								let aI = onlyAgents.findIndex((f: Node) => f.id === a);
								let mI = this.state.models.findIndex((f: string) => f === m);
								return this.getMountingDescription(aI, mI, v);
							},
							callback: (value: Routing) => {
								this.setAgentRoutingProperty(modelIndex, agentIndex, v, value);
								this.setState({
									agentRouting: this.state.agentRouting
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}
	private createDashboardRoutingDescriptionButton(
		agent: string,
		onComponentMountMethod: ViewMounting,
		dashboard: string,
		routing: Routing
	) {
		routing.routes.forEach((route: RouteDescription) => {
			if (route.viewType && route.model) {
				// let targetModelIndex = this.state.models.indexOf(route.model);
				// let targetMethodDescription = this.getDashboardMethodDescription(agent, targetModelIndex, route.viewType);
				// route.targetMethodDescription = targetMethodDescription;
			}
		});
		return (
			<div className="btn-group">
				<button
					className={routing.routes && routing.routes.length ? 'btn btn-success' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(DASHBOARD_ROUTING_CONTEXT_MENU, {
							agent,
							onComponentMountMethod,
							dashboard,
							routing,
							getMountingDescription: (a: string, m: string): ViewMounting => {
								return this.getDashboardMountingDescription(a, m);
							},
							callback: (value: Routing) => {
								this.setDashboardAgentRoutingProperty(dashboard, agent, value);
								this.setState({
									dashboardRouting: this.state.dashboardRouting
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}

	private createMountingDescriptionButton(
		agentIndex: number,
		onlyAgents: any[],
		model: string,
		modelIndex: number,
		v: string,
		mounting: ViewMounting
	) {
		let hasMountings = false;
		if (mounting && mounting.mountings) {
			// mounting.mountings.forEach((mounting: MountingDescription) => {
			// 	if (mounting.viewType && mounting.model) {
			// 		// let targetMethodDescription = this.getMethodDescription(agentIndex, modelIndex, mounting.viewType);
			// 		// mounting.methodDescription = targetMethodDescription;
			// 	}
			// });
			hasMountings = !!mounting.mountings.length;
		}
		return (
			<div className="btn-group">
				<button
					className={hasMountings ? 'btn btn-info' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(MOUNTING_CONTEXT_MENU, {
							agentIndex,
							agent: onlyAgents[agentIndex].id,
							model,
							modelIndex,
							outState: this.state,
							viewType: v,
							mounting,
							callback: (value: ViewMounting) => {
								this.setAgentMountingProperty(modelIndex, agentIndex, v, value);
								this.setState({
									agentViewMount: this.state.agentViewMount
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}
	private createDashboardMountingDescriptionButton(agent: string, dashboard: string, mounting: ViewMounting) {
		let hasMountings = false;
		if (mounting && mounting.mountings) {
			hasMountings = !!mounting.mountings.length;
		}
		return (
			<div className="btn-group">
				<button
					className={hasMountings ? 'btn btn-warning' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(DASHBOARD_MOUNTING_CONTEXT_MENU, {
							dashboard,
							outState: this.state,
							mounting,
							agent,
							callback: (value: ViewMounting) => {
								this.setDashboardAgentMountingProperty(dashboard, agent, value);
								this.setState({
									dashboardViewMount: this.state.dashboardViewMount
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}

	private createEffectDescriptionButton(
		agentIndex: number,
		onlyAgents: any[],
		model: string,
		modelIndex: number,
		v: string,
		effect: Effect
	) {
		let hasEffects = false;
		if (effect && effect.effects) {
			hasEffects = !!effect.effects.length;
		}
		return (
			<div className="btn-group">
				<button
					className={hasEffects ? 'btn btn-info' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(EFFECT_CONTEXT_MENU, {
							agentIndex,
							agent: onlyAgents[agentIndex].id,
							model,
							modelIndex,
							viewType: v,
							outState: this.state,
							effect: effect,
							callback: (value: Effect) => {
								this.setAgentEffectProperty(modelIndex, agentIndex, v, value);
								this.setState({
									agentEffect: this.state.agentEffect
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}
	private createDashboardEffectDescriptionButton(agent: string, dashboard: string, effect: Effect) {
		let hasEffects = false;
		if (effect && effect.effects) {
			hasEffects = !!effect.effects.length;
		}
		return (
			<div className="btn-group">
				<button
					className={hasEffects ? 'btn btn-info' : 'btn btn-default'}
					type="button"
					onClick={() => {
						this.props.setVisual(DASHBOARD_EFFECT_CONTEXT_MENU, {
							agent,
							dashboard,
							outState: this.state,
							effect: effect,
							callback: (value: Effect) => {
								this.setDashboardAgentEffectProperty(dashboard, agent, value);
								this.setState({
									dashboardEffect: this.state.dashboardEffect
								});
							}
						});
					}}
				>
					<i className={'fa fa-plus'} />
				</button>
			</div>
		);
	}
	private getFunctionTypeOptions(): any {
		return GetFunctionTypeOptions();
	}

	private hasAgentAccess(agentIndex: number, modelIndex: number, v: string): any {
		return this.state.agentAccess[agentIndex] && this.state.agentAccess[agentIndex][modelIndex]
			? this.state.agentAccess[agentIndex][modelIndex][v]
			: false;
	}
	private hasAgentDashboardAccess(agent: string, dashboard: string): any {
		return this.state.dashboardAccess[agent] && this.state.dashboardAccess[agent][dashboard]
			? this.state.dashboardAccess[agent][dashboard] && this.state.dashboardAccess[agent][dashboard].access
			: false;
	}

	private getMethodDescription(agentIndex: number, modelIndex: number, v: string): MethodDescription {
		return this.state.agentMethod[agentIndex][modelIndex][v];
	}

	private getRoutingDescription(agentIndex: number, modelIndex: number, v: string): Routing {
		return this.state.agentRouting[agentIndex][modelIndex][v];
	}
	private getDashboardRoutingDescription(agent: string, dashboard: string): Routing {
		return this.state.dashboardRouting[agent][dashboard];
	}
	private getMountingDescription(agentIndex: number, modelIndex: number, v: string): ViewMounting {
		return this.state.agentViewMount[agentIndex][modelIndex][v];
	}
	private getDashboardMountingDescription(agent: string, dashboard: string): ViewMounting {
		return this.state.dashboardViewMount[agent][dashboard];
	}
	private getEffectDescription(agentIndex: number, modelIndex: number, v: string): Effect {
		return this.state.agentEffect[agentIndex][modelIndex][v];
	}
	private getDashboardEffectDescription(agent: string, dashboard: string): Effect {
		return this.state.dashboardEffect[agent][dashboard];
	}
	private getKey(a: number, b: number, c: string) {
		return `${a}-${b}-${c}`;
	}
	private hasFunctionViewTypeValue(agentIndex: number, modelIndex: number, v: string) {
		return (
			this.state.agentMethod[agentIndex] &&
			this.state.agentMethod[agentIndex][modelIndex] &&
			this.state.agentMethod[agentIndex][modelIndex][v]
		);
	}
	private hasScreenEffects(agent: string, model: string, v: string) {
		return (
			this.state.agentScreenEffect &&
			this.state.agentScreenEffect[agent] &&
			this.state.agentScreenEffect[agent][model] &&
			this.state.agentScreenEffect[agent][model][v]
		);
	}
	private setScreenEffects(agent: string, model: string, v: string, value: ScreenEffectApi[]) {
		if (!this.state.agentScreenEffect) {
			this.state.agentScreenEffect = {};
		}
		if (this.state.agentScreenEffect && !this.state.agentScreenEffect[agent]) {
			this.state.agentScreenEffect[agent] = {};
		}
		if (
			this.state.agentScreenEffect &&
			this.state.agentScreenEffect[agent] &&
			!this.state.agentScreenEffect[agent][model]
		) {
			this.state.agentScreenEffect[agent][model] = {};
		}
		if (this.state.agentScreenEffect)
			if (this.state.agentScreenEffect[agent] && this.state.agentScreenEffect[agent][model]) {
				this.state.agentScreenEffect[agent][model][v] = value;
				this.setState({ agentScreenEffect: this.state.agentScreenEffect });
			}
	}
	private getScreenEffects(agent: string, model: string, v: string): ScreenEffectApi[] {
		this.state.agentScreenEffect[agent][model][v] = this.state.agentScreenEffect[agent][model][v] || [];
		return this.state.agentScreenEffect[agent][model][v];
	}
	private hasDashboardRouting(agent: string, dashboard: string) {
		return (
			this.state.dashboardRouting &&
			this.state.dashboardRouting[agent] &&
			this.state.dashboardRouting[agent][dashboard]
		);
	}
	private hasDashboardScreenEffects(agent: string, dashboard: string) {
		return (
			this.state.dashboardScreenEffect &&
			this.state.dashboardScreenEffect[agent] &&
			this.state.dashboardScreenEffect[agent][dashboard]
		);
	}
	private getDashboardScreenEffects(agent: string, dashboard: string): ScreenEffectApi[] {
		this.state.dashboardScreenEffect[agent][dashboard] = this.state.dashboardScreenEffect[agent][dashboard] || [];
		return this.state.dashboardScreenEffect[agent][dashboard];
	}
	private hasFunctionKeyValue(agentIndex: number, modelIndex: number, v: string, functionKey: string) {
		return (
			this.state.agentMethod[agentIndex] &&
			this.state.agentMethod[agentIndex][modelIndex] &&
			this.state.agentMethod[agentIndex][modelIndex][v] &&
			this.state.agentMethod[agentIndex][modelIndex][v].properties &&
			this.state.agentMethod[agentIndex][modelIndex][v].properties[functionKey]
		);
	}
}

export default UIConnect(AgentAccessView);
function loadAgentAccess(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	return onlyAgents.map((agent) => {
		const agentAccessDescription = accessDescriptions.filter((v) =>
			existsLinkBetween(graph, {
				source: agent.id,
				target: v.id,
				type: LinkType.AgentAccess
			})
		);
		return GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.Model
			},
			graph
		).map((model) => {
			const accessDescription = agentAccessDescription.find((v) => isAccessNode(agent, model, v));
			if (accessDescription) {
				const link = findLink(graph, {
					source: agent.id,
					target: accessDescription.id
				});
				return {
					[ViewTypes.GetAll]: GetLinkProperty(link, ViewTypes.GetAll) || false,
					[ViewTypes.Get]: GetLinkProperty(link, ViewTypes.Get) || false,
					[ViewTypes.Create]: GetLinkProperty(link, ViewTypes.Create) || false,
					[ViewTypes.Update]: GetLinkProperty(link, ViewTypes.Update) || false,
					[ViewTypes.Delete]: GetLinkProperty(link, ViewTypes.Delete) || false
				};
			}

			return {
				[ViewTypes.GetAll]: false,
				[ViewTypes.Get]: false,
				[ViewTypes.Create]: false,
				[ViewTypes.Update]: false,
				[ViewTypes.Delete]: false
			};
		});
	});
}
function loadAgentDashboardAccess(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	return loadDashboard<DashboardAccessProps>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.DashboardAccessProps
	);
}
function loadAgentDashbaordViewMount(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	let res: DashboardViewMount = loadDashboard<DashboardViewMount>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.DashboardViewMountProps
	);
	if (res && res.mount && res.mount.mountings) {
		res.mount.mountings.forEach((mount: MountingDescription) => {
			mount.screenEffect = mount.screenEffect || [];
		});
	}
	return res;
}
function loadAgentDashboardRouting(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	let result = loadDashboard<DashboardRouting>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.DashboardRoutingProps
	);
	let agents = GetAgentsOnly();
	let defaultAgent = agents.find((v) => GetNodeProp(v, NodeProperties.DefaultAgent));

	NodesByType(null, NodeTypes.NavigationScreen)
		.filter((node: Node) => GetNodeProp(node, NodeProperties.IsDashboard))
		.forEach((navigationScreen: Node) => {
			let dashboard = navigationScreen.id;
			let screenAgent = GetNodeProp(navigationScreen, NodeProperties.Agent);
			if (!screenAgent && defaultAgent) {
				screenAgent = defaultAgent.id;
			} else if (!screenAgent && agents.length) {
				screenAgent = agents[0].id;
			}
			let navigationLinks: GraphLink[] = getNodeLinks(graph, navigationScreen.id, SOURCE).filter(
				(x: GraphLink) => GetLinkProperty(x, LinkPropertyKeys.TYPE) === LinkType.NavigationScreen
			);
			if (screenAgent) {
				let routing: Routing = result[screenAgent][dashboard];
				if (routing && routing.routes) {
					routing.routes = routing.routes.filter((v: RouteDescription) => {
						return !(v.linkId && getLink(graph, { id: v.linkId }));
					});

					navigationLinks
						.filter((x: GraphLink) => {
							return !routing.routes.find((v) => v.linkId === x.id);
						})
						.forEach((navLink) => {
							let isDashboard = GetNodeProp(navLink.target, NodeProperties.IsDashboard);
							routing.routes.push({
								agent: !isDashboard ? GetNodeProp(navLink.target, NodeProperties.Agent) : '',
								id: GUID(),
								model: !isDashboard ? GetNodeProp(navLink.target, NodeProperties.Model) : '',
								name: `${GetNodeTitle(navLink.source)} to ${GetNodeTitle(navLink.target)}`,
								viewType: !isDashboard ? GetNodeProp(navLink.target, NodeProperties.ViewType) : '',
								isDashboard,
								dashboard: isDashboard ? navLink.target : '',
								linkId: navLink.id
							});
						});
				}
			}
		});
	return result;
}

function GetAgentsOnly() {
	return GetNodesByProperties(
		{
			[NodeProperties.NODEType]: NodeTypes.Model,
			[NodeProperties.IsAgent]: true
		},
		GetCurrentGraph()
	).filter((x: Node) => !GetNodeProp(x, NodeProperties.IsUser));
}

function loadAgentDashboardEffect(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	return loadDashboard<DashboardEffect>(onlyAgents, accessDescriptions, graph, LinkPropertyKeys.DashboardEffectProps);
}
function loadAgentMethods(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	return onlyAgents.map((agent) => {
		const agentAccessDescription = accessDescriptions.filter((v) =>
			existsLinkBetween(graph, {
				source: agent.id,
				target: v.id,
				type: LinkType.AgentAccess
			})
		);
		return GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.Model
			},
			graph
		).map((model) => {
			const accessDescription = agentAccessDescription.find((v) => isAccessNode(agent, model, v));
			if (accessDescription) {
				const link = findLink(graph, {
					source: agent.id,
					target: accessDescription.id
				});
				let methodProps: MethodProps = GetLinkProperty(link, LinkPropertyKeys.MethodProps);
				if (methodProps) {
					return {
						...methodProps
					};
				}
			}

			return {
				[ViewTypes.GetAll]: false,
				[ViewTypes.Get]: false,
				[ViewTypes.Create]: false,
				[ViewTypes.Update]: false,
				[ViewTypes.Delete]: false
			};
		});
	});
}
function loadAgentViewMount(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	let res: ViewMoutingProps | any = loadAgent<ViewMoutingProps>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.MountingProps
	);

	applyDefaultPropsToViewMount(res);
	return res;
}

function loadAgentScreenEffect(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	let res: any = loadAgentObj<ScreenEffectApiProps>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.ScreenEffectApiProps
	);

	return res;
}
function loadDashboardScreenEffect(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	let res: any = loadDashboard<ScreenEffectApi[]>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.DashboardScreenEffectApiProps,
		true
	);

	return res;
}
function applyDefaultPropsToViewMount(res: any) {
	if (res && res.Create && res.Create.mountings) {
		res.Create.mountings.forEach((mount: MountingDescription) => {
			mount.screenEffect = mount.screenEffect || [];
		});
	}
	if (res && res.Delete && res.Delete.mountings) {
		res.Delete.mountings.forEach((mount: MountingDescription) => {
			mount.screenEffect = mount.screenEffect || [];
		});
	}
	if (res && res.Get && res.Get.mountings) {
		res.Get.mountings.forEach((mount: MountingDescription) => {
			mount.screenEffect = mount.screenEffect || [];
		});
	}

	if (res && res.GetAll && res.GetAll.mountings) {
		res.GetAll.mountings.forEach((mount: MountingDescription) => {
			mount.screenEffect = mount.screenEffect || [];
		});
	}

	if (res && res.Update && res.Update.mountings) {
		res.Update.mountings.forEach((mount: MountingDescription) => {
			mount.screenEffect = mount.screenEffect || [];
		});
	}
}

function loadAgentRouting(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	let result: RoutingProps[][] = loadAgent<RoutingProps>(
		onlyAgents,
		accessDescriptions,
		graph,
		LinkPropertyKeys.RoutingProps
	);
	if (result) {
		let agents = GetAgentsOnly();
		let defaultAgent = agents.find((v) => GetNodeProp(v, NodeProperties.DefaultAgent));
		let models = GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.Model
			},
			graph
		).map((v: Node) => v.id);
		NodesByType(null, NodeTypes.NavigationScreen)
			.filter((node: Node) => !GetNodeProp(node, NodeProperties.IsDashboard))
			.forEach((navigationScreen: Node) => {
				let model = GetNodeProp(navigationScreen, NodeProperties.Model);
				let screenAgent = GetNodeProp(navigationScreen, NodeProperties.Agent);
				let viewType = GetNodeProp(navigationScreen, NodeProperties.ViewType);
				if (!screenAgent && defaultAgent) {
					screenAgent = defaultAgent.id;
				} else if (!screenAgent && agents.length) {
					screenAgent = agents[0].id;
				}
				let navigationLinks: GraphLink[] = getNodeLinks(graph, navigationScreen.id, SOURCE).filter(
					(x: GraphLink) => GetLinkProperty(x, LinkPropertyKeys.TYPE) === LinkType.NavigationScreen
				);
				if (screenAgent) {
					let screenAgentIndex = onlyAgents.map((v: Node) => v.id).indexOf(screenAgent);
					let modelIndex = models.indexOf(model);
					if (result[screenAgentIndex] && result[screenAgentIndex][modelIndex]) {
						let routingProps: RoutingProps = result[screenAgentIndex][modelIndex];
						Object.keys(routingProps)
							.filter((v: string) => viewType === v && routingProps[v])
							.forEach((v) => {
								let routing: Routing = routingProps[v];
								if (routing && routing.routes) {
									routing.routes = routing.routes.filter((v: RouteDescription) => {
										return !(v.linkId && !getLink(graph, { id: v.linkId }));
									});

									navigationLinks
										.filter((x: GraphLink) => {
											return !routing.routes.find((v) => v.linkId === x.id);
										})
										.forEach((navLink) => {
											let isDashboard = GetNodeProp(navLink.target, NodeProperties.IsDashboard);
											routing.routes.push({
												agent: !isDashboard
													? GetNodeProp(navLink.target, NodeProperties.Agent)
													: '',
												id: GUID(),
												model: !isDashboard
													? GetNodeProp(navLink.target, NodeProperties.Model)
													: '',
												name: `${GetNodeTitle(navLink.source)} to ${GetNodeTitle(
													navLink.target
												)}`,
												viewType: !isDashboard
													? GetNodeProp(navLink.target, NodeProperties.ViewType)
													: '',
												isDashboard,
												dashboard: isDashboard ? navLink.target : '',
												linkId: navLink.id
											});
										});
								}
							});
					}
				}
			});
	}
	return result;
}
function loadAgentEffect(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	return loadAgent<EffectProps>(onlyAgents, accessDescriptions, graph, LinkPropertyKeys.EffectProps);
}

function loadAgent<T>(onlyAgents: any[], accessDescriptions: any[], graph: any, propKey: string) {
	return onlyAgents.map((agent) => {
		const agentAccessDescription = accessDescriptions.filter((v) =>
			existsLinkBetween(graph, {
				source: agent.id,
				target: v.id,
				type: LinkType.AgentAccess
			})
		);
		return GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.Model
			},
			graph
		).map((model) => {
			const accessDescription = agentAccessDescription.find((v) => isAccessNode(agent, model, v));
			if (accessDescription) {
				const link = findLink(graph, {
					source: agent.id,
					target: accessDescription.id
				});
				let routingProps: T = GetLinkProperty(link, propKey);
				if (routingProps) {
					return {
						...routingProps
					};
				}
			}

			return {
				[ViewTypes.GetAll]: false,
				[ViewTypes.Get]: false,
				[ViewTypes.Create]: false,
				[ViewTypes.Update]: false,
				[ViewTypes.Delete]: false
			};
		});
	});
}

function loadAgentObj<T>(onlyAgents: any[], accessDescriptions: any[], graph: any, propKey: string) {
	let result: any = {};
	onlyAgents.map((agent) => {
		const agentAccessDescription = accessDescriptions.filter((v) =>
			existsLinkBetween(graph, {
				source: agent.id,
				target: v.id,
				type: LinkType.AgentAccess
			})
		);
		result[agent.id] = {};
		return GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.Model
			},
			graph
		).map((model) => {
			const accessDescription = agentAccessDescription.find((v) => isAccessNode(agent, model, v));
			result[agent.id][model.id] = {};
			if (accessDescription) {
				const link = findLink(graph, {
					source: agent.id,
					target: accessDescription.id
				});
				let routingProps: T = GetLinkProperty(link, propKey);
				if (routingProps) {
					result[agent.id][model.id] = {
						...routingProps
					};
					return;
				}
			}

			result[agent.id][model.id] = {
				[ViewTypes.GetAll]: false,
				[ViewTypes.Get]: false,
				[ViewTypes.Create]: false,
				[ViewTypes.Update]: false,
				[ViewTypes.Delete]: false
			};
		});
	});
	return result;
}

function loadDashboard<T>(
	onlyAgents: any[],
	accessDescriptions: any[],
	graph: any,
	propKey: string,
	asArray?: boolean
) {
	let result: any = {};
	onlyAgents.map((agent) => {
		const agentAccessDescription = accessDescriptions.filter((agentAccessDescription) =>
			existsLinkBetween(graph, {
				source: agent.id,
				target: agentAccessDescription.id,
				type: LinkType.AgentAccess
			})
		);
		result[agent.id] = result[agent.id] || {};
		return GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.NavigationScreen,
				[NodeProperties.IsDashboard]: true
			},
			graph
		).map((dashboard) => {
			const accessDescription = agentAccessDescription.find((agentAccessDescription) =>
				isAccessNodeForDashboard(agent, dashboard, agentAccessDescription)
			);
			if (accessDescription) {
				const link = findLink(graph, {
					source: agent.id,
					target: accessDescription.id
				});
				let routingProps: T = GetLinkProperty(link, propKey);
				if (routingProps) {
					if (asArray) {
						result[agent.id][dashboard.id] = routingProps;
					} else {
						result[agent.id][dashboard.id] = {
							...routingProps
						};
					}
					return;
				} else {
				}
			}
			result[agent.id][dashboard.id] = result[agent.id][dashboard.id] || (asArray ? [] : {});
		});
	});

	return result;
}
