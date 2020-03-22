import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Validation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}
	getStyle() {
		let { data } = this.props;
		if (data && data.success && data.errors) {
			let { errors, success } = data;
			if (errors.length || success.length) {
				if (typeof this.props.data === 'object') {
					return {};
				}
			}
		}
		return { display: 'none' };
	}
	getValidation() {
		let { data } = this.props;
		let result = [];
		if (data && data.success && data.errors) {
			const { errors, success } = data;
			if (errors.length) {
				result.push(
					...errors.filter((error) => error.title).map((error, index) => {
						return (
							<li key={`error${index}`}>
								<span>{error.title}</span>
							</li>
						);
					})
				);
			} else if (success) {
				result = success.filter((success) => success.title).map((suc, index) => {
					return (
						<li key={`success ${index}`}>
							<span>{suc.title}</span>
						</li>
					);
				});
			}
		}
		return result;
	}
	render() {
		var props = {
			...this.props
		};
		return (
			<ul style={this.getStyle()} className={`${this.props.className} list-group`}>
				{this.getValidation()}
			</ul>
		);
	}
}

Validation.propTypes = {
	data: function(v) {
		return typeof v === 'object';
	}
};
