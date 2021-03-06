import { LoadGraph } from '../../app/methods/storeGraph';
import { Graph, Node, GraphLink } from '../../app/methods/graph_types';
import { CityLayoutGrid, DistanceType } from './citylayoutgrid';
import { Coordinate } from './coordinate';
import { GetNodesLinkedTo, GetLinkBetween, GetNode, GetNodesByProperties, NodesByType, GetNodeProp } from '../../app/methods/graph_methods';
import { GetLinkProperty, GetNodeTitle } from '../../app/actions/uiActions';
import { LinkPropertyKeys, NodeProperties, NodeTypes } from '../../app/constants/nodetypes';
import Springy from './springy';
import fs from 'fs';
import unprune from '../../app/methods/unprune';
const readline = require('readline');

export default async function Visualize(file: string) {
	let graph: Graph = await LoadGraph(file);
	graph = unprune(graph);

	console.log('loaded graph');
	let cache = {};
	let res = BuildSections(graph, cache);
	console.log(res);
	console.log(`graph.nodeCount: ${graph.nodeCount}`);
	let types = {}
	let others = {};
	Object.keys(graph.nodeLib).filter((v) => !cache[v]).forEach((id) => {
		types[GetNodeProp(graph.nodeLib[id], NodeProperties.NODEType)] = types[GetNodeProp(graph.nodeLib[id], NodeProperties.NODEType)] || 0
		types[GetNodeProp(graph.nodeLib[id], NodeProperties.NODEType)]++;
		others[id] = {
			type: GetNodeProp(graph.nodeLib[id], NodeProperties.NODEType),
			name: GetNodeTitle(graph.nodeLib[id])
		}
	});
	let totalLeftOver = 0;
	Object.entries(types).map((v: any) => {
		console.log(`${v[0]}: ${v[1]}`)
		totalLeftOver += v[1];
	});
	console.log(`totalLeftOver : ${totalLeftOver}`)
	fs.writeFileSync('./vis_out.json', JSON.stringify({ sectioned: cache, others }, null, 4), 'utf-8')
	// let sortedList = GetNodesWithMostConnection(graph, cache)

	// let popularNodes = []
	// let i = -1;
	// do {
	// 	i++;
	// 	let node = GetNode(graph, sortedList[i]);
	// 	console.log(`${GetNodeTitle(node)}: ${cache[sortedList[i]]}`)
	// 	popularNodes.push(sortedList[i])

	// }
	// while (sortedList[i] && cache[sortedList[i]] > 1);

	// let outsiderNodes = GetNodesNotLinkedTo(graph, popularNodes);
	// console.log(`outsider nodes ${outsiderNodes.length}`)
	// console.log('create city layout grid')
	// let cityLayoutGrid = CreateCityLayoutGrid(graph);

	// console.log('apply nodes to grid')
	// cityLayoutGrid = ApplyNodesToGrid(cityLayoutGrid, graph);

	// // let result = Anneal(cityLayoutGrid, graph, {
	// // 	T: 2,
	// // 	kMax: 100000,
	// // 	swap: graph.nodes.length / 2
	// // });
	// // console.log(Springy);
	// console.log('Force Direct')
	// ForceDirect(graph, 100000);
	// console.log('Calculate forces')
	// let forces = calculateForces(cityLayoutGrid, graph);
	// for (var i = 0; i < 1000; i++) {
	// 	console.log(`${i}/${1000}  :  ${(i / 1000) * 100}`)
	// 	forces = calculateForces(cityLayoutGrid, graph, forces);
	// }

	// let newstress: number = MeasureStress(result, graph);
	// writeLine(`new stress : ${newstress}`);
}
interface SectionSearch {
	type: string;
	deep?: boolean
	sub?: SectionSearch[]
}
function BuildSections(graph: Graph, cache) {
	let sections: SectionSearch[] = [{
		type: NodeTypes.Screen,
		sub: [
			{
				type: NodeTypes.ScreenOption,
				sub: [{ type: NodeTypes.ComponentApi },
				{
					type: NodeTypes.ComponentNode,
					deep: true,
					sub: [{
						type: NodeTypes.EventMethod,
						sub: [{
							type: NodeTypes.EventMethodInstance,
							sub: [{ type: NodeTypes.UIMethod },
							{ type: NodeTypes.NavigationAction },
							{ type: NodeTypes.EventHandler }]
						}]
					},
					{ type: NodeTypes.ComponentApi },
					{ type: NodeTypes.DataSource },
					{ type: NodeTypes.MenuDataSource },
					{ type: NodeTypes.ComponentExternalApi },
					{ type: NodeTypes.Style },
					{ type: NodeTypes.DataChainCollection },
					{ type: NodeTypes.DataChain, deep: true }]
				},
				{ type: NodeTypes.ComponentExternalApi },
				{ type: NodeTypes.ViewModel },
				{
					type: NodeTypes.DataChainCollection,
					sub: [{ type: NodeTypes.DataChain, deep: true }]
				},
				{
					type: NodeTypes.LifeCylceMethod,
					sub: [{
						type: NodeTypes.LifeCylceMethodInstance,
						sub: [{
							type: NodeTypes.ComponentApiConnector,
							sub: [{
								type: NodeTypes.MethodApiParameters,
								sub: [{ type: NodeTypes.MethodApiParameters }]
							}]
						}]
					}]
				}]
			},
			{ type: NodeTypes.ComponentApi, sub: [{ type: NodeTypes.ComponentApiConnector }] },
			{ type: NodeTypes.ComponentExternalApi },
			{ type: NodeTypes.ViewModel },
			{ type: NodeTypes.DataChainCollection }
		]
	}, {
		type: NodeTypes.Model,
		sub: [{
			type: NodeTypes.Property,
			sub: [{ type: NodeTypes.Attribute },
			{ type: NodeTypes.DataChain, deep: true },
			{ type: NodeTypes.Enumeration }]
		}]
	}, {
		type: NodeTypes.Controller,
		sub: [{
			type: NodeTypes.Maestro,
			sub: [{
				type: NodeTypes.Method,
				sub: [
					{ type: NodeTypes.DataChain, deep: true },
					{ type: NodeTypes.ModelItemFilter, sub: [{ deep: true, type: NodeTypes.DataChain }] },
					{ type: NodeTypes.Permission, sub: [{ deep: true, type: NodeTypes.DataChain }] },
					{
						deep: true, type: NodeTypes.PermissionDataChain,
						sub: [{ deep: true, type: NodeTypes.DataChain }
						]
					}, {
						type: NodeTypes.Executor,
						sub: [{
							type: NodeTypes.ExecutionDataChain,
							sub: [{ type: NodeTypes.DataChain }]
						},
						{ type: NodeTypes.DataChain }]
					}, {
						type: NodeTypes.MethodApiParameters
					}]
			}]
		}]
	}, {
		type: NodeTypes.AgentAccessDescription,
		sub: [{
			type: NodeTypes.NavigationScreen,
			sub: [{ type: NodeTypes.MenuDataSource, sub: [{ type: NodeTypes.DataChain }] }]
		}, {
			type: NodeTypes.ComponentDidMountEffectApi,
			sub: [{ type: NodeTypes.DataChain, sub: [{ type: NodeTypes.ContextualParameters }] }]
		}]
	}, {
		type: NodeTypes.ClaimService,
		sub: [{ type: NodeTypes.Method }]
	}, {
		type: NodeTypes.NavigationScreen,
		sub: [{ type: NodeTypes.MenuDataSource, sub: [{ type: NodeTypes.DataChain }] }]
	}, {
		type: NodeTypes.ComponentDidMountEffectApi,
		sub: [{ type: NodeTypes.DataChain, sub: [{ type: NodeTypes.ContextualParameters }] }]
	}, {
		type: NodeTypes.ComponentNode,
		deep: true,
		sub: [{
			type: NodeTypes.EventMethod,
			sub: [{
				type: NodeTypes.EventMethodInstance,
				sub: [{ type: NodeTypes.UIMethod },
				{ type: NodeTypes.NavigationAction },
				{ type: NodeTypes.EventHandler }]
			}]
		},
		{ type: NodeTypes.ComponentApi },
		{ type: NodeTypes.DataSource },
		{ type: NodeTypes.MenuDataSource },
		{ type: NodeTypes.ComponentExternalApi },
		{ type: NodeTypes.Style },
		{ type: NodeTypes.DataChainCollection },
		{ type: NodeTypes.DataChain, deep: true }]
	}, {
		type: NodeTypes.DataChain, deep: true
	}];

	return buildSections(sections, graph, cache);
}
function buildSections(sections: SectionSearch[], graph: Graph, bucket: {
	[str: string]: {
		type: string,
		parent?: string,
		sectionType?: string,
		id: string,
		count: number,
		parentPath?: string[],
		name: string,
		connectionCount: number
	}
}, parentId?: string, parentPath?: string[], depth?: number) {
	let sectionResults: any = {
		parent: parentId || null,
		children: [],
		sections: [],
		totals: {}
	};
	depth = depth || 0;
	let total = 0;
	depth++;
	console.log(`depth: ${depth}`)


	sections.forEach((section: SectionSearch, index: number) => {
		let nodes = []
		if (!parentId) {
			parentPath = [section.type]
			sectionResults.$sectionTypes = sectionResults.$sectionTypes || [];
			sectionResults.$sectionTypes.push(section.type);
		}
		if (!parentId) {
			nodes = NodesByType(graph, section.type,);
		}
		else {
			nodes = GetNodesLinkedTo(graph, {
				componentType: section.type,
				id: parentId
			});
		}
		nodes = nodes.filter(v => !bucket[v.id])
		nodes.forEach((node: Node) => {
			let childrenTotal = 0;

			bucket[node.id] = {
				id: node.id,
				count: childrenTotal,
				sectionType: !parentId ? section.type : null,
				parent: parentId,
				name: GetNodeTitle(node),
				parentPath,
				type: GetNodeProp(node, NodeProperties.NODEType),
				connectionCount: GetNodesLinkedTo(graph, { id: node.id }).length
			};
			if (section.sub) {
				let tempRes = buildSections(section.sub, graph, bucket, node.id, [...parentPath, node.id], depth);
				if (tempRes.total) {
					total += tempRes.total;
					bucket[node.id].count += tempRes.total;
					sectionResults.sections.push(tempRes);
				}
			}
			if (section.deep) {
				let tempRes = buildSections([section], graph, bucket, node.id, [...parentPath, node.id], depth);
				if (tempRes.total) {
					total += tempRes.total;
					bucket[node.id].count += tempRes.total;
					sectionResults.sections.push(tempRes);
				}
			}

		})


		total += nodes.length;
	})
	sectionResults.total = total;
	return sectionResults;
}

