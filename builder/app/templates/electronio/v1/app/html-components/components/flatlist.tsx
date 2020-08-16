import * as React from 'react';
import StyleProvider from './styleprovider';
import PropTypes from 'prop-types';
import styles from './flatlist.css';

// ExecuteButtonWorkoutStationsComponent
let navigationInstance: any;

export default class FlatList extends React.Component {
	constructor(props: any) {
		super(props);

		this.state = {};
	}
	render() {
		var props = {
			...this.props
		};
		delete props.children;
		let { style = {} } = props;
		return (
			<ul className={styles['flat-list']} style={style}>
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

FlatList.propTypes = {
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
