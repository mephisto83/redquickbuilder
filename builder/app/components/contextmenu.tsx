/* eslint-disable no-case-declarations */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable func-names */
/* eslint-disable default-case */
/* eslint-disable no-shadow */
// @flow
import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
const { clipboard } = require('electron');
import * as Titles from './titles';
import {
	LinkType,
	NodeProperties,
	NodeTypes,
	LAYOUT_VIEW,
	MAIN_CONTENT,
	MIND_MAP,
	CODE_VIEW,
	UITypes,
	LinkProperties,
	LinkPropertyKeys,
	SelectorType,
	DefaultPropertyValueType,
	NodeAttributePropertyTypes
} from '../constants/nodetypes';
import AddNameDescription from '../nodepacks/AddNameDescription';
import GenericPropertyContainer from './genericpropertycontainer';
import ModelContextMenu from './modelcontextmenu';
import ComponentNodeMenu from './componentnodemenu';
import ConditionContextMenu from './conditioncontextmenu';
import TreeViewMenu from './treeviewmenu';
import DataChainContextMenu from './datachaincontextmenu';
import TreeViewGroupButton from './treeviewgroupbutton';
import TreeViewButtonGroup from './treeviewbuttongroup';
import CheckBoxProperty from './checkboxproperty';
import ViewTypeMenu from './viewtypecontextmenu';
import UpdateUserExecutor from '../nodepacks/UpdateUserExecutor';
import { MethodFunctions } from '../constants/functiontypes';
import StoreModelArrayStandard from '../nodepacks/StoreModelArrayStandard';
import LayoutOptions from './layoutoptions';
import { FunctionTemplateKeys } from '../constants/functiontypes';
import NavigateBack from '../nodepacks/NavigateBack';
import TreeViewItemContainer from './treeviewitemcontainer';
import {
	getLinkInstance,
	GetNodesLinkedTo,
	SOURCE,
	existsLinkBetween,
	GetNodeProp,
	GetNodeLinkedTo,
	setupCache,
	GetAllChildren,
	GetLinkBetween,
	getNodeLinks,
	NodesByType,
	existsLinksBetween,
	findLink
} from '../methods/graph_methods';
import SelectInput from './selectinput';
import CheckBox from './checkbox';
import CreateStandardClaimService from '../nodepacks/CreateStandardClaimService';
import GetModelViewModelForList from '../nodepacks/GetModelViewModelForList';
import AddButtonToComponent from '../nodepacks/AddButtonToComponent';
import GetScreenValueParameter from '../nodepacks/GetScreenValueParameter';
import AddComponentMenu from './addcomponentmenu';
import ConnectDataChainToCompontApiConnector from '../nodepacks/ConnectDataChainToCompontApiConnector';
import CreateNavigateToScreenDC from '../nodepacks/CreateNavigateToScreenDC';
import TextInput from './textinput';
import CreateDashboard_1 from '../nodepacks/CreateDashboard_1';
import {
	ComponentTypes,
	SCREEN_COMPONENT_EVENTS,
	ComponentEvents,
	ComponentTags,
	ComponentTypeKeys,
	StyleTags
} from '../constants/componenttypes';
import DataChain_SelectPropertyValue from '../nodepacks/DataChain_SelectPropertyValue';
import CreatePropertiesForFetch from '../nodepacks/CreatePropertiesForFetch';
import AddEvent from '../nodepacks/AddEvent';
import CreateModelPropertyGetterDC from '../nodepacks/CreateModelPropertyGetterDC';
import ReattachComponent from '../nodepacks/ReattachComponent';
import AddTitleToComponent from '../nodepacks/AddTitleToComponent';
import CollectionDataChainsIntoCollections, {
	getComponentLineage,
	getTopComponent,
	getParentCollectionReference,
	getCollectionReference,
	sortComponentByLineage
} from '../nodepacks/CollectionDataChainsIntoCollections';
import AttachDataChainsToViewTypeViewModel from '../nodepacks/AttachDataChainsToViewTypeViewModel';
import ModifyUpdateLinks from '../nodepacks/ModifyUpdateLinks';
import SetInnerApiValueToLocalContextInLists from '../nodepacks/SetInnerApiValueToLocalContextInLists';
import SetupApiBetweenComponents from '../nodepacks/SetupApiBetweenComponents';
import CreateForm from '../nodepacks/CreateForm';
import CopyPermissionConditions from '../nodepacks/CopyPermissionConditions';
import _create_get_view_model from '../nodepacks/_create_get_view_model';
import AddAllPropertiesToExecutor from '../nodepacks/AddAllPropertiesToExecutor';
import AddCopyPropertiesToExecutor from '../nodepacks/AddCopyPropertiesToExecutor';
import NameLikeValidation from '../nodepacks/validation/NameLikeValidation';
import DescriptionLikeValidation from '../nodepacks/validation/DescriptionLikeValidation';
import ScreenConnectGetAll from '../nodepacks/screens/ScreenConnectGetAll';
import ScreenConnectCreate from '../nodepacks/screens/ScreenConnectCreate';
import AddFiltersToGetAll from '../nodepacks/method/AddFiltersToGetAll';
import ScreenConnectUpdate from '../nodepacks/screens/ScreenConnectUpdate';
import ScreenConnectGet from '../nodepacks/screens/ScreenConnectGet';
import ClearExecutor from '../nodepacks/ClearExecutor';
import { ViewTypes } from '../constants/viewtypes';
import SetupViewTypeFor from '../nodepacks/viewtype/SetupViewTypeFor';
import AddMenuToComponent from '../nodepacks/AddMenuToComponent';
import { MenuTreeOptions } from '../constants/menu';
import { GetFunctionToLoadModels, GetValidationMethodForViewTypes } from '../nodepacks/batch/SetupViewTypes';
import { SecondaryOptions } from '../constants/visual';
import SetupEnumerationPermissionTemplate from '../nodepacks/permission/SetupEnumerationPermissionTemplate';
import AddAttributeOfType from '../nodepacks/attributes/AddAttributeOfType';
import { GraphLink, Node } from '../methods/graph_types';
import DuplicateModelsProperties from '../nodepacks/DuplicateModelsProperties';
import DuplicateModel from '../nodepacks/DuplicateModel';
import AddMappingProperty from '../nodepacks/AddMappingProperty';
import BuildReferenceObject from '../nodepacks/BuildReferenceObject';
import BuildNavigationScreen from '../nodepacks/BuildNavigationScreen';
import BuildLowerMenus from '../nodepacks/screens/menus/BuildLowerMenus';
import CreateMirrorMenu from '../nodepacks/screens/menus/CreateMirrorMenu';
import EnumerationLinkMenu from './enumerationlinkmenu';

