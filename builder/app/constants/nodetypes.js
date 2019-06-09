
export const NodeTypes = {
    Concept: 'concept',
    Model: 'model',
    Property: 'model-property',
    Screen: 'screen',
    Attribute: 'attribute-property',
    ChoiceList: 'choice-list',
    Permission: 'permission',
    PermissionDependency: 'permission-dependency',
    Enumeration: 'enumeration', //Basically a list of const string.
    // ChoiceListItem: 'choice-list-item',
    ValidationList: 'validation-list',
    ValidationListItem: 'validation-list-item',
    Validator: 'validator',
    OptionList: 'option-list',
    OptionListItem: 'option-list-item',
    OptionCustom: 'option-custom',
    ExtensionTypeList: 'extension-type-list',
    ExtensionType: 'extension-type',
    Function: 'function',
    Parameter: 'parameter',
    FunctionOutput: 'function-output',
    Controller: 'controller',
    Maestro: 'maestro',
    ReferenceNode: 'referenceNode', //Is a standing for a node that is at a higher level,
    ClassNode: 'class-node'
}
export const GeneratedTypes = {
    ChangeParameter: 'change-parameter',
    ChangeResponse: 'change-response',
    Constants: 'constants',
    Permissions: 'permissions-generated',
    StreamProcess: 'stream-process',
    StreamProcessOrchestration: 'stream-process-orchestration',
    ValidationRule: 'validation-rule'
}
export const STANDARD_TEST_USING = [
    'Microsoft.VisualStudio.TestTools.UnitTesting',
    'Moq',
    'Autofac',
    'Microsoft.Extensions.Configuration.Json'
]
export const STANDARD_CONTROLLER_USING = [
    'RedQuick.Data',
    'RedQuick.Attributes',
    'RedQuick.Interfaces',
    'RedQuick.Interfaces.Arbiter',
    'RedQuick.Configuration',
    'RedQuick.Util',
    'RedQuick.Interfaces.Data',
    'RedQuick.UI',
    'System',
    'System.Collections',
    'System.Collections.Generic',
    'System.Linq',
    'System.Net',
    'System.Net.Http',
    'System.Threading.Tasks'
]
export const GeneratedConstants = {
    Methods: 'Methods',
    StreamTypes: 'StreamType'
}
export const GeneratedTypesMatch = {
    [GeneratedTypes.ChangeParameter]: NodeTypes.Model
}
export const ColorStates = {
    Error: 'Error'
}
export const NotSelectableNodeTypes = {
    [NodeTypes.ReferenceNode]: true,
    [NodeTypes.PermissionDependency]: true
}
export const NodeTypeColors = {
    [ColorStates.Error]: '#FF0000',
    [NodeTypes.Concept]: '#DD4B39',
    [NodeTypes.Model]: '#713E5A',
    [NodeTypes.Property]: '#484349',
    [NodeTypes.Screen]: '#3A405A',
    [NodeTypes.Attribute]: '#414770',
    [NodeTypes.ChoiceList]: '#457B9D',
    [NodeTypes.ValidationList]: '#A8DADC',
    [NodeTypes.ValidationListItem]: '#EA526F',
    [NodeTypes.OptionList]: '#2EC4B6',
    [NodeTypes.OptionListItem]: '#856A5D',
    [NodeTypes.OptionCustom]: '#403F4C',
    [NodeTypes.ExtensionTypeList]: '#2C2B3C',
    [NodeTypes.ExtensionType]: '#1B2432',
    [NodeTypes.Permission]: '#383F51',
    [NodeTypes.Function]: '#553D36',
    [NodeTypes.Parameter]: '#684A52',
    [NodeTypes.FunctionOutput]: '#857885',
    [NodeTypes.ClassNode]: '#C3BAAA',
    [NodeTypes.Maestro]: '#780116',
    [NodeTypes.Validator]: '#151522',
    [NodeTypes.ReferenceNode]: '#F7B538'
}

