import { NodeTypes, NodeProperties } from "./nodetypes";
import { FunctionTypes, FunctionTemplateKeys, ConditionTypes } from "./functiontypes";

export const Drivers = {
    [NodeTypes.Method]: {
        [FunctionTypes.Get_Parent$Child_Agent_Value__IListChild]: {
            [NodeTypes.Permission]: {
                properties: {
                    [NodeProperties.PermissionRequester]: {
                        [NodeProperties.MethodProps]: FunctionTemplateKeys.Agent
                    },
                    [NodeProperties.PermissionTarget]: {
                        [NodeProperties.MethodProps]: FunctionTemplateKeys.Parent
                    }
                }
            }
        }
    },
    [NodeTypes.Permission]: {
        [NodeTypes.Condition]: {
            [ConditionTypes.MatchManyReferenceParameter]: {

            },
            [ConditionTypes.MatchReference]: {

            }
        }
    }
}