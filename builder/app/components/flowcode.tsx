// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel, DefaultDiagramState, LinkModel } from '@projectstorm/react-diagrams';
import { BaseEvent, CanvasWidget } from '@projectstorm/react-canvas-core';
import DemoCanvasWidget from './canvaswidget';
import * as SRD from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { buildAst, buildFunctions, FlowCodeStatements, IFlowCodeConfig, LoadFileSource } from '../constants/flowcode_ast';
import ts from 'typescript';
import { FlowCodePortFactory } from './flowcode/FlowCodePortFactory';
import { FlowCodeNodeFactory } from './flowcode/FlowCodeNodeFactory';
import { FlowCodeNodeModel } from './flowcode/FlowCodeNodeModel';
import TextInput from './textinput';
import { FlowCodeLinkHandlers, FlowCodePortModel } from './flowcode/FlowCodePortModel';
import { Node } from '../methods/graph_types';
import { refreshFlowModel, saveFlowModel } from '../actions/remoteActions';
import { PortHandler, PortHandlerType } from './flowcode/PortHandler';
import { Operations, PortStructures } from './flowcode/flowutils';

export const SBody = styled.div`
flex-grow: 1;
display: flex;
flex-direction: column;
min-height: 100%;
`;

export const SHeader = styled.div`
display: flex;
background: rgb(30, 30, 30);
flex-grow: 0;
flex-shrink: 0;
color: white;
font-family: Helvetica, Arial, sans-serif;
padding: 10px;
align-items: center;
`;

export const SContent = styled.div`
display: flex;
flex-grow: 1;
`;

export const SLayer = styled.div`
position: relative;
flex-grow: 1;
`;


export default class FlowCode extends Component<any, any> {
    constructor(props: any) {
        super(props);
        let id = UIA.GUID();
        let setup = this.newModel(id);
        this.state = { ...setup, id };
    }


    public newModel(id: string): {
        activeModel: SRD.DiagramModel,
        diagramEngine: SRD.DiagramEngine
    } {
        let activeModel = new SRD.DiagramModel();
        var engine = createEngine();
        // register some other factories as well
        engine
            .getPortFactories()
            .registerFactory(new FlowCodePortFactory());
        engine.getNodeFactories().registerFactory(new FlowCodeNodeFactory());

        let diagramEngine = engine;
        diagramEngine.setModel(activeModel);


        activeModel.registerListener({
            eventDidFire: (event: BaseEvent) => {
                console.log(event);
                let temp: any = event;

                if (event && event.firing && temp.isCreated) {
                    let defaultLinkModel: DefaultLinkModel = temp.link;
                    registerLinkListeners(defaultLinkModel);
                    registerNodeListeners(temp.node);
                    this.forceUpdate();
                }
                return true;
            },
            eventWillFire: (event: BaseEvent) => {

            }
        });


        return {
            activeModel,
            diagramEngine
        }
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (prevProps && prevProps.code !== this.props.code) {
            this.state.activeModel.deserializeModel(JSON.parse(this.props.code), this.state.diagramEngine);
            this.setState({ functionName: this.props.functionName })
        }
    }


