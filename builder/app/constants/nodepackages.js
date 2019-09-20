import { MethodFunctions, FunctionTypes, FunctionTemplateKeys, FunctionMethodTypes, HTTP_METHODS } from "./functiontypes";
import { NodeTypes, LinkProperties, NodeProperties, Methods } from "./nodetypes";
import {
    ADD_NEW_NODE,
    GetAgentNodes,
    GetUsers,
    GetNodeProp,
    GetNodeTitle,
    PerformGraphOperation,
    CHANGE_NODE_PROPERTY,
    ADD_LINK_BETWEEN_NODES,
    GetNodeById,
    ModelNotConnectedToFunction
} from "../actions/uiactions";


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

            if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type)) {
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
                            [NodeProperties.NodePackageAgent]: agent.id,
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
                                                let perOrModelNode = null;
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
                                                            perOrModelNode = newNode;
                                                        }
                                                    }
                                                })])(dispatch, getState);
                                                if (constraint.key === FunctionTemplateKeys.ModelFilter) {
                                                    commands = [...commands, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterAgent,
                                                            id: perOrModelNode.id,
                                                            value: agent.id
                                                        }
                                                    }, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterModel,
                                                            id: perOrModelNode.id,
                                                            value: model.id
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: model.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.ModelTypeLink }
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: agent.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.AgentTypeLink }
                                                        }
                                                    }]
                                                }
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
                                    if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type, NodeTypes.Controller)) {
                                        commands.push({
                                            operation: ADD_NEW_NODE,
                                            options: {
                                                nodeType: NodeTypes.Controller,
                                                properties: {
                                                    [NodeProperties.NodePackage]: model.id,
                                                    [NodeProperties.NodePackageType]: GetSpecificModels.type,
                                                    [NodeProperties.NodePackageAgent]: agent.id,
                                                    [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Controller`
                                                },
                                                linkProperties: {
                                                    properties: { ...LinkProperties.FunctionOperator }
                                                },
                                                callback: (controllerNode) => {
                                                    setTimeout(() => {
                                                        if (ModelNotConnectedToFunction(agent.id, model.id, GetSpecificModels.type, NodeTypes.Maestro)) {
                                                            PerformGraphOperation([{
                                                                operation: ADD_NEW_NODE,
                                                                options: {
                                                                    nodeType: NodeTypes.Maestro,
                                                                    parent: controllerNode.id,

                                                                    properties: {
                                                                        [NodeProperties.NodePackage]: model.id,
                                                                        [NodeProperties.NodePackageType]: GetSpecificModels.type,
                                                                        [NodeProperties.NodePackageAgent]: agent.id,
                                                                        [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Maestro`
                                                                    },
                                                                    linkProperties: {
                                                                        properties: { ...LinkProperties.MaestroLink }
                                                                    },
                                                                    callback: (maestroNode) => {
                                                                        setTimeout(() => {
                                                                            PerformGraphOperation([{
                                                                                operation: ADD_LINK_BETWEEN_NODES,
                                                                                options: {
                                                                                    target: methodNode.id,
                                                                                    source: maestroNode.id,
                                                                                    properties: {
                                                                                        ...LinkProperties.FunctionLink
                                                                                    }
                                                                                }
                                                                            }])(dispatch, getState);

                                                                        }, 1500)
                                                                    }
                                                                }
                                                            }])(dispatch, getState)
                                                        }

                                                    }, 1500)
                                                }
                                            }
                                        });
                                    }
                                    PerformGraphOperation(commands)(dispatch, getState)
                                    resolve();
                                })
                            }, 1500)
                        }
                    }
                }]
                PerformGraphOperation(outer_commands)(dispatch, getState);
            }
        });
    },
    methodType: FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific
}

export const GetAllModels = {
    type: 'get-all-models',
    method: CreateFunction({
        nodePackageType: 'get-all-models',
        methodType: Methods.GetAll,
        httpMethod: HTTP_METHODS.GET,
        functionType: FunctionTypes.Get_Agent_Value__IListObject,
        functionName: `Get All`
    }),
    methodType: FunctionTypes.Get_Agent_Value__IListObject
}

