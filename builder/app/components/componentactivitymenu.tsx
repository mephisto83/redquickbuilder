// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import MainSideBar from './mainsidebar';
import FormControl from './formcontrol';
import TextBox from './textinput';
import {
	ExcludeDefaultNode,
	NodeTypes,
	NodeProperties,
	MAIN_CONTENT,
	LAYOUT_VIEW,
	LinkProperties,
	UITypes
} from '../constants/nodetypes';
import SelectInput from './selectinput';
import { ComponentTypes, NAVIGATION, InstanceTypes } from '../constants/componenttypes';
import {
	GetConnectedNodeByType,
	CreateLayout,
	TARGET,
	GetParameterName,
	getComponentPropertyList,
	GetCellProperties,
	GetNodesLinkedTo,
	SOURCE
} from '../methods/graph_methods';
import ControlSideBarMenu, { ControlSideBarMenuItem } from './controlsidebarmenu';
import TextInput from './textinput';
import SelectInputProperty from './selectproperty';
import CommandHeader from './commandheader';
import CheckBox from './checkbox';
import { getComponentApiList } from '../methods/component_api_methods';
import { ViewTypes } from '../constants/viewtypes';
class ComponentActivityMenu extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	getComponentApi(prop_obj, key) {
		let { state } = this.props;
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (prop_obj && prop_obj.nodeProperty) {
			let componentApi = UIA.GetNodeProp(currentNode, NodeProperties.ComponentApi);
			if (componentApi) {
				let selectedComponentApiProperty = key;
				let componentProperties = UIA.GetNodeProp(currentNode, prop_obj.nodeProperty);
				componentProperties = componentProperties || {};
				let { instanceType, model, isHandler, apiProperty, modelProperty } =
					componentProperties[selectedComponentApiProperty] || {};

				return [
					<CommandHeader
						title={apiProperty || Titles.Unknown}
						open={UIA.Visual(this.props.state, 'apiProperty-title' + apiProperty)}
						visual={'apiProperty-title' + apiProperty}
					/>,
					selectedComponentApiProperty ? (
						<SelectInput
							label={Titles.InstanceType}
							value={instanceType}
							key={`instanceType${apiProperty}`}
							options={Object.keys(InstanceTypes).map((t) => ({
								title: t,
								value: InstanceTypes[t]
							}))}
							onChange={(value: any) => {
								componentProperties[selectedComponentApiProperty] =
									componentProperties[selectedComponentApiProperty] || {};
								let temp = componentProperties[selectedComponentApiProperty];
								temp.instanceType = value;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: prop_obj.nodeProperty,
									id: currentNode.id,
									value: componentProperties
								});
							}}
						/>
					) : null,
					selectedComponentApiProperty && instanceType === InstanceTypes.ApiProperty ? (
						<SelectInput
							label={key}
							value={apiProperty}
							key={`apiProperty${apiProperty}`}
							options={getComponentApiList(componentApi)}
							onChange={(value: any) => {
								componentProperties[selectedComponentApiProperty] =
									componentProperties[selectedComponentApiProperty] || {};
								let temp = componentProperties[selectedComponentApiProperty];
								temp.apiProperty = value;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: prop_obj.nodeProperty,
									id: currentNode.id,
									value: componentProperties
								});
							}}
						/>
					) : null,
					selectedComponentApiProperty && instanceType === InstanceTypes.ScreenInstance ? (
						<SelectInput
							label={Titles.Models}
							value={model}
							key={`model${apiProperty}`}
							options={UIA.NodesByType(this.props.state, NodeTypes.Model).toNodeSelect()}
							onChange={(value: any) => {
								componentProperties[selectedComponentApiProperty] =
									componentProperties[selectedComponentApiProperty] || {};
								let temp = componentProperties[selectedComponentApiProperty];
								temp.model = value;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: prop_obj.nodeProperty,
									id: currentNode.id,
									value: componentProperties
								});
							}}
						/>
					) : null,
					selectedComponentApiProperty && instanceType === InstanceTypes.ScreenInstance ? (
						<SelectInput
							key={`modelProperty${apiProperty}`}
							options={GetNodesLinkedTo(UIA.GetRootGraph(state), {
								id: model,
								direction: SOURCE
							}).toNodeSelect()}
							onChange={(val: any) => {
								componentProperties[selectedComponentApiProperty] =
									componentProperties[selectedComponentApiProperty] || {};
								let temp = componentProperties[selectedComponentApiProperty];
								temp.modelProperty = val;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: prop_obj.nodeProperty,
									id: currentNode.id,
									value: componentProperties
								});
							}}
							label={Titles.Property}
							value={modelProperty}
						/>
					) : null,
					selectedComponentApiProperty ? (
						<CheckBox
							label={Titles.IsHandler}
							key={`isHandler${apiProperty}`}
							value={isHandler}
							onChange={(value: any) => {
								componentProperties[selectedComponentApiProperty] =
									componentProperties[selectedComponentApiProperty] || {};
								let temp = componentProperties[selectedComponentApiProperty];
								temp.isHandler = value;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: prop_obj.nodeProperty,
									id: currentNode.id,
									value: componentProperties
								});
							}}
						/>
					) : null
				]
					.subset(0, UIA.Visual(this.props.state, 'apiProperty-title' + apiProperty) ? 1000 : 1)
					.filter((x) => x);
			}
		}

		return null;
	}

	render() {
		var { state } = this.props;
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

		var active = UIA.GetNodeProp(currentNode, UIA.NodeProperties.NODEType) === UIA.NodeTypes.ComponentNode;
		if (!active) {
			return <div />;
		}
		let screenOption = currentNode
			? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) ||
				GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET)
			: null;
		let _ui_type =
			UIA.GetNodeProp(screenOption, UIA.NodeProperties.UIType) ||
			UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType);
		let componentTypes = ComponentTypes[_ui_type] || {};
		let componentType = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType);
		let components = [];
		if (componentTypes[componentType] && componentTypes[componentType].properties) {
			Object.keys(componentTypes[componentType].properties).map((key) => {
				let prop_obj = componentTypes[componentType].properties[key];
				if (prop_obj && prop_obj.ui) {
					if (prop_obj.options) {
						components.push(
							<SelectInput
								label={key}
								key={`${_ui_type} - ${componentType}- ${key}`}
								options={prop_obj.options.map((t) => ({ title: t, value: t }))}
								value={UIA.GetNodeProp(currentNode, prop_obj.nodeProperty)}
								onChange={(value: any) => {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: prop_obj.nodeProperty,
										id: currentNode.id,
										value
									});
								}}
							/>
						);
					} else if (prop_obj.nodeTypes) {
						components.push(
							<SelectInput
								label={key}
								key={`${_ui_type} - ${componentType}- ${key}`}
								options={UIA.NodesByType(state, prop_obj.nodeTypes)
									.filter(prop_obj.nodeFilter || (() => true))
									.toNodeSelect()}
								value={UIA.GetNodeProp(currentNode, prop_obj.nodeProperty)}
								onChange={(value: any) => {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: prop_obj.nodeProperty,
										id: currentNode.id,
										value
									});
								}}
							/>
						);
					} else if (prop_obj.boolean) {
						components.push(
							<CheckBox
								label={' Use Parameter in url '}
								value={UIA.GetNodeProp(currentNode, prop_obj.nodeProperty)}
								onChange={(value: any) => {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: prop_obj.nodeProperty,
										id: currentNode.id,
										value
									});
								}}
							/>
						);
					} else if (prop_obj.parameterConfig) {
						components.push(this.getComponentApi(prop_obj, key));
					}
				}
			});
		}
		components = components.filter((x) => x);
		return (
			<TabPane active={active}>
				{currentNode ? (
					<FormControl>
						<TextInput
							label={Titles.Label}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.Label)}
							onChange={(value: any) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.Label,
									id: currentNode.id,
									value
								});
							}}
						/>
						<SelectInput
							label={Titles.UIType}
							options={Object.keys(UITypes).map((t) => ({
								title: t,
								value: t
							}))}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIType)}
							onChange={(value: any) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.UIType,
									id: currentNode.id,
									value
								});
							}}
						/>
						<SelectInput
							label={Titles.ComponentType}
							options={Object.keys(componentTypes).map((t) => ({
								title: t,
								value: t
							}))}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType)}
							onChange={(value: any) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ComponentType,
									id: currentNode.id,
									value
								});
							}}
						/>
						<SelectInputProperty
							node={currentNode}
							title={Titles.ViewTypes}
							property={NodeProperties.ViewType}
							options={Object.keys(ViewTypes).map((v) => ({
								title: v,
								value: ViewTypes[v],
								id: v
							}))}
						/>
					</FormControl>
				) : null}
				{componentType &&
				componentTypes &&
				componentTypes[componentType] &&
				componentTypes[componentType].layout ? (
					<ControlSideBarMenu>
						<ControlSideBarMenuItem
							onClick={() => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.Layout,
									id: currentNode.id,
									value: UIA.GetNodeProp(currentNode, NodeProperties.Layout) || CreateLayout()
								});
								this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
							}}
							icon={'fa fa-puzzle-piece'}
							title={Titles.SetupLayout}
							description={Titles.SetupLayout}
						/>
						<ControlSideBarMenuItem
							onClick={() => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.Layout,
									id: currentNode.id,
									value: null
								});
								this.props.setVisual(MAIN_CONTENT, null);
							}}
							icon={'fa fa-puzzle-piece'}
							title={Titles.ClearLayout}
							description={Titles.ClearLayout}
						/>
						<ControlSideBarMenuItem
							onClick={() => {
								this.props.graphOperation(UIA.NEW_COMPONENT_NODE, {
									parent: UIA.Visual(state, UIA.SELECTED_NODE),
									groupProperties: {},
									properties: {
										[UIA.NodeProperties.UIType]: UIA.GetNodeProp(
											currentNode,
											UIA.NodeProperties.UIType
										)
									},
									linkProperties: {
										properties: { ...LinkProperties.ComponentLink }
									}
								});
								this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
							}}
							icon={'fa fa-puzzle-piece'}
							title={Titles.AddComponentNew}
							description={Titles.AddComponentNew}
						/>
						{UIA.GetNodeProp(currentNode, UIA.NodeProperties.ComponentType) ===
						ComponentTypes.ReactNative.List.key ? (
							<ControlSideBarMenuItem
								onClick={() => {
									this.props.graphOperation(UIA.NEW_COMPONENT_NODE, {
										parent: UIA.Visual(state, UIA.SELECTED_NODE),
										groupProperties: {},
										properties: {
											[UIA.NodeProperties.UIType]: UIA.GetNodeProp(
												currentNode,
												UIA.NodeProperties.UIType
											)
										},
										linkProperties: {
											properties: { ...LinkProperties.ListItem }
										}
									});
									this.props.setVisual(MAIN_CONTENT, LAYOUT_VIEW);
								}}
								icon={'fa fa-puzzle-piece'}
								title={Titles.SetListItem}
								description={Titles.SetListItem}
							/>
						) : null}
					</ControlSideBarMenu>
				) : null}

				{false &&
				componentType &&
				componentTypes &&
				componentTypes[componentType] &&
				componentTypes[componentType].datasource ? (
					<ControlSideBarMenu>
						{' '}
						<ControlSideBarMenuItem
							onClick={() => {
								this.props.graphOperation(UIA.NEW_DATA_SOURCE, {
									parent: UIA.Visual(state, UIA.SELECTED_NODE),
									groupProperties: {},
									properties: {
										[UIA.NodeProperties.UIType]: UIA.GetNodeProp(
											currentNode,
											UIA.NodeProperties.UIType
										),
										[UIA.NodeProperties.UIText]: `${UIA.GetNodeTitle(currentNode)} Data Source`
									},
									linkProperties: {
										properties: { ...LinkProperties.DataSourceLink }
									}
								});
							}}
							icon={'fa fa-puzzle-piece'}
							title={Titles.AddDataSource}
							description={Titles.AddDataSource}
						/>{' '}
					</ControlSideBarMenu>
				) : null}
			</TabPane>
		);
	}
}

export default UIConnect(ComponentActivityMenu);
