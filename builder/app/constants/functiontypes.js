import * as Titles from "../components/titles";
import fs from "fs";
import { Methods, NodeTypes, NodeProperties } from "./nodetypes";

export const FunctionTypes = {
  //Functions with List<Child> result
  Create_ManyToMany_Agent_Value__IListChild:
    "Create/ManyToMany/Agent/Value => IList<Child>",
  Update_ManyToMany_Agent_Value__IListChild:
    "Update/ManyToMany/Agent/Value => IList<Child>",
  Get_ManyToMany_Agent_Value__IListChild:
    "Get/ManyToMany/Agent/Value => IList<Child>",
  Delete_ManyToMany_Agent_Value__IListChild:
    "Delete/ManyToMany/Agent/Value => IList<Child>",
  // Functions For Getting Data from lists of ids
  Get_Objects_From_List_Of_Ids: "Get_Objects_From_List_Of_Ids",
  //Functions with List<Child> result
  Create_Parent$Child_Agent_Value__IListChild:
    "Create/Parent-Child/Agent/Value => IList<Child>",
  Update_Parent$Child_Agent_Value__IListChild:
    "Update/Parent-Child/Agent/Value => IList<Child>",
  Get_Parent$Child_Agent_Value__IListChild:
    "Get/Parent-Child/Agent/Value => IList<Child>",
  Delete_Parent$Child_Agent_Value__IListChild:
    "Delete/Parent-Child/Agent/Value => IList<Child>",

  //Functions with List<Object> result
  Create_Object_Agent_Value__IListObject:
    "Create/Object/Agent/Value => IList<Object>",
  Update_Object_Agent_Value__IListObject:
    "Update/Object/Agent/Value => IList<Object>",
  Get_Object_Agent_Value__IListObject:
    "Get/Object/Agent/Value => IList<Object>",
  Delete_Object_Agent_Value__IListObject:
    "Delete/Object/Agent/Value => IList<Object>",

  Get_Agent_Value__IListObject: "Get/Agent/Value => IList<Object>",
  Get_Object_Agent_Value__IListObject_By_Specific:
    "Get/Object/Agent/Value => IList<Object> specific id",
  //Delete
  Delete_M2M_By_Reference: "Delete M2M by reference => list",

  //Functions with Object result
  Create_Parent_Child_Agent_Value__Child:
    "Create/Parent-Child/Agent/Value => Child",
  Update_Parent_Child_Agent_Value__Child:
    "Update/Parent-Child/Agent/Value => Child",
  Get_Parent_Child_Agent_Value__Child: "Get/Parent-Child/Agent/Value => Child",
  Delete_Parent_Child_Agent_Value__Child:
    "Delete/Parent-Child/Agent/Value => Child",

  //Functions width Object result.
  Create_Object_Agent_Value__Object: "Create/Object/Agent/Value => Object",
  Update_Object_Agent_Value__Object: "Update/Object/Agent/Value => Object",
  Update_Object_Agent_Value__Object_With_Object:
    "Update/Object/with/Model/Agent/Value => Object",
  Get_Object_Agent_Value__Object: "Get/Object/Agent/Value => Object",
  Delete_Object_Agent_Value__Object: "Delete/Object/Agent/Value => Object",

  Create_Object_Agent_Many_to_Many_CompositeInput__Object:
    "Create/Object/Agent/Many to Many with Composite Input => Object",
  Create_ManyToMany_Object_With_Agent_And_Return_M2M_SET:
    "Create M2M Object with Agent and Return the updated M2M set",

  Create_Object_With_User: "Create/Object=>Object(with users)",
  Update_Object_With_User: "Update/Object=>Object(with users)",

  Create_Object__Object: "Create/Object => Object",
  Update_Object__Object: "Update/Object => Object",
  Delete_Object__Object: "Delete/Object => Object",
  Get_Object__Object: "Get/Object => Object",

  //Function with bool result
  Can_Execute_Agent_Parent_In_Valid_List:
    "Can_Execute_Agent_Parent_In_Valid_List",
  Login: "Login",
  Register: "Register",
  AnonymousRegisterLogin: 'AnonymousRegisterLogin',
  CheckUserLoginStatus: 'CheckUserLoginStatus',
  ForgotLogin: 'ForgotLogin',
  ChangeUserPassword: 'ChangeUserPassword'
  // IAgent_and_Permission_determing_the_permission_based_on_a_PROPERTY: 'Given an Agent and Permission, determing the permission based on a PROPERTY'
};

export const FunctionTemplateKeys = {
  Model: "model",
  ModelOutput: "model_output",
  ChangeParameter: "change_parameter",
  UpdateModel: "model_update",
  ReferenceClass: "reference_class",
  Reference: "reference",
  ModelProperty: "model-property",
  Bool: "bool",
  CanExecute: "can-execute",
  ModelDeterminingProperty: "model-determining-property",
  AgentDeterminingProperty: "agent-determining-property",
  Property: "property",
  Parent: "parent",
  AgentInstance: "agent_instance",
  Agent: "agent",
  Item: "item",
  AgentProperty: "agent-property",
  AgentType: "agent_type",
  User: "user",
  ConnectionType: "connect_type",
  ManyToManyModel: "many_to_many",
  Method: "method",
  Executor: "executor",
  Validator: "Validator",
  MethodType: "method_type",
  Permission: "permission",
  UserInstance: "user_instance",
  ModelFilter: "model_filter",
  Value: "value",
  CompositeInput: "composite-input",
  CompositeInputProperty: "composite-input-property",
  FetchParameter: "fetch_parameter"
};

