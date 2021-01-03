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
import { ScreenVisualInsert, VisualInsert, VisualInsertWhere } from '../interface/methodprops';
import TreeViewItemContainer from './treeviewitemcontainer';
import { NodeTypes, NodeProperties } from '../constants/nodetypes';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import { ComponentDidMountEffectDataChains, DataChainFunctionKeys, DataChainFunctions } from '../constants/datachain';
import { GetStateFunc, graphOperation } from '../actions/uiActions';
import { Node } from '../methods/graph_types';
import { viewCode } from '../actions/remoteActions';

export default class VisualInsertComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let visualInsert: VisualInsert = this.props.visualInsert;

		if (!visualInsert) {
			return <span />;
		}
		return (
			<TreeViewMenu
				open={this.state.open}
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				active
				title={'Visual Component'}
			>
				<TreeViewItemContainer>
					<SelectInput
						label={Titles.Where}
						options={Object.keys(VisualInsertWhere).map((v: string) => {
							return ({
								title: v,
								value: VisualInsertWhere[v]
							});
						})}
						value={visualInsert.where}
						onChange={(value: VisualInsertWhere) => {
							visualInsert.where = value;
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
					<TextInput
						label={Titles.Name}
						value={visualInsert.template}
						onChange={(value: string) => {
							visualInsert.template = value;
							this.setState({
								turn: UIA.GUID()
							});
							if (this.props.onChange) {
								this.props.onChange();
							}
						}}
					/>
				</TreeViewItemContainer>
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
