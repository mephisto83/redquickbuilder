// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ButtonList from './buttonlist';
import TextBox from './textinput';
import { UITypes, NodeTypes } from '../constants/nodetypes';
import {
	GetSpecificModels,
	GetAllModels,
	CreateLoginModels,
	CreateDefaultView,
	AddAgentUser,
	CreateAgentFunction,
	addTitleService
} from '../constants/nodepackages';
import TreeViewMenu from './treeviewmenu';
import SideBar from './sidebar';
import SideBarMenu from './sidebarmenu';
import MainSideBar from './mainsidebar';
import { MethodFunctions, HTTP_METHODS } from '../constants/functiontypes';
import BatchMenu from './batchmenu';
import AgentBasedMethods from './agentbasedmethods';
import GetProjectUrlsDataChain from '../nodepacks/GetProjectUrlsDataChain';
import temppack from '../nodepacks/temppack';
import CreateDashboard_1 from '../nodepacks/CreateDashboard_1';
import CreateConfiguration from '../nodepacks/CreateConfiguration';
import CreateFetchServiceIdempotently from '../nodepacks/CreateFetchServiceIdempotently';
import { ViewTypes } from '../constants/viewtypes';
import CreateViewTypes from '../nodepacks/batch/CreateViewTypes';
import BuildAll from '../nodepacks/batch/BuildAll';
import { DistributeBuildAllJobs } from '../nodepacks/batch/BuildAllDistributed';
import StartJob from '../nodepacks/batch/StartJob';
import UpdateScreenUrls from '../nodepacks/screens/UpdateScreenUrls';
import JobService from '../jobs/jobservice';
import {
	CollectionScreenWithoutDatachainDistributed,
	CollectionConnectDataChainCollection
} from '../nodepacks/CollectionDataChainsIntoCollections';
import ApplyTemplates from '../nodepacks/permission/ApplyTemplates';
import ApplyValidationFromProperties from '../nodepacks/permission/ApplyValidationFromProperties';
import AddAgentMethods from '../nodepacks/batch/AddAgentMethods';
import CreateSmartDashboard from '../nodepacks/screens/dashboard/CreateSmartDashboard';