function GetNodesNotLinkedTo(graph, popularNodes: string[]) {
	let allNodes = Object.values(graph.nodeLib).map((v: Node) => v.id);
	popularNodes.map((a: string) => {
		let connectedNodes = GetNodesLinkedTo(graph, { id: a });
		allNodes = allNodes.filter(v => {
			return !connectedNodes.some(b => b.id === v)
		})
	});
	return allNodes;
}
function GetNodesWithMostConnection(graph: Graph, cache: any) {

	return Object.values(graph.nodeLib).map((a: Node) => {
		let count = GetNodesLinkedTo(graph, { id: a.id }).length
		cache[a.id] = count;
		return a.id
	}).sort((b, a) => {
		return cache[a] - cache[b]
	})
}
function ForceDirect(graph: Graph, loops: number) {
	var sgraph = new Springy.Graph();
	// make some nodes
	let nodes = {};
	console.log('create nodes')
	graph.nodes.forEach((id: string) => {
		var spruce = sgraph.newNode({
			id,
			label: id,
			data: {
				mass: GetNodesLinkedTo(graph, { id }).length + 1
			}
		});
		nodes[id] = spruce;
	});
	console.log('creating edges')
	graph.links.forEach((link: string) => {
		let linkObj = graph.linkLib[link];
		sgraph.newEdge(nodes[linkObj.source], nodes[linkObj.target]);
	});

	// connect them with an edge
	console.log('init layout')
	var layout = new Springy.Layout.ForceDirected(
		sgraph,
		3.0, // Spring stiffness
		3.0, // Node repulsion
		0.5 // Damping
	);
	for (var i = 0; i < loops; i++) {
		console.log(`${i}/${loops}  :  ${(i / loops) * 100}`)
		layout.tick(1 / 30);
	}
	layout.eachNode(function (node, point) {
		// t.drawNode(node, point.p);
		console.log(node);
		console.log(point.p);
	});
	let energy = layout.totalEnergy();
	console.log(`energy ${energy}`);
}

