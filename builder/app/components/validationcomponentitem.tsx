// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import SelectInput from './selectinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import { MountingDescription, ValidationConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import DataChainOptions from './datachainoptions';

export default class ValidationComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let validationConfig: ValidationConfig = this.props.validationConfig;
		if (!validationConfig) {
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
				title={validationConfig.name || this.props.title || Titles.Validation}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={validationConfig.name}
						onChange={(value: string) => {
							validationConfig.name = value;
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
						value={validationConfig.dataChain}
						onChange={(value: string) => {
							validationConfig.dataChain = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{validationConfig && validationConfig.dataChain ? (
					<DataChainOptions
						methods={this.props.methods}
						methodDescription={this.props.methodDescription}
						currentDescription={mountingItem}
						dataChainType={this.props.dataChainType || DataChainType.Validation}
						previousEffect={this.props.previousEffect}
						dataChainOptions={validationConfig.dataChainOptions}
					/>
				) : null}
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Delete}`}
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
							if (validationConfig) {
								if (mountingItem) {
									let { methodDescription } = mountingItem;
									if (methodDescription) {
										BuildDataChainAfterEffectConverter(
											{
												name: validationConfig.name,
												from: methodDescription,
												dataChain: validationConfig.dataChain,
												type: this.props.dataChainType || DataChainType.Validation,
												afterEffectOptions: validationConfig.dataChainOptions,
												methods: this.props.methods,
                        routes: this.props.routes
											},
											(dataChain: Node) => {
												validationConfig.dataChain = dataChain.id;
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
