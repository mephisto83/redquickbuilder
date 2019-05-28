
import * as d3Zoom from 'd3-zoom'
import * as d3 from 'd3';
import * as Cola from 'webcola'
import * as GraphMethods from '../methods/graph_methods';
// @flow
import React, { Component } from 'react';
import { NodeTypeColors } from '../actions/uiactions';
import { LinkStyles, LinkType, LinkPropertyKeys } from '../constants/nodetypes';

const MIN_DIMENSIONAL_SIZE = 20;
export default class MindMap extends Component {
    constructor() {
        super();
        this.textSize = {};
        this.mapScale = 1;
        this.mapTranslate = { x: 0, y: 0 };
        this.state = {
            id: `id-${Date.now()}`,
            graph: {
                "nodes": [].map(t => { t.id = t.name; return t; }),
                links: [],
                "groups": [
                    // { "leaves": [0], "groups": [1] },
                    // { "leaves": [1, 2] },
                    // { "leaves": [3, 4] }
                ]
            }
        }
        this.draw = this.draw.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
        this.mouseMove = this.mouseMove.bind(this);
    }
    componentDidMount() {
        // Draw for the first time to initialize.
        this.draw();

        // Redraw based on the new size whenever the browser window is resized.
        window.addEventListener("resize", this.draw);
        window.addEventListener('mousemove', this.mouseMove);
        window.addEventListener('mouseup', this.mouseUp);
        window.addEventListener('mousedown', this.mouseDown);
    }
    mouseDown(evt) {
        this.mouseStartEvent = evt;
    }
    mouseUp(evt) {
        this.mouseStartEvent = null;
        this.mouseMoved = null;
    }
    mouseMove(evt) {
        if (this.mouseStartEvent) {
            this.mouseMoveEvt = evt;
            this.mouseMoved = {
                x: evt.clientX - this.mouseStartEvent.clientX,
                y: evt.clientY - this.mouseStartEvent.clientY
            }
        }

    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.draw);
        window.removeEventListener('mousemove', this.mouseMove);
        window.removeEventListener('mousedown', this.mouseUp);
        window.removeEventListener('mouseup', this.mouseDown);
        var domObj = document.querySelector(`#${this.state.id}`);
        if (domObj) {
            domObj.innerHTML = '';
        }
    }
    calculateNodeTextSize(text, pad) {
        var div = document.querySelector('#secret-div-space');
        if (!div) {
            div = document.createElement('div');
            div.id = 'secret-div-space';
            div.setAttribute('id', 'secret-div-space');
            div.style.visibility = 'hidden';
            div.style.position = 'absolute';
            div.classList.add('label');
            div.style.whiteSpace = 'normal';
            div.style.maxWidth = (text || '').split(' ').length > 1 ? `200px` : '300px';
            div.style.top = '-10000px';
            div.style.padding = (pad * 2) + 'px';
            document.querySelector(`#${this.state.id}`).appendChild(div);
        }
        div.innerHTML = text;
        return div.getBoundingClientRect();
    }
    draw() {
        var me = this;
        var domObj = document.querySelector(`#${this.state.id}`);
        
        domObj.innerHTML = '';
        var bb = domObj.getBoundingClientRect();
        var force = Cola.d3adaptor(d3);
        var width = bb.width - 10;// 960;
        var height = bb.height - 10;// 800;
        var color = d3.scaleOrdinal(d3.schemeCategory10)

        var margin = 6, pad = 12;;
        force
            .linkDistance(this.props.linkDistance || 280)
            .avoidOverlaps(true)
            .handleDisconnected(false)
            .size([width, height]);

        var svg = makeSVG();
        function makeSVG() {
            var outer = d3.select(`#${me.state.id}`).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("pointer-events", "all");
            // define arrow markers for graph links
            outer.append('svg:defs').append('svg:marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 5)
                .attr('markerWidth', 3)
                .attr('markerHeight', 3)
                .attr('orient', 'auto')
                .append('svg:path')
                .attr('d', 'M0,-5L10,0L0,5L2,0')
                .attr('stroke-width', '0px')
                .attr('fill', function (d) {
                    if (d && d.properties && d.properties.type && LinkStyles[d.properties.type] && LinkStyles[d.properties.type].stroke) {
                        return LinkStyles[d.properties.type].stroke;
                    }
                    return '#555';
                });


            var vis = outer.append('g');
            outer.on("wheel", function (d) {
                me.mapScale += d3.event.wheelDelta / (me.props.zoomFactor || 5000);
                redraw();
            });
            function redraw() {
                var { x = 0, y = 0 } = (me.mouseMoved || {});
                vis.attr('transform', `scale(${me.mapScale || 1}) translate(${me.mapTranslate.x + x}, ${me.mapTranslate.y + y})`);
            }
            outer.on('mousemove', function (x, v) {
                if (me.panning) {
                    redraw();
                }
            });

            outer.on("mousedown", function (d) {
                me.panning = true;
            });
            outer.on("mouseup", function (d) {
                me.panning = false;

                if (me.mouseMoved && me.mapTranslate) {
                    me.mapTranslate = {
                        x: me.mapTranslate.x + me.mouseMoved.x,
                        y: me.mapTranslate.y + me.mouseMoved.y
                    }
                }
            });

            redraw();
            return vis;
        }
        // function gridify(svg, pgLayout, margin, groupMargin) {
        //     var routes = cola.gridify(pgLayout, 5, margin, groupMargin);
        //     svg.selectAll('path').remove();
        //     routes.forEach(route => {
        //         var cornerradius = 5;
        //         var arrowwidth = 3;
        //         var arrowheight = 7;
        //         var p = cola.GridRouter.getRoutePath(route, cornerradius, arrowwidth, arrowheight);
        //         if (arrowheight > 0) {
        //             svg.append('path')
        //                 .attr('class', 'linkarrowoutline')
        //                 .attr('d', p.arrowpath);
        //             svg.append('path')
        //                 .attr('class', 'linkarrow')
        //                 .attr('d', p.arrowpath);
        //         }
        //         svg.append('path')
        //             .attr('class', 'linkoutline')
        //             .attr('d', p.routepath)
        //             .attr('fill', 'none');
        //         svg.append('path')
        //             .attr('class', 'link')
        //             .attr('d', p.routepath)
        //             .attr('fill', 'none');
        //     });

        //     svg.selectAll(".label").transition().attr("x", d => d.routerNode.bounds.cx())
        //         .attr("y", function (d) {
        //             var h = this.getBBox().height;
        //             return d.bounds.cy() + h / 3.5;
        //         });

        //     svg.selectAll(".node").transition().attr("x", d => d.routerNode.bounds.x)
        //         .attr("y", d => d.routerNode.bounds.y)
        //         .attr("width", d => d.routerNode.bounds.width())
        //         .attr("height", d => d.routerNode.bounds.height());

        //     let groupPadding = margin - groupMargin;
        //     svg.selectAll(".group").transition().attr('x', d => d.routerNode.bounds.x - groupPadding)
        //         .attr('y', d => d.routerNode.bounds.y + 2 * groupPadding)
        //         .attr('width', d => d.routerNode.bounds.width() - groupPadding)
        //         .attr('height', d => d.routerNode.bounds.height() - groupPadding);
        // }
        var graph = this.state.graph;

        graph.nodes.forEach(function (v) {
            var bb = me.calculateNodeTextSize(getLabelText(v), pad);
            v.width = Math.max(MIN_DIMENSIONAL_SIZE, bb.width);
            v.height = Math.max(MIN_DIMENSIONAL_SIZE, bb.height);
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

        var node = svg.selectAll(".node");
        this.$node = node;
        this.buildNode(graph, force, color);
        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style('stroke', function (d) {

                if (d && d.properties && d.properties.type === LinkType.FunctionConstraintLink && !d.properties[LinkPropertyKeys.VALID_CONSTRAINTS]) {
                    return LinkStyles[LinkType.ErrorLink].stroke;
                }
                else if (d && d.properties && d.properties.type && LinkStyles[d.properties.type] && LinkStyles[d.properties.type].stroke) {
                    return LinkStyles[d.properties.type].stroke;
                }
                return '#555';
            })
            .style("stroke-dasharray", function (d) {
                if (d && d.properties && d.properties.type === LinkType.FunctionConstraintLink && !d.properties[LinkPropertyKeys.VALID_CONSTRAINTS]) {
                    return '5,5';
                }
                return '';
            })
            .style("d", function (d) {
                if (d && d.properties && d.properties.type === LinkType.FunctionConstraintLink && !d.properties[LinkPropertyKeys.VALID_CONSTRAINTS]) {
                    return 'M5 20 l215 0';
                }
                return '';
            })
            .style("stroke-width", function (d) { return Math.sqrt(d.value); });

        var label = svg.selectAll(".label")
            .data(graph.nodes)
            .enter()
            .append("foreignObject")
            .attr("class", "label");
        label.on('click', (d, index, els) => {
            if (me.props.onNodeClick && d && d.id) {
                me.props.onNodeClick(d.id, els[index].getBoundingClientRect());
            }
        })

        var features = svg.selectAll('.features')
            .data(graph.nodes)
            .enter()
            .append('g')
            .attr('class', 'features')

        features.append("rect")
            .attr("width", function (d) { return d.selected ? 5 : 0; })
            .attr("height", function (d) { return d.height - 10; })
            .attr('x', 3)
            .attr('y', 5)
            .attr("rx", 5).attr("ry", 5)
            .style("fill", function (d) {
                if (d.selected && me.props.selectedColor) {
                    return me.props.selectedColor;
                }
                return color(graph.groups.length)
            })

        var titles = label.append('xhtml:div')
            .style('width', x => {
                return `${x.width - pad / 2}px`
            })
            .style('white-space', 'normal')
            .style('text-align', 'start')
            //.style('word-break', 'break-all')
            .style('height', x => {
                return `${x.height - pad / 2}px`
            })
            .text(function (d) { return `${getLabelText(d)}` })
            .call(force.drag);

        this.$force = force;
        this.setState({
            $node: node,
            $color: color
        })

        function getLabelText(d) {
            return d && d.properties ? d.properties.text || d.name : d.name;
        }

        function tick() {
            if (me.$_nodes) {
                me.$_nodes.each(function (d) {
                    var bb = me.calculateNodeTextSize(getLabelText(d), pad);
                    d.width = Math.max(MIN_DIMENSIONAL_SIZE, bb.width);
                    d.height = Math.max(MIN_DIMENSIONAL_SIZE, bb.height)
                    d.innerBounds = d.bounds.inflate(- margin);
                });
            }

            // link.attr("x1", function (d) { return d.source.x; })
            //     .attr("y1", function (d) { return d.source.y; })
            //     .attr("x2", function (d) { return d.target.x; })
            //     .attr("y2", function (d) { return d.target.y; });


            if (me.$_nodes) {
                me.$_nodes
                    .attr("width", function (d) { return d.width; })
                    .attr("height", function (d) { return d.height; })
                    .attr("x", function (d) { return d.x - d.width / 2 })
                    .attr("y", function (d) { return d.y - d.height / 2 })
            }

            group.attr("x", function (d) { return d.bounds.x })
                .attr("y", function (d) { return d.bounds.y })
                .attr("width", function (d) { return d.bounds.width() })
                .attr("height", function (d) { return d.bounds.height() })

            link.each(function (d) {
                d.route = Cola.makeEdgeBetween(d.source.innerBounds, d.target.innerBounds, 5);
            });

            link.attr("x1", function (d) { return d.route.sourceIntersection.x; })
                .attr("y1", function (d) { return d.route.sourceIntersection.y; })
                .attr("x2", function (d) { return d.route.arrowStart.x; })
                .attr("y2", function (d) { return d.route.arrowStart.y; });

            features.attr("transform", function (d) {
                var y = d.y - d.height / 2;
                var x = d.x - d.width / 2;
                return `translate(${x},${y})`;
            })


            label
                .attr("x", function (d) {
                    return d.x - d.width / 2
                }).attr("y", function (d) {
                    var innerbit = this.querySelector('div');
                    var h = innerbit ? innerbit.getBoundingClientRect().height : 0;

                    return d.y + h / 2 - d.height + pad / 2;
                })
            titles.text(function (d) {
                return getLabelText(d);
            })
        }
        force.start();
    }
    buildNode(graph, cola, color) {
        var me = this;
        var node = this.$node.data(cola.nodes(), x => x.id || x.name);
        var temp = node.enter().append("rect")
            .attr("class", "node")
            .attr("width", function (d) { return d.width; })
            .attr("height", function (d) { return d.height; })
            .attr("rx", 5).attr("ry", 5)
            .style("fill", function (d) {
                if (d && d.properties && d.properties.nodeType && NodeTypeColors[d.properties.nodeType]) {
                    return NodeTypeColors[d.properties.nodeType]
                }
                return color(graph.groups.length)
            })
            .on('click', (d, index, els) => {
                if (me.props.onNodeClick && d) {
                    me.props.onNodeClick(d.id, els[index].getBoundingClientRect());
                }
            })
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
            var draw = true;
            // d3.event.stopPropagation();
            this.$force.stop();
            if (graph.nodes && this.state && this.state.graph && this.state.graph.nodes) {
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

                if (props.selectedNodes) {
                    this.state.graph.nodes.map(nn => {
                        nn.selected = props.selectedNodes.indexOf(nn.id) !== -1;
                    })
                }
                this.state.graph.nodes.map(nn => {
                    var nl = graph.nodeLib[nn.id];
                    if (nl && nl.properties) {
                        nn.properties = { ...nl.properties };
                    }
                })

                draw = true;
            }
            if (graph.links && this.state && this.state.graph && this.state.graph.links) {
                let removedLinks = this.state.graph.links.relativeCompliment(graph.links, (x, y) => x.id === y).map(t => {
                    return this.state.graph.links.indexOf(t);
                });
                this.state.graph.links.removeIndices(removedLinks);
                let newLinks = graph.links.relativeCompliment(this.state.graph.links, (x, y) => x === y.id);
                newLinks.map(nn => {
                    this.state.graph.links.push(
                        (duplicateLink(graph.linkLib[nn], this.state.graph.nodes))
                    );
                });

                this.state.graph.links.map(nn => {
                    let nl = graph.linkLib[nn.id];
                    if (nl && nl.properties) {
                        nn.properties = { ...nl.properties };
                    }
                });
                draw = true;
            }

            if (graph.groups && this.state && this.state.graph && this.state.graph.groups) {
                let graph_groups = graph.groups.filter(x => graph.groupLib[x].leaves || graph.groupLib[x].groups);
                let removedGroups = this.state.graph.groups.relativeCompliment(graph_groups, (x, y) => x.id === y).map(t => {
                    return this.state.graph.groups.indexOf(t);
                });
                this.state.graph.groups.removeIndices(removedGroups);
                let newGroups = graph_groups
                    .relativeCompliment(this.state.graph.groups, (x, y) => x === y.id)
                    .filter(x => graph.groupLib[x] && (graph.groupLib[x].leaves || graph.groupLib[x].groups));
                newGroups.map(nn => {
                    this.state.graph.groups.push(
                        (duplicateGroup(graph.groupLib[nn], this.state.graph.nodes))
                    )
                })
                graph_groups.forEach(group => {
                    let g = this.state.graph.groups.find(x => x.id === group);
                    applyGroup(g, graph.groupLib[group], this.state.graph.groups, this.state.graph.nodes);
                    // (duplicateGroup(graph.groupLib[nn], this.state.graph.nodes))
                })

                // this.state.graph.groups.map(group => {
                //     var _group = graph.groupLib[group.id];
                // })
            }


            if (draw) {
                this.draw();
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

function duplicateLink(nn, nodes) {
    return {
        ...nn,
        source: nodes.findIndex(x => x.id === nn.source),
        target: nodes.findIndex(x => x.id === nn.target)
    };
}
function applyGroup(mindmapgroup, _group, groups, nodes) {
    if (_group) {
        if (_group.leaves && _group.leaves.length) {
            mindmapgroup.leaves = (mindmapgroup.leaves || []);
            mindmapgroup.leaves.length = 0
            mindmapgroup.leaves.push(..._group.leaves.map(l => nodes.findIndex(x => x.id === l)));
        }
        else {
            delete mindmapgroup.leaves
        }

        if (_group.groups && _group.groups.length) {
            mindmapgroup.groups = (mindmapgroup.groups || []);
            mindmapgroup.groups.length = 0;
            mindmapgroup.groups.push(..._group.groups.map(l => groups.findIndex(x => x.id === l)));
        }
        else {
            delete mindmapgroup.groups
        }

        // if (nn.leaves) {
        //     let leaves = nn.leaves.map(l => nodes.findIndex(x => x.id === l));
        //     temp.leaves = leaves;
        // }
        // if (groups && nn.groups) {
        //     let groups = nn.groups.map(l => groups.findIndex(x => x.id === l));
        //     temp.groups = groups;
        // }
    }
}
function duplicateGroup(nn, nodes, groups) {
    let temp = {
        ...nn,
    };
    delete temp.leaves;
    delete temp.groups;
    return temp;
}