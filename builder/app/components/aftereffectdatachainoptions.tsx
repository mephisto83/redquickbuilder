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
	CheckAfterEffectDataChainConfiguration
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
import AfterEffectCheckExistanceConfig from './aftereffectcheckexistanceconfig';
import AfterEffectGetExistanceConfig from './aftereffectgetexistanceconfig';
import AfterEffectSetPropertiesConfig from './aftereffectsetpropertiesconfig';
import AfterEffectDataChainOption from './aftereffectdatachainoption';

export default class AfterEffectDataChainOptions extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	getPreviousDescription(): MethodDescription | null {
		let previousEffect: AfterEffect = this.props.previousEffect;
		let methodDescription: MethodDescription = this.props.methodDescription;
		if (methodDescription) {
			return methodDescription;
		}
		if (previousEffect) {
			let description: MountingDescription = (this.props.methods || []).find((method: MountingDescription) => {
				return method.id === previousEffect.target;
			});
			if (description.methodDescription) {
				return description.methodDescription;
			}
		}
		return null;
	}
	render() {
		let afterEffect: AfterEffect = this.props.afterEffect;
		let methods: (MountingDescription | EffectDescription)[] = this.props.methods;
		if (!afterEffect) {
			return <span />;
		}

		let previousMethodDescription: MethodDescription | null = this.getPreviousDescription();

		afterEffect.dataChainOptions = afterEffect.dataChainOptions || {};
		let currentDescription: MountingDescription = this.props.currentDescription;
		if (!previousMethodDescription || !currentDescription || !currentDescription.methodDescription) {
			return <span />;
		}
		let currentMethodDescription: MethodDescription = currentDescription.methodDescription;
		let onchange = () => {
			this.setState({
				turn: UIA.GUID()
			});
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
		return (
			<AfterEffectDataChainOption onChange={onchange}
				previousMethodDescription={previousMethodDescription}
				currentMethodDescription={currentMethodDescription}
				dataChainOptions={afterEffect.dataChainOptions}
			/>
		);
		// return (
		// 	<TreeViewMenu
		// 		open={this.state.open}
		// 		icon={
		// 			CheckAfterEffectDataChainConfiguration(afterEffect.dataChainOptions) ? (
		// 				'fa fa-check-circle-o'
		// 			) : (
		// 				'fa fa-circle-o'
		// 			)
		// 		}
		// 		onClick={() => {
		// 			this.setState({ open: !this.state.open });
		// 		}}
		// 		active
		// 		title={Titles.Configuration}
		// 	>
		// 		<AfterEffectCheckExistanceConfig
		// 			previousMethodDescription={previousMethodDescription}
		// 			currentMethodDescription={currentMethodDescription}
		// 			dataChainOptions={afterEffect.dataChainOptions}
		// 			onChange={onchange}
		// 		/>
		// 		<AfterEffectGetExistanceConfig
		// 			previousMethodDescription={previousMethodDescription}
		// 			currentMethodDescription={currentMethodDescription}
		// 			dataChainOptions={afterEffect.dataChainOptions}
		// 			onChange={onchange}
		// 		/>
		// 		<AfterEffectSetPropertiesConfig
		// 			previousMethodDescription={previousMethodDescription}
		// 			currentMethodDescription={currentMethodDescription}
		// 			dataChainOptions={afterEffect.dataChainOptions}
		// 			onChange={onchange}
		// 		/>
		// 		<TreeViewButtonGroup />
		// 	</TreeViewMenu>
		// );
	}
}
