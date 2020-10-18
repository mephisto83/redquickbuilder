// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import createEngine, { DiagramModel, DefaultNodeModel, DagreEngine, DefaultLinkModel, DefaultDiagramState, LinkModel, DiagramEngine, PathFindingLinkFactory } from '@projectstorm/react-diagrams';
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
import { FlowNodeEventType, PortHandler, PortHandlerType } from './flowcode/PortHandler';
import { FlowCodeCommand, Operations, PortStructures, PortType } from './flowcode/flowutils';

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
const context: any = {};
export function callAutoDistribute() {
    context.autoDistribute();
}

export default class FlowCode extends Component<any, any> {
    fireChecking: boolean = false;
    fireCheckWaiting: boolean = false;
    engine: DagreEngine;
    constructor(props: any) {
        super(props);
        let id = UIA.GUID();
        let setup = this.newModel(id);
        this.engine = new DagreEngine({
            graph: {
                rankdir: 'LR',
                ranker: 'longest-path',
                marginx: 25,
                marginy: 25,
                nodesep: 10
            },
            includeLinks: true
        });
        this.state = { ...setup, id };
        context.autoDistribute = this.autoDistribute.bind(this);
    }

    autoDistribute = () => {
        this.engine.redistribute(this.state.activeModel);

        // only happens if pathfing is enabled (check line 25)
        this.reroute();
        this.state.engine.repaintCanvas();
    };

