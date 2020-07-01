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
	EFFECT_CONTEXT_MENU
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
import { GetNodesByProperties, existsLinkBetween, findLink, existsLinksBetween } from '../methods/graph_methods';
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
	Effect
} from '../interface/methodprops';
import { Node } from '../methods/graph_types';

const AGENT_ACCESS_VIEW_TAB = 'agent -access-view-tab';

class AgentAccessView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			agents: [],
			models: [],
			agentAccess: [],
			agentMethod: [],
			agentEffect: []
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
		const onlyAgents = GetNodesByProperties(
			{
				[NodeProperties.NODEType]: NodeTypes.Model,
				[NodeProperties.IsAgent]: true
			},
			graph
		).filter((x) => !GetNodeProp(x, NodeProperties.IsUser));
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
												agentMethod: loadAgentMethods(onlyAgents, accessDescriptions, graph),
												agentRouting: loadAgentRouting(onlyAgents, accessDescriptions, graph),
												agentViewMount: loadAgentViewMount(
													onlyAgents,
													accessDescriptions,
													graph
												),
												agentEffect: loadAgentEffect(onlyAgents, accessDescriptions, graph),
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
								</Tabs>
							</TabContainer>
							<TabContent>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentaccessview')}>
									<Box title={'Agent Access'} maxheight={700}>
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
																				(model, modelIndex: number) => {
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
																				(model, modelIndex: number) => {
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
												{this.state.models.map((model, modelIndex: number) => {
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
																this.state.agents.forEach((_, agentIndex: number) => {
																	return Object.values(ViewTypes).some((v) => {
																		this.setAgentAccess(
																			modelIndex,
																			agentIndex,
																			v,
																			!istrue
																		);
																	});
																});
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
															(index, agentIndex: number) =>
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
								</TabPane>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentmethoduse')}>
									<Box maxheight={700} title={'Agent Mounting Methods'}>
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
								</TabPane>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agenteffects')}>
									<Box maxheight={700} title={'Agent Effect Methods'}>
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
								</TabPane>
							</TabContent>
						</div>
					</div>
				</section>
			</TopViewer>
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

	private getFunctionTypeOptions(): any {
		return GetFunctionTypeOptions();
	}

	private hasAgentAccess(agentIndex: number, modelIndex: number, v: string): any {
		return this.state.agentAccess[agentIndex] && this.state.agentAccess[agentIndex][modelIndex]
			? this.state.agentAccess[agentIndex][modelIndex][v]
			: false;
	}

	private getMethodDescription(agentIndex: number, modelIndex: number, v: string): MethodDescription {
		return this.state.agentMethod[agentIndex][modelIndex][v];
	}

	private getRoutingDescription(agentIndex: number, modelIndex: number, v: string): Routing {
		return this.state.agentRouting[agentIndex][modelIndex][v];
	}
	private getMountingDescription(agentIndex: number, modelIndex: number, v: string): ViewMounting {
		return this.state.agentViewMount[agentIndex][modelIndex][v];
	}
	private getEffectDescription(agentIndex: number, modelIndex: number, v: string): Effect {
		return this.state.agentViewMount[agentIndex][modelIndex][v];
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
	return loadAgent<ViewMoutingProps>(onlyAgents, accessDescriptions, graph, LinkPropertyKeys.MountingProps);
}
function loadAgentRouting(onlyAgents: any[], accessDescriptions: any[], graph: any) {
	return loadAgent<RoutingProps>(onlyAgents, accessDescriptions, graph, LinkPropertyKeys.RoutingProps);
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
