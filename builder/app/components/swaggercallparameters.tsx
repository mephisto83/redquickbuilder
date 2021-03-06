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
import TreeViewMenu from './treeviewmenu';
import SwaggerCallParameter from './swaggercallparameter';

export default class SwaggerCallParameters extends Component<any, any> {
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
			>
				{swaggerCall.swaggerParameters ? (
					swaggerCall.swaggerParameters.map((swaggerParameter: SwaggerParameterConfig) => {
						return (
							<SwaggerCallParameter
								swaggerCall={swaggerCall}
								swaggerParameter={swaggerParameter}
								dataChainType={this.props.dataChainType}
								methodDescription={this.props.methodDescription}
								dataChainOptions={dataChainOptions}
								onChange={onchange}
							/>
						);
					})
				) : null}
			</TreeViewMenu>
		);
	}
}
