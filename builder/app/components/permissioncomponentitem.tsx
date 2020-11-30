// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import SelectInput from './selectinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import { MountingDescription, PermissionConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import DataChainOptions from './datachainoptions';

export default class PermissionComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let permissionConfig: PermissionConfig = this.props.permissionConfig;
		if (!permissionConfig) {
			return <span />;
		}
		let mountingItem: MountingDescription = this.props.mountingItem;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={permissionConfig.name || Titles.Validation}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={permissionConfig.name}
						onChange={(value: string) => {
							permissionConfig.name = value;
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
						value={permissionConfig.dataChain}
						onChange={(value: string) => {
							permissionConfig.dataChain = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{permissionConfig && permissionConfig.dataChain ? (
					<DataChainOptions
						methods={this.props.methods}
						methodDescription={this.props.methodDescription}
						currentDescription={mountingItem}
						onContext={this.props.onContext}
						dataChainType={DataChainType.Permission}
						previousEffect={this.props.previousEffect}
						dataChainOptions={permissionConfig.dataChainOptions}
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
						title={`Build Datachain`}
						onClick={() => {
							if (permissionConfig) {
								if (mountingItem) {
									let { methodDescription } = mountingItem;
									if (methodDescription) {
										BuildDataChainAfterEffectConverter(
											{
												name: permissionConfig.name,
												from: methodDescription,
												dataChain: permissionConfig.dataChain,
												type: DataChainType.Permission,
												afterEffectOptions: permissionConfig.dataChainOptions,
												methods: this.props.methods,
												routes: this.props.routes
											},
											(dataChain: Node) => {
												permissionConfig.dataChain = dataChain.id;
												this.setState({
													turn: UIA.GUID()
												});
											}
										);
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
