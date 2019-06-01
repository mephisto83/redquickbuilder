
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
    Constants: 'constants',
    Permissions: 'permissions-generated'
}
export const GeneratedConstants = {
    Methods: 'Methods'
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
    Extensions: '.Extensions',
    Controllers: '.Controllers',
    Constants: '.Constants',
    Parameters: '.Parameters'
}

export const NodeProperties = {
    Enumeration: 'Enumeration',
    AllowedExtensionValues: 'AllowedExtensionValues',
    AllowedEnumValues: 'AllowedEnumerationValue',
    UseEnumeration: 'UseEnumeration',
    NameSpace: 'namespace',
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

export const DIRTY_PROP_EXT = '$ _dirty_ $';
export const NodePropertiesDirtyChain = {
    [NodeProperties.UIText]: [{
        chainProp: NodeProperties.CodeName,
        chainFunc: (x) => {
            if (typeof x === 'string') {
                return x.split('').filter(y => 'abcdefghijklmnopqrstuvwxyzzz1234567890_'.indexOf(y.toLowerCase()) !== -1).join('');
            }
            return x;
        }
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
    var { name, list } = options;
    return `public IList<string> ${name} = new List<string> {
        ${list}
    }`
}

export const LinkType = {
    Choice: 'choice',
    Validation: 'validation',
    ValidationItem: 'validation-item',
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
    PermissionPropertyDependency: 'permission-property-dependency' //There is a link between a permision and a property.
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
    PermissionPropertyDependencyLink: {
        type: LinkType.PermissionPropertyDependency
    },
    AttributeLink: {
        type: LinkType.AttributeLink
    },
    ExistLink: {
        type: LinkType.Exist
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
    INT: 'INT',
    FLOAT: 'FLOAT',
    DOUBLE: 'DOUBLE',
    BOOLEAN: 'BOOLEAN',
    EMAIL: 'EMAIL',
    PHONENUMBER: 'PHONENUMBER'
}

export const ProgrammingLanguages = {
    CSHARP: 'csharp'
}
export const NodePropertyTypesByLanguage = {
    [ProgrammingLanguages.CSHARP]: {
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
export const Usings = {
    [ProgrammingLanguages.CSHARP]: {
        [NodePropertyTypes.EMAIL]: [RED_QUICK_DATA],
        [NodePropertyTypes.PHONENUMBER]: [RED_QUICK_DATA]
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