import fs from 'fs';
import { LinkModel, LinkModelGenerics, NodeModel, NodeModelGenerics } from "@projectstorm/react-diagrams";
import ts from "typescript";
import { buildFunctionsFromString, IFlowCodeConfig, IFlowCodeFile, IFlowCodeStatements } from "../../constants/flowcode_ast";
import { FlowCodeNodeModel, FlowCodeSourceOptions } from "./FlowCodeNodeModel";
import { FlowCodePortModel } from './FlowCodePortModel';
import { GetNodePortByName, GetPortASTTypeName, Operations, PortStructures, PortType } from './flowutils';

export interface PortHandlerArg {
    type: string;
    link: LinkModel<LinkModelGenerics> | null,
    sourcePort: FlowCodePortModel | null,
    targetPort: FlowCodePortModel | null,
    interestPort: 'target' | 'source',
    node: FlowCodeNodeModel,
    eventType: FlowNodeEventType
}
export enum FlowNodeEventType {
    Removing = "removing",
    PortChanged = "portChanged",
    PortValueUpdated = "portValueUpdated",
    NodeRemoving = "nodeRemoving", // A node is being removed.
    Check = "check" // Fire check to be sure that the graph is ok.
}
export enum PortHandlerType {
    Constructor = "Constructor",
    FunctionParameterType = "FunctionParameterType",
    FromCallableReference = "FromCallableReference",
    FunctionParameterExpressionType = "FunctionParameterExpressionType",
    SetupMethodParameters = "SetupMethodParameters"
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
                case PortHandlerType.FromCallableReference:
                    HandleFromCallableReference(params);
                    break;
                case PortHandlerType.SetupMethodParameters:
                    HandleSetupMethodParameters(params);
                    break;
            }
        }
    }

    static GetParams(arg: PortHandlerArg): HandlerParams | null {
        let { interestPort, link, node, sourcePort, targetPort, eventType } = arg;
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
            let sourceNode: FlowCodeNodeModel | undefined = port ? port.getNode() as FlowCodeNodeModel : undefined;
            let targetNode: FlowCodeNodeModel | undefined = otherport ? otherport.getNode() as FlowCodeNodeModel : undefined;
            let sourceOptions = sourceNode ? sourceNode.getSourceOptions() : undefined;
            let targetOptions = targetNode ? targetNode.getSourceOptions() : undefined;
            if (sourceOptions || targetOptions) {
                let source = sourceOptions ? this.getSource(sourceOptions) : undefined;
                let target = targetOptions ? this.getSource(targetOptions) : undefined;
                if (source || target) {
                    let sourceFlowCodeConfig = source && sourceOptions ? source[sourceOptions.type] : undefined;
                    let targetFlowCodeConfig = target && targetOptions ? target[targetOptions.type] : undefined;
                    const newLocal = { sourceFlowCodeConfig, targetFlowCodeConfig, sourceOptions, targetOptions, node, link, port, otherport, eventType };
                    return (newLocal);
                }
                else {
                    console.log('no source file found ');
                    return { node, link, port, otherport, eventType };
                }
            }
            else {
                console.log('no source options for the node');
                return { node, link, port, otherport, eventType };
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
    node: FlowCodeNodeModel | null;
    eventType: FlowNodeEventType;
    link: LinkModel<LinkModelGenerics> | null
    port: FlowCodePortModel;
    otherport: FlowCodePortModel | null;
}
function HandleSetupMethodParameters(arg: HandlerParams) {
    let { node } = arg;
    if (node) {
        let astType: ts.Node | null = GetPortASTType(node, PortStructures.CallableExpression.Method);
        if (astType && node) {
            switch (astType.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    let inportsToExists: { name: string; kind: ts.SyntaxKind }[] = [];
                    let outportsToExist: { name: string; kind: ts.SyntaxKind }[] = [];
                    let ports = node.getPorts();
                    let methodPort = GetNodePortByName(node, PortStructures.CallableExpression.Method)
                    if (methodPort) {
                        let classDec = astType as ts.ClassDeclaration;
                        if (classDec) {
                            let selectedMethod = classDec.members.find((member: ts.ClassElement) => {
                                return member.kind === ts.SyntaxKind.MethodDeclaration && methodPort && member.getText().trim() === methodPort.getValueTitle();
                            });
                            if (selectedMethod) {
                                let methodDec = selectedMethod as ts.MethodDeclaration;
                                if (methodDec && methodDec.parameters) {
                                    methodDec.parameters.forEach((parameter: ts.ParameterDeclaration) => {
                                        inportsToExists.push({
                                            name: parameter.getText(),
                                            kind: parameter.kind
                                        })
                                    })
                                }
                                else if (methodDec) {
                                    if (methodDec.type && methodDec.type.kind !== ts.SyntaxKind.VoidKeyword) {
                                        outportsToExist.push({
                                            name: methodDec.type.getText(),
                                            kind: methodDec.type.kind
                                        })
                                    }
                                }
                            }
                        }

                        inportsToExists.forEach((item) => {
                            if (node)
                                if (!ports[item.name]) {
                                    let newPort = node.addInPort(item.name, item.kind) as FlowCodePortModel;
                                    newPort.setPortType(PortType.MethodParameters);
                                    newPort.setPortName(item.name);
                                }
                        });
                        outportsToExist.forEach((item) => {
                            if (node)
                                if (!ports[item.name]) {
                                    let outputPort = node.addOutPort(item.name, item.kind);
                                    outputPort.setPortName(PortStructures.Constructor.OutputPort)
                                }
                        });
                        Object.keys(ports).forEach((name: string) => {
                            if (!inportsToExists.find(v => v.name === name)) {
                                if (!outportsToExist.find(v => v.name === name)) {
                                    let customPort = (ports[name] as FlowCodePortModel);
                                    if (!customPort.isStatic() && customPort.getPortType() === PortType.MethodParameters && node) {
                                        node.removePortLinks(ports[name] as FlowCodePortModel);
                                        node.removePort(ports[name] as FlowCodePortModel);
                                    }
                                }
                            }
                        });
                    }
                    break;
            }
        }
    }
}
function ClearPortsOfType(portType: PortType, node: FlowCodeNodeModel) {
    let ports = node.getPorts();
    for (var port in ports) {
        let flowCodePort = ports[port] as FlowCodePortModel;
        if (flowCodePort.getPortType() === portType) {
            node.removePortLinks(flowCodePort);
            node.removePort(flowCodePort);

        }
    }
}
function HandleFromCallableReference(arg: HandlerParams) {
    let { node } = arg;
    if (node) {
        HandleFunctionParameterExpressionType(arg);
        let astType: ts.Node | null = GetPortASTType(node, PortStructures.Generic.Type);
        if (astType) {
            switch (astType.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    let ports = node.getPorts();
                    if (!ports[PortStructures.CallableExpression.Method]) {
                        let port = node.addInPort(PortStructures.CallableExpression.Method);
                        port.setPortName(PortStructures.CallableExpression.Method);
                        port.addLinkHandler(PortHandlerType.SetupMethodParameters, node.getID())
                        port.select(() => {
                            if (node) {
                                let astType = GetPortASTType(node, PortStructures.Generic.Type);

                                let classDec = astType as ts.ClassDeclaration;
                                if (classDec) {
                                    return classDec.members.filter((member: ts.ClassElement) => {
                                        return member.kind === ts.SyntaxKind.MethodDeclaration;
                                    }).map((member: ts.ClassElement) => {
                                        return { title: member.getText().trim(), value: member.getText().trim() }
                                    }).filter(v => v);
                                }
                            }
                            return [];
                        })
                    }

                    break
                case ts.SyntaxKind.InterfaceDeclaration:
                    break;
            }
        }
    }
}
function GetPortASTType(node: FlowCodeNodeModel, portName: string): ts.Node | null {
    let ports = node.getPorts();
    let variablePortName = Object.keys(ports).find((v: any) => {
        let temp = v as string;
        let options = (ports[temp] as FlowCodePortModel).getOptions();
        if (options && options.portName === portName) {
            return true;
        }
    });

    if (variablePortName) {
        let temp: ts.Node | null = GetPortASTTypeName(ports[variablePortName] as FlowCodePortModel);
        return temp;
    }

    return null;
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
            else {
                let flowPort = (ports[variablePortName] as FlowCodePortModel);
                flowPort.setName(flowPort.getName())
            }
        }
    }
}

