import { MethodFunctions, FunctionTypes, FunctionTemplateKeys, FunctionMethodTypes, HTTP_METHODS } from "./functiontypes";
import { NodeTypes, LinkProperties, NodeProperties, Methods, UITypes, GroupProperties } from "./nodetypes";
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
    GetModelPropertyChildren,
    GetDataChainNextId,
    GetNodesByProperties,
    ViewTypes
} from "../actions/uiactions";
import { newNode, CreateLayout, SetCellsLayout, GetCellProperties, GetFirstCell, GetAllChildren, FindLayoutRootParent, GetChildren, GetNode } from "../methods/graph_methods";
import { ComponentTypes, InstanceTypes, ARE_BOOLEANS, ARE_HANDLERS, HandlerTypes, ARE_TEXT_CHANGE, ON_BLUR, ON_CHANGE, ON_CHANGE_TEXT, ON_FOCUS, VALUE, SHARED_COMPONENT_API } from "./componenttypes";
import { debug } from "util";
import * as Titles from '../components/titles';
import { createComponentApi, addComponentApi, getComponentApiList } from "../methods/component_api_methods";
import { DataChainFunctionKeys, DataChainFunctions, SplitDataCommand, ConnectChainCommand, AddChainCommand } from "./datachain";
import { uuidv4 } from "../utils/array";


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
                            { propName: 'Email', propType: NodePropertyTypes.EMAIL },
                            { propName: 'Password' },
                            { propName: 'Confirm Password' }
                        ].map(v => {
                            let { propName, propType } = v;
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
                                        [NodeProperties.UIAttributeType]: propType || NodePropertyTypes.STRING,
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

export const AddAgentUser = {
    type: 'add-agent-user',
    methodType: 'Add User Agent',
    method: () => {
        let userId = null;
        PerformGraphOperation([{
            operation: ADD_NEW_NODE,
            options: function () {
                return {
                    nodeType: NodeTypes.Model,
                    callback: (node) => {
                        userId = node.id;
                    },
                    properties: {
                        [NodeProperties.UIText]: `User`,
                        [NodeProperties.IsUser]: true
                    }
                }
            }
        }, {
            operation: ADD_NEW_NODE,
            options: function () {
                return {
                    nodeType: NodeTypes.Model,
                    properties: {
                        [NodeProperties.UIText]: `Agent`,
                        [NodeProperties.IsAgent]: true,
                        [NodeProperties.UIUser]: userId
                    },
                    links: [{
                        target: userId,
                        linkProperties: {
                            properties: { ...LinkProperties.UserLink }
                        }
                    }]
                }
            }
        }])(GetDispatchFunc(), GetStateFunc());
    }
}

export const CreateDefaultView = {
    type: 'Create View - Form',
    methodType: 'React Native Views',
    method: (args = {}) => {
        let { viewName, viewType, sharedComponent } = args;
        let state = GetState();
        var currentNode = Node(state, Visual(state, SELECTED_NODE));
        let screenNodeId = null;
        let screenComponentId = null;
        let screenNodeOptionId = null;
        let childComponents = [];
        let modelComponentSelectors = [];
        let modelComponentDataChains = [];
        let layout = null;
        let viewModelNodeDirtyId = null;
        let viewModelNodeFocusId = null;
        let viewModelNodeBlurId = null;
        let viewModelNodeFocusedId = null;
        let viewModelNodeId = null;
        viewName = viewName || GetNodeTitle(currentNode);
        let viewPackage = {
            [NodeProperties.ViewPackage]: uuidv4(),
            [NodeProperties.ViewPackageTitle]: viewName
        };
        let viewComponentType = null;
        switch (viewType) {
            case ViewTypes.Get:
                viewComponentType = ComponentTypes.ReactNative.Text.key;
                break;
            default:
                viewComponentType = ComponentTypes.ReactNative.Input.key;
                break;
        }

        let vmsIds = () => ([viewModelNodeDirtyId, viewModelNodeFocusId, viewModelNodeBlurId, viewModelNodeFocusedId, viewModelNodeId]);
        if (GetNodeProp(currentNode, NodeProperties.NODEType) === NodeTypes.Model) {
            let modelProperties = GetModelPropertyChildren(currentNode.id).filter(x => !GetNodeProp(x, NodeProperties.IsDefaultProperty));
            childComponents = modelProperties.map(v => null);
            let apiListLinkOperations = [];
            PerformGraphOperation([!sharedComponent ? {
                operation: ADD_NEW_NODE,
                options: {
                    nodeType: NodeTypes.Screen,
                    callback: (screenNode) => {
                        screenNodeId = screenNode.id;
                    },
                    properties: {
                        ...viewPackage,
                        [NodeProperties.UIText]: `${viewName} Form`
                    }
                }
            } : false, !sharedComponent ? {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: InstanceTypes.ScreenInstance,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeId = res[0].id;
                        return false;
                    }
                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNode) => {
                            viewModelNodeId = viewModelNode.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM`,
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
                }
            } : false, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceDirty,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeDirtyId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeDirty) => {
                            viewModelNodeDirtyId = viewModelNodeDirty.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM Dirty`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceDirty
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    };
                }
            }, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceFocus,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeFocusId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeFocus) => {
                            viewModelNodeFocusId = viewModelNodeFocus.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM Focus`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceFocus
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            }, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceFocused,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeFocusedId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeFocused) => {
                            viewModelNodeFocusedId = viewModelNodeFocused.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM Focused`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceFocused
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            }, {
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let res = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceBlur,
                        [NodeProperties.NODEType]: NodeTypes.ViewModel
                    }, graph);
                    if (res && res.length) {
                        viewModelNodeBlurId = res[0].id;
                        return false;
                    }

                    return {
                        nodeType: NodeTypes.ViewModel,
                        callback: (viewModelNodeBlur) => {
                            viewModelNodeBlurId = viewModelNodeBlur.id;
                        },
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} VM Blur`,
                            [NodeProperties.Model]: currentNode.id,
                            [NodeProperties.InstanceType]: InstanceTypes.ScreenInstanceBlur
                        },
                        links: [{
                            target: currentNode.id,
                            linkProperties: {
                                properties: { ...LinkProperties.ViewModelLink }
                            }
                        }]
                    }
                }
            }, !sharedComponent ? {
                operation: NEW_SCREEN_OPTIONS,
                options: function () {
                    return {
                        callback: (screenOptionNode) => {
                            screenNodeOptionId = screenOptionNode.id;
                        },
                        parent: screenNodeId,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} React Native Form`,
                            [NodeProperties.UIType]: UITypes.ReactNative
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ScreenOptionsLink }
                        }
                    }
                }
            } : false, {
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
                            ...viewPackage,
                            [NodeProperties.UIText]: `${viewName} RNC`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.SharedComponent]: sharedComponent,
                            [NodeProperties.ComponentType]: ComponentTypes.ReactNative.Form.key,
                            [NodeProperties.Layout]: layout,
                            [NodeProperties.Pinned]: false
                        },
                        groupProperties: {
                        },
                        linkProperties: {
                            properties: { ...LinkProperties.ComponentLink }
                        }
                    }
                }
            }, {
                operation: CHANGE_NODE_PROPERTY,
                options: function () {
                    let formLayout = CreateLayout();
                    formLayout = SetCellsLayout(formLayout, 1);
                    let rootCellId = GetFirstCell(formLayout);
                    let cellProperties = GetCellProperties(formLayout, rootCellId);
                    cellProperties.style = { ...cellProperties.style, flexDirection: 'column' };

                    cellProperties.children[rootCellId] = screenComponentId;
                    return {
                        prop: NodeProperties.Layout,
                        value: formLayout,
                        id: screenNodeOptionId
                    }
                }
            }, ...modelProperties.map((modelProperty, modelIndex) => {
                switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                    case NodeTypes.Model:
                        return {};
                    case NodeTypes.Property:
                        if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                            //if the property is a model reference, it should be a shared component or something.
                            return {};
                        }
                        break;
                }

                return {
                    operation: NEW_COMPONENT_NODE,
                    options: function () {
                        let componentTypeToUse = viewComponentType;

                        //Check if the property has a default view to use for different types of situations

                        let sharedComponent = GetSharedComponentFor(viewType, modelProperty);

                        return {
                            parent: screenComponentId,
                            groupProperties: {
                            },
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `${GetNodeTitle(modelProperty)} RNC`,
                                [NodeProperties.UIType]: UITypes.ReactNative,
                                [NodeProperties.Label]: GetNodeTitle(modelProperty),
                                [NodeProperties.ComponentType]: sharedComponent || componentTypeToUse
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.ComponentLink }
                            },
                            callback: (component) => {
                                childComponents[modelIndex] = component.id;
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
                            ...viewPackage,
                            [NodeProperties.UIText]: ` ${Titles.Execute} Button ${viewName} Component`,
                            [NodeProperties.UIType]: UITypes.ReactNative,
                            [NodeProperties.Label]: `${viewName} ${Titles.Execute}`,
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
                switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                    case NodeTypes.Model:

                        return {};
                    case NodeTypes.Property:
                        if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                            //if the property is a model reference, it should be a shared component or something.
                            return {};
                        }
                        break;
                }
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
                let sharedComponent = GetSharedComponentFor(viewType, modelProperty);
                if (!sharedComponent) {
                    switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                        case NodeTypes.Model:
                            return {};
                        case NodeTypes.Property:
                            if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                                //if the property is a model reference, it should be a shared component or something.
                                return {};
                            }
                            break;
                    }
                }
                return {
                    operation: CHANGE_NODE_PROPERTY,
                    options: function (graph) {
                        let componentProps = createComponentApi();
                        let componentTypes = ComponentTypes.ReactNative;
                        let compNodeId = childComponents[modelIndex];
                        let compNode = GetNodeById(compNodeId, graph)
                        let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                        if (!sharedComponent && componentTypes[componentType]) {
                            componentTypes[componentType].defaultApi.map(x => {
                                componentProps = addComponentApi(componentProps, {
                                    modelProp: x.property
                                });
                            });
                        }
                        else if (sharedComponent) {
                            SHARED_COMPONENT_API.map(x => {
                                componentProps = addComponentApi(componentProps, {
                                    modelProp: x.property
                                });
                            });
                        }
                        else {
                            throw 'sharedComponent should be set'
                        }

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
            }].filter(x => x))(GetDispatchFunc(), GetStateFunc());

            PerformGraphOperation([({
                operation: ADD_NEW_NODE,
                options: function (graph) {
                    let selectorNode = GetNodesByProperties({
                        [NodeProperties.Model]: currentNode.id,
                        [NodeProperties.NODEType]: NodeTypes.Selector
                    }).find(x => x);
                    if (selectorNode) {
                        modelComponentSelectors.push(selectorNode.id);
                        return false;
                    }
                    return {
                        nodeType: NodeTypes.Selector,
                        properties: {
                            ...viewPackage,
                            [NodeProperties.UIText]: GetNodeTitle(currentNode),
                            [NodeProperties.Model]: currentNode.id
                        },
                        links: [...vmsIds().map(t => ({
                            target: t,
                            linkProperties: {
                                properties: {
                                    ...LinkProperties.SelectorLink
                                }
                            }
                        }))],
                        callback: (selector) => {
                            modelComponentSelectors.push(selector.id);
                        }
                    }
                }
            })])(GetDispatchFunc(), GetStateFunc());

            let propertyDataChainAccesors = [];

            let datachainLink = [];

            modelProperties.map((modelProperty, propertyIndex) => {
                let propNodeId = null;
                let skip = false;
                switch (GetNodeProp(modelProperty, NodeProperties.NODEType)) {
                    case NodeTypes.Model:
                        return {};
                    case NodeTypes.Property:
                        if (GetNodeProp(modelProperty, NodeProperties.UseModelAsType)) {
                            //if the property is a model reference, it should be a shared component or something.
                            return {};
                        }
                        break;
                }

                PerformGraphOperation([{
                    operation: ADD_NEW_NODE,
                    options: function (graph) {
                        let node = GetNodesByProperties({
                            [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
                            [NodeProperties.Selector]: modelComponentSelectors[0],
                            [NodeProperties.SelectorProperty]: viewModelNodeId,
                            [NodeProperties.Property]: modelProperty.id
                        }).find(x => x);
                        if (node) {
                            propNodeId = node.id;
                            skip = true;
                            propertyDataChainAccesors.push(propNodeId);
                            return null;
                        }
                        return {
                            nodeType: NodeTypes.DataChain,
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `Get ${viewName} Object => ${GetNodeTitle(modelProperty)}`,
                                [NodeProperties.EntryPoint]: true,
                                [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Selector,
                                [NodeProperties.Selector]: modelComponentSelectors[0],
                                [NodeProperties.SelectorProperty]: viewModelNodeId,
                                [NodeProperties.Pinned]: false,
                                [NodeProperties.Property]: modelProperty.id
                            },
                            links: [{
                                target: modelComponentSelectors[0],
                                linkProperties: {
                                    properties: { ...LinkProperties.DataChainLink }
                                }
                            }, {
                                target: viewModelNodeId,
                                linkProperties: {
                                    properties: { ...LinkProperties.DataChainLink }
                                }
                            }],
                            callback: (propNode) => {
                                propNodeId = propNode.id;
                                propertyDataChainAccesors.push(propNodeId);
                            }
                        }
                    }
                }, {
                    operation: ADD_NEW_NODE,
                    options: function (graph) {
                        if (skip) {
                            return {};
                        }
                        return {
                            parent: propNodeId,
                            nodeType: NodeTypes.DataChain,
                            groupProperties: {
                                [GroupProperties.ExternalEntryNode]: GetNodeProp(GetNodeById(propNodeId), NodeProperties.ChainParent),
                                [GroupProperties.GroupEntryNode]: propNodeId,
                                [GroupProperties.GroupExitNode]: propNodeId,
                                [GroupProperties.ExternalExitNode]: GetDataChainNextId(propNodeId)
                            },
                            properties: {
                                ...viewPackage,
                                [NodeProperties.UIText]: `Get ${GetNodeTitle(modelProperty)}`,
                                [NodeProperties.ChainParent]: propNodeId,
                                [NodeProperties.AsOutput]: true,
                                [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Property,
                                [NodeProperties.Pinned]: false,
                                [NodeProperties.UIModelType]: currentNode.id,
                                [NodeProperties.Property]: modelProperty.id
                            },
                            linkProperties: {
                                properties: { ...LinkProperties.DataChainLink }
                            },
                            links: [{
                                target: currentNode.id,
                                linkProperties: {
                                    properties: { ...LinkProperties.ModelTypeLink }
                                }
                            }, {
                                target: modelProperty.id,
                                linkProperties: {
                                    properties: { ...LinkProperties.PropertyLink }
                                }
                            }],
                            callback: (node, graph) => {

                            }
                        }
                    }
                }])(GetDispatchFunc(), GetStateFunc());;

                let compNodeId = childComponents[propertyIndex];

                let compNode = GetNodeById(compNodeId)
                let componentType = GetNodeProp(compNode, NodeProperties.ComponentType);
                let componentApi = GetNodeProp(compNode, NodeProperties.ComponentApi);

                let rootCellId = GetFirstCell(layout);
                let children = GetChildren(layout, rootCellId);
                let childId = children[propertyIndex];
                let apiList = getComponentApiList(componentApi);
                let apiDataChainLists = {};
                PerformGraphOperation([...apiList.map(api => {
                    let apiProperty = api.value;
                    if (ARE_BOOLEANS.some(v => v === apiProperty) || ARE_HANDLERS.some(v => v === apiProperty)) {
                        return false;
                    }
                    let dca = null;
                    let completeId = null;
                    let splitId = null;
                    return [{
                        operation: ADD_NEW_NODE,
                        options: function (graph) {
                            return {
                                nodeType: NodeTypes.DataChain,
                                properties: {
                                    ...viewPackage,
                                    [NodeProperties.UIText]: `${viewName} ${GetNodeTitle(modelProperty)} ${apiProperty}`,
                                    [NodeProperties.DataChainFunctionType]: DataChainFunctionKeys.Pass,
                                    [NodeProperties.EntryPoint]: true
                                },
                                links: [],
                                callback: (dataChainApis) => {
                                    dca = dataChainApis.id;
                                    apiDataChainLists[apiProperty] = (dataChainApis.id);
                                }
                            }
                        }
                    }, {
                        operation: ADD_NEW_NODE,
                        options: function (graph) {
                            let temp = SplitDataCommand(GetNodeById(dca, graph), split => {
                                splitId = split.id;
                            }, viewPackage);
                            return temp.options;
                        }
                    }, {
                        operation: ADD_NEW_NODE,
                        options: function (graph) {

                            let temp = AddChainCommand(GetNodeById(splitId, graph), complete => {
                                completeId = complete.id;
                            }, graph, viewPackage);
                            return temp.options;
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.DataChainFunctionType,
                                id: completeId,
                                value: DataChainFunctionKeys.Pass
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.UIText,
                                id: completeId,
                                value: `${apiProperty} Complete`
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.AsOutput,
                                id: completeId,
                                value: true
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.DataChainFunctionType,
                                id: splitId,
                                value: DataChainFunctionKeys.ReferenceDataChain
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.UIText,
                                id: splitId,
                                value: `${GetNodeTitle(modelProperty)} ${apiProperty}`
                            }
                        }
                    }, {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            return {
                                prop: NodeProperties.DataChainReference,
                                id: splitId,
                                value: propNodeId
                            }
                        }
                    }, {
                        operation: ADD_LINK_BETWEEN_NODES,
                        options: function (graph) {
                            return {
                                source: splitId,
                                target: propNodeId,
                                properties: { ...LinkProperties.DataChainLink }
                            }
                        }
                    }]
                }).flatten().filter(x => x)])(GetDispatchFunc(), GetStateFunc());
                PerformGraphOperation([...apiList.map(api => {
                    return {
                        operation: CHANGE_NODE_PROPERTY,
                        options: function (graph) {
                            let apiProperty = api.value;
                            let cellProperties = GetCellProperties(layout, childId);
                            cellProperties.componentApi = cellProperties.componentApi || {};
                            // let { instanceType, model, selector, handlerType, dataChain, modelProperty } = cellProperties.componentApi[apiProperty] || {};
                            if (ARE_BOOLEANS.some(v => v === apiProperty)) {
                                cellProperties.componentApi[apiProperty] = {
                                    instanceType: InstanceTypes.Boolean,
                                    handlerType: HandlerTypes.Property,
                                }
                            }
                            else if (ARE_HANDLERS.some(v => v === apiProperty)) {
                                if ([ARE_TEXT_CHANGE].some(v => v === apiProperty)) {
                                    cellProperties.componentApi[apiProperty] = {
                                        instanceType: InstanceTypes.ScreenInstance,
                                        handlerType: HandlerTypes.ChangeText
                                    };
                                }
                                else {
                                    cellProperties.componentApi[apiProperty] = {
                                        instanceType: InstanceTypes.ScreenInstance,
                                        handlerType: HandlerTypes.Change,
                                    }
                                }
                            }
                            else {
                                cellProperties.componentApi[apiProperty] = {
                                    instanceType: InstanceTypes.Selector,
                                    selector: modelComponentSelectors[0],
                                    handlerType: HandlerTypes.Property,
                                }
                                if (apiDataChainLists[apiProperty]) {
                                    datachainLink.push({
                                        operation: ADD_LINK_BETWEEN_NODES,
                                        options: function () {
                                            return {
                                                target: modelComponentSelectors[0],
                                                source: compNodeId,
                                                linkProperties: {
                                                    ...LinkProperties.SelectorLink
                                                }
                                            }
                                        }
                                    })
                                }
                            }

                            if (apiProperty === VALUE) {
                                cellProperties.componentApi[apiProperty].dataChain = propertyDataChainAccesors[propertyIndex];
                                datachainLink.push({
                                    operation: ADD_LINK_BETWEEN_NODES,
                                    options: function () {
                                        return {
                                            target: propertyDataChainAccesors[propertyIndex],
                                            source: compNodeId,
                                            linkProperties: {
                                                ...LinkProperties.DataChainLink,
                                                cell: childId,
                                                selectedComponentApiProperty: apiProperty
                                            }
                                        }
                                    }
                                })

                            }

                            switch (apiProperty) {
                                case ON_BLUR:
                                    cellProperties.componentApi[apiProperty].model = viewModelNodeBlurId;
                                    cellProperties.componentApi[apiProperty].modelProperty = modelProperties[propertyIndex].id;
                                    cellProperties.componentApi[apiProperty].handlerType = HandlerTypes.Blur;
                                    break;
                                case ON_CHANGE_TEXT:
                                case ON_CHANGE:
                                    cellProperties.componentApi[apiProperty].model = viewModelNodeId;
                                    cellProperties.componentApi[apiProperty].modelProperty = modelProperties[propertyIndex].id;
                                    break;
                                case ON_FOCUS:
                                    cellProperties.componentApi[apiProperty].model = viewModelNodeFocusId;
                                    cellProperties.componentApi[apiProperty].modelProperty = modelProperties[propertyIndex].id;
                                    cellProperties.componentApi[apiProperty].handlerType = HandlerTypes.Focus;
                                    break;
                            }
                            if (cellProperties.componentApi[apiProperty].modelProperty) {
                                datachainLink.push({
                                    operation: ADD_LINK_BETWEEN_NODES,
                                    options: function () {
                                        return {
                                            target: cellProperties.componentApi[apiProperty].modelProperty,
                                            source: compNodeId,
                                            linkProperties: {
                                                ...LinkProperties.ComponentApi,
                                                modelProperty: true
                                            }
                                        }
                                    }
                                })
                            }

                            if (cellProperties.componentApi[apiProperty].model) {
                                datachainLink.push({
                                    operation: ADD_LINK_BETWEEN_NODES,
                                    options: function () {
                                        return {
                                            target: cellProperties.componentApi[apiProperty].model,
                                            source: compNodeId,
                                            linkProperties: {
                                                ...LinkProperties.ComponentApi,
                                                model: true
                                            }
                                        }
                                    }
                                })
                            }

                            return {
                                prop: NodeProperties.Layout,
                                id: screenComponentId,
                                value: layout
                            }
                        }
                    }
                })])(GetDispatchFunc(), GetStateFunc());
            });

            PerformGraphOperation(datachainLink)(GetDispatchFunc(), GetStateFunc());

            PerformGraphOperation([
                ...([].interpolate(0, modelProperties.length + 1, modelIndex => {
                    return applyDefaultComponentProperties(GetNodeById(childComponents[modelIndex]), UITypes.ReactNative)

                })).flatten(),
            ])(GetDispatchFunc(), GetStateFunc());

        }
    }
};


