import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class Validation extends React.Component<any, any> {
	constructor(props: any) {
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
			const { errors, success, validated } = data;
			if (validated) {
				if (errors.length) {
					result.push(
						...errors.filter((error: { title: any; }) => error.title).map((error: { title: React.ReactNode; }, index: any) => {
							return (
								<li key={`error${index}`}>
									<span>{error.title}</span>
								</li>
							);
						})
					);
				} else if (success) {
					result = success.filter((success: { title: any; }) => success.title).map((suc: { title: React.ReactNode; }, index: any) => {
						return (
							<li key={`success ${index}`}>
								<span>{suc.title}</span>
							</li>
						);
					});
				}
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
	data: function(v: any) {
		return null;
	}
};
