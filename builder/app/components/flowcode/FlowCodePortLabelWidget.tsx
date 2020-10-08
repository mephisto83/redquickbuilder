import * as React from 'react';
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core';
import { FlowCodePortModel } from './FlowCodePortModel';
import styled from '@emotion/styled';
import TextInput from '../textinput';
import SelectInput from '../selectinput';
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
		&:hover {
			background: rgb(192, 255, 0);
		}
	`;
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
		let selectOptions = options.selectFunc();
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
			if (options && options.prompt) {
				this.setState({ showInput: true, value: options.value || options.label });
			}
			else if (options && options.selectFunc) {
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
