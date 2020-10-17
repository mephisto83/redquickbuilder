import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { FlowCodePortModel } from './FlowCodePortModel';
import * as UIA from '../../actions/uiactions';
import { Node } from '../../methods/graph_types';
import styled from '@emotion/styled';
import TextInput from '../textinput';
import SelectInput from '../selectinput';
import ts from 'typescript';
export interface FlowCodePortLabelProps {
	port: FlowCodePortModel;
	engine: DiagramEngine;
	clearLinks: any
}

export const SPortLabel = styled.div`
		display: flex;
		margin-top: 1px;
		align-items: center;
	`;

export const SLabel = styled.div`
		padding: 0 5px;
		flex-grow: 1;
	`;

export const SPort = styled.div`
		width: 15px;
		height: 15px;
		background: rgba(white, 0.1);
		border: solid 1px white;
		border-radius: 3px;
		&:hover {
			background: rgb(192, 255, 0);
		}
	`;
let selectTypes = () => {
	return Object.entries(ts.TypeFlags).map((v: any[]) => {
		return {
			title: v[0],
			value: v[0]
		}
	}).filter(v => isNaN(v.title));
}
let enumerationSelect = () => {
	let enumerations = UIA.Visual(UIA.GetStateFunc()(), UIA.FLOW_CODE_ENUMERATION);
	if (enumerations) {
		return enumerations.toNodeSelect();
	}
	return [];
}
let modelsSelect = () => {
	let modelProperties = UIA.Visual(UIA.GetStateFunc()(), UIA.FLOW_CODE_MODELS);
	if (modelProperties) {
		return modelProperties.map((a: any) => a.model).toNodeSelect();
	}
	return [];
}
let enumerationValueSelect = (port: FlowCodePortModel) => {
	if (port) {
		let options = port.getOptions();
		if (options.value) {
			let enumerations = UIA.Visual(UIA.GetStateFunc()(), UIA.FLOW_CODE_ENUMERATION);
			if (enumerations) {
				let _enum = enumerations.find((v: Node) => v.id === options.value)
				return UIA.GetNodeProp(_enum, UIA.NodeProperties.Enumeration).map((v: any) => ({ value: v.id, title: v.value }));
			}
		}
	}
	return [];
}
export class FlowCodePortLabel extends React.Component<FlowCodePortLabelProps, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			showInput: false,
			showSelect: false,
			value: ''
		};
	}
	getInput() {
		let options = this.props.port.getOptions();
		return (<span style={{ position: 'relative' }}>
			<div style={{ position: 'absolute', top: 0, left: 0, width: 250, height: 70 }}>
				<TextInput onBlur={() => {
					this.setState({ showInput: false })
				}} value={this.state.value} onChange={(val: string) => {
					options.value = val;
					this.setState({ showInput: false });
				}} />
			</div>
		</span>)
	}
	getSelect() {
		let options = this.props.port.getOptions();
		let selectOptions: any;
		switch (options.label) {
			case 'type':
				selectOptions = selectTypes();
				break;

			case 'valueType':
			case 'modelType':
				selectOptions = modelsSelect();
				break;
			case 'enumeration':
				selectOptions = enumerationSelect();
				break;
			case 'enumerationValue':
				selectOptions = (function () { return enumerationValueSelect(null) })()
				break;
		}
		return (<span style={{ position: 'relative' }}>
			<div style={{ position: 'absolute', top: 0, left: 0, width: 250, height: 70 }}>
				<SelectInput options={selectOptions} onBlur={() => {
					this.setState({ showSelect: false })
				}} value={options.value} onChange={(val: string) => {
					options.value = val;
					options.valueTitle = selectOptions.find((v: any) => v.value === val).title;

					this.setState({ showSelect: false });
				}} />
			</div>
		</span>)
	}
	render() {
		const options = this.props.port.getOptions();
		const port = (
			<PortWidget engine={this.props.engine} port={this.props.port}>
				<SPort />
			</PortWidget>
		);
		const label = <SLabel><span title={options.valueTitle || options.value || ''} onClick={() => {
			let options = this.props.port.getOptions();
			let hasPrompting = false;
			switch (options.label) {
				case 'variable':
					hasPrompting = true;
					break;
			}
			let hasSelectPrompting = false;
			switch (options.label) {
				case 'type':
				case 'valueType':
				case 'modelType':
				case 'enumeration':
				case 'enumerationValue':
					hasSelectPrompting = true;
					break;
			}
			if (options && hasPrompting) {
				this.setState({ showInput: true, value: options.value || options.label });
			}
			else if (options && hasSelectPrompting) {
				this.setState({ showSelect: true, value: options.value || options.label });
			}
		}}>{options.valueTitle || options.value || options.label}</span></SLabel>;

		return (
			<SPortLabel>
				{options.in ? port : label}
				<div style={{
					cursor: 'pointer',
					zIndex: 10000,
					paddingLeft: 4,
					paddingRight: 4
				}}
					onClick={() => {
						if (this.props.clearLinks) {
							this.props.clearLinks(this.props.port);
						}
					}}><i className="fa fa-times" /></div>
				{options.in ? label : port}
				{this.state.showInput ? this.getInput() : null}
				{this.state.showSelect ? this.getSelect() : null}
			</SPortLabel>
		);
	}
}
