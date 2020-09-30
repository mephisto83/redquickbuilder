// @flow
import React, { Component } from 'react';
import { EnumerationConfig } from '../interface/methodprops';
import { GetNodeProp } from '../methods/graph_methods';
import { NodeProperties } from '../constants/nodetypes';
import Panel from './panel';
import { Node } from '../methods/graph_types';

export default class LinkView extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	getRows() {
		const { link } = this.props;
		if (link) {
			return Object.entries(link.properties).map((items, index) => {
				let [ key, value ] = items;
				if (typeof value === 'object' && value) {
					value = JSON.stringify(value, null, 4);
				}
				return (
					<tr key={index}>
						<td>{key}</td>
						<td>
							<pre>{`${value}`}</pre>
						</td>
						<td>{link.propertyVersions ? link.propertyVersions[key] : '-'}</td>
					</tr>
				);
			});
		}
		return [];
	}

	render() {
		let rows = this.getRows();
		let th_style = { top: 0 };
		return (
			<div className="tableFixHead" style={{ '--tableheight': '100%', boxShadow: 'none' }}>
				<table className="   fixheader table table-hover" style={{ width: '100%', display: 'table' }}>
					<thead>
						<tr>
							<th style={th_style}>property</th>
							<th style={th_style}>value</th>
							<th style={th_style}>version</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</table>
			</div>
		);
	}
}
