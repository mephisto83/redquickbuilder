// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import { MountingDescription, ExecutionConfig } from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ExecutionComponentItem from './executioncomponentitem';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import TreeViewItemContainer from './treeviewitemcontainer';
import CheckBox from './checkbox';

export default class ExecutionComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let mountingItem: MountingDescription = this.props.mountingItem;
		mountingItem.executions = mountingItem.executions || [];
		let { executions } = mountingItem;

		return (
			<TreeViewMenu
				open={this.state.open}
				color={executions && executions.length ? '#F0386B' : ''}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Executions}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddAfterMethods}`}
						onClick={() => {
							executions.push({
								id: UIA.GUID(),
								name: '',
								dataChain: '',
								enabled: true,
								dataChainOptions: {}
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
					<TreeViewGroupButton
						title={`${Titles.Paste}`}
						onClick={() => {
							let methodDescription = this.props.methodDescription;
							if (methodDescription) {
								let parts = UIA.GetSelectedCopyContext(
									UIA.CopyType.ExecutionConfig,
									methodDescription.properties.model,
									methodDescription.properties.agent
								);
								executions.push(...parts.map((v) => v.obj));
								this.setState({ turn: UIA.GUID() });
							}
						}}
						icon="fa fa-paste"
					/>
				</TreeViewButtonGroup>
				<TreeViewItemContainer>
					<CheckBox
						title={Titles.AutoCopy}
						label={Titles.AutoCopy}
						value={mountingItem.autoSetup && mountingItem.autoSetup.executionAutoCopy}
						onChange={(value: boolean) => {
							mountingItem.autoSetup = mountingItem.autoSetup || {};
							mountingItem.autoSetup.executionAutoCopy = value;
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{(executions || []).map((executionConfig: ExecutionConfig, index: number) => {
					return (
						<ExecutionComponentItem
							key={executionConfig.id}
							onContext={this.props.onContext}
							title={Titles.Execution}
							methodDescription={mountingItem.methodDescription}
							mountingItem={mountingItem}
							dataChainType={DataChainType.Execution}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = executions.findIndex((v) => v.id === executionConfig.id);
								if (index !== -1 && executions) {
									if (executionConfig.dataChain) {
										UIA.removeNodeById(executionConfig.dataChain);
									}
									executions.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							executionConfig={executionConfig}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
