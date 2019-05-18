import * as d3 from 'd3'
import * as Cola from 'webcola'
// @flow
import React, { Component } from 'react';


export default class MindMap extends Component {
    constructor() {
        super();
        this.state = {
            id: `id-${Date.now()}`
        }
    }
    componentDidMount() {
        var domObj = document.querySelector(`#${this.state.id}`);
        var bb = domObj.getBoundingClientRect();
        var cola = Cola;
        cola = cola.d3adaptor(d3)
        var width = bb.width - 10;// 960;
        var height = bb.height - 10;// 800;
        var color = d3.scaleOrdinal(d3.schemeCategory10)
        var pad = 20

        cola
            .linkDistance(80)
            .avoidOverlaps(true)
            .handleDisconnected(false)
            .size([width, height])

        var svg = d3.select(`#${this.state.id}`).append("svg")
            .attr("width", width)
            .attr("height", height)

        var graph = {
            "nodes": [
                { "name": "a", "width": 60, "height": 40 },
                { "name": "b", "width": 60, "height": 40 },
                { "name": "c", "width": 60, "height": 40 },
                { "name": "d", "width": 60, "height": 40 },
                { "name": "e", "width": 60, "height": 40 }
            ],
            "groups": [
                { "leaves": [0], "groups": [1] },
                { "leaves": [1, 2] },
                { "leaves": [3, 4] }
            ]
        }

        graph.nodes.forEach(function (v) {
            v.width = v.height = 95
        })
        graph.groups.forEach(function (g) { g.padding = pad })

        cola
            .nodes(graph.nodes)
            .groups(graph.groups)
            .start(100, 0, 50, 50)

        var group = svg.selectAll(".group")
            .data(graph.groups)
            .enter().append("rect")
            .attr("rx", 8).attr("ry", 8)
            .attr("class", "group")
            .style("fill", function (d, i) { return color(i) })
            .call(cola.drag)

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("rect")
            .attr("class", "node")
            .attr("width", function (d) { return d.width - 2 * pad })
            .attr("height", function (d) { return d.height - 2 * pad })
            .attr("rx", 5).attr("ry", 5)
            .style("fill", function (d) { return color(graph.groups.length) })
            .call(cola.drag)

        var label = svg.selectAll(".label")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", "label")
            .text(function (d) { return d.name })
            .call(cola.drag)

        cola.on("tick", function () {
            node
                .attr("x", function (d) { return d.x - d.width / 2 + pad })
                .attr("y", function (d) { return d.y - d.height / 2 + pad })

            group.attr("x", function (d) { return d.bounds.x })
                .attr("y", function (d) { return d.bounds.y })
                .attr("width", function (d) { return d.bounds.width() })
                .attr("height", function (d) { return d.bounds.height() })

            label.attr("x", function (d) { return d.x })
                .attr("y", function (d) {
                    var h = this.getBBox().height
                    return d.y + h / 4
                })
        })
    }
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return (
            <div id={this.state.id} style={{ minHeight: 946 }}>
            </div>
        );
    }
}