interface Forces {
	[node: string]: Force;
}
interface Force {
	x: number;
	y: number;
	xv: number;
	yv: number;
	mass: number;
	spring_length: number;
	stiffness: number;
	damping: number;
}

function calculateForces(layout: CityLayoutGrid, graph: Graph, forces?: Forces): Forces {
	let generateInitial = false;
	let frameRate = 1 / 30;
	if (!forces) {
		generateInitial = true;
	}
	forces = forces || {};
	if (generateInitial) {
		Object.keys(layout.coords).forEach((id: string) => {
			let len = GetNodesLinkedTo(graph, { id }).length;
			forces[id] = {
				...layout.coords[id],
				xv: 0,
				yv: 0,
				mass: len + 1,
				spring_length: 180,
				stiffness: -20,
				damping: -0.5
			};
		});
	}

	Object.keys(forces).forEach((id: string) => {
		let k = forces[id].stiffness;
		let b = forces[id].damping;
		let spring_length = forces[id].spring_length;
		let connected_nodes = GetNodesLinkedTo(graph, { id });
		connected_nodes.forEach((node: Node) => {
			let wall = forces[node.id];
			let block = forces[id];

			let F_springX = k * (block.x - wall.x - spring_length);
			let F_springY = k * (block.y - wall.y - spring_length);
			let F_damperX = b * (block.xv - wall.xv);
			let F_damperY = b * (block.yv - wall.yv);

			var aX = (F_springX + F_damperX) / block.mass;
			var aY = (F_springY + F_damperY) / block.mass;

			block.xv += aX * frameRate;
			block.yv += aY * frameRate;

			block.x += block.xv * frameRate;
			block.y += block.yv * frameRate;
			console.log(block);
		});
	});

	return forces;
}

