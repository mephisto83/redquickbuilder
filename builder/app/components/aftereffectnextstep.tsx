// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	NextStepConfiguration,
	CheckNextStepConfiguration
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import CheckExistanceConfig from './checkexistenceconfig';
import ConstructModelConfiguration from './constructmodelconfiguration';

export default class AfterEffectNextStep extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let nextStepConfig: NextStepConfiguration = this.props.nextStepConfig;
		if (!nextStepConfig) {
			return <span />;
		}

		let methodDescription: MountingDescription = this.props.methodDescription;
		if (!methodDescription) {
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
		let valid = CheckNextStepConfiguration(nextStepConfig);


		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				error={!valid}
				title={Titles.Configuration}
			>
				<CheckExistanceConfig
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={nextStepConfig.checkExistance}
					onChange={onchange}
				/>
				<ConstructModelConfiguration
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					constructModel={nextStepConfig.constructModel}
					onChange={onchange}
				/>
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
