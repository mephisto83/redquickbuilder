// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import {
	DataChainConfiguration,
	SetInteger,
	MethodDescription,
	SetupConfigInstanceInformation
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

export default class CompareEnumeration extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}

		let { compareEnumeration } = this.setupInstanceInfo(dataChainOptions);
		return (
			<CompareComponent
				getFromInfo={(temp: { compareEnumeration: SetInteger }) => {
					return temp.compareEnumeration;
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
						options={(GetNodeProp(compareEnumeration.enumeration, NodeProperties.Enumeration) || [])
							.map((v: { value: string; id: string }) => ({ id: v.id, value: v.id, title: v.value }))}
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
			</CompareComponent>
		);
	}
	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
