// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	TargetMethodType,
	EffectDescription,
	MountingDescription,
	MethodDescription,
	DataChainConfiguration,
	CreateCheckExistence,
	RelationType,
	SkipSettings,
	CheckIsExisting,
	CreateBranch,
	BranchConfig
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiactions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import { checked } from './editor.main.css';
import AfterEffectDataChainOptions from './aftereffectdatachainoptions';
import AfterEffectDataChainOption from './aftereffectdatachainoption';

export default class AfterEffectBranchConfigComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let branchConfig: BranchConfig = this.props.branchConfig;
		if (!branchConfig) {
			return <span />;
		}

		let previousMethodDescription: MethodDescription = this.props.previousMethodDescription;
		let currentMethodDescription: MethodDescription = this.props.currentMethodDescription;

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={this.props.title}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={branchConfig.enabled}
						onChange={(value: boolean) => {
							branchConfig.enabled = value;
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
					<TextInput
						label={Titles.Name}
						value={branchConfig.name}
						onChange={(value: string) => {
							branchConfig.name = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{branchConfig.enabled ? (
					<AfterEffectDataChainOption
						previousMethodDescription={previousMethodDescription}
						currentMethodDescription={currentMethodDescription}
						dataChainOptions={branchConfig.dataChainOptions}
					/>
				) : null}
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
