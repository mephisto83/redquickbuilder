import ts from "typescript";
import { FlowCodeStatements } from "../../constants/flowcode_ast";
import { FlowCodeNodeModel } from "./FlowCodeNodeModel";
import { FlowCodePortModel } from "./FlowCodePortModel";
import { PortHandler } from "./PortHandler";

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
    AddInputParameter = "AddInputParameter",
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
    MethodParameters = "method-parameters",
    MethodParameterOutputs = 'method-parameter-outputs',
    MethodSequence = 'method-sequence',
    OutputType = 'ouput-type'
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


function GetNodeASTPortTypeName(not_useed_port: FlowCodePortModel, node: FlowCodeNodeModel): ts.Node | null {
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
            case Operations.ADD_CONSTRUCTOR:
                nextPort = getNextNode(PortStructures.Constructor.Type, 'source', node);
                if (nextPort) {
                    return GetNodeASTPortTypeName(nextPort, nextPort.getNode() as FlowCodeNodeModel);
                }
        }
    }
    else {

        let sourceNode: FlowCodeNodeModel = node;
        let flowCodeConfig = PortHandler.getFlowConfig(sourceNode);
        if (flowCodeConfig && flowCodeConfig.ast) {
            switch (flowCodeConfig.ast.kind) {
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