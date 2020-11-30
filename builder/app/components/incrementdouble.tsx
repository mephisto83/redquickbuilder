// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import {
	DataChainConfiguration,
	SetInteger,
	MethodDescription,
	SetupConfigInstanceInformation
} from '../interface/methodprops';
import SetterComponent from './settercomponent';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import { GUID } from '../actions/uiActions';
import SelectInput from './selectinput';

export default class IncrementDoubleComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}

		let { incrementDouble } = this.setupInstanceInfo(dataChainOptions);
		return (
			<SetterComponent
				getFromInfo={(temp: { incrementDouble: SetInteger }) => {
					return temp.incrementDouble;
				}}
				methodDescription={this.props.methodDescription}
				dataChainType={this.props.dataChainType}
				dataChainOptions={dataChainOptions}
				title={Titles.IncrementInteger}
        onChange={() => {
          if (this.props.onChange) {
            this.props.onChange();
          }
        }}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Value}
						value={incrementDouble.value}
						onChange={(value: string) => {
							incrementDouble.value = value;
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