    reroute() {
        (this.state.engine as DiagramEngine)
            .getLinkFactories()
            .getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME)
            .calculateRoutingMatrix();
    }


    public fireCheck() {
        let throttleTime = 1000;
        if (!this.fireChecking) {
            this.fireChecking = true;
            let execute = () => {
                console.log('firechecking')
                if (this.fireCheckWaiting) {
                    this.fireCheckWaiting = false
                    setTimeout(execute, throttleTime);
                }
                else {
                    let activeModel: SRD.DiagramModel = this.state.activeModel;
                    let links = activeModel.getLinks();
                    links.forEach((linkModel) => {
                        processLinks(linkModel as DefaultLinkModel, FlowNodeEventType.Check);
                    });

                    let nodes = activeModel.getNodes() as FlowCodeNodeModel[];
                    nodes.forEach((node) => {
                        processNodes(node, FlowNodeEventType.Check)
                    })
                    console.log('fire check')
                    this.fireChecking = false;
                    this.forceUpdate();
                }
            }
            setTimeout(execute, throttleTime)
        }
        else {
            this.fireCheckWaiting = true;
        }
    }
    public newModel(id: string): {
        activeModel: SRD.DiagramModel,
        engine: SRD.DiagramEngine
    } {
        let activeModel = new SRD.DiagramModel();
        var engine = createEngine();
        // register some other factories as well
        engine
            .getPortFactories()
            .registerFactory(new FlowCodePortFactory());
        engine.getNodeFactories().registerFactory(new FlowCodeNodeFactory());

        engine.setModel(activeModel);


        activeModel.registerListener({
            eventDidFire: (event: BaseEvent) => {
                let temp: any = event;

                if (event && event.firing && temp.isCreated) {
                    let defaultLinkModel: DefaultLinkModel = temp.link;
                    registerLinkListeners(defaultLinkModel);
                    registerNodeListeners(temp.node, this.fireCheck.bind(this));
                    this.forceUpdate();
                }
                else if (event && event.firing) {

                }
                return true;
            },
            eventWillFire: (event: BaseEvent) => {

            }
        });


        return {
            activeModel,
            engine
        }
    }
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (prevProps && prevProps.code !== this.props.code) {
            this.state.activeModel.deserializeModel(JSON.parse(this.props.code), this.state.engine);
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
        let { engine, activeModel } = this.state;
        if (!engine) {
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
                                type: Operations.ANONYMOUS_FUNCTION, name: 'Anonymous Function', operation: true
                            }} name={'Anonymous Function'} color={Operations.ANONYMOUS_FUNCTION} />
                            <TrayItemWidget model={{
                                type: Operations.ADD_PARAMETER, name: 'Parameter', operation: true
                            }} name={'Add Parameter'} color={Operations.ADD_PARAMETER} />
                            <TrayItemWidget model={{
                                type: Operations.VARIABLE_GET, name: 'Variable', operation: true
                            }} name={'Variable'} color={Operations.VARIABLE_GET} />
                            <TrayItemWidget model={{
                                type: Operations.GET_PROPERTY, name: 'Get Property', operation: true
                            }} name={'Get Property'} color={Operations.GET_PROPERTY} />
                            <TrayItemWidget model={{
                                type: Operations.SET_PROPERTY, name: 'Set Property', operation: true
                            }} name={'Set Property'} color={Operations.SET_PROPERTY} />
                            <TrayItemWidget model={{
                                type: Operations.CALL_METHOD, name: 'Call Method', operation: true
                            }} name={'Call Method'} color={Operations.CALL_METHOD} />
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
                            var nodesCount = _.keys(engine.getModel().getNodes()).length;

                            var node: FlowCodeNodeModel | null = null;
                            if (data.type) {
                                node = ConstructNodeModel(data.type, data, this.props.fileSource)
                            }
                            if (node) {
                                var point = engine.getRelativeMousePoint(event);
                                node.setPosition(point);
                                engine.getModel().addNode(node);
                                this.forceUpdate();
                            }
                        }}
                        onDragOver={(event: any) => {
                            event.preventDefault();
                        }}>
                        <DemoCanvasWidget>
                            <CanvasWidget engine={engine} />
                        </DemoCanvasWidget>
                    </SLayer>
                </SContent>
            </SBody>
        );
    }
}
function registerNodeListeners(node: FlowCodeNodeModel, fireCheck?: Function) {
    if (node && node.registerListener) {
        let removing = (evt: BaseEvent) => {
            let { targetPort, sourcePort } = evt as any;
            if (targetPort || sourcePort) {

                let linkHandlers = sourcePort ? sourcePort.getLinkHandlers() : [];
                handleLinkHandlers(linkHandlers, null, sourcePort, targetPort, 'source', FlowNodeEventType.Removing);

                linkHandlers = targetPort ? targetPort.getLinkHandlers() : [];
                handleLinkHandlers(linkHandlers, null, sourcePort, targetPort, 'target', FlowNodeEventType.Removing);

            }
            return true;
        };
        node.registerListener({
            eventDidFire: (evt: any) => {
                if (evt.function === FlowNodeEventType.Removing) {
                    removing(evt);
                }
                else if (evt.function === FlowNodeEventType.PortValueUpdated) {
                }
                if (fireCheck) {
                    fireCheck()
                }
            },
            eventWillFire: (evt: BaseEvent) => {
            },
            entityRemoved: (evt: BaseEvent) => {
                let temp: any = evt;
                let node: FlowCodeNodeModel = temp.entity;
                let ports = node.getPorts();
                for (var i in ports) {
                    let links = ports[i].getLinks();
                    Object.entries(links).forEach((item: [string, LinkModel<SRD.LinkModelGenerics>]) => {
                        let [, linkModel] = item;

                        processLinks(linkModel as DefaultLinkModel, FlowNodeEventType.NodeRemoving);
                    })
                }
            },
            removing
        });
    }
}
function processLinks(linkModel: DefaultLinkModel, eventType: FlowNodeEventType) {
    let sourcePort = linkModel.getSourcePort() as FlowCodePortModel;
    let targetPort = linkModel.getTargetPort() as FlowCodePortModel;
    let linkHandlers: FlowCodeLinkHandlers[] = [];
    if (sourcePort) {
        linkHandlers = sourcePort.getLinkHandlers();
        handleLinkHandlers(linkHandlers, linkModel, sourcePort, targetPort, 'source', eventType);
    }
    if (targetPort) {
        linkHandlers = targetPort.getLinkHandlers();
        handleLinkHandlers(linkHandlers, linkModel, sourcePort, targetPort, 'target', eventType);
    }
}
function processNodes(node: FlowCodeNodeModel, eventType: FlowNodeEventType) {

    let portNames = node.getNodeHandlers();
    let ports = node.getPorts();
    portNames.forEach((portName: string) => {

        if (ports && ports[portName]) {
            let flowPortModel = ports[portName] as FlowCodePortModel;
            let handlers = flowPortModel.getLinkHandlers();
            handlers.forEach((handle) => {
                PortHandler.Handle({
                    link: null,
                    sourcePort: flowPortModel.getOptions().in ? flowPortModel : null,
                    targetPort: !flowPortModel.getOptions().in ? flowPortModel : null,
                    interestPort: !flowPortModel.getOptions().in ? 'target' : 'source',
                    node: flowPortModel.getNode() as FlowCodeNodeModel,
                    eventType: eventType,
                    type: handle.type
                });
            })
        }
    })
}
function registerLinkListeners(defaultLinkModel: DefaultLinkModel) {
    if (defaultLinkModel && defaultLinkModel.registerListener)
        defaultLinkModel.registerListener({
            sourcePortChanged: (portEvent: BaseEvent) => {
                let sourcePort: FlowCodePortModel = defaultLinkModel.getSourcePort() as FlowCodePortModel;

                if (sourcePort) {
                    let linkHandlers = sourcePort.getLinkHandlers();
                    handleLinkHandlers(linkHandlers, defaultLinkModel, sourcePort, defaultLinkModel.getTargetPort() as FlowCodePortModel, 'source', FlowNodeEventType.PortChanged);
                }
            },
            targetPortChanged: (portEvent: BaseEvent) => {
                let targetPort: FlowCodePortModel = defaultLinkModel.getTargetPort() as FlowCodePortModel;

                if (targetPort) {
                    let linkHandlers = targetPort.getLinkHandlers();
                    handleLinkHandlers(linkHandlers, defaultLinkModel, defaultLinkModel.getSourcePort() as FlowCodePortModel, targetPort, 'target', FlowNodeEventType.PortChanged);
                }
            },
        });
}

