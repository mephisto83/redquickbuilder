import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TopViewer from './topviewer';

import TabPane from './tabpane';
import Box from './box';
import { VisualEq, Visual, JobProgressId, GetCurrentGraph, JOB_FILES } from '../actions/uiActions';
import * as Titles from './titles';
import { JobFile } from '../jobs/jobservice';
import { GetStepIndex, GetStepCount } from '../nodepacks/batch/BuildAllDistributed';

const PROGRESS_VIEW_TAB = 'PROGRESS_VIEW_TAB';
class JobFilesPane extends Component<any, any> {
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

		return (
			<TabPane active={VisualEq(state, PROGRESS_VIEW_TAB, 'Git Run')}>
				<h1>Render Jobs</h1>
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
							{jobs.map((job: JobFile, jobIndex: number) => {
								let jobProgress = {
									complete: GetStepIndex(job.step || ''),
									total: GetStepCount()
								};

								let { stages } = job;

								let jobItemRows: any[] = [];
								if (stages) {
									stages.forEach((stage) => {
										jobItemRows.push(
											<tr key={`${job.name} ${stage}`}>
												<td>{stage}</td>
											</tr>
										);
									});
								}
								return [
									<tr key={`job-${jobIndex}`}>
										<td>
											<i
												onClick={() => {
													this.setState({
														[job.name || 'no-name']: !!!this.state[job.name || 'no-name']
													});
												}}
												className={`fa ${this.state[job.name || 'no-name']
													? 'fa-chevron-down'
													: 'fa-chevron-right'}`}
											/>
										</td>
										<td>{job.name}</td>
										<td>{job.step}</td>
										<td>{new Date(job.updated || new Date()).toLocaleDateString()}</td>
										<td>
											{jobProgress ? jobProgress.complete : ''}/{jobProgress ? jobProgress.total : ''}
										</td>
										<td>
											{jobProgress && jobProgress.total ? (
												<progress
													title={100 * jobProgress.complete / jobProgress.total}
													value={100 * jobProgress.complete / jobProgress.total}
													min={0}
													max={100}
												/>
											) : null}
										</td>
									</tr>,
									jobItemRows && jobItemRows.length && false ? (
										<tr>
											<td colSpan="8">
												<table className="table table-bordered">{jobItemRows}</table>
											</td>
										</tr>
									) : null
								].filter((x: any) => x);
							})}
						</tbody>
					</table>
				</Box>
			</TabPane>
		);
	}
}

export default UIConnect(JobFilesPane);
