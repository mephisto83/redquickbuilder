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
import { ComponentDidMountEffect, ScreenEffect, ScreenEffectApi } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { ComponentDidMountEffectDataChains, DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import { viewCode } from '../actions/remoteActions';

export default class ComponentDidMountEffectComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let effect: ComponentDidMountEffect = this.props.effect;
		if (!effect) {
			return <span />;
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={effect.name || Titles.ComponentDidMount}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={effect.name}
						onChange={(value: string) => {
							effect.name = value;
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
						value={effect.dataChain}
						onChange={(value: string) => {
							effect.dataChain = value;
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
						options={ComponentDidMountEffectDataChains.map(v => ({ title: v, value: v, id: v })).toNodeSelect()}
						value={this.state.chainEffect}
						onChange={(value: string) => {
							this.setState({
								chainEffect: value
							});
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
										[NodeProperties.UIText]: effect.name || 'Unknown',
										[NodeProperties.NODEType]: NodeTypes.DataChain,
										[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
										[NodeProperties.DataChainEntry]: true,
										[NodeProperties.AsOutput]: true,
										[NodeProperties.UIAgnostic]: true,
										[NodeProperties.EntryPoint]: true
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
					<TreeViewGroupButton
						icon={'fa fa-hand-grab-o'}
						onClick={() => {
							UIA.SelectNode(effect.dataChain, null)(UIA.GetDispatchFunc());
							if (effect.dataChain) {
								viewCode(UIA.GenerateCSChainFunction(effect.dataChain));
							}
						}}
					/>
					<TreeViewGroupButton
						icon={' fas fa-check-square'}
						onClick={() => {
							let chainpurpose = null;
							if (this.state.chainEffect) {
								chainpurpose = UIA.GetNodeByProperties({
									[NodeProperties.Purpose]: this.state.chainEffect
								});
							}
							if (chainpurpose) {
								effect.dataChain = chainpurpose.id;
								effect.name = this.state.chainEffect
								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
							else {
								graphOperation(
									UIA.CreateNewNode(
										{
											[NodeProperties.UIText]: this.state.chainEffect,
											[NodeProperties.NODEType]: NodeTypes.DataChain,
											[NodeProperties.DataChainFunctionType]: this.state.chainEffect,
											[NodeProperties.DataChainEntry]: true,
											[NodeProperties.Purpose]: this.state.chainEffect,
											[NodeProperties.AsOutput]: true,
											[NodeProperties.UIAgnostic]: true,
											[NodeProperties.EntryPoint]: true
										}, (node: Node) => {
											effect.dataChain = node.id;
											effect.name = UIA.GetCodeName(node);
											this.setState({
												turn: UIA.GUID()
											});
											if (this.props.onChange) {
												this.props.onChange();
											}
										}
									)
								)(UIA.GetDispatchFunc(), GetStateFunc());
							}
						}}
					/>
					{this.props.agent ? (
						<TreeViewGroupButton
							title={`Store Self`}
							onClick={() => {
								graphOperation(
									UIA.CreateNewNode(
										{
											[NodeProperties.UIText]:
												effect.name || `Store ${UIA.GetNodeTitle(this.props.agent)} Self`,
											[NodeProperties.NODEType]: NodeTypes.DataChain,
											[NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Lambda,
											[NodeProperties.DataChainEntry]: true,
											[NodeProperties.AsOutput]: true,
											[NodeProperties.UIAgnostic]: true,
											[NodeProperties.EntryPoint]: true
										},
										(node: Node) => {
											UIA.updateComponentProperty(
												node.id,
												NodeProperties.Lambda,
												`function Store${UIA.GetCodeName(this.props.agent)}Self($i: any) {
                        let dispatch = GetDispatch();
                        dispatch(UIC('site', Models.${UIA.GetCodeName(this.props.agent)}, $i));
                      }`
											);
										}
									)
								)(UIA.GetDispatchFunc(), GetStateFunc());
							}}
							icon="fa  fa-dot-circle-o"
						/>
					) : null}
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
