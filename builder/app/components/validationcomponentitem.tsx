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
		if (validationConfig.autoCalculate === undefined) {
			validationConfig.autoCalculate = true;
		}
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
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.AutoCalculate}
						onChange={(val: boolean) => {
							validationConfig.autoCalculate = val;
						}}
						value={validationConfig.autoCalculate}
					/>
				</TreeViewItemContainer>
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
								let methods = this.props.methods;
								let routes = this.props.routes;
								let dataChainType = this.props.dataChainType;
								let override = this.state.override;
								validationDataChain(
									validationConfig,
									mountingItem,
									dataChainType,
									methods,
									routes,
									override
								);
								this.setState({
									turn: UIA.GUID()
								});
							}}
							icon="fa fa-gears"
						/>
					)}
					<TreeViewGroupButton
						title={`Auto Name`}
						onClick={() => {
							let methods = this.props.methods;
							let routes = this.props.routes;
							let dataChainType = this.props.dataChainType;
							let override = this.state.override;
							autoNameGenerateDataChain(
								validationConfig,
								mountingItem,
								dataChainType,
								methods,
								routes,
								override
							);
							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-amazon"
					/>
					{validationConfig.dataChain ? (
						<TreeViewGroupButton
							icon={'fa fa-hand-grab-o'}
							onClick={() => {
								UIA.SelectNode(validationConfig.dataChain, null)(UIA.GetDispatchFunc());
							}}
						/>
					) : null}
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
			</TreeViewMenu>
		);
	}
}

export function autoNameGenerateDataChain(
	validationConfig: ValidationConfig,
	mountingItem: MountingDescription,
	dataChainType: any,
	methods: any,
	routes: any,
	override: any
) {
	autoName(validationConfig, mountingItem, {
		dataChainType: dataChainType,
		functionName: mountingItem.name
	});
	validationDataChain(validationConfig, mountingItem, dataChainType, methods, routes, override);
}

export function validationDataChain(
	validationConfig: ValidationConfig,
	mountingItem: MountingDescription,
	dataChainType: any,
	methods: any,
	routes: any,
	override: any
) {
	if (validationConfig) {
		if (mountingItem) {
			let { methodDescription } = mountingItem;
			if (methodDescription) {
				BuildDataChainAfterEffectConverter(
					{
						name: validationConfig.name,
						from: methodDescription,
						dataChain: validationConfig.dataChain,
						type: dataChainType || DataChainType.Validation,
						afterEffectOptions: validationConfig.dataChainOptions,
						methods: methods,
						routes: routes,
						override: override,
						validationConfig
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
						}
					}
				);
			}
		}
	}
}

export function autoName(
	validationConfig: ValidationConfig,
	mountingItem: MountingDescription,
	props: {
		dataChainType: DataChainType;
		functionName: string;
	}
) {
	let { functionName } = props;
	if (validationConfig) {
		if (mountingItem) {
			let { methodDescription, viewType } = mountingItem;
			if (methodDescription && MethodFunctions[methodDescription.functionType]) {
				let { method } = MethodFunctions[methodDescription.functionType];

				switch (props.dataChainType || DataChainType.Validation) {
					case DataChainType.Permission:
						if (functionName) {
							validationConfig.name = `Can ${functionName} Permission For ${viewType}`;
						} else {
							validationConfig.name = `Can ${MethodFunctions[
								methodDescription.functionType
							].titleTemplate(
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								),
								UIA.GetNodeTitle(methodDescription.properties.agent)
							)} Permission For ${viewType}`;
						}
						break;
					case DataChainType.Validation:
						if (functionName) {
							validationConfig.name = `${functionName} Validation For ${viewType}`;
						} else {
							validationConfig.name = `${MethodFunctions[methodDescription.functionType].titleTemplate(
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								),
								UIA.GetNodeTitle(methodDescription.properties.agent)
							)} Validation For ${viewType}`;
						}
						break;
					case DataChainType.Filter:
						if (functionName) {
							validationConfig.name = `${functionName} Filter For ${viewType}`;
						} else {
							validationConfig.name = `${MethodFunctions[methodDescription.functionType].titleTemplate(
								UIA.GetNodeTitle(
									methodDescription.properties.model_output || methodDescription.properties.model
								),
								UIA.GetNodeTitle(methodDescription.properties.agent)
							)} Filter For ${viewType}`;
						}
						break;
				}
			}
		}
	}
}
