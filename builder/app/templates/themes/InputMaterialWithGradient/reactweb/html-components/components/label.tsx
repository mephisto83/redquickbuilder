import React from 'react';

export default class Label extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		return <span style={{ display: 'none' }} />;
	}
}
