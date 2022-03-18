// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import TextInput from './textinput';
import SelectInput from './selectinput';
import CheckBox from './checkbox';
import { NodeTypes, LinkProperties, NodeProperties, GeneratedDataTypes } from '../constants/nodetypes';
class PropertyActivityMenu extends Component<any, any> {
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.Property);
		if (!active) {
			return <div />;
		}
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		if (currentNode) {
			var show_dependent =
				currentNode && currentNode.properties && currentNode.properties[UIA.NodeProperties.UseUIDependsOn];
			var use_model_as_type = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseModelAsType);
			var use_model_as_local = UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseModelAsLocal);
			var many_to_many_enabled = UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexus);
			var property_nodes = UIA.NodesByType(state, UIA.NodeTypes.Property)
				.filter((x) => {
					return x.id !== currentNode.id;
				})
				.map((node) => {
					return {
						value: node.id,
						title: UIA.GetNodeTitle(node)
					};
				});
		}
		return (
			<TabPane active={active}>
				{currentNode ? (
					<FormControl>
						<CheckBox
							label={Titles.UseDependentProperty}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseUIDependsOn] : ''
							}
							onChange={(value) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.UseUIDependsOn,
									id: currentNode.id,
									value
								});
							}}
						/>
						{show_dependent ? (
							<SelectInput
								label={Titles.DependentProperty}
								options={property_nodes}
								onChange={(value) => {
									var id = currentNode.id;
									this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
										target: currentNode.properties[UIA.NodeProperties.UIDependsOn],
										source: id
									});
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: UIA.NodeProperties.UIDependsOn,
										id,
										value
									});
									this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
										target: value,
										source: id,
										properties: { ...UIA.LinkProperties.DependsOnLink }
									});
								}}
								value={
									currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIDependsOn] : ''
								}
							/>
						) : null}
					</FormControl>
				) : null}

				{currentNode ? (
					<FormControl>
						<TextInput
							label={Titles.UIName}
							value={currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIName] : ''}
							onChange={(value) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.UIName,
									id: currentNode.id,
									value
								});
							}}
						/>
					</FormControl>
				) : null}
				{currentNode ? (
					<FormControl>
						<CheckBox
							label={Titles.UseInView}
							title={Titles.UseInView}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseInView)}
							onChange={(value: boolean) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.UseInView,
									id: currentNode.id,
									value
								});
							}}
						/>
						<CheckBox
							label={Titles.IgnoreInView}
							title={Titles.IgnoreInView}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.IgnoreInView)}
							onChange={(value: boolean) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.IgnoreInView,
									id: currentNode.id,
									value
								});
							}}
						/>
						<CheckBox
							label={Titles.ManyToManyNexus}
							title={Titles.ManyToManyNexusDescription}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexus)}
							onChange={(value: boolean) => {
								var id = currentNode.id;
								this.props.graphOperation(
									[
										value
											? null
											: {
												operation: UIA.REMOVE_LINK_BETWEEN_NODES,
												options: {
													target:
														currentNode.properties[
														UIA.NodeProperties.ManyToManyNexusType
														],
													source: id
												}
											},
										{
											operation: UIA.CHANGE_NODE_PROPERTY,
											options: {
												prop: UIA.NodeProperties.ManyToManyNexus,
												id: currentNode.id,
												value
											}
										},
										!value || !currentNode.properties[UIA.NodeProperties.ManyToManyNexusType]
											? null
											: {
												operation: UIA.ADD_LINK_BETWEEN_NODES,
												options: {
													target:
														currentNode.properties[
														UIA.NodeProperties.ManyToManyNexusType
														],
													source: id,
													properties: { ...UIA.LinkProperties.ManyToManyLink }
												}
											}
									].filter((x) => x)
								);
							}}
						/>
						<SelectInput
							options={Object.keys(GeneratedDataTypes).map((key) => ({ title: key, value: key }))}
							label={Titles.PropertyGeneratedType}
							onChange={(value: any) => {
								this.props.graphOperation([
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											prop: UIA.NodeProperties.DataGenerationType,
											id: currentNode.id,
											value
										}
									}
								]);
							}}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.DataGenerationType)}
						/>
						{many_to_many_enabled ? (
							<SelectInput
								options={UIA.NodesByType(state, NodeTypes.Model)
									.filter((x) => UIA.GetNodeProp(x, NodeProperties.ManyToManyNexus))
									.map((x) => {
										return {
											value: x.id,
											title: UIA.GetNodeTitle(x)
										};
									})}
								label={Titles.ManyToManyNexus}
								onChange={(value) => {
									var id = currentNode.id;
									this.props.graphOperation([
										{
											operation: UIA.REMOVE_LINK_BETWEEN_NODES,
											options: {
												target: currentNode.properties[UIA.NodeProperties.ManyToManyNexusType],
												source: id
											}
										},
										{
											operation: UIA.CHANGE_NODE_PROPERTY,
											options: {
												prop: UIA.NodeProperties.ManyToManyNexusType,
												id: currentNode.id,
												value
											}
										},
										{
											operation: UIA.ADD_LINK_BETWEEN_NODES,
											options: {
												target: value,
												source: id,
												properties: { ...UIA.LinkProperties.ManyToManyLink }
											}
										}
									]);
								}}
								value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.ManyToManyNexusType)}
							/>
						) : null}
						<CheckBox
							label={Titles.IsLabelValue}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsValueLabel] : ''
							}
							onChange={(value: boolean) => {
								this.props.graphOperation([
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											prop: UIA.NodeProperties.IsValueLabel,
											id: currentNode.id,
											value
										}
									}
								]);
							}}
						/>

						<CheckBox
							label={Titles.IsFireTime}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.IsFireTime] : ''
							}
							onChange={(value: boolean) => {
								this.props.graphOperation([
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											prop: UIA.NodeProperties.IsFireTime,
											id: currentNode.id,
											value
										}
									}
								]);
							}}
						/>

						<CheckBox
							label={Titles.IsPermissionPropertyContainer}
							value={
								currentNode.properties
									? currentNode.properties[UIA.NodeProperties.IsPermissionPropertyContainer]
									: ""
							}
							onChange={(value: any) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.IsPermissionPropertyContainer,
									id: currentNode.id,
									value
								});
							}}
						/>
						<CheckBox
							label={Titles.UseModelAsType}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseModelAsType] : ''
							}
							onChange={(value: boolean) => {
								var id = currentNode.id;
								this.props.graphOperation([
									value
										? null
										: {
											operation: UIA.REMOVE_LINK_BETWEEN_NODES,
											options: {
												target: currentNode.properties[UIA.NodeProperties.UIModelType],
												source: id
											}
										},
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											prop: UIA.NodeProperties.UseModelAsType,
											id: currentNode.id,
											value
										}
									},
									!value || !currentNode.properties[UIA.NodeProperties.UIModelType]
										? null
										: {
											operation: UIA.ADD_LINK_BETWEEN_NODES,
											options: {
												target: currentNode.properties[UIA.NodeProperties.UIModelType],
												source: id,
												properties: { ...UIA.LinkProperties.ModelTypeLink }
											}
										}
								]);
							}}
						/>
						<CheckBox
							label={Titles.UseModelAsLocal}
							value={
								currentNode.properties ? currentNode.properties[UIA.NodeProperties.UseModelAsLocal] : ''
							}
							onChange={(value: boolean) => {
								var id = currentNode.id;
								this.props.graphOperation([
									value
										? null
										: {
											operation: UIA.REMOVE_LINK_BETWEEN_NODES,
											options: {
												target: currentNode.properties[UIA.NodeProperties.UIModelType],
												source: id
											}
										},
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											prop: UIA.NodeProperties.UseModelAsLocal,
											id: currentNode.id,
											value
										}
									},
									!value || !currentNode.properties[UIA.NodeProperties.UIModelType]
										? null
										: {
											operation: UIA.ADD_LINK_BETWEEN_NODES,
											options: {
												target: currentNode.properties[UIA.NodeProperties.UIModelType],
												source: id,
												properties: { ...UIA.LinkProperties.ModelTypeLink }
											}
										}
								]);
							}}
						/>
						{!use_model_as_type ? (
							<SelectInput
								options={Object.keys(UIA.NodePropertyTypes)
									.sort((a, b) => a.localeCompare(b))
									.map((x) => {
										return {
											value: UIA.NodePropertyTypes[x],
											title: x
										};
									})}
								label={Titles.PropertyValueType}
								onChange={(value) => {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: UIA.NodeProperties.UIAttributeType,
										id: currentNode.id,
										value
									});
								}}
								value={
									currentNode.properties ? (
										currentNode.properties[UIA.NodeProperties.UIAttributeType]
									) : (
										''
									)
								}
							/>
						) : null}
						{use_model_as_type || use_model_as_local ? (
							<SelectInput
								options={UIA.NodesByType(state, NodeTypes.Model).map((x) => {
									return {
										value: x.id,
										title: UIA.GetNodeTitle(x)
									};
								})}
								label={Titles.PropertyModelType}
								onChange={(value) => {
									var id = currentNode.id;
									this.props.graphOperation([
										{
											operation: UIA.REMOVE_LINK_BETWEEN_NODES,
											options: {
												target: currentNode.properties[UIA.NodeProperties.UIModelType],
												source: id
											}
										},
										{
											operation: UIA.CHANGE_NODE_PROPERTY,
											options: {
												prop: UIA.NodeProperties.UIModelType,
												id: currentNode.id,
												value
											}
										},
										{
											operation: UIA.ADD_LINK_BETWEEN_NODES,
											options: {
												target: value,
												source: id,
												properties: { ...UIA.LinkProperties.ModelTypeLink }
											}
										}
									]);
								}}
								value={
									currentNode.properties ? currentNode.properties[UIA.NodeProperties.UIModelType] : ''
								}
							/>
						) : null}
						{use_model_as_type || use_model_as_local ? (
							<CheckBox
								label={Titles.IsReferenceList}
								value={
									currentNode.properties ? (
										currentNode.properties[UIA.NodeProperties.IsReferenceList]
									) : (
										''
									)
								}
								onChange={(value) => {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: UIA.NodeProperties.IsReferenceList,
										id: currentNode.id,
										value
									});
								}}
							/>
						) : null}
						<CheckBox
							label={Titles.UseDefaultValue}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.UseDefaultValue)}
							onChange={(value: string) => {
								this.props.graphOperation([
									{
										operation: UIA.CHANGE_NODE_PROPERTY,
										options: {
											prop: UIA.NodeProperties.UseDefaultValue,
											id: currentNode.id,
											value
										}
									}
								]);
							}}
						/>
						<TextInput
							label={Titles.DefaultValue}
							value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.DefaultValue)}
							onChange={(value: string) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.DefaultValue,
									id: currentNode.id,
									value
								});
							}}
						/>
					</FormControl>
				) : null}
				<ControlSideBarMenuHeader title={Titles.ModelActions} />
				<ControlSideBarMenu>
					<ControlSideBarMenuItem
						onClick={() => {
							this.props.graphOperation(UIA.NEW_ATTRIBUTE_NODE, {
								parent: UIA.Visual(state, UIA.SELECTED_NODE),
								groupProperties: {},
								linkProperties: {
									properties: { ...LinkProperties.AttributeLink }
								}
							});
						}}
						icon={'fa fa-puzzle-piece'}
						title={Titles.AddAttribute}
						description={Titles.AddAttributeDescription}
					/>
				</ControlSideBarMenu>
			</TabPane>
		);
	}
}

export default UIConnect(PropertyActivityMenu);
