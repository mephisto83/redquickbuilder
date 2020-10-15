import fs from 'fs';
import { LinkModel, LinkModelGenerics, NodeModel, NodeModelGenerics } from "@projectstorm/react-diagrams";
import ts from "typescript";
import { buildFunctionsFromString, IFlowCodeConfig, IFlowCodeFile, IFlowCodeStatements } from "../../constants/flowcode_ast";
import { FlowCodeNodeModel, FlowCodeSourceOptions } from "./FlowCodeNodeModel";
import { FlowCodePortModel } from './FlowCodePortModel';
import { GetPortASTTypeName, Operations, PortStructures } from './flowutils';

export interface PortHandlerArg {
    type: string;
    link: LinkModel<LinkModelGenerics> | null,
    sourcePort: FlowCodePortModel,
    targetPort: FlowCodePortModel,
    interestPort: 'target' | 'source',
    node: FlowCodeNodeModel
}

export enum PortHandlerType {
    Constructor = "Constructor",
    FunctionParameterType = "FunctionParameterType",
    FunctionParameterExpressionType = "FunctionParameterExpressionType"
}

export class PortHandler {
    static flowLibrary: {
        [fileName: string]: {
            fileName: string,
            flowCodeStatements?: IFlowCodeStatements
        }
    };
    static storeFlowLibrary(fileName: string, filePath: string) {
        this.flowLibrary = this.flowLibrary || {};
        this.flowLibrary[filePath] = this.flowLibrary[filePath] || { fileName: '' };
        this.flowLibrary[filePath].fileName = fileName;

    }
    static getFlowConfig(sourceNode: FlowCodeNodeModel): IFlowCodeConfig | null {

        let sourceOptions = sourceNode.getSourceOptions();
        if (sourceOptions) {
            let source = this.getSource(sourceOptions);
            if (source) {
                let flowCodeConfig = source[sourceOptions.type];
                return flowCodeConfig;
            }
        }
        return null;
    }
    static getSource(options: FlowCodeSourceOptions): IFlowCodeStatements | undefined {
        if (this.flowLibrary && this.flowLibrary[options.file]) {
            let result = this.flowLibrary[options.file];
            if (result) {
                if (this.flowLibrary[options.file].flowCodeStatements) {
                    return this.flowLibrary[options.file].flowCodeStatements;
                }
                try {
                    let contents = fs.readFileSync(options.file, 'utf-8');
                    let statements = buildFunctionsFromString(contents, options.file, true);
                    this.flowLibrary[options.file].flowCodeStatements = statements;
                    return this.flowLibrary[options.file].flowCodeStatements;
                } catch (e) {
                    console.error(e);
                }
            }
        }
        return undefined;
    }
    static Handle(arg: PortHandlerArg) {
        let params = this.GetParams(arg);
        if (params) {
            switch (arg.type) {
                case PortHandlerType.Constructor:
                    HandleConstructor(params);
                    break;
                case PortHandlerType.FunctionParameterType:
                    HandleFunctionParameterType(params);
                    break;
                case PortHandlerType.FunctionParameterExpressionType:
                    HandleFunctionParameterExpressionType(params);
                    break;
            }
        }
    }

    static GetParams(arg: PortHandlerArg): HandlerParams | null {
        let { interestPort, link, node, sourcePort, targetPort } = arg;
        let port: FlowCodePortModel | null = null;
        let otherport: FlowCodePortModel | null = null;
        if (interestPort === 'source') {
            port = sourcePort;
            otherport = targetPort;
        }
        else {
            port = targetPort;
            otherport = sourcePort;
        }

        if (port) {
            node = port.getNode() as FlowCodeNodeModel;
            let sourceNode: FlowCodeNodeModel = port.getNode() as FlowCodeNodeModel;
            let targetNode: FlowCodeNodeModel = otherport.getNode() as FlowCodeNodeModel;
            let sourceOptions = sourceNode.getSourceOptions();
            let targetOptions = targetNode.getSourceOptions();
            if (sourceOptions || targetOptions) {
                let source = sourceOptions ? this.getSource(sourceOptions) : undefined;
                let target = targetOptions ? this.getSource(targetOptions) : undefined;
                if (source || target) {
                    let sourceFlowCodeConfig = source && sourceOptions ? source[sourceOptions.type] : undefined;
                    let targetFlowCodeConfig = target && targetOptions ? target[targetOptions.type] : undefined;
                    const newLocal = { sourceFlowCodeConfig, targetFlowCodeConfig, sourceOptions, targetOptions, node, link, port, otherport };
                    return (newLocal);
                }
                else {
                    console.log('no source file found ');
                    return { node, link, port, otherport };
                }
            }
            else {
                console.log('no source options for the node');
                return { node, link, port, otherport };
            }
        }
        return null;
    }
}
export interface HandlerParams {
    sourceFlowCodeConfig?: IFlowCodeConfig;
    targetFlowCodeConfig?: IFlowCodeConfig;
    sourceOptions?: FlowCodeSourceOptions;
    targetOptions?: FlowCodeSourceOptions;
    node: FlowCodeNodeModel;
    link: LinkModel<LinkModelGenerics> | null
    port: FlowCodePortModel;
    otherport: FlowCodePortModel;
}
function HandleFunctionParameterExpressionType(arg: HandlerParams) {
    let { sourceFlowCodeConfig: flowCodeConfig, targetFlowCodeConfig, sourceOptions, link, node, port, otherport } = arg;

    let sourcePort: FlowCodePortModel = port as FlowCodePortModel;

    if (sourcePort) {

        let ports = node.getPorts();
        let variablePortName = Object.keys(ports).find((v: any) => {
            let temp = v as string;
            let options = (ports[temp] as FlowCodePortModel).getOptions();
            if (options && options.portName === 'type') {
                return true;
            }
        });
        if (variablePortName) {
            let temp: any = GetPortASTTypeName(sourcePort);
            if (temp && temp.name) {
                (ports[variablePortName] as FlowCodePortModel).setName(temp.name.getText())
            }
        }
    }
}

