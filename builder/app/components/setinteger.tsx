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

export default class SetIntegerComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		let ok = false;
		switch (this.props.dataChainType) {
			case DataChainType.Execution:
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}

		let { setInteger } = this.setupInstanceInfo(dataChainOptions);
		return (
			<SetterComponent
				getFromInfo={(temp: { setInteger: SetInteger }) => {
					return temp.setInteger;
				}}
				dataChainOptions={dataChainOptions}
				title={Titles.SetInteger}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Value}
						value={setInteger.value}
						onChange={(value: string) => {
							setInteger.value = value;
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
