import * as React from 'react';
import StyleProvider from './styleprovider';

export default class Container extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}
	render() {
		var props = {
			...this.props
		};

		delete props.children;
		return (
			<container className={`${this.props.className || ''} ` + 'Container'} {...props}>
				{this.props.children}
			</container>
		);
	}
}
