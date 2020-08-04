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
import { GUID } from '../actions/uiactions';
import SelectInput from './selectinput';

export default class IncrementIntegerComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}

		let { incrementInteger } = this.setupInstanceInfo(dataChainOptions);
		return (
			<SetterComponent
				getFromInfo={(temp: { incrementInteger: SetInteger }) => {
					return temp.incrementInteger;
				}}
				methodDescription={this.props.methodDescription}
				dataChainType={this.props.dataChainType}
				dataChainOptions={dataChainOptions}
				title={Titles.IncrementInteger}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Value}
						value={incrementInteger.value}
						onChange={(value: string) => {
							incrementInteger.value = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
			</SetterComponent>
		);
	}
	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
