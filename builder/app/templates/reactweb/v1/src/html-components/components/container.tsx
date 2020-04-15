import * as React from 'react';
import StyleProvider from './styleprovider';

export default class Container extends React.Component<any, any> {
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
			<section className={`${this.props.className || ''} ` + 'Container'} {...props}>
				{this.props.children}
			</section>
		);
	}
}
