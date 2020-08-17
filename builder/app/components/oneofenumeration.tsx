// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import TreeViewMenu from './treeviewmenu';
import { EnumerationConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';
import { NodesByType, GetNodeProp } from '../methods/graph_methods';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';

export default class OneOfEnumerationComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let props: any = this.props;
		let { enumerationConfig }: { enumerationConfig: EnumerationConfig } = props;
		let enumerations: { id: string; value: string }[] = [];
		if (enumerationConfig && enumerationConfig.enumerationType) {
			enumerations = GetNodeProp(enumerationConfig.enumerationType, NodeProperties.Enumeration);
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={enumerationConfig.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				hide={!this.props.enabled}
				greyed={!enumerationConfig.enabled}
				title={this.props.title}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Enabled}
						value={enumerationConfig.enabled}
						onChange={(value: boolean) => {
							enumerationConfig.enabled = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<SelectInput
					label={Titles.Enumeration}
					options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Enumeration).toNodeSelect()}
					value={enumerationConfig.enumerationType}
					onChange={(val: string) => {
						enumerationConfig.enumerationType = val;
						this.setState({
							turn: UIA.GUID()
						});
						if (this.props.onChange) {
							this.props.onChange();
						}
					}}
				/>
				<TreeViewMenu
					open={this.state.openChecks}
					icon={enumerationConfig.enabled ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
					onClick={() => {
						this.setState({ openChecks: !this.state.openChecks });
					}}
					active
					title={Titles.OneOf}
				>
					{enumerations.map((enumer: { id: string; value: string }) => {
						return (
							<TreeViewItemContainer key={`enumer-${enumer.id}`}>
								<CheckBox
									label={enumer.value}
									value={enumerationConfig.enumerations.indexOf(enumer.id) !== -1}
									onChange={(val: boolean) => {
										enumerationConfig.enumerations = enumerationConfig.enumerations || [];
										if (val) {
											enumerationConfig.enumerations.push(enumer.id);
											enumerationConfig.enumerations = enumerationConfig.enumerations.unique();
										} else {
											enumerationConfig.enumerations = enumerationConfig.enumerations.filter(
												(v) => v !== enumer.id
											);
										}
										this.setState({
											turn: UIA.GUID()
										});
										if (this.props.onChange) {
											this.props.onChange();
										}
									}}
								/>
							</TreeViewItemContainer>
						);
					})}
				</TreeViewMenu>
			</TreeViewMenu>
		);
	}
}
