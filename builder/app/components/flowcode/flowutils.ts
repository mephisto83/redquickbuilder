import ts from 'typescript';
import { FlowCodeStatements } from '../../constants/flowcode_ast';
import { FlowCodeNodeModel } from './FlowCodeNodeModel';
import { FlowCodePortModel } from './FlowCodePortModel';
import fs from 'fs';
import path from 'path';
import { PortHandler } from './PortHandler';
import { fs_existsSync } from '../../generators/modelgenerators';

export const PortStructures = {
    Generic: {
        Type: 'type',
        Expression: 'expression',
        Variable: 'variable'
    },
    Constructor: {
        Type: 'type',
        OutputPort: 'outputPort'
    },
    CallableExpression: {
        Method: 'method'
    },
    AnonymousFunctions: {
        Function: 'function'
    }
}

export const FlowCodeCommand = {
    AddInputParameter: (): FlowCodeNodeCommands => {
        return {
            clsName: 'fa fa-flash',
            id: FlowCodeNodeCommandKey.AddInputParameter,
            title: 'Add Input Parameter'
        }
    },
    SetOuputType: (): FlowCodeNodeCommands => {
        return {
            clsName: 'fa fa-sign-out',
            id: FlowCodeNodeCommandKey.SetOutputPort,
            title: 'Set Output Port'
        }
    }
}

export enum FlowCodeNodeCommandKey {
    AddInputParameter = 'AddInputParameter',
    SetOutputPort = 'SetOutPort'
}
export interface FlowCodeNodeCommands {
    clsName: string;
    title: string;
    id: FlowCodeNodeCommandKey;
}
export const Operations = {
    ADD_PARAMETER: '#843B62',
    GET_PROPERTY: '#F7B267',
    SET_PROPERTY: '#F4845F',
    CALL_METHOD: '#F27059',
    START_FUNCTION: '#FFB997',
    ADD_TYPE: '#74546A',
    ADD_CONSTRUCTOR: '#FFD046',
    ADD_ENUMERATION: '#7C7F65',
    ADD_SEQUENCE: '#59CD90',
    ANONYMOUS_FUNCTION: '#218380',
    FOREACH_CALLBACK: '#E39774',
    MAP_CALLBACK: '#E39773',
    VARIABLE_GET: '#F34213',
    ADD_CONSTANT: '#D05353',
    ADD_IF: '#1B9AAA'
};

export enum PortType {
    MethodParameters = 'method-parameters',
    MethodOutput = 'method-output',
    MethodParameterOutputs = 'method-parameter-outputs',
    MethodSequence = 'method-sequence',
    OutputType = 'ouput-type',
    EnumerationValue = 'enumeration-value'
}
export function GetPortASTTypeName(port: FlowCodePortModel) {
    return GetNodeASTPortTypeName(port, port.getNode() as FlowCodeNodeModel);
}

function getNextNode(key: string, target: 'target' | 'source', node: FlowCodeNodeModel): FlowCodePortModel | null {
    let port = GetNodePortByName(node, key);
    if (port) {
        let linkLib = port.getLinks();
        let links = Object.entries(linkLib);
        if (links && links.length) {
            let [, linkModel] = links[0]
            if (linkModel) {
                switch (target) {
                    case 'target':
                        return linkModel.getTargetPort() as FlowCodePortModel;
                    case 'source':
                        return linkModel.getSourcePort() as FlowCodePortModel;

                }

            }
        }
    }
    return null;
}

export function GetASTType(type: ts.ClassDeclaration | ts.TypeReferenceNode | ts.InterfaceDeclaration): ts.ClassDeclaration | ts.InterfaceDeclaration {
    switch (type.kind) {
        case ts.SyntaxKind.TypeReference:
            let res = GetReferenceType(type as ts.TypeReferenceNode);
            if (res) {
                return res as ts.ClassDeclaration | ts.InterfaceDeclaration;
            }
            break;
    }
    return type as ts.ClassDeclaration | ts.InterfaceDeclaration;
}

function GetMethodPortType(node: FlowCodeNodeModel): ts.Node | null {
    let astType: ts.Node | null = GetPortASTType(node, PortStructures.CallableExpression.Method);
    if (astType && node) {
        let methodPort = GetNodePortByName(node, PortStructures.CallableExpression.Method);
        if (methodPort) {
            let method = getSelectedMethod(methodPort, astType as ts.ClassDeclaration);
            if (method && method.type) {
                let methodTypeDec = method.type as ts.TypeReferenceNode;
                return methodTypeDec;
            }
            if (method && method.type) {
                return FindTypeByName(method.type.getText());
            }
            else {
                return null;
            }
        }
    }
    return null;
}

