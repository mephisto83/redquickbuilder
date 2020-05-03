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

import {
	GetCurrentGraph,
	BuildAllProgress,
	Visual,
	VisualEq,
	JOBS,
	JobProgressId,
	JobItemId
} from '../actions/uiactions';
import Box from './box';
import * as Titles from './titles';
import ProgressBar from './progressbar';
import TabContainer from './tabcontainer';
import Tabs from './tabs';
import Tab from './tab';
import TabPane from './tabpane';
import TabContent from './tabcontent';
import { Job, JobItem } from '../jobs/jobservice';
import JobFilesPane from './jobfilespane';

const PROGRESS_VIEW_TAB = 'PROGRESS_VIEW_TAB';

class ProgressView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	active() {
		return !!this.props.active;
	}

	getTranslation(item: any, language: any) {
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
			<TopViewer active={!!active}>
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
										title={'Render Run'}
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
										onSearch={(search: any) => {
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
													let { parts } = job;

													let jobItemRows: any[] = [];
													if (parts && this.state[job.nickName]) {
														jobItemRows = parts.map((assignmentId) => {
															if (parts) {
																let jobItem: JobItem = Visual(
																	state,
																	JobItemId(assignmentId)
																);
																let assignemtProgress = Visual(
																	state,
																	JobItemId(assignmentId)
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
																		<td>{jobItem ? jobItem.complete : 0}</td>
																		<td>
																			<table className="table table-bordered">
																				<tbody>
																					<tr>
																						<th>Job</th>
																						<th>File</th>
																						<th>Distributed</th>
																						<th>Progress</th>
																					</tr>
																					{jobItem ? (
																						<tr>
																							<td>{jobItem.job}</td>
																							<td>{jobItem.file}</td>
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
																												`100`
																											) : (
																												`${100 *
																													assignemtProgress.complete /
																													assignemtProgress.total}`
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
																										max={100}
																									/>
																								) : (
																									''
																								)}
																							</td>
																						</tr>
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
																	{jobItemRows}
																</table>
															</td>
														</tr>
													];
												})}
											</tbody>
										</table>
									</Box>
								</TabPane>
                <JobFilesPane />
							</TabContent>
						</div>
					</div>
				</section>
			</TopViewer>
		);
	}
}

export default UIConnect(ProgressView);