export const FunctionGroups = {
    External: 'external',
    Internal: 'internal',
    Core: 'core'
}
export const GroupProperties = {
    IsExternal: 'isExternal',
    FunctionGroup: 'FunctionGroup'
}
export const NameSpace = {
    Model: '.Models',
    StreamProcess: '.ActionStream',
    Tests: '.Tests',
    Extensions: '.Extensions',
    Controllers: '.Controllers',
    Validations: '.Validations',
    Constants: '.Constants',
    Permissions: '.Permissions',
    Parameters: '.Parameters',
    Interface: '.Interface'
}

export const NodeProperties = {
    Enumeration: 'Enumeration',
    AllowedExtensionValues: 'AllowedExtensionValues',
    AllowedEnumValues: 'AllowedEnumerationValue',
    ValidatorModel: 'ValidatorModel',
    ValidatorFunction: 'ValidatorFunction',
    UseEnumeration: 'UseEnumeration',
    NameSpace: 'namespace',
    Validator: 'Validator',
    ValidatorAgent: 'ValidatorAgent',
    Collapsed: 'collapsed',
    UseExtension: 'usextension',
    CodeUser: 'codeUser',
    HttpRoute: 'HttpRoute',
    HttpMethod: 'HttpMethod',
    IsAgent: 'isAgent',
    IsParent: 'isParent', //This is a program setting. Just for allowing us to hide and show the model picker.
    IsUser: 'IsUser', //User is the object directly associated with a IdentityProvider.
    UIUser: 'uiUser',
    IsSharedResource: 'isSharedResource', // Not sure if this helps anything.
    UIPermissions: 'uiPermissions',
    IsOwned: 'isOwned',
    UIName: 'uiName', // The name used in the ui.

    UIText: 'text',

    UISingular: 'uiSingular',
    UIChoice: 'uiChoice',
    UIChoiceType: 'uiChoiceType',
    UIChoiceNode: 'uiChoiceNode', //A node that the "parameter" node points to.
    PermissionRequester: 'permissions-requester',// The agent that is requesting permission to do something
    PermissionTarget: 'permissions-target',
    // Property has a dependent property
    UIDependsOn: 'uiDependsOn',
    UseUIDependsOn: 'UseuiDependsOn',
    UseUIOptions: 'UseuiOptions',
    UIOptionType: 'uiOptionType',

    //Use a custom option
    UseCustomUIOption: 'useCustomUIOption',
    UIOptionTypeCustom: 'uiOptionTypeCustom',
    //An option
    UIOption: 'uiOption',
    //Use Extensions
    UseUIExtensionList: 'UseuiExtensionList',
    UIExtensionList: 'uiExtensionList',
    UIExtension: 'uiExtension',
    UIExtensionDefinition: 'uiExtensionDefinition',

    UIValidationType: 'uiValidationType',
    UseUIValidations: 'UseuiValidations',
    NODEType: 'nodeType',
    ReferenceType: 'referenceType', //Reference nodes will have this type.

    UIAttributeType: 'uiAttributeType',
    UseModelAsType: 'useModelAsType',
    UIModelType: 'uiModelType',

    UseScopeGraph: 'UseScopeGraph',
    ScopeGraph: 'scopedGraph',

    //The name used for code.
    Groups: 'groups',
    GroupParent: 'groupParent',
    CodeName: 'codeName',
    ValueName: 'valueName',//The name of the instance variable to be used 
    AgentName: 'agentName',//The name of the instance variable to be used 
    CodePropertyType: 'codeProperty',
    FunctionType: 'functionType',
    ClassConstructionInformation: 'ClassConstructionInformation'
}

function codeTypeWord(x) {
    if (typeof x === 'string') {
        return x.split('').filter(y => 'abcdefghijklmnopqrstuvwxyzzz1234567890_'.indexOf(y.toLowerCase()) !== -1).join('');
    }
    return x;
}

