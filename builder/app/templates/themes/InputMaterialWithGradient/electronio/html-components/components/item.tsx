import React from 'react';

export default class Item extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		return this.props.children;
	}
}
