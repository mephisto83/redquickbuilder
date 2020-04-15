import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';
import './flatlist.css';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance;

export default class FlatList extends React.Component<{ [index: string]: any }, { [index: string]: any }> {
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
			<ul className={'flat-list'}>
				{(this.props.data || [])
					.map((item: any, index: any) => {
						if (this.props.renderItem) {
							let key = this.props.keyExtractor(item);
							let res = this.props.renderItem({ item, index, key });
							return res;
						}
					})
					.filter((x: any) => x)}
			</ul>
		);
	}
}