class QuickMethods extends Component<any, any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			selectedMethods: {}
		};
	}

	render() {
		const { state } = this.props;
		const sharedcontrolkey = 'View Package Shared Control';
		const use_as_default = 'Use As Default Shared Component';
		const use_as_plural = 'Create Components for 1 to Many Relationships';

		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		function getChosenChildren() {
			const chosenChildren = UIA.GetModelPropertyChildren(currentNode.id)
				.filter((child) => UIA.Visual(state, UIA.ChoseModel(child.id)))
				.map((x) => x.id);
			return chosenChildren;
		}
		const defaultParameters = () => ({
			viewName: UIA.Visual(state, 'View Package Title'),
			isSharedComponent: UIA.Visual(state, sharedcontrolkey),
			isDefaultComponent: UIA.Visual(state, sharedcontrolkey) && UIA.Visual(state, use_as_default),
			isPluralComponent: UIA.Visual(state, sharedcontrolkey) && UIA.Visual(state, use_as_plural),
			uiTypes: {
				[UITypes.ReactNative]: UIA.Visual(state, UITypes.ReactNative),
				[UITypes.ElectronIO]: UIA.Visual(state, UITypes.ElectronIO),
				[UITypes.VR]: UIA.Visual(state, UITypes.VR),
				[UITypes.ReactWeb]: UIA.Visual(state, UITypes.ReactWeb)
			},
			chosenChildren: getChosenChildren()
		});
		return (
			<MainSideBar relative>
				<SideBar open relative style={{ paddingTop: 0 }}>
					<SideBarMenu>
						<TreeViewMenu
							title={Titles.QuickMethods}
							open={UIA.Visual(state, Titles.QuickMethods)}
							active
							toggle={() => {
								this.props.toggleVisual(Titles.QuickMethods);
							}}
							icon="fa fa-tag"
						>
							<TreeViewMenu
								title={Titles.UIParameters}
								open={UIA.Visual(state, Titles.UIParameters)}
								active
								toggle={() => {
									this.props.toggleVisual(Titles.UIParameters);
								}}
								icon="fa fa-tag"
							>
								<BatchMenu />
								<TreeViewMenu
									title="Create Model by Agent"
									icon="fa fa-plus"
									onClick={() => {
										this.props.executeGraphOperation(currentNode, {
											type: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME),
											method: CreateAgentFunction({
												nodePackageType: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME),
												methodType:
													MethodFunctions[UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)].method,
												model: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_MODEL)),
												parentId: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_PARENT)),
												agent: UIA.GetNodeById(UIA.Visual(state, UIA.BATCH_AGENT)),
												httpMethod: HTTP_METHODS.POST,
												functionType: UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE),
												functionName: UIA.Visual(state, UIA.BATCH_FUNCTION_NAME)
											}),
											methodType: UIA.Visual(state, UIA.BATCH_FUNCTION_TYPE)
										});
									}}
								/>
							</TreeViewMenu>
							<TreeViewMenu
								title={Titles.AgentBaseMethods}
								open={UIA.Visual(state, Titles.AgentBaseMethods)}
								active
								toggle={() => {
									this.props.toggleVisual(Titles.AgentBaseMethods);
								}}
								icon="fa fa-tag"
							>
								<AgentBasedMethods />
							</TreeViewMenu>
							<TreeViewMenu
								title="More Commands"
								open={UIA.Visual(state, 'More Commands')}
								active
								toggle={() => {
									this.props.toggleVisual('More Commands');
								}}
								icon="fa fa-tag"
							>
								<TreeViewMenu
									title={GetSpecificModels.type}
									icon="fa fa-plus"
									onClick={() => {
										this.props.executeGraphOperation(currentNode, GetSpecificModels);
									}}
								/>
								<TreeViewMenu
									title="Get Project Urls Data Chain"
									icon="fa fa-plus"
									onClick={() => {
										this.props.graphOperation(GetProjectUrlsDataChain());
									}}
								/>
								<TreeViewMenu
									title="Test Command"
									icon="fa fa-plus"
									onClick={() => {
										this.props.graphOperation(temppack());
									}}
								/>
								<TreeViewMenu
									title={GetAllModels.type}
									icon="fa fa-plus"
									onClick={() => {
										this.props.executeGraphOperation(currentNode, GetAllModels);
									}}
								/>
								<TreeViewMenu
									title="Create Dashboard 1"
									icon="fa fa-plus"
									onClick={() => {
										this.props.graphOperation(CreateDashboard_1());
									}}
								/>
								<TreeViewMenu
									title="Create Fetch Service"
									icon="fa fa-plus"
									onClick={() => {
										this.props.graphOperation(CreateFetchServiceIdempotently());
									}}
								/>

								<TreeViewMenu
									title="Create Configuration"
									icon="fa fa-plus"
									onClick={() => {
										this.props.graphOperation(CreateConfiguration());
									}}
								/>

								<TreeViewMenu
									title={CreateLoginModels.type}
									icon="fa fa-plus"
									onClick={() => {
										this.props.executeGraphOperation(currentNode, CreateLoginModels, {
											[UITypes.ElectronIO]: true,
											[UITypes.ReactWeb]: true,
											[UITypes.ReactNative]: true
										});
									}}
								/>
								<TreeViewMenu
									title={AddAgentUser.type}
									icon="fa fa-plus"
									onClick={() => {
										this.props.executeGraphOperation(currentNode, AddAgentUser);
									}}
								/>
								<TreeViewMenu
									title={CreateViewTypes.title}
									icon="fa fa-plus"
									onClick={() => {
										this.props.graphOperation(CreateViewTypes());
									}}
								/>
								<TreeViewMenu
									title={BuildAll.title}
									icon="fa fa-plus"
									onClick={() => {
										this.props.setState();
										if (!this.state.buildingAll) {
											this.setState({ buildingAll: true });
											BuildAll(() => {});
										}
									}}
								/>
								<TreeViewMenu
									title={StartJob.title}
									icon="fa fa-plus"
									onClick={() => {
										this.props.setState();
										StartJob();
									}}
								/>
								<TreeViewMenu
									title={'Create Job'}
									icon="fa fa-plus"
									onClick={() => {
										this.props.setState();
										debugger;
										JobService.CreateJob('asdf', 10, NodeTypes.Screen);
									}}
								/>
								<TreeViewMenu
									title={'Update Screen Urls'}
									icon="fa fa-plus"
									onClick={() => {
										UpdateScreenUrls(() => {});
									}}
								/>
								<TreeViewMenu
									title={'CollectionConnectDataChainCollection'}
									onClick={() => {
										CollectionConnectDataChainCollection(() => {
											return true;
										});
									}}
								/>
								<TreeViewMenu
									title={'Add Title Service'}
									onClick={() => {
										this.props.graphOperation([ addTitleService({ newItems: {} }) ]);
									}}
								/>
								<TreeViewMenu
									title={'Apply Templates'}
									icon="fa fa-plus"
									onClick={() => {
										ApplyTemplates(null);
									}}
								/>
								<TreeViewMenu
									title={'Apply Validation From Properties'}
									icon="fa fa-plus"
									onClick={() => {
										ApplyValidationFromProperties(null);
									}}
								/>
								<TreeViewMenu
									title={'Add Agent Methods'}
									icon="fa fa-plus"
									onClick={() => {
										AddAgentMethods(() => {});
									}}
								/>
								<TreeViewMenu
									title={'Create Smart Dashboard'}
									icon="fa fa-plus"
									onClick={() => {
										CreateSmartDashboard({
											buttons: [
												{
													title: 'button 1'
												}
											],
											dashboardName: 'Easy dash',
											callback: () => {
												console.log('done');
											}
										});
									}}
								/>
								<TreeViewMenu
									title={'Distribute Build All Jobs'}
									icon="fa fa-plus"
									onClick={() => {
										this.props.setState();
										DistributeBuildAllJobs();
									}}
								/>
							</TreeViewMenu>
							<TreeViewMenu
								title={CreateDefaultView.type}
								open={UIA.Visual(state, CreateDefaultView.type)}
								active
								toggle={() => {
									this.props.toggleVisual(CreateDefaultView.type);
								}}
								icon="fa fa-tag"
							>
								{/* <TextBox label={'View Package'} value={this.props.Visual(state, 'View Package Title')} onChange={(val) => {
                                    this.props.setVisual('View Package Title', val);
                                }} /> */}
								<TextBox
									label={Titles.ViewPackage}
									value={UIA.Visual(state, 'View Package Title')}
									onChange={(value) => {
										this.props.setVisual('View Package Title', value);
									}}
								/>
								<CheckBox
									label={Titles.SharedControl}
									value={UIA.Visual(state, sharedcontrolkey)}
									onChange={(value) => {
										this.props.setVisual(sharedcontrolkey, value);
									}}
								/>
								<CheckBox
									label={UITypes.ElectronIO}
									value={UIA.Visual(state, UITypes.ElectronIO)}
									onChange={(value) => {
										this.props.setVisual(UITypes.ElectronIO, value);
									}}
								/>
								<CheckBox
									label={UITypes.ReactWeb}
									value={UIA.Visual(state, UITypes.ReactWeb)}
									onChange={(value) => {
										this.props.setVisual(UITypes.ReactWeb, value);
									}}
								/>
								<CheckBox
									label={UITypes.ReactNative}
									value={UIA.Visual(state, UITypes.ReactNative)}
									onChange={(value) => {
										this.props.setVisual(UITypes.ReactNative, value);
									}}
								/>
								{UIA.Visual(state, sharedcontrolkey) ? (
									<CheckBox
										label={Titles.UseAsDefault}
										value={UIA.Visual(state, use_as_default)}
										onChange={(value) => {
											this.props.setVisual(use_as_default, value);
										}}
									/>
								) : null}
								{UIA.Visual(state, sharedcontrolkey) ? (
									<CheckBox
										label={Titles.AsPlural}
										value={UIA.Visual(state, use_as_plural)}
										onChange={(value) => {
											this.props.setVisual(use_as_plural, value);
										}}
									/>
								) : null}
								<TreeViewMenu
									title={Titles.NodeProperties}
									open={UIA.Visual(state, `${Titles.NodeProperties} quick method`)}
									active
									toggle={() => {
										this.props.toggleVisual(`${Titles.NodeProperties} quick method`);
									}}
									icon="fa fa-tag"
								>
									{UIA.GetModelPropertyChildren(currentNode ? currentNode.id : null).map((child) => (
										// Could use something besides a VISUAL for this.
										<CheckBox
											label={UIA.GetNodeTitle(child)}
											key={child.id}
											value={UIA.Visual(state, UIA.ChoseModel(child.id))}
											onChange={(value) => {
												this.props.setVisual(UIA.ChoseModel(child.id), value);
											}}
										/>
									))}
								</TreeViewMenu>
								<div style={{ paddingRight: 10 }}>
									<h4>Methods</h4>
									<ButtonList
										active
										isSelected={(item) => this.state.selectedMethods[item.value]}
										items={Object.keys(ViewTypes).map((x) => ({
											id: x,
											value: x,
											title: x
										}))}
										onClick={(item) => {
											this.setState({
												selectedMethods: {
													...this.state.selectedMethods || {},
													[item.value]: !this.state.selectedMethods[item.value]
												}
											});
										}}
									/>

									<br />
									<button
										type="button"
										className="btn btn-block btn-success btn-sm"
										onClick={() => {
											const operations = [];
											const viewName =
												`${UIA.Visual(state, 'View Package Title') || ''}` ||
												UIA.GetNodeTitle(currentNode);
											[ ViewTypes.Create, ViewTypes.Update, ViewTypes.Delete, ViewTypes.Get ]
												.filter((x) => this.state.selectedMethods[x])
												.map((t) => {
													operations.push({
														node: currentNode,
														method: CreateDefaultView,
														options: {
															...defaultParameters(),
															viewName: `${viewName} ${t}`,
															viewType: t
														}
													});
												});
											if (this.state.selectedMethods[ViewTypes.GetAll]) {
												operations.push({
													node: currentNode,
													method: CreateDefaultView,
													options: {
														...defaultParameters(),
														viewName: `${viewName} ${ViewTypes.GetAll}`,
														viewType: ViewTypes.GetAll,
														isList: true
													}
												});
											}
											if (operations.length) {
												this.props.executeGraphOperations(operations);
											}
										}}
									>
										{Titles.CreateComponents}
									</button>
								</div>
							</TreeViewMenu>
						</TreeViewMenu>
					</SideBarMenu>
				</SideBar>
			</MainSideBar>
		);
	}
}

export default UIConnect(QuickMethods);
