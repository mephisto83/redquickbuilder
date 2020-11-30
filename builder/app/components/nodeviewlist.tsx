// @flow
import React, { Component } from 'react';
import { EnumerationConfig } from '../interface/methodprops';
import { GetNodeProp } from '../methods/graph_methods';
import { NodeProperties } from '../constants/nodetypes';
import Panel from './panel';
import { Node } from '../methods/graph_types';
import { GetNodeTitle } from '../actions/uiActions';

export default class NodeViewList extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	getRows() {
		const { nodes } = this.props;
		if (nodes) {
			return nodes.map((item: Node) => {
				return (
					<tr key={item.id}>
						<td>{GetNodeTitle(item)}</td>
						<td>{`${GetNodeProp(item, NodeProperties.NODEType)}`}</td>
						<td>{item.id}</td>
					</tr>
				);
			});
		}
		return [];
	}

	render() {
		let props: any = this.props;
		let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
		let enumerations: { id: string; value: string }[] = [];
		if (enumerationConfig && enumerationConfig.enumerationType) {
			enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
		}
		let rows = this.getRows();
		let th_style = { top: 0 };
		return (
			<div className="tableFixHead" style={{ '--tableheight': '100%', boxShadow: 'none' }}>
				<table className="   fixheader table table-hover" style={{ width: '100%', display: 'table' }}>
					<thead>
						<tr>
							<th style={th_style}>Title</th>
							<th style={th_style}>Type</th>
							<th style={th_style}>Id</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</table>
			</div>
		);
	}
}
