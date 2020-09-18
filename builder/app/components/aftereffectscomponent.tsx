// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import TreeViewMenu from './treeviewmenu';
import { AfterEffect, TargetMethodType } from '../interface/methodprops';
import TreeViewButtonGroup from './treeviewbuttongroup';
import TreeViewGroupButton from './treeviewgroupbutton';
import AfterEffectComponent from './aftereffectcomponent';
import AfterEffectInput from './aftereffectinput';

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
				active
				onClick={() => {
					this.setState({ open: !this.state.open });
				}}
				title={Titles.AfterEffects}
			>
        <AfterEffectInput afterEffects={afterEffects} />
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
								dataChainOptions: {},
								autoCalculate: true
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
							methodDescription={this.props.methodDescription}
							previousEffect={false ? afterEffects[index - 1] : null}
							api={this.props.api}
							dataChainType={this.props.dataChainType}
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
									if (afterEffect.dataChain) {
										UIA.removeNodeById(afterEffect.dataChain);
									}
									afterEffects.splice(index, 1);
									this.setState({ turn: UIA.GUID() });
								}
							}}
							afterEffect={afterEffect}
							routes={afterEffects}
						/>
					);
				})}
			</TreeViewMenu>
		);
	}
}
