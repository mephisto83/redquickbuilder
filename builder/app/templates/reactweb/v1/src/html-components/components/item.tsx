import React, { Component } from 'react';
export default class Item extends Component<{ [index: string]: any }, { [index: string]: any }> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		return <div>{this.props.children}</div>;
	}
}
