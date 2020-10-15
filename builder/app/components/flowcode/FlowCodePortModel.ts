import {
	LinkModel,
	PortModel,
	PortModelAlignment,
	PortModelGenerics,
	PortModelOptions
} from '@projectstorm/react-diagrams-core';
import { DefaultLinkModel } from '@projectstorm/react-diagrams';
import { AbstractModelFactory, DeserializeEvent } from '@projectstorm/react-canvas-core';
import ts from 'typescript';
import { PortHandler } from './PortHandler';
import { FlowCodeNodeModel } from './FlowCodeNodeModel';

export interface FlowCodePortModelOptions extends PortModelOptions {
	label?: string;
	in?: boolean;
	isFlow?: boolean;
	portName?: string;
	kind?: ts.SyntaxKind
	isStatic?: boolean;
	prompt?: boolean;
	selectFunc?: any;
	value?: any;
	valueTitle?: string;
}

export interface FlowCodePortModelGenerics extends PortModelGenerics {
	OPTIONS: FlowCodePortModelOptions;
}

export interface FlowCodeLinkHandlers {
	nodeId: string,
	type: string
}

export class FlowCodePortModel extends PortModel<FlowCodePortModelGenerics> {
	onconnect: Function | undefined;
	portType?: string;
	protected linkHandlers: FlowCodeLinkHandlers[];
	member?: ts.Node;
	constructor(isIn: boolean, name?: string, label?: string);
	constructor(options: FlowCodePortModelOptions);
	constructor(options: FlowCodePortModelOptions | boolean, name?: string, label?: string) {
		if (!!name) {
			options = {
				in: !!options,
				name: name,
				label: label
			};
		}
		options = options as FlowCodePortModelOptions;
		super({
			label: options.label || options.name,
			alignment: options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
			type: 'default',
			...options
		});
		this.linkHandlers = [];
	}
	prompt() {
		this.options.prompt = true;
	}
	setPortName(name: string) {
		this.options.portName = name;
	}
	setName(name: string) {
		this.options.valueTitle = name;
	}
	getLinkHandlers(): FlowCodeLinkHandlers[] {
		return this.linkHandlers;
	}
	isStatic() {
		return this.options.isStatic;
	}
	setStatic() {
		this.options.isStatic = true;
	}
	// onConnected(onconnect: Function): void {
	// 	this.onconnect = onconnect;
	// }
	select(func: any) {
		this.options.selectFunc = func;
	}
	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.in = event.data.in;
		this.options.label = event.data.label;
		this.options.isStatic = event.data.isStatic;
		this.options.name = event.data.name;
		this.options.valueTitle = event.data.valueTitle;
		this.options.kind = event.data.kind;
		this.options.portName = event.data.portName;
	}

	serialize() {
		return {
			...super.serialize(),
			in: this.options.in,
			portName: this.options.portName,
			isStatic: this.options.isStatic,
			valueTitle: this.options.valueTitle,
			kind: this.options.kind,
			label: this.options.label,
			name: this.options.name
		};
	}

	link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
		let link = this.createLinkModel(factory);
		link.setSourcePort(this);
		link.setTargetPort(port);
		// if (this.onconnect) {
		// 	this.onconnect(link);
		// }
		let node = this.getNode() as FlowCodeNodeModel;
		this.linkHandlers.forEach((handler: FlowCodeLinkHandlers) => {
			PortHandler.Handle({ type: handler.type, link, targetPort: port as FlowCodePortModel, sourcePort: this, node });
		})
		return link as T;
	}

	addLinkHandler(type: string, nodeId: string) {
		this.linkHandlers.push({ type, nodeId })
	}

	canLinkToPort(port: PortModel): boolean {
		if (port instanceof FlowCodePortModel) {
			return this.options.in !== port.getOptions().in;
		}
		return true;
	}

	createLinkModel(factory?: AbstractModelFactory<LinkModel>): LinkModel {
		let link = super.createLinkModel();
		if (!link && factory) {
			return factory.generateModel({});
		}
		return link || new DefaultLinkModel();
	}
}