function handleLinkHandlers(linkHandlers: FlowCodeLinkHandlers[], defaultLinkModel: DefaultLinkModel | null, sourcePort: FlowCodePortModel, targetPort: FlowCodePortModel, interestPort: 'source' | 'target', eventType: FlowNodeEventType) {
    linkHandlers.forEach((linkHandle: FlowCodeLinkHandlers) => {
        PortHandler.Handle({
            link: defaultLinkModel,
            sourcePort,
            targetPort,
            interestPort: interestPort,
            node: sourcePort.getNode() as FlowCodeNodeModel,
            type: linkHandle.type,
            eventType: eventType
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
        Operations.ANONYMOUS_FUNCTION,
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
        Operations.ANONYMOUS_FUNCTION,
        Operations.ADD_CONSTANT,
        Operations.ADD_PARAMETER,
        Operations.VARIABLE_GET,
        Operations.ADD_SEQUENCE,
        Operations.ADD_CONSTRUCTOR
    ].some(v => v === type)) {
        node.addFlowOut();
    }

    if (Operations.ANONYMOUS_FUNCTION === type) {
        node.addOutPort('function');
        return node;
    }

    if (Operations.ADD_PARAMETER === type) {
        let newPort = node.addInPort('variable');
        newPort.setPortName('variable');
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
    if (Operations.CALL_METHOD === type) {
        let newPort = node.addInPort('type');
        newPort.setPortName(PortStructures.Generic.Type);
        newPort.addLinkHandler(PortHandlerType.FromCallableReference, node.getID())
        newPort.setStatic();
        node.setNodeHandler([PortStructures.CallableExpression.Method])
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
                        let temp = param.name;
                        let paramAny: ts.ParameterDeclaration = param;
                        let port = node.addInPort(temp.getText(), param.kind);
                        if (paramAny.type) {
                            port.portType = paramAny.type.getText();
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
                    let newPort = node.addOutPort('variable');
                    newPort.prompt();
                    let typePort = node.addInPort('type');
                    typePort.setPortName(PortStructures.Generic.Type);
                    typePort.addLinkHandler(PortHandlerType.FunctionParameterType, node.getID());
                    let expressionPort = node.addInPort('expression');
                    expressionPort.setPortName(PortStructures.Generic.Expression);
                    expressionPort.addLinkHandler(PortHandlerType.FunctionParameterExpressionType, node.getID());
                    break;
                case ts.SyntaxKind.EnumDeclaration:
                    let enumerationDec = ast as ts.EnumDeclaration;
                    enumerationDec.members.forEach((member: ts.EnumMember) => {
                        let outPort = node.addOutPort(member.getText());
                        outPort.setPortName(member.getText());
                        outPort.setPortType(PortType.EnumerationValue);
                    })
                    break;

            }
        }

    }

    return node;
}