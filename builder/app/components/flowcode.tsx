// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel, DefaultDiagramState } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import DemoCanvasWidget from './canvaswidget';
import * as SRD from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { FlowCodeTypes, ICodeNodeDescription } from '../constants/flowcode';
import { buildAst, buildFunctions, FlowCodeStatements, IFlowCodeConfig } from '../constants/flowcode_ast';
import ts from 'typescript';
import { FlowCodePortFactory } from './flowcode/FlowCodePortFactory';
import { FlowCodeNodeFactory } from './flowcode/FlowCodeNodeFactory';
import { FlowCodeNodeModel } from './flowcode/FlowCodeNodeModel';
import TextInput from './textinput';
import { FlowCodePortModel } from './flowcode/FlowCodePortModel';
import { Node } from '../methods/graph_types';

const operations = {
    ADD_PARAMETER: '#843B62',
    START_FUNCTION: '#FFB997',
    ADD_TYPE: '#74546A',
    ADD_ENUMERATION: '#7C7F65'
};
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
        let setup = this.newModel();
        this.state = { ...setup };
    }


    public newModel(): {
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

        // //3-A) create a default node
        // var node1 = new SRD.DefaultNodeModel('Node 1', 'rgb(0,192,255)');
        // let port = node1.addOutPort('Out');
        // node1.setPosition(100, 100);

        // //3-B) create another default node
        // var node2 = new SRD.DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        // let port2 = node2.addInPort('In');
        // node2.setPosition(400, 100);

        // // link the ports
        // let link1 = port.link(port2);

        // this.activeModel.addAll(node1, node2, link1);

        return {
            activeModel,
            diagramEngine
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
        let { diagramEngine } = this.state;
        if (!diagramEngine) {
            return <div></div>
        }
        return (
            <SBody>
                <SHeader>
                    <div className="title">Storm React Diagrams - DnD demo</div>
                </SHeader>
                <SContent>
                    <div style={{ display: 'flex', flexDirection: 'column', background: 'black' }}>
                        <div style={{ padding: 5 }}>
                            <TextInput label="Filter" immediate value={this.state.filterValue} onChange={(val: string) => {
                                this.setState({
                                    filterValue: val
                                });
                            }} />
                        </div>
                        <TrayWidget>
                            <TrayItemWidget model={{
                                type: operations.START_FUNCTION,
                                name: 'Function Entry',
                                operation: true
                            }} name={'Function Entry'} color={operations.START_FUNCTION} />
                            <TrayItemWidget model={{
                                type: operations.ADD_PARAMETER, name: 'Parameter', operation: true
                            }} name={'Add Parameter'} color={operations.ADD_PARAMETER} />
                            <TrayItemWidget model={{
                                type: operations.ADD_TYPE, name: 'Add Type', operation: true
                            }} name={'Add Type'} color={operations.ADD_TYPE} />
                            <TrayItemWidget model={{
                                type: operations.ADD_ENUMERATION, name: 'Add Enumeration', operation: true
                            }} name={'Add Enumeration'} color={operations.ADD_ENUMERATION} />
                            {this.getItemWidgets()}
                        </TrayWidget>
                    </div>
                    <SLayer
                        onDrop={(event) => {
                            var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                            var nodesCount = _.keys(diagramEngine.getModel().getNodes()).length;

                            var node: FlowCodeNodeModel | null = null;
                            if (data.type) {
                                node = ConstructNodeModel(data.type, data)
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

function ConstructNodeModel(type: string, ops: { name: string, parameter: boolean, type: string }): FlowCodeNodeModel {
    let description: IFlowCodeConfig = FlowCodeStatements[type];
    let node = new FlowCodeNodeModel(ops.name || type, !description ? ops.type : description.color);

    if (operations.START_FUNCTION !== type)
        node.addFlowIn();
    node.addFlowOut();
    let selectTypes = () => {
        return Object.entries(ts.TypeFlags).map((v: any[]) => {
            return {
                title: v[0],
                value: v[0]
            }
        }).filter(v => isNaN(v.title));
    }
    let enumerationSelect = () => {
        let enumerations = UIA.Visual(UIA.GetStateFunc()(), UIA.FLOW_CODE_ENUMERATION);
        if (enumerations) {
            return enumerations.toNodeSelect();
        }
        return [];
    }
    let enumerationValueSelect = (port: FlowCodePortModel) => {
        if (port) {
            let options = port.getOptions();
            if (options.value) {
                let enumerations = UIA.Visual(UIA.GetStateFunc()(), UIA.FLOW_CODE_ENUMERATION);
                if (enumerations) {
                    let _enum = enumerations.find((v: Node) => v.id === options.value)
                    return UIA.GetNodeProp(_enum, UIA.NodeProperties.Enumeration).map((v: any) => ({ value: v.id, title: v.value }));
                }
            }
        }
        return [];
    }
    if (operations.ADD_PARAMETER === type) {
        let newPort = node.addInPort('variable');
        newPort.prompt();
        let typePort = node.addInPort('type');
        typePort.select(selectTypes);
        return node;
    }
    if (operations.START_FUNCTION === type) {
        return node;
    }
    if (operations.ADD_ENUMERATION === type) {
        let newPort = node.addInPort('enumeration');
        newPort.select(enumerationSelect);

        let newPort2 = node.addInPort('enumerationValue');
        newPort2.select(function () { return enumerationValueSelect(newPort) });
        node.addOutPort('value');
        return node;
    }
    if (ops && ops.parameter) {
        let newPort = node.addInPort('variable');
        newPort.prompt();
        let typePort = node.addInPort('type');
        typePort.select(selectTypes)
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
        if (ast) {
            switch (ast.kind) {
                case ts.SyntaxKind.FunctionDeclaration:
                    let func = ast as ts.FunctionDeclaration;
                    func.parameters.forEach((param: ts.ParameterDeclaration) => {
                        let temp: any = param.name;
                        if (temp.text || temp.escapedText) {
                            node.addInPort(temp.text || temp.escapedText, param.kind);
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
                        }
                        if (func.type.kind === ts.SyntaxKind.AnyKeyword) {
                            node.addOutPort('any', func.type.kind)
                        }
                    }
                    break;
                case ts.SyntaxKind.VariableDeclaration:
                    let newPort = node.addInPort('variable');
                    newPort.prompt();
                    let typePort = node.addInPort('type');
                    typePort.select(selectTypes)
                    node.addInPort('expression');
                    break;

            }
        }

    }

    return node;
}