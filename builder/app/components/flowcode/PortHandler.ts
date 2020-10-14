import fs from 'fs';
import { LinkModel, LinkModelGenerics, NodeModel, NodeModelGenerics } from "@projectstorm/react-diagrams";
import ts from "typescript";
import { buildFunctionsFromString, IFlowCodeConfig, IFlowCodeFile, IFlowCodeStatements } from "../../constants/flowcode_ast";
import { FlowCodeNodeModel, FlowCodeSourceOptions } from "./FlowCodeNodeModel";
import { FlowCodePortModel } from './FlowCodePortModel';

export interface PortHandlerArg {
    type: string;
    link: LinkModel<LinkModelGenerics>
    port: FlowCodePortModel,
    node: FlowCodeNodeModel
}

export enum PortHandlerType {
    Constructor = "Constructor",
    FunctionParameterType = "FunctionParameterType"
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
            }
        }
    }

    static GetParams(arg: PortHandlerArg): HandlerParams | null {
        let { link, node } = arg;
        let sourcePort: FlowCodePortModel = link.getSourcePort() as FlowCodePortModel;
        let sourceNode: FlowCodeNodeModel = sourcePort.getNode() as FlowCodeNodeModel;
        let sourceOptions = sourceNode.getSourceOptions();
        if (sourceOptions) {
            let source = this.getSource(sourceOptions);
            if (source) {
                let flowCodeConfig = source[sourceOptions.type];
                const newLocal = { flowCodeConfig, sourceOptions, node };
                return (newLocal);
            }
            else {
                console.log('no source file found ')
            }
        }
        else {
            console.log('no source options for the node');
        }
        return null;
    }
}
export interface HandlerParams {
    flowCodeConfig: IFlowCodeConfig;
    sourceOptions: FlowCodeSourceOptions;
    node: FlowCodeNodeModel;
}
function HandleFunctionParameterType(arg: HandlerParams) {
    let { flowCodeConfig, sourceOptions, node } = arg;

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
function HandleConstructor(temp: {
    flowCodeConfig: IFlowCodeConfig;
    sourceOptions: FlowCodeSourceOptions;
    node: FlowCodeNodeModel;
}) {

    let { flowCodeConfig, sourceOptions, node } = temp;

    if (flowCodeConfig && flowCodeConfig.ast) {
        switch (flowCodeConfig.ast.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                let inportsToExists: { kind?: ts.SyntaxKind; name: string; index: number; required: boolean; }[] = [];
                let outportsToExist: { kind?: ts.SyntaxKind; name: string; index: number; required: boolean; }[] = [{
                    name: sourceOptions.type,
                    required: false,
                    index: 0
                }];
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

                let ports = node.getPorts();
                inportsToExists.forEach((item) => {
                    if (!ports[item.name]) {
                        node.addInPort(item.name, item.kind);
                    }
                });
                outportsToExist.forEach((item) => {
                    if (!ports[item.name]) {
                        node.addOutPort(item.name, item.kind);
                    }
                });
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
