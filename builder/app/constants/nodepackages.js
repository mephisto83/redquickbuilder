import { MethodFunctions, FunctionTypes, FunctionTemplateKeys, FunctionMethodTypes, HTTP_METHODS } from "./functiontypes";
import { NodeTypes, LinkProperties, NodeProperties, Methods, UITypes } from "./nodetypes";
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
    ModelNotConnectedToFunction,
    GetCurrentGraph,
    GetStateFunc,
    GetDispatchFunc,
    NodePropertyTypes,
    Node,
    Visual,
    SELECTED_NODE,
    GetState,
    NEW_SCREEN_OPTIONS,
    NEW_COMPONENT_NODE,
    GetModelPropertyChildren
} from "../actions/uiactions";
import { newNode, CreateLayout, SetCellsLayout, GetCellProperties, GetFirstCell, GetAllChildren, FindLayoutRootParent, GetChildren } from "../methods/graph_methods";
import { ComponentTypes, InstanceTypes } from "./componenttypes";
import { debug } from "util";
import * as Titles from '../components/titles';
import { createComponentApi, addComponentApi } from "../methods/component_api_methods";


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
export const CreateLoginModels = {
    type: 'login-models',
    methodType: 'Login Models',
    method: () => {
        // let currentGraph = GetCurrentGraph(GetStateFunc()());
        // currentGraph = newNode(currentGraph);
        let nodePackageType = 'login-models';
        let nodePackage = 'login-models';
        PerformGraphOperation([({
            operation: ADD_NEW_NODE,
            options: {
                nodeType: NodeTypes.Model,
                // groupProperties: {},
                properties: {
                    [NodeProperties.NodePackage]: nodePackage,
                    [NodeProperties.NodePackageType]: nodePackageType,
                    [NodeProperties.UIText]: `Blue Login Model`
                },
                callback: (newNode) => {
                    // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                    // methodProps[constraint.key] = newNode.id;
                    // perOrModelNode = newNode;
                    setTimeout(() => {
                        PerformGraphOperation([
                            { propName: 'User Name' },
                            { propName: 'Password' },
                            { propName: 'Remember Me' }
                        ].map(v => {
                            let { propName } = v;
                            return ({
                                operation: ADD_NEW_NODE,
                                options: {
                                    nodeType: NodeTypes.Property,
                                    linkProperties: {
                                        properties: { ...LinkProperties.PropertyLink }
                                    },
                                    groupProperties: {
                                    },
                                    parent: newNode.id,
                                    properties: {
                                        [NodeProperties.NodePackage]: nodePackage,
                                        [NodeProperties.UIAttributeType]: NodePropertyTypes.STRING,
                                        [NodeProperties.NodePackageType]: nodePackageType,
                                        [NodeProperties.UIText]: propName
                                    }
                                }
                            });
                        }))(GetDispatchFunc(), GetStateFunc());
                    }, 1000);
                }
            }
        }), ({
            operation: ADD_NEW_NODE,
            options: {
                nodeType: NodeTypes.Model,
                // groupProperties: {},
                properties: {
                    [NodeProperties.NodePackage]: nodePackage,
                    [NodeProperties.NodePackageType]: nodePackageType,
                    [NodeProperties.UIText]: `Blue Register View Model`
                },
                callback: (newNode) => {
                    // methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                    // methodProps[constraint.key] = newNode.id;
                    // perOrModelNode = newNode;
                    setTimeout(() => {
                        PerformGraphOperation([
                            { propName: 'User Name' },
                            { propName: 'Email' },
                            { propName: 'Password' },
                            { propName: 'Confirm Password' }
                        ].map(v => {
                            let { propName } = v;
                            return ({
                                operation: ADD_NEW_NODE,
                                options: {
                                    nodeType: NodeTypes.Property,
                                    linkProperties: {
                                        properties: { ...LinkProperties.PropertyLink }
                                    },
                                    groupProperties: {},
                                    parent: newNode.id,
                                    properties: {
                                        [NodeProperties.NodePackage]: nodePackage,
                                        [NodeProperties.UIAttributeType]: NodePropertyTypes.STRING,
                                        [NodeProperties.NodePackageType]: nodePackageType,
                                        [NodeProperties.UIText]: propName
                                    }
                                }
                            });
                        }))(GetDispatchFunc(), GetStateFunc());
                    }, 1000);
                }
            }
        })])(GetDispatchFunc(), GetStateFunc());
    }
}

