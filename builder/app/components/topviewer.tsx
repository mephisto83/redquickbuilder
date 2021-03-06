// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextBox from './textinput';
export default class TopViewer extends Component<any, any> {
	active() {
		return !!this.props.active;
	}
	render() {
		var style = {
			position: 'relative',
			width: '100%',
			height: 'calc(100vh - 50px)',
			...this.props.style || {}
		};
		let active = this.active();
		let height = 600;
		return (
			<div style={style}>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: 'calc(100vh - 50px)',
						transition: 'all 1s',
						pointerEvents: active ? 'all' : 'none',
						top: active ? 0 : '-2000px',
						backgroundColor: '#dd4b39d2',
						zIndex: 1,
						...this.props.innerStyle || {}
					}}
				>
					{this.props.children}
				</div>
			</div>
		);
	}
}
