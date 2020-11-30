// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	PermissionConfig,
	StaticParameter,
	StaticParameters,
	createStaticParameters,
	createStaticParameter,
	RouteDescription
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ValidationComponentItem from './validationcomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { NodeTypeColors, NodeTypes } from '../constants/nodetypes';
import StaticParameterComponent from './staticparametercomponent';

export default class StaticParametersComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: RouteDescription | MountingDescription = this.props.mountingItem;
		mountingItem.staticParameters = mountingItem.staticParameters || createStaticParameters();
		let { staticParameters } = mountingItem;

		return (
			<TreeViewMenu
				open={this.state.open}
				color={staticParameters && staticParameters.parameters.length ? '#218380' : ''}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.StaticParameters}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Add} ${Titles.StaticParamter}`}
						onClick={() => {
							staticParameters.parameters.push(createStaticParameter());

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(staticParameters.parameters || []).map((staticParameter: StaticParameter, index: number) => {
					return (
						<StaticParameterComponent
							key={staticParameter.id}
							staticParameter={staticParameter}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							onDelete={() => {
								let index: number = staticParameters.parameters.findIndex(
									(v) => v.id === staticParameter.id
								);
								if (index !== -1 && staticParameters) {
									staticParameters.parameters.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							validationConfig={staticParameter}
						/>
					);
				})}{' '}
			</TreeViewMenu>
		);
	}
}
