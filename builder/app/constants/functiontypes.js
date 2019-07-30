import * as Titles from '../components/titles';
import fs from 'fs';
import { Methods, NodeTypes, NodeProperties } from './nodetypes';

export const FunctionTypes = {
    //Functions with List<Child> result
    Create_ManyToMany_Agent_Value__IListChild: 'Create/ManyToMany/Agent/Value => IList<Child>',
    Update_ManyToMany_Agent_Value__IListChild: 'Update/ManyToMany/Agent/Value => IList<Child>',
    Get_ManyToMany_Agent_Value__IListChild: 'Get/ManyToMany/Agent/Value => IList<Child>',
    Delete_ManyToMany_Agent_Value__IListChild: 'Delete/ManyToMany/Agent/Value => IList<Child>',

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
    AgentInstance: 'agent_instance',
    Agent: 'agent',
    AgentType: 'agent_type',
    User: 'user',
    ManyToManyModel: 'many_to_many',
    Permission: 'permission',
    UserInstance: 'user_instance',
    ModelFilter: 'model_filter',
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


//Deprecated 6.12.2019
const COMMON_CONSTRAINTS_AGENT_OBJECT = {
    [FunctionTemplateKeys.Model]: {
        [FunctionConstraintKeys.IsSingleLink]: true,
        [FunctionConstraintKeys.IsModel]: true,
        key: FunctionTemplateKeys.Model
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


const COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD = {
    [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Agent]: {
        [NodeProperties.IsAgent]: true,
        key: FunctionTemplateKeys.Agent,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.User]: {
        [NodeProperties.IsUser]: true,
        key: FunctionTemplateKeys.User,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Permission]: {
        key: FunctionTemplateKeys.Permission,
        nodeTypes: [NodeTypes.Permission]
    },
    [FunctionTemplateKeys.ModelFilter]: {
        key: FunctionTemplateKeys.ModelFilter,
        nodeTypes: [NodeTypes.ModelFilter]
    }
};


const COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD = {
    [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Parent]: {
        key: FunctionTemplateKeys.Parent,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Property]: {
        key: FunctionTemplateKeys.Property,
        nodeTypes: [NodeTypes.Property]
    },
    [FunctionTemplateKeys.Agent]: {
        [NodeProperties.IsAgent]: true,
        key: FunctionTemplateKeys.Agent,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.User]: {
        [NodeProperties.IsUser]: true,
        key: FunctionTemplateKeys.User,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Permission]: {
        key: FunctionTemplateKeys.Permission,
        nodeTypes: [NodeTypes.Permission]
    },
    [FunctionTemplateKeys.ManyToManyModel]: {
        [NodeProperties.ManyToManyNexus]: true,
        key: FunctionTemplateKeys.ManyToManyModel,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.ModelFilter]: {
        key: FunctionTemplateKeys.ModelFilter,
        nodeTypes: [NodeTypes.ModelFilter]
    }
};


const COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD = {
    [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Parent]: {
        key: FunctionTemplateKeys.Parent,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Agent]: {
        [NodeProperties.IsAgent]: true,
        key: FunctionTemplateKeys.Agent,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.User]: {
        [NodeProperties.IsUser]: true,
        key: FunctionTemplateKeys.User,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.ManyToManyModel]: {
        [NodeProperties.ManyToManyNexus]: true,
        key: FunctionTemplateKeys.ManyToManyModel,
        nodeTypes: [NodeTypes.Model]
    },
    [FunctionTemplateKeys.Permission]: {
        key: FunctionTemplateKeys.Permission,
        nodeTypes: [NodeTypes.Permission]
    },
    [FunctionTemplateKeys.ModelFilter]: {
        key: FunctionTemplateKeys.ModelFilter,
        nodeTypes: [NodeTypes.ModelFilter]
    }
};


const COMMON_OUTPUT = {
    LIST: {
        [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Model,
        [FunctionConstraintKeys.IsList]: true
    },
    OBJECT: {
        [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.Model,
        [FunctionConstraintKeys.IsList]: false
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
    INTERFACE: 'interface',
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
            [INTERNAL_TEMPLATE_REQUIREMENTS.TEMPLATE]: fs.readFileSync('./app/templates/stream_process/stream_process_parameter_class.tpl', 'utf8'),
            [INTERNAL_TEMPLATE_REQUIREMENTS.CONSTRUCTORS]: fs.readFileSync('./app/templates/stream_process/stream_process_parameter_class.tpl', 'utf8'),
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
            [INTERNAL_TEMPLATE_REQUIREMENTS.TEMPLATE]: fs.readFileSync('./app/templates/stream_process/stream_process_change_class.tpl', 'utf8'),
            [INTERNAL_TEMPLATE_REQUIREMENTS.CONSTRUCTORS]: fs.readFileSync('./app/templates/stream_process/stream_process_change_class.tpl', 'utf8'),
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
export const TEMPLATE_KEY_MODIFIERS = {
    lower: 'lower',
    alllower: 'alllower',
    upper: 'upper'
}
export function ToInterface(i) {
    return `I${i}`;
}
export const HTTP_METHODS = {
    POST: 'HttpPost',
    GET: 'HttpGet',
    DELETE: 'HttpDelete',
    PATCH: 'HttpPatch'
}
export const COMMON_FUNCTION_TEMPLATE_KEYS = {
    model: 'model',
    function_name: 'function_name',
    user: 'user',
    user_instance: 'user_instance',
    value: 'value',
    agent: 'agent',
    agent_type: 'agent_type'
}
export const Functions = {
    [FunctionTypes.Create_Object_Agent_Value__IListObject]: {
        title: Titles.Create_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/create_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/create_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Create,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }, [FunctionTypes.Update_Object_Agent_Value__IListObject]: {
        title: Titles.Update_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/update_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/update_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Update,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }, [FunctionTypes.Delete_Object_Agent_Value__IListObject]: {
        title: Titles.Delete_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/delete_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/delete_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Delete,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Get_Object_Agent_Value__Object]: {
        title: Titles.Get_Object_Agent_Value__Object,
        template: fs.readFileSync('./app/templates/standard/get_model_agent_object.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/get_model_agent_object_interface.tpl', 'utf8'),
        constraints: {
            [FunctionTemplateKeys.ManyToManyModel]: {
                [NodeProperties.ManyToManyNexus]: true,
                key: FunctionTemplateKeys.ManyToManyModel,
                nodeTypes: [NodeTypes.Model]
            },
            ...COMMON_CONSTRAINTS_AGENT_OBJECT
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: false,
        method: Methods.Get,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Get_Object_Agent_Value__IListObject]: {
        title: Titles.Get_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/get_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/get_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.GetAll,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }, [FunctionTypes.Create_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Create_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/create_agent_childparent_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/create_agent_childparent_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Create,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }, [FunctionTypes.Update_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Update_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/update_agent_childparent_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/update_agent_childparent_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Update,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }, [FunctionTypes.Get_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Get_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/get_agent_childparent_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/get_agent_childparent_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.GetAll,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }, [FunctionTypes.Can_Execute_Agent_Parent_In_Valid_List]: {
        title: Titles.Can_Execute_Agent_Parent_In_Valid_List,
        template: fs.readFileSync('./app/templates/can_execute/can_execute_childparent_valid_list.tpl', 'utf8'),
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
            [FunctionTemplateKeys.AgentInstance]: {
                [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.AgentType,
                [FunctionConstraintKeys.IsSingleLink]: true,
                key: FunctionTemplateKeys.AgentInstance,
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
        },
        output: {
            ...COMMON_OUTPUT.BOOL
        },
        [FUNCTION_REQUIREMENT_KEYS.CLASSES]: {},
        attachment_methods: {},
        propreties: {},
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }
}


export const MethodFunctions = {
    [FunctionTypes.Create_Object_Agent_Value__IListObject]: {
        title: Titles.Create_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/create_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/create_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Create,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Update_Object_Agent_Value__IListObject]: {
        title: Titles.Update_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/update_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/update_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Update,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Delete_Object_Agent_Value__IListObject]: {
        title: Titles.Delete_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/delete_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/delete_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Delete,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Get_Object_Agent_Value__IListObject]: {
        title: Titles.Get_Object_Agent_Value__IListObject,
        template: fs.readFileSync('./app/templates/standard/get_model_agent_listobject.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/get_model_agent_listobject_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.GetAll,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Create_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Create_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/create_agent_childparent_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/create_agent_childparent_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Create,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Update_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Update_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/update_agent_childparent_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/update_agent_childparent_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Update,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Get_Parent$Child_Agent_Value__IListChild]: {
        title: Titles.Get_Parent$Child_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/get_agent_childparent_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/get_agent_childparent_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        parentGet: true,
        method: Methods.GetAll,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    
    [FunctionTypes.Get_Object_Agent_Value__Object]: {
        title: Titles.Get_Object_Agent_Value__Object,
        template: fs.readFileSync('./app/templates/standard/get_model_agent_object.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/get_model_agent_object_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD
        }, output: {
            ...COMMON_OUTPUT.OBJECT
        },
        isList: false,
        method: Methods.Get,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Get_ManyToMany_Agent_Value__IListChild]: {
        title: Titles.Get_ManyToMany_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/standard/get_agent_manytomany_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/get_agent_manytomany_listchild_interface.tpl', 'utf8'),
        constraints: {
            ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD
        }, output: {
            ...COMMON_OUTPUT.LIST
        },
        parentGet: true,
        isList: true,
        method: Methods.GetAll,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Create_ManyToMany_Agent_Value__IListChild]: {
        title: Titles.Create_ManyToMany_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/standard/create_agent_manytomany_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/create_agent_manytomany_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Create,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Update_ManyToMany_Agent_Value__IListChild]: {
        title: Titles.Update_ManyToMany_Agent_Value__IListChild,
        template: fs.readFileSync('./app/templates/standard/update_agent_manytomany_listchild.tpl', 'utf8'),
        interface: fs.readFileSync('./app/templates/standard/update_agent_manytomany_listchild_interface.tpl', 'utf8'),
        constraints: { ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD },
        output: {
            ...COMMON_OUTPUT.LIST
        },
        isList: true,
        method: Methods.Update,
        ...COMMON_FUNCTION_REQUIREMENTS,
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    },
    [FunctionTypes.Can_Execute_Agent_Parent_In_Valid_List]: {
        title: Titles.Can_Execute_Agent_Parent_In_Valid_List,
        template: fs.readFileSync('./app/templates/can_execute/can_execute_childparent_valid_list.tpl', 'utf8'),
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
            [FunctionTemplateKeys.AgentInstance]: {
                [FunctionConstraintKeys.IsTypeOf]: FunctionTemplateKeys.AgentType,
                [FunctionConstraintKeys.IsSingleLink]: true,
                key: FunctionTemplateKeys.AgentInstance,
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
        },
        output: {
            ...COMMON_OUTPUT.BOOL
        },
        [FUNCTION_REQUIREMENT_KEYS.CLASSES]: {},
        attachment_methods: {},
        propreties: {},
        template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
    }
}
export const FunctionMethodTypes = {
    GET: 'GET',
    CREATE: 'CREATE',
    DELETE: 'DELETE',
    UPDATE: 'UPDATE'
}
export const ConditionTypes = {
    InEnumerable: 'in-enumeration',
    InExtension: 'in-extension',
    MatchReference: 'match-reference',
    MatchManyReferenceParameter: 'match-many-reference-parameter'
}
export const ConditionCases = {
    [ConditionTypes.MatchReference]: {
        $matching: true,
        notmatching: false
    },
    [ConditionTypes.MatchManyReferenceParameter]: {
        $matching: true,
        notmatching: false
    }
}
export const ConditionTypeParameters = {
    RefManyToMany: 'refManyToMany',
    RefManyToManyProperty: 'refManyToManyProperty',
    Ref1: 'ref1',
    Ref2: 'ref2',
    Ref1UseId: 'ref1UseId',
    Ref2UseId: 'ref2UseId',
    Ref1Property: 'ref1Property',
    Ref2Property: 'ref2Property'
}

export const ConditionTypeOptions = {
    IsFalse: 'is-false',
    IsTrue: 'is-true'
}

export const ConditionFunctionSetups = {
    [ConditionTypes.MatchReference]: {},
    [ConditionTypes.MatchManyReferenceParameter]: {},
    [ConditionTypes.InEnumerable]: {}
}
Object.keys(MethodFunctions).map(key => {
    if (MethodFunctions[key].constraints) {
        ConditionFunctionSetups[ConditionTypes.MatchReference].functions = ConditionFunctionSetups[ConditionTypes.MatchReference].functions || {}
        ConditionFunctionSetups[ConditionTypes.MatchReference].functions[key] = {
            constraints: { ...MethodFunctions[key].constraints }
        };

        ConditionFunctionSetups[ConditionTypes.MatchManyReferenceParameter].functions = ConditionFunctionSetups[ConditionTypes.MatchManyReferenceParameter].functions || {}
        ConditionFunctionSetups[ConditionTypes.MatchManyReferenceParameter].functions[key] = {
            constraints: { ...MethodFunctions[key].constraints }
        };

        ConditionFunctionSetups[ConditionTypes.InEnumerable].functions = ConditionFunctionSetups[ConditionTypes.InEnumerable].functions || {}
        ConditionFunctionSetups[ConditionTypes.InEnumerable].functions[key] = {
            constraints: { ...MethodFunctions[key].constraints }
        };
    }
});

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
    var singularSymbol = '@';
    var regex = new RegExp('({{)[A-Za-z0-9_.' + singularSymbol + ' ,\'\|]*(}})', 'g');
    var hasTemplate = regex.test(templateString);

    if (hasTemplate) {
        for (var t in data) {
            var subregex = new RegExp('({{)' + t + '(}})', 'g');
            var val = data[t];
            templateString = templateString.replace(subregex, val === null || val === undefined ? '' : val);
        }
    }

    return templateString;

}