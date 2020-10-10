// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import createEngine, { DiagramModel, DefaultPortModel, PathFindingLinkFactory, DagreEngine, DefaultNodeModel, DefaultLinkModel, DefaultDiagramState, LinkModel, DiagramEngine } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import DemoCanvasWidget from './canvaswidget';
import * as SRD from '@projectstorm/react-diagrams';
import styled from '@emotion/styled';
import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { buildAst, buildFunctions, FlowCodeStatements, IFlowCodeConfig } from '../constants/flowcode_ast';
import ts from 'typescript';
import { FlowCodePortFactory } from './flowcode/FlowCodePortFactory';
import { FlowCodeNodeFactory } from './flowcode/FlowCodeNodeFactory';
import { FlowCodeNodeModel } from './flowcode/FlowCodeNodeModel';
import TextInput from './textinput';
import { FlowCodePortModel } from './flowcode/FlowCodePortModel';
import { GraphLink, Node } from '../methods/graph_types';
import { refreshFlowModel, saveFlowModel } from '../actions/remoteActions';

const operations = {
    ADD_PARAMETER: '#843B62',
    START_FUNCTION: '#FFB997',
    ADD_TYPE: '#74546A',
    ADD_ENUMERATION: '#7C7F65',
    ADD_SEQUENCE: '#59CD90',
    FOREACH_CALLBACK: '#E39774',
    MAP_CALLBACK: '#E39774',
    VARIABLE_GET: '#F34213',
    ADD_CONSTANT: '#D05353',
    ADD_IF: '#1B9AAA'
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


export default class GraphView extends Component<any, any> {
    engine: DagreEngine;
    constructor(props: any) {
        super(props);
        let id = UIA.GUID();
        this.engine = new DagreEngine({
            graph: {
                rankdir: 'RL',
                ranker: 'longest-path',
                marginx: 25,
                marginy: 25
            },
            includeLinks: true
        });

        let setup = this.newModel(id);
        this.state = { ...setup, id };
    }


    public newModel(id: string): {
        activeModel: SRD.DiagramModel,
        engine: DiagramEngine
    } {
        let activeModel = new SRD.DiagramModel();
        let engine = createEngine();
        // register some other factories as well 

        let diagramEngine = engine;
        diagramEngine.setModel(activeModel);



        return {
            activeModel,
            engine
        }
    }
    autoDistribute = () => {
        this.engine.redistribute(this.props.model);

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


    componentDidUpdate(prevProps: any, prevState: any, snapshot: any) {
        if (this.props.graphViewPackage !== prevProps.graphViewPackage) {
            debugger;
            let { graphViewPackage } = this.props;
            if (graphViewPackage) {
                this.setupGraphView(graphViewPackage);
            }
        }
    }
    private setupGraphView(graphViewPackage: any) {
        let { activeModel, engine } = this.state;
        let { links, nodes } = graphViewPackage;
        if (nodes) {
            let dnodes: any = {};
            nodes.forEach((node: Node) => {
                let dnode: any = this.createNode(UIA.GetNodeTitle(node));
                dnodes[node.id] = dnode;
            });
            activeModel.getNodes().forEach((node: any) => {
                activeModel.removeNode(node);
            });

            nodes.forEach((node: Node, index: number) => {
                dnodes[node.id].setPosition(index * 70, index * 70);
                activeModel.addNode(dnodes[node.id]);
            });
            if (links) {
                links.forEach((link: GraphLink) => {
                    let newLink = this.connectNodes(dnodes[link.source], dnodes[link.target], engine);
                    activeModel.addLink(newLink );
                });
            }
        }
    }
    connectNodes(nodeFrom: any, nodeTo: any, engine: DiagramEngine) {
        //just to get id-like structure
        const portOut = nodeFrom.addPort(new DefaultPortModel(true, `${nodeFrom.name}-out-${UIA.GUID()}`, 'Out'));
        const portTo = nodeTo.addPort(new DefaultPortModel(false, `${nodeFrom.name}-to-${UIA.GUID()}`, 'IN'));
        // return portOut.link(portTo);

        // ################# UNCOMMENT THIS LINE FOR PATH FINDING #############################
        return portOut.link(portTo, engine.getLinkFactories().getFactory(PathFindingLinkFactory.NAME));
        // #####################################################################################
    }

    createNode(name: string): any {
        return new DefaultNodeModel(name, 'rgb(0,192,255)');
    }
    componentDidMount() {
        setTimeout(() => {
            this.autoDistribute();
        }, 500);
    }
    render() {

        const { state } = this.props;
        let { engine, activeModel } = this.state;
        if (!engine) {
            return <div></div>
        }
        return (
            <SBody>
                <SHeader>
                    <div className="title">{this.props.title || ''}</div>
                </SHeader>
                <SContent>
                    <SLayer
                        onDrop={(event) => {
                            // var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                            // var nodesCount = _.keys(diagramEngine.getModel().getNodes()).length;

                            // var node: FlowCodeNodeModel | null = null;
                            // if (data.type) {
                            //     node = ConstructNodeModel(data.type, data)
                            // }
                            // if (node) {
                            //     var point = diagramEngine.getRelativeMousePoint(event);
                            //     node.setPosition(point);
                            //     diagramEngine.getModel().addNode(node);
                            //     this.forceUpdate();
                            // }
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
