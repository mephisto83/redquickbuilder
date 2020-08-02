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
	types?: string[];
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