    minified() {
        const { state } = this.props;
        return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
    }
    componentDidMount() {
        buildFunctions()
    }
    getItemWidgets() {
        return Object.entries(FlowCodeStatements).map((temp: [string, IFlowCodeConfig]): TrayItemWidget | null => {
            let [key, description] = temp;
            if (!this.state.filterValue || (this.state.filterValue && key && key.toLowerCase().indexOf(this.state.filterValue.toLowerCase()) !== -1)) {
                let tem22p: any = (<TrayItemWidget model={{ type: key }} name={key} color={description.color} />)
                return tem22p;
            }
            return null;
        }).filter((v: TrayItemWidget | null) => v);
    }
    render() {

        const { state } = this.props;
        let { diagramEngine, activeModel } = this.state;
        if (!diagramEngine) {
            return <div></div>
        }
        return (
            <SBody onClick={() => {
                // commonContext.active = this.state.id;
            }}>
                <SHeader>
                    <div className="title">Storm React Diagrams - DnD demo</div>
                </SHeader>
                <SContent>
                    <div style={{ display: 'flex', flexDirection: 'column', background: 'black' }}>
                        <div style={{ padding: 5 }}>
                            <TextInput label="Name" immediate value={this.state.functionName} onChange={(val: string) => {
                                this.setState({
                                    functionName: val
                                });
                            }} />
                        </div>
                        <div style={{ padding: 5, display: 'flex', flexDirection: 'row' }}>
                            <button onClick={() => {
                                var str = JSON.stringify(activeModel.serialize());
                                saveFlowModel({ name: this.state.functionName, model: str });
                                setTimeout(() => {
                                    refreshFlowModel();
                                }, 1000);
                            }}><i className="fa fa-save" /></button>
                            <button onClick={() => {
                                refreshFlowModel();
                            }}><i className="fa fa-refresh" /></button>
                        </div>
                        <div style={{ padding: 5 }}>
                            <TextInput label="Filter" immediate value={this.state.filterValue} onChange={(val: string) => {
                                this.setState({
                                    filterValue: val
                                });
                            }} />
                        </div>
                        <TrayWidget>
                            <TrayItemWidget model={{
                                type: Operations.START_FUNCTION,
                                name: 'Function Entry',
                                operation: true
                            }} name={'Function Entry'} color={Operations.START_FUNCTION} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_CONSTRUCTOR, name: 'Add Constructor', operation: true
                            }} name={'Add Constructor'} color={Operations.ADD_CONSTRUCTOR} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_PARAMETER, name: 'Parameter', operation: true
                            }} name={'Add Parameter'} color={Operations.ADD_PARAMETER} />
                            <TrayItemWidget model={{
                                type: Operations.VARIABLE_GET, name: 'Variable', operation: true
                            }} name={'Variable'} color={Operations.VARIABLE_GET} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_CONSTANT, name: 'Constant', operation: true
                            }} name={'Constant'} color={Operations.ADD_CONSTANT} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_TYPE, name: 'Type', operation: true
                            }} name={'Add Type'} color={Operations.ADD_TYPE} />
                            <TrayItemWidget model={{
                                type: Operations.FOREACH_CALLBACK, name: 'ForEach', operation: true
                            }} name={'ForEach'} color={Operations.FOREACH_CALLBACK} />
                            <TrayItemWidget model={{
                                type: Operations.MAP_CALLBACK, name: 'Map', operation: true
                            }} name={'Map'} color={Operations.MAP_CALLBACK} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_ENUMERATION, name: 'Add Enumeration', operation: true
                            }} name={'Add Enumeration'} color={Operations.ADD_ENUMERATION} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_SEQUENCE, name: 'Add Sequence', operation: true
                            }} name={'Add Sequence'} color={Operations.ADD_SEQUENCE} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_IF, name: 'Add If', operation: true
                            }} name={'Add If'} color={Operations.ADD_IF} />
                            {this.getItemWidgets()}
                        </TrayWidget>
                    </div>
                    <SLayer
                        onDrop={(event) => {
                            var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                            var nodesCount = _.keys(diagramEngine.getModel().getNodes()).length;

                            var node: FlowCodeNodeModel | null = null;
                            if (data.type) {
                                node = ConstructNodeModel(data.type, data, this.props.fileSource)
                            }
                            if (node) {
                                var point = diagramEngine.getRelativeMousePoint(event);
                                node.setPosition(point);
                                diagramEngine.getModel().addNode(node);
                                this.forceUpdate();
                            }
                        }}
                        onDragOver={(event: any) => {
                            event.preventDefault();
                        }}>
                        <DemoCanvasWidget>
                            <CanvasWidget engine={diagramEngine} />
                        </DemoCanvasWidget>
                    </SLayer>
                </SContent>
            </SBody>
        );
    }
}
function registerNodeListeners(node: FlowCodeNodeModel) {
    if (node && node.registerListener) {
        node.registerListener({
            removing: (evt: BaseEvent) => {
                console.log(evt);
                let { targetPort, sourcePort } = evt as any;
                if (targetPort) {
                    let linkHandlers = sourcePort.getLinkHandlers();
                    handleLinkHandlers(linkHandlers, null, sourcePort, targetPort, 'source');
                    linkHandlers = targetPort.getLinkHandlers();
                    handleLinkHandlers(linkHandlers, null, sourcePort, targetPort, 'target');
                }
                return true;
            }
        });
    }
}
function registerLinkListeners(defaultLinkModel: DefaultLinkModel) {
    if (defaultLinkModel && defaultLinkModel.registerListener)
        defaultLinkModel.registerListener({
            sourcePortChanged: (portEvent: BaseEvent) => {
                let sourcePort: FlowCodePortModel = defaultLinkModel.getSourcePort() as FlowCodePortModel;

                if (sourcePort) {
                    let linkHandlers = sourcePort.getLinkHandlers();
                    handleLinkHandlers(linkHandlers, defaultLinkModel, sourcePort, defaultLinkModel.getTargetPort() as FlowCodePortModel, 'source');
                }
            },
            targetPortChanged: (portEvent: BaseEvent) => {
                let targetPort: FlowCodePortModel = defaultLinkModel.getTargetPort() as FlowCodePortModel;

                if (targetPort) {
                    let linkHandlers = targetPort.getLinkHandlers();
                    handleLinkHandlers(linkHandlers, defaultLinkModel, defaultLinkModel.getSourcePort() as FlowCodePortModel, targetPort, 'target');
                }
            },
        });
}

