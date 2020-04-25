/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
// import * as styles from './progressbar.scss';

export default class ProgressCircle extends Component<any, any> {
	render() {
		let { percent, circumference } = this.props;
		let offset = circumference - (percent || 0) / 100 * circumference;
		return (
			<div className={'progressbarcontainer'}>
				<svg className="progress-ring " width="120" height="120">
					<circle
						style={{ '--circumference': circumference, '--offset': offset, stroke: 'blue' }}
						className="progress-ring__circle circle-progress"
						stroke="white"
						stroke-width="4"
						fill="transparent"
						r="52"
						cx="60"
						cy="60"
					/>
				</svg>
			</div>
		);
	}
}
