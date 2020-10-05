import { AddMethodDefinition, FlowAsync, FlowCodeTypes, FlowEnumerable, FlowGeneric, FlowRequired, FlowTypes } from "./flowcode";

/// GetItem(modelType: any, id: any): ModelType | null
AddMethodDefinition(FlowCodeTypes, 'GetItem', {
    modelType: {
        type: [
            [FlowTypes.String],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    },
    outputType: {
        type: [
            [FlowTypes.ModelType],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    },
    id: {
        type: [
            [FlowTypes.String],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    }
}, {
    output: {
        matchInputType: 'outputType',
        type: [
            [FlowTypes.ModelType],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    }
});

// function GetItems(modelType: any) 
AddMethodDefinition(FlowCodeTypes, 'GetItems', {
    modelType: {
        type: [
            [FlowTypes.String],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    },
    outputType: {
        type: [
            [FlowTypes.ModelType],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    }
}, {
    output: {
        matchInputType: 'outputType',
        type: [
            [FlowTypes.ModelType],
            FlowGeneric.False,
            FlowEnumerable.True,
            FlowAsync.False,
            FlowRequired.True, undefined]
    }
});
// function GetItems(modelType: any) 
AddMethodDefinition(FlowCodeTypes, 'GetScreenProperties', {
    screen: {
        type: [
            [FlowTypes.String],
            FlowGeneric.False,
            FlowEnumerable.False,
            FlowAsync.False,
            FlowRequired.True, undefined]
    }
}, {
    output: {
        matchInputType: 'outputType',
        type: [
            [FlowTypes.Any],
            FlowGeneric.Any,
            FlowEnumerable.Any,
            FlowAsync.False,
            FlowRequired.True, undefined]
    }
});