function CreateFunction(option) {
    let {
        nodePackageType,
        methodType,
        httpMethod,
        functionType,
        functionName
    } = option;
    if (!nodePackageType) {
        throw 'missing node package type';
    }
    if (!methodType) {
        throw 'missing method type';
    }
    if (!httpMethod) {
        throw 'missing http method';
    }
    if (!functionType) {
        throw 'function type missing';
    }
    if (!functionName) {
        throw 'function name is missing';
    }
    return (args) => {
        let { model, dispatch, getState } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);
        let agents = GetAgentNodes();

        agents.filter(x => !GetNodeProp(x, NodeProperties.ExcludeFromController)).map(agent => {
            let methodProps;

            if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType)) {
                let outer_commands = [{
                    operation: ADD_NEW_NODE,
                    options: {
                        nodeType: NodeTypes.Method,
                        parent: model.id,
                        groupProperties: {
                        },
                        properties: {
                            [NodeProperties.NodePackage]: model.id,
                            [NodeProperties.NodePackageType]: nodePackageType,
                            [NodeProperties.NodePackageAgent]: agent.id,
                            [NodeProperties.FunctionType]: functionType,
                            [NodeProperties.MethodType]: methodType,
                            [NodeProperties.HttpMethod]: httpMethod,
                            [NodeProperties.UIText]: `${GetNodeTitle(model)} ${functionName}`
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.FunctionOperator }
                        },
                        callback: (methodNode) => {
                            setTimeout(() => {
                                new Promise((resolve) => {

                                    let { constraints } = MethodFunctions[functionType];
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
                                                let perOrModelNode = null;
                                                PerformGraphOperation([({
                                                    operation: ADD_NEW_NODE,
                                                    options: {
                                                        parent: methodNode.id,
                                                        nodeType: constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter,
                                                        groupProperties: {
                                                        },
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} ${constraint.key === FunctionTemplateKeys.Permission ? NodeTypes.Permission : NodeTypes.ModelFilter}`
                                                        },
                                                        linkProperties: {
                                                            properties: { ...LinkProperties.FunctionOperator }
                                                        },
                                                        callback: (newNode) => {
                                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                                            methodProps[constraint.key] = newNode.id;
                                                            perOrModelNode = newNode;
                                                        }
                                                    }
                                                })])(dispatch, getState);
                                                if (constraint.key === FunctionTemplateKeys.ModelFilter) {
                                                    commands = [...commands, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterAgent,
                                                            id: perOrModelNode.id,
                                                            value: agent.id
                                                        }
                                                    }, {
                                                        operation: CHANGE_NODE_PROPERTY,
                                                        options: {
                                                            prop: NodeProperties.FilterModel,
                                                            id: perOrModelNode.id,
                                                            value: model.id
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: model.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.ModelTypeLink }
                                                        }
                                                    }, {
                                                        operation: ADD_LINK_BETWEEN_NODES,
                                                        options: {
                                                            target: agent.id,
                                                            source: perOrModelNode.id,
                                                            properties: { ...LinkProperties.AgentTypeLink }
                                                        }
                                                    }]
                                                }
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
                                    if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType, NodeTypes.Controller)) {
                                        commands.push({
                                            operation: ADD_NEW_NODE,
                                            options: {
                                                nodeType: NodeTypes.Controller,
                                                properties: {
                                                    [NodeProperties.NodePackage]: model.id,
                                                    [NodeProperties.NodePackageType]: nodePackageType,
                                                    [NodeProperties.NodePackageAgent]: agent.id,
                                                    [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Controller`
                                                },
                                                linkProperties: {
                                                    properties: { ...LinkProperties.FunctionOperator }
                                                },
                                                callback: (controllerNode) => {
                                                    setTimeout(() => {
                                                        if (ModelNotConnectedToFunction(agent.id, model.id, nodePackageType, NodeTypes.Maestro)) {
                                                            PerformGraphOperation([{
                                                                operation: ADD_NEW_NODE,
                                                                options: {
                                                                    nodeType: NodeTypes.Maestro,
                                                                    parent: controllerNode.id,

                                                                    properties: {
                                                                        [NodeProperties.NodePackage]: model.id,
                                                                        [NodeProperties.NodePackageType]: nodePackageType,
                                                                        [NodeProperties.NodePackageAgent]: agent.id,
                                                                        [NodeProperties.UIText]: `${GetNodeTitle(model)} ${GetNodeTitle(agent)} Maestro`
                                                                    },
                                                                    linkProperties: {
                                                                        properties: { ...LinkProperties.MaestroLink }
                                                                    },
                                                                    callback: (maestroNode) => {
                                                                        setTimeout(() => {
                                                                            PerformGraphOperation([{
                                                                                operation: ADD_LINK_BETWEEN_NODES,
                                                                                options: {
                                                                                    target: methodNode.id,
                                                                                    source: maestroNode.id,
                                                                                    properties: {
                                                                                        ...LinkProperties.FunctionLink
                                                                                    }
                                                                                }
                                                                            }])(dispatch, getState);

                                                                        }, 1500)
                                                                    }
                                                                }
                                                            }])(dispatch, getState)
                                                        }

                                                    }, 1500)
                                                }
                                            }
                                        });
                                    }
                                    PerformGraphOperation(commands)(dispatch, getState)
                                    resolve();
                                })
                            }, 1500)
                        }
                    }
                }]
                PerformGraphOperation(outer_commands)(dispatch, getState);
            }
        });
    }
}