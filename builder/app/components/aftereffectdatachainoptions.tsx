// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import {
	AfterEffect,
	MountingDescription,
	MethodDescription} from '../interface/methodprops';
import AfterEffectDataChainOption from './aftereffectdatachainoption';

export default class AfterEffectDataChainOptions extends Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}
	getPreviousDescription(): MethodDescription | null {
		let previousEffect: AfterEffect = this.props.previousEffect;
		let methodDescription: MethodDescription = this.props.methodDescription;
		if (methodDescription) {
			return methodDescription;
		}
		if (previousEffect) {
			let description: MountingDescription = (this.props.methods || []).find((method: MountingDescription) => {
				return method.id === previousEffect.target;
			});
			if (description.methodDescription) {
				return description.methodDescription;
			}
		}
		return null;
	}
	render() {
		let afterEffect: AfterEffect = this.props.afterEffect;
		if (!afterEffect) {
			return <span />;
		}

		let previousMethodDescription: MethodDescription | null = this.getPreviousDescription();

		afterEffect.dataChainOptions = afterEffect.dataChainOptions || {};
		let currentDescription: MountingDescription = this.props.currentDescription;
		if (!previousMethodDescription || !currentDescription || !currentDescription.methodDescription) {
			return <span />;
		}
		let currentMethodDescription: MethodDescription = currentDescription.methodDescription;
		let onchange = () => {
			this.setState({
				turn: UIA.GUID()
			});
			if (this.props.onChange) {
				this.props.onChange();
			}
		};
		return (
			<AfterEffectDataChainOption onChange={onchange}
				previousMethodDescription={previousMethodDescription}
        currentMethodDescription={currentMethodDescription}
        routes={this.props.routes}
        methods={this.props.methods}
				dataChainOptions={afterEffect.dataChainOptions}
			/>
		);
	}
}
