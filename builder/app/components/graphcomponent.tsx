/* eslint-disable react/prop-types */
/* eslint-disable react/sort-comp */
/* eslint-disable class-methods-use-this */
import * as d3 from 'd3';
import * as Cola from 'webcola';
import React, { Component } from 'react';
import * as GraphMethods from '../methods/graph_methods';
// @flow
import { NodeTypeColors, GetNodeProp } from '../actions/uiActions';
import {
	LinkStyles,
	LinkType,
	LinkPropertyKeys,
	GetNodeTypeIcon,
	NodeProperties,
	UITypeColors
} from '../constants/nodetypes';

const MIN_DIMENSIONAL_SIZE = 20;
const iconSize = 30;
let mapSelectedNodes = null;
let mapSelectedLinks = null;
let version;
export default class GraphComponent extends Component<any, any> {
	hasStarted: boolean;
	mapScale: number;
	mapTranslate: any;
	textSize: any;
	mouseStartEvent: any;
	mouseMoved: any;
	mouseMoveEvt: any;
	avoidOverlaps: boolean = false;
	panning: any;
	$node: any;
	$force: any;
	$_nodes: any;
	constructor(props: any) {
		super(props);
		this.textSize = {};
		this.hasStarted = false;
		this.mapScale = 1;
		this.mapTranslate = { x: 0, y: 0 };
		this.state = {
			id: `id-${Date.now()}`,
			graph: {
				nodes: [].map((t: any) => {
					t.id = t.name;
					return t;
				}),
				links: [],
				groups: [
					// { "leaves": [0], "groups": [1] },
					// { "leaves": [1, 2] },
					// { "leaves": [3, 4] }
				]
			}
		};
		this.draw = this.draw.bind(this);
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
	}

	componentDidMount() {
		// Draw for the first time to initialize.
		this.draw();

		// Redraw based on the new size whenever the browser window is resized.
		window.addEventListener('resize', this.draw);
		window.addEventListener('mousemove', this.mouseMove);
		window.addEventListener('mouseup', this.mouseUp);
		window.addEventListener('mousedown', this.mouseDown);
	}

	mouseDown(evt: any) {
		this.mouseStartEvent = evt;
	}

	mouseUp(evt: any) {
		this.mouseStartEvent = null;
		this.mouseMoved = null;
	}

	mouseMove(evt: { clientX: number; clientY: number }) {
		if (this.mouseStartEvent) {
			this.mouseMoveEvt = evt;
			this.mouseMoved = {
				x: evt.clientX - this.mouseStartEvent.clientX,
				y: evt.clientY - this.mouseStartEvent.clientY
			};
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.draw);
		window.removeEventListener('mousemove', this.mouseMove);
		window.removeEventListener('mousedown', this.mouseUp);
		window.removeEventListener('mouseup', this.mouseDown);
		const domObj = document.querySelector(`#${this.state.id}`);
		if (domObj) {
			domObj.innerHTML = '';
		}
	}

	calculateNodeTextSize(text: any, pad: number, $width = null) {
		let div: any = document.querySelector('#secret-div-space' + this.state.id);
		if (true || !div || $width) {
			div = div || document.createElement('div');
			div.id = 'secret-div-space' + this.state.id;
			div.setAttribute('id', 'secret-div-space' + this.state.id);
			div.style.visibility = 'hidden';
			div.style.position = 'absolute';
			div.classList.add('label');
			div.style.whiteSpace = 'normal';
			div.style.maxWidth = $width ? `${$width}px` : (text || '').split(' ').length > 1 ? `300px` : '300px';
			if ($width) {
				div.style.width = `${$width}px`;
			} else {
				div.style.width = '';
			}
			div.style.top = '-10000px';
			div.style.padding = `${pad * 2}px`;
			const statenode = document.querySelector(`#${this.state.id}`);
			if (statenode) {
				statenode.appendChild(div);
			}
		}
		div.innerHTML = text;
		return div.getBoundingClientRect();
	}

