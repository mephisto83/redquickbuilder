
export const NodeTypes = {
    Concept: 'concept',
    Model: 'model',
    Property: 'model-property',
    Screen: 'screen',
    Attribute: 'attribute-property',
    ChoiceList: 'choice-list',
    ChoiceListItem: 'choice-list-item',
    ValidationList: 'validation-list',
    ValidationListItem: 'validation-list-item'
}

export const NodeTypeColors = {
    [NodeTypes.Concept]: '#DD4B39',
    [NodeTypes.Model]: '#713E5A',
    [NodeTypes.Property]: '#484349',
    [NodeTypes.Screen]: '#3A405A',
    [NodeTypes.Attribute]: '#414770',
    [NodeTypes.ChoiceList]: '#457B9D',
    [NodeTypes.ValidationList]: '#A8DADC',
    [NodeTypes.ValidationListItem]: '#EA526F'
}

export const NodeProperties = {
    UIName: 'uiName',
    UISingular: 'uiSingular',
    UIChoice: 'uiChoice',
    UIChoiceType: 'uiChoiceType',
    UIValidationType: 'uiValidationType',
    UseUIValidations: 'UseuiValidations',
    NODEType: 'nodeType',
    UIAttributeType: 'uiAttributeType'
}

export const LinkType = {
    Choice: 'choice',
    Validation: 'validation'
}
export const LinkProperties = {
    ChoiceLink: {
        type: LinkType.Choice
    },
    ValdationLink: {
        type: LinkType.Validation
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
    CAPITALIZE_FIRST_LETTER: "CAPITALIZE_FIRST_LETTER",
    COUNTRY: "COUNTRY",
    DEBIT: "DEBIT",
    CHOICELIST: "CHOICELIST",
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