function Anneal(layout: CityLayoutGrid, graph: Graph, options: AnnealOptions) {
	let currentLayout = layout;
	let lowest: number | null = null;
	let lowestLayout: CityLayoutGrid | null = null;
	let tenPercent = Math.floor(options.kMax / 100);
	for (var i = 0; i < options.kMax; i++) {
		let stress: number = MeasureStress(currentLayout, graph);
		let newlayout = SwapItems(layout, graph, Math.ceil(options.swap * (i / options.kMax)));
		let newstress: number = MeasureStress(newlayout, graph);
		let difference = (newstress - stress) / stress;
		let rand = Math.random();
		if (lowest == null) {
			lowest = Math.min(newstress, stress);
			lowestLayout = newlayout;
		} else {
			if (lowest > newstress) {
				lowest = newstress;
				lowestLayout = newlayout;
			} else if (lowest > stress) {
				lowest = stress;
			}
		}
		if (i % tenPercent === 0 && lowest) {
			if (stress > lowest) {
				currentLayout = lowestLayout;
			}
		} else if (difference < 0) {
			// writeLine(`${difference} < 0`);
			// writeLine(`lowest: ${lowest} current stress : ${newstress} , ${newstress - stress} ${difference} < 0 \r`);
			currentLayout = newlayout;
			writeLine(`lowest: ${Math.round(lowest)} ${i} current stress : ${Math.round(newstress)} \r`);
		} else {
			let temp = Math.pow((options.kMax - i + 1) / options.kMax, options.T) * (1 - difference);
			//  Math.exp(-(1 - (maxDistance - temp) / maxDistance));
			if (temp > rand) {
				currentLayout = newlayout;
				writeLine(
					`lowest: ${Math.round(lowest)} ${i} current stress : ${Math.round(newstress)} , temp:${temp}\r`
				);
			}
		}
	}

	return lowestLayout;
}
function SwapItems(layout: CityLayoutGrid, graph: Graph, num: number) {
	let newlayout = duplicateLayout(layout);
	for (var i = 0; i < num; i++) {
		SwapItem(newlayout, graph);
	}
	return newlayout;
}
function createCoords(x: number, y: number): Coordinate {
	return {
		x,
		y
	};
}