export const DIRTY_PROP_EXT = '$ _dirty_ $';
export const NodePropertiesDirtyChain = {
    [NodeProperties.UIText]: [{
        chainProp: NodeProperties.CodeName,
        chainFunc: codeTypeWord
    }, {
        chainProp: NodeProperties.AgentName,
        chainFunc: codeTypeWord
    }, {
        chainProp: NodeProperties.ValueName,
        chainFunc: codeTypeWord,
    }, {
        chainProp: NodeProperties.HttpRoute,
        chainFunc: (x) => {
            if (typeof x === 'string') {
                return x.split(' ').join('/').toLowerCase();
            }
            return x;
        }
    }, {
        chainProp: NodeProperties.UIName,
        chainFunc: (x) => {
            return x;
        }
    }]
}
const letters = 'abcdefghijklmnopqrstuvwxyz';
const alphanumerics = letters + '0123456789';
const allowedchars = alphanumerics + ' ';
export function MakeConstant(val) {
    if (val) {
        if (!isNaN(val)) {
            return `"${val}"`;
        }
        val = `${val}`;
        val = val.split('').filter(x => allowedchars.indexOf(x.toLowerCase()) !== -1).join('');
        if (letters.indexOf(val[0].toLowerCase()) === -1) {
            val = '_' + val;
        }
        return val.split(' ').join('_').toUpperCase();
    }
    throw 'needs to have value';
}

export function ConstantsDeclaration(options) {
    var { name, value } = options;

    return `public const string ${name} = ${value};`;
}