const MAX_CONTENT_MENU_HEIGHT = 500;
class ContextMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			deleteType: {}
		};
	}

	getMenuMode(mode: any) {
		const result = [ ...this.generalMenu() ];
		const exit = () => {
			this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
		};
		switch (mode) {
			case 'layout':
				result.push(
					<TreeViewMenu open active title={Titles.Layout} toggle={() => {}}>
						<TreeViewMenu
							title={Titles.Layout}
							icon="fa fa-taxi"
							key="layoutview"
							onClick={() => {
								this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
								exit();
							}}
						/>
						<TreeViewMenu
							title={Titles.MindMap}
							icon="fa fa-taxi"
							key="mindmap"
							onClick={() => {
								this.props.setVisual(MAIN_CONTENT, MIND_MAP);
								exit();
							}}
						/>
						<TreeViewMenu
							title={Titles.CodeView}
							icon="fa fa-taxi"
							key="codeview"
							onClick={() => {
								this.props.setVisual(MAIN_CONTENT, CODE_VIEW);
								exit();
							}}
						/>
					</TreeViewMenu>
				);
				break;
			default:
				result.push(...this.getContextMenu());
				break;
		}

		result.push(...this.eventMenu());
		result.push(...this.apiMenu());
		result.push(...this.operations());
		result.push(...this.linkOperations());
		result.push(...this.massMenu());
		return result.filter((x) => x);
	}
	massMenu() {
		let { state } = this.props;
		return [
			<TreeViewMenu
				active
				title={Titles.BatchMenu}
				key={Titles.BatchMenu}
				innerStyle={{
					maxHeight: MAX_CONTENT_MENU_HEIGHT,
					overflowY: 'auto'
				}}
				open={UIA.Visual(state, Titles.BatchMenu)}
				toggle={() => {
					this.props.toggleVisual(Titles.BatchMenu);
				}}
			>
				{this.generateNavigationScreens()}
				{this.minimizeMenu()}
				{this.hideTypeMenu()}
				{this.deleteByTypeMenu()}
			</TreeViewMenu>
		];
	}
	generateNavigationScreens() {
		let result: any = [];
		let { state } = this.props;
		let graph = UIA.GetCurrentGraph();
		result.push(
			<TreeViewMenu
				active
				title={Titles.GenerateNavigationScreen}
				key={Titles.GenerateNavigationScreen}
				innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
				open={UIA.Visual(state, Titles.GenerateNavigationScreen)}
				toggle={() => {
					this.props.toggleVisual(Titles.GenerateNavigationScreen);
				}}
			>
				<TreeViewItemContainer>
					<SelectInput
						options={NodesByType(graph, NodeTypes.Model)
							.filter((x: Node) => GetNodeProp(x, NodeProperties.IsAgent))
							.filter((x: Node) => !GetNodeProp(x, NodeProperties.IsUser))
							.toNodeSelect()}
						label={Titles.Model}
						onChange={(val: string) => {
							this.setState({ agent: val });
						}}
						value={this.state.agent}
					/>
				</TreeViewItemContainer>

				<TreeViewItemContainer>
					<CheckBox
						title={Titles.Management}
						label={Titles.Management}
						onChange={(val: string) => {
							this.setState({ management: val });
						}}
						value={this.state.management}
					/>
				</TreeViewItemContainer>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={Titles.Clear}
						onClick={() => {
							this.setState({ gns: {} });
						}}
						icon="fa fa-bomb"
					/>
					<TreeViewGroupButton
						title={Titles.All}
						onClick={() => {
							let temp: any = {};
							NodesByType(graph, NodeTypes.Model)
								.toNodeSelect()
								.filter((x: any) => !GetNodeProp(x.value, NodeProperties.IsUser))
								.forEach((t: any) => {
									temp[t.value] = true;
								});

							this.setState({ gns: temp });
						}}
						icon="fa fa-soccer-ball-o"
					/>
					<TreeViewGroupButton
						title={'Invert'}
						onClick={() => {
							let temp: any = {};
							NodesByType(graph, NodeTypes.Model)
								.toNodeSelect()
								.filter((x: any) => !GetNodeProp(x.value, NodeProperties.IsUser))
								.forEach((t: any) => {
									temp[t.value] = !this.state.gns[t.value];
								});

							this.setState({ gns: temp });
						}}
						icon="fa fa-gg"
					/>
					<TreeViewGroupButton
						title={Titles.Execute}
						onClick={() => {
							Object.keys(this.state.gns || {}).forEach((id: string) => {
								if (this.state.gns[id])
									BuildNavigationScreen({
										management: this.state.management,
										model: id,
										agent: this.state.agent
									});
							});
						}}
						icon="fa fa-play"
					/>
				</TreeViewButtonGroup>
				<TreeViewMenu
					active
					title={Titles.Models}
					key={Titles.Models}
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT / 2, overflowY: 'auto' }}
					open={UIA.Visual(state, `${Titles.GenerateNavigationScreen} ${Titles.Models}`)}
					toggle={() => {
						this.props.toggleVisual(`${Titles.GenerateNavigationScreen} ${Titles.Models}`);
					}}
				>
					{NodesByType(graph, NodeTypes.Model)
						.toNodeSelect()
						.filter((x: any) => !GetNodeProp(x.value, NodeProperties.IsUser))
						.map((model: any) => {
							let current = this.state.gns || {};
							return (
								<TreeViewItemContainer key={`${model.value}-key`}>
									<CheckBox
										title={UIA.GetNodeTitle(model.value)}
										label={UIA.GetNodeTitle(model.value)}
										onChange={(value: any) => {
											current[model.value] = value;
											this.setState({ gns: current });
										}}
										value={current[model.value]}
									/>
								</TreeViewItemContainer>
							);
						})}
				</TreeViewMenu>
			</TreeViewMenu>
		);
		return result;
	}
	linkOperations() {
		const result = [];
		const { state } = this.props;
		const selectedLink = UIA.Visual(state, UIA.SELECTED_LINK);
		if (selectedLink) {
			const link = getLinkInstance(UIA.GetCurrentGraph(), {
				target: selectedLink.target,
				source: selectedLink.source
			});
			if (link) {
				result.push(
					...[
						<TreeViewMenu
							active
							title={Titles.LinkType}
							key={Titles.LinkType}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							open={UIA.Visual(state, Titles.LinkType)}
							toggle={() => {
								this.props.toggleVisual(Titles.LinkType);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									options={Object.keys(LinkType).sort().map((v) => ({
										title: v,
										value: LinkType[v],
										id: LinkType[v]
									}))}
									label={Titles.LinkType}
									onChange={() => {}}
									value={UIA.GetLinkProperty(link, LinkPropertyKeys.TYPE)}
								/>
							</TreeViewItemContainer>
						</TreeViewMenu>
					]
				);
				const linkType = UIA.GetLinkProperty(link, LinkPropertyKeys.TYPE);
				switch (UIA.GetLinkProperty(link, LinkPropertyKeys.TYPE)) {
					case LinkType.Component:
						result.push(
							<TreeViewMenu
								open={UIA.Visual(state, `linkType coponent`)}
								active
								title={linkType}
								key={`${linkType}${selectedLink.id} componenttag`}
								innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
								toggle={() => {
									this.props.toggleVisual(`linkType coponent`);
								}}
							>
								<TreeViewItemContainer>
									<CheckBox
										label={Titles.AsForm}
										onChange={(value: any) => {
											this.props.graphOperation([
												{
													operation: UIA.UPDATE_LINK_PROPERTY,
													options() {
														return {
															id: link.id,
															prop: LinkPropertyKeys.AsForm,
															value
														};
													}
												}
											]);
										}}
										value={UIA.GetLinkProperty(link, LinkPropertyKeys.AsForm)}
									/>
								</TreeViewItemContainer>
							</TreeViewMenu>
						);
						break;
					case LinkType.Style:
						result.push(
							<TreeViewMenu
								open={UIA.Visual(state, `linkType coponent`)}
								active
								title={linkType}
								key={`${linkType}${selectedLink.id} componenttag`}
								innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
								toggle={() => {
									this.props.toggleVisual(`linkType coponent`);
								}}
							>
								<TreeViewItemContainer>
									<SelectInput
										options={Object.keys(ComponentTags).map((x) => ({
											id: x,
											value: x,
											title: x
										}))}
										label={Titles.LinkType}
										onChange={(value: any) => {
											this.props.graphOperation([
												{
													operation: UIA.UPDATE_LINK_PROPERTY,
													options() {
														return {
															id: link.id,
															prop: LinkPropertyKeys.ComponentTag,
															value
														};
													}
												}
											]);
										}}
										value={UIA.GetLinkProperty(link, LinkPropertyKeys.ComponentTag)}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										options={Object.keys(StyleTags).map((x) => ({
											id: x,
											value: x,
											title: x
										}))}
										label={Titles.LinkType}
										onChange={(value: any) => {
											this.props.graphOperation([
												{
													operation: UIA.UPDATE_LINK_PROPERTY,
													options() {
														return {
															id: link.id,
															prop: LinkPropertyKeys.ComponentStyle,
															value
														};
													}
												}
											]);
										}}
										value={UIA.GetLinkProperty(link, LinkPropertyKeys.ComponentStyle)}
									/>
								</TreeViewItemContainer>
							</TreeViewMenu>
						);
						break;
					case LinkType.AgentAccess:
						result.push(
							<TreeViewMenu
								open={UIA.Visual(state, linkType)}
								active
								title={linkType}
								key={`${linkType}${selectedLink.id}`}
								innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
								toggle={() => {
									this.props.toggleVisual(linkType);
								}}
							>
								<TreeViewItemContainer>
									<CheckBoxProperty title={ViewTypes.Get} link={link} property={ViewTypes.Get} />
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<CheckBoxProperty
										title={ViewTypes.GetAll}
										link={link}
										property={ViewTypes.GetAll}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<CheckBoxProperty
										title={ViewTypes.Create}
										link={link}
										property={ViewTypes.Create}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<CheckBoxProperty
										title={ViewTypes.Update}
										link={link}
										property={ViewTypes.Update}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<CheckBoxProperty
										title={ViewTypes.Delete}
										link={link}
										property={ViewTypes.Delete}
									/>
								</TreeViewItemContainer>
							</TreeViewMenu>
						);
						break;
					case LinkType.Enumeration:
						let enumeration: any = GetNodeProp(link.target, NodeProperties.Enumeration);
						if (enumeration) {
							result.push(
								<TreeViewMenu
									open={UIA.Visual(state, linkType)}
									active
									title={linkType}
									key={`${linkType}${selectedLink.id}`}
									innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
									toggle={() => {
										this.props.toggleVisual(linkType);
									}}
								>
									{enumeration.map((enumer: any) => {
										let currentValue =
											UIA.GetLinkProperty(link, LinkPropertyKeys.Enumeration) || [];
										return (
											<TreeViewItemContainer key={enumer.id}>
												<CheckBox
													label={enumer.value}
													value={currentValue.indexOf(enumer.id) !== -1}
													onChange={(value: any) => {
														this.props.graphOperation([
															{
																operation: UIA.UPDATE_LINK_PROPERTY,
																options() {
																	return {
																		id: link.id,
																		prop: LinkPropertyKeys.Enumeration,
																		value: value
																			? [ ...currentValue, enumer.id ]
																			: [
																					...currentValue.filter(
																						(x: any) => x !== enumer.id
																					)
																				]
																	};
																}
															}
														]);
													}}
												/>
											</TreeViewItemContainer>
										);
									})}
								</TreeViewMenu>
								// <EnumerationLinkMenu
								// 	linkType={linkType}
								// 	selectedLink={selectedLink}
								// 	enumeration={enumeration}
								//   link={link}
								//   title={'Default Value'}
								// 	linkKey={LinkPropertyKeys.DefaultValue}
								// 	key={`${linkType}${selectedLink.id}-default-value`}
								// />
							);
						}
						if (enumeration) {
							const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
							if (GetNodeProp(currentNode, NodeProperties.NODEType) === NodeTypes.Property) {
								result.push(
									<TreeViewItemContainer>
										<SelectInput
											label={`${Titles.Component} A`}
											options={enumeration.map((v) => ({ title: v.value, value: v.id }))}
											onChange={(value: any) => {
												this.props.graphOperation([
													{
														operation: UIA.CHANGE_NODE_PROPERTY,
														options() {
															return {
																prop: NodeProperties.DefaultPropertyValue,
																id: currentNode.id,
																value: value
															};
														}
													},
													{
														operation: UIA.CHANGE_NODE_PROPERTY,
														options() {
															return {
																prop: NodeProperties.DefaultPropertyValueType,
																id: currentNode.id,
																value: DefaultPropertyValueType.Enumeration
															};
														}
													},
													{
														operation: UIA.CHANGE_NODE_PROPERTY,
														options() {
															return {
																prop: NodeProperties.EnumerationReference,
																id: currentNode.id,
																value: link.target
															};
														}
													}
												]);
											}}
											value={UIA.GetNodeProp(currentNode, NodeProperties.DefaultPropertyValue)}
										/>
									</TreeViewItemContainer>
								);
							}
						}
						break;
					case LinkType.ComponentExternalConnection:
					case LinkType.EventMethodInstance:
					case LinkType.ComponentExternalApi:
					default:
						const skip = false;
						if (!skip)
							result.push(
								<TreeViewMenu
									open={UIA.Visual(state, linkType)}
									active
									title={linkType}
									key={`${linkType}${selectedLink.id}`}
									innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
									toggle={() => {
										this.props.toggleVisual(linkType);
									}}
								>
									<TreeViewItemContainer>
										<CheckBox
											label={LinkPropertyKeys.InstanceUpdate}
											value={UIA.GetLinkProperty(link, LinkPropertyKeys.InstanceUpdate)}
											onChange={(value: any) => {
												this.props.graphOperation([
													{
														operation: UIA.UPDATE_LINK_PROPERTY,
														options() {
															return {
																id: link.id,
																prop: LinkPropertyKeys.InstanceUpdate,
																value
															};
														}
													}
												]);
											}}
										/>
									</TreeViewItemContainer>
								</TreeViewMenu>
							);
						break;
				}
			}
		}
		return result;
	}

	hideTypeMenu() {
		const HIDE_TYPE_MENU = 'HIDE_TYPE_MENU';
		const { state } = this.props;
		return (
			<TreeViewMenu
				open={UIA.Visual(state, HIDE_TYPE_MENU)}
				active
				title={Titles.HideTypeMenu}
				innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
				toggle={() => {
					this.props.toggleVisual(HIDE_TYPE_MENU);
				}}
			>
				{Object.keys(NodeTypes).sort().map((type) => (
					<TreeViewMenu
						key={`node-${type}`}
						title={type}
						icon={UIA.Hidden(state, NodeTypes[type]) ? 'fa fa-circle-o' : 'fa fa-check-circle-o'}
						toggle={() => {
							this.props.toggleHideByTypes(NodeTypes[type]);
						}}
					/>
				))}
			</TreeViewMenu>
		);
	}

	deleteByTypeMenu() {
		const DELETE_TYPE_MENU = 'DELETE_TYPE_MENU';
		const { state } = this.props;
		return (
			<TreeViewMenu
				open={UIA.Visual(state, DELETE_TYPE_MENU)}
				active
				title={Titles.DeleteType}
				innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
				toggle={() => {
					this.props.toggleVisual(DELETE_TYPE_MENU);
				}}
			>
				<TreeViewMenu
					title={'Clear'}
					onClick={() => {
						this.props.deleteByTypes(
							Object.keys(NodeTypes)
								.filter((x) => this.state.deleteType[NodeTypes[x]])
								.map((x) => NodeTypes[x])
						);
					}}
				/>
				{Object.keys(NodeTypes).sort().map((type) => (
					<TreeViewMenu
						key={`node-${type}`}
						title={type}
						icon={!this.state.deleteType[NodeTypes[type]] ? 'fa fa-circle-o' : 'fa fa-check-circle-o'}
						toggle={() => {
							this.setState({
								deleteType: {
									...this.state.deleteType,
									[NodeTypes[type]]: !this.state.deleteType[NodeTypes[type]]
								}
							});
						}}
					/>
				))}
			</TreeViewMenu>
		);
	}

	minimizeMenu() {
		const MINIMIZE_MENU = 'MINIMIZE_MENU';
		const { state } = this.props;
		return (
			<TreeViewMenu
				open={UIA.Visual(state, MINIMIZE_MENU)}
				active
				title={Titles.MinimizeTypeMenu}
				innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
				toggle={() => {
					this.props.toggleVisual(MINIMIZE_MENU);
				}}
			>
				{Object.keys(NodeTypes).sort().map((type) => (
					<TreeViewMenu
						key={`node-${type}`}
						title={type}
						icon={!UIA.Minimized(state, NodeTypes[type]) ? 'fa fa-circle-o' : 'fa fa-check-circle-o'}
						toggle={() => {
							this.props.toggleMinimized(NodeTypes[type]);
						}}
					/>
				))}
			</TreeViewMenu>
		);
	}

	generalMenu() {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const graph = UIA.GetCurrentGraph();
		return [
			<TreeViewMenu
				open={UIA.Visual(state, 'GENERAL_MENU')}
				active
				title={Titles.Operations}
				innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
				toggle={() => {
					this.props.toggleVisual('GENERAL_MENU');
				}}
			>
				<TreeViewMenu
					open={UIA.Visual(state, 'dccollections')}
					active
					title={Titles.Collections}
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual('dccollections');
					}}
				>
					<TreeViewMenu
						title="Update"
						active
						onClick={() => {
							this.props.graphOperation(CollectionDataChainsIntoCollections());
						}}
					/>
					<TreeViewMenu
						title="Clear"
						active
						onClick={() => {
							this.props.graphOperation(
								UIA.NodesByType(null, NodeTypes.DataChainCollection).map((v: Node) => ({
									operation: UIA.REMOVE_NODE,
									options: {
										id: v.id
									}
								}))
							);
						}}
					/>
				</TreeViewMenu>
				<TreeViewMenu
					title={`${Titles.BuildMenus}`}
					open={UIA.Visual(state, Titles.BuildMenus)}
					active
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual(Titles.BuildMenus);
					}}
				>
					<TreeViewMenu
						title={`${Titles.BuildLowerMenu}`}
						description={`Builds menus for each model, and the menu can be put together`}
						onClick={() => {
							BuildLowerMenus();
						}}
					/>
				</TreeViewMenu>
				<TreeViewMenu
					title={`${Titles.BuildReferenceObject}`}
					open={UIA.Visual(state, Titles.BuildReferenceObject)}
					active
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual(Titles.BuildReferenceObject);
					}}
				>
					<TreeViewItemContainer>
						<SelectInput
							label={`${Titles.Model} 1`}
							options={UIA.NodesByType(null, NodeTypes.Model).toNodeSelect()}
							onChange={(value: any) => {
								this.setState({
									model: value
								});
							}}
							value={this.state.model}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<SelectInput
							label={`${Titles.Model} 2`}
							options={UIA.NodesByType(null, NodeTypes.Model).toNodeSelect()}
							onChange={(value: any) => {
								this.setState({
									model2: value
								});
							}}
							value={this.state.model2}
						/>
					</TreeViewItemContainer>

					<TreeViewMenu
						title={`${Titles.BuildReferenceObject}`}
						onClick={() => {
							let { model, model2 } = this.state;
							let newModel: any;
							let newModel1: any;
							let newModel2: any;
							BuildReferenceObject({
								model,
								model2
							});
						}}
					/>
				</TreeViewMenu>
				<TreeViewMenu
					title={`${Titles.Surgery}`}
					open={UIA.Visual(state, Titles.Surgery)}
					active
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual(Titles.Surgery);
					}}
				>
					<TreeViewMenu
						title={`${Titles.CopyNodeConnectionInfoToClip}`}
						onClick={() => {
							let links = getNodeLinks(UIA.GetCurrentGraph(), currentNode.id);
							let obj = {
								links,
								node: currentNode
							};
							let data = JSON.stringify(obj);
							clipboard.writeText(data, 'clipboard');
						}}
					/>
					<TreeViewItemContainer>
						<TextInput
							immediate
							label={`${Titles.Clip}`}
							placeholder={`${Titles.Clip}`}
							onChange={(value: any) => {
								this.setState({
									clip: value
								});
							}}
							value={this.state.clip}
						/>
					</TreeViewItemContainer>
					<TreeViewMenu
						title={`${Titles.Paste}`}
						onClick={() => {
							let { links, node } = JSON.parse(this.state.clip);
							let copiedNode: string;
							this.props.graphOperation([
								{
									operation: UIA.ADD_NEW_NODE,
									options() {
										return {
											nodeType: GetNodeProp(node, NodeProperties.NODEType),
											id: node.id,
											overrideId: true,
											properties: {
												// [NodeProperties.UIText]: GetNodeProp(model, NodeProperties.UIText)
												...node.properties
											},
											callback(node: Node) {
												copiedNode = node.id;
											}
										};
									}
								},
								...links.map((link: GraphLink) => {
									return {
										operation: UIA.ADD_LINK_BETWEEN_NODES,
										options() {
											let target = node.id === link.target ? copiedNode : link.target;
											let source = node.id === link.source ? copiedNode : link.source;
											return {
												target,
												source,
												id: link.id,
												properties: {
													...link.properties
												}
											};
										}
									};
								})
							]);
						}}
					/>
				</TreeViewMenu>
				{UIA.GetNodeProp(currentNode, NodeProperties.NODEType) === NodeTypes.Permission ? (
					<TreeViewMenu
						open={UIA.Visual(state, `${NodeTypes.Permission} ${Titles.Operations}`)}
						active
						title={`Permission ${Titles.Operations}`}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual(`${NodeTypes.Permission} ${Titles.Operations}`);
						}}
					>
						<TreeViewMenu
							active
							onClick={() => {
								const permissions = UIA.NodesByType(null, NodeTypes.Permission);
								const result = [];
								permissions
									.filter((x) => x.id !== currentNode.id)
									.filter((x) => {
										const methodNode = UIA.GetMethodNode(x.id);
										const currentMethodNode = UIA.GetMethodNode(currentNode.id);
										return (
											UIA.GetMethodNodeProp(methodNode.id, FunctionTemplateKeys.Agent) ===
											UIA.GetMethodNodeProp(currentMethodNode.id, FunctionTemplateKeys.Agent)
										);
									})
									.map((permission) => {
										result.push(
											...CopyPermissionConditions({
												permission: currentNode.id,
												node: permission.id
											})
										);
									});
								this.props.graphOperation(result);
							}}
							title={Titles.CopyToAll}
						/>
					</TreeViewMenu>
				) : null}
				<TreeViewMenu
					open={UIA.Visual(state, 'modelfilter OPERATIONS')}
					active
					title={`Model Filter ${Titles.Operations}`}
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual('modelfilter OPERATIONS');
					}}
				/>
				<TreeViewMenu
					open={UIA.Visual(state, 'Permission Template')}
					active
					title={`Permission Template`}
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual('Permission Template');
					}}
				>
					<TreeViewItemContainer>
						<TextInput
							immediate
							label={`${Titles.Name}`}
							placeholder={`${Titles.Name}`}
							onChange={(value: any) => {
								this.setState({
									name: value
								});
							}}
							value={
								this.state.name ||
								`${UIA.GetNodeTitle(this.state.agent)} ${UIA.GetNodeTitle(
									this.state.model
								)} Permission Template`
							}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<SelectInput
							label={`${Titles.Agents}`}
							options={UIA.NodesByType(null, NodeTypes.Model)
								.filter((a: Node) => GetNodeProp(a, NodeProperties.IsAgent))
								.filter((a: Node) => !GetNodeProp(a, NodeProperties.IsUser))
								.sort((a: Node, b: Node) => UIA.GetNodeTitle(a).localeCompare(UIA.GetNodeTitle(b)))
								.toNodeSelect()}
							onChange={(value: any) => {
								this.setState({
									agent: value
								});
							}}
							value={this.state.agent}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<SelectInput
							label={`${Titles.Property}`}
							options={
								!this.state.agent ? (
									[]
								) : (
									UIA.GetModelPropertyChildren(this.state.agent)
										.filter((a: Node) => !GetNodeProp(a, NodeProperties.IsAgent))
										.filter((a: Node) => !GetNodeProp(a, NodeProperties.IsUser))
										.sort((a: Node, b: Node) =>
											UIA.GetNodeTitle(a).localeCompare(UIA.GetNodeTitle(b))
										)
										.toNodeSelect()
								)
							}
							onChange={(value: any) => {
								this.setState({
									agentProperty: value
								});
								let enumeration = GetNodeLinkedTo(UIA.GetCurrentGraph(), {
									id: value,
									link: LinkType.Enumeration
								});
								if (enumeration) {
									this.setState({
										enumeration: value
									});
								}
							}}
							value={this.state.agentProperty}
						/>
					</TreeViewItemContainer>

					<TreeViewItemContainer>
						<SelectInput
							label={`${Titles.Enumeration}`}
							options={
								!this.state.agent ? (
									[]
								) : (
									UIA.NodesByType(null, NodeTypes.Enumeration)
										.sort((a: Node, b: Node) =>
											UIA.GetNodeTitle(a).localeCompare(UIA.GetNodeTitle(b))
										)
										.toNodeSelect()
								)
							}
							onChange={(value: any) => {
								this.setState({
									enumeration: value
								});
							}}
							value={this.state.enumeration}
						/>
					</TreeViewItemContainer>
					<TreeViewItemContainer>
						<SelectInput
							label={`${Titles.Models}`}
							options={UIA.NodesByType(this.props.state, NodeTypes.Model)
								.filter((a: Node) => !GetNodeProp(a, NodeProperties.IsAgent))
								.filter((a: Node) => !GetNodeProp(a, NodeProperties.IsUser))
								.sort((a: Node, b: Node) => UIA.GetNodeTitle(a).localeCompare(UIA.GetNodeTitle(b)))
								.toNodeSelect()}
							onChange={(value: any) => {
								this.setState({
									model: value
								});
							}}
							value={this.state.model}
						/>
					</TreeViewItemContainer>
					<TreeViewButtonGroup>
						<TreeViewGroupButton
							title="Create Permission Template"
							onClick={() => {
								let name =
									this.state.name ||
									`${UIA.GetNodeTitle(this.state.agent)} ${UIA.GetNodeTitle(
										this.state.model
									)} Permission Template`;
								if (
									this.state.model &&
									this.state.agent &&
									name &&
									this.state.agentProperty &&
									this.state.enumeration
								) {
									this.props.graphOperation(
										SetupEnumerationPermissionTemplate({
											permissiontemplatename: name,
											model: this.state.model,
											agent: this.state.agent,
											enumeration: this.state.enumeration,
											agentProperty: this.state.agentProperty
										})
									);
								}
							}}
							icon="fa fa-plus"
						/>
						<TreeViewGroupButton
							title="Setup Cache"
							onClick={() => {
								setupCache(UIA.GetCurrentGraph());
							}}
							icon="fa fa-recycle"
						/>
					</TreeViewButtonGroup>
				</TreeViewMenu>
				<TreeViewMenu
					open={UIA.Visual(state, 'method OPERATIONS')}
					active
					title={`Method ${Titles.Operations}`}
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual('method OPERATIONS');
					}}
				>
					<TreeViewMenu
						active
						title="Add Filters to GetAll"
						onClick={() => {
							this.props.graphOperation(AddFiltersToGetAll({}));
						}}
					/>
				</TreeViewMenu>
				<TreeViewMenu
					open={UIA.Visual(state, 'executor OPERATIONS')}
					active
					title={`Executor ${Titles.Operations}`}
					innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
					toggle={() => {
						this.props.toggleVisual('executor OPERATIONS');
					}}
				>
					<TreeViewMenu
						active
						title="Have all properties"
						description="Executors will have all properties added in executor."
						onClick={() => {
							const executors = UIA.NodesByType(null, NodeTypes.Executor);
							const result = [];
							executors.map((executor) => {
								const steps = AddAllPropertiesToExecutor({
									currentNode: executor
								});
								result.push(...steps);
							});
							this.props.graphOperation(result);
						}}
					/>
					<TreeViewMenu
						active
						title={AddCopyPropertiesToExecutor.title}
						description={AddCopyPropertiesToExecutor.description}
						onClick={() => {
							const executors = UIA.NodesByType(null, NodeTypes.Executor);
							const result = [];
							executors.map((executor) => {
								const steps = AddCopyPropertiesToExecutor({
									currentNode: executor,
									executor: UIA.GetNodeProp(executor, NodeProperties.Executor)
								});
								result.push(...steps);
							});
							this.props.graphOperation(result);
						}}
					/>
				</TreeViewMenu>
				<TreeViewMenu
					title="Modify Update Links"
					active
					onClick={() => {
						this.props.graphOperation(ModifyUpdateLinks());
					}}
				/>
				<TreeViewMenu
					title={NodeTypes.ComponentApi}
					open={UIA.Visual(state, NodeTypes.ComponentApi)}
					active
					onClick={() => {
						this.props.toggleVisual(NodeTypes.ComponentApi);
					}}
				>
					<TreeViewMenu
						title="Value(s) To Local Context"
						description={SetInnerApiValueToLocalContextInLists.description}
						active
						onClick={() => {
							this.props.graphOperation(SetInnerApiValueToLocalContextInLists());
						}}
					/>
					<TreeViewMenu
						title="Create Component Api"
						open={UIA.Visual(state, 'Create Component Api')}
						active
						onClick={() => {
							this.props.toggleVisual('Create Component Api');
						}}
					>
						<TreeViewItemContainer>
							<SelectInput
								label={`${Titles.Component} A`}
								options={UIA.NodesByType(this.props.state, NodeTypes.ComponentNode)
									.sort((a: Node, b: Node) =>
										`${UIA.GetNodeTitle(a)}`.localeCompare(`${UIA.GetNodeTitle(b)}`)
									)
									.toNodeSelect()}
								onChange={(value: any) => {
									this.setState({
										componentA: value
									});
								}}
								value={this.state.componentA}
							/>
						</TreeViewItemContainer>
						<TreeViewItemContainer>
							<TextInput
								immediate
								label={`${Titles.ExternalApi} A`}
								placeholder={`${Titles.ExternalApi} A`}
								onChange={(value: any) => {
									this.setState({
										externalApiA: value
									});
								}}
								value={this.state.externalApiA}
							/>
						</TreeViewItemContainer>
						<TreeViewItemContainer>
							<TextInput
								immediate
								label={`${Titles.InternalApi} A`}
								placeholder={Titles.InternalApi}
								onChange={(value: any) => {
									this.setState({
										internalApiA: value
									});
								}}
								value={this.state.internalApiA}
							/>
						</TreeViewItemContainer>
						<TreeViewItemContainer>
							<SelectInput
								label={`${Titles.Component} B`}
								options={UIA.NodesByType(this.props.state, NodeTypes.ComponentNode)
									.filter((x) =>
										existsLinkBetween(graph, {
											source: this.state.componentA,
											target: x.id
										})
									)
									.toNodeSelect()}
								onChange={(value: any) => {
									this.setState({
										componentB: value
									});
								}}
								value={this.state.componentB}
							/>
						</TreeViewItemContainer>
						<TreeViewItemContainer>
							<TextInput
								immediate
								label={`${Titles.ExternalApi} B`}
								placeholder={`${Titles.ExternalApi} B`}
								onChange={(value: any) => {
									this.setState({
										externalApiB: value
									});
								}}
								value={this.state.externalApiB}
							/>
						</TreeViewItemContainer>
						<TreeViewItemContainer>
							<TextInput
								immediate
								label={`${Titles.InternalApi} B`}
								placeholder={`${Titles.InternalApi} B`}
								onChange={(value: any) => {
									this.setState({
										internalApiB: value
									});
								}}
								value={this.state.internalApiB}
							/>
						</TreeViewItemContainer>
						{this.state.componentA &&
						this.state.componentB &&
						this.state.externalApiB &&
						this.state.internalApiB &&
						this.state.internalApiA &&
						this.state.externalApiA ? (
							<TreeViewMenu
								title="Setup Api Between Components"
								description={SetupApiBetweenComponents.description}
								active
								onClick={() => {
									this.props.graphOperation(
										SetupApiBetweenComponents({
											component_a: {
												id: this.state.componentA,
												external: this.state.externalApiA,
												internal: this.state.internalApiA
											},
											component_b: {
												id: this.state.componentB,
												external: this.state.externalApiB,
												internal: this.state.internalApiB
											}
										})
									);
								}}
							/>
						) : null}
					</TreeViewMenu>
				</TreeViewMenu>

				<TreeViewMenu
					title="Create Dashboard"
					open={UIA.Visual(state, `Create Dashboard`)}
					active
					onClick={() => {
						// this.props.graphOperation(GetModelViewModelForList({}));
						this.props.toggleVisual(`Create Dashboard`);
					}}
				>
					<TreeViewItemContainer>
						<TextInput
							immediate
							label={Titles.Name}
							placeholder={Titles.EnterName}
							onChange={(value: any) => {
								this.setState({
									dashboard: value
								});
							}}
							value={this.state.dashboard}
						/>
					</TreeViewItemContainer>
					{this.state.dashboard ? (
						<TreeViewMenu
							title={Titles.Execute}
							onClick={() => {
								this.props.graphOperation(
									CreateDashboard_1({
										name: this.state.dashboard
									})
								);
								this.setState({ dashboard: '' });
							}}
						/>
					) : null}
				</TreeViewMenu>
			</TreeViewMenu>
		];
	}

	operations(): any[] {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
		let temp;
		const layoutoptions = () => (
			<TreeViewMenu
				open={UIA.Visual(state, 'ScreenOptionOperations')}
				active
				title={Titles.Layout}
				innerStyle={{ maxHeight: 600, overflowY: 'auto' }}
				onClick={() => {
					this.setState({
						secondaryMenu:
							this.state.secondaryMenu === SecondaryOptions.LayoutOptions
								? null
								: SecondaryOptions.LayoutOptions
					});
				}}
			/>
		);
		switch (currentNodeType) {
			case NodeTypes.DefaultValue:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewItemContainer>
							<SelectInput
								label={Titles.Models}
								options={UIA.NodesByType(this.props.state, NodeTypes.Model)
									.filter((x: Node) => GetNodeProp(x, NodeProperties.IsAgent))
									.toNodeSelect()}
								onChange={(value: any) => {
									this.props.graphOperation([
										{
											operation: UIA.CHANGE_NODE_PROPERTY,
											options: {
												prop: UIA.NodeProperties.Agent,
												id: currentNode.id,
												value: value
											}
										}
									]);
								}}
								value={GetNodeProp(currentNode, NodeProperties.Agent)}
							/>
						</TreeViewItemContainer>
            <TreeViewItemContainer>
							<TextInput
									label={Titles.DefaultValue}
									onChange={(value: any) => {
										this.props.graphOperation([
											{
												operation: UIA.CHANGE_NODE_PROPERTY,
												options: {
													prop: UIA.NodeProperties.DefaultValue,
													id: currentNode.id,
													value: value
												}
											}
										]);
									}}
									value={GetNodeProp(currentNode, NodeProperties.DefaultValue)}
							/>
						</TreeViewItemContainer>
					</TreeViewMenu>
				];
			case NodeTypes.Property:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						{Object.keys(NodeAttributePropertyTypes).sort((a, b) => a.localeCompare(b)).map((key) => {
							return (
								<TreeViewMenu
									active
									title={key}
									key={key}
									onClick={() => {
										this.props.graphOperation(
											AddAttributeOfType({
												property: currentNode.id,
												attributename: key,
												uiAttributeType: NodeAttributePropertyTypes[key]
											})
										);
									}}
								/>
							);
						})}
					</TreeViewMenu>
				];
			case NodeTypes.NavigationScreen:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title={Titles.CreateMirrorMenu}
							description={'creates a menu mirroring the paths'}
							onClick={() => {
								CreateMirrorMenu({ id: currentNode.id });
							}}
						/>
						<TreeViewMenu
							open={UIA.Visual(state, 'Navigation Screen Properties')}
							active
							title={'Navigation Screen Props'}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Navigation Screen Properties');
							}}
						>
							<TreeViewItemContainer>
								<CheckBox
									label={Titles.Dashboard}
									onChange={(value: any) => {
										this.props.graphOperation([
											{
												operation: UIA.CHANGE_NODE_PROPERTY,
												options: {
													prop: UIA.NodeProperties.IsDashboard,
													id: currentNode.id,
													value: value
												}
											}
										]);
									}}
									value={GetNodeProp(currentNode, NodeProperties.IsDashboard)}
								/>
							</TreeViewItemContainer>

							<TreeViewItemContainer>
								<TextInput
									label={Titles.Name}
									onChange={(value: any) => {
										this.props.graphOperation([
											{
												operation: UIA.CHANGE_NODE_PROPERTY,
												options: {
													prop: UIA.NodeProperties.UIText,
													id: currentNode.id,
													value: value
												}
											}
										]);
									}}
									value={GetNodeProp(currentNode, NodeProperties.UIText)}
								/>
							</TreeViewItemContainer>
							{!GetNodeProp(currentNode, NodeProperties.IsDashboard) ? null : (
								<TreeViewItemContainer>
									<CheckBox
										label={Titles.IsAuthenticatedLaunchHome}
										onChange={(value: any) => {
											this.props.graphOperation([
												{
													operation: UIA.CHANGE_NODE_PROPERTY,
													options: {
														prop: UIA.NodeProperties.IsHomeLaunchView,
														id: currentNode.id,
														value: value
													}
												}
											]);
										}}
										value={GetNodeProp(currentNode, NodeProperties.IsHomeLaunchView)}
									/>
								</TreeViewItemContainer>
							)}
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Models}
									options={UIA.NodesByType(this.props.state, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.props.graphOperation([
											{
												operation: UIA.CHANGE_NODE_PROPERTY,
												options: {
													prop: UIA.NodeProperties.Model,
													id: currentNode.id,
													value: value
												}
											}
										]);
									}}
									value={GetNodeProp(currentNode, NodeProperties.Model)}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Agents}
									options={UIA.NodesByType(this.props.state, NodeTypes.Model)
										.filter(
											(x: Node) =>
												GetNodeProp(x, NodeProperties.IsAgent) &&
												!GetNodeProp(x, NodeProperties.IsUser)
										)
										.toNodeSelect()}
									onChange={(value: any) => {
										this.props.graphOperation([
											{
												operation: UIA.CHANGE_NODE_PROPERTY,
												options: {
													prop: UIA.NodeProperties.Agent,
													id: currentNode.id,
													value: value
												}
											}
										]);
									}}
									value={GetNodeProp(currentNode, NodeProperties.Agent)}
								/>
							</TreeViewItemContainer>
							{GetNodeProp(currentNode, NodeProperties.IsDashboard) ? null : (
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.ViewTypes}
										options={Object.keys(ViewTypes).map((key: string) => ({
											title: key,
											value: ViewTypes[key],
											id: key
										}))}
										onChange={(value: any) => {
											this.props.graphOperation([
												{
													operation: UIA.CHANGE_NODE_PROPERTY,
													options: {
														prop: UIA.NodeProperties.ViewType,
														id: currentNode.id,
														value: value
													}
												}
											]);
										}}
										value={GetNodeProp(currentNode, NodeProperties.ViewType)}
									/>
								</TreeViewItemContainer>
							)}
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.MenuDataSource:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							open={UIA.Visual(state, 'Build Menu')}
							active
							title={Titles.BuildMenu}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Build Menu');
							}}
						>
							<TreeViewMenu
								open={UIA.Visual(state, 'Build Menu Filter')}
								active
								title={Titles.Filter}
								innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
								toggle={() => {
									this.props.toggleVisual('Build Menu Filter');
								}}
							>
								<TreeViewItemContainer>
									<SelectInput
										title={Titles.Agents}
										label={Titles.Agents}
										options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Model)
											.filter(
												(x: any) =>
													!GetNodeProp(x, NodeProperties.IsUser) &&
													GetNodeProp(x, NodeProperties.IsAgent)
											)
											.toNodeSelect()}
										onChange={(value: any) => {
											this.setState({ agent: value });
										}}
										value={this.state.agent}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<TextInput
										title={Titles.Filter}
										label={Titles.Filter}
										onChange={(value: any) => {
											this.setState({ menuFilter: value });
										}}
										value={this.state.menuFilter}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<CheckBox
										title={Titles.Dashboard}
										label={Titles.Dashboard}
										onChange={(value: any) => {
											this.setState({ isDashboard: value });
										}}
										value={this.state.isDashboard}
									/>
								</TreeViewItemContainer>
							</TreeViewMenu>
						</TreeViewMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'Navigation Screens')}
							active
							title={NodeTypes.NavigationScreen}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT / 2, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Navigation Screens');
							}}
						>
							{UIA.NodesByType(null, NodeTypes.NavigationScreen)
								.filter((node: Node) => {
									return this.state.agent
										? GetNodeProp(node, NodeProperties.Agent) === this.state.agent
										: true;
								})
								.filter((node: Node) => {
									let title = UIA.GetNodeTitle(node);
									if (!title) {
										return true;
									}
									return (
										`${title}`
											.toLocaleLowerCase()
											.indexOf(`${this.state.menuFilter || ''}`.toLocaleLowerCase()) !== -1
									);
								})
								.map((node: Node) => {
									return (
										<TreeViewItemContainer>
											<CheckBox
												title={UIA.GetNodeTitle(node)}
												label={UIA.GetNodeTitle(node)}
												onChange={(value: boolean) => {
													var id = node.id;
													if (value) {
														this.props.graphOperation([
															{
																operation: UIA.ADD_LINK_BETWEEN_NODES,
																options: () => ({
																	target: id,
																	source: currentNode.id,
																	properties: { ...UIA.LinkProperties.MenuLink }
																})
															},
															{
																operation: UIA.UPDATE_NODE_PROPERTY,
																options: () => ({
																	id: id,
																	properties: { [NodeProperties.Pinned]: true }
																})
															}
														]);
													} else {
														this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
															target: id,
															source: currentNode.id
														});
													}
												}}
												value={
													currentNode &&
													findLink(UIA.GetCurrentGraph(), {
														source: currentNode.id,
														target: node.id
													})
												}
											/>
										</TreeViewItemContainer>
									);
								})}
						</TreeViewMenu>
						<TreeViewMenu
							open={UIA.Visual(state, 'Menus')}
							active
							title={NodeTypes.MenuDataSource}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT / 2, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Menus');
							}}
						>
							{UIA.NodesByType(null, NodeTypes.MenuDataSource)
								.filter((node: Node) => {
									return this.state.agent
										? GetNodeProp(node, NodeProperties.Agent) === this.state.agent
										: true;
								})
								.filter((node: Node) => {
									let title = UIA.GetNodeTitle(node);
									if (!title) {
										return true;
									}
									return (
										`${title}`
											.toLocaleLowerCase()
											.indexOf(`${this.state.menuFilter || ''}`.toLocaleLowerCase()) !== -1
									);
								})
								.map((node: Node) => {
									return (
										<TreeViewItemContainer>
											<CheckBox
												title={UIA.GetNodeTitle(node)}
												label={UIA.GetNodeTitle(node)}
												onChange={(value: boolean) => {
													var id = node.id;
													if (value) {
														this.props.graphOperation([
															{
																operation: UIA.ADD_LINK_BETWEEN_NODES,
																options: () => ({
																	target: id,
																	source: currentNode.id,
																	properties: { ...UIA.LinkProperties.MenuLink }
																})
															},
															{
																operation: UIA.UPDATE_NODE_PROPERTY,
																options: () => ({
																	id: id,
																	properties: { [NodeProperties.Pinned]: true }
																})
															}
														]);
													} else {
														this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
															target: id,
															source: currentNode.id
														});
													}
												}}
												value={
													currentNode &&
													findLink(UIA.GetCurrentGraph(), {
														source: currentNode.id,
														target: node.id
													})
												}
											/>
										</TreeViewItemContainer>
									);
								})}
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.DataChainCollection:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							active
							title={Titles.AddDataChainCollection}
							onClick={() => {
								if (
									!GetNodesLinkedTo(UIA.GetCurrentGraph(), {
										id: currentNode.id,
										link: LinkType.DataChainCollection,
										direction: SOURCE
									}).some((v) => UIA.GetNodeProp(v, NodeProperties.NODEType) === currentNodeType)
								) {
									this.props.graphOperation([
										{
											operation: UIA.ADD_NEW_NODE,
											options() {
												return {
													nodeType: NodeTypes.DataChainCollection,
													linkProperties: {
														properties: {
															...LinkProperties.DataChainCollection
														}
													},
													parent: currentNode.id,
													properties: {
														[NodeProperties.UIText]: currentNodeType
													}
												};
											}
										}
									]);
								}
							}}
						/>
					</TreeViewMenu>
				];
			case NodeTypes.Screen:
				const viewType = UIA.GetNodeProp(currentNode, NodeProperties.ViewType);
				switch (viewType) {
					case ViewTypes.GetAll:
					case ViewTypes.Get:
					case ViewTypes.Create:
					case ViewTypes.Update:
						const screenModel = UIA.GetNodeProp(currentNode, NodeProperties.Model);
						return [
							<TreeViewMenu
								open={UIA.Visual(state, 'OPERATIONS')}
								active
								title={Titles.Operations}
								innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
								toggle={() => {
									this.props.toggleVisual('OPERATIONS');
								}}
							>
								<TreeViewMenu
									title="Connect"
									open={UIA.Visual(state, `Connect`)}
									active
									onClick={() => {
										this.props.toggleVisual(`Connect`);
									}}
								>
									<TreeViewItemContainer>
										<SelectInput
											label={Titles.Methods}
											options={UIA.NodesByType(this.props.state, NodeTypes.Method)
												.filter(
													(x) =>
														(MethodFunctions[
															UIA.GetNodeProp(x, NodeProperties.FunctionType)
														] || {}).method === viewType
												)
												.filter((x) => {
													if (screenModel) {
														const modelOutput =
															UIA.GetMethodNodeProp(
																x,
																FunctionTemplateKeys.ModelOutput
															) || UIA.GetMethodNodeProp(x, FunctionTemplateKeys.Model);
														return modelOutput === screenModel;
													}
													return true;
												})
												.toNodeSelect()}
											onChange={(value: any) => {
												this.setState({
													method: value
												});
											}}
											value={this.state.method}
										/>
									</TreeViewItemContainer>
									{[ ViewTypes.GetAll, ViewTypes.Get ].some((v) => v === viewType) ? (
										<TreeViewItemContainer>
											<SelectInput
												label={Titles.NavigateTo}
												options={UIA.NodesByType(this.props.state, NodeTypes.Screen)
													.filter((x) => {
														if (viewType === ViewTypes.Get) {
															return (
																UIA.GetNodeProp(x, NodeProperties.ViewType) ===
																ViewTypes.Update
															);
														}
														return (
															UIA.GetNodeProp(x, NodeProperties.ViewType) ===
															ViewTypes.Get
														);
													})
													.filter((x) => {
														if (screenModel) {
															const modelOutput = UIA.GetNodeProp(
																x,
																NodeProperties.Model
															);
															return modelOutput === screenModel;
														}
														return true;
													})
													.toNodeSelect()}
												onChange={(value: any) => {
													this.setState({
														navigateTo: value
													});
												}}
												value={this.state.navigateTo}
											/>
										</TreeViewItemContainer>
									) : null}
									{viewType === ViewTypes.Update ? (
										<TreeViewItemContainer>
											<SelectInput
												label={Titles.ComponentDidMount}
												options={UIA.NodesByType(this.props.state, NodeTypes.Method)
													.filter(
														(x) =>
															(MethodFunctions[
																UIA.GetNodeProp(x, NodeProperties.FunctionType)
															] || {}).method === ViewTypes.Get
													)
													.filter((x) => {
														if (screenModel) {
															const modelOutput =
																UIA.GetMethodNodeProp(
																	x,
																	FunctionTemplateKeys.ModelOutput
																) ||
																UIA.GetMethodNodeProp(x, FunctionTemplateKeys.Model);
															return modelOutput === screenModel;
														}
														return true;
													})
													.toNodeSelect()}
												onChange={(value: any) => {
													this.setState({
														componentDidMountMethod: value
													});
												}}
												value={this.state.componentDidMountMethod}
											/>
										</TreeViewItemContainer>
									) : null}
									{this.state.method ? (
										<TreeViewMenu
											title={Titles.Execute}
											onClick={() => {
												let commands = [];
												switch (viewType) {
													case ViewTypes.Get:
														commands = ScreenConnectGet({
															method: this.state.method,
															node: currentNode.id,
															navigateTo: this.state.navigateTo
														});
														break;
													case ViewTypes.GetAll:
														commands = ScreenConnectGetAll({
															method: this.state.method,
															node: currentNode.id,
															navigateTo: this.state.navigateTo
														});
														break;
													case ViewTypes.Create:
														commands = ScreenConnectCreate({
															method: this.state.method,
															node: currentNode.id
														});
														break;
													case ViewTypes.Update:
														commands = ScreenConnectUpdate({
															method: this.state.method,
															componentDidMountMethod: this.state.componentDidMountMethod,
															node: currentNode.id
														});
												}
												commands.push(() => CollectionDataChainsIntoCollections());
												this.props.graphOperation([ ...commands ]);
											}}
										/>
									) : null}
								</TreeViewMenu>
							</TreeViewMenu>
						];
				}
				break;
			case NodeTypes.DataChain:
				// DataChain_SelectPropertyValue
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title="Select Model Property"
							open={UIA.Visual(state, `Select Model Property`)}
							active
							onClick={() => {
								// this.props.graphOperation(GetModelViewModelForList({}));
								this.props.toggleVisual(`Select Model Property`);
							}}
						>
							<TreeViewItemContainer>
								<TextInput
									label={Titles.Name}
									immediate
									onChange={(value: any) => {
										this.setState({
											name: value
										});
									}}
									value={this.state.name}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Models}
									options={UIA.NodesByType(this.props.state, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											model: value
										});
									}}
									value={this.state.model}
								/>
							</TreeViewItemContainer>
							{this.state.model ? (
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Properties}
										options={UIA.GetModelPropertyChildren(this.state.model).toNodeSelect()}
										onChange={(value: any) => {
											this.setState({
												property: value
											});
										}}
										value={this.state.property}
									/>
								</TreeViewItemContainer>
							) : null}
							{this.state.model && this.state.name && this.state.property ? (
								<TreeViewMenu
									title={Titles.Execute}
									onClick={() => {
										this.props.graphOperation([
											...DataChain_SelectPropertyValue({
												name: this.state.name,
												dataChain: currentNode.id,
												model: this.state.model,
												property: this.state.property
											})
										]);
									}}
								/>
							) : null}
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.ComponentApiConnector:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title="Assign Screen Value Parameter"
							open={UIA.Visual(state, `Assign Screen Value Parmater`)}
							active
							onClick={() => {
								// this.props.graphOperation(GetModelViewModelForList({}));
								this.props.toggleVisual(`Assign Screen Value Parmater`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Screen}
									options={UIA.NodesByType(this.props.state, NodeTypes.Screen).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											screen: value
										});
									}}
									value={this.state.screen}
								/>
							</TreeViewItemContainer>
							{this.state.screen ? (
								<TreeViewMenu
									title={Titles.Execute}
									onClick={() => {
										this.props.graphOperation([
											...GetScreenValueParameter({
												screen: UIA.GetNodeTitle(this.state.screen),
												callback: (dataChain) => {
													temp = dataChain;
												}
											}),
											...ConnectDataChainToCompontApiConnector({
												dataChain() {
													return temp.entry;
												},
												componentApiConnector() {
													return currentNode.id;
												}
											})
										]);
									}}
								/>
							) : null}
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.EventMethodInstance:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title="Navigate Back After"
							onClick={() => {
								this.props.graphOperation(
									NavigateBack({
										eventMethodInstance: currentNode.id,
										name: `${UIA.GetNodeTitle(currentNode)}`
									})
								);
							}}
						/>
						<TreeViewMenu
							title="Navigate to screen"
							open={UIA.Visual(state, `Navigate to screen`)}
							active
							onClick={() => {
								// this.props.graphOperation(GetModelViewModelForList({}));
								this.props.toggleVisual(`Navigate to screen`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Screen}
									options={UIA.NodesByType(this.props.state, NodeTypes.Screen).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											screen: value
										});
									}}
									value={this.state.screen}
								/>
							</TreeViewItemContainer>
							{this.state.screen ? (
								<TreeViewMenu
									title="Execute"
									onClick={() => {
										this.props.graphOperation([
											...CreateNavigateToScreenDC({
												screen: this.state.screen,
												node: currentNode.id,
												callback: (navigateContext) => {}
											})
										]);
									}}
								/>
							) : null}
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.LifeCylceMethodInstance:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title="Add Store Model Array Standard Handler"
							onClick={() => {
								const methodCall = UIA.GetNodeMethodCall(currentNode.id);
								if (methodCall) {
									let model =
										UIA.GetMethodProps(methodCall.id) ||
										UIA.GetMethodProps(methodCall.id, FunctionTemplateKeys.Model);
									if (model) {
										model =
											model[FunctionTemplateKeys.ModelOutput] ||
											model[FunctionTemplateKeys.Model];
										if (model) {
											this.props.graphOperation(
												StoreModelArrayStandard({
													model,
													state_key: `${UIA.GetNodeTitle(model)} State`
												})
											);
										}
									}
								}
							}}
						/>
					</TreeViewMenu>
				];
			case NodeTypes.ComponentExternalApi:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							open={UIA.Visual(state, 'AddModelPropertyGetterDC')}
							title="Add Model Property Getter"
							active
							onClick={() => {
								this.props.toggleVisual('AddModelPropertyGetterDC');
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Models}
									options={UIA.NodesByType(this.props.state, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											model: value
										});
									}}
									value={this.state.model}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Models}
									options={UIA.GetModelPropertyChildren(this.state.model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											property: value
										});
									}}
									value={this.state.property}
								/>
							</TreeViewItemContainer>
							{this.state.model && this.state.property ? (
								<TreeViewMenu
									title="Execute"
									onClick={() => {
										this.props.graphOperation([
											...CreateModelPropertyGetterDC({
												model: this.state.model,
												property: this.state.property,
												propertyName: UIA.GetNodeTitle(this.state.property),
												modelName: UIA.GetNodeTitle(this.state.model),
												callback: (context) => {
													temp = context.entry;
												}
											}),
											{
												operation: UIA.ADD_LINK_BETWEEN_NODES,
												options() {
													return {
														source: currentNode.id,
														target: temp,
														properties: { ...LinkProperties.DataChainLink }
													};
												}
											}
										]);
									}}
								/>
							) : null}
						</TreeViewMenu>
						<TreeViewMenu
							title="Connect to Title Service"
							active
							onClick={() => {
								this.props.graphOperation([
									{
										operation: UIA.CONNECT_TO_TITLE_SERVICE,
										options: {
											id: currentNode.id
										}
									}
								]);
							}}
						/>
						<TreeViewMenu
							open={UIA.Visual(state, 'Attach View Model Data Chain')}
							title="Attach View Model Data Chain"
							description={_create_get_view_model.description}
							active
							onClick={() => {
								this.props.toggleVisual('Attach View Model Data Chain');
							}}
						>
							<TreeViewItemContainer>
								<TextInput
									label={Titles.ViewModel}
									placeholder={Titles.ViewModel}
									onChange={(value: any) => {
										this.setState({
											viewModelName: value
										});
									}}
									value={this.state.viewModelName}
								/>
							</TreeViewItemContainer>
							<TreeViewMenu
								title="Attach View Model Data Chain"
								active
								onClick={() => {
									this.props.graphOperation([
										..._create_get_view_model({
											viewModel: currentNode.id,
											model: this.state.viewModelName
										})
									]);
								}}
							/>
						</TreeViewMenu>
						{UIA.GetNodeTitle(currentNode) === 'viewModel' ? (
							<TreeViewMenu
								title="Setup View Model On Screen"
								open={UIA.Visual(state, `Setup View Model On Screen`)}
								active
								onClick={() => {
									// this.props.graphOperation(GetModelViewModelForList({}));
									this.props.toggleVisual(`Setup View Model On Screen`);
								}}
							>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Models}
										options={UIA.NodesByType(this.props.state, NodeTypes.Model).toNodeSelect()}
										onChange={(value: any) => {
											this.setState({
												model: value
											});
										}}
										value={this.state.model}
									/>
								</TreeViewItemContainer>
								{this.state.model ? (
									<TreeViewMenu
										title="Execute"
										onClick={() => {
											this.props.graphOperation(
												GetModelViewModelForList({
													model: this.state.model,
													modelViewName: UIA.GetNodeTitle(this.state.model),
													viewModel: currentNode.id
												})
											);
										}}
									/>
								) : null}
							</TreeViewMenu>
						) : null}
					</TreeViewMenu>
				];
			case NodeTypes.Executor:
				// UpdateUserExecutor
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title={`${Titles.Add} Update User`}
							onClick={() => {
								this.props.graphOperation(UpdateUserExecutor({ node0: currentNode.id }));
							}}
						/>
						<TreeViewMenu
							title="Have all properties"
							onClick={() => {
								const steps = AddAllPropertiesToExecutor({ currentNode });
								this.props.graphOperation(steps);
							}}
						/>
						<TreeViewMenu
							title="Clear all properties"
							onClick={() => {
								const steps = ClearExecutor({ currentNode });
								this.props.graphOperation(steps);
							}}
						/>

						<TreeViewMenu
							title={AddCopyPropertiesToExecutor.title}
							description={AddCopyPropertiesToExecutor.description}
							onClick={() => {
								const result = AddCopyPropertiesToExecutor({
									currentNode,
									executor: UIA.GetNodeProp(currentNode, NodeProperties.Executor)
								});
								this.props.graphOperation(result);
							}}
						/>
					</TreeViewMenu>
				];
			case NodeTypes.Condition:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'condition OPERATIONS')}
						active
						title={`Condition ${Titles.Operations}`}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('condition OPERATIONS');
						}}
					>
						<TreeViewMenu
							open={UIA.Visual(state, 'Validations')}
							active
							title="Validations"
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Validations');
							}}
						>
							{' '}
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Key}
									options={Object.keys(FunctionTemplateKeys).map((x) => ({
										title: x,
										value: FunctionTemplateKeys[x],
										id: FunctionTemplateKeys[x]
									}))}
									onChange={(value: any) => {
										this.setState({
											key: value
										});
									}}
									value={this.state.key}
								/>
							</TreeViewItemContainer>
							{this.state.key ? (
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Properties}
										options={UIA.GetModelPropertyChildren(
											UIA.GetFunctionMethodKey(UIA.GetValidationNode(currentNode.id)),
											this.state.key
										).toNodeSelect()}
										onChange={(value: any) => {
											this.setState({
												property: value
											});
										}}
										value={this.state.property}
									/>
								</TreeViewItemContainer>
							) : null}
							<TreeViewMenu
								active
								title={NameLikeValidation.title}
								description={NameLikeValidation.description}
								onClick={() => {
									const validation = UIA.GetValidationNode(currentNode.id);
									const methodNode = UIA.GetMethodNode(validation ? validation.id : null);
									const result = NameLikeValidation({
										condition: currentNode.id,
										property: this.state.property,
										methodKey: this.state.key,
										methodType: UIA.GetNodeProp(methodNode, NodeProperties.FunctionType)
									});
									this.props.graphOperation(result);
								}}
							/>
							<TreeViewMenu
								active
								title={DescriptionLikeValidation.title}
								description={DescriptionLikeValidation.description}
								onClick={() => {
									const validation = UIA.GetValidationNode(currentNode.id);
									const methodNode = UIA.GetMethodNode(validation ? validation.id : null);
									const result = DescriptionLikeValidation({
										condition: currentNode.id,
										property: this.state.property,
										methodKey: this.state.key,
										methodType: UIA.GetNodeProp(methodNode, NodeProperties.FunctionType)
									});
									this.props.graphOperation(result);
								}}
							/>
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.Model:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'OPERATIONS')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('OPERATIONS');
						}}
					>
						<TreeViewMenu
							title={`${Titles.Add} Name|Description`}
							onClick={() => {
								this.props.graphOperation(AddNameDescription({ node0: currentNode.id }));
							}}
						/>
						<TreeViewMenu
							title={`Make Mapping`}
							open={UIA.Visual(state, `Make Mapping`)}
							active
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual(`Make Mapping`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.OptionsType}
									options={UIA.NodesByType(null, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											mapTarget: value
										});
									}}
									value={this.state.mapTarget}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<TextInput
									label={Titles.MapTarget}
									onChange={(value: any) => {
										this.setState({
											mapTargetName: value
										});
									}}
									value={this.state.mapTargetName}
								/>
							</TreeViewItemContainer>
							<TreeViewMenu
								title={`${Titles.Execute}`}
								onClick={() => {
									let newNode: any;
									let { mapTargetName, mapTarget } = this.state;

									DuplicateModel({
										model: currentNode.id,
										mapTargetName: 'Mapping',
										callback: (node: Node) => {
											newNode = node;
										}
									});

									DuplicateModelsProperties({
										model: currentNode.id,
										currentNodeId: newNode.id
									});
									AddMappingProperty({
										newNodeId: newNode.id,
										mapTargetName,
										mapTarget
									});
								}}
							/>
						</TreeViewMenu>
						<TreeViewMenu
							title={`Make Mapping Deluxe`}
							open={UIA.Visual(state, `Make Mapping Deluxe`)}
							active
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual(`Make Mapping Deluxe`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.OptionsType}
									options={UIA.NodesByType(null, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											mapTarget: value
										});
									}}
									value={this.state.mapTarget}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<TextInput
									label={Titles.MapTarget}
									onChange={(value: any) => {
										this.setState({
											mapTargetName: value
										});
									}}
									value={this.state.mapTargetName}
								/>
							</TreeViewItemContainer>
							<TreeViewMenu
								title={`${Titles.Execute}`}
								onClick={() => {
									let newNode: any;
									let { mapTargetName, mapTarget } = this.state;

									DuplicateModel({
										model: currentNode.id,
										mapTargetName: 'Mapping',
										callback: (node: Node) => {
											newNode = node;
										}
									});

									DuplicateModelsProperties({
										model: currentNode.id,
										currentNodeId: newNode.id
									});
									AddMappingProperty({
										newNodeId: newNode.id,
										mapTargetName,
										mapTarget
									});
									BuildReferenceObject({
										model: currentNode.id,
										model2: newNode.id
									});
								}}
							/>
						</TreeViewMenu>
						<TreeViewMenu
							title={`${Titles.DuplicateProperties}`}
							open={UIA.Visual(state, Titles.DuplicateProperties)}
							active
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual(Titles.DuplicateProperties);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.OptionsType}
									options={UIA.NodesByType(null, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											model: value
										});
									}}
									value={this.state.model}
								/>
							</TreeViewItemContainer>

							<TreeViewMenu
								title={`${Titles.Copy}`}
								onClick={() => {
									DuplicateModelsProperties({
										model: this.state.model,
										currentNodeId: currentNode.id
									});
								}}
							/>
						</TreeViewMenu>
						<TreeViewMenu
							title="Create Claim Service(Agent)"
							onClick={() => {
								const claimService = UIA.GetNodeByProperties({
									[NodeProperties.NODEType]: NodeTypes.ClaimService
								});
								if (!claimService) {
									let claimServiceExecutor = null;

									this.props.graphOperation(
										[
											...CreateStandardClaimService({
												modelName: UIA.GetNodeTitle(currentNode),
												model: currentNode.id,
												user: UIA.GetNodeProp(currentNode, NodeProperties.UIUser),
												callback: (claimServiceContext) => {
													claimServiceExecutor = claimServiceContext.executor;
												}
											}),
											function(currentGraph) {
												const steps = AddCopyPropertiesToExecutor({
													currentNode: claimServiceExecutor,
													executor: UIA.GetNodeProp(
														claimServiceExecutor,
														NodeProperties.Executor,
														currentGraph
													)
												});
												return steps;
											}
										],
										null,
										'standard-claim-service'
									);
								}
							}}
						/>
						<TreeViewMenu
							title="Setup Fetch Result"
							onClick={() => {
								const connectedNodes = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
									id: currentNode.id,
									link: LinkType.FetchServiceOuput
								});
								if (connectedNodes.length) {
									this.props.graphOperation(
										CreatePropertiesForFetch({
											id: currentNode.id
										})
									);
								}
							}}
						/>
					</TreeViewMenu>
				];
			case NodeTypes.ScreenOption:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'ComponentNode')}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('ComponentNode');
						}}
					>
						<TreeViewMenu
							title={Titles.AddButtonToComponent}
							onClick={() => {
								this.props.graphOperation(AddButtonToComponent({ component: currentNode.id }));
							}}
						/>
						<TreeViewMenu
							title="Add Text"
							onClick={() => {
								this.props.graphOperation(
									AddButtonToComponent({
										componentType: ComponentTypeKeys.Text,
										component: currentNode.id
									})
								);
							}}
						/>

						<TreeViewMenu
							title={Titles.AddLifeCylceEvents}
							onClick={() => {
								this.props.graphOperation(
									SCREEN_COMPONENT_EVENTS.filter(
										(x) =>
											!GetNodesLinkedTo(UIA.GetCurrentGraph(), {
												id: currentNode.id,
												link: LinkType.LifeCylceMethod
											}).find((_y) => UIA.GetNodeProp(_y, NodeProperties.EventType) === x)
									).map((t) => ({
										operation: UIA.ADD_NEW_NODE,
										options() {
											return {
												nodeType: NodeTypes.LifeCylceMethod,
												properties: {
													[NodeProperties.EventType]: t,
													[NodeProperties.Pinned]: false,
													[NodeProperties.UIText]: `${t}`
												},
												links: [
													{
														target: currentNode.id,
														linkProperties: {
															properties: {
																...LinkProperties.LifeCylceMethod
															}
														}
													}
												]
											};
										}
									}))
								);
							}}
						/>
						<AddComponentMenu />
						<TreeViewMenu
							open={UIA.Visual(state, 'Add Menu')}
							active
							title={Titles.AddMenu}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Add Menu');
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.OptionsType}
									options={Object.keys(MenuTreeOptions).map((v) => ({ title: v, value: v, id: v }))}
									onChange={(value: any) => {
										this.setState({
											menuTreeOption: value
										});
									}}
									value={this.state.menuTreeOption}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<TextInput
									label={Titles.Name}
									onChange={(value: any) => {
										this.setState({
											menuName: value
										});
									}}
									value={this.state.menuName}
								/>
							</TreeViewItemContainer>
							{this.state.menuName && MenuTreeOptions[this.state.menuTreeOption] ? (
								<TreeViewMenu
									title={Titles.AddMenu}
									onClick={() => {
										if (this.state.menuName && MenuTreeOptions[this.state.menuTreeOption]) {
											this.props.graphOperation(
												AddMenuToComponent({
													menu_name: this.state.menuName,
													uiType: UIA.GetNodeProp(currentNode, NodeProperties.UIType),
													navigate_function: MenuTreeOptions[
														this.state.menuTreeOption
													].navigate_function(),
													menuGeneration: MenuTreeOptions[
														this.state.menuTreeOption
													].menuGeneration(),
													buildMethod: MenuTreeOptions[this.state.menuTreeOption].buildMethod,
													component: currentNode.id
												})
											);
										}
									}}
								/>
							) : null}
						</TreeViewMenu>
					</TreeViewMenu>,
					layoutoptions()
				];
			case NodeTypes.ComponentNode:
				const componentType = UIA.GetNodeProp(currentNode, NodeProperties.ComponentType);
				const uiType = UIA.GetNodeProp(currentNode, NodeProperties.UIType);
				let parent = null;
				if (
					ComponentTypes[uiType] &&
					ComponentTypes[uiType][componentType] &&
					ComponentTypes[uiType][componentType].layout &&
					UIA.Visual(state, 'Reattach Component')
				) {
					parent = UIA.GetParentComponent(currentNode);
					//  GetNodesLinkedTo(graph, {
					//   id: currentNode.id,
					//   link: LinkType.Component,
					//   direction: TARGET
					// })[0];
				}
				return [
					<TreeViewMenu
						open={UIA.Visual(state, 'Component-Lineage')}
						active
						title={'Component-Lineage'}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('Component-Lineage');
						}}
					>
						<TreeViewMenu
							active
							title="Check Lineage"
							toggle={() => {
								let lineage = getComponentLineage(UIA.GetCurrentGraph(), currentNode);
								console.log(lineage);
								let topComponent = getTopComponent(UIA.GetCurrentGraph(), currentNode);
								console.log(topComponent);
								let parentCollectionReference = getParentCollectionReference(
									UIA.GetCurrentGraph(),
									currentNode
								);
								console.log(parentCollectionReference);
							}}
						/>
						<TreeViewMenu
							active
							title="Pin Lineage"
							toggle={() => {
								let lineage = getComponentLineage(UIA.GetCurrentGraph(), currentNode);
								console.log(lineage);
								this.props.pin(lineage);
								// let topComponent = getTopComponent(UIA.GetCurrentGraph(), currentNode);
								// console.log(topComponent);
								let parentCollectionReference = getParentCollectionReference(
									UIA.GetCurrentGraph(),
									currentNode
								);
								console.log(parentCollectionReference);
								// window.sortComponentByLineage = sortComponentByLineage;
							}}
						/>
						<TreeViewMenu
							active
							title="Delete "
							toggle={() => {
								let graph = UIA.GetCurrentGraph();
								let lineage = getComponentLineage(graph, currentNode);
								console.log(lineage);
								let collectionReferences = lineage
									.map((x: any) => getCollectionReference(graph, { id: x }))
									.map((x: any) => x.id);
							}}
						/>
					</TreeViewMenu>,
					<TreeViewMenu
						open={UIA.Visual(state, 'Styling')}
						active
						title={Titles.Styling}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('Styling');
						}}
					>
						{layoutoptions()}
						<TreeViewMenu
							open={UIA.Visual(state, 'Create Form')}
							active
							title="Create Form"
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Create Form');
							}}
						>
							<TreeViewItemContainer>
								<TextInput
									immediate
									label={Titles.Name}
									placeholder={Titles.EnterName}
									onChange={(value: any) => {
										this.setState({
											viewName: value
										});
									}}
									value={this.state.viewName}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.Models}
									options={UIA.NodesByType(this.props.state, NodeTypes.Model).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											model: value
										});
									}}
									value={this.state.model}
								/>
							</TreeViewItemContainer>
							<TreeViewButtonGroup>
								<TreeViewGroupButton
									title="Create Form"
									onClick={() => {
										this.props.graphOperation(
											CreateForm({
												component: currentNode.id,
												model: this.state.model,
												viewName: this.state.viewName
											})
										);
									}}
									icon="fa fa-plus"
								/>
							</TreeViewButtonGroup>
						</TreeViewMenu>
						<TreeViewMenu
							title={Titles.AddDataChain}
							onClick={() => {
								this.props.graphOperation([
									{
										operation: UIA.ADD_NEW_NODE,
										options() {
											return {
												nodeType: NodeTypes.DataChain,
												linkProperties: {
													properties: { ...LinkProperties.DataChainLink }
												},
												parent: currentNode.id,
												properties: {
													[NodeProperties.UIText]: `data chain`
												},
												groupProperties: {}
											};
										}
									}
								]);
							}}
						/>
						<TreeViewMenu
							title={Titles.AddSelector}
							onClick={() => {
								this.props.graphOperation([
									{
										operation: UIA.ADD_NEW_NODE,
										options() {
											return {
												nodeType: NodeTypes.Selector,
												linkProperties: {
													properties: { ...LinkProperties.SelectorLink }
												},
												parent: currentNode.id,
												properties: {
													[NodeProperties.UIText]: `select internal variables`,
													[NodeProperties.SelectorType]: SelectorType.InternalProperties
												},
												groupProperties: {}
											};
										}
									}
								]);
							}}
						/>
					</TreeViewMenu>,
					<TreeViewMenu
						open={UIA.Visual(state, 'ComponentNode')}
						active
						title={Titles.Layout}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual('ComponentNode');
						}}
					>
						<TreeViewMenu
							title={Titles.AddLifeCylceEvents}
							onClick={() => {
								this.props.graphOperation(
									SCREEN_COMPONENT_EVENTS.filter(
										(x) =>
											!GetNodesLinkedTo(UIA.GetCurrentGraph(), {
												id: currentNode.id,
												link: LinkType.LifeCylceMethod
											}).find((_y) => UIA.GetNodeProp(_y, NodeProperties.Event) === x)
									).map((t) => ({
										operation: UIA.ADD_NEW_NODE,
										options() {
											return {
												nodeType: NodeTypes.LifeCylceMethod,
												properties: {
													[NodeProperties.EventType]: t,
													[NodeProperties.Pinned]: false,
													[NodeProperties.UIText]: `${t}`
												},
												links: [
													{
														target: currentNode.id,
														linkProperties: {
															properties: {
																...LinkProperties.LifeCylceMethod
															}
														}
													}
												]
											};
										}
									}))
								);
							}}
						/>
						<TreeViewMenu
							title={Titles.AddButtonToComponent}
							onClick={() => {
								this.props.graphOperation(AddButtonToComponent({ component: currentNode.id }));
							}}
						/>
						<TreeViewMenu
							title={Titles.AddTitleToComponent}
							onClick={() => {
								this.props.graphOperation(AddTitleToComponent({ component: currentNode.id }));
							}}
						/>
						<TreeViewMenu
							open={UIA.Visual(state, `${currentNodeType} eventtype`)}
							active
							title={Titles.AddEvent}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual(`${currentNodeType} eventtype`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									options={Object.keys(ComponentEvents).map((v) => ({
										title: v,
										id: v,
										value: v
									}))}
									label={Titles.Select}
									onChange={(value: any) => {
										this.setState({ eventType: value });
									}}
									value={this.state.eventType}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									options={[ true, false ].map((v) => ({
										title: `${v}`,
										id: v,
										value: v
									}))}
									label={Titles.IncludeEventHandler}
									onChange={(value: any) => {
										this.setState({ eventTypeHandler: value });
									}}
									value={this.state.eventTypeHandler}
								/>
							</TreeViewItemContainer>
							{this.state.eventType ? (
								<TreeViewMenu
									title={Titles.AddEvent}
									onClick={() => {
										const properties = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
											id: currentNode.id,
											link: LinkType.DefaultViewType
										}).filter(
											(x) => UIA.GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Property
										);

										this.props.graphOperation(
											AddEvent({
												component: currentNode.id,
												eventType: this.state.eventType,
												eventTypeHandler: properties.length
													? this.state.eventTypeHandler
													: false,
												property: properties.length ? properties[0].id : null
											})
										);
									}}
								/>
							) : null}
						</TreeViewMenu>
						<AddComponentMenu />
						<TreeViewMenu
							open={UIA.Visual(state, 'Reattach Component')}
							active
							title={Titles.ReattachComponent}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual('Reattach Component');
							}}
						>
							{parent ? (
								<TreeViewItemContainer>
									<SelectInput
										options={GetNodesLinkedTo(UIA.GetCurrentGraph(), {
											id: parent.id,
											link: LinkType.Component
										})
											.filter((x) => x.id !== currentNode.id)
											.toNodeSelect()}
										label={Titles.ComponentType}
										onChange={(value: any) => {
											this.setState({ component: value });
										}}
										value={this.state.component}
									/>
								</TreeViewItemContainer>
							) : null}
							{parent && this.state.component ? (
								<TreeViewMenu
									title={Titles.Execute}
									onClick={() => {
										this.props.graphOperation(
											ReattachComponent({
												component: this.state.component,
												base: currentNode.id,
												parent: parent.id
											})
										);
									}}
								/>
							) : null}
						</TreeViewMenu>
					</TreeViewMenu>
				];
			case NodeTypes.Validator:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, NodeTypes.Validator)}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual(NodeTypes.Validator);
						}}
					>
						<TreeViewItemContainer>
							<SelectInput
								options={UIA.NodesByType(this.props.state, NodeTypes.Validator)
									.toNodeSelect()
									.filter((x) => x.id !== currentNode.id)}
								label={Titles.CopyValidationConditions}
								onChange={(value: any) => {
									this.setState({ validator: value });
								}}
								value={this.state.validator}
							/>
						</TreeViewItemContainer>
						{this.state.validator ? (
							<TreeViewMenu
								title={Titles.Execute}
								onClick={() => {
									const conditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
										id: this.state.validator,
										link: LinkType.Condition
									}).map((v) => UIA.GetNodeProp(v, NodeProperties.Condition));
									const method = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
										id: this.state.validator,
										link: LinkType.FunctionOperator
									}).find((x) => x);
									const currentConditions = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
										id: currentNode.id,
										link: LinkType.Condition
									});
									const currentNodeMethod = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
										id: currentNode.id,
										link: LinkType.FunctionOperator
									}).find((x) => x);
									const functionType = UIA.GetNodeProp(method, NodeProperties.FunctionType);
									const currentNodeMethodFunctionType = UIA.GetNodeProp(
										currentNodeMethod,
										NodeProperties.FunctionType
									);
									const result = [];
									currentConditions.map((cc) => {
										result.push({
											operation: UIA.REMOVE_NODE,
											options() {
												return {
													id: cc.id
												};
											}
										});
									});
									conditions.map((condition) => {
										result.push({
											operation: UIA.ADD_NEW_NODE,
											options() {
												const temp = JSON.parse(JSON.stringify(condition));
												temp.methods[currentNodeMethodFunctionType] =
													temp.methods[functionType];
												delete temp.methods[functionType];
												return {
													nodeType: NodeTypes.Condition,
													properties: {
														[NodeProperties.Condition]: temp
													},
													parent: currentNode.id,
													groupProperties: {},
													linkProperties: {
														properties: {
															...LinkProperties.ConditionLink
														}
													}
												};
											}
										});
									});
									this.props.graphOperation(result);
								}}
							/>
						) : null}
					</TreeViewMenu>
				];
			case NodeTypes.ModelFilter:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, NodeTypes.ModelFilter)}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual(NodeTypes.ModelFilter);
						}}
					/>
				];
			case NodeTypes.Permission:
				// getNodePropertyGuids()
				return [
					<TreeViewMenu
						open={UIA.Visual(state, NodeTypes.Permission)}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual(NodeTypes.Permission);
						}}
					>
						<TreeViewItemContainer>
							<SelectInput
								options={UIA.NodesByType(this.props.state, NodeTypes.Permission)
									.toNodeSelect()
									.filter((x) => x.id !== currentNode.id)}
								label={Titles.CopyPermissionConditions}
								onChange={(value: any) => {
									this.setState({ permission: value });
								}}
								value={this.state.permission}
							/>
						</TreeViewItemContainer>
						{this.state.permission ? (
							<TreeViewMenu
								title={Titles.Execute}
								onClick={() => {
									const result = CopyPermissionConditions({
										permission: this.state.permission,
										node: currentNode.id
									});
									this.props.graphOperation(result);
								}}
							/>
						) : null}
						<TreeViewMenu
							active
							onClick={() => {
								const permissions = UIA.NodesByType(null, NodeTypes.Permission);
								const result = [];
								permissions.filter((x) => x.id !== currentNode.id).map((permission) => {
									result.push(
										...CopyPermissionConditions({
											permission: currentNode.id,
											node: permission.id
										})
									);
								});
								this.props.graphOperation(result);
							}}
							title={Titles.CopyToAll}
						/>
					</TreeViewMenu>
				];
			case NodeTypes.ViewType:
				return [
					<TreeViewMenu
						open={UIA.Visual(state, currentNodeType)}
						active
						title={Titles.Operations}
						innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
						toggle={() => {
							this.props.toggleVisual(currentNodeType);
						}}
					>
						<TreeViewMenu
							open={UIA.Visual(state, `${currentNodeType} eventtype`)}
							active
							title={Titles.AddEvent}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual(`${currentNodeType} eventtype`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									options={Object.keys(ComponentEvents).map((v) => ({
										title: v,
										id: v,
										value: v
									}))}
									label={Titles.Select}
									onChange={(value: any) => {
										this.setState({ eventType: value });
									}}
									value={this.state.eventType}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									options={[ true, false ].map((v) => ({
										title: `${v}`,
										id: v,
										value: v
									}))}
									label={Titles.IncludeEventHandler}
									onChange={(value: any) => {
										this.setState({ eventTypeHandler: value });
									}}
									value={this.state.eventTypeHandler}
								/>
							</TreeViewItemContainer>
							{this.state.eventType ? (
								<TreeViewMenu
									title={Titles.AddEvent}
									onClick={() => {
										const properties = GetNodesLinkedTo(UIA.GetCurrentGraph(), {
											id: currentNode.id,
											link: LinkType.DefaultViewType
										}).filter(
											(x) => UIA.GetNodeProp(x, NodeProperties.NODEType) === NodeTypes.Property
										);

										this.props.graphOperation(
											AddEvent({
												component: currentNode.id,
												eventType: this.state.eventType,
												eventTypeHandler: properties.length
													? this.state.eventTypeHandler
													: false,
												property: properties.length ? properties[0].id : null
											})
										);
									}}
								/>
							) : null}
						</TreeViewMenu>
						<TreeViewMenu
							title={Titles.AddSharedViewModel}
							description={AttachDataChainsToViewTypeViewModel.description}
							onClick={() => {
								this.props.graphOperation(
									AttachDataChainsToViewTypeViewModel({
										viewType: currentNode.id
									})
								);
							}}
						/>
						<TreeViewMenu
							open={UIA.Visual(state, `setup view type`)}
							active
							title={Titles.SetupViewType}
							innerStyle={{ maxHeight: MAX_CONTENT_MENU_HEIGHT, overflowY: 'auto' }}
							toggle={() => {
								this.props.toggleVisual(`setup view type`);
							}}
						>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.LoadModelsOnComponentMount}
									options={GetFunctionToLoadModels(currentNode).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											functionToLoadModels: value
										});
									}}
									value={this.state.functionToLoadModels}
								/>
							</TreeViewItemContainer>
							<TreeViewItemContainer>
								<SelectInput
									label={Titles.MethodThatValidationComesFrom}
									options={GetValidationMethodForViewTypes(currentNode).toNodeSelect()}
									onChange={(value: any) => {
										this.setState({
											validationMethod: value
										});
									}}
									value={this.state.validationMethod}
								/>
							</TreeViewItemContainer>
							<TreeViewMenu
								title={Titles.Execute}
								description="Setup ViewType"
								onClick={() => {
									this.props.graphOperation(
										SetupViewTypeFor({
											node: currentNode.id,
											validationMethod: this.state.validationMethod,
											functionToLoadModels: this.state.functionToLoadModels,
											eventType: 'onChange',
											eventTypeHandler: true
										})
									);
								}}
							/>
						</TreeViewMenu>
					</TreeViewMenu>
				];
		}
		return [];
	}

	apiMenu() {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
		switch (currentNodeType) {
			case NodeTypes.DataChain:
				return [ this.getDataChainContextMenu() ];
			case NodeTypes.ComponentNode:
				const componentType = UIA.GetNodeProp(currentNode, NodeProperties.ComponentType);
				switch (componentType) {
					case 'Button':
						return [ this.getButtonApiMenu(currentNode) ];
					default:
						return [ this.getGenericComponentApiMenu(currentNode) ];
				}
				break;
			default:
				break;
		}
		return [];
	}

	eventMenu(): any[] {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
		switch (currentNodeType) {
			case NodeTypes.ComponentNode:
				const componentType = UIA.GetNodeProp(currentNode, NodeProperties.ComponentType);
				switch (componentType) {
					case 'Menu':
					case 'Button':
						return [ this.getButtonEventMenu(currentNode) ];
				}
				break;
		}
		return [];
	}

	getContextMenu(): any[] {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const currentNodeType = UIA.GetNodeProp(currentNode, NodeProperties.NODEType);
		switch (currentNodeType) {
			case NodeTypes.ComponentNode:
			case NodeTypes.Screen:
			case NodeTypes.ScreenOption:
			case NodeTypes.EventMethodInstance:
			default:
				return this.getGenericLinks(currentNode);
		}
		return [];
	}

	getViewTypes() {
		return <ViewTypeMenu />;
	}

	getButtonApiMenu(currentNode) {
		const { state } = this.props;
		return (
			<TreeViewMenu
				open={UIA.Visual(state, Titles.ComponentAPIMenu)}
				active
				title={Titles.ComponentAPIMenu}
				toggle={() => {
					this.props.toggleVisual(Titles.ComponentAPIMenu);
				}}
			>
				<TreeViewMenu
					title={`${Titles.Add} Label`}
					onClick={() => {
						this.props.addComponentApiNodes(currentNode.id, 'label');
					}}
				/>
				<TreeViewMenu
					title={`${Titles.Add} Value`}
					onClick={() => {
						this.props.addComponentApiNodes(currentNode.id, 'value');
					}}
				/>
				<TreeViewMenu
					title={`${Titles.Add} ViewModel`}
					onClick={() => {
						this.props.addComponentApiNodes(currentNode.id, 'viewModel');
					}}
				/>
			</TreeViewMenu>
		);
	}

	getGenericComponentApiMenu(currentNode) {
		const { state } = this.props;
		return (
			<TreeViewMenu
				open={UIA.Visual(state, Titles.ComponentAPIMenu)}
				active
				title={Titles.ComponentAPIMenu}
				toggle={() => {
					this.props.toggleVisual(Titles.ComponentAPIMenu);
				}}
			>
				<TreeViewMenu
					title={`${Titles.Add} Label`}
					onClick={() => {
						this.props.addComponentApiNodes(currentNode.id, 'label');
					}}
				/>
				<TreeViewMenu
					title={`${Titles.Add} Value`}
					onClick={() => {
						this.props.addComponentApiNodes(currentNode.id, 'value');
					}}
				/>
				<TreeViewMenu
					title={`${Titles.Add} Custom`}
					open={UIA.Visual(state, 'Custom Api Menu')}
					active
					onClick={() => {
						// this.props.addComponentApiNodes(currentNode.id, "value");
						this.props.toggleVisual('Custom Api Menu');
					}}
				>
					<TreeViewItemContainer>
						<TextInput
							immediate
							label={Titles.Name}
							placeholder={Titles.EnterName}
							onChange={(value: any) => {
								this.setState({
									customApi: value
								});
							}}
							value={this.state.customApi}
						/>
					</TreeViewItemContainer>
					{this.state.customApi ? (
						<TreeViewMenu
							title={`${Titles.Add} ${this.state.customApi}`}
							onClick={() => {
								this.props.addComponentApiNodes(currentNode.id, this.state.customApi);
							}}
						/>
					) : null}
				</TreeViewMenu>
			</TreeViewMenu>
		);
	}

	getButtonEventMenu(currentNode) {
		const { state } = this.props;
		switch (UIA.GetNodeProp(currentNode, NodeProperties.UIType)) {
			case UITypes.ReactNative:
				return (
					<TreeViewMenu
						open={UIA.Visual(state, Titles.Events)}
						active
						title={Titles.Events}
						toggle={() => {
							this.props.toggleVisual(Titles.Events);
						}}
					>
						<TreeViewMenu
							title={`${Titles.Add} onPress`}
							onClick={() => {
								this.props.addComponentEventTo(currentNode.id, 'onPress');
							}}
						/>
					</TreeViewMenu>
				);
			case UITypes.ElectronIO:
			case UITypes.ReactWeb:
				return (
					<TreeViewMenu open active title={Titles.Events} toggle={() => {}}>
						<TreeViewMenu
							title={`${Titles.Add} onClick`}
							onClick={() => {
								this.props.addComponentEventTo(currentNode.id, 'onClick');
							}}
						/>
					</TreeViewMenu>
				);
		}
	}

	getComponentExternalMenu(currentNode) {
		const { state } = this.props;
		return (
			<TreeViewMenu
				open
				active
				title={Titles.Select}
				open={UIA.Visual(state, Titles.Select)}
				toggle={() => {
					this.props.toggleVisual(Titles.Select);
				}}
			>
				<TreeViewMenu
					title={LinkType.ComponentExternalConnection}
					onClick={() => {
						this.props.togglePinnedConnectedNodesByLinkType(
							currentNode.id,
							LinkType.ComponentExternalConnection
						);
					}}
				/>
				<TreeViewMenu
					title={LinkType.SelectorLink}
					onClick={() => {
						this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.SelectorLink);
					}}
				/>
				<TreeViewMenu
					title={LinkType.DataChainLink}
					onClick={() => {
						this.props.togglePinnedConnectedNodesByLinkType(currentNode.id, LinkType.DataChainLink);
					}}
				/>
			</TreeViewMenu>
		);
	}

	getGenericLinks(current) {
		if (!current || !current.id) {
			return [];
		}
		const { state } = this.props;
		const linkTypes = UIA.GetNodesLinkTypes(current.id);
		return [
			<TreeViewMenu
				active
				title={Titles.Select}
				open={UIA.Visual(state, Titles.Select)}
				toggle={() => {
					this.props.toggleVisual(Titles.Select);
				}}
			>
				{linkTypes.map((linkType) => (
					<TreeViewMenu
						key={linkType}
						title={linkType}
						onClick={() => {
							this.props.togglePinnedConnectedNodesByLinkType(current.id, linkType);
						}}
					/>
				))}
			</TreeViewMenu>
		];
	}

	getModelMenu() {
		return <ModelContextMenu />;
	}

	getComponentNodeMenu() {
		return <ComponentNodeMenu />;
	}

	getConditionMenu() {
		return <ConditionContextMenu />;
	}

	getDataChainContextMenu() {
		return <DataChainContextMenu />;
	}

	getDefaultMenu() {
		const { state } = this.props;
		const graph = UIA.GetCurrentGraph(state);
		return (
			<TreeViewButtonGroup>
				<TreeViewGroupButton
					title={Titles.ClearMarked}
					onClick={() => {
						UIA.clearMarked();
					}}
					icon="fa  fa-stop"
				/>
				<TreeViewGroupButton
					title={Titles.SelectAllConnected}
					onClick={() => {
						this.props.selectAllConnected(UIA.Visual(state, UIA.SELECTED_NODE));
					}}
					icon="fa fa-arrows-alt"
				/>
				<TreeViewGroupButton
					title={Titles.SelectViewPackage}
					onClick={() => {
						this.props.selectAllInViewPackage(UIA.Visual(state, UIA.SELECTED_NODE));
					}}
					icon="fa fa-shopping-cart"
				/>
				<TreeViewGroupButton
					title={Titles.PinSelected}
					onClick={() => {
						this.props.pinSelected();
					}}
					icon="fa fa-map-pin"
				/>
				<TreeViewGroupButton
					title={Titles.UnPinSelected}
					onClick={() => {
						this.props.unPinSelected();
					}}
					icon="fa fa-houzz"
				/>
				<TreeViewGroupButton
					title={`${Titles.DeleteAllSelected}(${graph ? graph.selected : '0'})`}
					onClick={() => {
						this.props.deleteAllSelected();
					}}
					icon="fa fa-minus"
				/>
			</TreeViewButtonGroup>
		);
	}

	setSecondaryMenu(menu) {
		this.setState({ secondaryMenu: menu });
	}

	getDoubleWideContent() {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (currentNode) {
			switch (this.state.secondaryMenu) {
				case SecondaryOptions.LayoutOptions:
					return <LayoutOptions />;
			}
		}
		return null;
	}

	render() {
		const { state } = this.props;
		const exit = () => {
			this.props.setVisual(UIA.CONTEXT_MENU_MODE, null);
		};
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const display = UIA.Visual(state, UIA.CONTEXT_MENU_MODE) ? 'block' : 'none';
		const nodeType = UIA.Visual(state, UIA.CONTEXT_MENU_MODE)
			? UIA.GetNodeProp(currentNode, NodeProperties.NODEType)
			: null;
		const menuMode = UIA.Visual(state, UIA.CONTEXT_MENU_MODE);
		const menuitems = this.getMenuMode(menuMode);
		const defaultMenus = this.getDefaultMenu();
		return (
			<Draggable handle=".draggable-header,.draggable-footer">
				<div
					className="context-menu modal-dialog modal-info"
					style={{
						zIndex: 1000,
						position: 'fixed',
						width: this.state.secondaryMenu ? 500 : 250,
						display,
						top: 250,
						left: 500
					}}
				>
					<div className="modal-content">
						<div className="modal-header draggable-header">
							<button
								type="button"
								onClick={() => {
									exit();
								}}
								className="close"
								data-dismiss="modal"
								aria-label="Close"
							>
								<span aria-hidden="true">×</span>
							</button>
						</div>
						<div className="modal-body" style={{ padding: 0 }}>
							<div
								className={this.state.secondaryMenu ? '' : 'row'}
								style={this.state.secondaryMenu ? { display: 'flex' } : {}}
							>
								<div
									className={this.state.secondaryMenu ? '' : 'col-md-12'}
									style={this.state.secondaryMenu ? { width: '50%' } : {}}
								>
									<GenericPropertyContainer active title="asdf" subTitle="afaf" nodeType={nodeType}>
										{defaultMenus}
										{menuitems}
									</GenericPropertyContainer>
								</div>
								{this.state.secondaryMenu ? (
									<div style={{ width: '50%' }}>
										<GenericPropertyContainer
											active
											title="asdf"
											subTitle="afaf"
											nodeType={nodeType}
										>
											{this.getDoubleWideContent()}
										</GenericPropertyContainer>
									</div>
								) : null}
							</div>
						</div>
						<div className="modal-footer draggable-footer">
							<button
								type="button"
								onClick={() => {
									exit();
								}}
								className="btn btn-outline pull-left"
								data-dismiss="modal"
							>
								Close
							</button>
							{/* <button type="button" className="btn btn-outline">Save changes</button> */}
						</div>
					</div>
				</div>
			</Draggable>
		);
	}
}

export default UIConnect(ContextMenu);
