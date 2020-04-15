import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class MultiSelectList extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
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
		);
	}
}
