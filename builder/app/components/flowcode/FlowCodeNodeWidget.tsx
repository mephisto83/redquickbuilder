import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { FlowCodeNodeModel } from './FlowCodeNodeModel';
import { FlowCodePortLabel } from './FlowCodePortLabelWidget';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { FlowCodePortModel } from './FlowCodePortModel';
import { ProcessFlowCodeCommand } from './PortHandler';
import { FlowCodeNodeCommands } from './flowutils';

export const SNode = styled.div<{ background: string; selected: boolean }>`
		background-color: ${(p) => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		border: solid 2px ${(p) => (p.selected ? 'rgb(0,192,255)' : 'black')};
	`;

export const STitle = styled.div`
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		white-space: nowrap;
		justify-items: center;
	`;

export const STitleName = styled.div`
		flex-grow: 1;
		padding: 5px 5px;
	`;

export const SPorts = styled.div`
		display: flex;
		background-image: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2));
	`;
export const SButton = styled.div`
	padding: 4px;
	margin: 2px;
	border-radius: 2px;
    align-items: center;
    justify-content: center;
	background-color: rgba(0,0,0,.3);
	display: inline-flex;
    height: 22px;
    width: 22px;
    justify-content: center;
    align-items: center;
`;
export const SPortsContainer = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;

		&:first-of-type {
			margin-right: 10px;
		}

		&:only-child {
			margin-right: 0px;
		}
	`;

export interface FlowCodeNodeProps {
	node: FlowCodeNodeModel;
	engine: DiagramEngine;
}

/**
 * Default node that models the FlowCodeNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */
export class FlowCodeNodeWidget extends React.Component<FlowCodeNodeProps> {
	generatePort = (port: FlowCodePortModel) => {
		return <FlowCodePortLabel engine={this.props.engine} port={port} clearLinks={(portModel: FlowCodePortModel) => {
			this.props.node.removePortLinks(portModel);
		}} key={port.getID()} />;
	};

	render() {
		let options = this.props.node.getOptions();
		return (
			<SNode
				data-default-node-name={this.props.node.getOptions().name}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}>
				<STitle>
					<STitleName>{this.props.node.getOptions().name}</STitleName>
				</STitle>
				{ options && options.panel ? (<div style={{ paddingLeft: 5, paddingRight: 5, cursor: 'pointer' }} onClick={() => { }}>
					{options.addInPort ? <i className="fa fa-plus" onClick={() => {
						this.props.node.addOutPort(`sequence ${this.props.node.getOutPorts().length}`);
						this.setState({ turn: Date.now() })
					}} /> : null}
					{options.commands ? options.commands.map((command: FlowCodeNodeCommands) => {
						return <SButton title={command.title} onClick={() => {
							let res = ProcessFlowCodeCommand(this.props.node, command);
							if (res) {
								this.forceUpdate();
							}
						}} ><i className={command.clsName}/></SButton>
					}) : null}
				</div>) : null
	}
				<SPorts>
	<SPortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</SPortsContainer>
	<SPortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</SPortsContainer>
</SPorts>
			</SNode >
		);
	}
}
