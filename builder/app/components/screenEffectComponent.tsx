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
import { ScreenEffect, ScreenEffectApi } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiactions';
import { Node } from '../methods/graph_types';

export default class ScreenEffectComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let screenEffect: ScreenEffect | ScreenEffectApi = this.props.screenEffect;
		if (!screenEffect) {
			return <span />;
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={screenEffect.name || Titles.ScreenEffects}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={screenEffect.name}
						onChange={(value: string) => {
							screenEffect.name = value;
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
						value={screenEffect.dataChain}
						onChange={(value: string) => {
							screenEffect.dataChain = value;
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
						title={`${Titles.AddDataChain}`}
						onClick={() => {
							graphOperation(
								UIA.CreateNewNode(
									{
										[NodeProperties.UIText]: screenEffect.name || 'Unknown',
										[NodeProperties.NODEType]: NodeTypes.DataChain,
										[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
										[NodeProperties.DataChainEntry]: true,
										[NodeProperties.AsOutput]: true
									},
									(node: Node) => {
										UIA.updateComponentProperty(
											node.id,
											NodeProperties.Lambda,
											`function ${UIA.GetJSCodeName(node.id) || 'Unknown'}($i: any) {

                  }`
										);
									}
								)
							)(UIA.GetDispatchFunc(), GetStateFunc());
						}}
						icon="fa fa-chain"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
