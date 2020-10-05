import { FlowCodePortModel } from './FlowCodePortModel';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';

export class FlowCodePortFactory extends AbstractModelFactory<FlowCodePortModel, DiagramEngine> {
	constructor() {
		super('default');
	}

	generateModel(): FlowCodePortModel {
		return new FlowCodePortModel({
			name: 'unknown'
		});
	}
}