export const CreateDefaultView = {
    type: 'react-native-views',
    methodType: 'React Native Views',
    method: () => {
        let state = GetState();
        var currentNode = Node(state, Visual(state, SELECTED_NODE));
        let screenNodeId = null;
        let screenComponentId = null;
        let screenNodeOptionId = null;
        let childComponents = [];
        let layout = null;
        let viewModelNodeId = null;
        if (GetNodeProp(currentNode, NodeProperties.NODEType) === NodeTypes.Model) {
            let modelProperties = GetModelPropertyChildren(currentNode.id);
            PerformGraphOperation([{
                operation: ADD_NEW_NODE,
                options: {
                    nodeType: NodeTypes.Screen,
                    callback: (screenNode) => {
                        screenNodeId = screenNode.id;
                    },
                    properties: {
                        [NodeProperties.UIText]: `${GetNodeTitle(currentNode)} Form`
                    }
                }
            }, {
                operation: ADD_NEW_NODE,
                options: {
                    nodeType: NodeTypes.ViewModel,
                    callback: (viewModelNode) => {
                        viewModelNodeId = viewModelNode.id;
                    },
                    properties: {
                        [NodeProperties.UIText]: `${GetNodeTitle(currentNode)} View Model`,
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: InstanceTypes.ScreenInstance
                    },
                    links: [{
                        target: currentNode.id,
                        linkProperties: {
                            properties: { ...LinkProperties.ViewModelLink }
                        }
                    }]
                }
            }, {
                operation: NEW_SCREEN_OPTIONS,
                options: function () {
                    return {
                        callback: (screenOptionNode) => {
                            screenNodeOptionId = screenOptionNode.id;
                        },
                        parent: screenNodeId,
                        properties: {
                            [NodeProperties.UIText]: `${GetNodeTitle(currentNode)} React Native Form`,
                            [NodeProperties.UIType]: UITypes.ReactNative
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ScreenOptionsLink }
                        }
                    }
                }
            }, {
                operation: NEW_COMPONENT_NODE,
                options: function () {
                    layout = CreateLayout();
                    layout = SetCellsLayout(layout, 1);
                    let rootCellId = GetFirstCell(layout);
                    let cellProperties = GetCellProperties(layout, rootCellId);
                    cellProperties.style = { ...cellProperties.style, flexDirection: 'column' };
                    let propertyCount = modelProperties.length + 1;
                    layout = SetCellsLayout(layout, propertyCount, rootCellId);

                    return {
                        callback: (screenComponent) => {
                            screenComponentId = screenComponent.id;
                        },
                        parent: screenNodeOptionId,
                        properties: {
                            [NodeProperties.UIText]: `${GetNodeTitle(currentNode)} React Native Component`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.ComponentType]: ComponentTypes.ReactNative.View.key,
                            [NodeProperties.Layout]: layout
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ComponentLink }
                        }
                    }
                }
            }, ...modelProperties.map((modelProperty, modelIndex) => {
                return {
                    operation: NEW_COMPONENT_NODE,
                    options: function () {
                        return {
                            parent: screenComponentId,
                            groupProperties: {
                            },
                            properties: {
                                [NodeProperties.UIText]: `${GetNodeTitle(modelProperty)} React Native Component`,
                                [NodeProperties.UIType]: UITypes.ReactNative,
                                [NodeProperties.Label]: GetNodeTitle(modelProperty),
                                [NodeProperties.ComponentType]: ComponentTypes.ReactNative.Input.key
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.ComponentLink }
                            },
                            callback: (component) => {
                                childComponents.push(component.id);
                            }

                        }
                    }
                }
            }), {
                operation: NEW_COMPONENT_NODE,
                options: function () {
                    return {
                        parent: screenComponentId,
                        groupProperties: {
                        },
                        properties: {
                            [NodeProperties.UIText]: ` ${Titles.Execute} Button ${GetNodeTitle(currentNode)} Component`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.Label]: `${GetNodeTitle(currentNode)} ${Titles.Execute}`,
                            [NodeProperties.ComponentType]: ComponentTypes.ReactNative.Button.key
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ComponentLink }
                        },
                        callback: (component) => {
                            childComponents.push(component.id);
                        }
                    }
                }
            }, {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    let lastComponent = childComponents.length - 1;
                    let rootCellId = GetFirstCell(layout);
                    let children = GetChildren(layout, rootCellId);
                    let childId = children[lastComponent];
                    let cellProperties = GetCellProperties(layout, childId);
                    cellProperties.children[childId] = childComponents[lastComponent];
                    cellProperties.style.flex = null;
                    cellProperties.style.height = null;
                    return {
                        prop: NodeProperties.Layout,
                        id: screenComponentId,
                        value: layout
                    }
                }
            },
            ...modelProperties.map((modelProperty, modelIndex) => {
                return {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function () {
                        let rootCellId = GetFirstCell(layout);
                        let children = GetChildren(layout, rootCellId);
                        let childId = children[modelIndex];
                        let cellProperties = GetCellProperties(layout, childId);
                        cellProperties.children[childId] = childComponents[modelIndex];
                        cellProperties.style.flex = null;
                        cellProperties.style.height = null;
                        return {
                            prop: NodeProperties.Layout,
                            id: screenComponentId,
                            value: layout
                        }
                    }
                }
            }),
            ...modelProperties.map((modelProperty, modelIndex) => {
                return {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        let componentProps = createComponentApi();
                        let componentTypes = ComponentTypes.ReactNative;
                        let compNodeId = childComponents[modelIndex];
                        let compNode = GetNodeById(compNodeId, graph)
                        let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                        componentTypes[componentType].defaultApi.map(x => {
                            componentProps = addComponentApi(componentProps, {
                                modelProp: x.property
                            });
                        });

                        return {
                            prop: NodeProperties.ComponentApi,
                            id: compNodeId,
                            value: componentProps
                        };
                    }
                }
            }), {
                operation: CHANGE_NODE_PROPERTY,
                options: function (graph) {
                    let componentProps = createComponentApi();
                    let componentTypes = ComponentTypes.ReactNative;
                    let compNodeId = childComponents[childComponents.length - 1];
                    let compNode = GetNodeById(compNodeId, graph)
                    let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                    componentTypes[componentType].defaultApi.map(x => {
                        componentProps = addComponentApi(componentProps, {
                            modelProp: x.property
                        });
                    });

                    return {
                        prop: NodeProperties.ComponentApi,
                        id: compNodeId,
                        value: componentProps
                    };
                }
            }])(GetDispatchFunc(), GetStateFunc());

            PerformGraphOperation([
                ...([].interpolate(0, modelProperties.length + 1, modelIndex => {
                    return applyDefaultComponentProperties(GetNodeById(childComponents[modelIndex]), UITypes.ReactNative)
                })).flatten()
            ])(GetDispatchFunc(), GetStateFunc());;

        }
    }
};