function handleLinkHandlers(linkHandlers: FlowCodeLinkHandlers[], defaultLinkModel: DefaultLinkModel | null, sourcePort: FlowCodePortModel, targetPort: FlowCodePortModel, interestPort: 'source' | 'target') {
    linkHandlers.forEach((linkHandle: FlowCodeLinkHandlers) => {
        PortHandler.Handle({
            link: defaultLinkModel,
            sourcePort,
            targetPort,
            interestPort: interestPort,
            node: sourcePort.getNode() as FlowCodeNodeModel,
            type: linkHandle.type
        });
    });
}

function ConstructNodeModel(type: string, ops: { operation?: boolean, color?: string, name: string, parameter: boolean, type: string, file: string }, fileSource: any): FlowCodeNodeModel {
    let description: IFlowCodeConfig = FlowCodeStatements[type];
    if (ops && ops.file && fileSource) {
        description = fileSource[ops.file][ops.type]
        description.color = ops.color || '' || description.color;
    }
    let node = new FlowCodeNodeModel(ops.name || type, !description ? ops.type : description.color);
    if (ops.operation || FlowCodeStatements[type]) {
        node.isOperation(ops.operation || !!FlowCodeStatements[type]);
    }
    if (![
        Operations.START_FUNCTION,
        Operations.FOREACH_CALLBACK,
        Operations.MAP_CALLBACK,
        Operations.ADD_CONSTANT,
        Operations.ADD_TYPE,
        Operations.VARIABLE_GET,
        Operations.ADD_PARAMETER,
        Operations.ADD_CONSTRUCTOR
    ].some(v => v === type)) {
        node.addFlowIn();
    }
    if (![
        Operations.ADD_TYPE,
        Operations.FOREACH_CALLBACK,
        Operations.MAP_CALLBACK,
        Operations.ADD_CONSTANT,
        Operations.ADD_PARAMETER,
        Operations.VARIABLE_GET,
        Operations.ADD_SEQUENCE
    ].some(v => v === type)) {
        node.addFlowOut();
    }

    if (Operations.ADD_PARAMETER === type) {
        let newPort = node.addInPort('variable');
        newPort.setPortName('variable');
        newPort.prompt();
        let typePort = node.addInPort('type');
        typePort.addLinkHandler(PortHandlerType.FunctionParameterType, node.getID());
        node.addOutPort('value');
        return node;
    }
    if (Operations.ADD_CONSTRUCTOR === type) {
        let newPort = node.addInPort('type');
        newPort.setPortName(PortStructures.Generic.Type);
        newPort.addLinkHandler(PortHandlerType.Constructor, node.getID())
        newPort.setStatic();

        return node;
    }
    if (Operations.ADD_SEQUENCE === type) {
        node.enableInPortAdd();
        return node;
    }
    if (Operations.ADD_CONSTANT === type) {
        let newPort = node.addOutPort('constant');
        newPort.prompt();
        return node;
    }
    if (Operations.VARIABLE_GET === type) {
        node.addInPort('type');
        let newPort = node.addOutPort('variable');
        newPort.prompt();
        return node;
    }

    if (Operations.ADD_IF === type) {
        node.addInPort('conditional');
        node.addOutPort('then');
        node.addOutPort('else');
        return node;
    }

    if (Operations.ADD_TYPE === type) {
        node.addOutPort('modelType');
        return node;
    }
    if (Operations.START_FUNCTION === type) {
        return node;
    }
    if (Operations.ADD_ENUMERATION === type) {
        node.addInPort('enumeration');
        node.addInPort('enumerationValue');
        node.addOutPort('value');
        return node;
    }
    if (Operations.FOREACH_CALLBACK === type) {
        node.addInPort('in');
        node.addOutPort('forEachFunc');
        node.addOutPort('sequence');
        node.addOutPort('value');
        node.addInPort('valueType');
        node.addOutPort('index');
        return node;
    }
    if (Operations.MAP_CALLBACK === type) {
        node.addInPort('in');
        node.addOutPort('mapFunc');
        node.addOutPort('sequence');
        node.addOutPort('value');
        node.addInPort('valueType');
        node.addInPort('outputType');
        node.addOutPort('index');
        return node;
    }
    if (ops && ops.parameter) {
        let newPort = node.addInPort('variable');
        newPort.prompt();
        let typePort = node.addInPort('type');
        typePort.addLinkHandler(PortHandlerType.FunctionParameterType, node.getID());
        typePort.setPortName(PortStructures.Generic.Type);
        return node;
    }

    if (!description) {
        return node;
    }
    if (description && !description.ast) {
        buildAst(description);
    }

    if (description.ast) {
        let { ast } = description;
        node.setSourceOptions({ file: ops.file, type: ops.type })
        if (ast) {
            switch (ast.kind) {
                case ts.SyntaxKind.FunctionDeclaration:
                    let func = ast as ts.FunctionDeclaration;
                    func.parameters.forEach((param: ts.ParameterDeclaration) => {
                        let temp: any = param.name;
                        let paramAny: any = param;
                        if (temp.text || temp.escapedText) {
                            let port = node.addInPort(temp.text || temp.escapedText, param.kind);
                            if (paramAny.type) {
                                port.portType = paramAny.type.escapedText;
                            }
                        }
                    })
                    if (func.type) {
                        if (func.type.kind !== ts.SyntaxKind.VoidKeyword) {
                            let syntaxKind = Object.entries(ts.SyntaxKind).filter(v => func.type && v[1] === func.type.kind);
                            if (syntaxKind[0] && syntaxKind[0][1] === ts.SyntaxKind.TypeReference) {
                                let typeRef = func.type as unknown as ts.TypeReferenceNode as any;
                                if (syntaxKind[0] && typeRef.typeName) {
                                    node.addOutPort(typeRef.typeName.escapedText, func.type.kind)
                                }
                            }
                            else {
                                let port: any = null;
                                if (func.type.kind === ts.SyntaxKind.AnyKeyword) {
                                    port = node.addOutPort('any', func.type.kind)
                                }
                                else if (func.type.kind === ts.SyntaxKind.BooleanKeyword) {
                                    port = node.addOutPort('boolean', func.type.kind)
                                }
                                else if (func.type.kind === ts.SyntaxKind.StringKeyword) {
                                    port = node.addOutPort('string', func.type.kind)
                                }
                                else if (func.type.kind === ts.SyntaxKind.NumberKeyword) {
                                    port = node.addOutPort('number', func.type.kind)
                                }
                                else {
                                    let temp: any = func.type;
                                    port = node.addOutPort(temp.escapedText, func.type.kind)
                                }
                                if (func.type && port) {
                                    port.portType = (func.type as any).escapedText;
                                }
                            }
                        }


                    }
                    break;
                case ts.SyntaxKind.InterfaceDeclaration:
                case ts.SyntaxKind.ClassDeclaration:
                    let classDec = ast as ts.ClassDeclaration;
                    let classTemp: any = classDec;
                    classDec.members.forEach((member: ts.ClassElement) => {
                        let temp: any = member;
                        let newPort: any = null;
                        switch (member.kind) {
                            case ts.SyntaxKind.PropertyDeclaration:
                            case ts.SyntaxKind.Constructor:
                            case ts.SyntaxKind.MethodDeclaration:
                            case ts.SyntaxKind.PropertySignature:
                                // Don't should any thing yet.
                                // if (temp.name && temp.type) {
                                //     newPort = node.addOutPort(temp.name.escapedText, member.kind);
                                //     newPort.portType = temp.type.escapedText;
                                //     newPort.member = member;
                                // }
                                break;
                        }
                    });

                    node.addOutPort(classTemp.name ? classTemp.name.escapedText : '', ast.kind);
                    break;
                case ts.SyntaxKind.VariableDeclaration:
                    let newPort = node.addInPort('variable');
                    newPort.prompt();
                    let typePort = node.addInPort('type');
                    typePort.setPortName(PortStructures.Generic.Type);
                    typePort.addLinkHandler(PortHandlerType.FunctionParameterType, node.getID());
                    let expressionPort = node.addInPort('expression');
                    expressionPort.setPortName(PortStructures.Generic.Expression);
                    expressionPort.addLinkHandler(PortHandlerType.FunctionParameterExpressionType, node.getID());
                    break;

            }
        }

    }

    return node;
}