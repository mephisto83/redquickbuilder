// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import {
	DataChainConfiguration,
	SetInteger,
	MethodDescription,
	SetupConfigInstanceInformation,
	CompareEnumeration,
	CreateCompareEnumeration,
	CheckSetter
} from '../interface/methodprops';
import { DataChainType } from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import SetterComponent from './settercomponent';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import { GUID, GetCurrentGraph, GetNodeProp } from '../actions/uiactions';
import CompareComponent from './comparecomponent';
import SelectInput from './selectinput';
import { NodesByType } from '../methods/graph_methods';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewMenu from './treeviewmenu';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';

export default class CompareEnumerations extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}

		let { compareEnumerations } = this.setupInstanceInfo(dataChainOptions);
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={
					compareEnumerations.some((setter) => !CheckSetter(setter)) ? (
						'fa fa-check-circle-o'
					) : (
						'fa fa-circle-o'
					)
				}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={Titles.MatchPropertyToEnum}
			>
				{compareEnumerations.map((compareEnumeration: CompareEnumeration) => {
					return (
						<CompareComponent
							getFromInfo={(temp: { compareEnumeration: SetInteger }) => {
								return compareEnumeration;
							}}
							methodDescription={this.props.methodDescription}
							dataChainType={this.props.dataChainType}
							dataChainOptions={dataChainOptions}
							title={Titles.CompareEnumeration}
						>
							<TreeViewItemContainer>
								<SelectInput
									options={NodesByType(GetCurrentGraph(), NodeTypes.Enumeration).toNodeSelect()}
									label={Titles.Enumeration}
									value={compareEnumeration.enumeration}
									onChange={(value: string) => {
										compareEnumeration.enumeration = value;
										this.setState({
											turn: GUID()
										});
										if (this.props.onChange) {
											this.props.onChange();
										}
									}}
								/>
							</TreeViewItemContainer>{' '}
							<TreeViewItemContainer>
								<SelectInput
									options={(GetNodeProp(compareEnumeration.enumeration, NodeProperties.Enumeration) ||
										[])
										.map((v: { value: string; id: string }) => ({
											id: v.id,
											value: v.id,
											title: v.value
										}))}
									label={Titles.Enumeration}
									value={compareEnumeration.value}
									onChange={(value: string) => {
										compareEnumeration.value = value;
										this.setState({
											turn: GUID()
										});
										if (this.props.onChange) {
											this.props.onChange();
										}
									}}
								/>
							</TreeViewItemContainer>
							<TreeViewButtonGroup>
								<TreeViewGroupButton
									title={`Remove`}
									onClick={() => {
										let index = compareEnumerations.findIndex(
											(v) => v.id === compareEnumeration.id
										);
										if (index !== -1) {
											compareEnumerations.splice(index, 1);
										}
										this.setState({ turn: GUID() });
										if (this.props.onChange) {
											this.props.onChange();
										}
									}}
									icon="fa fa-minus"
								/>
							</TreeViewButtonGroup>
						</CompareComponent>
					);
				})}
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`Add`}
						onClick={() => {
							compareEnumerations.push(CreateCompareEnumeration());
							this.setState({ turn: GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