function SwapItem(layout: CityLayoutGrid, graph: Graph, mainNodeIndex?: number | null) {
	let keys = Object.keys(layout.coords);
	if (true) {
		let usedOtherNode = false;
		if (mainNodeIndex == null) mainNodeIndex = Math.floor(Math.random() * graph.nodes.length);
		let mainNode = graph.nodes[mainNodeIndex];
		let linkedNodes = GetNodesLinkedTo(graph, {
			id: mainNode
		})
			.filter((v) => v.id !== mainNode)
			.sort((b: Node, a: Node) => {
				return getDistance(mainNode, a.id, layout) - getDistance(mainNode, b.id, layout);
			});

		let linkedNode = null;
		linkedNode = linkedNodes.map((v) => v.id)[0];

		let notLinked = graph.nodes
			.filter((v) => v !== mainNode)
			.filter(
				(v: string) =>
					!linkedNodes.find((c: Node) => {
						return c.id === v;
					})
			)
			.sort((a: string, b: string) => {
				return getDistance(mainNode, a, layout) - getDistance(mainNode, b, layout);
			});

		let notLinkedNode = notLinked[0];
		if (
			!notLinkedNode ||
			!linkedNode // ||
			//	getDistance(mainNode, linkedNode, layout) < getDistance(mainNode, notLinkedNode, layout)
		) {
			// console.log(
			// 	`linkedNodes: ${linkedNodes.length}/ mainNodeIndex: ${mainNodeIndex} / notLinked: ${notLinked.length}
			//   `
			// );
			// throw new Error('ok');
			return;
		}
		// console.log(
		// 	`distance: O: ${getDistance(mainNode, othernode, layout)} <-> N: ${getDistance(mainNode, node, layout)}   `
		// );

		let xy1 = layout.coords[notLinkedNode];
		let xy2 = layout.coords[linkedNode];

		let x1 = xy1.x; // Math.floor(Math.random() * layout.width);
		let y1 = xy1.y; // Math.floor(Math.random() * layout.height);

		let x2 = xy2.x; // Math.floor(Math.random() * layout.width);
		let y2 = xy2.y; // Math.floor(Math.random() * layout.height);

		// Get current node at coordinates
		let id1 = layout.data[x1] && layout.data[x1][y1] ? layout.data[x1][y1] : null;
		let id2 = layout.data[x2] && layout.data[x2][y2] ? layout.data[x2][y2] : null;

		// Get Coordinates for each node
		if (id1 && !layout.coords[id1]) {
			throw new Error('has an id for 1 but no coords');
		}
		if (id2 && !layout.coords[id2]) {
			throw new Error('has an id for 2 but no coords');
		}

		let coords1 = id1 ? layout.coords[id1] : createCoords(x1, y1);
		let coords2 = id2 ? layout.coords[id2] : createCoords(x2, y2);

		if (id2) {
			// add object if not set
			if (!layout.data[coords1.x]) {
				layout.data[coords1.x] = {};
			}
			// set layout data to id2
			layout.data[coords1.x][coords1.y] = id2;
			// set coords to new coords.
			layout.coords[id2] = coords1;
		} else {
			// remove id1 from coords
			if (layout.data[coords1.x]) {
				delete layout.data[coords1.x][coords1.y];
			}
		}
		if (id1) {
			// add object if not set
			if (!layout.data[coords2.x]) {
				layout.data[coords2.x] = {};
			}
			// set layout data to id1
			layout.data[coords2.x][coords2.y] = id1;
			// set coords to id1
			layout.coords[id1] = coords2;
		} else {
			// remove id2 from coords.
			if (layout.data[coords2.x]) {
				delete layout.data[coords2.x][coords2.y];
			}
		}
	} else if (true) {
		let x1 = Math.floor(Math.random() * layout.width);
		let y1 = Math.floor(Math.random() * layout.height);

		let x2 = Math.floor(Math.random() * layout.width);
		let y2 = Math.floor(Math.random() * layout.height);

		do {
			x2 = Math.floor(Math.random() * layout.width);
			y2 = Math.floor(Math.random() * layout.height);
		} while (x1 === x2 && y1 === y2);

		// Get current node at coordinates
		let id1 = layout.data[x1] && layout.data[x1][y1] ? layout.data[x1][y1] : null;
		let id2 = layout.data[x2] && layout.data[x2][y2] ? layout.data[x2][y2] : null;

		// Get Coordinates for each node
		if (id1 && !layout.coords[id1]) {
			throw new Error('has an id for 1 but no coords');
		}
		if (id2 && !layout.coords[id2]) {
			throw new Error('has an id for 2 but no coords');
		}

		let coords1 = id1 ? layout.coords[id1] : createCoords(x1, y1);
		let coords2 = id2 ? layout.coords[id2] : createCoords(x2, y2);

		if (id2) {
			// add object if not set
			if (!layout.data[coords1.x]) {
				layout.data[coords1.x] = {};
			}
			// set layout data to id2
			layout.data[coords1.x][coords1.y] = id2;
			// set coords to new coords.
			layout.coords[id2] = coords1;
		} else {
			// remove id1 from coords
			if (layout.data[coords1.x]) {
				delete layout.data[coords1.x][coords1.y];
			}
		}
		if (id1) {
			// add object if not set
			if (!layout.data[coords2.x]) {
				layout.data[coords2.x] = {};
			}
			// set layout data to id1
			layout.data[coords2.x][coords2.y] = id1;
			// set coords to id1
			layout.coords[id1] = coords2;
		} else {
			// remove id2 from coords.
			if (layout.data[coords2.x]) {
				delete layout.data[coords2.x][coords2.y];
			}
		}
	} else {
		let random1 = keys[Math.floor(Math.random() * keys.length)];
		let random2 = keys[Math.floor(Math.random() * keys.length)];

		let coords1 = layout.coords[random1];
		let coords2 = layout.coords[random2];
		layout.data[coords1.x][coords1.y] = random2;
		layout.data[coords2.x][coords2.y] = random1;
		layout.coords[random1] = coords2;
		layout.coords[random2] = coords1;
	}
}
function duplicateLayout(layout: CityLayoutGrid): CityLayoutGrid {
	let newlayout: CityLayoutGrid = {
		data: {},
		height: layout.height,
		width: layout.width,
		coords: {},
		distanceType: layout.distanceType
	};

	Object.keys(layout.data).forEach((v: string) => {
		newlayout.data[v] = JSON.parse(JSON.stringify(layout.data[v] || {}));
	});
	Object.keys(layout.coords).forEach((v: string) => {
		newlayout.coords[v] = JSON.parse(JSON.stringify(layout.coords[v]));
	});

	return newlayout;
}
function MeasureStress(layout: CityLayoutGrid, graph: Graph): number {
	let stress = 0;

	let cords = Object.keys(layout.coords);
	let maxDistance = 0;
	switch (layout.distanceType) {
		case DistanceType.CityBlock:
			maxDistance = layout.width + layout.height;
			break;
		case DistanceType.BirdFlys:
			maxDistance = Math.sqrt(Math.pow(layout.width, 2) + Math.pow(layout.height, 2));
			break;
	}
	cords.map((nodeId: string) => {
		let nodes = GetNodesLinkedTo(graph, {
			id: nodeId
		});
		graph.nodes.forEach((node: string) => {
			let found = nodes.find((n: Node) => n.id === node);
			if (found) {
				stress += CalculateConnectionStress(nodeId, node, graph, layout);
			} else {
				let temp = CalculateConnectionStress(nodeId, node, graph, layout);
				stress += (maxDistance - temp) * Math.pow(1 - (maxDistance - temp) / (maxDistance + 1), 2);
			}
		});
		// nodes.forEach((node: Node) => {
		// 	stress += CalculateConnectionStress(nodeId, node.id, graph, layout);
		// });
	});

	return stress;
}

