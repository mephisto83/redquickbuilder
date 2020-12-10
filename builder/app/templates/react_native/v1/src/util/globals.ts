var ReactNative = require('react-native');
var { AsyncStorage } = ReactNative;

import { https_, wss } from '../configuration.js';

export const DEFAULT_URL = https_;
export const WS_DEFAULT_URL = wss;
export const DEBUG_MODE = false;
export const setEnvironment = (environment: any) => {
	return AsyncStorage.setItem('ENVIRONMENT', environment);
};
var GOOGLE_PLACES_API: any = null;
export const setGooglePlacesApi = (api: any) => {
	GOOGLE_PLACES_API = api;
	return AsyncStorage.setItem('GOOGLE_PLACES_API', api);
};
export const getGooglePlacesApi = () => {
	return GOOGLE_PLACES_API;
};
export const ENVIRONMENT_URLS = 'ENVIRONMENT_URLS';
export const ENVIRONMENT_URLS_WS = 'ENVIRONMENT_URLS_WS';
export const setEnvironmentUrls = (dict: any) => {
	return AsyncStorage.setItem(ENVIRONMENT_URLS, JSON.stringify(dict)).then(() => {
		if (setDefaultUrlPromise && typeof setDefaultUrlPromise === 'function') setDefaultUrlPromise();
		setDefaultUrlPromise = true;
	});
};
export const setEnvironmentWebSocketUrls = (dict: any) => {
	return AsyncStorage.setItem(ENVIRONMENT_URLS_WS, JSON.stringify(dict)).then(() => {
		if (setDefaultWSPromise && typeof setDefaultWSPromise === 'function') setDefaultWSPromise();
		setDefaultWSPromise = true;
	});
};

export const setLocation = (location: any) => {
	return AsyncStorage.setItem('LOCATION', JSON.stringify(location));
};
export const getLocation = () => {
	return AsyncStorage.getItem('LOCATION').then((item: any) => {
		if (item) {
			return JSON.parse(item);
		}
		return null;
	});
};
var setDefaultWSPromise: any = null;
export const getDefaultWS = () => {
	return new Promise((resolve) => {
		if (setDefaultWSPromise) {
			resolve(true);
		}
		setDefaultWSPromise = resolve;
	}).then(() => {
		return AsyncStorage.getItem('ENVIRONMENT').then((res: any) => {
			return AsyncStorage.getItem(ENVIRONMENT_URLS_WS).then((environments: any) => {
				var envs = JSON.parse(environments);
				if (envs[res]) {
					return envs[res];
				}
				throw new Error('unknown ws endpoint');
			});
		});
	});
};

export const getCurrentEnvironment = () => {
	return AsyncStorage.getItem('ENVIRONMENT');
};
var setDefaultUrlPromise: any = null;
export const getDefaultURL = (add?: string) => {
	add = add || '';
	return Promise.resolve(DEFAULT_URL);
	// return new Promise((resolve, fail) => {

	//     if (setDefaultUrlPromise) {
	//         resolve();
	//     }
	//     setDefaultUrlPromise = resolve;
	// }).then(() => {
	//     return AsyncStorage.getItem('ENVIRONMENT').then(res => {
	//         return AsyncStorage.getItem(ENVIRONMENT_URLS).then(environments => {
	//             var envs = JSON.parse(environments);
	//             if (envs[res]) {
	//                 return envs[res];
	//             }
	//             throw new Error('unknown http(s) endpoint');
	//         });
	//     });
	// });
};

export const IceConfiguration = () => {
	return Promise.resolve().then(() => {
		return { iceServers: [ { url: 'stun:stun.l.google.com:19302' } ] };
	});
};
