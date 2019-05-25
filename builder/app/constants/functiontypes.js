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
    Can_Execute_Agent_Parent_In_Valid_List: 'Can_Execute_Agent_Parent_In_Valid_List'
    // IAgent_and_Permission_determing_the_permission_based_on_a_PROPERTY: 'Given an Agent and Permission, determing the permission based on a PROPERTY'
}


export const FunctionTemplateKeys = {
    Model: 'model',
    Bool: 'bool',
    CanExecute: 'can-execute',
    ModelDeterminingProperty: 'model-determining-property',
    AgentDeterminingProperty: 'agent-determining-property',
    Property: 'property',
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
    IsList: 'isList',
    IsSingleLink: '$single$link',
    IsModel: 'isModel',
    IsFunction: 'isFunction',
    IsProperty: 'isProperty',
    IsEnumerable: 'isEnumerable',
    IsInstanceVariable: 'isInstanceVariable',
    IsInputVariable: 'isInputVariable'
}

const COMMON_CONSTRAINTS = {
    [FunctionTemplateKeys.CanExecute]: {
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsFunction]: true,
        key: FunctionTemplateKeys.CanExecute
    },
    [FunctionTemplateKeys.Model]: {
        [FunctionConstraintKeys.IsChild]: FunctionTemplateKeys.Parent,
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsModel]: true,
        key: FunctionTemplateKeys.Model
    },
    [FunctionTemplateKeys.ModelDeterminingProperty]: {
        [FunctionConstraintKeys.IsChild]: FunctionTemplateKeys.Model,
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsProperty]: true,
        key: FunctionTemplateKeys.ModelDeterminingProperty
    },
    [FunctionTemplateKeys.Parent]: {
        [FunctionConstraintKeys.IsParent]: FunctionTemplateKeys.Model,
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsModel]: true,
        key: FunctionTemplateKeys.Parent
    },
    [FunctionTemplateKeys.AgentType]: {
        [FunctionConstraintKeys.IsAgent]: true,
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsModel]: true,
        key: FunctionTemplateKeys.AgentType
    },
    [FunctionTemplateKeys.User]: {
        [FunctionConstraintKeys.IsUser]: true,
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsModel]: true,
        key: FunctionTemplateKeys.User
    },
    [FunctionTemplateKeys.UserInstance]: {
        [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.User,
        [FunctionConstraintKeys.IsSingleLink]: true,
        key: FunctionTemplateKeys.UserInstance,
        [FunctionConstraintKeys.IsInstanceVariable]: true,
        [FunctionConstraintKeys.IsInputVariable]: true
    },
    [FunctionTemplateKeys.Value]: {
        [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Model,
        [FunctionConstraintKeys.IsSingleLink]: true,
        key: FunctionTemplateKeys.Value,
        [FunctionConstraintKeys.IsInstanceVariable]: true,
        [FunctionConstraintKeys.IsInputVariable]: true
    }
};

const COMMON_OUTPUT = {
    LIST: {
        [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Model,
        [FunctionConstraintKeys.IsList]: true
    },
    BOOL: {
        [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Bool
    }
}
export const INTERNAL_TEMPLATE_REQUIREMENTS = {
    METHODS: 'methods',
    PARAMETERS: 'parameters',
    PARAMETERSCLASS: 'Parameters', // Classes hold the parameters, that go to Change classes. See create____.tpl templates.
    CHANGECLASS: 'Change', // Class objects are passed to streams for processing
    RESPONSECLASS: 'Response', // When stream processing completes, these are sent back.
    STREAMPROCESS: 'StreamProcess',
    DETERMINING_PROPERTY: 'determining_property',
    PARENTS_ID_PROPERTY: 'parentIdProperty',
    MODEL: 'model',
    CONSTRUCTORS: 'constructors',
    TEMPLATE: 'template',
    PARENT: 'parent',
    PROPERTY: 'property',
    METHOD: {
        CREATE: 'Create',
        UPDATE: 'Update',
        PROCESS: 'Process'
    }
}
export const FUNCTION_REQUIREMENT_KEYS = {
    CLASSES: 'classes'
}
const COMMON_FUNCTION_REQUIREMENTS = {
    [FUNCTION_REQUIREMENT_KEYS.CLASSES]: {
        [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERSCLASS]: {
            [INTERNAL_TEMPLATE_REQUIREMENTS.TEMPLATE]: fs.readFileSync('./app/templates/stream_process/stream_process_parameter_class.tpl', 'utf-8'),
            [INTERNAL_TEMPLATE_REQUIREMENTS.CONSTRUCTORS]: fs.readFileSync('./app/templates/stream_process/stream_process_parameter_class.tpl', 'utf-8'),
            [INTERNAL_TEMPLATE_REQUIREMENTS.MODEL]: FunctionTemplateKeys.Model,
            [INTERNAL_TEMPLATE_REQUIREMENTS.METHODS]: {
                [INTERNAL_TEMPLATE_REQUIREMENTS.METHOD.CREATE]: {
                    [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERS]: [
                        FunctionTemplateKeys.AgentType,
                        FunctionTemplateKeys.Model
                    ]
                },
                [INTERNAL_TEMPLATE_REQUIREMENTS.METHOD.UPDATE]: {
                    [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERS]: [
                        FunctionTemplateKeys.AgentType,
                        FunctionTemplateKeys.Model
                    ]
                }
            }
        },
        [INTERNAL_TEMPLATE_REQUIREMENTS.CHANGECLASS]: {
            [INTERNAL_TEMPLATE_REQUIREMENTS.TEMPLATE]: fs.readFileSync('./app/templates/stream_process/stream_process_change_class.tpl', 'utf-8'),
            [INTERNAL_TEMPLATE_REQUIREMENTS.CONSTRUCTORS]: fs.readFileSync('./app/templates/stream_process/stream_process_change_class.tpl', 'utf-8'),
            [INTERNAL_TEMPLATE_REQUIREMENTS.MODEL]: FunctionTemplateKeys.Model,
            [INTERNAL_TEMPLATE_REQUIREMENTS.METHODS]: {
                [INTERNAL_TEMPLATE_REQUIREMENTS.METHOD.CREATE]: {
                    [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERS]: [
                        INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERSCLASS
                    ]
                }
            }
        },
        [INTERNAL_TEMPLATE_REQUIREMENTS.RESPONSECLASS]: {
            [INTERNAL_TEMPLATE_REQUIREMENTS.MODEL]: FunctionTemplateKeys.Model,
            [INTERNAL_TEMPLATE_REQUIREMENTS.METHODS]: {
                [INTERNAL_TEMPLATE_REQUIREMENTS.METHOD.CREATE]: {
                    [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERS]: [
                        INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERSCLASS
                    ]
                }
            }
        }
    },
    attachment_methods: {
        [INTERNAL_TEMPLATE_REQUIREMENTS.STREAMPROCESS]: {
            [INTERNAL_TEMPLATE_REQUIREMENTS.MODEL]: FunctionTemplateKeys.Model,
            [INTERNAL_TEMPLATE_REQUIREMENTS.METHODS]: {
                [INTERNAL_TEMPLATE_REQUIREMENTS.METHOD.PROCESS]: {
                    [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERS]: [
                        INTERNAL_TEMPLATE_REQUIREMENTS.CHANGECLASS
                    ]
                }
            }
        }
    },
    propreties: {
        [INTERNAL_TEMPLATE_REQUIREMENTS.DETERMINING_PROPERTY]: {
            [INTERNAL_TEMPLATE_REQUIREMENTS.MODEL]: FunctionTemplateKeys.Model,
            [INTERNAL_TEMPLATE_REQUIREMENTS.PROPERTY]: FunctionTemplateKeys.Property,
        }
    }
}

export const Functions = {
    [FunctionTypes.Create_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Create_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/create_agent_childparent_listchild.tpl', 'utf-8'),
        constraints: { ...COMMON_CONSTRAINTS },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        ...COMMON_FUNCTION_REQUIREMENTS
    }, [FunctionTypes.Update_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Update_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/update_agent_childparent_listchild.tpl', 'utf-8'),
        constraints: { ...COMMON_CONSTRAINTS },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        ...COMMON_FUNCTION_REQUIREMENTS
    }, [FunctionTypes.Get_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Get_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/get_agent_childparent_listchild.tpl', 'utf-8'),
        constraints: { ...COMMON_CONSTRAINTS },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        ...COMMON_FUNCTION_REQUIREMENTS
    },
    [FunctionTypes.Can_Execute_Agent_Parent_In_Valid_List]: {
        title: Titles.Can_Execute_Agent_Parent_In_Valid_List,
        template: fs.readFileSync('./app/templates/can_execute/can_execute_childparent_valid_list.tpl', 'utf-8'),
        constraints: {
            [FunctionTemplateKeys.AgentType]: {
                [FunctionConstraintKeys.IsAgent]: true,
                [FunctionConstraintKeys.IsSingleLink]: true,
                [FunctionConstraintKeys.IsModel]: true,
                key: FunctionTemplateKeys.AgentType
            },
            [FunctionTemplateKeys.AgentDeterminingProperty]: {
                [FunctionConstraintKeys.IsChild]: FunctionTemplateKeys.AgentType,
                [FunctionConstraintKeys.IsSingleLink]: true,
                [FunctionConstraintKeys.IsProperty]: true,
                key: FunctionTemplateKeys.AgentDeterminingProperty
            },
            [FunctionTemplateKeys.Model]: {
                [FunctionConstraintKeys.IsSingleLink]: true,
                [FunctionConstraintKeys.IsModel]: true,
                key: FunctionTemplateKeys.Model
            },
            [FunctionTemplateKeys.ModelDeterminingProperty]: {
                [FunctionConstraintKeys.IsChild]: FunctionTemplateKeys.Model,
                [FunctionConstraintKeys.IsSingleLink]: true,
                [FunctionConstraintKeys.IsProperty]: true,
                [FunctionConstraintKeys.IsEnumerable]: true,
                key: FunctionTemplateKeys.ModelDeterminingProperty
            },
        },
        output: {
            ...COMMON_OUTPUT.BOOL
        },
        [FUNCTION_REQUIREMENT_KEYS.CLASSES]: {},
        attachment_methods: {},
        propreties: {}
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

export function hasTemplate(templateString) {
    var singularSymbol = '@';
    var regex = new RegExp('({{)[A-Za-z0-9_.' + singularSymbol + ' ,\'\|]*(}})', 'g');
    var hasTemplate = regex.test(templateString);
    return hasTemplate;
}

export function bindTemplate(templateString, data) {
    var val;
    var singularSymbol = '@';
    var regex = new RegExp('({{)[A-Za-z0-9_.' + singularSymbol + ' ,\'\|]*(}})', 'g');
    var hasTemplate = regex.test(templateString);
    if (hasTemplate) {
        var res = templateString.match(regex);

        res.reverse().unique().map(function (x) {
            return x.split('').subset(2, x.length - 2).join('');
        }).map(function (t) {
            subregex = new RegExp('({{)' + t + '(}})', 'g');
            templateString = templateString.replace(subregex, val === null || val === undefined ? '' : val);
        });
    }
    return templateString;

}