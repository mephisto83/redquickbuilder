'use strict';

import { endPoints } from './endPoints';
import * as localStore from './storage';
import * as Globals from './globals';

//require('es6-promise').polyfill();
// if (typeof self !== "undefined" && !fetch) {
//   //when its in the web.
//   console.log("-- --- using isomorphic-fetch");
//   require("isomorphic-fetch");
// }
var accessToken = '';
let userId: string;
let credentials: ServiceCredentials = {
	accessToken: '',
	userId: ''
};
interface ServiceCredentials {
	isAnonymous?: boolean;
	password?: any;
	userName?: any;
	userId?: string;
	accessToken?: string;
}
const CREDENTIALS = '$CREDENTIALS$';
var getEndpoint = (baseDomain: any, path: any) => {
	var endpoint = baseDomain + path;
	if (baseDomain.endsWith('/') && path.startsWith('/')) {
		endpoint = baseDomain + path.substring(1);
	} else if (!baseDomain.endsWith('/') && !path.startsWith('/')) {
		endpoint = baseDomain + '/' + path;
	}

	return endpoint;
};

export function setBearerAccessToken(access_token: string, _userId?: string) {
	accessToken = access_token;
	credentials = credentials || {};
	credentials.accessToken = accessToken;
	userId = _userId || '';
	credentials.userId = _userId || '';
	updateStoredCredentials();
}
export function getUser() {
	return userId || (credentials ? credentials.userId : null);
}

let storagePromise = Promise.resolve();
export function setUserNameAndPasswordForAnonymousUser(username: any, password: any) {
	credentials = credentials || {};
	credentials.userName = username;
	credentials.password = password;
	credentials.isAnonymous = true;
	updateStoredCredentials();
}

export function updateStoredCredentials() {
	storagePromise = storagePromise
		.then(() => {
			return localStore.setItem(CREDENTIALS, JSON.stringify(credentials));
		})
		.catch((e) => console.warn(e));
}

