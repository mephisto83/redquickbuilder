import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance: any;

export default class MultiViewList extends React.Component<any, any> {
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
			<StyleProvider>
				<ul className={'list-group'}>
					{(this.props.data || [])
						.map((item: any, index: any) => {
							if (this.props.renderItem) {
								let res = this.props.renderItem({ item, index });
								let key = this.props.keyExtractor(item);
								return (
									<li
										key={key || item}
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
						.filter((x: any) => x)}
				</ul>
			</StyleProvider>
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
	data: function(v: any) {
		return Array.isArray(v);
	}
};
