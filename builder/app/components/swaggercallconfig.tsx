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
import { NodesByType, GUID } from '../actions/uiactions';
import SelectInput from './selectinput';
import { NodeTypes, LinkType } from '..//constants/nodetypes';
import { GetCurrentGraph } from '../../visi_blend/dist/app/actions/uiactions';
import { GetNodesLinkedTo } from '../methods/graph_methods';
import SwaggerCallParameters from './swaggercallparameters';

export default class SwaggerCallConfig extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}

		let { swaggerCall } = this.setupInstanceInfo(dataChainOptions);
		return (
			<SetterComponent
				getFromInfo={(temp: { setInteger: SetInteger }) => {
					return temp.setInteger;
				}}
				methodDescription={this.props.methodDescription}
				dataChainType={this.props.dataChainType}
				dataChainOptions={dataChainOptions}
				title={Titles.SwaggerCall}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={swaggerCall.name}
						onChange={(value: string) => {
							swaggerCall.name = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Swagger}
						value={swaggerCall.swagger}
						options={NodesByType(null, NodeTypes.Swagger).toNodeSelect()}
						onChange={(value: string) => {
							swaggerCall.swagger = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.SwaggerApiPath}
						value={swaggerCall.swaggerApiPath}
						options={GetNodesLinkedTo(GetCurrentGraph(), {
							link: LinkType.SwaggerPaths,
							id: swaggerCall.swagger
						}).toNodeSelect()}
						onChange={(value: string) => {
							swaggerCall.swaggerApiPath = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.SwaggerApiDescription}
						value={swaggerCall.swaggerApiDescription}
						options={GetNodesLinkedTo(GetCurrentGraph(), {
							link: LinkType.SwaggerMethodDescription,
							id: swaggerCall.swaggerApiPath
						}).toNodeSelect()}
						onChange={(value: string) => {
							swaggerCall.swaggerApiDescription = value;
							this.setState({
								turn: GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<SwaggerCallParameters
          swaggerCall={swaggerCall}
					dataChainType={this.props.dataChainType}
					methodDescription={this.props.methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
			</SetterComponent>
		);
	}
	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
