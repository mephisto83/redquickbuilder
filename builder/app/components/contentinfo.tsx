// @flow
import React, { Component } from 'react';
export default class ContentInfo extends Component<any, any> {
	constructor(props: any) {
		super(props);
	}
	getBoxColor() {
		if (this.props.type === 'info') {
			return 'info-box bg-aqua';
		} else if (this.props.type === 'success') {
			return 'info-box bg-green';
		}
	}
	render() {
		return (
			<div className={this.getBoxColor() || 'info-box bg-red'}>
				<i
					className="ion ion-ios-pricetag-outline"
					style={{
						fontSize: 17,
						padding: 10,
						position: 'absolute'
					}}
				/>
				<div
					className="info-box-content"
					style={{
						padding: `5px 10px`,
						marginLeft: 26
					}}
				>
					<span className="info-box-text">{this.props.title}</span>
					<span className="info-box-text">{this.props.description}</span>
					<span className="info-box-number">{(this.props.messages || []).length}</span>

					<div className="progress">
						<div className="progress-bar" style={{ width: '70%' }} />
					</div>
					{(this.props.messages || []).map((message: string) => {
						return (
							<span title={message} className="progress-description">
								{message}
							</span>
						);
					})}
				</div>
			</div>
		);
	}
}
