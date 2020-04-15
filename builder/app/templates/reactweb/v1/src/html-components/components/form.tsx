import * as React from 'react';

export default class Form extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
	constructor(props) {
		super(props);

		this.state = {};
	}
	render() {
		var props = {
			...this.props
		};
		delete props.children;
		return <div {...props}>{this.props.children}</div>;
	}
}
