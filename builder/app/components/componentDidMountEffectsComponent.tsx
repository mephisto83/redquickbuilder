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
import { ComponentDidMountEffect, ScreenEffect } from '../interface/methodprops';
import ScreenEffectComponent from './screenEffectComponent';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import ComponentDidMountEffectComponent from './componentDidMountEffectComponent';

export default class ComponentDidMountEffectsComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let componentDidMountEffects: ComponentDidMountEffect[] = this.props.effects;
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
							componentDidMountEffects.push({
								id: UIA.GUID(),
								name: '',
								dataChain: ''
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(componentDidMountEffects || []).map((componentDidMountEffect: ComponentDidMountEffect) => {
					return (
						<ComponentDidMountEffectComponent
							api={this.props.api}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = componentDidMountEffects.findIndex((v) => v.id === componentDidMountEffect.id);
								if (index !== -1 && componentDidMountEffects) {
									componentDidMountEffects.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							effect={componentDidMountEffect}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