export function applyDefaultComponentProperties(currentNode, _ui_type) {
    // var { state } = this.props;
    // var currentNode = Node(state, Visual(state, SELECTED_NODE));
    // let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
    // let _ui_type = GetNodeProp(screenOption, NodeProperties.UIType);
    let componentTypes = ComponentTypes[_ui_type] || {};
    let componentType = GetNodeProp(currentNode, NodeProperties.ComponentType);
    let result = [];
    Object.keys(componentTypes[componentType].properties).map(key => {
        let prop_obj = componentTypes[componentType].properties[key];
        if (prop_obj.parameterConfig) {
            let selectedComponentApiProperty = key;
            let componentProperties = GetNodeProp(currentNode, prop_obj.nodeProperty);
            componentProperties = componentProperties || {};
            componentProperties[selectedComponentApiProperty] = componentProperties[selectedComponentApiProperty] || {};
            componentProperties[selectedComponentApiProperty] = {
                instanceType: InstanceTypes.ApiProperty,
                isHandler: prop_obj.isHandler,
                apiProperty: prop_obj.nodeProperty
            };

            result.push({
                operation: CHANGE_NODE_PROPERTY,
                options: {
                    prop: prop_obj.nodeProperty,
                    id: currentNode.id,
                    value: componentProperties
                }
            });
        }
    });

    return result;
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