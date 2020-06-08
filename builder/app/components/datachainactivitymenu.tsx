// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import TextInput from './textinput';
import SelectInput from './selectinput';
import FormControl from './formcontrol';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import SelectInputProperty from './selectinputproperty';
import CheckBox from './checkbox';
import {
	NodeProperties,
	NodeTypes,
	LinkType,
	SelectorPropertyKeys,
	NavigateTypes,
	CODE_EDITOR,
	MAIN_CONTENT
} from '../constants/nodetypes';
import { GetNodesLinkedTo } from '../methods/graph_methods';
import { MethodFunctions } from '../constants/functiontypes';
import { DataChainFunctions, DataChainContextMethods } from '../constants/datachain';
import ButtonList from './buttonlist';

import { getReferenceInserts } from '../utils/utilservice';
import CheckBoxProperty from './checkboxproperty';
import Typeahead from './typeahead';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';

class DataChainActvityMenu extends Component<any, any> {
	getLambdaVariableTree() {
		const { state } = this.props;
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		let lambdaVariables = null;
		if (UIA.GetNodeProp(currentNode, UIA.NodeProperties.CS)) {
			const methods = GetNodesLinkedTo(null, {
				id: currentNode.id,
				link: LinkType.DataChainLink,
				componentType: NodeTypes.Method
			});
			if (methods.length) {
				const functionType = UIA.GetNodeProp(methods[0], UIA.NodeProperties.FunctionType);
				const { lambda } = MethodFunctions[functionType];
				if (lambda && lambda.default) {
					const methodProps = UIA.GetMethodProps(methods[0]);
					lambdaVariables = (
						<ButtonList
							active={true}
							isSelected={() => true}
							items={Object.keys(lambda.default).filter((key) => key !== 'return').map((key) => {
								return {
									title: `[${key}]: ${UIA.GetCodeName(methodProps[lambda.default[key]]) ||
										lambda.default[key]}`,
									value: key,
									id: key
								};
							})}
						/>
					);
				}
			}
		}
		return lambdaVariables;
	}

