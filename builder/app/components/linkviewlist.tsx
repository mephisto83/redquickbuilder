// @flow
import React, { Component } from 'react';
import { EnumerationConfig } from '../interface/methodprops';
import { GetNodeProp } from '../methods/graph_methods';
import { NodeProperties, LinkPropertyKeys } from '../constants/nodetypes';
import Panel from './panel';
import { Node, GraphLink } from '../methods/graph_types';
import { GetNodeTitle, GetLinkProperty, GetNodeForView } from '../actions/uiactions';

export default class LinkViewList extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	getRows() {
		const { links, state } = this.props;
		if (links) {
			return links.map((item: GraphLink) => {
				return (
					<tr key={item.id}>
						<td>{`${GetLinkProperty(item, LinkPropertyKeys.TYPE)}`}</td>
						<td
							style={{ cursor: 'pointer' }}
							onClick={() => {
								if (this.props.onSelectNode) {
									this.props.onSelectNode(item.source);
								}
							}}>{GetNodeTitle(GetNodeForView(state, item.source))}</td>
						<td
							style={{ cursor: 'pointer' }}
							onClick={() => {
								if (this.props.onSelectNode) {
									this.props.onSelectNode(item.target);
								}
							}}>{GetNodeTitle(GetNodeForView(state, item.target))}</td>
						<td
						>
							{item.id}
						</td>
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
							<th style={th_style}>Type</th>
							<th style={th_style}>Source</th>
							<th style={th_style}>Target</th>
							<th style={th_style}>Id</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</table>
			</div>
		);
	}
}