function HandleFunctionParameterType(arg: HandlerParams) {
    let { sourceFlowCodeConfig: flowCodeConfig, sourceOptions, node } = arg;

    if (flowCodeConfig && flowCodeConfig.ast) {
        switch (flowCodeConfig.ast.kind) {
            case ts.SyntaxKind.ClassDeclaration:
            case ts.SyntaxKind.InterfaceDeclaration:
                let ports = node.getPorts();
                let variablePortName = Object.keys(ports).find((v: any) => {
                    let temp = v as string;
                    let options = (ports[temp] as FlowCodePortModel).getOptions();
                    if (options && options.portName === 'variable') {
                        return true;
                    }
                });
                if (variablePortName) {
                    let temp: any = flowCodeConfig.ast;
                    if (temp.name) {
                        (ports[variablePortName] as FlowCodePortModel).setName(temp.name.getText())
                    }
                }
                break;
        }
    }
}
function HandleConstructor(temp: HandlerParams) {

    let { sourceFlowCodeConfig, targetFlowCodeConfig, sourceOptions, targetOptions, node, link } = temp;
    let options = sourceOptions || targetOptions;
    let flowCodeConfig = targetFlowCodeConfig || sourceFlowCodeConfig;
    if (flowCodeConfig && flowCodeConfig.ast && options) {
        switch (flowCodeConfig.ast.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                let inportsToExists: { kind?: ts.SyntaxKind; name: string; index: number; required: boolean; }[] = [];
                let outportsToExist: { kind?: ts.SyntaxKind; name: string; index: number; required: boolean; }[] = [];
                let ports = node.getPorts();

                if (link) {
                    outportsToExist.push({
                        name: options.type,
                        required: false,
                        index: 0
                    })
                    let classDeclaration = flowCodeConfig.ast as ts.ClassDeclaration;
                    let classConstructors = classDeclaration.members.filter((member: ts.ClassElement) => member.kind === ts.SyntaxKind.Constructor) as ts.ConstructorDeclaration[];

                    if (classConstructors && classConstructors.length) {
                        let classConstructor = classConstructors[0];
                        let parameters = classConstructor.parameters;
                        if (parameters) {
                            parameters.forEach((parameter: ts.ParameterDeclaration, index: number) => {
                                inportsToExists.push({
                                    name: parameter.getText(),
                                    index,
                                    kind: parameter.kind,
                                    required: !parameter.questionToken
                                });
                            });
                        }
                    }

                    inportsToExists.forEach((item) => {
                        if (!ports[item.name]) {
                            node.addInPort(item.name, item.kind);
                        }
                    });
                    outportsToExist.forEach((item) => {
                        if (!ports[item.name]) {
                            let outputPort = node.addOutPort(item.name, item.kind);
                            outputPort.setPortName(PortStructures.Constructor.OutputPort)
                        }
                    });
                }
                Object.keys(ports).forEach((name: string) => {
                    if (!inportsToExists.find(v => v.name === name)) {
                        if (!outportsToExist.find(v => v.name === name)) {
                            if (!(ports[name] as FlowCodePortModel).isStatic()) {
                                node.removePortLinks(ports[name] as FlowCodePortModel);
                                node.removePort(ports[name] as FlowCodePortModel);
                            }
                        }
                    }
                });

                break;
        }
    }
}
