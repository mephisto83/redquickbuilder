import React from 'react';

export default class Item extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return this.props.children;
	}
}

