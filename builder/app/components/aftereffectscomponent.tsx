// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import { AfterEffect, TargetMethodType } from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';

export default class AfterEffectsComponent extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	render() {
		let afterEffects: AfterEffect[] = this.props.afterEffects;
		return (
			<TreeViewMenu
				open={this.state.open}
				innerStyle={{ maxHeight: 300, overflowY: 'auto' }}
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.AfterEffects}
			>
				<TreeViewButtonGroup>
					<TreeViewGroupButton
						title={`${Titles.AddAfterMethods}`}
						onClick={() => {
							afterEffects.push({
								id: UIA.GUID(),
								name: '',
								dataChain: '',
								targetType: TargetMethodType.Effect,
								target: '',
								dataChainOptions: {}
							});

							this.setState({ turn: UIA.GUID() });
						}}
						icon="fa fa-plus"
					/>
				</TreeViewButtonGroup>
				{(afterEffects || []).map((afterEffect: AfterEffect, index: number) => {
					return (
						<AfterEffectComponent
							key={afterEffect.id}
							methodDescription={index ? null : this.props.methodDescription}
							previousEffect={index ? afterEffects[index - 1] : null}
							api={this.props.api}
							mountingItem={this.props.mountingItem}
							methods={this.props.methods}
							onChange={() => {
								if (this.props.onChange) {
									this.props.onChange();
								}
							}}
							onDirection={(direction: number) => {
								let index: number = afterEffects.findIndex((v) => v.id === afterEffect.id);
								if (index !== -1 && afterEffects) {
									let moveme: AfterEffect[] = afterEffects.splice(index, 1);
									if (index > 0) {
										afterEffects.splice(index + direction, 0, ...moveme);
									} else {
										afterEffects.push(...moveme);
									}
									this.setState({ turn: UIA.GUID() });
								}
							}}
							agent={this.props.agent}
							onDelete={() => {
								let index: number = afterEffects.findIndex((v) => v.id === afterEffect.id);
								if (index !== -1 && afterEffects) {
									afterEffects.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							afterEffect={afterEffect}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}