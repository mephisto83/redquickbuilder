import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class MultiSelectList extends React.Component {
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
			<ul className={'list-group'}>
				{(this.props.data || [])
					.map((item, index) => {
						if (this.props.renderItem) {
              let key = this.props.keyExtractor(item);
              let res = this.props.renderItem({ item, index, key });
							return (
								<li
									key={key}
									onClick={() => {
										if (this.props.onClick) {
											this.props.onClick(item);
										}
										if (this.props.onChange) {
											this.props.onChange({
												nativeEvent: { value: item, text: item }
											});
										}
									}}
								>
									{res}
								</li>
							);
						}
					})
					.filter((x) => x)}
			</ul>
		);
	}
}

MultiSelectList.propTypes = {
	renderItem: function(v) {
		return typeof v === 'function';
	},
	keyExtractor: function(v) {
		return typeof v === 'function';
	},
	onClick: function(V) {
		return typeof v === 'function';
	},
	data: function(v) {
		return Array.isArray(v);
	}
};
