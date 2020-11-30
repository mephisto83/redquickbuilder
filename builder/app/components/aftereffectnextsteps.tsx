// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	TargetMethodType,
	MountingDescription,
	ValidationConfig,
	CheckValidationConfigs,
	ValidationColors,
	DataChainConfiguration,
	CreateNextStepsConfiguration,
	NextStepsConfiguration,
	CheckNextStepsConfiguration,
	CreateNextStepConfiguration,
	NextStepConfiguration
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';
import ValidationComponentItem from './validationcomponentitem';
import { removeNode } from '../methods/graph_methods';
import { NodeProperties } from '../constants/nodetypes';
import AfterEffectNextStep from './aftereffectnextstep';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';

export default class AfterEffectNextSteps extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		dataChainOptions.nextStepsConfiguration =
			dataChainOptions.nextStepsConfiguration || CreateNextStepsConfiguration();
		let nextStepsConfiguration: NextStepsConfiguration = dataChainOptions.nextStepsConfiguration;
		let valid = CheckNextStepsConfiguration(nextStepsConfiguration);
		let methods: MountingDescription[] = this.props.methods;
		let targetMountingDescription: MountingDescription | undefined =
			nextStepsConfiguration && methods
				? methods.find((v) => v.id === nextStepsConfiguration.descriptionId)
				: undefined;
		return (
			<TreeViewMenu
				open={this.state.open}
				color={
					nextStepsConfiguration && nextStepsConfiguration.steps && nextStepsConfiguration.steps.length ? (
						ValidationColors.Ok
					) : (
						ValidationColors.Neutral
					)
				}
				active
				error={!valid}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.NextSteps}
			>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Methods}
						options={(methods || []).map((v: MountingDescription) => ({ title: v.name, value: v.id }))}
						value={nextStepsConfiguration.descriptionId}
						onChange={(value: string) => {
							nextStepsConfiguration.descriptionId = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.NextStep}`}
						onClick={() => {
							nextStepsConfiguration.steps.push(CreateNextStepConfiguration());

							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(nextStepsConfiguration.steps || []).map((nextStepConfig: NextStepConfiguration, index: number) => {
					return (
						<AfterEffectNextStep
              key={nextStepConfig.id}
              dataChainType={this.props.dataChainType}
              targetMountingDescription={targetMountingDescription}
							methodDescription={this.props.methodDescription}
							onContext={this.props.onContext}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = nextStepsConfiguration.steps.findIndex(
									(v) => v.id === nextStepConfig.id
								);
								if (index !== -1 && nextStepsConfiguration.steps) {
									// if (nextStepConfig.dataChain) {
									// 	let originalConfig = UIA.GetNodeProp(
									// 		nextStepConfig.dataChain,
									// 		NodeProperties.OriginalConfig
									// 	);
									// 	if (originalConfig === nextStepConfig.id)
									// 		UIA.removeNodeById(nextStepConfig.dataChain);
									// }
									nextStepsConfiguration.steps.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							nextStepConfig={nextStepConfig}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
