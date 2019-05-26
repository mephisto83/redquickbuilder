
export const NodeTypes = {
    Concept: 'concept',
    Model: 'model',
    Property: 'model-property',
    Screen: 'screen',
    Attribute: 'attribute-property',
    ChoiceList: 'choice-list',
    Permission: 'permission',
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
    ClassNode: 'class-node'
}
export const ColorStates = {
    Error: 'Error'
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
    [NodeTypes.ClassNode]: '#C3BAAA'
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
export const NodeProperties = {
    IsAgent: 'isAgent',
    IsParent: 'isParent', //This is a program setting. Just for allowing us to hide and show the model picker.
    IsUser: 'IsUser', //User is the object directly associated with a IdentityProvider.
    UIUser: 'uiUser',
    IsSharedResource: 'isSharedResource', // Not sure if this helps anything.
    UIPermissions: 'uiPermissions',
    IsOwned: 'isOwned',
    UIName: 'uiName',

    UIText: 'text',

    UISingular: 'uiSingular',
    UIChoice: 'uiChoice',
    UIChoiceType: 'uiChoiceType',
    UIChoiceNode: 'uiChoiceNode', //A node that the "parameter" node points to.
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
    UIAttributeType: 'uiAttributeType',

    UseScopeGraph: 'UseScopeGraph',
    ScopeGraph: 'scopedGraph',

    //The name used for code.
    CodeName: 'codeName',
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
                return x.split('').filter(y => 'abcdefghijklmnopqrstuvwxyzzz1234567890'.indexOf(y.toLowerCase()) !== -1).join('');
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


export const LinkType = {
    Choice: 'choice',
    Validation: 'validation',
    Option: 'option',
    OptionCustom: 'option-custom',
    DependsOn: 'depends-on',
    ExtensionList: 'extension-list',
    Extension: 'extension',
    Permission: 'permission',
    AppliedPermissionLink: 'applied-permission',
    ExtensionDependencyLink: 'extension-dependency-link',
    FunctionOperator: 'function-operator',
    FunctionLink: 'function-link',
    FunctionVariable: 'function-variable',
    PropertyLink: 'property-link',
    ParentLink: 'parent-link',
    FunctionConstraintLink: 'function-constraint-link',
    ErrorLink: 'error-link',
    RequiredClassLink: 'required-class-link',
    UserLink: 'user-link' // A link between a user and a personal ([Customer, Manager, Hero])
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
    FunctionVariable: {
        type: LinkType.FunctionVariable,
        [LinkPropertyKeys.FUNCTION_ID]: null
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
    ValdationLink: {
        type: LinkType.Validation
    },
    OptionLink: {
        type: LinkType.Option
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
    }
}

export const ValidationRules = {
    CVV: "cvv",
    AlphaNumericLike: "alphanumericlike",
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
    BOOLEAN: 'BOOLEAN'
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