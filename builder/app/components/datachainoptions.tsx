// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiActions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	MethodDescription,
	CheckAfterEffectDataChainConfiguration,
	DataChainConfiguration,
	ValidationColors
} from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import CheckExistanceConfig from './checkexistenceconfig';
import GetExistanceConfig from './getexistenceconfig';
import SetPropertiesConfig from './setpropertiesconfig';
import SwaggerCallConfig from './swaggercallconfig';
import CopyConfigComponent from './copyconfig';
import SetIntegerComponent from './setinteger';
import SetBooleanComponent from './setbooleancomponent';
import IncrementIntegerComponent from './incrementinteger';
import IncrementDoubleComponent from './incrementdouble';
import CopyEnumeration from './copyenumeration';
import SimpleValidationsComponent from './simplevalidationsconfig';
import ConcatenateStringConfigComponent from './concatenatstringconfigcomponent';
import PropertyOperation from './propertyoperation';

export default class DataChainOptions extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		if (!dataChainOptions) {
			return <span />;
		}

		let currentDescription: MountingDescription = this.props.currentDescription;
		if (!currentDescription || !currentDescription.methodDescription) {
			return <span />;
		}
		let methodDescription: MethodDescription = currentDescription.methodDescription;
		let onchange = () => {
			this.setState({
				turn: UIA.GUID()
			});
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
		let valid = CheckAfterEffectDataChainConfiguration(dataChainOptions);

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				color={valid ? ValidationColors.Ok : ValidationColors.Neutral}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				error={!valid}
				title={Titles.Configuration}
			>
				<CheckExistanceConfig
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<CopyConfigComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<CopyEnumeration
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<ConcatenateStringConfigComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<PropertyOperation
					getOperationConfig={(dataChainOptions: DataChainConfiguration) => {
						return dataChainOptions.concatenateCollection;
					}}
					title={Titles.ConcatenateCollection}
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<SetIntegerComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				{/* <CompareEnumeration
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<CompareEnumerations
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/> */}
				<SetBooleanComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<IncrementDoubleComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<IncrementIntegerComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<SimpleValidationsComponent
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					onContext={this.props.onContext}
					name={this.props.name}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<GetExistanceConfig
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<SetPropertiesConfig
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<SwaggerCallConfig
					dataChainType={this.props.dataChainType}
					methodDescription={methodDescription}
					dataChainOptions={dataChainOptions}
					onChange={onchange}
				/>
				<TreeViewButtonGroup />
			</TreeViewMenu>
		);
	}
}
