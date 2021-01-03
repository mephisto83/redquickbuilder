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
import { ComponentDidMountEffect, ScreenEffect, ScreenVisualInsert, VisualInsertWhere } from '../interface/methodprops';
import ScreenEffectComponent from './screenEffectComponent';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ComponentDidMountEffectComponent from './componentDidMountEffectComponent';
import ScreenVisualInsertComponent from './screenVisualInsertComponent';

export default class ScreenVisualInsertsComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let screenVisualInserts: ScreenVisualInsert[] = this.props.inserts;
		return (
			<TreeViewMenu
				open={this.state.open}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.ComponentDidMount}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddComponentDidMountEffect}`}
						onClick={() => {
							screenVisualInserts.push({
								id: UIA.GUID(),
								name: '',
								visualInsert: {
									template: '',
									where: VisualInsertWhere.Start
								}
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(screenVisualInserts || []).map((screenVisualInsert: ScreenVisualInsert) => {
					return (
						<ScreenVisualInsertComponent
							api={this.props.api}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = screenVisualInserts.findIndex((v) => v.id === screenVisualInsert.id);
								if (index !== -1 && screenVisualInserts) {
									screenVisualInserts.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							insert={screenVisualInsert}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
