// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
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
	CheckExistenceConfig,
	createReturnSetting,
	ReturnSetting
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';

export default class ReturnSettings extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let checkExistence: CheckExistenceConfig = this.props.checkExistence;
		if (!checkExistence) {
			return <span />;
		}
		checkExistence.returnSetting = checkExistence.returnSetting || createReturnSetting();
		let { returnSetting } = checkExistence;
		return (
			<TreeViewMenu
				hide={!checkExistence || !checkExistence.enabled}
				open={this.state.open}
				icon={CheckIsExisting(checkExistence) ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={checkExistence.enabled && checkExistence.returnSetting && checkExistence.returnSetting.enabled}
				title={Titles.ReturnSetting}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={returnSetting.enabled}
						onChange={(value: boolean) => {
							returnSetting.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer
					hide={
						!checkExistence ||
						!checkExistence.enabled ||
						!checkExistence.returnSetting ||
						!checkExistence.returnSetting.enabled
					}
				>
					<SelectInput
						label={Titles.ReturnSetting}
						options={Object.values(ReturnSetting).map((v: string) => ({ title: v, value: v }))}
						value={returnSetting.setting}
						onChange={(value: ReturnSetting) => {
							returnSetting.setting = value;
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
