import * as React from 'react';
import { FlowCodeNodeModel } from './FlowCodeNodeModel';
import { FlowCodeNodeWidget } from './FlowCodeNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class FlowCodeNodeFactory extends AbstractReactFactory<FlowCodeNodeModel, DiagramEngine> {
	constructor() {
		super('default');
	}

	generateReactWidget(event): JSX.Element {
		return <FlowCodeNodeWidget engine={this.engine} node={event.model} />;
	}

	generateModel(event): FlowCodeNodeModel {
		return new FlowCodeNodeModel();
	}
}
