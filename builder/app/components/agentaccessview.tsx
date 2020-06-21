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
	NodesByType
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
import { FunctionTypes, MethodFunctions } from '../constants/functiontypes';

const AGENT_ACCESS_VIEW_TAB = 'agent -access-view-tab';

class AgentAccessView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			agents: [],
			models: [],
			agentAccess: [],
			agentMethod: []
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
												agentmethod: onlyAgents.map((agent) => {
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
														const accessDescription = agentAccessDescription.find((v) =>
															isAccessNode(agent, model, v)
														);
														if (accessDescription) {
															const link = findLink(graph, {
																source: agent.id,
																target: accessDescription.id
															});
															let methodProps = GetLinkProperty(
																link,
																LinkPropertyKeys.MethodProps
															);
															return {
																...methodProps
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
												}),
												agentAccess: onlyAgents.map((agent) => {
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
														const accessDescription = agentAccessDescription.find((v) =>
															isAccessNode(agent, model, v)
														);
														if (accessDescription) {
															const link = findLink(graph, {
																source: agent.id,
																target: accessDescription.id
															});
															return {
																[ViewTypes.GetAll]:
																	GetLinkProperty(link, ViewTypes.GetAll) || false,
																[ViewTypes.Get]:
																	GetLinkProperty(link, ViewTypes.Get) || false,
																[ViewTypes.Create]:
																	GetLinkProperty(link, ViewTypes.Create) || false,
																[ViewTypes.Update]:
																	GetLinkProperty(link, ViewTypes.Update) || false,
																[ViewTypes.Delete]:
																	GetLinkProperty(link, ViewTypes.Delete) || false
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
												})
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
										title="Method"
										onClick={() => {
											this.props.setVisual(AGENT_ACCESS_VIEW_TAB, 'agentmethoduse');
										}}
									/>
								</Tabs>
							</TabContainer>
							<TabContent>
								<TabPane active={VisualEq(state, AGENT_ACCESS_VIEW_TAB, 'agentaccessview')}>
									<Box maxheight={700}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th
														colSpan={
															this.state.agents.length * Object.keys(ViewTypes).length + 1
														}
														style={{
															cursor: 'pointer',
															display: 'table-caption',
															textAlign: 'center',
															fontSize: '20px',
															fontWeight: 'bold'
														}}
													>
														Agent Access
													</th>
												</tr>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index) => {
														return (
															<th colSpan={5}>
																{GetNodeTitle(this.state.agents[index])}
															</th>
														);
													})}
												</tr>
												<tr>
													<th />
													{[]
														.interpolate(0, this.state.agents.length, (agentIndex) =>
															Object.keys(ViewTypes).map((v) => (
																<th
																	onClick={() => {
																		const istrue = this.state.models.some(
																			(model, modelIndex) => {
																				if (
																					this.state.agentAccess[
																						agentIndex
																					] &&
																					this.state.agentAccess[agentIndex][
																						modelIndex
																					]
																				) {
																					return this.state.agentAccess[
																						agentIndex
																					][modelIndex][v];
																				}
																				return false;
																			}
																		);
																		this.state.models.forEach(
																			(model, modelIndex) => {
																				this.setAgentAccess(
																					modelIndex,
																					agentIndex,
																					v,
																					!istrue
																				);
																			}
																		);
																		this.setState({
																			agentAccess: [ ...this.state.agentAccess ]
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
												{this.state.models.map((model, modelIndex) => {
													const result = [
														<th
															style={{ cursor: 'pointer' }}
															key={`${model}`}
															onClick={() => {
																const istrue = this.state.agents.some(
																	(agent, agentIndex) => {
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
																this.state.agents.forEach((_, agentIndex) => {
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
															(index, agentIndex) =>
																Object.keys(ViewTypes).map((v) => {
																	const accessIndex =
																		modelIndex * this.state.agents.length +
																		agentIndex;
																	const agent = this.state.agents[index];
																	return (
																		<td
																			key={`${model} ${modelIndex} ${this.state
																				.agents[
																				index
																			]} ${agentIndex} ${ViewTypes[v]}`}
																		>
																			<CheckBox
																				label={' '}
																				title={`${GetNodeTitle(
																					agent
																				)} ${GetNodeTitle(model)}`}
																				style={{ height: 40, width: 40 }}
																				onChange={(value) => {
																					this.setAgentAccess(
																						modelIndex,
																						agentIndex,
																						v,
																						value
																					);
																					this.setState({
																						agentAccess: [
																							...this.state.agentAccess
																						]
																					});
																				}}
																				value={
																					this.state.agentAccess[
																						agentIndex
																					] &&
																					this.state.agentAccess[agentIndex][
																						modelIndex
																					] ? (
																						this.state.agentAccess[
																							agentIndex
																						][modelIndex][v]
																					) : (
																						false
																					)
																				}
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
									<Box maxheight={700}>
										<table style={{ width: '100%', display: 'table' }}>
											<thead>
												<tr>
													<th
														colSpan={
															this.state.agents.length * Object.keys(ViewTypes).length + 1
														}
														style={{
															cursor: 'pointer',
															display: 'table-caption',
															textAlign: 'center',
															fontSize: '20px',
															fontWeight: 'bold'
														}}
													>
														Agent Methods
													</th>
												</tr>
												<tr>
													<th />
													{[].interpolate(0, this.state.agents.length, (index: number) => {
														return (
															<th colSpan={5}>
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
													const result = [
														<td
															style={{ cursor: 'pointer' }}
															key={`${model}`}
															onClick={() => {}}
														>
															{GetNodeTitle(model)}
														</td>
													];

													result.push(
														...[].interpolate(
															0,
															this.state.agents.length,
															(index: number, agentIndex: number) =>
																Object.keys(ViewTypes).map((v) => {
																	const accessIndex =
																		modelIndex * this.state.agents.length +
																		agentIndex;
																	const agent = this.state.agents[index];
																	const functionType =
																		this.state.agentMethod[agentIndex] &&
																		this.state.agentMethod[agentIndex][
																			modelIndex
																		] &&
																		this.state.agentMethod[agentIndex][modelIndex][
																			v
																		]
																			? this.state.agentMethod[agentIndex][
																					modelIndex
																				][v].functionType
																			: '';
																	let functionOptions: any = null;
																	if (
																		functionType &&
																		MethodFunctions[FunctionTypes[functionType]]
																	) {
																		let { constraints } = MethodFunctions[
																			FunctionTypes[functionType]
																		];
																		if (constraints) {
																			functionOptions = Object.keys(
																				constraints
																			).map((functionKey: string) => {
																				const value =
																					this.state.agentMethod[
																						agentIndex
																					] &&
																					this.state.agentMethod[agentIndex][
																						modelIndex
																					] &&
																					this.state.agentMethod[agentIndex][
																						modelIndex
																					][v]
																						? this.state.agentMethod[
																								agentIndex
																							][modelIndex][v][functionKey]
																						: '';
																				return (
																					<SelectInput
																						label={functionKey}
																						values={value}
																						onChange={(value: string) => {
																							this.setAgentMethodProperty(
																								modelIndex,
																								agentIndex,
																								v,
																								functionKey,
																								value
																							);
																						}}
																						options={NodesByType(
																							null,
																							constraints[functionKey]
																								.nodeTypes
																						).toNodeSelect()}
																					/>
																				);
																			});
																		}
																	}
																	return (
																		<td
																			key={`${model} ${modelIndex} ${this.state
																				.agents[
																				index
																			]} ${agentIndex} ${ViewTypes[v]}`}
																		>
																			{!this.state.agentAccess[agentIndex][
																				modelIndex
																			][ViewTypes[v]] ? null : (
																				<SelectInput
																					label={' '}
																					options={Object.keys(
																						FunctionTypes
																					).map((d) => {
																						if (
																							MethodFunctions[
																								FunctionTypes[d]
																							] &&
																							MethodFunctions[
																								FunctionTypes[d]
																							].title
																						) {
																							return {
																								title:
																									MethodFunctions[
																										FunctionTypes[d]
																									].title,
																								value: d
																							};
																						}
																						return {
																							title: d,
																							value: d
																						};
																					})}
																					onChange={(value: string) => {
																						this.setAgentMethod(
																							modelIndex,
																							agentIndex,
																							v,
																							value
																						);
																						this.setState({
																							agentMethod: [
																								...this.state
																									.agentMethod
																							]
																						});
																					}}
																					value={functionType}
																				/>
																			)}
																			{functionOptions}
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
							</TabContent>
						</div>
					</div>
				</section>
			</TopViewer>
		);
	}
}

export default UIConnect(AgentAccessView);
