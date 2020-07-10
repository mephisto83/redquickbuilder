// @flow
import React, { Component } from 'react';
import { UIConnect } from '../utils/utils';
import ControlSideBarMenu, { ControlSideBarMenuItem, ControlSideBarMenuHeader } from './controlsidebarmenu';
import * as UIA from '../actions/uiactions';
import TabPane from './tabpane';
import * as Titles from './titles';
import FormControl from './formcontrol';
import CheckBox from './checkbox';
import SelectInput from './selectinput';
import TextBox from './textinput';
import TextInput from './textinput';
import TreeViewMenu from './treeviewmenu';
import { ScreenEffect } from '../interface/methodprops';
import ScreenEffectComponent from './screenEffectComponent';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';

export default class ScreenEffectsComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let screenEffects: ScreenEffect[] = this.props.screenEffects;
		return (
			<TreeViewMenu
				open={this.state.open}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.ScreenEffects}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddScreenEffect}`}
						onClick={() => {
							screenEffects.push({
								id: UIA.GUID(),
								name: '',
								dataChain: ''
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(screenEffects || []).map((screenEffect: ScreenEffect) => {
					return (
						<ScreenEffectComponent
							api={this.props.api}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							onDelete={() => {
								let index: number = screenEffects.findIndex((v) => v.id === screenEffect.id);
								if (index !== -1 && screenEffects) {
									screenEffects.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							screenEffect={screenEffect}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
