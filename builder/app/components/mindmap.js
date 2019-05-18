import * as d3 from 'd3'
import * as Cola from 'webcola'
import * as GraphMethods from '../methods/graph_methods';
// @flow
import React, { Component } from 'react';


export default class MindMap extends Component {
    constructor() {
        super();
        this.state = {
            id: `id-${Date.now()}`,
            graph: {
                "nodes": [
                    { "name": "a", "width": 60, "height": 40 },
                    { "name": "b", "width": 60, "height": 40 },
                    { "name": "c", "width": 60, "height": 40 },
                    { "name": "d", "width": 60, "height": 40 },
                    { "name": "e", "width": 60, "height": 40 }
                ].map(t => { t.id = t.name; return t; }),
                links: [],
                "groups": [
                    // { "leaves": [0], "groups": [1] },
                    // { "leaves": [1, 2] },
                    // { "leaves": [3, 4] }
                ]
            }
        }
        this.draw = this.draw.bind(this);
    }
    componentDidMount() {
        // Draw for the first time to initialize.
        this.draw();

        // Redraw based on the new size whenever the browser window is resized.
        window.addEventListener("resize", this.draw);
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.draw);
    }
    draw() {
        var me = this;
        var domObj = document.querySelector(`#${this.state.id}`);
        domObj.innerHTML = '';
        var bb = domObj.getBoundingClientRect();
        var force = Cola.d3adaptor(d3)
        var width = bb.width - 10;// 960;
        var height = bb.height - 10;// 800;
        var color = d3.scaleOrdinal(d3.schemeCategory10)
        var pad = 20

        force
            .linkDistance(80)
            .avoidOverlaps(true)
            .handleDisconnected(false)
            .size([width, height])

        var svg = d3.select(`#${this.state.id}`).append("svg")
            .attr("width", width)
            .attr("height", height)

        var graph = this.state.graph;

        graph.nodes.forEach(function (v) {
            v.width = v.height = 95
        })
        graph.groups.forEach(function (g) { g.padding = pad })

        force.nodes(graph.nodes)
            .groups(graph.groups)
            .links(graph.links)
            .on("tick", tick)

        var group = svg.selectAll(".group")
            .data(graph.groups)
            .enter().append("rect")
            .attr("rx", 8).attr("ry", 8)
            .attr("class", "group")
            .style("fill", function (d, i) { return color(i) })
            .call(force.drag)


        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function (d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node");
        this.$node = node;
        this.buildNode(graph, pad, force, color);

        // var label = svg.selectAll(".label")
        //     .data(graph.nodes)
        //     .enter().append("text")
        //     .attr("class", "label")
        //     .text(function (d) { return d.name })
        //     .call(force.drag);
        var label = svg.selectAll(".label")
            .data(graph.nodes)
            .enter().append("foreignObject")
            .attr("class", "label");
        label.append('div')
            .text(function (d) { return d.name })
            .call(force.drag);
        this.$force = force;
        this.setState({
            $node: node,
            $color: color,
            pad: pad
        })


        function tick() {
            link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            if (me.$_nodes) {
                me.$_nodes
                    .attr("x", function (d) { return d.x - d.width / 2 + pad })
                    .attr("y", function (d) { return d.y - d.height / 2 + pad })
            }

            group.attr("x", function (d) { return d.bounds.x })
                .attr("y", function (d) { return d.bounds.y })
                .attr("width", function (d) { return d.bounds.width() })
                .attr("height", function (d) { return d.bounds.height() })

            label.attr("x", function (d) {
                return d.x
            })
                .attr("y", function (d) {

                    var h = this.getBoundingClientRect().height
                    return d.y + h / 4
                })
        }
        force.start();
    }
    buildNode(graph, pad, cola, color) {
        var node = this.$node.data(cola.nodes(), x => x.id || x.name);
        var temp = node.enter().append("rect")
            .attr("class", "node")
            .attr("width", function (d) { return d.width - 2 * pad })
            .attr("height", function (d) { return d.height - 2 * pad })
            .attr("rx", 5).attr("ry", 5)
            .style("fill", function (d) { return color(graph.groups.length) })
            .call(cola.drag);
        node.exit().remove();
        this.$_nodes = temp;
    }
    applyNodeVisualData(nn) {
        nn.width = 40;
        nn.height = 40;
        nn.name = nn.id;
        return nn;
    }
    componentWillReceiveProps(props, state) {
        if (props.graph) {
            var { graph } = props;
            if (graph.nodes && this.state && this.state.graph && this.state.graph.nodes) {
                // d3.event.stopPropagation();
                this.$force.stop();
                var removedNodes = this.state.graph.nodes.relativeCompliment(graph.nodes, (x, y) => x.id === y).map(t => {
                    return this.state.graph.nodes.indexOf(t);
                });
                this.state.graph.nodes.removeIndices(removedNodes);
                var newNodes = graph.nodes.relativeCompliment(this.state.graph.nodes, (x, y) => x === y.id);
                newNodes.map(nn => {
                    this.state.graph.nodes.push(
                        this.applyNodeVisualData(GraphMethods.duplicateNode(graph.nodeLib[nn]))
                    );
                });
                this.draw();
                // this.buildNode(this.state.graph, this.state.pad, this.$force, this.state.$color);

                // this.$force.start();

                // force.start(100, 0, 50, 50);
            }
        }
    }
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return (
            <div id={this.state.id} className="mindmap" style={{ minHeight: 946 }}>
            </div>
        );
    }
}