export function CreateStringList(options) {
    var { name, list, instance } = options;
    return `${instance ? '' : 'public'} IList<string> ${name} = new List<string> {
        ${list}
    }`
}
export const LinkEvents = {
    Remove: 'remove'
}
export const LinkType = {
    Choice: 'choice',
    Validation: 'validation',
    ValidationItem: 'validation-item',
    Validator: 'validator',
    ValidatorProperty: 'validator-property',
    ValidatorModel: 'validator-model',
    ValidatorFunction: 'validator-function',
    ValidatorModelItem: 'validator-model-item',
    ValidatorAgent: 'validator-agent',
    Option: 'option',
    OptionItem: 'option-item',
    OptionCustom: 'option-custom',
    DependsOn: 'depends-on',
    ExtensionList: 'extension-list',
    Extension: 'extension',
    Enumeration: 'enumeration',
    Permission: 'permission',
    AppliedPermissionLink: 'applied-permission',
    RequestorPermissionLink: 'request-permission-link',//the agent/node that is requesting permissions 
    ExtensionDependencyLink: 'extension-dependency-link',
    FunctionOperator: 'function-operator',
    FunctionLink: 'function-link',
    FunctionVariable: 'function-variable',
    PropertyLink: 'property-link',
    ParentLink: 'parent-link',
    FunctionConstraintLink: 'function-constraint-link',
    ErrorLink: 'error-link',
    RequiredClassLink: 'required-class-link',
    ModelTypeLink: 'model-type-link',
    UserLink: 'user-link', // A link between a user and a personal ([Customer, Manager, Hero])
    MaestroLink: 'maestro-link',
    AttributeLink: 'attribute-link',
    Exist: 'exist', //A node that points with this link type, requires that the node exists, if it doesn't the link and the other node should dissapear.
    PermissionPropertyDependency: 'permission-property-dependency', //There is a link between a permision and a property.
    PermissionDependencyProperty: 'permission-dependency-property' //There is a link bewteen a property and a dependency
}
export const LinkStyles = {
    [LinkType.FunctionLink]: {
        type: LinkType.FunctionLink,
        stroke: NodeTypeColors[NodeTypes.Function]
    },
    [LinkType.ErrorLink]: {
        type: LinkType.ErrorLink,
        stroke: NodeTypeColors[ColorStates.Error]
    },
    [LinkType.FunctionConstraintLink]: {
        type: LinkType.FunctionConstraintLink,
        stroke: NodeTypeColors[NodeTypes.Function]
    },
    [LinkType.FunctionOperator]: {
        type: LinkType.FunctionOperator,
        stroke: NodeTypeColors[NodeTypes.Function]
    },
    [LinkType.PropertyLink]: {
        type: LinkType.PropertyLink,
        stroke: NodeTypeColors[NodeTypes.Property]
    },
    [LinkType.Choice]: {
        type: LinkType.Choice,
        stroke: NodeTypeColors[NodeTypes.ChoiceList]
    },
    [LinkType.Permission]: {
        type: LinkType.Permission,
        stroke: NodeTypeColors[NodeTypes.Permission]
    },
    [LinkType.AppliedPermissionLink]: {
        type: LinkType.AppliedPermissionLink,
        stroke: NodeTypeColors[NodeTypes.Permission]
    },
    [LinkType.Validation]: {
        type: LinkType.Validation,
        stroke: NodeTypeColors[NodeTypes.ValidationList]
    },
    [LinkType.Validator]: {
        type: LinkType.Validator,
        stroke: NodeTypeColors[NodeTypes.Validator]
    },
    [LinkType.Option]: {
        type: LinkType.Option,
        stroke: NodeTypeColors[NodeTypes.OptionList]
    },
    // Options for custom defined options, that need to be made later.
    [LinkType.OptionCustom]: {
        type: LinkType.OptionCustom,
        stroke: NodeTypeColors[NodeTypes.OptionCustom]
    },
    [LinkType.DependsOn]: {
        type: LinkType.DependsOn,
        stroke: NodeTypeColors[NodeTypes.Property]
    },
    [LinkType.ExtensionList]: {
        type: LinkType.ExtensionList,
        stroke: NodeTypeColors[NodeTypes.ExtensionTypeList]
    },
    [LinkType.Extension]: {
        type: LinkType.Extension,
        stroke: NodeTypeColors[NodeTypes.ExtensionType]
    },
    //This link is between an extension with a dependsOn property
    // It describes a link between a property and a secondary property.
    [LinkType.ExtensionDependencyLink]: {
        type: LinkType.ExtensionDependencyLink,
        stroke: NodeTypeColors[NodeTypes.ExtensionTypeList]
    }
}

export const LinkPropertyKeys = {
    TYPE: 'type',
    CONSTRAINTS: 'constraints',
    VALID_CONSTRAINTS: 'valid-constraints',
    FUNCTION_ID: 'function-id'
}

