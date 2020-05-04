import * as React from 'react';
import StyleProvider from './styleprovider';

export default class Content extends React.Component {
	constructor(props: any) {
		super(props);

		this.state = {};
	}
	render() {
		var props = {
			...this.props
		};

		delete props.children;
		return (
			<content {...props} className={`${props.className || ''} Content`}>
				{this.props.children}
			</content>
		);
	}
}