export const FunctionConstraintKeys = {
  IsAgent: "isAgent",
  IsUser: "isUser",
  IsTypeOf: "isTypeOf",
  IsParent: "isParent",
  IsChild: "isChild",
  IsList: "isList",
  IsSingleLink: "$single$link",
  IsModel: "isModel",
  IsFunction: "isFunction",
  IsProperty: "isProperty",
  IsEnumerable: "isEnumerable",
  IsInstanceVariable: "isInstanceVariable",
  IsInputVariable: "isInputVariable"
};

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

const COMMON_CONSTRAINTS_ANONYMOUS = {
  [FunctionTemplateKeys.Model]: {
    key: FunctionTemplateKeys.Model,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.ModelOutput]: {
    key: FunctionTemplateKeys.ModelOutput,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.User]: {
    [NodeProperties.IsUser]: true,
    key: FunctionTemplateKeys.User,
    nodeTypes: [NodeTypes.Model]
  }
};

const COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD = {
  [FunctionTemplateKeys.Model]: {
    key: FunctionTemplateKeys.Model,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.ModelOutput]: {
    key: FunctionTemplateKeys.ModelOutput,
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

const COMMON_CREATE_UPDATE_CONSTRAINTS = {
  [FunctionTemplateKeys.Validator]: {
    key: FunctionTemplateKeys.Validator,
    nodeTypes: [NodeTypes.Validator]
  },
  [FunctionTemplateKeys.Executor]: {
    key: FunctionTemplateKeys.Executor,
    nodeTypes: [NodeTypes.Executor]
  }
};

const COMMON_CONSTRAINTS_AGENT_OBJECT_MANY_TO_MANY_COMPOSITEINPUT_METHOD = {
  [FunctionTemplateKeys.Model]: {
    key: FunctionTemplateKeys.Model,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.CompositeInput]: {
    key: FunctionTemplateKeys.CompositeInput,
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

const AfterEffectsTemplate = {
  GenerateM2M_From_Result_and_Input:
    "Generate Many 2 Many from result and input",
  ExecuteStreamProcess: "Execute stream process",
  ExecuteStreamProcessUpdate: "Execute stream process update"
};
export const AFTER_EFFECTS = {
  [AfterEffectsTemplate.GenerateM2M_From_Result_and_Input]: {
    template:
      "./app/templates/aftereffects/generate_m2m_from_result_and_input.tpl",
    template_call:
      "                    await {{function_name}}(agent, data, result);",
    templateKeys: {
      [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.CompositeInput]: {
        key: FunctionTemplateKeys.CompositeInput,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.CompositeInputProperty]: {
        key: FunctionTemplateKeys.CompositeInputProperty,
        nodeTypes: [NodeTypes.Property],
        parent: FunctionTemplateKeys.CompositeInput
      },
      [FunctionTemplateKeys.Agent]: {
        [NodeProperties.IsAgent]: true,
        key: FunctionTemplateKeys.Agent,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ManyToManyModel]: {
        key: FunctionTemplateKeys.ManyToManyModel,
        nodeTypes: [NodeTypes.Model]
      }
    }
  },
  [AfterEffectsTemplate.ExecuteStreamProcess]: {
    template: "./app/templates/aftereffects/execute_stream_process.tpl",
    template_call:
      "                    await {{function_name}}(agent, result);",
    update_with: `./app/templates/standard/update_model_property.tpl`,
    stream_process_change_parameter: `./app/templates/stream_process/stream_process_change_class_extension_update_by_model.tpl`,
    templateKeys: {
      [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ModelOutput]: {
        key: FunctionTemplateKeys.ModelOutput,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.Agent]: {
        [NodeProperties.IsAgent]: true,
        key: FunctionTemplateKeys.Agent,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ManyToManyModel]: {
        key: FunctionTemplateKeys.ManyToManyModel,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.Method]: {
        key: FunctionTemplateKeys.Method,
        useNodes: true,
        nodeTypes: [NodeTypes.Method]
      },
      [FunctionTemplateKeys.MethodType]: {
        key: FunctionTemplateKeys.MethodType,
        useMethodTypes: true
      }
    }
  },
  [AfterEffectsTemplate.ExecuteStreamProcessUpdate]: {
    template: "./app/templates/aftereffects/execute_stream_process_update.tpl",
    template_call: `
            var reference = {{reference}};
            var model = result;
            await {{function_name}}(agent, reference, model);`,
    stream_process_change_parameter: `./app/templates/stream_process/stream_process_change_class_extension_update_by_model.tpl`,
    update_with: `./app/templates/standard/update_model_property.tpl`,
    templateKeys: {
      [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ModelOutput]: {
        key: FunctionTemplateKeys.ModelOutput,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.UpdateModel]: {
        key: FunctionTemplateKeys.UpdateModel,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ReferenceClass]: {
        key: FunctionTemplateKeys.ReferenceClass,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.Reference]: {
        key: FunctionTemplateKeys.Reference,
        nodeTypes: [NodeTypes.Model],
        useString: ["agent", "result", "newData", "data"].map(t => `#${t}`)
      },
      [FunctionTemplateKeys.Agent]: {
        [NodeProperties.IsAgent]: true,
        key: FunctionTemplateKeys.Agent,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ManyToManyModel]: {
        key: FunctionTemplateKeys.ManyToManyModel,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.Method]: {
        key: FunctionTemplateKeys.Method,
        useNodes: true,
        nodeTypes: [NodeTypes.Method]
      },
      [FunctionTemplateKeys.MethodType]: {
        key: FunctionTemplateKeys.MethodType,
        useMethodTypes: true
      }
    }
  }
};

const COMMON_CONSTRAINTS_OBJECT_METHOD_OBJECT = {
  [FunctionTemplateKeys.User]: {
    [NodeProperties.IsUser]: true,
    key: FunctionTemplateKeys.User,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.Model]: {
    key: FunctionTemplateKeys.Model,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.ModelOutput]: {
    key: FunctionTemplateKeys.ModelOutput,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.Agent]: {
    [NodeProperties.IsAgent]: true,
    key: FunctionTemplateKeys.Agent,
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
const COMMON_CONSTRAINTS_OBJECT_METHOD = {
  ...COMMON_CONSTRAINTS_OBJECT_METHOD_OBJECT,
  [FunctionTemplateKeys.Agent]: {
    [NodeProperties.IsAgent]: true,
    key: FunctionTemplateKeys.Agent,
    nodeTypes: [NodeTypes.Model]
  }
};

const COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD = {
  [FunctionTemplateKeys.Model]: {
    key: FunctionTemplateKeys.Model,
    nodeTypes: [NodeTypes.Model]
  },
  [FunctionTemplateKeys.ModelOutput]: {
    key: FunctionTemplateKeys.ModelOutput,
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
  [FunctionTemplateKeys.ModelOutput]: {
    key: FunctionTemplateKeys.ModelOutput,
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
  [FunctionTemplateKeys.ConnectionType]: {
    [NodeProperties.ManyToManyNexus]: true,
    key: FunctionTemplateKeys.ConnectionType,
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
};
export const INTERNAL_TEMPLATE_REQUIREMENTS = {
  METHODS: "methods",
  PARAMETERS: "parameters",
  PARAMETERSCLASS: "Parameters", // Classes hold the parameters, that go to Change classes. See create____.tpl templates.
  CHANGECLASS: "Change", // Class objects are passed to streams for processing
  RESPONSECLASS: "Response", // When stream processing completes, these are sent back.
  STREAMPROCESS: "StreamProcess",
  DETERMINING_PROPERTY: "determining_property",
  PARENTS_ID_PROPERTY: "parentIdProperty",
  MODEL: "model",
  CONSTRUCTORS: "constructors",
  TEMPLATE: "template",
  INTERFACE: "interface",
  PARENT: "parent",
  PROPERTY: "property",
  METHOD: {
    CREATE: "Create",
    UPDATE: "Update",
    PROCESS: "Process"
  }
};
export const FUNCTION_REQUIREMENT_KEYS = {
  CLASSES: "classes"
};
const COMMON_FUNCTION_REQUIREMENTS = {
  [FUNCTION_REQUIREMENT_KEYS.CLASSES]: {
    [INTERNAL_TEMPLATE_REQUIREMENTS.PARAMETERSCLASS]: {
      [INTERNAL_TEMPLATE_REQUIREMENTS.TEMPLATE]: fs.readFileSync(
        "./app/templates/stream_process/stream_process_parameter_class.tpl",
        "utf8"
      ),
      [INTERNAL_TEMPLATE_REQUIREMENTS.CONSTRUCTORS]: fs.readFileSync(
        "./app/templates/stream_process/stream_process_parameter_class.tpl",
        "utf8"
      ),
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
      [INTERNAL_TEMPLATE_REQUIREMENTS.TEMPLATE]: fs.readFileSync(
        "./app/templates/stream_process/stream_process_change_class.tpl",
        "utf8"
      ),
      [INTERNAL_TEMPLATE_REQUIREMENTS.CONSTRUCTORS]: fs.readFileSync(
        "./app/templates/stream_process/stream_process_change_class.tpl",
        "utf8"
      ),
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
      [INTERNAL_TEMPLATE_REQUIREMENTS.PROPERTY]: FunctionTemplateKeys.Property
    }
  }
};
export const TEMPLATE_KEY_MODIFIERS = {
  lower: "lower",
  alllower: "alllower",
  upper: "upper"
};
export function ToInterface(i) {
  return `I${i}`;
}
export const HTTP_METHODS = {
  POST: "HttpPost",
  GET: "HttpGet",
  DELETE: "HttpDelete",
  PATCH: "HttpPatch"
};
export const COMMON_FUNCTION_TEMPLATE_KEYS = {
  model: "model",
  function_name: "function_name",
  user: "user",
  user_instance: "user_instance",
  value: "value",
  agent: "agent",
  agent_type: "agent_type"
};
export const COMMON_FUNCTION_TEMPLATE_KEYS_USER = {
  model: "model",
  function_name: "function_name",
  user: "user",
  user_instance: "user_instance",
  value: "value"
};
const PERMISSION_DEFAULTS = {
  implementation: "./app/templates/permissions/permission_method.tpl",
  interface_: "./app/templates/permissions/permission_method_interface.tpl",
  params: [FunctionTemplateKeys.Model, FunctionTemplateKeys.Agent]
};

const VALIDATION_DEFAULTS = {
  implementation: "./app/templates/validation/validation_method.tpl",
  interface_: "./app/templates/validation/validation_method_interface.tpl",
  params: [
    FunctionTemplateKeys.Model,
    FunctionTemplateKeys.Agent,
    {
      key: FunctionTemplateKeys.ChangeParameter,
      changeparameter: true,
      template: `{{${FunctionTemplateKeys.Model}}}ChangeBy{{${
        FunctionTemplateKeys.Agent
        }}}`
    }
  ]
};

const FILTER_DEFAULTS = {
  implementation: "./app/templates/filter/filter_method.tpl",
  interface_: "./app/templates/filter/filter_method_interface.tpl",
  params: [
    FunctionTemplateKeys.Model,
    FunctionTemplateKeys.Agent,
    { key: FunctionTemplateKeys.ModelOutput, metaparameter: true }
  ]
};
export const QUERY_PARAMETER_KEYS = {
  Skip: "skip",
  Take: "take",
  Filter: "filter",
  Sort: "sort",
  Id: "id"
};
export const TEMPLATE_PARAMETER_KEYS = {
  ModelId: "modelId",
  ParentId: "parentId"
};
export const QUERY_PARAMETERS = {
  [QUERY_PARAMETER_KEYS.Skip]: true,
  [QUERY_PARAMETER_KEYS.Take]: true,
  [QUERY_PARAMETER_KEYS.Filter]: true,
  [QUERY_PARAMETER_KEYS.Sort]: true
};
export const TEMPLATE_PARAMETERS = {
  [TEMPLATE_PARAMETER_KEYS.ModelId]: {
    isGuid: true
  }
};
export const GET_QUERY_PARAMETERS = {
  [QUERY_PARAMETER_KEYS.Id]: {
    isGuid: true
  }
};

export const MethodFunctions = {
  [FunctionTypes.Create_Object__Object]: {
    title: Titles.Create_Object__Object,
    titleTemplate: function (t, a) {
      return `Create ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/create_model_agent_object.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/create_model_agent_object_interface.tpl",
      "utf8"
    ),
    templates: {},
    permission: {
      ...PERMISSION_DEFAULTS
    },
    parameters: {
      body: true,
      parameters: false
    },
    lambda: {
      default: {
        user: "user",
        value: "model",
        model_output: "model",
        "result.IdValue": "string",
        agent: "agent",
        return: "model_output"
      }
    },
    constraints: {
      ...COMMON_CONSTRAINTS_OBJECT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Update_Object_With_User]: {
    title: Titles.Update_Object_With_User,
    titleTemplate: function (t, a) {
      return `Update ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/update_model_user_object.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/update_model_user_object_interface.tpl",
      "utf8"
    ),
    templates: {},
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [FunctionTemplateKeys.Model, FunctionTemplateKeys.User]
    },
    parameters: {
      body: true,
      parameters: false
    },
    constraints: {
      ...COMMON_CONSTRAINTS_OBJECT_METHOD_OBJECT,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    isList: false,
    method: Methods.Update,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS_USER }
  },
  [FunctionTypes.Get_Objects_From_List_Of_Ids]: {
    title: Titles.GetObjectsFromLIstOfIds,
    description: "Gets objects from a list of Ids",
    titleTemplate: function (t, a) {
      return `Get ${t}s With IdList by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/get_agent_listobject_with_id_list.tpl",
      "utf-8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/get_agent_listobject_with_id_list_interface.tpl",
      "utf-8"
    ),
    controller: fs.readFileSync(
      "./app/templates/controller/controller_get_all_by_ids.tpl",
      "utf-8"
    ), //controller_get_all_by_ids
    templates: {},
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [FunctionTemplateKeys.Agent]
    },
    parameters: {
      body: true,
      parameters: false
    },
    filter: {
      ...FILTER_DEFAULTS,
      params: [
        FunctionTemplateKeys.Agent,
        FunctionTemplateKeys.FetchParameter,
        {
          key: FunctionTemplateKeys.ModelOutput,
          metaparameter: FunctionTemplateKeys.ModelOutput
        }
      ]
    },
    constraints: {
      ...COMMON_CONSTRAINTS_OBJECT_METHOD_OBJECT,
      [FunctionTemplateKeys.FetchParameter]: {
        key: FunctionTemplateKeys.FetchParameter,
        nodeTypes: [NodeTypes.Model]
      }
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    isList: true,
    isFetchCompatible: true,
    method: Methods.GetAll,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS_USER }
  },
  [FunctionTypes.Create_Object_With_User]: {
    title: Titles.Create_Object_With_User,
    titleTemplate: function (t, a) {
      return `Create ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/create_model_user_object.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/create_model_user_object_interface.tpl",
      "utf8"
    ),
    templates: {},
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [FunctionTemplateKeys.Model, FunctionTemplateKeys.User]
    },
    parameters: {
      body: true,
      parameters: false
    },
    constraints: {
      ...COMMON_CONSTRAINTS_OBJECT_METHOD_OBJECT,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS_USER }
  },
  [FunctionTypes.Create_ManyToMany_Object_With_Agent_And_Return_M2M_SET]: {
    title: FunctionTypes.Create_ManyToMany_Object_With_Agent_And_Return_M2M_SET,
    titleTemplate: function (t, a) {
      return `Create ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/many_2_many/create_with_agent_and_return_m2m_set.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/many_2_many/create_with_agent_and_return_m2m_set_interface.tpl",
      "utf8"
    ),
    filter: {
      params: [FunctionTemplateKeys.Model, FunctionTemplateKeys.Agent]
    },
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_OBJECT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    isList: true,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Create_Object_Agent_Many_to_Many_CompositeInput__Object]: {
    title: Titles.Create_Object_Agent_Many_to_Many_CompositeInput__Object,
    titleTemplate: function (t, a) {
      return `Create ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/create_object_agent_many_to_many_compositeinput.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/create_object_agent_many_to_many_compositeinput_interface.tpl",
      "utf8"
    ),
    permission: {
      implementation: "./app/templates/permissions/permission_method.tpl",
      interface_: "./app/templates/permissions/permission_method_interface.tpl",
      params: [FunctionTemplateKeys.CompositeInput, FunctionTemplateKeys.Agent]
    },
    validation: {
      ...VALIDATION_DEFAULTS,
      asModel: FunctionTemplateKeys.CompositeInput, //Used as the model in the validation functions.
      params: [
        FunctionTemplateKeys.CompositeInput,
        FunctionTemplateKeys.Agent,
        {
          key: FunctionTemplateKeys.ChangeParameter,
          changeparameter: true,
          template: `{{${FunctionTemplateKeys.CompositeInput}}}ChangeBy{{${
            FunctionTemplateKeys.Agent
            }}}`
        }
      ]
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_MANY_TO_MANY_COMPOSITEINPUT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    ok: true,
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Create_Object_Agent_Value__IListObject]: {
    title: Titles.Create_Object_Agent_Value__IListObject,
    titleTemplate: function (t, a) {
      return `Create ${t} by ${a} and Return List of ${t}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/create_model_agent_listobject.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/create_model_agent_listobject_interface.tpl",
      "utf8"
    ),
    constraints: {
      [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ModelOutput]: {
        key: FunctionTemplateKeys.ModelOutput,
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
      },
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Update_Object_Agent_Value__IListObject]: {
    title: Titles.Update_Object_Agent_Value__IListObject,
    titleTemplate: function (t, a) {
      return `Update ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/update_model_agent_listobject.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/update_model_agent_listobject_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    method: Methods.Update,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Update_Object_Agent_Value__Object]: {
    title: Titles.Update_Object_Agent_Value__Object,
    titleTemplate: function (t, a) {
      return `Update ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/update_model_agent_object.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/update_model_agent_object_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },

    parameters: {
      body: true,
      parameters: false
    },
    isList: false,
    method: Methods.Update,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Update_Object_Agent_Value__Object_With_Object]: {
    title: Titles.Update_Object_Agent_Value__Object_With_Object,
    titleTemplate: function (t, a) {
      return `Update ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/update_model_agent_object_with_model.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/update_model_agent_object_with_model_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [
        FunctionTemplateKeys.Model,
        FunctionTemplateKeys.Agent,
        FunctionTemplateKeys.UpdateModel
      ]
    },
    templates: {},
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD,
      [FunctionTemplateKeys.UpdateModel]: {
        key: FunctionTemplateKeys.UpdateModel,
        nodeTypes: [NodeTypes.Model]
      },
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },
    isList: false,
    method: Methods.Update,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Delete_Object_Agent_Value__IListObject]: {
    title: Titles.Delete_Object_Agent_Value__IListObject,
    titleTemplate: function (t, a) {
      return `Delete ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/delete_model_agent_listobject.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/delete_model_agent_listobject_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    method: Methods.Delete,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Delete_M2M_By_Reference]: {
    title: FunctionTypes.Delete_M2M_By_Reference,
    titleTemplate: function (t, a) {
      return `Delete ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/delete_m2m_by_reference.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/delete_m2m_by_reference_interface.tpl",
      "utf8"
    ),
    test: fs.readFileSync(
      "./app/templates/standard/delete_m2m_by_reference_test.tpl",
      "utf8"
    ),
    controller: fs.readFileSync(
      "./app/templates/standard/delete_m2m_by_reference_controller.tpl",
      "utf8"
    ),
    filter: {
      params: [
        FunctionTemplateKeys.Model,
        FunctionTemplateKeys.Agent,
        { key: FunctionTemplateKeys.ModelOutput, metaparameter: true }
      ]
    },
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    method: Methods.Delete,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Get_Object_Agent_Value__IListObject]: {
    title: Titles.Get_Object_Agent_Value__IListObject,
    titleTemplate: function (t, a) {
      return `Get ${t}s by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/get_model_agent_listobject.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/get_model_agent_listobject_interface.tpl",
      "utf8"
    ),
    controller_parameters: {
      params: [FunctionTemplateKeys.Model]
    },
    permission: {
      ...PERMISSION_DEFAULTS
    },
    filter: {
      ...FILTER_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    parameters: {
      body: false,
      parameters: {
        query: { ...QUERY_PARAMETERS }
      }
    },
    isList: true,
    method: Methods.GetAll,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Get_Agent_Value__IListObject]: {
    title: Titles.Get_Agent_Value__IListObject,
    titleTemplate: function (t, a) {
      return `Get ${t}s List by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/get_agent_listobject.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/get_agent_listobject_interface.tpl",
      "utf8"
    ),
    controller: fs.readFileSync(
      "./app/templates/standard/get_agent_listobjects_controller.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [FunctionTemplateKeys.Agent]
    },
    filter: {
      ...FILTER_DEFAULTS,
      params: [
        FunctionTemplateKeys.Agent,
        { key: FunctionTemplateKeys.ModelOutput, metaparameter: true }
      ]
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_OBJECT_METHOD
    },
    parameters: {
      body: false,
      parameters: {
        query: { ...QUERY_PARAMETERS }
      }
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    method: Methods.GetAll,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Login]: {
    title: Titles.Login,
    constraints: {
      ...COMMON_CONSTRAINTS_ANONYMOUS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    permission: false,
    validation: false,
    filter: false,
    parameters: {
      body: {},
      parameters: false
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Register]: {
    title: Titles.Register,
    constraints: {
      ...COMMON_CONSTRAINTS_ANONYMOUS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    permission: false,
    validation: false,
    filter: false,
    parameters: {
      body: {},
      parameters: false
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.AnonymousRegisterLogin]: {
    title: Titles.AnonymousRegisterLogin,
    constraints: {
      ...COMMON_CONSTRAINTS_ANONYMOUS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    permission: false,
    validation: false,
    filter: false,
    parameters: {
      body: false,
      parameters: false
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.CheckUserLoginStatus]: {
    title: Titles.CheckUserLoginStatus,
    constraints: {
      ...COMMON_CONSTRAINTS_ANONYMOUS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    permission: false,
    validation: false,
    filter: false,
    parameters: {
      body: false,
      parameters: false
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.ChangeUserPassword]: {
    title: Titles.ChangeUserPassword,
    constraints: {
      ...COMMON_CONSTRAINTS_ANONYMOUS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    permission: false,
    validation: false,
    filter: false,
    parameters: {
      body: {},
      parameters: false
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.ForgotLogin]: {
    title: Titles.ForgotLogin,
    constraints: {
      ...COMMON_CONSTRAINTS_ANONYMOUS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    permission: false,
    validation: false,
    filter: false,
    parameters: {
      body: {},
      parameters: false
    },
    isList: false,
    method: Methods.Create,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },

  [FunctionTypes.Create_Parent$Child_Agent_Value__IListChild]: {
    title: Titles.Create_Parent$Child_Agent_Value__IListChild,
    titleTemplate: function (t, a) {
      return `Create ${t} List by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/create_agent_childparent_listchild.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/create_agent_childparent_listchild_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    parameters: {
      body: true,
      parameters: {
        query: { ...QUERY_PARAMETERS }
      }
    },
    isList: true,
    method: Methods.Create,
    ...COMMON_FUNCTION_REQUIREMENTS,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Update_Parent$Child_Agent_Value__IListChild]: {
    title: Titles.Update_Parent$Child_Agent_Value__IListChild,
    titleTemplate: function (t, a) {
      return `Update ${t} List by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/update_agent_childparent_listchild.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/update_agent_childparent_listchild_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_AGENT_PARENT_CHILD_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
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
    titleTemplate: function (t, a) {
      return `Get ${t} List by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/get_agent_childparent_listchild.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/get_agent_childparent_listchild_interface.tpl",
      "utf8"
    ),
    controller: fs.readFileSync(
      "./app/templates/controller/controller_get_all_by_parent.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [FunctionTemplateKeys.Parent, FunctionTemplateKeys.Agent]
    },
    filter: {
      ...FILTER_DEFAULTS,
      params: [
        FunctionTemplateKeys.Parent,
        FunctionTemplateKeys.Agent,
        { key: FunctionTemplateKeys.ModelOutput, metaparameter: true }
      ]
    },
    constraints: {
      [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ModelOutput]: {
        key: FunctionTemplateKeys.ModelOutput,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.Parent]: {
        key: FunctionTemplateKeys.Parent,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ManyToManyModel]: {
        [NodeProperties.ManyToManyNexus]: true,
        key: FunctionTemplateKeys.ManyToManyModel,
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
    },
    parameters: {
      body: false,
      parameters: {
        path: [FunctionTemplateKeys.Parent],
        query: { ...QUERY_PARAMETERS }
      }
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    parentGet: true,
    method: Methods.GetAll,
    ...COMMON_FUNCTION_REQUIREMENTS,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },

  [FunctionTypes.Get_Object_Agent_Value__IListObject_By_Specific]: {
    title: Titles.Get_Object_Agent_Value__IListObject_By_Specific,
    titleTemplate: function (t, a) {
      return `Get ${t} List by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/get_model_agent_listobject_specific.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/get_model_agent_listobject_specific_interface.tpl",
      "utf8"
    ),
    controller: fs.readFileSync(
      "./app/templates/standard/get_model_agent_listobject_specific_controller.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS,
      params: [FunctionTemplateKeys.Agent]
    },
    filter: {
      ...FILTER_DEFAULTS,
      params: [
        FunctionTemplateKeys.Agent,
        { key: FunctionTemplateKeys.ModelOutput, metaparameter: true }
      ]
    },
    constraints: {
      [FunctionTemplateKeys.Model]: {
        key: FunctionTemplateKeys.Model,
        nodeTypes: [NodeTypes.Model]
      },
      [FunctionTemplateKeys.ModelOutput]: {
        key: FunctionTemplateKeys.ModelOutput,
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
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    isList: true,
    method: Methods.GetAll,
    ...COMMON_FUNCTION_REQUIREMENTS,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Get_Object_Agent_Value__Object]: {
    title: Titles.Get_Object_Agent_Value__Object,
    titleTemplate: function (t, a) {
      return `Get ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/get_model_agent_object.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/get_model_agent_object_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
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
    },
    output: {
      ...COMMON_OUTPUT.OBJECT
    },

    parameters: {
      body: false,
      parameters: {
        template: { ...TEMPLATE_PARAMETERS }
      }
    },
    isList: false,
    method: Methods.Get,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Get_ManyToMany_Agent_Value__IListChild]: {
    title: Titles.Get_ManyToMany_Agent_Value__IListChild,
    titleTemplate: function (t, a) {
      return `Get ${t} List by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/get_agent_manytomany_listchild.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/get_agent_manytomany_listchild_interface.tpl",
      "utf8"
    ),
    filter: {
      ...FILTER_DEFAULTS,
      params: [
        FunctionTemplateKeys.Model,
        FunctionTemplateKeys.Agent,
        { key: FunctionTemplateKeys.ConnectionType, metaparameter: true }
      ]
    },
    constraints: {
      ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD
    },
    output: {
      ...COMMON_OUTPUT.LIST
    },
    parentGet: true,
    isList: true,
    method: Methods.GetAll,
    template_keys: { ...COMMON_FUNCTION_TEMPLATE_KEYS }
  },
  [FunctionTypes.Create_ManyToMany_Agent_Value__IListChild]: {
    title: Titles.Create_ManyToMany_Agent_Value__IListChild,
    titleTemplate: function (t, a) {
      return `Create ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/create_agent_manytomany_listchild.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/create_agent_manytomany_listchild_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
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
    titleTemplate: function (t, a) {
      return `Update ${t} by ${a}`;
    },
    template: fs.readFileSync(
      "./app/templates/standard/update_agent_manytomany_listchild.tpl",
      "utf8"
    ),
    interface: fs.readFileSync(
      "./app/templates/standard/update_agent_manytomany_listchild_interface.tpl",
      "utf8"
    ),
    permission: {
      ...PERMISSION_DEFAULTS
    },
    constraints: {
      ...COMMON_CONSTRAINTS_MANYTOMANY_CHILD_METHOD,
      ...COMMON_CREATE_UPDATE_CONSTRAINTS
    },
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
    template: fs.readFileSync(
      "./app/templates/can_execute/can_execute_childparent_valid_list.tpl",
      "utf8"
    ),
    titleTemplate: function (t, a) {
      return `Can Execute ${t} by ${a}`;
    },
    permission: {
      ...PERMISSION_DEFAULTS
    },
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
};
Object.values(MethodFunctions).map(t => {
  if (t && !t.permission && t.permission !== false) {
    t.permission = { ...PERMISSION_DEFAULTS };
    t.permission.usingDefault = true;
  }
  if (t && !t.validation && t.valdation !== false) {
    t.validation = { ...VALIDATION_DEFAULTS };
  }
  if (t && !t.filter && t.filter !== false) {
    t.filter = { ...FILTER_DEFAULTS };
  }
});

export const MethodTemplateKeys = {
  stream_process_change_parameter: "stream_process_change_parameter",
  update_with: "update_with"
};
export const FunctionMethodTypes = {
  GET: "GET",
  CREATE: "CREATE",
  DELETE: "DELETE",
  UPDATE: "UPDATE"
};
export const ConditionTypes = {
  InEnumerable: "in-enumeration",
  InExtension: "in-extension",
  MatchReference: "match-reference",
  MatchManyReferenceParameter: "match-many-reference-parameter"
};
export const ConditionCases = {
  [ConditionTypes.MatchReference]: {
    $matching: true,
    notmatching: false
  },
  [ConditionTypes.MatchManyReferenceParameter]: {
    $matching: true,
    notmatching: false
  }
};
export const ConditionTypeParameters = {
  RefManyToMany: "refManyToMany",
  RefManyToManyProperty: "refManyToManyProperty",
  Ref1: "ref1",
  Ref2: "ref2",
  Ref1UseId: "ref1UseId",
  Ref2UseId: "ref2UseId",
  Ref1Property: "ref1Property",
  Ref2Property: "ref2Property"
};

export const ConditionTypeOptions = {
  IsFalse: "is-false",
  IsTrue: "is-true"
};

export const ConditionFunctionSetups = {
  [ConditionTypes.MatchReference]: {},
  [ConditionTypes.MatchManyReferenceParameter]: {},
  [ConditionTypes.InEnumerable]: {}
};
Object.keys(MethodFunctions).map(key => {
  if (MethodFunctions[key].constraints) {
    ConditionFunctionSetups[ConditionTypes.MatchReference].functions =
      ConditionFunctionSetups[ConditionTypes.MatchReference].functions || {};
    ConditionFunctionSetups[ConditionTypes.MatchReference].functions[key] = {
      constraints: { ...MethodFunctions[key].constraints }
    };

    ConditionFunctionSetups[
      ConditionTypes.MatchManyReferenceParameter
    ].functions =
      ConditionFunctionSetups[ConditionTypes.MatchManyReferenceParameter]
        .functions || {};
    ConditionFunctionSetups[
      ConditionTypes.MatchManyReferenceParameter
    ].functions[key] = {
      constraints: { ...MethodFunctions[key].constraints }
    };

    ConditionFunctionSetups[ConditionTypes.InEnumerable].functions =
      ConditionFunctionSetups[ConditionTypes.InEnumerable].functions || {};
    ConditionFunctionSetups[ConditionTypes.InEnumerable].functions[key] = {
      constraints: { ...MethodFunctions[key].constraints }
    };
  }
});

export const FunctionPerpetrators = {
  Agent: "Agent",
  System: "System" // This is theorhetical atm 23.05.2019
};

export const ReturnTypes = {
  CHILD: "CHILD",
  OBJECT: "OBJECT",
  LISTCHILD: "LISTCHILD",
  LISTOBJECT: "LISTOBJECT", //May end up being a different dimension,
  BOOL: "BOOL"
};

export function hasTemplate(templateString) {
  var singularSymbol = "@";
  var regex = new RegExp(
    "({{)[A-Za-z0-9_." + singularSymbol + " ,'|]*(}})",
    "g"
  );
  var hasTemplate = regex.test(templateString);
  return hasTemplate;
}

export function bindTemplate(templateString, data) {
  var singularSymbol = "@";
  try {
    var regex = new RegExp(
      "({{)[A-Za-z0-9_." + singularSymbol + " ,'|]*(}})",
      "g"
    );
    var hasTemplate;
    try {
      hasTemplate = regex.test(templateString);
    } catch (e) { }
    data = { ...data };
    let dataKeyes = Object.keys(data);
    dataKeyes.map(t => {
      if (!data[t + "#lower"]) {
        data[t + "#lower"] = `${data[t]}`.toLowerCase();
      }
      if (!data[t + "#js"]) {
        data[t + "#js"] = `${data[t]}`.toJavascriptName();
      }
    });

    if (hasTemplate) {
      for (var t in data) {
        var subregex = new RegExp("({{)" + t + "(}})", "g");
        var val = data[t];
        templateString = templateString.replace(
          subregex,
          val === null || val === undefined ? "" : val
        );
      }
    }
  } catch (e) {
    console.log("-------------");
    console.log(t);
    console.log(`"${singularSymbol}"`);
    console.log(`"${templateString}"`);
    throw e;
  }
  return templateString;
}

export function bindReferenceTemplate(templateString, data) {
  var singularSymbol = "@";
  try {
    var regex = new RegExp(
      "#({)[A-Za-z0-9_." + singularSymbol + " ,'|~]*(})",
      "g"
    );
    var hasTemplate;
    try {
      hasTemplate = regex.test(templateString);
    } catch (e) { }
    Object.keys(data).map(t => {
      if (!data[t + "#lower"]) {
        data[t + "#lower"] = `${data[t]}`.toLowerCase();
      }
    });

    if (hasTemplate) {
      for (var t in data) {
        var subregex = new RegExp("(#{)" + t + "(})", "g");
        var val = data[t];
        templateString = templateString.replace(
          subregex,
          val === null || val === undefined ? "" : val
        );
      }
    }
  } catch (e) {
    console.log("-------------");
    console.log(t);
    console.log(`"${singularSymbol}"`);
    console.log(`"${templateString}"`);
    throw e;
  }
  return templateString;
}
