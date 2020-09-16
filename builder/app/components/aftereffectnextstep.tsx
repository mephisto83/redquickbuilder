// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	NextStepConfiguration,
	CheckNextStepConfiguration,
	ValidationColors,
  MethodDescription,
  CreateExistenceCheck
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import CheckExistanceConfig from './checkexistenceconfig';
import ConstructModelConfiguration from './constructmodelconfiguration';
import CheckExistanceConfigComponent from './checkexistenceconfigcomponent';

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
    nextStepConfig.existenceCheck = nextStepConfig.existenceCheck || CreateExistenceCheck();
		let methodDescription: MethodDescription = this.props.methodDescription;
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
				color={valid ? ValidationColors.Ok : ValidationColors.Neutral}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				error={!valid}
				title={Titles.Configuration}
			>
				<CheckExistanceConfigComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					existenceCheck={nextStepConfig.existenceCheck}
					onChange={onchange}
				/>
				<ConstructModelConfiguration
					dataChainType={this.props.dataChainType}
					targetMountingDescription={this.props.targetMountingDescription}
					methodDescription={methodDescription}
					constructModel={nextStepConfig.constructModel}
					onChange={onchange}
				/>
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
