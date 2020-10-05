import * as React from 'react';
import * as _ from 'lodash';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { FlowCodeNodeModel } from './FlowCodeNodeModel';
import { FlowCodePortLabel } from './FlowCodePortLabelWidget';
import styled from '@emotion/styled';
import { css } from '@emotion/core';
import { FlowCodePortModel } from './FlowCodePortModel';

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
		return <FlowCodePortLabel engine={this.props.engine} port={port} key={port.getID()} />;
	};

	render() {
		return (
			<SNode
				data-default-node-name={this.props.node.getOptions().name}
				selected={this.props.node.isSelected()}
				background={this.props.node.getOptions().color}>
				<STitle>
					<STitleName>{this.props.node.getOptions().name}</STitleName>
				</STitle>
				<SPorts>
					<SPortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</SPortsContainer>
					<SPortsContainer>{_.map(this.props.node.getOutPorts(), this.generatePort)}</SPortsContainer>
				</SPorts>
			</SNode>
		);
	}
}
