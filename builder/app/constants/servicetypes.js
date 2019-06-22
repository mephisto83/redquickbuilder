export const ServiceTypes = {
    Facebook: 'Facebook',
    Twitter: 'Twitter',
    Google: 'Google',
    Microsoft: 'Microsoft'
}

export const ServiceTypeSetups = {
    [ServiceTypes.Facebook]: {
        properties: {
            UseFacebook: { type: 'boolean' },
            FacebookAppId: { type: 'string' },
            FacebookAppSecret: { type: 'string' }
        }
    },
    [ServiceTypes.Microsoft]: {
        properties: {
            UseMicrosoftAccount: { type: 'boolean' },
            MicrosoftClientId: { type: 'string' },
            MicrosoftClientSecret: { type: 'string' }
        }
    },
    [ServiceTypes.Google]: {
        properties: {
            UseGoogle: { type: 'boolean' },
            GoogleClientId: { type: 'string' },
            GoogleClientSecret: { type: 'string' }
        }
    },
    [ServiceTypes.Twitter]: {
        properties: {
            UseTwitter: { type: 'boolean' },
            TwitterConsumerKey: { type: 'string' },
            TwitterConsumerSecret: { type: 'string' }
        }
    }
}

export const SystemSettings = {
    Domain: 'Domain'
}