function CalculateConnectionStress(nodeA: string, nodeB: string, graph: Graph, layout: CityLayoutGrid) {
	let link: GraphLink = GetLinkBetween(nodeA, nodeB, graph) || GetLinkBetween(nodeB, nodeA, graph);
	let distance = getDistance(nodeA, nodeB, layout);
	switch (GetLinkProperty(link, LinkPropertyKeys.TYPE)) {
		default:
			break;
	}
	return distance;
}
function getDistance(nodeA: string, nodeB: string, layout: CityLayoutGrid) {
	let start = layout.coords[nodeA];
	let end = layout.coords[nodeB];

	switch (layout.distanceType) {
		case DistanceType.CityBlock:
			return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
		case DistanceType.BirdFlys:
			return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
	}
	return 1;
}
function writeLine(str) {
	readline.clearLine(process.stdout, 0);
	readline.cursorTo(process.stdout, 0, null);
	process.stdout.write(`${str}`);
}
function ApplyNodesToGrid(cityLayoutGrid: CityLayoutGrid, graph: Graph): CityLayoutGrid {
	let list = Object.values(graph.nodeLib);
	let totalSize = cityLayoutGrid.height * cityLayoutGrid.width;

	list.map((node: Node, index: number) => {
		let distributedIndex = Math.floor(totalSize * (index / list.length));
		let coords: Coordinate = GetCityLayoutGridCoords(cityLayoutGrid, distributedIndex);
		SetNodePosition(coords, cityLayoutGrid, node.id);
	});
	return cityLayoutGrid;
}

function SetNodePosition(coords: Coordinate, layout: CityLayoutGrid, nodeId: string) {
	layout.data[coords.x] = layout.data[coords.x] || {};
	layout.data[coords.x][coords.y] = nodeId;
	layout.coords[nodeId] = coords;
}

function GetCityLayoutGridCoords(layout: CityLayoutGrid, index: number): Coordinate {
	let y = index % layout.height;
	let x = Math.floor(index / layout.height);
	return { x, y };
}

function CreateCityLayoutGrid(graph: Graph): CityLayoutGrid {
	let height = graph.nodeCount;
	let width = graph.nodeCount;
	let cityLayoutGrid: CityLayoutGrid = {
		data: {},
		height,
		width,
		coords: {},
		distanceType: DistanceType.CityBlock
	};

	return cityLayoutGrid;
}

interface AnnealOptions {
	swap: number;
	T: number;
	kMax: number;
}