export function applyDefaultComponentProperties(currentNode, _ui_type) {
    // var { state } = this.props;
    // var currentNode = Node(state, Visual(state, SELECTED_NODE));
    // let screenOption = currentNode ? GetConnectedNodeByType(state, currentNode.id, NodeTypes.ScreenOption) || GetConnectedNodeByType(state, currentNode.id, NodeTypes.ComponentNode, TARGET) : null;
    // let _ui_type = GetNodeProp(screenOption, NodeProperties.UIType);
    let result = [];
    if (currentNode) {
        let componentTypes = ComponentTypes[_ui_type] || {};
        let componentType = GetNodeProp(currentNode, NodeProperties.ComponentType);
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
    }

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


export function CreateAgentFunction(option) {
    let {
        nodePackageType,
        methodType,
        maestroNodeId,
        parentId: parent,
        httpMethod,
        functionType,
        functionName,
        model,
        agent
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
        let { dispatch, getState } = args;
        //Check for existing method of this type

        // if no methods exist, then create a new method.
        // graph = GraphMethods.addNewNodeOfType(graph, options, NodeTypes.Model);

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
                                        case FunctionTemplateKeys.ModelOutput:
                                        case FunctionTemplateKeys.Agent:
                                        case FunctionTemplateKeys.Parent:
                                        case FunctionTemplateKeys.User:
                                        case FunctionTemplateKeys.ModelOutput:
                                            methodProps = { ...methodProps, ...(GetNodeProp(GetNodeById(methodNode.id), NodeProperties.MethodProps) || {}) };
                                            if (constraint[NodeProperties.IsAgent]) {
                                                methodProps[constraint.key] = agent.id;
                                            }
                                            else if (constraint.key === FunctionTemplateKeys.User) {
                                                methodProps[constraint.key] = GetNodeProp(GetNodeById(agent.id), NodeProperties.UIUser) || GetUsers()[0].id;
                                            }
                                            else if (constraint.key === FunctionTemplateKeys.Parent) {
                                                methodProps[constraint.key] = parent.id;
                                            }
                                            else {
                                                methodProps[constraint.key] = model.id;
                                            }
                                            break;
                                        case FunctionTemplateKeys.Validator:
                                            let validator = null;
                                            PerformGraphOperation([{
                                                operation: ADD_NEW_NODE,
                                                options: function () {
                                                    return {
                                                        parent: methodNode.id,
                                                        nodeType: NodeTypes.Validator,
                                                        groupProperties: {},
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.Collapsed]: true,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} Validator`,
                                                            [NodeProperties.ValidatorModel]: model.id,
                                                            [NodeProperties.ValidatorAgent]: agent.id,
                                                            [NodeProperties.ValidatorFunction]: methodNode.id
                                                        },
                                                        callback: (_node) => {
                                                            methodProps[constraint.key] = _node.id;
                                                            validator = _node;
                                                        }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: model.id,
                                                        source: validator.id,
                                                        properties: { ...LinkProperties.ValidatorModelLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: agent.id,
                                                        source: validator.id,
                                                        properties: { ...LinkProperties.ValidatorAgentLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: methodNode.id,
                                                        source: validator.id,
                                                        properties: { ...LinkProperties.ValidatorFunctionLink }
                                                    }
                                                }
                                            }])(GetDispatchFunc(), GetStateFunc());
                                            break;
                                        case FunctionTemplateKeys.Executor:
                                            let executor = null;
                                            PerformGraphOperation([{
                                                operation: ADD_NEW_NODE,
                                                options: function () {
                                                    return {
                                                        parent: methodNode.id,
                                                        nodeType: NodeTypes.Executor,
                                                        groupProperties: {},
                                                        properties: {
                                                            [NodeProperties.NodePackage]: model.id,
                                                            [NodeProperties.NodePackageType]: nodePackageType,
                                                            [NodeProperties.ExecutorFunctionType]: methodType,
                                                            [NodeProperties.UIText]: `${GetNodeTitle(methodNode)} Executor`,
                                                            [NodeProperties.ExecutorModel]: model.id,
                                                            [NodeProperties.ExecutorModelOutput]: model.id,
                                                            [NodeProperties.ExecutorFunction]: methodNode.id,
                                                            [NodeProperties.ExecutorAgent]: agent.id,
                                                        },
                                                        callback: (_node) => {
                                                            methodProps[constraint.key] = _node.id;
                                                            executor = _node;
                                                        }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: model.id,
                                                        source: executor.id,
                                                        properties: { ...LinkProperties.ExecutorModelLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: agent.id,
                                                        source: executor.id,
                                                        properties: { ...LinkProperties.ExecutorAgentLink }
                                                    }
                                                }
                                            }, {
                                                operation: ADD_LINK_BETWEEN_NODES,
                                                options: function () {
                                                    return {
                                                        target: methodNode.id,
                                                        source: executor.id,
                                                        properties: { ...LinkProperties.ExecutorFunctionLink }
                                                    }
                                                }
                                            }])(GetDispatchFunc(), GetStateFunc());
                                            break;
                                        case FunctionTemplateKeys.Permission:
                                        case FunctionTemplateKeys.ModelFilter:
                                            let perOrModelNode = null;
                                            PerformGraphOperation([({
                                                operation: ADD_NEW_NODE,
                                                options: function () {
                                                    return {
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
                                                }
                                            })])(GetDispatchFunc(), GetStateFunc());
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

                                PerformGraphOperation(commands)(dispatch, getState)
                                resolve();
                            })
                        }, 1500)
                    }
                }
            }]
            PerformGraphOperation(outer_commands)(dispatch, getState);
        }

    }
}

function GetSharedComponentFor(viewType, modelProperty) {
    switch (viewType) {
        case ViewTypes.Get:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGet);
        case ViewTypes.Create:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeCreate);
        case ViewTypes.Delete:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeDelete);
        case ViewTypes.GetAll:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeGetAll);
        case ViewTypes.Update:
            return GetNodeProp(modelProperty, NodeProperties.DefaultViewTypeUpdate);
    }
}