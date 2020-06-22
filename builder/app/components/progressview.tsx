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
import CurrentJobProgressView from './currentjobprogressview';

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
		let jobs = Visual(state, JOBS) || [];
		return (
			<TopViewer active={!!active}>
				<section className="content">
					<div className="row">
						<div className="col-md-12">
							<TabContainer>
								<Tabs>
									{/* <Tab
										active={VisualEq(state, PROGRESS_VIEW_TAB, 'Variables')}
										title={'Local'}
										onClick={() => {
											this.props.setVisual(PROGRESS_VIEW_TAB, 'Variables');
										}}
									/> */}
									<Tab
										active={VisualEq(state, PROGRESS_VIEW_TAB, 'Git Run')}
										title={'Render Run'}
										onClick={() => {
											this.props.setVisual(PROGRESS_VIEW_TAB, 'Git Run');
											this.props.loadGitRuns();
										}}
									/>
									{/* <Tab
										active={VisualEq(state, PROGRESS_VIEW_TAB, 'Others')}
										title={'Others'}
										onClick={() => {
											this.props.setVisual(PROGRESS_VIEW_TAB, 'Others');
										}}
									/> */}
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
                <CurrentJobProgressView />

							</TabContent>
						</div>
					</div>
				</section>
			</TopViewer>
		);
	}
}

export default UIConnect(ProgressView);