	render() {
		const { state } = this.props;
		const active = UIA.IsCurrentNodeA(state, UIA.NodeTypes.DataChain);
		if (!active) {
			return <div />;
		}
		const currentNode = UIA.Node(state, UIA.Visual(state, UIA.SELECTED_NODE));
		const dataChainFuncType = UIA.GetNodeProp(currentNode, NodeProperties.DataChainFunctionType);
		const showModel = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.model
			: false;
		const lambda = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.lambda : false;
		let inserts = [];

		if (lambda) {
			const lambdaText = UIA.GetNodeProp(currentNode, NodeProperties.Lambda);
			inserts = getReferenceInserts(lambdaText || '')
				.map((v) => v.substr(2, v.length - 3))
				.unique((_insert) => {
					const temp = _insert.split('@');
					const insert = temp.length > 1 ? temp[1] : temp[0];
					const args = insert.split('~').filter((x) => x);
					const property = args[0];
					if (args.length > 1) {
						return args[1];
					}
					return property || _insert;
				})
				.map((_insert) => {
					const temp = _insert.split('@');
					const insert = temp.length > 1 ? temp[1] : temp[0];
					const args = insert.split('~');
					const model = args[0];
					const property = args[1];
					let types = args.subset(1);
					if (!types.length) {
						types = [ NodeTypes.Model ];
					}
					const value = UIA.GetNodeProp(currentNode, NodeProperties.LambdaInsertArguments) || {};
					const nodes = property
						? GetNodesLinkedTo(null, {
								id: value[model],
								link: LinkType.PropertyLink
							})
						: UIA.NodesByType(state, types); //  UIA.NodesByType(null, NodeTypes.Property);
					return (
						<SelectInputProperty
							label={property ? `${model}.${property}` : model}
							model={property || model}
							valueObj={value}
							value={property ? value[property] : value[model]}
							node={currentNode}
							options={nodes.toNodeSelect()}
						/>
					);
				});
		}
		const showDataChainRef = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.dataref
			: false;
		const showNumber = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.number
			: false;
		const showProperty = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.property
			: false;
		const showNode1 = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.node_1
			: false;
		const showValue = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.value
			: false;
		const showScreens = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.screen
			: false;
		const showMethods = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.method
			: false;
		const shownavigateMethod = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.navigateMethod
			: false;
		const showSelector = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.selector
			: false;
		const showSelectorProperty = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.selectorProperty
			: false;
		const showNode2 = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.node_2
			: false;
		const stateKey = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.stateKey
			: false;
		const modelKey = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.modelKey
			: false;
		const viewModelKey = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.viewModelKey
			: false;
		const listkey = DataChainFunctions[dataChainFuncType] ? DataChainFunctions[dataChainFuncType].ui.list : false;
		const dataChainReferences = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.datareferences
			: false;
		const useNavigationParms = DataChainFunctions[dataChainFuncType]
			? DataChainFunctions[dataChainFuncType].ui.useParams
			: false;
		const datachainreferenceValues = UIA.GetNodeProp(currentNode, NodeProperties.DataChainReferences) || {};
		const data_chain_entry = UIA.GetDataChainEntryNodes().toNodeSelect();
		const selector_nodes = UIA.NodesByType(state, NodeTypes.Selector).toNodeSelect();
		const selector_node_properties = Object.keys(SelectorPropertyKeys).map((v) => ({
			title: v,
			value: SelectorPropertyKeys[v]
		}));

		const node_inputs = UIA.NodesByType(state, NodeTypes.DataChain)
			.filter((x) => {
				return (
					UIA.GetNodeProp(x, NodeProperties.GroupParent) ===
						UIA.GetNodeProp(currentNode, NodeProperties.GroupParent) && x !== currentNode
				);
			})
			.toNodeSelect();
		const lists = UIA.NodesByType(state, NodeTypes.Lists).toNodeSelect();
		const lambdaVariables = this.getLambdaVariableTree();

		return (
			<TabPane active={active}>
				<FormControl>
					<CheckBox
						label={Titles.EntryPoint}
						value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.EntryPoint)}
						onChange={(value: any) => {
							this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
								prop: UIA.NodeProperties.EntryPoint,
								id: currentNode.id,
								value: value
							});
						}}
					/>
					<CheckBoxProperty
						title={Titles.CSEntryPoint}
						node={currentNode}
						property={UIA.NodeProperties.CSEntryPoint}
					/>
					<CheckBoxProperty title={Titles.CSharp} node={currentNode} property={UIA.NodeProperties.CS} />
					<CheckBox
						label={Titles.AsOutput}
						value={UIA.GetNodeProp(currentNode, UIA.NodeProperties.AsOutput)}
						onChange={(value: any) => {
							this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
								prop: UIA.NodeProperties.AsOutput,
								id: currentNode.id,
								value: value
							});
						}}
					/>
					<SelectInput
						onChange={(value: any) => {
							const id = currentNode.id;
							this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
								prop: UIA.NodeProperties.DataChainFunctionType,
								id,
								value
							});
						}}
						label={Titles.FunctionTypes}
						value={dataChainFuncType}
						options={Object.keys(DataChainFunctions).map((key) => ({
							title: key,
							value: key
						}))}
					/>
					{showNumber ? (
						<TextInput
							onChange={(value: any) => {
								const id = currentNode.id;
								if (!isNaN(value)) {
									this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
										prop: UIA.NodeProperties.NumberParameter,
										id,
										value
									});
								}
							}}
							label={Titles.Number}
							value={UIA.GetNodeProp(currentNode, NodeProperties.NumberParameter)}
						/>
					) : null}
					{lambda ? (
						<TextInput
							textarea={true}
							disabled
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.Lambda,
									id,
									value
								});
							}}
							label={Titles.Lambda}
							value={UIA.GetNodeProp(currentNode, NodeProperties.Lambda)}
						/>
					) : null}
					{lambda ? (
						<TreeViewButtonGroup>
							<TreeViewGroupButton
								title={Titles.Load}
								onClick={() => {
									this.props.setVisual(UIA.CODE_EDITOR_INIT_VALUE, UIA.GUID());

									this.props.setVisual(MAIN_CONTENT, CODE_EDITOR);
								}}
								icon="fa  fa-cloud-upload"
							/>
						</TreeViewButtonGroup>
					) : null}
					{lambda ? inserts : null}
					{lambdaVariables}
					{showModel ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: currentNode.properties[UIA.NodeProperties.UIModelType],
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.UIModelType,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ModelTypeLink }
								});
							}}
							label={Titles.Models}
							value={UIA.GetNodeProp(currentNode, NodeProperties.UIModelType)}
							options={UIA.GetModelNodes().toNodeSelect()}
						/>
					) : null}
					{showProperty ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: UIA.GetNodeProp(currentNode, UIA.NodeProperties.Property),
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.Property,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.PropertyLink }
								});
							}}
							label={Titles.Property}
							value={UIA.GetNodeProp(currentNode, NodeProperties.Property)}
							options={UIA.GetModelPropertyChildren(
								UIA.GetNodeProp(currentNode, UIA.NodeProperties.UIModelType)
							).toNodeSelect()}
						/>
					) : null}
					{stateKey ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: UIA.GetNodeProp(currentNode, UIA.NodeProperties.StateKey),
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.StateKey,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.StateKey }
								});
							}}
							label={Titles.StateKey}
							value={UIA.GetNodeProp(currentNode, NodeProperties.StateKey)}
							options={UIA.NodesByType(state, [ NodeTypes.StateKey ]).toNodeSelect()}
						/>
					) : null}
					{modelKey ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: UIA.GetNodeProp(currentNode, UIA.NodeProperties.ModelKey),
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ModelKey,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ModelKey }
								});
							}}
							label={Titles.ModelKey}
							value={UIA.GetNodeProp(currentNode, NodeProperties.ModelKey)}
							options={UIA.NodesByType(state, [ NodeTypes.Model ]).toNodeSelect()}
						/>
					) : null}
					{viewModelKey ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									target: UIA.GetNodeProp(currentNode, UIA.NodeProperties.ViewModelKey),
									source: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ViewModelKey,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									target: value,
									source: id,
									properties: { ...UIA.LinkProperties.ViewModelKey }
								});
							}}
							label={Titles.ViewModel}
							value={UIA.GetNodeProp(currentNode, NodeProperties.ViewModelKey)}
							options={UIA.NodesByType(state, [ NodeTypes.Screen ]).toNodeSelect()}
						/>
					) : null}
					{showDataChainRef ? (
						<Typeahead
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									source: currentNode.properties[UIA.NodeProperties.DataChainReference],
									target: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.DataChainReference,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									source: value,
									target: id,
									properties: { ...UIA.LinkProperties.DataChainLink }
								});
							}}
							label={`${Titles.DataChain}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.DataChainReference)}
							options={data_chain_entry}
						/>
					) : null}
					{dataChainReferences ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;

								const currentValue =
									UIA.GetNodeProp(currentNode, NodeProperties.DataChainReferences) || {};
								const freeKey = 'abcdefghijklmnopqrstuvwxyz'.split('').find((v) => !currentValue[v]);
								currentValue[freeKey] = value;
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.DataChainReferences,
									id,
									value: currentValue
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									source: value,
									target: id,
									properties: { ...UIA.LinkProperties.DataChainLink }
								});
							}}
							label={`${Titles.DataChain}`}
							value={
								Object.values(UIA.GetNodeProp(currentNode, NodeProperties.DataChainReference) || {})[0]
							}
							options={data_chain_entry}
						/>
					) : null}
					{useNavigationParms ? (
						<CheckBox
							label={Titles.UseNavigationParams}
							value={UIA.GetNodeProp(currentNode, useNavigationParms)}
							onChange={(value: any) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: useNavigationParms,
									id: currentNode.id,
									value
								});
							}}
						/>
					) : null}
					{dataChainReferences && datachainreferenceValues ? (
						<ButtonList
							active={true}
							isSelected={() => true}
							items={Object.keys(datachainreferenceValues).map((key) => {
								return {
									title: `[${key}]: ${UIA.GetNodeTitle(datachainreferenceValues[key])}`,
									value: datachainreferenceValues[key],
									id: datachainreferenceValues[key]
								};
							})}
							onClick={(item: { value: string }) => {
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									source: item.value,
									target: currentNode.id
								});
								const currentValue =
									UIA.GetNodeProp(currentNode, NodeProperties.DataChainReference) || {};
								Object.keys(datachainreferenceValues)
									.filter((v) => datachainreferenceValues[v] === item.value)
									.map((v) => {
										delete currentValue[v];
									});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.DataChainReferences,
									id,
									value: currentValue
								});
							}}
						/>
					) : null}
					{showSelector ? (
						<SelectInput
							onChange={DataChainContextMethods.Selector.bind(this, currentNode)}
							label={`${Titles.Selector}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.Selector)}
							options={selector_nodes}
						/>
					) : null}
					{showSelectorProperty ? (
						<SelectInput
							onChange={DataChainContextMethods.SelectorProperty.bind(this, currentNode)}
							label={`${Titles.SelectorProperty}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.SelectorProperty)}
							options={selector_node_properties}
						/>
					) : null}
					{showScreens ? (
						<SelectInput
							onChange={DataChainContextMethods.Screen.bind(this, currentNode)}
							label={`${Titles.Screen}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.Screen)}
							options={UIA.NodesByType(state, NodeTypes.Screen).toNodeSelect()}
						/>
					) : null}
					{showMethods ? (
						<SelectInput
							onChange={DataChainContextMethods.Method.bind(this, currentNode)}
							label={`${Titles.Methods}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.Method)}
							options={UIA.NodesByType(state, NodeTypes.Method).toNodeSelect()}
						/>
					) : null}
					{shownavigateMethod ? (
						<SelectInput
							onChange={(value: any) => {
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.NavigationAction,
									id: currentNode.id,
									value
								});
							}}
							label={`${Titles.NavigationAction}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.NavigationAction)}
							options={Object.keys(NavigateTypes).map((v) => ({
								title: v,
								id: v,
								value: v
							}))}
						/>
					) : null}
					{showNode1 ? (
						<SelectInput
							onChange={DataChainContextMethods.Input1.bind(this, currentNode)}
							label={`${Titles.Input} 1`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.ChainNodeInput1)}
							options={node_inputs}
						/>
					) : null}
					{listkey ? (
						<SelectInput
							onChange={DataChainContextMethods.List.bind(this, currentNode)}
							label={`${Titles.List}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.List)}
							options={lists}
						/>
					) : null}
					{showNode2 ? (
						<SelectInput
							onChange={(value: any) => {
								const id = currentNode.id;
								this.props.graphOperation(UIA.REMOVE_LINK_BETWEEN_NODES, {
									source: currentNode.properties[UIA.NodeProperties.ChainNodeInput2],
									target: id
								});
								this.props.graphOperation(UIA.CHANGE_NODE_PROPERTY, {
									prop: UIA.NodeProperties.ChainNodeInput2,
									id,
									value
								});
								this.props.graphOperation(UIA.ADD_LINK_BETWEEN_NODES, {
									source: value,
									target: id,
									properties: { ...UIA.LinkProperties.DataChainLink }
								});
							}}
							label={`${Titles.Input} 2`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.ChainNodeInput2)}
							options={node_inputs}
						/>
					) : null}
					{showValue ? (
						<SelectInput
							onChange={DataChainContextMethods.Value.bind(this, currentNode)}
							label={`${Titles.Value}`}
							value={UIA.GetNodeProp(currentNode, NodeProperties.Value)}
							options={node_inputs}
						/>
					) : null}
				</FormControl>
			</TabPane>
		);
	}
}

export default UIConnect(DataChainActvityMenu);
