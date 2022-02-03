// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import CheckBox from './checkbox';
import ButtonList from './buttonlist';
import TextBox from './textinput';
import { UITypes, NodeTypes, NodeProperties, NodeAttributePropertyTypes, Methods } from '../constants/nodetypes';
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
	CollectionConnectDataChainCollection,
	CollectionPruneDataChain
} from '../nodepacks/CollectionDataChainsIntoCollections';
import ApplyTemplates from '../nodepacks/permission/ApplyTemplates';
import ApplyValidationFromProperties from '../nodepacks/permission/ApplyValidationFromProperties';
import AddAgentMethods from '../nodepacks/batch/AddAgentMethods';
import BuildDashboards from '../nodepacks/screens/dashboard/BuildDashboards';
import ConnectDashboards from '../nodepacks/screens/dashboard/ConnectDashboards';
import CreateComponentAll, { CreateComponentSharedAll } from '../nodepacks/batch/CreateComponentAll';
import MenuGenerator from '../generators/menugenerator';
import AddUserRequirements from '../nodepacks/batch/AddUserRequirements';
import ChangeInputToSelect from '../nodepacks/screens/ChangeInputToSelect';
import { Node } from '../methods/graph_types';
import RedressProperties from '../nodepacks/batch/RedressProperties';
import AddAgentAccessMethods from '../nodepacks/batch/AddAgentAccessMethods';
import UpdateScreenParameters from '../nodepacks/screens/UpdateScreenParameters';
import ConnectScreens, { ConnectScreenListRoutes } from '../nodepacks/batch/ConnectScreens';
import TreeViewItemContainer from './treeviewitemcontainer';
import SelectInput from './selectinput';
import { NodesByType, GetNodeProp } from '../methods/graph_methods';
import CreateClaimService from '../nodepacks/batch/CreateClaimService';
import ApplyPremissionChains from '../nodepacks/batch/ApplyPermissionChains';
import ApplyExecutionChains from '../nodepacks/batch/ApplyExecutionChains';
import ApplyValidationChains from '../nodepacks/batch/ApplyValidationChains';
import { SetPause } from '../methods/graph_methods';
import SetupViewTypes from '../nodepacks/batch/SetupViewTypes';
import { graphOperation, GetDispatchFunc, GetStateFunc } from '../actions/uiactions';
import SetupAuthenticationButtons from '../nodepacks/batch/SetupAuthenticationButtons';
import AttachTitleService from '../nodepacks/batch/AttachTitleService';
import { buildAst, buildFunctions, buildRules, FlowCodeStatements } from '../constants/flowcode_ast';

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
				.filter((child: Node) => UIA.Visual(state, UIA.ChoseModel(child.id)))
				.map((x: Node) => x.id);
			return chosenChildren;
		}
		var function_types = Object.keys(MethodFunctions).map(funcKey => {
			return {
				title: MethodFunctions[funcKey].title || funcKey,
				value: funcKey
			}
		})
        var enum_nodes = UIA.NodesByType(state, UIA.NodeTypes.Enumeration).map(node => {
            return {
                value: node.id,
                title: UIA.GetNodeTitle(node)
            }
        });
		var model_nodes = UIA.NodesByType(state, UIA.NodeTypes.Model);
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
							<TreeViewMenu title={Titles.AddFunction}
								active
								toggle={() => {
									this.props.toggleVisual(Titles.AddFunction);
								}}
								icon="fa fa-tag"
								open={UIA.Visual(state, Titles.AddFunction)}>

								<TreeViewItemContainer>
									<TextBox
										label={Titles.Name}
										value={this.state.functionName}
										onChange={(value: any) => {
											this.setState({ functionName: value })
										}}
									/>
									<TreeViewItemContainer>
										<SelectInput
											label={Titles.AgentOperator}
											value={this.state.agentId}
											onChange={(val: string) => {

												this.setState({
													agentId: val
												})
											}}
											options={model_nodes.filter(x => UIA.GetNodeProp(x, UIA.NodeProperties.IsAgent)).map(node => {
												return {
													value: node.id,
													title: UIA.GetNodeTitle(node)
												}
											})}
										/> </TreeViewItemContainer>
									<TreeViewItemContainer>
										<SelectInput
											label={Titles.Model}
											value={this.state.model}
											onChange={(val: string) => {

												this.setState({
													model: val
												})
											}}
											options={model_nodes.map(node => {
												return {
													value: node.id,
													title: UIA.GetNodeTitle(node)
												}
											})}
										/> </TreeViewItemContainer>
									<SelectInput
										label={Titles.FunctionTypes}
										options={function_types}
										onChange={(value) => {
											this.setState({ functionType: value })
										}}
										value={this.state.functionType} />
									<SelectInput
										label={Titles.Methods}
										options={Object.keys(Methods).map(t => ({ title: t, value: Methods[t] }))}
										onChange={(value) => {
											this.setState({ method: value })
										}}
										value={this.state.method} />
									<SelectInput
										label={Titles.HttpMethod}
										options={Object.keys(HTTP_METHODS).map(t => ({ title: t, value: HTTP_METHODS[t] }))}
										onChange={(value) => {
											this.setState({ httpMethod: value })
										}}
										value={this.state.httpMethod} />
									<SelectInput
										label={Titles.PermissionSource}
										options={model_nodes.map(node => {
											return {
												value: node.id,
												title: UIA.GetNodeTitle(node)
											}
										})}
										onChange={(value: any) => {
											this.setState({ permissionSource: value })
										}}
										value={this.state.permissionSource} />
									<SelectInput
										label={Titles.PermissionEnums}
										options={enum_nodes}
										onChange={(value: any) => {
											this.setState({ permissionEnum: value })
										}}
										value={this.state.permissionEnum} />
									<button
										type="button"
										className="btn btn-block btn-success btn-sm"
										onClick={() => {
											let parameters = this.state.parameters || [];
											this.setState({
												parameters: [...parameters, {
													id: UIA.GUID(),
													name: 'unknown',
													type: null,
													useEnum: false,
													enum: null
												}]
											})

										}}
									>
										{Titles.AddParameter}
									</button>
									{(this.state.parameters || []).map((param: any) => {
										return (
											<TreeViewMenu open active key={param.id}>
												<TreeViewItemContainer >
													<CheckBox
														label={Titles.UseEnumeration}
														onChange={(value: any) => {
															let newparams = [...((this.state.parameters || []).filter(x => x.id !== param.id)), {
																...param, useEnum: value
															}];
															this.setState({
																parameters: newparams
															})
														}}
														value={param.useEnum}
													/>
												</TreeViewItemContainer>
												<TextBox
													label={Titles.Name}
													value={param.name}
													onChange={(value: any) => {
														let newparams = [...((this.state.parameters || []).filter(x => x.id !== param.id)), {
															...param, name: value
														}];
														this.setState({
															parameters: newparams
														})
													}}
												/>
												{param.useEnum ? null : <TreeViewItemContainer>
													<SelectInput
														label={Titles.Model}
														value={param.type}
														onChange={(val: string) => {
															let newparams = [...((this.state.parameters || []).filter(x => x.id !== param.id)), {
																...param, type: val
															}];
															this.setState({
																parameters: newparams
															})
														}}
														options={UIA.NodesByType(state, UIA.NodeTypes.Model).map((node: any) => {
															return {
																value: node.id,
																title: UIA.GetNodeTitle(node)
															}
														})}
													/> </TreeViewItemContainer>}
												{!param.useEnum ? null : <TreeViewItemContainer>
													<SelectInput
														label={Titles.Enumeration}
														value={param.enum}
														onChange={(val: string) => {
															let newparams = [...((this.state.parameters || []).filter(x => x.id !== param.id)), {
																...param, enum: val
															}];
															this.setState({
																parameters: newparams
															})
														}}
														options={Object.entries(NodeAttributePropertyTypes).map((node: any) => {
															return {
																value: node[0],
																title: node[0]
															}
														})}
													/> </TreeViewItemContainer>}
											</TreeViewMenu>
										)
									})}
									<TreeViewItemContainer ><SelectInput
										label={Titles.Maestros}
										value={this.state.maestro}
										onChange={(val: string) => {
											this.setState({ maestro: val });
										}}
										options={UIA.NodesByType(state, UIA.NodeTypes.Maestro).map((node: any) => {
											return {
												value: node.id,
												title: UIA.GetNodeTitle(node)
											}
										})}
									/> </TreeViewItemContainer>
									<TreeViewItemContainer >
										<CheckBox
											label={Titles.UseModelAsType}
											onChange={(value: any) => {
												this.setState({ useModelAsType: value })
											}}
											value={this.state.useModelAsType}
										/>
									</TreeViewItemContainer>
									<TreeViewItemContainer >
										<CheckBox
											label={Titles.IsReferenceList}
											onChange={(value: any) => {
												this.setState({ referenceList: value })
											}}
											value={this.state.referenceList}
										/>
									</TreeViewItemContainer>
									{this.state.useModelAsType ? <TreeViewItemContainer ><SelectInput
										label={Titles.AddFunctionOutput}
										value={this.state.selectedOutputModel}
										onChange={(val: string) => {
											this.setState({ selectedOutputModel: val });
										}}
										options={UIA.NodesByType(state, UIA.NodeTypes.Model).map((node: any) => {
											return {
												value: node.id,
												title: UIA.GetNodeTitle(node)
											}
										})}
									/> </TreeViewItemContainer> : <TreeViewItemContainer ><SelectInput
										options={Object.keys(UIA.NodePropertyTypes)
											.sort((a, b) => a.localeCompare(b))
											.map((x) => {
												return {
													value: UIA.NodePropertyTypes[x],
													title: x
												};
											})}
										label={Titles.AddFunctionOutput}
										onChange={(value: any) => {
											this.setState({ selectedOutputType: value });
										}}
										value={this.state.selectedOutputType}
									/> </TreeViewItemContainer>}
								</TreeViewItemContainer>
								<button
									type="button"
									className="btn btn-block btn-success btn-sm"
									onClick={() => {
										this.props.AddFunction({
											...this.state
										})
									}}
								>
									{Titles.AddFunction}
								</button>
							</TreeViewMenu>
							<TreeViewMenu
								title="Check Shared Nodes"
								open={UIA.Visual(state, 'Check Shared Nodes')}
								active
								toggle={() => {
									this.props.toggleVisual('Check Shared Nodes');
								}}
							>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.ViewTypes}
										value={this.state.selectedViewType}
										onChange={(val: string) => {
											this.setState({ selectedViewType: val });
										}}
										options={Object.keys(ViewTypes).map((v) => ({ title: v, value: ViewTypes[v] }))}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Model}
										value={this.state.selectedModel}
										onChange={(val: string) => {
											this.setState({ selectedModel: val });
										}}
										options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Model).toNodeSelect()}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.Property}
										value={this.state.selectedProperty}
										onChange={(val: string) => {
											this.setState({ selectedProperty: val });
										}}
										options={UIA.GetModelPropertyChildren(this.state.selectedModel).toNodeSelect()}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										label="Target Model"
										value={this.state.targetModel}
										onChange={(val: string) => {
											this.setState({ targetModel: val });
										}}
										options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Model).toNodeSelect()}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<SelectInput
										label={Titles.UIType}
										value={this.state.selectedUIType}
										onChange={(val: string) => {
											this.setState({ selectedUIType: val });
										}}
										options={Object.keys(UITypes).map((v: string) => ({ title: v, value: v }))}
									/>
								</TreeViewItemContainer>
								<TreeViewItemContainer>
									<CheckBox
										label={Titles.SharedControl}
										value={this.state.isSharedComponent}
										onChange={(val: string) => {
											this.setState({ isSharedComponent: val });
										}}
										options={NodesByType(UIA.GetCurrentGraph(), NodeTypes.Model)
											.filter((x: Node) => GetNodeProp(x, NodeProperties.IsAgent))
											.toNodeSelect()}
									/>
								</TreeViewItemContainer>
								<TreeViewMenu title={UIA.GetNodeTitle(this.state.sharedComponentFor)} />
								<TreeViewMenu
									title="Check"
									toggle={() => {
										if (
											this.state.selectedViewType &&
											this.state.selectedProperty &&
											this.state.targetModel &&
											this.state.selectedUIType
										) {
											let res = UIA.GetSharedComponentFor(
												this.state.selectedViewType,
												UIA.GetNodeById(this.state.selectedProperty),
												this.state.targetModel,
												this.state.isSharedComponent || false,
												this.state.selectedUIType
											);
											console.log(res);
											this.setState({ sharedComponentFor: res });
										}
									}}
								/>
							</TreeViewMenu>
							<TreeViewMenu
								title={Titles.BuildCommands}
								open={UIA.Visual(state, Titles.BuildCommands)}
								active
								toggle={() => {
									this.props.toggleVisual(Titles.BuildCommands);
								}}
								icon="fa fa-tag"
							>
								<TreeViewMenu
									title={'Create View Types'}
									onClick={async () => {
										const res = await CreateViewTypes(() => { });
										graphOperation(res)(GetDispatchFunc(), GetStateFunc());
									}}
								/>

								<TreeViewMenu
									title="Create Component Shared All"
									onClick={() => {
										SetPause(true);
										CreateComponentSharedAll(() => { }, null, (v: Node) => {
											return true; // return v.id === currentNode.id;
										}).then(() => {
											SetPause(false);
										});
									}}
								/>

								<TreeViewMenu
									title="Create Component All"
									onClick={() => {
										SetPause(true);
										CreateComponentAll(() => { }).then(() => {
											SetPause(false);
										});
									}}
								/>

								<TreeViewMenu
									title="Setup View Types"
									onClick={() => {
										SetPause(true);
										SetupViewTypes(() => { }).then(() => {
											SetPause(false);
										});
									}}
								/>

								<TreeViewMenu
									title="Add Agent Access Methods"
									onClick={() => {
										AddAgentAccessMethods(() => { });
									}}
								/>
								<TreeViewMenu
									title="Create Claim Service"
									onClick={() => {
										CreateClaimService();
									}}
								/>
								<TreeViewMenu
									title="Build Dashboards"
									onClick={() => {
										BuildDashboards(() => true);
									}}
								/>
								<TreeViewMenu
									title="Connect Dashboards"
									onClick={() => {
										ConnectDashboards(() => true, () => { });
									}}
								/>
								<TreeViewMenu
									title="Connect Screens"
									onClick={() => {
										ConnectScreens(() => { }, () => true);
									}}
								/>
								<TreeViewMenu
									title="Connect Dashes only"
									onClick={() => {
										ConnectScreens(
											() => { },
											(v: Node) => GetNodeProp(v, NodeProperties.IsDashboard)
										);
									}}
								/>
								<TreeViewMenu
									title="Apply Permission Chains"
									onClick={() => {
										ApplyPremissionChains();
									}}
								/>
								<TreeViewMenu
									title="Apply Execution Chains"
									onClick={() => {
										ApplyExecutionChains();
									}}
								/>
								<TreeViewMenu
									title="Apply Validation Chains"
									onClick={() => {
										ApplyValidationChains();
									}}
								/>
								<TreeViewMenu
									title="Connect Screen List Routes"
									onClick={() => {
										ConnectScreenListRoutes(() => { });
									}}
								/>
								<TreeViewMenu
									title="Setup Authentication Buttons"
									onClick={() => {
										SetupAuthenticationButtons();
									}}
								/>
								<TreeViewMenu
									title="Attach Title Service"
									onClick={() => {
										AttachTitleService();
									}}
								/>
								<TreeViewMenu
									title="Collection Prune DataChain"
									onClick={() => {
										CollectionPruneDataChain();
									}}
								/>
								<TreeViewMenu
									title={StartJob.title}
									icon="fa fa-play"
									onClick={() => {
										this.props.setState();
										StartJob();
									}}
								/>
							</TreeViewMenu>
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
									title="Random"
									open={UIA.Visual(state, CreateDefaultView.type)}
									active
									toggle={() => {
										this.props.toggleVisual(CreateDefaultView.type);
									}}
									icon="fa fa-tag"
								>
									<TreeViewMenu
										title="FlowCode Test"
										onClick={() => {
											buildAst(FlowCodeStatements.ForEach);
										}}
									/>
									<TreeViewMenu
										title="Build Rules Test"
										onClick={() => {
											buildFunctions();
										}}
									/>
									<TreeViewMenu
										title="Distribute Build All Jobs"
										icon="fa fa-plus"
										onClick={() => {
											this.props.setState();
											DistributeBuildAllJobs();
										}}
									/>
									<TreeViewMenu
										title="Check Access"
										icon="fa fa-plus"
										onClick={() => {
											let aa = UIA.GetNodeById('1f2f965e-205f-45ed-b12e-aac517cd3ed8');
											let viewType = ViewTypes.Create;
											let agent = UIA.GetNodeById('34c87cff-b102-4d38-b605-f9bf57469eee');
											let model = UIA.GetNodeById('2f913160-4f5b-45c2-8cad-e54833dbbc8c');
											let hasAccess = UIA.hasAccessNode(agent, model, aa, viewType);
											console.log(`hasAccess: ${hasAccess}`);
										}}
									/>
									<TreeViewMenu
										title="Redress Properties"
										description={RedressProperties.description}
										toggle={() => {
											RedressProperties();
										}}
									/>
									<TreeViewMenu
										title="Add user requirements"
										icon="fa fa-plus"
										onClick={() => {
											this.props.setState();
											AddUserRequirements();
										}}
									/>
									<TreeViewMenu
										title="Change Input To Select"
										icon="fa fa-plane"
										onClick={() => {
											ChangeInputToSelect();
										}}
									/>

									<TreeViewMenu
										title="Generate Menu Source"
										icon="fa fa-plus"
										onClick={() => {
											MenuGenerator.Generate({ state: this.props.state });
										}}
									/>
								</TreeViewMenu>
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
									title="Create Smart Dashes"
									icon="fa fa-plus"
									onClick={() => {
										BuildDashboards(() => true);
									}}
								/>
								<TreeViewMenu
									title="Connect Dashboards"
									icon="fa fa-plus"
									onClick={() => {
										ConnectDashboards(() => true, () => { });
									}}
								/>
								<TreeViewMenu
									title="CreateComponentAll"
									onClick={() => {
										CreateComponentAll(() => true);
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
											BuildAll(() => { });
										}
									}}
								/>
								<TreeViewMenu
									title="Create Job"
									icon="fa fa-plus"
									onClick={() => {
										this.props.setState();
										debugger;
										JobService.CreateJob('asdf', 10, NodeTypes.Screen);
									}}
								/>
								<TreeViewMenu
									title="Update Screen Urls"
									icon="fa fa-plus"
									onClick={() => {
										UpdateScreenUrls(() => { });
									}}
								/>
								<TreeViewMenu
									title="CollectionConnectDataChainCollection"
									onClick={() => {
										CollectionConnectDataChainCollection(() => {
											return true;
										});
									}}
								/>
								<TreeViewMenu
									title="Add Title Service"
									onClick={() => {
										this.props.graphOperation([addTitleService({ newItems: {} })]);
									}}
								/>
								<TreeViewMenu
									title="Apply Templates"
									icon="fa fa-plus"
									onClick={() => {
										ApplyTemplates(null);
									}}
								/>
								<TreeViewMenu
									title="Apply Validation From Properties"
									icon="fa fa-plus"
									onClick={() => {
										ApplyValidationFromProperties(null);
									}}
								/>
								<TreeViewMenu
									title="Add Agent Methods"
									icon="fa fa-plus"
									onClick={() => {
										AddAgentMethods(() => { });
									}}
								/>
								<TreeViewMenu
									title="Add Agent Access Methods"
									icon="fa fa-plus"
									onClick={() => {
										AddAgentAccessMethods(() => { });
									}}
								/>
								<TreeViewMenu
									title="Update Screen Parameters"
									icon="fa fa-plus"
									onClick={() => {
										UpdateScreenParameters(() => { });
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
									onChange={(value: any) => {
										this.props.setVisual('View Package Title', value);
									}}
								/>
								<CheckBox
									label={Titles.SharedControl}
									value={UIA.Visual(state, sharedcontrolkey)}
									onChange={(value: any) => {
										this.props.setVisual(sharedcontrolkey, value);
									}}
								/>
								<CheckBox
									label={UITypes.ElectronIO}
									value={UIA.Visual(state, UITypes.ElectronIO)}
									onChange={(value: any) => {
										this.props.setVisual(UITypes.ElectronIO, value);
									}}
								/>
								<CheckBox
									label={UITypes.ReactWeb}
									value={UIA.Visual(state, UITypes.ReactWeb)}
									onChange={(value: any) => {
										this.props.setVisual(UITypes.ReactWeb, value);
									}}
								/>
								<CheckBox
									label={UITypes.ReactNative}
									value={UIA.Visual(state, UITypes.ReactNative)}
									onChange={(value: any) => {
										this.props.setVisual(UITypes.ReactNative, value);
									}}
								/>
								{UIA.Visual(state, sharedcontrolkey) ? (
									<CheckBox
										label={Titles.UseAsDefault}
										value={UIA.Visual(state, use_as_default)}
										onChange={(value: any) => {
											this.props.setVisual(use_as_default, value);
										}}
									/>
								) : null}
								{UIA.Visual(state, sharedcontrolkey) ? (
									<CheckBox
										label={Titles.AsPlural}
										value={UIA.Visual(state, use_as_plural)}
										onChange={(value: any) => {
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
									{UIA.GetModelPropertyChildren(
										currentNode ? currentNode.id : null
									).map((child: { id: string | number | undefined }) => (
										// Could use something besides a VISUAL for this.
										<CheckBox
											label={UIA.GetNodeTitle(child)}
											key={child.id}
											value={UIA.Visual(state, UIA.ChoseModel(child.id))}
											onChange={(value: any) => {
												this.props.setVisual(UIA.ChoseModel(child.id), value);
											}}
										/>
									))}
								</TreeViewMenu>
								<div style={{ paddingRight: 10 }}>
									<h4>Methods</h4>
									<ButtonList
										active
										isSelected={(item: { value: React.ReactText }) =>
											this.state.selectedMethods[item.value]}
										items={Object.keys(ViewTypes).map((x) => ({
											id: x,
											value: x,
											title: x
										}))}
										onClick={(item: { value: React.ReactText }) => {
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
											[ViewTypes.Create, ViewTypes.Update, ViewTypes.Delete, ViewTypes.Get]
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
