import * as React from 'react';
import StyleProvider from './styleprovider';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Button extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}
	getAttributes() {
		const res = { disabled: 'disabled' };
		if (this.props.error) {
			const { errors, valid } = this.props.error;

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
			<button {...props} {...attributes} type="button" className={'btn btn-primary'}>
				{this.props.children}
			</button>
		);
	}
}
