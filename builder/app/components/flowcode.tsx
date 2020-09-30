// @flow
import React, { Component } from 'react';
import * as UIA from '../actions/uiactions';
import * as Titles from './titles';
import createEngine, { DiagramModel, DefaultNodeModel, DefaultLinkModel, DefaultDiagramState } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import DemoCanvasWidget from './canvaswidget';

const chartSimple: any = {
    offset: {
        x: 0,
        y: 0
    },
    nodes: {
        node1: {
            id: "node1",
            type: "output-only",
            position: {
                x: 300,
                y: 100
            },
            ports: {
                port1: {
                    id: "port1",
                    type: "output",
                    properties: {
                        value: "yes"
                    }
                },
                port2: {
                    id: "port2",
                    type: "output",
                    properties: {
                        value: "no"
                    }
                }
            }
        },
        node2: {
            id: "node2",
            type: "input-output",
            position: {
                x: 300,
                y: 300
            },
            ports: {
                port1: {
                    id: "port1",
                    type: "input"
                },
                port2: {
                    id: "port2",
                    type: "output"
                }
            }
        },
    },
    links: {
        link1: {
            id: "link1",
            from: {
                nodeId: "node1",
                portId: "port2"
            },
            to: {
                nodeId: "node2",
                portId: "port1"
            },
        },
    },
    selected: {},
    hovered: {}
};

export default class FlowCode extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    minified() {
        const { state } = this.props;
        return UIA.GetC(state, UIA.VISUAL, UIA.DASHBOARD_MENU) ? 'sidebar-collapse' : '';
    }
    componentDidMount() {
        //1) setup the diagram engine
        var engine = createEngine();

        // ############################################ MAGIC HAPPENS HERE
        const state = engine.getStateMachine().getCurrentState();
        if (state instanceof DefaultDiagramState) {
            state.dragNewLink.config.allowLooseLinks = false;
        }
        // ############################################ MAGIC HAPPENS HERE

        //2) setup the diagram model
        var model = new DiagramModel();

        //3-A) create a default node
        var node1 = new DefaultNodeModel('Node 1', 'rgb(0,192,255)');
        var port1 = node1.addOutPort('Out');
        node1.setPosition(100, 100);

        //3-B) create another default node
        var node2 = new DefaultNodeModel('Node 2', 'rgb(192,255,0)');
        var port2 = node2.addInPort('In');
        node2.setPosition(400, 100);

        //3-C) link the 2 nodes together
        var link1 = port1.link(port2);

        //3-D) create an orphaned node
        var node3 = new DefaultNodeModel('Node 3', 'rgb(0,192,255)');
        node3.addOutPort('Out');
        node3.setPosition(100, 200);

        //4) add the models to the root graph
        model.addAll(node1, node2, node3, link1);

        //5) load model into engine
        engine.setModel(model);
        this.setState({ engine })
    }
    render() {
        let props: any = this.props;
        const { state } = this.props;
        let { engine } = this.state;
        if (!engine) {
            return <div></div>
        }
        return (
            <DemoCanvasWidget>
                <CanvasWidget engine={engine} />
            </DemoCanvasWidget>
        );
    }
}

