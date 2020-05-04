import * as React from 'react';
import StyleProvider from './styleprovider';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Button extends React.Component {
	constructor(props: any) {
		super(props);

		this.state = {};
	}
	getAttributes() {
		const res = { disabled: 'disabled' };
		if (this.props.error) {
			const { errors, valid, validated } = this.props.error;

			if (valid) {
				if (errors.length === 0) {
					delete res.disabled;
				}
			}
		} else if (this.props.error === undefined || this.props.error === null) {
			delete res.disabled;
		}

		return res;
	}
	render() {
		var props = {
			...this.props
		};
		let attributes = this.getAttributes();
		delete props.children;
		return (
			<button className={'btn btn-primary'} {...props} {...attributes} type="button">
				{this.props.children}
			</button>
		);
	}
}