export const LinkProperties = {
    EnumerationLink: {
        type: LinkType.Enumeration
    },
    FunctionVariable: {
        type: LinkType.FunctionVariable,
        [LinkPropertyKeys.FUNCTION_ID]: null
    },
    PermissionDependencyPropertyLink: {
        type: LinkType.PermissionDependencyProperty
    },
    PermissionPropertyDependencyLink: {
        type: LinkType.PermissionPropertyDependency
    },
    AttributeLink: {
        type: LinkType.AttributeLink
    },
    ExistLink: {
        exist: LinkType.Exist
    },
    ModelTypeLink: {
        type: LinkType.ModelTypeLink
    },
    RequiredClassLink: {
        type: LinkType.RequiredClassLink
    },
    FunctionLink: {
        type: LinkType.FunctionLink
    },
    FunctionOperator: {
        type: LinkType.FunctionOperator
    },
    FunctionConstraintLink: {
        type: LinkType.FunctionConstraintLink
    },
    ChoiceLink: {
        type: LinkType.Choice
    },
    PermissionLink: {
        type: LinkType.Permission
    },
    AppliedPermissionLink: {
        type: LinkType.AppliedPermissionLink
    },
    RequestorPermissionLink: {
        type: LinkType.RequestorPermissionLink
    },
    ValdationLink: {
        type: LinkType.Validation
    },
    ValidationLinkItem: {
        type: LinkType.ValidationItem
    },
    ValidatorAgentLink: {
        type: LinkType.ValidatorAgent
    },
    ValidatorModelLink: {
        type: LinkType.ValidatorModel
    },
    ValidatorModelItemLink: {
        type: LinkType.ValidatorModelItem
    },
    ValidatorPropertyLink: {
        type: LinkType.ValidatorProperty
    },
    ValidatorFunctionLink: {
        type: LinkType.ValidatorFunction
    },
    OptionLink: {
        type: LinkType.Option
    },
    OptionItemLink: {
        type: LinkType.OptionItem
    },
    // Options for custom defined options, that need to be made later.
    OptionCustomLink: {
        type: LinkType.OptionCustom
    },
    DependsOnLink: {
        type: LinkType.DependsOn
    },
    ExtensionListLink: {
        type: LinkType.ExtensionList
    },
    ExtensionLink: {
        type: LinkType.Extension
    },
    //This link is between an extension with a dependsOn property
    // It describes a link between a property and a secondary property.
    ExtensionDependencyLink: {
        type: LinkType.ExtensionDependencyLink
    },
    PropertyLink: {
        type: LinkType.PropertyLink
    },
    ParentLink: {
        type: LinkType.ParentLink
    },
    UserLink: {
        type: LinkType.UserLink
    },
    MaestroLink: {
        type: LinkType.MaestroLink
    }
}

export const Methods = {
    Create: 'Create',
    Get: 'Get',
    GetAll: 'GetAll',
    Update: 'Update',
    Delete: 'Delete'
}
export const ValidationRules = {
    CVV: "cvv",
    AlphaNumericLike: "alphanumericlike",
    AlphaOnly: "alphaonly",
    AlphaOnlyWithSpaces: "alphaonlywithspaces",
    NotEmpty: "notempty",
    UrlEmpty: "url_empty",
    Url: "url",
    EmailEmpty: "email_empty",
    Credit: "credit",
    Email: "email",
    ExpirationMonth: "expirationMonth",
    BeforeNow: "beforenow",
    Year: "year",
    Debit: "debit",
    ExpirationYear: "expirationYear",
    PastDate: "pastdate",
    ZipEmpty: "zipempty",
    Zip: "zip",
    SocialSecurity: "socialsecurity",
    OneOf: 'one-of'
}


export const ExtensionDefinitionTypes = {
    DictionaryStringString: 'DictionaryStringString',
    DictionaryStringDictionary: 'DictionaryStringDictionary',
}
export const CollectionTypes = {
    DebitCard: 'DebitCard',
    Email: 'Email',
    Telephone: 'Telephone'
}

