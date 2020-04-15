import * as React from 'react';
import { redConnect, titleService } from '../actions/util';
import { Content, StyleProvider } from '../html-components';
import {
	Container,
	ListItem,
	Header,
	Title,
	Footer,
	FooterTab,
	Button,
	Left,
	Right,
	Body,
	Icon,
	Text,
	View
} from '../html-components';

export default class MenuItem extends React.Component {
	render() {
		let navigationInstance = this.props.navigation;
		return (
			<div
				onClick={() => {
					if (this.props.onPress) {
						this.props.onPress();
					}
				}}
			>
				<div
					icon
					style={{
						paddingLeft: 15,
						paddingRight: 0,
						flexDirection: 'row',
						backgroundColor: 'transparent',
						height: 50
					}}
				>
					<div style={{ flexDirection: 'row', alignItems: 'center' }}>
						<div name={this.props.icon} style={{ paddingLeft: 3, paddingRight: 4 }} />
						<span>{this.props.title}</span>
					</div>
					<div />
					<div />
				</div>
			</div>
		);
	}
}
