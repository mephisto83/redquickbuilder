import * as _ from 'lodash';
import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { BasePositionModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { FlowCodePortModel } from './FlowCodePortModel';
import ts from 'typescript';

export interface FlowCodeNodeModelOptions extends BasePositionModelOptions {
	name?: string;
	color?: string;
}

export interface FlowCodeNodeModelGenerics extends NodeModelGenerics {
	OPTIONS: FlowCodeNodeModelOptions;
}

export class FlowCodeNodeModel extends NodeModel<FlowCodeNodeModelGenerics> {
	protected portsIn: FlowCodePortModel[];
	protected portsOut: FlowCodePortModel[];

	constructor(name: string, color: string);
	constructor(options?: FlowCodeNodeModelOptions);
	constructor(options: any = {}, color?: string) {
		if (typeof options === 'string') {
			options = {
				name: options,
				color: color
			};
		}
		super({
			type: 'default',
			name: 'Untitled',
			color: 'rgb(0,192,255)',
			...options
		});
		this.portsOut = [];
		this.portsIn = [];
	}

	doClone(lookupTable: {}, clone: any): void {
		clone.portsIn = [];
		clone.portsOut = [];
		super.doClone(lookupTable, clone);
	}

	removePort(port: FlowCodePortModel): void {
		super.removePort(port);
		if (port.getOptions().in) {
			this.portsIn.splice(this.portsIn.indexOf(port), 1);
		} else {
			this.portsOut.splice(this.portsOut.indexOf(port), 1);
		}
	}

	addPort<T extends FlowCodePortModel>(port: T): T {
		super.addPort(port);
		if (port.getOptions().in) {
			if (this.portsIn.indexOf(port) === -1) {
				this.portsIn.push(port);
			}
		} else {
			if (this.portsOut.indexOf(port) === -1) {
				this.portsOut.push(port);
			}
		}
		return port;
	}

	addFlowIn(): FlowCodePortModel {
		const p = new FlowCodePortModel({
			in: true,
			name: 'In',
			label: 'In',
			alignment: PortModelAlignment.LEFT,
			isFlow: true
		});

		return this.addPort(p);
	}

	addFlowOut(): FlowCodePortModel {
		const p = new FlowCodePortModel({
			in: false,
			name: 'Out',
			label: 'Out',
			alignment: PortModelAlignment.RIGHT,
			isFlow: true
		});

		return this.addPort(p);
	}

	addInPort(label: string, kind?: ts.SyntaxKind, after = true): FlowCodePortModel {
		const p = new FlowCodePortModel({
			in: true,
			name: label,
			label: label,
			kind: kind,
			alignment: PortModelAlignment.LEFT
		});
		if (!after) {
			this.portsIn.splice(0, 0, p);
		}
		return this.addPort(p);
	}


	addOutPort(label: string, kind?: ts.SyntaxKind, after = true): FlowCodePortModel {
		const p = new FlowCodePortModel({
			in: false,
			name: label,
			kind: kind,
			label: label,
			alignment: PortModelAlignment.RIGHT
		});
		if (!after) {
			this.portsOut.splice(0, 0, p);
		}
		return this.addPort(p);
	}

	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.name = event.data.name;
		this.options.color = event.data.color;
		this.portsIn = _.map(event.data.portsInOrder, (id) => {
			return this.getPortFromID(id);
		}) as FlowCodePortModel[];
		this.portsOut = _.map(event.data.portsOutOrder, (id) => {
			return this.getPortFromID(id);
		}) as FlowCodePortModel[];
	}

	serialize(): any {
		return {
			...super.serialize(),
			name: this.options.name,
			color: this.options.color,
			portsInOrder: _.map(this.portsIn, (port) => {
				return port.getID();
			}),
			portsOutOrder: _.map(this.portsOut, (port) => {
				return port.getID();
			})
		};
	}

	getInPorts(): FlowCodePortModel[] {
		return this.portsIn;
	}

	getOutPorts(): FlowCodePortModel[] {
		return this.portsOut;
	}
}
