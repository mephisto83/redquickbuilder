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
	MethodDescription
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

export default class AfterEffectComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let afterEffect: AfterEffect = this.props.afterEffect;
		let methods: (MountingDescription | EffectDescription)[] = this.props.methods;
		if (!afterEffect) {
			return <span />;
		}
		return (
			<TreeViewMenu
        open={this.state.open}
        icon={'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={afterEffect.name || Titles.AfterEffects}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={afterEffect.name}
						onChange={(value: string) => {
							afterEffect.name = value;
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
						label={Titles.TargetType}
						options={Object.values(TargetMethodType).map((v) => ({ title: v, value: v }))}
						value={afterEffect.targetType}
						onChange={(value: TargetMethodType) => {
							afterEffect.targetType = value;
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
						label={Titles.Target}
						options={(methods || [])
							.map((v: MountingDescription | EffectDescription) => ({ title: v.name, value: v.id }))}
						value={afterEffect.target}
						onChange={(value: string) => {
							afterEffect.target = value;
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
						label={Titles.DataChain}
						options={UIA.NodesByType(null, NodeTypes.DataChain).toNodeSelect()}
						value={afterEffect.dataChain}
						onChange={(value: string) => {
							afterEffect.dataChain = value;
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
						title={`${Titles.RemoveScrenEffect}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
						icon="fa fa-minus"
					/>
					<TreeViewGroupButton
						title={`Up`}
						onClick={() => {
							if (this.props.onDirection) this.props.onDirection(1);
						}}
						icon="fa fa-arrow-up"
					/>
					<TreeViewGroupButton
						title={`Down`}
						onClick={() => {
							if (this.props.onDirection) this.props.onDirection(-1);
						}}
						icon="fa fa-arrow-down"
					/>
					<TreeViewGroupButton
						title={`Build Datachain`}
						onClick={() => {
							if (afterEffect && afterEffect.target) {
								let currentDescription: MountingDescription = this.props.methods.find(
									(method: MountingDescription) => {
										return method.id === afterEffect.target;
									}
								);
								if (currentDescription) {
									if (this.props.methodDescription) {
										let methodDescription: MethodDescription = this.props.methodDescription;
										if (methodDescription && currentDescription.methodDescription) {
											BuildDataChainAfterEffectConverter(
												{
													name: afterEffect.name,
													from: methodDescription,
                          to: currentDescription.methodDescription,
                          afterEffectChild: afterEffect.name,
                          afterEffectParent:  this.props.mountingItem.name
												},
												(dataChain: Node) => {
													afterEffect.dataChain = dataChain.id;
													this.setState({
														turn: UIA.GUID()
													});
												}
											);
										}
									} else if (this.props.previousEffect) {
										let previousEffect: AfterEffect = this.props.previousEffect;
										if (previousEffect && previousEffect.target && this.props.methods) {
											let description: MountingDescription = this.props.methods.find(
												(method: MountingDescription) => {
													return method.id === previousEffect.target;
												}
											);
											if (
												description &&
												currentDescription.methodDescription &&
												description.methodDescription
											) {
												BuildDataChainAfterEffectConverter(
													{
														name: afterEffect.name,
														from: description.methodDescription,
														to: currentDescription.methodDescription,
                            afterEffectChild: afterEffect.name,
                            afterEffectParent:  this.props.mountingItem.name
													},
													(dataChain: Node) => {
														afterEffect.dataChain = dataChain.id;
														this.setState({
															turn: UIA.GUID()
														});
													}
												);
											}
										}
									}
								}
							}
						}}
						icon="fa fa-gears"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
