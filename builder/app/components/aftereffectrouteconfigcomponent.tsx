// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	CheckAfterEffectDataChainConfiguration,
	DataChainConfiguration,
	RouteConfig,
	CreateRouteConfig,
  AfterEffect
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';
import SelectInput from './selectinput';

export default class AfterEffectRouteConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}
		dataChainOptions.routeConfig = dataChainOptions.routeConfig || CreateRouteConfig();
		let routeConfig: RouteConfig = dataChainOptions.routeConfig;

		if (!routeConfig) {
			return <span />;
		}

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={
					CheckAfterEffectDataChainConfiguration(dataChainOptions) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'
				}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!routeConfig || !routeConfig.enabled}
				title={Titles.Routing}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={routeConfig.enabled}
						onChange={(value: boolean) => {
							routeConfig.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Route}
						options={(this.props.routes || []).map((route: AfterEffect) => {
							return { value: route.id, title: route.name, id: route.id };
						})}
						value={routeConfig.targetId}
						onChange={(value: string) => {
							routeConfig.targetId = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
