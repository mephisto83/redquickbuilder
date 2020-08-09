import { LoadGraph } from '../../app/methods/storeGraph';
import { Graph, Node, GraphLink } from '../../app/methods/graph_types';
import { CityLayoutGrid, DistanceType } from './citylayoutgrid';
import { Coordinate } from './coordinate';
import { GetNodesLinkedTo, GetLinkBetween } from '../../app/methods/graph_methods';
import { GetLinkProperty } from '../../app/actions/uiactions';
import { LinkPropertyKeys } from '../../app/constants/nodetypes';
import unprune from '../../app/methods/unprune';

export default async function Visualize(file: string) {
	let graph: Graph = await LoadGraph(file);
	graph = unprune(graph);

	console.log('loaded graph');
	console.log(`graph.nodeCount: ${graph.nodeCount}`);

	let cityLayoutGrid = CreateCityLayoutGrid(graph);

	cityLayoutGrid = ApplyNodesToGrid(cityLayoutGrid, graph);

	let stress: number = MeasureStress(cityLayoutGrid, graph);
	let newlayout = SwapItems(cityLayoutGrid, graph, 10);
	let newstress: number = MeasureStress(newlayout, graph);

	console.log(`current stress : ${stress}`);
	console.log(`new stress : ${newstress}`);
}
function SwapItems(layout: CityLayoutGrid, graph: Graph, num: number) {
	let newlayout = duplicateLayout(layout);
	for (var i = 0; i < num; i++) {
		SwapItem(newlayout);
	}
	return newlayout;
}
function SwapItem(layout: CityLayoutGrid) {
	let keys = Object.keys(layout.coords);

	let random1 = keys[Math.floor(Math.random() * keys.length)];
	let random2 = keys[Math.floor(Math.random() * keys.length)];

	let coords1 = layout.coords[random1];
	let coords2 = layout.coords[random2];
	layout.data[coords1.x][coords1.y] = random2;
	layout.data[coords2.x][coords2.y] = random1;
	layout.coords[random1] = coords2;
	layout.coords[random2] = coords1;
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
function MeasureStress(cityLayoutGrid: CityLayoutGrid, graph: Graph): number {
	let stress = 0;

	let cords = Object.keys(cityLayoutGrid.coords);
	cords.map((nodeId: string) => {
		let nodes = GetNodesLinkedTo(graph, {
			id: nodeId
		});
		nodes.forEach((node: Node) => {
			stress += CalculateConnectionStress(nodeId, node.id, graph, cityLayoutGrid);
		});
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

function ApplyNodesToGrid(cityLayoutGrid: CityLayoutGrid, graph: Graph): CityLayoutGrid {
	Object.values(graph.nodeLib).map((node: Node, index: number) => {
		let coords: Coordinate = GetCityLayoutGridCoords(cityLayoutGrid, index);
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