	draw() {
		const me = this;
		const domObj: any = document.querySelector(`#${this.state.id}`);

		domObj.innerHTML = '';
		const bb = domObj.getBoundingClientRect();
		const force = Cola.d3adaptor(d3);
		const width = bb.width - 10; // 960;
		const height = bb.height - 10; // 800;
		const color = d3.scaleOrdinal(Object.values(NodeTypeColors) || d3.schemeCategory10);
		me.avoidOverlaps = true;
		const margin = 6;

		const pad = 12;
		force
			.linkDistance(this.props.linkDistance || 280)
			// .symmetricDiffLinkLengths(this.props.linkDistance || 280)
			.avoidOverlaps(me.avoidOverlaps)
			.convergenceThreshold(0.01)
			.handleDisconnected(false)
			.size([ width, height ]);

		const svg = makeSVG();
		function makeSVG() {
			const body = d3.select(`#${me.state.id}`);
			const outer = body.append('svg').attr('width', width).attr('height', height).attr('pointer-events', 'all');
			// define arrow markers for graph links
			// const centerGuid = body.append('div');

			outer
				.append('svg:defs')
				.append('svg:marker')
				.attr('id', 'end-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 5)
				.attr('markerWidth', 3)
				.attr('markerHeight', 3)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,-5L10,0L0,5L2,0')
				.attr('stroke-width', '0px')
				.attr('fill', (d: { properties: { type: string | number } }) => {
					if (
						d &&
						d.properties &&
						d.properties.type &&
						LinkStyles[d.properties.type] &&
						LinkStyles[d.properties.type].stroke
					) {
						return LinkStyles[d.properties.type].stroke;
					}
					return '#ff0000';
				});

			const vis = outer.append('g');
			outer.on('wheel', (d: any) => {
				me.mapScale += d3.event.wheelDelta / (me.props.zoomFactor || 5000);
				redraw();
			});
			function redraw() {
				const { x = 0, y = 0 } = me.mouseMoved || {};
				const ang = angle(1, 0, me.mapTranslate.x + x, me.mapTranslate.y + y);
				vis.attr(
					'transform',
					` scale(${me.mapScale || 1}) translate(${me.mapTranslate.x + x}, ${me.mapTranslate.y + y})`
				);
				body.attr(
					'data-transform',
					`Scale (${me.mapScale || 1}) | (${me.mapTranslate.x + x}x, ${me.mapTranslate.y + y})y`
				);
				// centerGuid.attr(
				// 	'style',
				// 	`position:absolute; top: 10px; left:330px; height: 20px; width:3px; background-color: red; transform:rotate(${Math.abs(
				// 		ang
				// 	)}deg)`
				// );
			}
			outer.on('mousemove', (x: any, v: any) => {
				if (me.panning) {
					redraw();
				}
			});

			outer.on('mousedown', (d: any) => {
				me.panning = true;
			});
			outer.on('mouseup', (d: any) => {
				me.panning = false;

				if (me.mouseMoved && me.mapTranslate) {
					me.mapTranslate = {
						x: me.mapTranslate.x + me.mouseMoved.x,
						y: me.mapTranslate.y + me.mouseMoved.y
					};
				}
			});

			redraw();
			return vis;
		}

		const graph = this.state.graph;

		graph.nodes.forEach((v: { selected: any; width: number; height: number } | any) => {
			const propType = GetNodeProp(v, NodeProperties.NODEType);
			if (me.props && me.props.minimizeTypes) {
				if (!v.selected && me.props.minimizeTypes[propType]) {
					v.width = MIN_DIMENSIONAL_SIZE;
					v.height = MIN_DIMENSIONAL_SIZE;
					return;
				}
			}
			const bb = me.calculateNodeTextSize(
				getLabelText(v),
				pad,
				me.props.typeWidths ? me.props.typeWidths[propType] : null
			);
			v.width = Math.max(MIN_DIMENSIONAL_SIZE, bb.width);
			v.height = Math.max(MIN_DIMENSIONAL_SIZE, bb.height);
		});
		graph.groups.forEach((g: { padding: number }) => {
			g.padding = pad;
		});

		try {
			force.nodes(graph.nodes).groups(graph.groups).links(graph.links).on('tick', tick);
		} catch (e) {
			console.log(e);
			return;
		}
		const group = svg
			.selectAll('.group')
			.data(graph.groups)
			.enter()
			.append('rect')
			.attr('rx', 8)
			.attr('ry', 8)
			.attr('class', 'group')
			.style('fill', (d: any, i: string | number) => Object.values(NodeTypeColors)[i] || color(i))
			.call(force.drag);

		const node = svg.selectAll('.node');
		this.$node = node;
		this.buildNode(graph, force, color);
		const link = svg
			.selectAll('.link')
			.data(graph.links)
			.enter()
			.append('line')
			.attr('class', 'link')
			.style('stroke', (d: { selected: any; properties: { [x: string]: any; type: string } }) => {
				if (d.selected) {
					return '#ff0000';
				}
				if (
					d &&
					d.properties &&
					d.properties.type === LinkType.FunctionConstraintLink &&
					!d.properties[LinkPropertyKeys.VALID_CONSTRAINTS]
				) {
					return LinkStyles[LinkType.ErrorLink].stroke;
				}
				if (
					d &&
					d.properties &&
					d.properties.type &&
					LinkStyles[d.properties.type] &&
					LinkStyles[d.properties.type].stroke
				) {
					return LinkStyles[d.properties.type].stroke;
				}
				return '#000';
			})
			.style('stroke-dasharray', (d: { properties: { [x: string]: any; type: string } }) => {
				if (
					d &&
					d.properties &&
					d.properties.type === LinkType.FunctionConstraintLink &&
					!d.properties[LinkPropertyKeys.VALID_CONSTRAINTS]
				) {
					return '5,5';
				}
				return '';
			})
			.style('d', (d: { properties: { [x: string]: any; type: string } }) => {
				if (
					d &&
					d.properties &&
					d.properties.type === LinkType.FunctionConstraintLink &&
					!d.properties[LinkPropertyKeys.VALID_CONSTRAINTS]
				) {
					return 'M5 20 l215 0';
				}
				return '';
			})
			.style('stroke-width', (d: { properties: { type: string | number }; value: number }) => {
				if (
					d &&
					d.properties &&
					d.properties.type &&
					LinkStyles[d.properties.type] &&
					LinkStyles[d.properties.type].strokeWidth
				) {
					return LinkStyles[d.properties.type].strokeWidth;
				}
				return Math.sqrt(d.value);
			});
		link.on(
			'click',
			(
				d: { id: any; source: { id: any }; target: { id: any } },
				index: string | number,
				els: { [x: string]: { getBoundingClientRect: () => any } }
			) => {
				if (me.props.onLinkClick && d) {
					me.props.onLinkClick(
						{
							id: d.id,
							source: d.source.id,
							target: d.target.id
						},
						els[index].getBoundingClientRect()
					);
				}
			}
		);
		link.on(
			'mouseover',
			(
				d: { id: any; source: { id: any }; target: { id: any } },
				index: string | number,
				els: { [x: string]: { getBoundingClientRect: () => any } }
			) => {
				if (me.props.onLinkHover && d) {
					me.props.onLinkHover(
						{
							id: d.id,
							source: d.source.id,
							target: d.target.id
						},
						els[index].getBoundingClientRect()
					);
				}
			}
		);
		const label = svg
			.selectAll('.label')
			.data(graph.nodes)
			.enter()
			.append('foreignObject')
			.style('overflow', 'visible')
			.attr('class', 'label');
		label.on(
			'click',
			(d: { id: any }, index: string | number, els: { [x: string]: { getBoundingClientRect: () => any } }) => {
				if (me.props.onNodeClick && d && d.id) {
					me.props.onNodeClick(d.id, els[index].getBoundingClientRect());
				}
			}
		);

		const features = svg.selectAll('.features').data(graph.nodes).enter().append('g').attr('class', 'features');

		features
			.append('rect')
			.attr('width', (d: { selected: any }) => (d.selected ? 5 : 0))
			.attr('height', (d: { height: number }) => d.height - 10)
			.attr('x', 3)
			.attr('y', 5)
			.attr('rx', 5)
			.attr('ry', 5)
			.style('fill', (d: { selected: any }) => {
				if (d.selected && me.props.selectedColor) {
					return me.props.selectedColor;
				}
				return color(graph.groups.length);
			});
		features
			.append('rect')
			.attr('width', (d: { marked: any }) => (d.marked ? 15 : 0))
			.attr('height', (d: any) => 15)
			.attr('x', (d: { width: number }) => d.width - 5)
			.attr('y', 5)
			.attr('rx', 5)
			.attr('ry', 5)
			.style('fill', (d: { marked: any }) => {
				if (d.marked && me.props.markedColor) {
					return me.props.markedColor;
				}
				return color(graph.groups.length);
			});
		const topdiv = label.append('xhtml:div').style('pointer-events', 'none');

		topdiv
			.append('xhtml:object')
			.attr('data', (d: { properties: { nodeType: string | number } }) => {
				if (d && d.properties && d.properties.nodeType && NodeTypeColors[d.properties.nodeType]) {
					return GetNodeTypeIcon(d.properties.nodeType);
				}
				return './css/svg/003-cupcake.svg';
			})
			.attr('type', (n: any) => 'image/svg+xml')
			.attr('width', (d: any) => iconSize)
			.attr('height', (d: any) => iconSize)
			.attr('x', 40)
			.attr('y', 40)
			.style('width', 40)
			.style('height', 40);
		const titles = topdiv
			.append('xhtml:div')
			.style('width', (x: { width: number }) => `${x.width - pad / 2}px`)
			.style('white-space', 'normal')
			.style('text-align', 'start')
			// .style('word-break', 'break-all')
			.style('height', (x: { height: number }) => `${x.height - pad / 2}px`)
			.text((d: any) => `${getLabelText(d)}`)
			.call(force.drag);

		this.$force = force;
		this.setState({
			$node: node,
			$color: color
		});

		function getLabelText(d: {
			selected: any;
			properties: { [x: string]: string | number; text: any };
			name: any;
		}) {
			if (!d.selected) {
				if (
					d.properties &&
					me.props.minimizeTypes &&
					me.props.minimizeTypes[d.properties[NodeProperties.NODEType]]
				) {
					return '';
				}
			}
			return d && d.properties ? d.properties.text || d.name : d.name;
		}
		function createRectangle(source: { x: number; width: number; y: number; height: number }) {
			const temp = {
				x: source.x - source.width / 2,
				y: source.y - source.height / 2,
				X: source.x + source.width / 2,
				Y: source.y + source.height / 2
			};

			return new Cola.Rectangle(temp.x, temp.X, temp.y, temp.Y);
		}
		function rotate(
			source: { x: any; width?: any; y: any; height?: any; innerBounds?: any },
			degree = Math.PI / 2
		) {
			let { innerBounds, x, y } = source;
			if (!innerBounds) {
				innerBounds = {
					x: source.x - source.width / 2,
					y: source.y - source.height / 2,
					X: source.x + source.width / 2,
					Y: source.y + source.height / 2
				};
			}
			const rise = innerBounds.y - innerBounds.Y;
			const run = innerBounds.x - innerBounds.X;

			return Object.assign(innerBounds, {
				x: 1 + innerBounds.x,
				y: rise ? run / rise * 1 + innerBounds.y : innerBounds.y,
				X: 1 + innerBounds.X,
				Y: rise ? run / rise * 1 + innerBounds.Y : innerBounds.Y
			});
		}

		function tick() {
			if (me.$_nodes) {
				me.$_nodes.each(
					(
						d:
							| {
									properties: { [x: string]: any };
									selected: any;
									width: number;
									height: number;
									innerBounds: any;
									bounds: { inflate: (arg0: number) => any };
								}
							| any
					) => {
						let propType = d.properties[NodeProperties.NODEType];
						const bb = me.calculateNodeTextSize(
							getLabelText(d),
							pad,
							me.props.typeWidths ? me.props.typeWidths[propType] : null
						);
						if (!d.selected && d.properties && me.props.minimizeTypes && me.props.minimizeTypes[propType]) {
							d.width = MIN_DIMENSIONAL_SIZE;
							d.height = MIN_DIMENSIONAL_SIZE;
						} else {
							d.width = Math.max(MIN_DIMENSIONAL_SIZE, bb.width);
							d.height = Math.max(MIN_DIMENSIONAL_SIZE, bb.height);
						}
						if (me.avoidOverlaps) d.innerBounds = d.bounds.inflate(-margin);
					}
				);
			}

			if (me.$_nodes) {
				me.$_nodes
					.attr('width', (d: { selected: any; properties: { [x: string]: string | number }; width: any }) => {
						if (
							!d.selected &&
							d.properties &&
							me.props.minimizeTypes &&
							me.props.minimizeTypes[d.properties[NodeProperties.NODEType]]
						) {
							return MIN_DIMENSIONAL_SIZE;
						}
						return d.width;
					})
					.attr(
						'height',
						(d: { selected: any; properties: { [x: string]: string | number }; height: any }) => {
							if (
								!d.selected &&
								d.properties &&
								me.props.minimizeTypes &&
								me.props.minimizeTypes[d.properties[NodeProperties.NODEType]]
							) {
								return MIN_DIMENSIONAL_SIZE;
							}
							return d.height;
						}
					)
					.attr(
						'x',
						(d: {
							selected: any;
							properties: { [x: string]: string | number };
							x: number;
							width: number;
						}) => {
							if (
								!d.selected &&
								d.properties &&
								me.props.minimizeTypes &&
								me.props.minimizeTypes[d.properties[NodeProperties.NODEType]]
							) {
								return d.x - MIN_DIMENSIONAL_SIZE / 2;
							}
							return d.x - d.width / 2;
						}
					)
					.attr(
						'y',
						(d: {
							selected: any;
							properties: { [x: string]: string | number };
							y: number;
							height: number;
						}) => {
							if (
								!d.selected &&
								d.properties &&
								me.props.minimizeTypes &&
								me.props.minimizeTypes[d.properties[NodeProperties.NODEType]]
							) {
								return d.y - MIN_DIMENSIONAL_SIZE / 2;
							}
							return d.y - d.height / 2;
						}
					);
			}
			// if (me.avoidOverlapss)
			group
				.attr(
					'x',
					(d: {
						bounds: { x: any };
						leaves: {
							minimum: (arg0: (x: any) => number) => any;
							maximum: (arg0: (x: any) => any) => any;
							summation: (arg0: (x: any) => any) => number;
							length: number;
						};
					}) => {
						if (!d.bounds) {
							const min = d.leaves.minimum((x: { x: number; width: number }) => x.x - x.width / 2);
							const max = d.leaves.maximum((x: { x: number; width: number }) => x.x + x.width / 2);
							const width = max - min;
							return d.leaves.summation((x: { x: any }) => x.x) / d.leaves.length - width / 2;
						}
						return d.bounds.x;
					}
				)
				.attr(
					'y',
					(d: {
						bounds: { y: any };
						leaves: {
							minimum: (arg0: (x: any) => number) => any;
							maximum: (arg0: (x: any) => any) => any;
							summation: (arg0: (x: any) => any) => number;
							length: number;
						};
					}) => {
						if (!d.bounds) {
							const min = d.leaves.minimum((x: { y: number; height: number }) => x.y - x.height / 2);
							const max = d.leaves.maximum((x: { y: number; height: number }) => x.y + x.height / 2);
							const height = max - min;
							return d.leaves.summation((x: { y: any }) => x.y) / d.leaves.length - height / 2;
						}
						return d.bounds.y;
					}
				)
				.attr(
					'width',
					(d: {
						bounds: { width: () => any };
						leaves: { minimum: (arg0: (x: any) => number) => any; maximum: (arg0: (x: any) => any) => any };
					}) => {
						if (!d.bounds) {
							const min = d.leaves.minimum((x: { x: number; width: number }) => x.x - x.width / 2);
							const max = d.leaves.maximum((x: { x: number; width: number }) => x.x + x.width / 2);
							return max - min;
						}
						return d.bounds.width();
					}
				)
				.attr(
					'height',
					(d: {
						bounds: { height: () => any };
						leaves: { minimum: (arg0: (x: any) => number) => any; maximum: (arg0: (x: any) => any) => any };
					}) => {
						if (!d.bounds) {
							const min = d.leaves.minimum((x: { y: number; height: number }) => x.y - x.height / 2);
							const max = d.leaves.maximum((x: { y: number; height: number }) => x.y + x.height / 2);
							return max - min;
						}
						return d.bounds.height();
					}
				);

			link.each(
				(d: {
					route: { sourceIntersection: Cola.Point; targetIntersection: Cola.Point; arrowStart: Cola.Point };
					source: any;
					target: any;
				}) => {
					//  d.route = Cola.makeEdgeBetween(rotate(d.source), rotate(d.target, -Math.PI / 2), 5);
					if (!me.avoidOverlaps) {
						d.route = Cola.makeEdgeBetween(createRectangle(d.source), createRectangle(d.target), 5);
					} else {
						d.route = Cola.makeEdgeBetween(rotate(d.source), rotate(d.target, 0), 5);
					}
				}
			);

			link
				.attr('x1', (d: { route: { sourceIntersection: { x: any } } }) => d.route.sourceIntersection.x)
				.attr('y1', (d: { route: { sourceIntersection: { y: any } } }) => d.route.sourceIntersection.y)
				.attr('x2', (d: { route: { arrowStart: { x: any } } }) => d.route.arrowStart.x)
				.attr('y2', (d: { route: { arrowStart: { y: any } } }) => d.route.arrowStart.y);

			features.attr('transform', (d: { y: number; height: number; x: number; width: number }) => {
				const y = d.y - d.height / 2;
				const x = d.x - d.width / 2;
				return `translate(${x},${y})`;
			});

			label
				.attr('x', (d: { x: number; width: number }) => d.x - d.width / 2)
				.attr('y', function(d: { y: number; height: number }) {
					const innerbit = this.querySelector('div');
					const h = innerbit ? innerbit.getBoundingClientRect().height : 0;

					return d.y + h / 2 - d.height + -pad / 2 - iconSize;
				});
		}
		const initialUnconstrainedIterations = 100;
		const initialUserConstraintIterations = 15;
		const initialAllConstraintsIterations = 20;
		const gridSnapIterations = null;
		const keepRunning = true;
		force.start(null, null, null, null, true);

		this.hasStarted = true;
	}

	buildNode(
		graph: { groups: string | any[] },
		cola: Cola.Layout & Cola.ID3StyleLayoutAdaptor,
		color: (arg0: any) => any
	) {
		const me = this;
		const node = this.$node.data(cola.nodes(), (x: { id: any; name: any }) => x.id || x.name);
		const temp = node
			.enter()
			.append('rect')
			.attr('class', 'node')
			.attr('width', (d: { width: any }) => d.width)
			.attr('height', (d: { height: any }) => d.height)
			.attr('rx', 5)
			.attr('ry', 5)
			.style('fill', (d: { properties: { nodeType: string | number }; id: any }) => {
				if (d && d.properties && d.properties.nodeType) {
					const uiType = d.id ? GetNodeProp(d.id, NodeProperties.UIType) : null;
					return UITypeColors[uiType] || NodeTypeColors[d.properties.nodeType] || '#ff0000';
				}

				return color(graph.groups.length);
			})
			.on(
				'click',
				(
					d: { id: any },
					index: string | number,
					els: { [x: string]: { getBoundingClientRect: () => any } }
				) => {
					if (me.props.onNodeClick && d) {
						me.props.onNodeClick(d.id, els[index].getBoundingClientRect());
					}
				}
			)
			.call(cola.drag);

		node.exit().remove();
		this.$_nodes = temp;
	}

	applyNodeVisualData(nn: { width: number; height: number; name: any; id: any; fixed: boolean }) {
		nn.width = 40;
		nn.height = 40;
		nn.name = nn.id;
		nn.fixed = false;
		return nn;
	}

	componentWillReceiveProps(
		props: { graph: any; selectedNodes?: any; markedNodes?: any; selectedLinks?: any },
		state: any
	) {
		if (GraphMethods.Paused()) {
			return;
		}
		if (props.graph) {
			// const graphVersion = GraphMethods.GetAppCacheVersion();
			// if (graphVersion === version) {
			// 	if (mapSelectedNodes && props.selectedNodes.length === mapSelectedNodes.length) {
			// 		if ([ ...props.selectedNodes, ...mapSelectedNodes ].unique().length === mapSelectedNodes.length) {
			// 			if (mapSelectedLinks && props.selectedLinks.length === mapSelectedLinks.length) {
			// 				if (
			// 					[ ...props.selectedLinks, ...mapSelectedLinks ].unique().length ===
			// 					mapSelectedLinks.length
			// 				) {
			// 					return;
			// 				}
			// 			}
			// 		}
			// 	}
			// }
			// version = graphVersion;
			mapSelectedNodes = props.selectedNodes;
			if (props.graph) {
				const { graph } = props;
				let draw = true;
				// d3.event.stopPropagation();
				this.$force.stop();
				if (graph.nodes && this.state && this.state.graph && this.state.graph.nodes) {
					const removedNodes = this.state.graph.nodes
						.relativeCompliment(graph.nodes, (x: { id: any }, y: any) => x.id === y)
						.map((t: any) => this.state.graph.nodes.indexOf(t));
					this.state.graph.nodes.removeIndices(removedNodes);
					const newNodes = graph.nodes.relativeCompliment(
						this.state.graph.nodes,
						(x: any, y: { id: any }) => x === y.id
					);
					let unanchored: any = {};
					if (props.selectedNodes) {
						props.selectedNodes.forEach((t: any) => {
							unanchored = {
								...unanchored,
								...GraphMethods.GetLinkedNodes(null, { id: t })
							};
						});
					}
					if (this.props.positionPinning)
						this.state.graph.nodes.forEach((v: { id: string | number; fixed: boolean }) => {
							if (!unanchored[v.id]) {
								v.fixed = true;
							} else {
								v.fixed = false;
							}
						});

					newNodes.map((nn: string | number) => {
						this.state.graph.nodes.push(
							this.applyNodeVisualData(GraphMethods.duplicateNode(graph.nodeLib[nn]))
						);
					});
					if (props.markedNodes) {
						this.state.graph.nodes.map((nn: { marked: boolean; id: any }) => {
							nn.marked = !!props.markedNodes.find((t: any) => t == nn.id);
						});
					}
					if (props.selectedNodes) {
						this.state.graph.nodes.map((nn: { selected: boolean; id: any }) => {
							nn.selected = !!props.selectedNodes.find((t: any) => t == nn.id);
						});
					}
					this.state.graph.nodes.map((nn: { id: string | number; properties: any }) => {
						const nl = graph.nodeLib[nn.id];
						if (nl && nl.properties) {
							nn.properties = { ...nl.properties };
						}
					});

					draw = draw || newNodes.length || removedNodes.length;
				}
				if (graph.links && this.state && this.state.graph && this.state.graph.links) {
					const removedLinks = this.state.graph.links
						.relativeCompliment(graph.links, (x: { id: any }, y: any) => x.id === y)
						.map((t: any) => this.state.graph.links.indexOf(t));
					this.state.graph.links.removeIndices(removedLinks);
					const newLinks = graph.links.relativeCompliment(
						this.state.graph.links,
						(x: any, y: { id: any }) => x === y.id
					);
					newLinks.map((nn: string | number) => {
						this.state.graph.links.push(duplicateLink(graph.linkLib[nn], this.state.graph.nodes));
					});
					if (props.selectedLinks) {
						this.state.graph.links.map((nn: { selected: boolean; id: any }) => {
							nn.selected = !!props.selectedLinks.find((t: { id: any }) => t.id === nn.id);
						});
					}
					this.state.graph.links.map((nn: { id: string | number; properties: any }) => {
						const nl = graph.linkLib[nn.id];
						if (nl && nl.properties) {
							nn.properties = { ...nl.properties };
						}
					});
					draw = draw || newLinks.length || removedLinks.length;
				}

				if (graph.groups && this.state && this.state.graph && this.state.graph.groups) {
					const graph_groups = (graph.$vGroups || graph.groups)
						.filter(
							(x: string | number) =>
								graph.groupLib[x] && (graph.groupLib[x].leaves || graph.groupLib[x].groups)
						);

					let removedGroups = null;
					if (this.props.groupsDisabled) {
						removedGroups = [].interpolate(0, this.state.graph.groups.length, (x: any) => x);
					} else {
						removedGroups = this.state.graph.groups
							.relativeCompliment(graph_groups, (x: { id: any }, y: any) => x.id === y)
							.map((t: any) => this.state.graph.groups.indexOf(t));
					}
					this.state.graph.groups.removeIndices(removedGroups);
					if (!this.props.groupsDisabled) {
						const newGroups = graph_groups
							.relativeCompliment(this.state.graph.groups, (x: any, y: { id: any }) => x === y.id)
							.filter(
								(x: string | number) =>
									graph.groupLib[x] && (graph.groupLib[x].leaves || graph.groupLib[x].groups)
							);
						newGroups.map((nn: any) => {
							this.state.graph.groups.push(duplicateGroup(graph.groupLib[nn]));
						});
						let toremove: any[] = [];
						graph_groups.forEach((group: any) => {
							const g = this.state.graph.groups.find((x: { id: any }) => x.id === group);
							let ok: boolean = applyGroup(
								g,
								graph.groupLib[group],
								this.state.graph.groups,
								this.state.graph.nodes
							);
							if (!ok) {
								toremove.push(this.state.graph.groups.indexOf(g));
							}
							// (duplicateGroup(graph.groupLib[nn], this.state.graph.nodes))
						});
						this.state.graph.groups.removeIndices(toremove);
					}

					// this.state.graph.groups.map(group => {
					//     var _group = graph.groupLib[group.id];
					// })
				}
				if (draw) {
					this.draw();
				}
			}
		}
	}

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<div
				id={this.state.id}
				className="mindmap"
				style={{ background: 'white', minHeight: this.props.minHeight || 300 }}
			/>
		);
	}
}

