import { MethodFunctions, FunctionTypes, FunctionTemplateKeys, FunctionMethodTypes, HTTP_METHODS } from "./functiontypes";
import { NodeTypes, LinkProperties, NodeProperties, Methods } from "./nodetypes";
import { ADD_NEW_NODE, GetAgentNodes, GetUsers, GetNodeProp, GetNodeTitle, PerformGraphOperation, CHANGE_NODE_PROPERTY, ADD_LINK_BETWEEN_NODES, GetNodeById } from "../actions/uiactions";
import { GetNode } from "../methods/graph_methods";

export const GetSpecificModels = {
    type: 'get-specific-models',
    method: (args) => {
        let { model, dispatch, getState } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
        let agents = GetAgentNodes();

        agents.map(agent => {
            let methodProps;
            let outer_commands = [{
                operation: ADD_NEW_NODE,
                options: {
                    nodeType: NodeTypes.Method,
                    parent: model.id,
                    groupProperties: {
                    },
                    properties: {
                        [NodeProperties.NodePackage]: model.id,
                        [NodeProperties.NodePackageType]: GetSpecificModels.type,
                        [NodeProperties.FunctionType]: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific,
                        [NodeProperties.MethodType]: Methods.GetAll,
                        [NodeProperties.HttpMethod]: HTTP_METHODS.POST,
                        [NodeProperties.UIText]: `${GetNodeTitle(model)} Get Specific Objects`
                    },
                    linkProperties: {
                        properties: { ...LinkProperties.FunctionOperator }
                    },
                    callback: (methodNode) => {
                        setTimeout(() => {
                            new Promise((resolve) => {

                                let { constraints } = MethodFunctions[FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific];
                                let commands = [];
                                let permissionNode = null;
                                Object.values(constraints).map(constraint => {
                                    switch (constraint.key) {
                                        case FunctionTemplateKeys.Model:
                                        case FunctionTemplateKeys.Agent:
                                        case FunctionTemplateKeys.User:
                                        case FunctionTemplateKeys.ModelOutput:
                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                            if (constraint[NodeProperties.IsAgent]) {
                                                methodProps[constraint.key] = agent.id;
                                            }
                                            else if (constraint.key === FunctionTemplateKeys.User) {
                                                methodProps[constraint.key] = GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) || GetUsers()[0].id;
                                            }
                                            else {
                                                methodProps[constraint.key] = model.id;
                                            }
                                            break;
                                        case FunctionTemplateKeys.Permission:
                                        case FunctionTemplateKeys.ModelFilter:
                                            PerformGraphOperation([({
                                                operation: ADD_NEW_NODE,
                                                options: {
                                                    parent: methodNode.id,
                                                    nodeType: constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter,
                                                    groupProperties: {
                                                    },
                                                    properties: {
                                                        [NodeProperties.NodePackage]: model.id,
                                                        [NodeProperties.NodePackageType]: GetSpecificModels.type,
                                                        [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} ${constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter}`
                                                    },
                                                    linkProperties: {
                                                        properties: { ...LinkProperties.FunctionOperator }
                                                    },
                                                    callback: (newNode) => {
                                                        methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                        methodProps[constraint.key] = newNode.id;
                                                    }
                                                }
                                            })])(dispatch, getState);
                                            break;
                                    }
                                    commands = [...commands, ...[{
                                        operation: CHANGE_NODE_PROPERTY,
                                        options: {
                                            prop: NodeProperties.MethodProps,
                                            id: methodNode.id,
                                            value: methodProps
                                        }
                                    }, {
                                        operation: ADD_LINK_BETWEEN_NODES,
                                        options: {
                                            target: methodProps[constraint.key],
                                            source: methodNode.id,
                                            properties: { ...LinkProperties.FunctionOperator }
                                        }
                                    }]];
                                })


                                PerformGraphOperation(commands)(dispatch, getState)
                                resolve();
                            })
                        }, 1000)
                    }
                }
            }]
            PerformGraphOperation(outer_commands)(dispatch, getState);

        });
    },
    methodType: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
} 