// @flow
import React, { Component } from 'react';
import * as Titles from './titles';
import {
	DataChainConfiguration,
	SetInteger,
	MethodDescription,
	SetupConfigInstanceInformation,
	SwaggerCall,
	SwaggerParameterConfig
} from '../interface/methodprops';
import SetterComponent from './settercomponent';
import TreeViewItemContainer from './treeviewitemcontainer';
import TextInput from './textinput';
import { NodesByType, GUID } from '../actions/uiactions';
import SelectInput from './selectinput';
import { NodeTypes, LinkType } from '..//constants/nodetypes';
import { GetCurrentGraph } from '../../visi_blend/dist/app/actions/uiactions';
import { GetNodesLinkedTo } from '../methods/graph_methods';
import TreeViewMenu from './treeviewmenu';

export default class SwaggerCallParameter extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;

		if (!dataChainOptions) {
			return <span />;
		}

		let props: any = this.props;
		let { swaggerCall }: { swaggerCall: SwaggerCall } = props;
		if (!swaggerCall.swaggerApiDescription) {
			return <span />;
		}
		swaggerCall.swaggerParameters = swaggerCall.swaggerParameters || [];

		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.Parameters}
			/>
		);
	}
	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
