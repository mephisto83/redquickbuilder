import { MethodFunctions, FunctionTypes, FunctionTemplateKeys } from "./functiontypes";
import { NodeTypes, LinkProperties, NodeProperties } from "./nodetypes";
import { ADD_NEW_NODE } from "../actions/uiactions";

export const GetSpecificModels = {
    type: 'get-specific-models',
    steps: [(args) => {
        let { graph, model } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
        let commands = [{
            operation: ADD_NEW_NODE,
            options: [{
                nodeType: NodeTypes.Method,
                parent: model.id,
                groupProperties: {
                },
                linkProperties: {
                    properties: { ...LinkProperties.FunctionOperator }
                },
                callback: (method) => {
                    let { constraints } = MethodFunctions[FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific];
                    Object.values(constraints).map(_const => {
                        switch (_const.key) {
                            case FunctionTemplateKeys.Model:
                            case FunctionTemplateKeys.Agent:
                            case FunctionTemplateKeys.ModelOutput:
                                if (_const[NodeProperties.IsAgent]) {
                                    
                                }
                                break;
                        }
                    })
                }
            }]
        }]
    }],
    methodType: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
} 