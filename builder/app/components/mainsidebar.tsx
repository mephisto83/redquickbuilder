// @flow
import React, { Component } from 'react';
import { RelativeMenuCss } from '../constants/visual';

export default class Header extends Component<any, any> {
	relative() {
		return this.props.relative ? RelativeMenuCss : {};
	}
	overflow() {
		return this.props.overflow ? { maxHeight: '100vh', overflowY: 'auto' } : {};
	}
	render() {
		if (this.props.notactive) {
			return <div />;
		}
		return (
			<aside className={`main-sidebar`} style={{ minHeight: 0, ...this.relative(), ...this.overflow() }}>
				<section className="sidebar" style={{ height: 'auto' }}>
					{this.props.children}
				</section>
			</aside>
		);
	}
}
