import * as React from 'react';
import StyleProvider from './styleprovider';

export default class Content extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {};
	}
	render() {
		var props = {
			...this.props
		};
		let { className } = props;
		delete props.children;
		return (
			<div {...props} className={`${props.className || ''} Content`}>
				{this.props.children}
			</div>
		);
	}
}
