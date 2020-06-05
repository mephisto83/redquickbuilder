import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TopViewer from './topviewer';

import TabPane from './tabpane';
import Box from './box';
import { VisualEq, Visual, JobProgressId, GetCurrentGraph, JOB_INFO, JOB_FILES } from '../actions/uiactions';
import * as Titles from './titles';
import JobService, { JobFile, CurrentJobInformation, JobItem } from '../jobs/jobservice';
import { GetStepIndex, GetStepCount, BuildAllInfo } from '../nodepacks/batch/BuildAllDistributed';
import { AgentProject } from '../jobs/interfaces';

const PROGRESS_VIEW_TAB = 'PROGRESS_VIEW_TAB';
class CurrentJobProgressView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	active() {
		return !!this.props.active;
	}
	timeDifference(current: number, previous: number) {
		var msPerMinute = 60 * 1000;
		var msPerHour = msPerMinute * 60;
		var msPerDay = msPerHour * 24;
		var msPerMonth = msPerDay * 30;
		var msPerYear = msPerDay * 365;

		var elapsed = current - previous;

		if (elapsed < msPerMinute) {
			return Math.round(elapsed / 1000) + 's';
		} else if (elapsed < msPerHour) {
			return Math.round(elapsed / msPerMinute) + ' m';
		} else if (elapsed < msPerDay) {
			return Math.round(elapsed / msPerHour) + ' hrs';
		} else if (elapsed < msPerMonth) {
			return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
		} else if (elapsed < msPerYear) {
			return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
		} else {
			return 'approximately ' + Math.round(elapsed / msPerYear) + ' yrs ago';
		}
	}
	render() {
		const active = this.active();
		const graph = GetCurrentGraph();
		if (!graph) {
			return <div />;
		}
		let { state } = this.props;
		let jobs = Visual(state, JOB_FILES) || [];
		let jobInfo: { currentJobInformation: CurrentJobInformation; agents: AgentProject[] } = Visual(state, JOB_INFO);
		if (!jobInfo) {
			return <div />;
		}
		let { agents, currentJobInformation } = jobInfo;
		let jobFile: JobFile | undefined | null = currentJobInformation ? currentJobInformation.jobFile : null;
		let indexOfCompletion = -1;
		if (jobFile) {
			indexOfCompletion = BuildAllInfo.Commands.findIndex((x: { name: string }) => {
				return jobFile && x.name === jobFile.step;
			});
		}
		return (
			<TabPane active={VisualEq(state, PROGRESS_VIEW_TAB, 'Git Run')}>
				<h1>Current Job Information</h1>
				<div className="row">
					<div className="col-md-9">
						<Box maxheight={600} title={'Agents'}>
							<table className="table table-bordered">
								<tbody>
									<tr>
										<th />
										<th />
										<th>Name</th>
										<th>Agent</th>
										<th>Updated</th>
										<th>Ready</th>
										<th>Job</th>
										<th>File</th>
										<th>Host</th>
										<th>Port</th>
										<th>Progress</th>
										<th>Error</th>
									</tr>
									{agents
										.sort((a: AgentProject, b: AgentProject) => {
											let temp = `${a.host}`.localeCompare(`${b.host}`);
											if (temp === 0) {
												return `${a.name}`.localeCompare(`${b.name}`);
											}
											return temp;
										})
										.map((agentProject: AgentProject, jobIndex: number) => {
											let busyCls = 'fa fa-circle';
											let color = 'red';
											if (!agentProject.ready) {
												color = 'green';
											}
											let updated = 'Unknown';
											if (agentProject.updated) {
												updated = this.timeDifference(Date.now(), agentProject.updated);
                      }
                      let progress = 0;
                      if(agentProject.progress){
                        progress = agentProject.progress;
                      }
											let modelsWorkedOn = null;
											let temp: any =
												currentJobInformation &&
												currentJobInformation.jobs &&
												agentProject &&
												agentProject.workingOnJob
													? currentJobInformation.jobs[agentProject.workingOnJob]
													: { parts: [] };
											let { parts } = temp;
											if (parts && agentProject && agentProject.workingOnFile) {
												let jobItem: JobItem = parts.find(
													(x: JobItem) => x.file == agentProject.workingOnFile
												);
												if (jobItem && jobItem.models) {
													modelsWorkedOn = jobItem.models.map((model) => <div>{model}</div>);
												}
											}
											return [
												<tr key={`agent-project-${jobIndex}`}>
													<td>
														<i
															onClick={() => {
																this.setState({
																	[agentProject.name || 'no-name']: !!!this.state[
																		agentProject.name || 'no-name'
																	]
																});
															}}
															className={`fa ${this.state[agentProject.name || 'no-name']
																? 'fa-chevron-down'
																: 'fa-chevron-right'}`}
														/>
													</td>
													<td>{jobIndex + 1}</td>
													<td>{agentProject.name}</td>
													<td>{agentProject.agent}</td>
													<td>{updated}</td>
													<td>
														<i className={busyCls} style={{ color }} />
													</td>
													<td>{agentProject.workingOnJob}</td>
													<td>{agentProject.workingOnFile}</td>
													<td>{agentProject.host}</td>
													<td>{agentProject.port}</td>
													<td>
														<progress
															title={`${Math.floor(progress * 1000) / 10}`}
															value={progress}
															min={0}
															max={1}
														/>
													</td>
													<td>
														{agentProject.error ? (
															<i
																className="fa fa-stop"
																title={`${agentProject.error}`}
																style={{ color: 'red' }}
															/>
														) : null}
													</td>
												</tr>,
												this.state[agentProject.name || 'no-name'] ? (
													<tr>
														<td colSpan={9}>{modelsWorkedOn}</td>
													</tr>
												) : (
													false
												)
											].filter((x: any) => x);
										})}
								</tbody>
							</table>
						</Box>
					</div>
					<div className="col-md-3">
						<Box maxheight={600} title={'Job Info'}>
							<h3>{jobFile && jobFile.name ? jobFile.name : null}</h3>
							<p style={{ maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
								{jobFile && jobFile.name ? jobFile.graphPath : null}
							</p>
							<p>{jobFile && jobFile.name ? jobFile.stages : null}</p>
							<table className="table table-bordered">
								{BuildAllInfo.Commands
									.map((command, index) => {
										// if (index && BuildAllInfo.Commands.length < index + 1) {
										// 	command = BuildAllInfo.Commands[index + 1];
										// }
										let cls = 'fa fa-circle';
										let currentStyle = {};
										if (indexOfCompletion + 1 === index) {
											currentStyle = { backgroundColor: '#21515237' };
											cls = `fa  fa-cog fa-spin`;
										} else if (indexOfCompletion < index) {
											cls = 'fa  fa-circle-o-notch';
										} else if (jobFile && jobFile.step == command.name) {
											cls = 'fa fa- fa-circle-thin';
											currentStyle = { backgroundColor: '#21f19237' };
										}
										let rows = [];
										if (jobFile) {
											if (
												currentJobInformation &&
												currentJobInformation.currentStep === command.name &&
												currentJobInformation.currentJobName &&
												currentJobInformation.jobs
											) {
												let { job, parts } = currentJobInformation.jobs[
													currentJobInformation.currentJobName
												];
												if (parts) {
													let completed = parts
														.filter((x: JobItem) => x)
														.summation((value: JobItem, currentValue: number) => {
															currentValue = currentValue || 0;
															if (value.complete) {
																return currentValue + 1;
															}
															return currentValue;
														});
													let distrubted = parts
														.filter((x: JobItem) => x)
														.summation((value: JobItem, currentValue: number) => {
															currentValue = currentValue || 0;
															if (value.distributed) {
																return currentValue + 1;
															}
															return currentValue;
														});
													rows.push(
														<tr>
															<td colSpan="2">
																<progress
																	title={
																		Math.floor(completed / parts.length * 1000) / 10
																	}
																	value={completed}
																	min={0}
																	max={parts.length}
																/>
															</td>
														</tr>
													);
													rows.push(
														<tr>
															<td colSpan="2">
																<progress
																	title={`${distrubted} / ${parts.length}`}
																	value={distrubted}
																	min={0}
																	max={parts.length}
																/>
															</td>
														</tr>
													);
												}
											}
										}

										return [
											<tr style={currentStyle}>
												<td>{command.name}</td>
												<td>
													<i className={cls} />
												</td>
											</tr>,
											...rows
										];
									})
									.flatten()}
							</table>
						</Box>
					</div>
				</div>
			</TabPane>
		);
	}
}

export default UIConnect(CurrentJobProgressView);
