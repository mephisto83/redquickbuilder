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
}
export function executorItemType(args: LambdaBuildArgs) {
	return `
  Function<Task<$type>> func = async (#{agent} agent, #{data} data,#{data}ChangeBy#{agent} change) => {
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
