import * as _ from 'lodash';
import { NodeModel, NodeModelGenerics, PortModelAlignment } from '@projectstorm/react-diagrams-core';
import { BasePositionModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { FlowCodePortModel } from './FlowCodePortModel';
import ts from 'typescript';

export interface FlowCodeNodeModelOptions extends BasePositionModelOptions {
	name?: string;
	color?: string;
	nodeHandlers?: string[];
	panel?: boolean;
	operation?: boolean;
	addInPort?: boolean;
	nodeType?: string;
}

export interface FlowCodeNodeModelGenerics extends NodeModelGenerics {
	OPTIONS: FlowCodeNodeModelOptions;
}
export interface FlowCodeSourceOptions { file: string, type: string }
export const BuiltIn = '$BuiltIn$';
export class FlowCodeNodeModel extends NodeModel<FlowCodeNodeModelGenerics> {
	protected portsIn: FlowCodePortModel[];
	protected portsOut: FlowCodePortModel[];
	protected sourceOptions?: FlowCodeSourceOptions;
	constructor(name: string, color: string);
	constructor(options?: FlowCodeNodeModelOptions);
	constructor(options: any = {}, color?: string) {
		if (typeof options === 'string') {
			options = {
				name: options,
				nodeType: color,
				operation: false,
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
	getNodeType(): string | undefined {
		return this.options.nodeType;
	}
	isOperation(bool?: boolean) {
		if (bool !== undefined)
			this.options.operation = bool
		return this.options.operation;
	}
	setSourceOptions(sourceOptions: any) {
		this.sourceOptions = sourceOptions;
	}
	getSourceOptions(): FlowCodeSourceOptions | undefined {
		return this.sourceOptions;
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

	removePortLinks(port: FlowCodePortModel): void {
		const links = port.getLinks();
		for (const link in links) {
			let targetPort = links[link].getTargetPort();
			let sourcePort = links[link].getSourcePort();
			links[link].remove();
			this.fireEvent({ firing: true, targetPort, sourcePort }, 'removing');
		}
		// this.removePort(port);
	}
	enableInPortAdd() {
		this.options.addInPort = true;
		this.options.panel = true;
	}

	addFlowIn(): FlowCodePortModel {
		const p = new FlowCodePortModel({
			in: true,
			name: 'In',
			isStatic: true,
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
			isStatic: true,
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
	setNodeHandler(ports: string[]) {
		this.options.nodeHandlers = ports;
	}
	getNodeHandlers() {
		return this.options.nodeHandlers || [];
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
		this.options.nodeType = event.data.nodeType;
		this.options.operation = event.data.operation;
		this.options.nodeHandlers = event.data.nodeHandlers;
		this.sourceOptions = event.data.sourceOptions;
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
			sourceOptions: this.sourceOptions,
			operation: this.options.operation,
			nodeHandlers: this.options.nodeHandlers,
			nodeType: this.options.nodeType,
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
