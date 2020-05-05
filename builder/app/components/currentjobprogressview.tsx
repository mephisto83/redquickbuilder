import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TopViewer from './topviewer';

import TabPane from './tabpane';
import Box from './box';
import { VisualEq, Visual, JobProgressId, GetCurrentGraph, JOB_INFO, JOB_FILES } from '../actions/uiactions';
import * as Titles from './titles';
import JobService, { JobFile } from '../jobs/jobservice';
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

	render() {
		const active = this.active();
		const graph = GetCurrentGraph();
		if (!graph) {
			return <div />;
		}
		let { state } = this.props;
		let jobs = Visual(state, JOB_FILES) || [];
		let jobInfo: { currentJobInformation: { jobFile?: JobFile }; agents: AgentProject[] } = Visual(state, JOB_INFO);
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
										<th>Name</th>
										<th>Agent</th>
										<th>Ready</th>
										<th>Job</th>
										<th>File</th>
										<th>Host</th>
										<th>Port</th>
									</tr>
									{agents
										.sort((a, b) => `${a.host}`.localeCompare(`${b.host}`))
										.map((agentProject: AgentProject, jobIndex: number) => {
											let busyCls = 'fa fa-circle';
											let color = 'red';
											if (!agentProject.ready) {
												color = 'green';
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
													<td>{agentProject.name}</td>
													<td>{agentProject.agent}</td>
													<td>
														<i className={busyCls} style={{ color }} />
													</td>
													<td>{agentProject.workingOnJob}</td>
													<td>{agentProject.workingOnFile}</td>
													<td>{agentProject.host}</td>
													<td>{agentProject.port}</td>
												</tr>
											].filter((x: any) => x);
										})}
								</tbody>
							</table>
						</Box>
					</div>
					<div className="col-md-3">
						<Box maxheight={600} title={'Job Info'}>
							<table className="table table-bordered">
								{BuildAllInfo.Commands.map((command, index) => {
									let cls = 'fa fa-circle';
									let currentStyle = {};
									if (indexOfCompletion < index) {
										cls = 'fa  fa-circle-o-notch';
									} else if (indexOfCompletion === index) {
										cls = 'fa fa- fa-circle-thin';
										currentStyle = { backgroundColor: '#21f19237' };
									}
									return [
										<tr style={currentStyle}>
											<td>{command.name}</td>
											<td>
												<i className={cls} />
											</td>
										</tr>
									];
								}).flatten()}
							</table>
						</Box>
					</div>
				</div>
			</TabPane>
		);
	}
}

export default UIConnect(CurrentJobProgressView);
