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
				innerStyle={{ maxHeight: 300, overflowY: 'auto' }}
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
								dataChainOptions: {}
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(executions || []).map((executionConfig: ExecutionConfig, index: number) => {
					return (
						<ExecutionComponentItem
							key={executionConfig.id}
							title={Titles.Execution}
							methodDescription={index && mountingItem ? null : mountingItem.methodDescription}
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
