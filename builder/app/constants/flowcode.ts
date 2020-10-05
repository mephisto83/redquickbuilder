export enum ParameterTypes {
    Boolean = 'Boolean',
    SwitchConditional = 'SwitchConditional',
    Conditional = 'Conditional',
    FlowControl = 'FlowControl',
    Array = 'Array',
    Any = 'Any',
    Promise = 'Promise'
}
export enum FlowTypes {
    Boolean = 'Boolean',
    Integer = 'Integer',
    Float = 'Float',
    Number = 'Number',
    Double = 'Double',
    Promise = 'Promise',
    String = 'String',
    Function = 'Function',
    Any = 'Any',
    ModelType = 'ModelType'
}
const AllFlowTypes = Object.values(FlowTypes);
type SwitchConditionalOptions = FlowTypes.Boolean | FlowTypes.Number | FlowTypes.Double | FlowTypes.String | FlowTypes.Integer;

export interface IFlowCodeTypes {
    FlowControl: ICodeFlowControl,
    Methods: IMethodFlowControl,
    Variables: { [name: string]: IVariablesFlowControl }
}

export interface ICodeFlowControl {
    [name: string]: ICodeNodeDescription
}

export interface IMethodFlowControl {
    [name: string]: IMethodNodeDescription
}
export interface IVariablesFlowControl {
    color: string;
    type: FlowTypes;
    generic: boolean
}
export interface IMethodNodeDescription {
    color: string;
    Flow: IFlowNodeParameter,
    FlowOutputs: IFlowNodeParameter,
    Parameters: {
        [paramName: string]: ICodeNodeParameter
    }
    Outputs: {
        [paramName: string]: ICodeNodeParameter
    }
}

export interface ICodeNodeDescription {
    color: string;
    Flow: IFlowNodeParameter,
    FlowOutputs: IFlowNodeParameter | { [paramName: string]: IFlowNodeParameter },
    Parameters: {
        [paramName: string]: ICodeNodeParameter
    }
}
export enum FlowGeneric {
    Any = 'Any',
    True = 'True',
    False = 'False'
}
export enum FlowEnumerable {
    Any = 'Any',
    True = 'True',
    False = 'False'
}
export enum FlowAsync {
    True = 'True',
    False = 'False'
}
export enum FlowRequired {
    True = 'True',
    False = 'False'
}
export interface ICodeNodeParameter {
    type: [FlowTypes | FlowTypes[], FlowGeneric, FlowEnumerable, FlowAsync, FlowRequired, FlowTypes | FlowTypes[] | undefined/** Generic */];
    matchInputType?: string;
}
export interface IFlowNodeParameter {
    required?: Boolean;
    type: ParameterTypes | ParameterTypes[];
    generic?: Boolean;
    enumerable?: Boolean;
    paramType?: SwitchConditionalOptions
}
export const FlowCodeTypes: IFlowCodeTypes = {
    FlowControl: {
        If: {
            color: '#D00000',
            Flow: {
                required: true,
                type: ParameterTypes.FlowControl
            },
            Parameters: {
                Condition: {
                    type: [FlowTypes.Boolean, FlowGeneric.False, FlowEnumerable.False, FlowAsync.False, FlowRequired.True, undefined]
                }
            },
            FlowOutputs: {
                IfTrue: {
                    required: true,
                    type: ParameterTypes.FlowControl
                },
                IfFalse: {
                    required: false,
                    type: ParameterTypes.FlowControl
                }
            }
        },
        Switch: {
            color: '#D00000',
            Flow: {
                required: true,
                type: ParameterTypes.FlowControl
            },
            Parameters: {
                SwitchCase: {
                    type: [
                        [FlowTypes.Boolean, FlowTypes.Number, FlowTypes.Double, FlowTypes.String, FlowTypes.Integer],
                        FlowGeneric.False,
                        FlowEnumerable.False,
                        FlowAsync.False,
                        FlowRequired.True, undefined]
                }
            },
            FlowOutputs: {
                Flows: {
                    required: true,
                    type: ParameterTypes.FlowControl,
                    enumerable: true // This means that there is a list of them
                }
            }
        },
        ForEach: {
            color: '#D00000',
            Flow: {
                required: true,
                type: ParameterTypes.FlowControl,
                generic: true
            },
            Parameters: {
                Array: {
                    type: [
                        [FlowTypes.Boolean, FlowTypes.Number, FlowTypes.ModelType, FlowTypes.Double, FlowTypes.String, FlowTypes.Integer],
                        FlowGeneric.Any,
                        FlowEnumerable.Any,
                        FlowAsync.True,
                        FlowRequired.True, AllFlowTypes]
                }
            },
            FlowOutputs: {
                Flow: {
                    required: true,
                    type: ParameterTypes.FlowControl,
                    generic: true
                }
            }
        }
    },
    Methods: {
        Await: {
            color: '#FFBA08',
            Flow: {
                required: true,
                type: ParameterTypes.FlowControl,
                generic: true
            },
            Parameters: {
                Input: {
                    type: [
                        [FlowTypes.Boolean, FlowTypes.Number, FlowTypes.ModelType, FlowTypes.Double, FlowTypes.String, FlowTypes.Integer],
                        FlowGeneric.Any,
                        FlowEnumerable.Any,
                        FlowAsync.True,
                        FlowRequired.True, AllFlowTypes]
                }
            },
            FlowOutputs: {
                required: true,
                type: ParameterTypes.FlowControl
            },
            Outputs: {
                Output: {
                    type: [
                        AllFlowTypes,
                        FlowGeneric.False,
                        FlowEnumerable.Any,
                        FlowAsync.False,
                        FlowRequired.False, undefined]
                }
            }
        }
    },
    Variables: {}
}
export function StandardFlowOutput(): IFlowNodeParameter {
    return {
        required: true,
        type: ParameterTypes.FlowControl
    }
}
export function AddMethodDefinition(
    fct: IFlowCodeTypes,
    methodName: string,
    params: { [str: string]: ICodeNodeParameter },
    output: { [str: string]: ICodeNodeParameter }) {
    fct.Methods[methodName] = {
        color: '#3F88C5',
        Flow: {
            required: true,
            type: ParameterTypes.FlowControl
        },
        FlowOutputs: StandardFlowOutput(),
        Parameters: params,
        Outputs: output
    };
}

