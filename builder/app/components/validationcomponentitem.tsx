// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import SelectInput from './selectinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import { MountingDescription, ValidationConfig } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties, Methods } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import DataChainOptions from './datachainoptions';
import { GetNodeProp } from '../methods/graph_methods';
import Typeahead from './typeahead';
import CheckBox from './checkbox';
import { MethodFunctions } from '../constants/functiontypes';

export default class ValidationComponentItem extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = { override: true };
	}
	render() {
		let validationConfig: ValidationConfig = this.props.validationConfig;
		if (!validationConfig) {
			return <span />;
		}
		let originalConfig = GetNodeProp(validationConfig.dataChain, NodeProperties.OriginalConfig);
		let mountingItem: MountingDescription = this.props.mountingItem;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={'fa fa-circle-o'}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={this.props.otitle || validationConfig.name || this.props.title || Titles.Validation}
			>
				<TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={validationConfig.name}
						onChange={(value: string) => {
							validationConfig.name = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				<TreeViewItemContainer>
					<Typeahead
						label={Titles.DataChain}
						nodeSelect={(v: string) => {
							let node: Node = UIA.GetNodeById(v);
							if (node) {
								return UIA.GetNodeTitle(node);
							}
							return v;
						}}
						options={UIA.NodesByType(null, NodeTypes.DataChain).toNodeSelect()}
						value={validationConfig.dataChain}
						onChange={(value: string) => {
							if (UIA.GetNodeById(value)) {
								validationConfig.dataChain = value;
								validationConfig.name = UIA.GetNodeTitle(value);

								this.setState({
									turn: UIA.GUID()
								});
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
					/>
				</TreeViewItemContainer>
				{originalConfig && originalConfig !== validationConfig.id ? null : validationConfig &&
				validationConfig.dataChain ? (
					<DataChainOptions
						methods={this.props.methods}
            onContext={this.props.onContext}
            name={validationConfig.name}
						methodDescription={this.props.methodDescription}
						currentDescription={mountingItem}
						dataChainType={this.props.dataChainType || DataChainType.Validation}
						previousEffect={this.props.previousEffect}
						dataChainOptions={validationConfig.dataChainOptions}
					/>
				) : null}
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Delete}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
								if (this.props.onChange) {
									this.props.onChange();
								}
							}
						}}
						icon="fa fa-minus"
					/>
					{originalConfig && originalConfig !== validationConfig.id ? null : (
						<TreeViewGroupButton
							title={`Build Datachain`}
							onClick={() => {
								if (validationConfig) {
									if (mountingItem) {
										let { methodDescription } = mountingItem;
										if (methodDescription) {
											BuildDataChainAfterEffectConverter(
												{
													name: validationConfig.name,
													from: methodDescription,
													dataChain: validationConfig.dataChain,
													type: this.props.dataChainType || DataChainType.Validation,
													afterEffectOptions: validationConfig.dataChainOptions,
													methods: this.props.methods,
													routes: this.props.routes,
													override: this.state.override
												},
												(dataChain: Node) => {
													if (dataChain && UIA.GetNodeById(dataChain.id)) {
														validationConfig.dataChain = dataChain.id;
														if (!GetNodeProp(dataChain.id, NodeProperties.OriginalConfig)) {
															UIA.updateComponentProperty(
																dataChain.id,
																NodeProperties.OriginalConfig,
																validationConfig.id
															);
														}
														this.setState({
															turn: UIA.GUID()
														});
													}
												}
											);
										}
									}
								}
							}}
							icon="fa fa-gears"
						/>
					)}
					<TreeViewGroupButton
						title={`Auto Name`}
						onClick={() => {
							if (validationConfig) {
								if (mountingItem) {
									let { methodDescription, viewType } = mountingItem;
									if (methodDescription && MethodFunctions[methodDescription.functionType]) {
										let { method } = MethodFunctions[methodDescription.functionType];
										switch (this.props.dataChainType || DataChainType.Validation) {
											case DataChainType.Permission:
												validationConfig.name = `Can ${MethodFunctions[
													methodDescription.functionType
												].titleTemplate(
													UIA.GetNodeTitle(
														methodDescription.properties.model_output ||
															methodDescription.properties.model
													),
													UIA.GetNodeTitle(methodDescription.properties.agent)
												)} Permission For ${viewType}`;
												this.setState({ turn: UIA.GUID() });
                        break;
                      case DataChainType.Validation:
												validationConfig.name = `${MethodFunctions[
													methodDescription.functionType
												].titleTemplate(
													UIA.GetNodeTitle(
														methodDescription.properties.model_output ||
															methodDescription.properties.model
													),
													UIA.GetNodeTitle(methodDescription.properties.agent)
												)} Validation For ${viewType}`;
												this.setState({ turn: UIA.GUID() });
                        break;
											case DataChainType.Filter:
												validationConfig.name = `${MethodFunctions[
													methodDescription.functionType
												].titleTemplate(
													UIA.GetNodeTitle(
														methodDescription.properties.model_output ||
															methodDescription.properties.model
													),
													UIA.GetNodeTitle(methodDescription.properties.agent)
												)} Filter For ${viewType}`;
												this.setState({ turn: UIA.GUID() });
												break;
										}
									}
								}
							}
						}}
						icon="fa fa-amazon"
					/>
					<TreeViewItemContainer>
						<CheckBox
							label={'Override'}
							value={this.state.override}
							onChange={(val: boolean) => {
								this.setState({ override: val });
							}}
						/>
					</TreeViewItemContainer>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
