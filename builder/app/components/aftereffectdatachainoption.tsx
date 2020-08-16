// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	EffectDescription,
	MountingDescription,
	MethodDescription,
	CheckAfterEffectDataChainConfiguration,
	DataChainConfiguration,
	CreateRouteConfig
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import AfterEffectCheckExistanceConfig from './aftereffectcheckexistanceconfig';
import AfterEffectGetExistanceConfig from './aftereffectgetexistanceconfig';
import AfterEffectSetPropertiesConfig from './aftereffectsetpropertiesconfig';
import AfterEffectRouteConfigComponent from './aftereffectrouteconfigcomponent';

export default class AfterEffectDataChainOption extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		if (!dataChainOptions) {
			return <span />;
		}

		let previousMethodDescription: MethodDescription | null = this.props.previousMethodDescription;

		let currentMethodDescription: MethodDescription = this.props.currentMethodDescription;
		if (!previousMethodDescription || !currentMethodDescription) {
			return <span />;
		}

		let onchange = () => {
			this.setState({
				turn: UIA.GUID()
			});
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
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
				title={Titles.Configuration}
			>
				<AfterEffectCheckExistanceConfig
					previousMethodDescription={previousMethodDescription}
					currentMethodDescription={currentMethodDescription}
          dataChainOptions={dataChainOptions}
          routes={this.props.routes}
					onChange={onchange}
				/>
				<AfterEffectGetExistanceConfig
					previousMethodDescription={previousMethodDescription}
					currentMethodDescription={currentMethodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<AfterEffectSetPropertiesConfig
					previousMethodDescription={previousMethodDescription}
					currentMethodDescription={currentMethodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<AfterEffectRouteConfigComponent
					previousMethodDescription={previousMethodDescription}
					currentMethodDescription={currentMethodDescription}
          dataChainOptions={dataChainOptions}
          routes={this.props.routes}
					onChange={onchange}
				/>
			</TreeViewMenu>
		);
	}
}