function duplicateLink(nn: { source: any; target: any }, nodes: any[]) {
	return {
		...nn,
		source: nodes.findIndex((x: { id: any }) => x.id === nn.source),
		target: nodes.findIndex((x: { id: any }) => x.id === nn.target)
	};
}
function applyGroup(mindmapgroup: any, lib_group: any, groups: any, nodes: any) {
	if (lib_group) {
		if (lib_group.leaves && lib_group.leaves.length) {
			mindmapgroup.leaves = mindmapgroup.leaves || [];
			mindmapgroup.leaves.length = 0;
			lib_group.leaves.map((l: any) => {
				let res = nodes.findIndex((x: any) => x.id === l);
				if (res !== -1 && mindmapgroup.leaves.indexOf(res) === -1) {
					mindmapgroup.leaves.push(res);
				}
			});
		} else {
			delete mindmapgroup.leaves;
		}

		if (lib_group.groups && lib_group.groups.length) {
			mindmapgroup.groups = mindmapgroup.groups || [];
			mindmapgroup.groups.length = 0;
			lib_group.groups.forEach((l: any) => {
				let res = groups.findIndex((x: any) => x.id === l);
				if (res !== -1 && mindmapgroup.groups.indexOf(res) === -1) {
					mindmapgroup.groups.push(res);
				}
			});
			// mindmapgroup.groups.push(..._group.groups.map((l) => groups.findIndex((x) => x.id === l)));
		} else {
			delete mindmapgroup.groups;
		}
		if (
			!(mindmapgroup.groups && mindmapgroup.groups.length) &&
			!(mindmapgroup.leaves && mindmapgroup.leaves.length)
		) {
			return false;
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
	return true;
}
function duplicateGroup(nn: any) {
	const temp = {
		...nn
	};
	delete temp.leaves;
	delete temp.groups;
	return temp;
}
const throttle = (func: { apply: (arg0: any, arg1: IArguments) => void }, limit: number) => {
	let inThrottle: boolean;
	return function() {
		const args = arguments;
		const context = this;
		if (!inThrottle) {
			func.apply(context, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
};

function angle(cx: number, cy: number, ex: number, ey: number) {
	let vect1 = new Vector(ex, ey, 0);
	vect1 = vect1.normalisedVector();
	ex = vect1.getX();
	ey = vect1.getY();
	const dy = ey - cy;
	const dx = ex - cx;
	let theta = Math.atan2(dy, dx); // range (-PI, PI]
	theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
	return theta;
}

var Vector = (function() {
	function Vector(pX: number, pY: number, pZ: number) {
		this.setX(pX);
		this.setY(pY);
		this.setZ(pZ);
	}
	Vector.prototype.getX = function() {
		return this.mX;
	};
	Vector.prototype.setX = function(pX: any) {
		this.mX = pX;
	};
	Vector.prototype.getY = function() {
		return this.mY;
	};
	Vector.prototype.setY = function(pY: any) {
		this.mY = pY;
	};
	Vector.prototype.getZ = function() {
		return this.mZ;
	};
	Vector.prototype.setZ = function(pZ: any) {
		this.mZ = pZ;
	};

	Vector.prototype.add = function(v: { getX: () => any; getY: () => any; getZ: () => any }) {
		return new Vector(this.getX() + v.getX(), this.getY() + v.getY(), this.getZ() + v.getZ());
	};

	Vector.prototype.subtract = function(v: { getX: () => number; getY: () => number; getZ: () => number }) {
		return new Vector(this.getX() - v.getX(), this.getY() - v.getY(), this.getZ() - v.getZ());
	};

	Vector.prototype.multiply = function(scalar: number) {
		return new Vector(this.getX() * scalar, this.getY() * scalar, this.getZ() * scalar);
	};

	Vector.prototype.divide = function(scalar: number) {
		return new Vector(this.getX() / scalar, this.getY() / scalar, this.getZ() / scalar);
	};

	Vector.prototype.magnitude = function() {
		return Math.sqrt(this.getX() * this.getX() + this.getY() * this.getY() + this.getZ() * this.getZ());
	};

	// this is the vector I have tried for the normalisation
	Vector.prototype.normalisedVector = function() {
		const vec = new Vector(this.getX(), this.getY(), this.getZ());
		return vec.divide(this.magnitude());
	};
	return Vector;
})();