export const OptionsTypes = {
    CHOICELIST: 'CHOICELIST',
    CAPITALIZE_FIRST_LETTER: 'CAPITALIZE_FIRST_LETTER'
}
export const NodePropertyTypes = {
    STRING: 'STRING',
    LISTOFSTRINGS: 'LISTOFSTRINGS',
    DATETIME: 'DATETIME',
    INT: 'INT',
    FLOAT: 'FLOAT',
    DOUBLE: 'DOUBLE',
    BOOLEAN: 'BOOLEAN',
    EMAIL: 'EMAIL',
    PHONENUMBER: 'PHONENUMBER'
}
export const NEW_LINE = `
`;
export const ProgrammingLanguages = {
    CSHARP: 'csharp'
}
export const NodePropertyTypesByLanguage = {
    [ProgrammingLanguages.CSHARP]: {
        [NodePropertyTypes.DATETIME]: 'DateTime',
        [NodePropertyTypes.STRING]: 'string',
        [NodePropertyTypes.LISTOFSTRINGS]: 'IList<string>',
        [NodePropertyTypes.INT]: 'int',
        [NodePropertyTypes.FLOAT]: 'float',
        [NodePropertyTypes.DOUBLE]: 'double',
        [NodePropertyTypes.BOOLEAN]: 'bool',
        [NodePropertyTypes.EMAIL]: 'Email',
        [NodePropertyTypes.PHONENUMBER]: 'PhoneNumber'
    }
}
export const RED_QUICK_DATA = 'RedQuick.Data';
export const RED_QUICK_ATTRIBUTES = 'RedQuick.Attributes';
export const Usings = {
    [ProgrammingLanguages.CSHARP]: {
        [NodePropertyTypes.EMAIL]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES],
        [NodePropertyTypes.PHONENUMBER]: [RED_QUICK_DATA, RED_QUICK_ATTRIBUTES]
    }
}
export const NodeAttributePropertyTypes = {

    ROUTINGNUMBER: "ROUTINGNUMBER",
    CURRENCY: "CURRENCY",
    CARMAKE: "CARMAKE",
    SOCIALSECURITY: "SOCIALSECURITY",
    EMAIL: "EMAIL",
    PHONE: "PHONE",
    CARMODEL: "CARMODEL",
    CARYEAR: "CARYEAR",
    VIN: "VIN",
    LONGSTRING: "LONGSTRING",
    CREDITCARD: "CREDITCARD",
    LENGTH: "LENGTH",
    INCH: "INCH",
    DIMENSION: "DIMENSION",
    MONEY: "MONEY",
    COUNTRY: "COUNTRY",
    DEBIT: "DEBIT",
    MONTH: "MONTH",
    STATE: "STATE",
    CHOICE: "CHOICE",
    NUMBER: "NUMBER",
    SLIDER: "SLIDER",
    DATE: "DATE",
    TIME: "TIME",
    BOOLEAN: "BOOLEAN",
    ACCOUNTNUMBER: "ACCOUNTNUMBER",
    ADDRESS: "ADDRESS",
    COLLECTION: "COLLECTION",
    OBJECT: "OBJECT",
    RADIO: "RADIO",
    CHECKLIST: "CHECKLIST",
    STRING: "STRING",
    GEOLOCATION: "GEOLOCATION",
    YEAR: "YEAR"

}

const COMMON_DATETIME_ARGS = {
    value: {
        type: NodePropertyTypes.DATETIME,
        nodeType: NodeTypes.Property
    }
}

const COMMON_STRING_ARGS = {
    value: {
        type: NodePropertyTypes.STRING,
        nodeType: NodeTypes.Property
    }
}


export const ValidationUI = {
    [ValidationRules.OneOf]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'OneOfAttribute'
        },
        arguments: {
            ...COMMON_STRING_ARGS,
            nodeType: NodeTypes.Enumeration,
            reference: {
                types: [NodeTypes.Enumeration, NodeTypes.ExtensionType]
            }
        }
    },
    [ValidationRules.SocialSecurity]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'SocialSecurityAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.Zip]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'ZipAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.ZipEmpty]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'ZipEmptyAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.PastDate]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'PastDateAttribute'
        },
        arguments: { ...COMMON_DATETIME_ARGS }
    },
    [ValidationRules.BeforeNow]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'BeforeNowAttribute'
        },
        arguments: { ...COMMON_DATETIME_ARGS }
    },
    [ValidationRules.Email]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'EmailAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.Credit]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'CreditCardAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.EmailEmpty]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'EmailEmptyAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.Url]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'UrlAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.UrlEmpty]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'UrlEmptyAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.AlphaNumericLike]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'AlphaNumericLinkAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.AlphaOnly]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'AlphaOnlyAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    },
    [ValidationRules.AlphaOnlyWithSpaces]: {
        code: {
            [ProgrammingLanguages.CSHARP]: 'NotEmptyAttribute'
        },
        arguments: { ...COMMON_STRING_ARGS }
    }
}