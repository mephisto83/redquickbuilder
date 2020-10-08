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

export interface FlowCodePortModelOptions extends PortModelOptions {
	label?: string;
	in?: boolean;
	isFlow?: boolean;
	kind?: ts.SyntaxKind
	prompt?: boolean;
	selectFunc?: any;
	value?: any;
	valueTitle?: string;
}

export interface FlowCodePortModelGenerics extends PortModelGenerics {
	OPTIONS: FlowCodePortModelOptions;
}

export class FlowCodePortModel extends PortModel<FlowCodePortModelGenerics> {
	onconnect: Function | undefined;
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
	}
	prompt() {
		this.options.prompt = true;
	}
	onConnected(onconnect: Function): void {
		this.onconnect = onconnect;
	}
	select(func: any) {
		this.options.selectFunc = func;
	}
	deserialize(event: DeserializeEvent<this>) {
		super.deserialize(event);
		this.options.in = event.data.in;
		this.options.label = event.data.label;
	}

	serialize() {
		return {
			...super.serialize(),
			in: this.options.in,
			label: this.options.label
		};
	}

	link<T extends LinkModel>(port: PortModel, factory?: AbstractModelFactory<T>): T {
		let link = this.createLinkModel(factory);
		link.setSourcePort(this);
		link.setTargetPort(port);
		if (this.onconnect) {
			this.onconnect(link);
		}
		return link as T;
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
