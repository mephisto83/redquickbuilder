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
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import AfterEffectDataChainOptions from './aftereffectdatachainoptions';
import { viewCode } from '../actions/remoteActions';

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
		let currentDescription: MountingDescription = (this.props.methods || []).find((method: MountingDescription) => {
			return afterEffect && method.id === afterEffect.target;
		});
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
				{afterEffect && afterEffect.dataChain ? (
					<AfterEffectDataChainOptions
						methods={this.props.methods}
						dataChainType={this.props.dataChainType}
						methodDescription={this.props.methodDescription}
						currentDescription={currentDescription}
						previousEffect={this.props.previousEffect}
						routes={this.props.routes}
						afterEffect={afterEffect}
					/>
				) : null}
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
					{afterEffect.dataChain ? (
						<TreeViewGroupButton
							icon={'fa fa-hand-grab-o'}
							onClick={() => {
								UIA.SelectNode(afterEffect.dataChain, null)(UIA.GetDispatchFunc());
								if (afterEffect.dataChain) {
									viewCode(UIA.GenerateCSChainFunction(afterEffect.dataChain));
								}
							}}
						/>
					) : null}
					<TreeViewGroupButton
						title={`Build Datachain`}
						onClick={() => {
							this.buildDataChain(afterEffect, currentDescription);
						}}
						icon="fa fa-gears"
					/>
					<TreeViewItemContainer>
						<CheckBox
							label={'Override'}
							value={this.state.override}
							onChange={(val: boolean) => {
								this.setState({ override: val });
							}}
						/>
					</TreeViewItemContainer>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}

	private buildDataChain(afterEffect: AfterEffect, currentDescription: MountingDescription) {
		if (afterEffect && afterEffect.target) {
			if (currentDescription) {
				if (this.props.methodDescription) {
					let routes = this.props.routes || [];
					let methods = this.props.methods;
					let mountingItem = this.props.mountingItem;
					let override = this.state.override;
					let methodDescription: MethodDescription = this.props.methodDescription;
					let callback = () => {
						this.setState({
							turn: UIA.GUID()
						});
					};
					buildAfterEffectDataChain({
						methodDescription,
						currentDescription,
						afterEffect,
						methods,
						routes,
						mountingItem,
						override,
						callback
					});
				}
			}
		}
	}
}
export function buildAfterEffectDataChain({
	methodDescription,
	currentDescription,
	afterEffect,
	methods,
	routes,
	mountingItem,
	override,
	callback
}: {
	methodDescription: MethodDescription;
	currentDescription: MountingDescription;
	afterEffect: AfterEffect;
	methods: any;
	routes: any;
	mountingItem: any;
	override: any;
	callback: () => void;
}) {
	if (methodDescription && currentDescription.methodDescription) {
		BuildDataChainAfterEffectConverter(
			{
				name: afterEffect.name,
				from: methodDescription,
				afterEffect,
				dataChain: afterEffect.dataChain,
				methods,
				type: DataChainType.AfterEffect,
				to: currentDescription.methodDescription,
				currentDescription,
				routes,
				afterEffectChild: afterEffect.name,
				afterEffectParent: mountingItem.name,
				afterEffectOptions: afterEffect.dataChainOptions,
				override
			},
			(dataChain: Node) => {
				afterEffect.dataChain = dataChain.id;
				if (callback) {
					callback();
				}
			}
		);
	}
}
