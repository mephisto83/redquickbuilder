"use strict";

import { endPoints } from "./endPoints";

import * as Globals from "./globals";

//require('es6-promise').polyfill();
// if (typeof self !== "undefined" && !fetch) {
//   //when its in the web.
//   console.log("-- --- using isomorphic-fetch");
//   require("isomorphic-fetch");
// }
var accessToken = "";
var getEndpoint = (baseDomain, path) => {
  var endpoint = baseDomain + path;
  if (baseDomain.endsWith("/") && path.startsWith("/")) {
    endpoint = baseDomain + path.substring(1);
  } else if (!baseDomain.endsWith("/") && !path.startsWith("/")) {
    endpoint = baseDomain + "/" + path;
  }

  return endpoint;
};
export function setBearerAccessToken(access_token) {
  accessToken = access_token;
}
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
export function createRedService(domain, wsdomain, _forceBase) {
  var forceBase = false;
  forceBase = _forceBase;
  var baseDomain = domain;
  var wsbaseDomain = wsdomain;
  var headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  var connection,
    proxy,
    websocketConnection,
    receivedMessageHandler,
    onUnauthorizedHandler;
  var service = {
    setDomain: function(domain) {
      baseDomain = domain;
    },
    onReceiveMessage: function(receiveMessageHandler) {
      receivedMessageHandler = receiveMessageHandler;
    },
    onUnauthorized: function(handler) {
      onUnauthorizedHandler = handler;
    },
    setWSDomain: function(domain) {
      wsbaseDomain = domain;
    },
    setUserAccessToken: function(access_token) {
      accessToken = access_token;
      service.r.connect();
    },
    setBearerAccessToken: function(access_token) {
      accessToken = access_token;
    },
    getAccessToken: function() {
      return accessToken;
    },
    call: function(endpoint, method, body, options = {}) {
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
              Accept:
                "application/json, application/xml, text/plain, text/html, *.*",
              // 'Authorization': 'Bearer ' + service.getAccessToken(),
              "Content-Type": "multipart/form-data"
            }
          ),
          method: method,
          body: formData
        });
      } else {
        fetchPromise = fetch(endpoint, {
          rejectUnauthorized: false,
          headers: Object.assign({}, headers, {
            Authorization: "Bearer " + service.getAccessToken()
          }),
          method: method,
          body: body == undefined ? null : JSON.stringify(body)
        });
      }
      let receivedHeaders = {};
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
        .then(res => {
          if (options && options.collectCookies) {
            return {
              result: res,
              headers: receivedHeaders
            };
          }
          return res;
        })
        .catch(e => {
          console.log(e);
          if (e && e.unauthorized && onUnauthorizedHandler) {
            onUnauthorizedHandler(e);
          }
          return Promise.reject(e);
        });
    },
    delete: function(path) {
      return Globals.getDefaultURL().then(_baseDomain => {
        var endpoint = getEndpoint(
          forceBase ? baseDomain || _baseDomain : _baseDomain,
          path
        );
        return service.call(endpoint, "DELETE");
      });
    },
    put: function(path, body) {
      return Globals.getDefaultURL().then(_baseDomain => {
        var endpoint = getEndpoint(
          forceBase ? baseDomain || _baseDomain : _baseDomain,
          path
        );
        return service.call(endpoint, "PUT", body);
      });
    },
    post: function(path, body, options = {}) {
      return Globals.getDefaultURL().then(_baseDomain => {
        var endpoint = getEndpoint(
          forceBase ? baseDomain || _baseDomain : _baseDomain,
          path
        );
        return service.call(endpoint, "POST", body, options);
      });
    },
    patch: function(path, body) {
      return Globals.getDefaultURL().then(_baseDomain => {
        var endpoint = getEndpoint(
          forceBase ? baseDomain || _baseDomain : _baseDomain,
          path
        );
        return service.call(endpoint, "PATCH", body);
      });
    },
    get: function(path) {
      return Globals.getDefaultURL().then(_baseDomain => {
        var endpoint = getEndpoint(
          forceBase ? baseDomain || _baseDomain : _baseDomain,
          path
        );
        return service.call(endpoint, "GET");
      });
    },
    r: {
      close: () => {
        if (websocketConnection && websocketConnection.close) {
          websocketConnection.close();
          console.log("Web socket closed");
        }
      },
      connect: function(handler, onopen, onclose, onerror) {
        receivedMessageHandler = handler || receivedMessageHandler;
        var promise = Promise.resolve();
        var oncatch = e => {
          if (e && e.message && e.message.json) {
            return e.message
              .json()
              .then(c => UIA.log(c))
              .catch(() => {});
          }
          UIA.log(e);
        };
        function connectToService() {
          return Globals.getDefaultWS().then(wsbaseDomain => {
            return new Promise((resolve, fail) => {
              service
                .post(endPoints.blindCreds)
                .then(cred => {
                  var ws = new WebSocket(
                    wsbaseDomain + endPoints.socket + "?name=" + cred
                  );

                  ws.onopen = () => {
                    // connection opened
                    // ws.send('something');
                    websocketConnection = ws;
                    if (onopen) {
                      onopen();
                    }
                  };

                  ws.onmessage = e => {
                    // a message was received

                    if (receivedMessageHandler) {
                      receivedMessageHandler(e.data);
                    }
                  };

                  ws.onerror = e => {
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

                  ws.onclose = e => {
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
                .catch(e => {
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
