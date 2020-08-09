import { Coordinate } from './coordinate';

export interface CityLayoutGrid {
	coords: { [id: string]: Coordinate };
	data: { [x: number]: { [y: number]: string } };
	height: number;
	width: number;
	distanceType: DistanceType;
}

export enum DistanceType {
	BirdFlys = 'BirdFlys',
	CityBlock = 'CityBlock'
}