function HandleFunctionParameterType(arg: HandlerParams) {
    let { sourceFlowCodeConfig, sourceOptions, targetFlowCodeConfig, node, eventType } = arg;
    let flowCodeConfig = sourceFlowCodeConfig || targetFlowCodeConfig;
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
                    if (temp.name && eventType !== FlowNodeEventType.Removing) {
                        (ports[variablePortName] as FlowCodePortModel).setName(temp.name.getText());
                    }
                    else {
                        (ports[variablePortName] as FlowCodePortModel).setName(ports[variablePortName].getName());
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
                if (node) {
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
                            if (!ports[item.name] && node) {
                                node.addInPort(item.name, item.kind);
                            }
                        });
                        outportsToExist.forEach((item) => {
                            if (!ports[item.name] && node) {
                                let outputPort = node.addOutPort(item.name, item.kind);
                                outputPort.setPortName(PortStructures.Constructor.OutputPort)
                            }
                        });
                    }
                    Object.keys(ports).forEach((name: string) => {
                        if (!inportsToExists.find(v => v.name === name)) {
                            if (!outportsToExist.find(v => v.name === name)) {
                                if (!(ports[name] as FlowCodePortModel).isStatic() && node) {
                                    node.removePortLinks(ports[name] as FlowCodePortModel);
                                    node.removePort(ports[name] as FlowCodePortModel);
                                }
                            }
                        }
                    });
                }
                break;
        }
    }
}
