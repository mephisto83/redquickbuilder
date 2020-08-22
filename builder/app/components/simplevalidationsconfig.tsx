// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import {
	AfterEffect,
	TargetMethodType,
	EffectDescription,
	MountingDescription,
	MethodDescription,
	DataChainConfiguration,
	CreateCheckExistence,
	RelationType,
	SkipSettings,
	CheckIsExisting,
	CheckExistenceConfig,
	SetupConfigInstanceInformation,
	CheckSimpleValidation,
	SimpleValidationConfig,
	CreateSimpleValidation,
	CreateOneOf,
	SimpleValidationsConfiguration,
	AddNewNodeToComposition,
	AddLinkBetweenCompositionNodes,
	RemoveNodeFromComposition,
	RemoveLinkFromComposition,
	ChangeNodeType,
	ChangeNodeProp,
	AddNewSimpleValidationConfigToGraph,
	GetSimpleValidationId
} from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiactions';
import { Node } from '../methods/graph_types';
import BuildDataChainAfterEffectConverter, {
	DataChainType
} from '../nodepacks/datachain/BuildDataChainAfterEffectConverter';
import { mount } from 'enzyme';
import ReturnSettings from './returnsettings';
import DataChainOptions from './datachainoptions';
import RelativeTypeComponent from './relativetypecomponent';
import BooleanConfigComponent from './booleanconfigcomponent';
import NumberConfigComponent from './numberconfigcomponent';
import OneOfEnumerationComponent from './oneofenumeration';
import SimpleValidationComponent from './simplevalidationconfig';
import GraphComponent from './graphcomponent';
import { GetNodeProp, NodesByType } from '../methods/graph_methods';

export default class SimpleValidationsComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	render() {
		let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
		let ok = false;
		let isValidation = false;
		switch (this.props.dataChainType) {
			case DataChainType.Validation:
			case DataChainType.Filter:
			case DataChainType.Permission:
				isValidation = true;
				ok = true;
				break;
		}
		if (!dataChainOptions || !ok) {
			return <span />;
		}

