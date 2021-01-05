// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiActions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import { ScreenVisualInsert, VisualInsert } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { ComponentDidMountEffectDataChains, DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import { viewCode } from '../actions/remoteActions';
import VisualInsertComponent from './visualInsertComponent';

export default class ScreenVisualInsertComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let insert: ScreenVisualInsert = this.props.insert;
		if (!insert) {
			return <span />;
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={insert.name || Titles.ComponentDidMount}
			>
				<TreeViewItemContainer>
					<CheckBox
						label={Titles.Reference}
						value={insert.isReference}
						onChange={(value: boolean) => {
							insert.isReference = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
				{insert.isReference ? <SelectInput
					value={insert.reference}
					label={"Visual Insert Ref."}
					onChange={(value: string) => {
						insert.reference = value;
						this.setState({
							turn: UIA.GUID()
						})
						if (this.props.onChange) {
							this.props.onChange();
						}
					}}
					options={UIA.NodesByType(null, NodeTypes.VisualInsert).toNodeSelect()}
				/> : null}
				{insert.isReference ? null : <TreeViewItemContainer>
					<TextInput
						label={Titles.Name}
						value={insert.name}
						onChange={(value: string) => {
							insert.name = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>}
				{insert.isReference ? null : <VisualInsertComponent
					label={Titles.Insert}
					visualInsert={insert.visualInsert}
					onChange={() => {
						this.setState({
							turn: UIA.GUID()
						});
						if (this.props.onChange) {
							this.props.onChange(insert);
						}
					}}
				/>}
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.RemoveVisualInsert}`}
						onClick={() => {
							if (this.props.onDelete) {
								this.props.onDelete();
							}
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
						icon="fa fa-minus"
					/>
				</TreeViewButtonGroup>
			</TreeViewMenu>
		);
	}
}
