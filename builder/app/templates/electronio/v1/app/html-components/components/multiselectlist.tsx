import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance: any;

export default class MultiSelectList extends React.Component {
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
			<ul className={'list-group'}>
				{(this.props.data || [])
					.map((item: any, index: any) => {
						if (this.props.renderItem) {
							let key = this.props.keyExtractor(item);
							let res = this.props.renderItem({ item, index, key });
							return (
								<li
									key={key}
									onClick={() => {
										const values = this.props.value || [];
										if (Array.isArray(values)) {
											if (values.indexOf(item) === -1) {
												values.unshift(item);
											}
											if (this.props.onClick) {
												this.props.onClick(item);
											}
											if (this.props.onChange) {
												this.props.onChange({
													nativeEvent: { value: values, text: values }
												});
											}
										}
									}}
								>
									{res}
								</li>
							);
						}
					})
					.filter((x: any) => x)}
			</ul>
		);
	}
}

MultiSelectList.propTypes = {
	renderItem: function(v: any) {
		return typeof v === 'function';
	},
	keyExtractor: function(v: any) {
		return typeof v === 'function';
	},
	onClick: function(V: any) {
		return typeof v === 'function';
	},
	data: function(v: any) {
		return Array.isArray(v);
	}
};
