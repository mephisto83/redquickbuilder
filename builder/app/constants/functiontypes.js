import * as Titles from '../components/titles';
import fs from 'fs';

export const FunctionTypes = {
    //Functions with List<Child> result
    Create_Parent$Child_Agent_Value__IListChild: 'Create/Parent-Child/Agent/Value => IList<Child>',
    Update_Parent$Child_Agent_Value__IListChild: 'Update/Parent-Child/Agent/Value => IList<Child>',
    Get_Parent$Child_Agent_Value__IListChild: 'Get/Parent-Child/Agent/Value => IList<Child>',
    Delete_Parent$Child_Agent_Value__IListChild: 'Delete/Parent-Child/Agent/Value => IList<Child>',

    //Functions with List<Object> result
    Create_Object_Agent_Value__IListObject: 'Create/Object/Agent/Value => IList<Object>',
    Update_Object_Agent_Value__IListObject: 'Update/Object/Agent/Value => IList<Object>',
    Get_Object_Agent_Value__IListObject: 'Get/Object/Agent/Value => IList<Object>',
    Delete_Object_Agent_Value__IListObject: 'Delete/Object/Agent/Value => IList<Object>',

    //Functions with Object result
    Create_Parent_Child_Agent_Value__Child: 'Create/Parent-Child/Agent/Value => Child',
    Update_Parent_Child_Agent_Value__Child: 'Update/Parent-Child/Agent/Value => Child',
    Get_Parent_Child_Agent_Value__Child: 'Get/Parent-Child/Agent/Value => Child',
    Delete_Parent_Child_Agent_Value__Child: 'Delete/Parent-Child/Agent/Value => Child',

    //Functions width Object result.
    Create_Object_Agent_Value__Object: 'Create/Object/Agent/Value => Object',
    Update_Object_Agent_Value__Object: 'Update/Object/Agent/Value => Object',
    Get_Object_Agent_Value__Object: 'Get/Object/Agent/Value => Object',
    Delete_Object_Agent_Value__Object: 'Delete/Object/Agent/Value => Object',

    //Function with bool result
    IAgent_and_Permission_determing_the_permission_based_on_a_PROPERTY: 'Given an Agent and Permission, determing the permission based on a PROPERTY'
}


export const FunctionTemplateKeys = {
    Model: 'model',
    Parent: 'parent',
    AgentType: 'agent_type',
    User: 'user',
    UserInstance: 'user_instance',
    Value: 'value'
}

export const FunctionConstraintKeys = {
    IsAgent: 'isAgent',
    IsUser: 'isUser',
    IsTypeOf: 'isTypeOf',
    IsParent: 'isParent',
    IsChild: 'isChild',
    IsList: 'isList'
}
// Synchronous read

export const Functions = {
    [FunctionTypes.Create_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Create_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/create_agent_childparent_listchild.tpl', 'utf-8'),
        constraints: {
            [FunctionTemplateKeys.Model]: {
                [FunctionConstraintKeys.IsChild]: FunctionTemplateKeys.Parent
            },
            [FunctionTemplateKeys.Parent]: {
                [FunctionConstraintKeys.IsParent]: FunctionTemplateKeys.Model
            },
            [FunctionTemplateKeys.AgentType]: {
                [FunctionConstraintKeys.IsAgent]: true
            },
            [FunctionTemplateKeys.User]: {
                [FunctionConstraintKeys.IsUser]: true
            },
            [FunctionTemplateKeys.UserInstance]: {
                [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.User
            },
            [FunctionTemplateKeys.Value]: {
                [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Model
            }
        },
        output: {
            [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Model,
            [FunctionConstraintKeys.IsList]: true
        }
    }
}


export const FunctionMethodTypes = {
    GET: 'GET',
    CREATE: 'CREATE',
    DELETE: 'DELETE',
    UPDATE: 'UPDATE'
}

export const FunctionPerpetrators = {
    Agent: 'Agent',
    System: 'System' // This is theorhetical atm 23.05.2019
}

export const ReturnTypes = {
    CHILD: 'CHILD',
    OBJECT: 'OBJECT',
    LISTCHILD: 'LISTCHILD',
    LISTOBJECT: 'LISTOBJECT', //May end up being a different dimension,
    BOOL: 'BOOL'
}