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
	JobItemId,
	GetNodeTitle
} from '../actions/uiActions';
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
import CurrentJobProgressView from './currentjobprogressview';
import CheckBox from '../templates/react_native/v1/native-base-theme/components/CheckBox';
import Check, { GetValidationMethodForViewType_ } from '../analysis/check';

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

		if (!active) {
			return <div />;
		}
		const graph = GetCurrentGraph();
		if (!graph) {
			return <div />;
		}
		let { state } = this.props;
		const ANALYSIS_VIEW = 'ANALYSIS_VIEW';
		let jobs = Visual(state, JOBS) || [];
		let GetValidationMethodForViewType_Results = Visual(state, GetValidationMethodForViewType_) || [];
		return (
			<TopViewer active={!!active}>
				<section className="content">
					<div className="row">
						<div className="col-md-12">
							<TabContainer>
								<Tabs>
									<Tab
										active={VisualEq(state, ANALYSIS_VIEW, 'General')}
										title={'Local'}
										onClick={() => {
											this.props.setVisual(ANALYSIS_VIEW, 'General');
										}}
									/>
								</Tabs>
							</TabContainer>
							<TabContent>
								<TabPane active={VisualEq(state, ANALYSIS_VIEW, 'General')}>
									<h1>Analysis</h1>
									<Box
										maxheight={600}
										title={Titles.Input}
										onSearch={(search: any) => {
											this.setState({
												titleSearch: search
											});
										}}
									>
										<table className="table table-bordered">
											<tbody>
												<tr>
													<th />
													<th>Name</th>
													<th />
												</tr>
												<tr>
													<td
														onClick={() => {
															this.props.toggleVisual(
																`GetValidationMethodForViewType_Details`
															);
														}}
													>
														<i
															className={
																Visual(
																	state,
																	`GetValidationMethodForViewType_Details`
																) ? (
																	'fa fa-angle-right'
																) : (
																	'fa fa-angle-down'
																)
															}
														/>
													</td>
													<td>GetValidationMethodForViewType</td>
													<td>
														<i
															className={'fa fa-flask'}
															onClick={() => {
																Check('GetValidationMethodForViewType');
															}}
														/>
													</td>
												</tr>
												{!Visual(state, `GetValidationMethodForViewType_Details`) ? null : (
													<tr>
														<td colSpan={3} style={{}}>
															<div
																style={{
																	maxHeight: 300,
																	overflowY: 'auto',
																	width: '100%'
																}}
															>
																<table>
																	<tr>
																		<th>ok</th>
																		<th>details</th>
																		<th>node</th>
																	</tr>
																	{GetValidationMethodForViewType_Results.map(
																		(res: {
																			details: any;
																			ok: boolean;
																			node: string;
																		}) => {
																			return (
																				<tr
																					onClick={() => {
																						Check(
																							'GetValidationMethodForViewType',
																							res.node
																						);
																					}}
																				>
																					<td>
																						<i
																							style={{
																								color: res.ok
																									? 'green'
																									: 'red'
																							}}
																							className={
																								res.ok ? (
																									'fa fa-check'
																								) : (
																									'fa fa-times'
																								)
																							}
																						/>
																					</td>
																					<td>
																						{JSON.stringify(
																							res.details || {}
																						)}
																					</td>
																					<td>{GetNodeTitle(res.node)}</td>
																				</tr>
																			);
																		}
																	)}
																</table>
															</div>
														</td>
													</tr>
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
}

export default UIConnect(ProgressView);
