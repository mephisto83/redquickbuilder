// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import { AFTER_EFFECTS } from '../constants/functiontypes';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import {
	SetAffterEffectProperty,
	GetMethodNode,
	GetNode,
	TARGET,
	GetLinkChain,
	SOURCE
} from '../methods/graph_methods';
import { LinkType, Methods } from '../constants/nodetypes';

class AfterEffectsActivityMenu extends Component<any, any> {
	getControls() {
		var { state } = this.props;

		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

		let result = [];
		let afterMethod = UIA.GetNodeProp(currentNode, UIA.NodeProperties.AfterMethod);
		result.push(
			<SelectInput
				label={Titles.Type}
				options={Object.keys(AFTER_EFFECTS).map((val) => {
					return {
						value: val,
						title: val
					};
				})}
				onChange={(value) => {
					var id = currentNode.id;
					this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
						prop: UIA.NodeProperties.AfterMethod,
						id,
						value
					});
				}}
				value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.AfterMethod)}
			/>
		);
		let methodNode = GetMethodNode(state, currentNode.id);
		let methodProps = UIA.GetMethodProps(methodNode);

		if (afterMethod && AFTER_EFFECTS[afterMethod]) {
			let { templateKeys } = AFTER_EFFECTS[afterMethod];
			if (templateKeys) {
				Object.values(templateKeys).map((value: any) => {
					let { key, nodeTypes, parent, useNodes, useMethodTypes, useString } = value;
					let setup = UIA.GetNodeProp(currentNode, UIA.NodeProperties.AfterMethodSetup);
					if (!parent && !useNodes && !useMethodTypes && !useString) {
						result.push(
							<SelectInput
								label={key}
								options={UIA.GetMethodNodeSelectOptions(methodProps)}
								onChange={(value: any) => {
									var afterEffectSetup = SetAffterEffectProperty(
										currentNode,
										afterMethod,
										key,
										value
									);

									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: UIA.NodeProperties.AfterMethodSetup,
										id: currentNode.id,
										value: afterEffectSetup
									});
								}}
								value={
									setup && setup[afterMethod] && setup[afterMethod][key] ? (
										setup[afterMethod][key]
									) : null
								}
							/>
						);
					} else if (setup && setup[afterMethod] && setup[afterMethod][parent]) {
						if (methodProps[setup[afterMethod][parent]]) {
							let parentNode = UIA.GetGraphNode(methodProps[setup[afterMethod][parent]]);
							if (parentNode) {
								let propertyNodes = GetLinkChain(state, {
									id: parentNode.id,
									links: [
										{
											type: LinkType.PropertyLink,
											direction: SOURCE
										}
									]
								});
								result.push(
									<SelectInput
										label={key}
										options={propertyNodes.toNodeSelect()}
										onChange={(value) => {
											var afterEffectSetup = SetAffterEffectProperty(
												currentNode,
												afterMethod,
												key,
												value
											);

											this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
												prop: UIA.NodeProperties.AfterMethodSetup,
												id: currentNode.id,
												value: afterEffectSetup
											});
										}}
										value={
											setup && setup[afterMethod] && setup[afterMethod][key] ? (
												setup[afterMethod][key]
											) : null
										}
									/>
								);
							}
						}
					} else {
						let ae_nodes = UIA.NodesByType(state, nodeTypes);
						let options = [];
						if (useNodes) {
							options = ae_nodes.toNodeSelect();
						} else if (useMethodTypes) {
							options = Object.keys(Methods).map((t) => {
								return {
									title: t,
									value: Methods[t]
								};
							});
						} else if (useString) {
							options = Object.values(useString).map((t) => {
								return {
									title: t,
									value: t
								};
							});
						}
						result.push(
							<SelectInput
								label={key}
								options={options}
								onChange={(value) => {
									var afterEffectSetup = SetAffterEffectProperty(
										currentNode,
										afterMethod,
										key,
										value
									);

									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: UIA.NodeProperties.AfterMethodSetup,
										id: currentNode.id,
										value: afterEffectSetup
									});
								}}
								value={
									setup && setup[afterMethod] && setup[afterMethod][key] ? (
										setup[afterMethod][key]
									) : null
								}
							/>
						);
					}
				});
			}
		}
		return result;
	}
	render() {
		var { state } = this.props;
		var active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.AfterEffect);
		if (!active) {
			return <div />;
		}
		var currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));

		let controls = active ? this.getControls() : [];
		return <TabPane active={active}>{currentNode ? <FormControl>{controls}</FormControl> : null}</TabPane>;
	}
}

export default UIConnect(AfterEffectsActivityMenu);
