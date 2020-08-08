import { getJSONReferenceInserts } from '../../utils/utilservice';

export enum LambdaTypes {
	ExecutorItem = 'ExecutorItem'
}
export interface LambdaBuildArgs {
	lambdaType: LambdaTypes;
}
export interface ReferenceInsert {
	key: string;
	model?: string;
	property?: string;
	enumeration?: string;
	enumerationvalue?: string;
	type?: ReferenceInsertType;
	types?: string[];
}
export enum ReferenceInsertType {
	Model = 'model',
	Property = 'property',
	Type = 'type',
	Enumeration = 'enumeration',
	EnumerationValue = 'enumerationvalue'
}
export function executorItemType(args: LambdaBuildArgs) {
	return `
  Function<Task<$type>> func = async (#{{"key":"agent"}}# agent, #{{"key":"data"}}# data,#{{"key":"data"}}#ChangeBy#{{"key":"agent"}}# change) => {
  };

  return await func(agent, fromModel, change);
`;
}
export default function BuildLambda(args: LambdaBuildArgs) {
	switch (args.lambdaType) {
		case LambdaTypes.ExecutorItem:
			return executorItemType(args);
	}
}

export function GetJSONReferenceInserts(lambdaText: string) {
	return getJSONReferenceInserts(lambdaText || '')
		.map((v) => v.substr(2, v.length - 4))
		.map((v: string) => {
			return JSON.parse(v);
		})
		.unique((_insert: ReferenceInsert) => {
			return _insert.key;
		});
}

export function GetJSONReferenceInsertsMap(lambdaText: string) {
	let res: {
		[str: string]: {
			template: string;
			insert: ReferenceInsert;
		};
  } = {};

	getJSONReferenceInserts(lambdaText || '').map((v) => v.substr(2, v.length - 4)).map((v: string) => {
		let ri: ReferenceInsert = JSON.parse(v);
		res[ri.key] = {
			template: `#{${v}}#`,
			insert: ri
		};
	});
	// .unique((_insert: ReferenceInsert) => {
	// 	return _insert.key;
	// });
	return res;
}