		let {
			methodDescription,
			simpleValidations,
			simpleValidationConfiguration,
			properties,
			targetProperties
		}: {
			methodDescription: MethodDescription;
			simpleValidations: SimpleValidationConfig[];
			simpleValidationConfiguration: SimpleValidationsConfiguration;
			properties: any[];
			targetProperties: any[];
		} = this.setupInstanceInfo(dataChainOptions);
		let canAddLink =
			GetNodeProp(
				this.state.selectedNode,
				NodeProperties.NODEType,
				simpleValidationConfiguration.composition.graph
			) !== NodeTypes.LeafNode;
		return (
			<TreeViewMenu
				open={this.state.open}
				icon={
					!simpleValidations.some((v) => !CheckSimpleValidation(v)) ? (
						'fa fa-check-circle-o'
					) : (
						'fa fa-circle-o'
					)
				}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				greyed={!simpleValidations.some((v) => v.enabled)}
				title={Titles.SimpleValidation}
			>
				<TreeViewItemContainer>
					<CheckBox
						title={Titles.EnableComposition}
						label={Titles.EnableComposition}
						value={simpleValidationConfiguration.enabled}
						onChange={(val: boolean) => {
							simpleValidationConfiguration.enabled = val;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>

				<TreeViewMenu
					open={this.state.graph}
					hide={!simpleValidationConfiguration.enabled}
					icon={'fa  fa-bar-chart'}
					onClick={() => {
						this.setState({ graph: !this.state.graph });
						if (this.props.onContext) {
							this.props.onContext({
								largerPlease: !this.state.graph
							});
						}
					}}
					active
					greyed={!simpleValidations.some((v) => v.enabled)}
					title={Titles.SimpleValidation}
				>
					<TreeViewButtonGroup>
						{false ? null : (
							<TreeViewGroupButton
								title={`${Titles.Add} Node`}
								onClick={() => {
									simpleValidationConfiguration.composition.graph = AddNewNodeToComposition(
										simpleValidationConfiguration.composition.graph
									);
									this.setState({ turn: UIA.GUID() });
									if (this.props.onChange) {
										this.props.onChange();
									}
								}}
								icon="fa fa-plus-square"
							/>
						)}
						{!this.state.selectedNode ? null : (
							<TreeViewGroupButton
								title={`${Titles.Remove} Node`}
								onClick={() => {
									if (
										this.state.selectedNode &&
										!GetNodeProp(
											this.state.selectedNode,
											NodeProperties.IsRoot,
											simpleValidationConfiguration.composition.graph
										)
									)
										simpleValidationConfiguration.composition.graph = RemoveNodeFromComposition(
											simpleValidationConfiguration.composition.graph,
											this.state.selectedNode
										);
									this.setState({ turn: UIA.GUID(), selectedNode: null });
									if (this.props.onChange) {
										this.props.onChange();
									}
								}}
								icon="fa  fa-minus-square"
							/>
						)}
						{!this.state.selectedNode ? null : (
							<TreeViewGroupButton
								title={`${Titles.OrNode}`}
								onClick={() => {
									if (
										this.state.selectedNode &&
										!GetNodeProp(
											this.state.selectedNode,
											NodeProperties.IsRoot,
											simpleValidationConfiguration.composition.graph
										)
									) {
										simpleValidationConfiguration.composition.graph = ChangeNodeType(
											simpleValidationConfiguration.composition.graph,
											this.state.selectedNode,
											NodeTypes.ORNode
										);
										simpleValidationConfiguration.composition.graph = ChangeNodeProp(
											simpleValidationConfiguration.composition.graph,
											this.state.selectedNode,
											NodeProperties.UIText,
											Titles.OrNode
										);
										this.setState({ turn: UIA.GUID() });
										if (this.props.onChange) {
											this.props.onChange();
										}
									}
								}}
								icon="fa fa-thumbs-o-up"
							/>
						)}
						{!this.state.selectedNode ? null : (
							<TreeViewGroupButton
								title={`${Titles.ANDNode}`}
								onClick={() => {
									if (
										this.state.selectedNode &&
										!GetNodeProp(
											this.state.selectedNode,
											NodeProperties.IsRoot,
											simpleValidationConfiguration.composition.graph
										)
									) {
										simpleValidationConfiguration.composition.graph = ChangeNodeType(
											simpleValidationConfiguration.composition.graph,
											this.state.selectedNode,
											NodeTypes.ANDNode
										);
										simpleValidationConfiguration.composition.graph = ChangeNodeProp(
											simpleValidationConfiguration.composition.graph,
											this.state.selectedNode,
											NodeProperties.UIText,
											Titles.ANDNode
										);
										this.setState({ turn: UIA.GUID() });
										if (this.props.onChange) {
											this.props.onChange();
										}
									}
								}}
								icon="fa fa-thumbs-o-down"
							/>
						)}

						{!canAddLink ? null : (
							<TreeViewGroupButton
								title={`${Titles.Add} Link`}
								onClick={() => {
									this.setState({ linkNext: true, turn: UIA.GUID() });
								}}
								icon="fa fa-anchor"
							/>
						)}
						{this.state.selectedLink ? (
							<TreeViewGroupButton
								title={`${Titles.Remove} Link`}
								onClick={() => {
									if (this.state.selectedLink && this.state.selectedLink.id) {
										simpleValidationConfiguration.composition.graph = RemoveLinkFromComposition(
											simpleValidationConfiguration.composition.graph,
											this.state.selectedLink.id
										);
										this.setState({ linkNext: false, turn: UIA.GUID() });
									}
								}}
								icon="fa  fa-minus-square-o"
							/>
						) : null}
					</TreeViewButtonGroup>
					<TreeViewItemContainer>
						<GraphComponent
							linkDistance={150}
							minHeight={500}
							onNodeClick={(nodeId: string, boundingBox: any) => {
								let currentSelected = this.state.selectedNode ? this.state.selectedNode : null;
								if (this.state.linkNext && currentSelected) {
									if (currentSelected != nodeId) {
										simpleValidationConfiguration.composition.graph = AddLinkBetweenCompositionNodes(
											simpleValidationConfiguration.composition.graph,
											currentSelected,
											nodeId
										);
									}
									this.setState({ linkNext: false });
								} else {
									this.setState({ selectedNode: nodeId });
								}
							}}
							onLinkClick={(linkId: any, boundingBox: any) => {
								this.setState({ selectedLink: this.state.selectedLink === linkId ? null : linkId });
							}}
							selectedColor={UIA.Colors.SelectedNode}
							markedColor={UIA.Colors.MarkedNode}
							selectedLinks={this.state.selectedLink ? [ this.state.selectedLink ] : []}
							selectedNodes={this.state.selectedNode ? [ this.state.selectedNode ] : []}
							graph={simpleValidationConfiguration.composition.graph}
						/>
					</TreeViewItemContainer>
				</TreeViewMenu>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.Add}`}
						onClick={() => {
							simpleValidations.push(CreateSimpleValidation());
							this.setState({ turn: UIA.GUID() });
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-plus"
					/>{' '}
					<TreeViewGroupButton
						title={`${Titles.Copy}`}
						onClick={() => {
							UIA.CopyToContext(
								simpleValidations,
								UIA.CopyType.SimpleValidations,
								methodDescription.properties.model,
								methodDescription.properties.agent,
								this.props.name
							);
						}}
						icon="fa fa-copy"
					/>
					<TreeViewGroupButton
						title={`${Titles.Paste}`}
						onClick={() => {
							let parts = UIA.GetSelectedCopyContext(
								UIA.CopyType.SimpleValidations,
								methodDescription.properties.model,
								methodDescription.properties.agent
							);
							let dataChainOptions: DataChainConfiguration = this.props.dataChainOptions;
							parts.map((v) => {
								dataChainOptions.simpleValidations = dataChainOptions.simpleValidations || [];
								dataChainOptions.simpleValidations.push(...v.obj);
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-paste"
					/>
				</TreeViewButtonGroup>
				{simpleValidations.map((simpleValidation: SimpleValidationConfig, index: number) => {
					return (
						<SimpleValidationComponent
							key={`${index}-simple-validations`}
							simpleValidationConfiguration={simpleValidationConfiguration}
							name={this.props.name}
							onValidationAdd={(validationId: string) => {
								let name = GetSimpleValidationId(simpleValidation, properties);
								simpleValidationConfiguration.composition.graph = AddNewSimpleValidationConfigToGraph(
									simpleValidationConfiguration.composition.graph,
									validationId,
									name
								);
								this.setState({ turn: UIA.GUID() });
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							onChange={(id: string) => {
								if (
									simpleValidationConfiguration &&
									simpleValidationConfiguration.composition &&
									simpleValidationConfiguration.composition.graph
								) {
									let configNode: Node = NodesByType(
										simpleValidationConfiguration.composition.graph,
										[ NodeTypes.LeafNode ],
										{ skipCache: true }
									).find((node: Node) => {
										return GetNodeProp(node, NodeProperties.ValidationConfigurationItem) === id;
									});
									if (configNode) {
										UIA.updateComponentProperty(
											configNode.id,
											NodeProperties.UIText,
											GetSimpleValidationId(simpleValidation, properties),
											simpleValidationConfiguration.composition.graph
										);
									}
								}
							}}
							onDelete={() => {
								if (dataChainOptions.simpleValidations) {
									dataChainOptions.simpleValidations = dataChainOptions.simpleValidations.filter(
										(v) => v.id !== simpleValidation.id
									);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							dataChainType={this.props.dataChainType}
							simpleValidation={simpleValidation}
							dataChainOptions={dataChainOptions}
							methodDescription={methodDescription}
							properties={properties}
							targetProperties={targetProperties}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}

	private setupInstanceInfo(dataChainOptions: DataChainConfiguration) {
		dataChainOptions.simpleValidation = dataChainOptions.simpleValidation || CreateSimpleValidation();
		let methodDescription: MethodDescription = this.props.methodDescription;
		return SetupConfigInstanceInformation(dataChainOptions, methodDescription);
	}
}