export async function loadCredentials(callback: Function) {
	try {
		var creds = await localStore.getItemJson(CREDENTIALS);
		credentials = creds;
		if (callback) {
			callback(credentials);
		}
		return credentials;
	} catch (e) {
		console.warn(e);
	}
	if (callback) {
		callback(null);
	}
	return null;
}

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
export function createRedService(domain: any, wsdomain?: any, _forceBase?: any) {
	var forceBase = false;
	forceBase = _forceBase;
	var baseDomain = domain;
	var wsbaseDomain = wsdomain;
	var headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	};
	var connection,
		proxy,
		websocketConnection: WebSocket,
		receivedMessageHandler: (arg0: any) => void,
		onUnauthorizedHandler: (arg0: any) => void;
	var service = {
		testMode: false,
		setDomain: function(domain: any) {
			baseDomain = domain;
		},
		onReceiveMessage: function(receiveMessageHandler: any) {
			receivedMessageHandler = receiveMessageHandler;
		},
		onUnauthorized: function(handler: any) {
			onUnauthorizedHandler = handler;
		},
		setWSDomain: function(domain: any) {
			wsbaseDomain = domain;
		},
		setUserAccessToken: function(access_token: string) {
			accessToken = access_token;
			service.r.connect();
		},
		setBearerAccessToken: function(access_token: string) {
			accessToken = access_token;
		},
		getAccessToken: function() {
			return accessToken;
		},
		call: function(
			endpoint: RequestInfo,
			method: any,
			body?: { [x: string]: string | Blob } | undefined,
			options: { asText?: any; collectCookies?: any; asForm?: any } = {}
		) {
			console.log(`calling at ${new Date().toTimeString()} ${endpoint}`);
			let fetchPromise = null;
			if (options && options.asForm) {
				var formData = new FormData();
				if (body) {
					for (var i in body) {
						formData.append(i, body[i]);
					}
				}
				fetchPromise = fetch(endpoint, {
					headers: Object.assign(
						{},
						{
							Accept: 'application/json, application/xml, text/plain, text/html, *.*',
							// 'Authorization': 'Bearer ' + service.getAccessToken(),
							'Content-Type': 'multipart/form-data'
						}
					),
					credentials: 'include',
					method: method,
					body: formData
				});
			} else {
				fetchPromise = fetch(endpoint, {
					// rejectUnauthorized: false,
					credentials: 'omit',
					headers: Object.assign({}, headers, {
						'Access-Control-Allow-Origin': 'http://localhost:3000',
						Authorization: 'Bearer ' + service.getAccessToken()
					}),
					method: method,
					body: body == undefined ? null : JSON.stringify(body)
				});
			}
			let receivedHeaders: any = {};
			return fetchPromise
				.then(function(response) {
					//setTimeout(() => null, 0);  // workaround for issue-6679
					if (response.status === 401) {
						throw {
							unauthorized: true,
							status: response.status
						};
					} else if (response.status >= 400) {
						throw {
							status: response.status,
							message: response
						};
					}
					if (options && options.collectCookies) {
						response.headers.forEach((val, key) => {
							receivedHeaders[key] = val;
						});
					}
					if (options && options.asText) {
						return response.text().then(function(txt) {
							console.log(`called at ${new Date().toTimeString()} ${endpoint}`);
							return txt;
						});
					}
					return response.json().then(function(json) {
						console.log(`called at ${new Date().toTimeString()} ${endpoint}`);
						return json;
					});
				})
				.then((res) => {
					if (options && options.collectCookies) {
						return {
							result: res,
							headers: receivedHeaders
						};
					}
					return res;
				})
				.catch((e) => {
					console.log(e);
					if (e && e.unauthorized && onUnauthorizedHandler) {
						onUnauthorizedHandler(e);
					}
					return Promise.reject(e);
				});
		},
		delete: function(path: any) {
			return Globals.getDefaultURL().then((_baseDomain: any) => {
				var endpoint = getEndpoint(forceBase ? baseDomain || _baseDomain : _baseDomain, path);
				return service.call(endpoint, 'DELETE');
			});
		},
		put: function(path: any, body: any) {
			return Globals.getDefaultURL().then((_baseDomain: any) => {
				var endpoint = getEndpoint(forceBase ? baseDomain || _baseDomain : _baseDomain, path);
				return service.call(endpoint, 'PUT', body);
			});
		},
		post: function(path: any, body: any, options = {}) {
			return Globals.getDefaultURL().then((_baseDomain: any) => {
				var endpoint = getEndpoint(forceBase ? baseDomain || _baseDomain : _baseDomain, path);
				return service.call(endpoint, 'POST', body, options);
			});
		},
		patch: function(path: any, body: any) {
			return Globals.getDefaultURL().then((_baseDomain: any) => {
				var endpoint = getEndpoint(forceBase ? baseDomain || _baseDomain : _baseDomain, path);
				return service.call(endpoint, 'PATCH', body);
			});
		},
		get: function(path: any) {
			return Globals.getDefaultURL().then((_baseDomain: any) => {
				var endpoint = getEndpoint(forceBase ? baseDomain || _baseDomain : _baseDomain, path);
				return service.call(endpoint, 'GET');
			});
		},
		r: {
			close: () => {
				if (websocketConnection && websocketConnection.close) {
					websocketConnection.close();
					console.log('Web socket closed');
				}
			},
			connect: function(
				handler?: any,
				onopen?: () => void,
				onclose?: (arg0: CloseEvent) => void,
				onerror?: (arg0: Event) => void
			) {
				receivedMessageHandler = handler || receivedMessageHandler;
				var promise: Promise<void | unknown> = Promise.resolve();
				var oncatch = (e: { message: { json: () => Promise<any> } }) => {
					if (e && e.message && e.message.json) {
						return e.message.json().then((c: any) => console.log(c)).catch(() => {});
					}
					console.log(e);
				};
				function connectToService() {
					return Globals.getDefaultWS().then((wsbaseDomain) => {
						return new Promise((resolve, fail) => {
							service
								.post(endPoints.blindCreds, null)
								.then((cred: string) => {
									var ws = new WebSocket(wsbaseDomain + endPoints.socket + '?name=' + cred);

									ws.onopen = () => {
										// connection opened
										// ws.send('something');
										websocketConnection = ws;
										if (onopen) {
											onopen();
										}
									};

									ws.onmessage = (e) => {
										// a message was received

										if (receivedMessageHandler) {
											receivedMessageHandler(e.data);
										}
									};

									ws.onerror = (e) => {
										// setTimeout(function () {
										//     resolve();
										//     promise = promise.then(() => {
										//         connectToService();
										//     });
										// }, 5000)
										if (onerror) {
											onerror(e);
										}
									};

									ws.onclose = (e) => {
										// connection closed
										if (onclose) {
											onclose(e);
										}
										setTimeout(function() {
											resolve();
											promise = promise.then(() => {
												return connectToService().catch(oncatch);
											});
										}, 5000);
									};
								})
								.catch((e: any) => {
									resolve();
									return Promise.resolve()
										.then(() => {
											return oncatch(e);
										})
										.then(() => {
											return connectToService().catch(oncatch);
										});
								});
						});
					});
				}
				if (!service.testMode) {
					promise = promise.then(() => {
						return connectToService().catch(oncatch);
					});
				}
			}
		}
	};
	return service;
}

// export default _createService;
