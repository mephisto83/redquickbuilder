// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import {
	MountingDescription,
	MethodDescription,
	CheckAfterEffectDataChainConfiguration,
	DataChainConfiguration,
	NextStepConfiguration,
	CheckNextStepConfiguration,
	ConstructModelConfig,
	CheckConstructModel,
	SetProperty,
	CreateSetProperty
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
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectSetupProperty from './aftereffectsetproperty';

export default class ConstructModelConfiguration extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let constructModel: ConstructModelConfig = this.props.constructModel;
		if (!constructModel) {
			return <span />;
		}

		let methodDescription: MountingDescription = this.props.methodDescription;
		if (!methodDescription) {
			return <span />;
		}
		let onchange = () => {
			this.setState({
				turn: UIA.GUID()
			});
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
		let valid = CheckConstructModel(constructModel);

		return (
			<TreeViewMenu
				open={this.state.open}
				icon={valid ? 'fa fa-check-circle-o' : 'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				error={!valid}
				title={'Construct Model Config'}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.NextStep}`}
						onClick={() => {
							constructModel.setProperties.properties.push(CreateSetProperty());
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{constructModel.setProperties.properties ? (
					constructModel.setProperties.properties.map((setProperty: SetProperty) => {
						return (
							<AfterEffectSetupProperty
								key={setProperty.id}
                setProperty={setProperty}
                onChange={onchange}
								onDelete={() => {
									constructModel.setProperties.properties = constructModel.setProperties.properties.filter(
										(v) => v.id !== setProperty.id
									);
								}}
							/>
						);
					})
				) : null}{' '}
			</TreeViewMenu>
		);
	}
}