export function GetReferenceType(methodTypeDec: ts.TypeReferenceNode): ts.Node | null {
    let methodTypeName = methodTypeDec.typeName.getText();
    let fileName = methodTypeDec.getSourceFile().fileName;
    fileName = fileName.split('/').join(path.sep).split('\\').join(path.sep);
    if (fileName) {
        let source = PortHandler.getSource({
            file: fileName,
            type: ''
        });
        if (source) {
            for (let s in source) {
                if (source[s].ast) {
                    let { ast, imports } = source[s];
                    if (imports) {
                        let res = null;
                        imports.find((_import: ts.Node) => {
                            let importDeclation = _import as ts.ImportDeclaration;
                            let importClause = importDeclation.importClause;
                            let importSpec: ts.ImportSpecifier | null | undefined = null;
                            if (importClause) {
                                let { namedBindings, name } = importClause;
                                if (namedBindings) {
                                    let namedImports = namedBindings as ts.NamedImports;
                                    if (namedImports && namedImports.elements) {
                                        importSpec = namedImports.elements.find((importSpecifier: ts.ImportSpecifier) => {
                                            if (methodTypeName) {
                                                return importSpecifier.name.getText() === methodTypeName
                                            }
                                            return false;
                                        });
                                    }
                                }
                                if (name) {

                                }
                            }
                            if (importSpec) {
                                let relativeDir = importDeclation.moduleSpecifier.getText().split(`'`).join('').split('"').join('').split('`').join('');
                                let filePath = path.join(path.dirname(fileName), relativeDir);
                                //check if there is a d.ts
                                if (fs_existsSync(filePath + '.d.ts')) {
                                    let source = PortHandler.getSource({
                                        file: filePath + '.d.ts',
                                        type: ''
                                    });
                                    if (source) {
                                        if (methodTypeName) {
                                            if (source[methodTypeName]) {
                                                res = source[methodTypeName].ast;
                                                return true;
                                            }
                                        }
                                    }
                                }
                                else if (fs_existsSync(path.join(filePath, `index.d.ts`))) {

                                }
                            }
                        })
                        if (res) {
                            return res;
                        }
                    }
                }
            }
        }
    }
    return null;
}

function FindTypeByName(name: string): ts.Node | null {
    let result = null;

    let files = PortHandler.getSourceFiles()
    files.find((file: string) => {
        let source = PortHandler.getSource({
            file: file,
            type: ''
        });
        if (source) {
            for (let s in source) {
                if (source[s].ast) {
                    let ast = source[s].ast;

                }
            }
        }
    })
    return result;
}
function GetNodeASTPortTypeName(currentPort: FlowCodePortModel, node: FlowCodeNodeModel): ts.Node | null {
    let nodeType = node.getNodeType();
    let isOperation = node.isOperation();
    let nextPort: FlowCodePortModel | null = null;
    if (isOperation) {
        switch (nodeType) {
            case FlowCodeStatements.Assignment.color:
                nextPort = getNextNode(PortStructures.Generic.Expression, 'source', node);
                if (nextPort) {
                    return GetNodeASTPortTypeName(nextPort, nextPort.getNode() as FlowCodeNodeModel);
                }
                break;
            case Operations.ANONYMOUS_FUNCTION:
                nextPort = getNextNode(PortStructures.AnonymousFunctions.Function, 'target', node);
                if (nextPort) {
                    return GetNodeASTPortTypeName(nextPort, nextPort.getNode() as FlowCodeNodeModel);
                }
                break;
            case Operations.CALL_METHOD:
                let portType = currentPort.getPortType();
                if (portType === PortType.MethodOutput) {
                    return GetMethodPortType(node);
                }
                nextPort = getNextNode(PortStructures.Constructor.Type, 'source', node);
                if (nextPort) {
                    return GetNodeASTPortTypeName(nextPort, nextPort.getNode() as FlowCodeNodeModel);
                }
                break;
            case Operations.ADD_CONSTRUCTOR:
                nextPort = getNextNode(PortStructures.Constructor.Type, 'source', node);
                if (nextPort) {
                    return GetNodeASTPortTypeName(nextPort, nextPort.getNode() as FlowCodeNodeModel);
                }
                break;
        }
    }
    else {

        let sourceNode: FlowCodeNodeModel = node;
        let flowCodeConfig = PortHandler.getFlowConfig(sourceNode);
        if (flowCodeConfig && flowCodeConfig.ast) {
            switch (flowCodeConfig.ast.kind) {
                case ts.SyntaxKind.TypeReference:
                    debugger;
                    break;
                case ts.SyntaxKind.ClassDeclaration:
                case ts.SyntaxKind.InterfaceDeclaration:
                    return flowCodeConfig.ast;
            }
        }
    }
    return null;
}
export function GetNodePortByName(node: FlowCodeNodeModel, name: string): FlowCodePortModel | undefined {
    let ports = node.getPorts();
    let variablePortName = Object.keys(ports).find((v: any) => {
        let temp = v as string;
        let options = (ports[temp] as FlowCodePortModel).getOptions();
        if (options && options.portName === name) {
            return true;
        }
    });
    if (variablePortName && ports.hasOwnProperty(variablePortName || '')) {
        return (ports as any)[variablePortName] as FlowCodePortModel;
    }

    return undefined;
}

export function GetNodePortsByType(node: FlowCodeNodeModel, portType: PortType): FlowCodePortModel[] {
    let ports = node.getPorts();
    let variablePortNames = Object.keys(ports).filter((v: any) => {
        let temp = v as string;
        let options = (ports[temp] as FlowCodePortModel).getOptions();
        if (options && options.portType === portType) {
            return true;
        }
    });
    return variablePortNames.map((variablePortName: string) => {
        return (ports as any)[variablePortName] as FlowCodePortModel;
    });
}

export function getSelectedMethod(methodPort: FlowCodePortModel, astType: ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeReferenceNode): ts.MethodDeclaration | null {
    if (methodPort) {
        astType = GetASTType(astType as ts.ClassDeclaration | ts.TypeReferenceNode | ts.InterfaceDeclaration);
        let classDec = astType as ts.ClassDeclaration;
        if (classDec && classDec.members) {
            let selectedMethod = classDec.members.find((member: ts.ClassElement | ts.TypeElement) => {
                return member.kind === ts.SyntaxKind.MethodDeclaration && methodPort && member.getText().trim() === methodPort.getValueTitle();
            });
            return selectedMethod as ts.MethodDeclaration || null;
        }
    }
    return null;
}


export function GetPortASTType(node: FlowCodeNodeModel, portName: string): ts.Node | null {
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