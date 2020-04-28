/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/button-has-type */
/* eslint-disable react/sort-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TopViewer from './topviewer';
import { StyleLib } from '../constants/styles';

import {
	ThemeColors,
	FormThemePropertyKeys,
	HTMLElementGroups,
	ColorUses,
	OtherUses,
	CssPseudoSelectors
} from '../constants/themes';
import {
	GetCurrentGraph,
	GUID,
	GetNodes,
	GetNodeTitle,
	NodesByType,
	NodeProperties,
	GetNodeProp,
	BuildAllProgress,
	Visual,
	VisualEq,
	JOBS,
	JobProgressId,
	AssignmentId
} from '../actions/uiactions';
import TextInput from './textinput';
import ColorInput from './colorinput';
import Box from './box';
import FormControl from './formcontrol';
import * as Titles from './titles';
import SelectInput from './selectinput';
import { ComponentTags } from '../constants/componenttypes';
import CheckBox from './checkbox';
import ButtonList from './buttonlist';
import Typeahead from './typeahead';
import { MediaQueries, Languages, NodeTypes, PROGRESS_VIEW } from '../constants/nodetypes';
import translationservice from '../service/translationservice';
import GridPlacementField from './gridplacementfield';
import ProgressBar from './progressbar';
import TabContainer from './tabcontainer';
import Tabs from './tabs';
import Tab from './tab';
import TabPane from './tabpane';
import TabContent from './tabcontent';
import { Job, JobAssignment, JobItem } from '../jobs/jobservice';

const PROGRESS_VIEW_TAB = 'PROGRESS_VIEW_TAB';

class ProgressView extends Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {};
	}

	active() {
		return !!this.props.active;
	}

	getTranslation(item, language) {
		if (item && item.properties && item.properties.languages) {
			return `${language}: ${item.properties.languages[language]}`;
		}
		return `${language}: ${Titles.Unknown}`;
	}

	render() {
		const active = this.active();
		const graph = GetCurrentGraph();
		if (!graph) {
			return <div />;
		}
		let { state } = this.props;
		let jobs = Visual(state, JOBS) || [];
		return (
			<TopViewer active={active}>
				<section className="content">
					<div className="row">
						<div className="col-md-12">
							<TabContainer>
								<Tabs>
									<Tab
										active={VisualEq(state, PROGRESS_VIEW_TAB, 'Variables')}
										title={'Local'}
										onClick={() => {
											this.props.setVisual(PROGRESS_VIEW_TAB, 'Variables');
										}}
									/>
									<Tab
										active={VisualEq(state, PROGRESS_VIEW_TAB, 'Git Run')}
										title={'Git Run'}
										onClick={() => {
											this.props.setVisual(PROGRESS_VIEW_TAB, 'Git Run');
											this.props.loadGitRuns();
										}}
									/>
									<Tab
										active={VisualEq(state, PROGRESS_VIEW_TAB, 'Others')}
										title={'Others'}
										onClick={() => {
											this.props.setVisual(PROGRESS_VIEW_TAB, 'Others');
										}}
									/>
								</Tabs>
							</TabContainer>
							<TabContent>
								<TabPane active={VisualEq(state, PROGRESS_VIEW_TAB, 'Variables')}>
									<h1>Build All Progress</h1>
									<Box
										maxheight={600}
										title={Titles.Input}
										onSearch={(search) => {
											this.setState({
												titleSearch: search
											});
										}}
									>
										<ProgressBar steps={Visual(this.props.state, BuildAllProgress)} />
									</Box>
								</TabPane>
								<TabPane active={VisualEq(state, PROGRESS_VIEW_TAB, 'Git Run')}>
									<h1>Git Runs</h1>
									<Box maxheight={600} title={Titles.Input}>
										<table className="table table-bordered">
											<tbody>
												<tr>
													<th />
													<th>Nickname</th>
													<th>Name</th>
													<th>Parts #</th>
													<th>Last Updated</th>
													<th>Complete/Total</th>
													<th>Progress</th>
												</tr>
												{jobs.map((job: Job, jobIndex: number) => {
													let jobProgress = Visual(state, JobProgressId(job));
													let { assignments } = job;

													let assignmentRows: any[] = [];
													if (assignments && this.state[job.nickName]) {
														assignmentRows = Object.keys(
															assignments
														).map((assignmentId) => {
															if (assignments) {
																let jobItems: JobItem[] = assignments[assignmentId];
																let assignemtProgress = Visual(
																	state,
																	AssignmentId(assignments, assignmentId)
																);
																return [
																	<tr>
																		<td
																			style={{
																				overflow: 'hidden',
																				maxWidth: 200,
																				whiteSpace: 'nowrap',
																				textOverflow: 'ellipsis'
																			}}
																		>
																			{' '}
																			{assignmentId}
																		</td>
																		<td>{jobItems ? jobItems.length : 0}</td>
																		<td>
																			<table className="table table-bordered">
																				<tbody>
																					<tr>
																						<th>Job</th>
																						<th>File</th>
																						<th>Distributed</th>
																						<th>Progress</th>
																					</tr>
																					{jobItems ? (
																						jobItems.map((jobItem) => {
																							return (
																								<tr>
																									<td>
																										{jobItem.job}
																									</td>
																									<td>
																										{jobItem.file}
																									</td>
																									<td>
																										{jobItem.distributed ? (
																											<i className="fa fa-heart" />
																										) : null}
																									</td>
																									<td>
																										{assignemtProgress ? (
																											<progress
																												title={
																													job.complete ? (
																														100
																													) : (
																														100 *
																														assignemtProgress.complete /
																														assignemtProgress.total
																													)
																												}
																												value={
																													job.complete ? (
																														100
																													) : (
																														100 *
																														assignemtProgress.complete /
																														assignemtProgress.total
																													)
																												}
																												min={0}
																												max={
																													100
																												}
																											/>
																										) : (
																											''
																										)}
																									</td>
																								</tr>
																							);
																						})
																					) : null}
																				</tbody>
																			</table>
																		</td>
																	</tr>
																];
															}
															return [];
														});
													}
													return [
														<tr key={`job-${jobIndex}`}>
															<td>
																<i
																	onClick={() => {
																		this.setState({
																			[job.nickName]: !!!this.state[job.nickName]
																		});
																	}}
																	className={`fa ${this.state[job.nickName]
																		? 'fa-chevron-down'
																		: 'fa-chevron-right'}`}
																/>
															</td>
															<td>{job.nickName}</td>
															<td>{job.name}</td>
															<td>{job.parts.length}</td>
															<td>{new Date(job.updated).toLocaleDateString()}</td>
															<td>
																{jobProgress ? jobProgress.complete : ''}/{jobProgress ? jobProgress.total : ''}
															</td>
															<td>
																{jobProgress && jobProgress.total ? (
																	<progress
																		title={
																			job.complete ? (
																				100
																			) : (
																				100 *
																				jobProgress.complete /
																				jobProgress.total
																			)
																		}
																		value={
																			job.complete ? (
																				100
																			) : (
																				100 *
																				jobProgress.complete /
																				jobProgress.total
																			)
																		}
																		min={0}
																		max={100}
																	/>
																) : null}
															</td>
														</tr>,
														<tr>
															<td colSpan="8">
																<table className="table table-bordered">
																	{assignmentRows}
																</table>
															</td>
														</tr>
													];
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

export default UIConnect(ProgressView);
