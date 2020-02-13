import { GetItem } from "./uiActions";
const context = {};
export function setParameters(params) {
  context.params = params;
}
export function useParameters() {
  return {
    ...(context.params || {})
  };
}
const DEFAULT = "DEFAULT";
const READY_TO_SEND = "READY_TO_SEND";
const SENDING = "SENDING";
let fetchServiceFunc = null;
const modelStorage = {
  state: DEFAULT,
  pending: [],
  presend: [],
  maxRequested: 50
};

function addToPending(modelType, id) {
  modelStorage.pending.push({ modelType, id });
}
function callFetchFunction() {
  if (hasSomethingToFetch()) {
    collectItemsToSend();
    sendItems();
  }
}
let fetchServiceThread = Promise.resolve();
export function setFetchServiceFunction(func) {
  fetchServiceFunc = func;
}

function createPackageToSendDefault() {
  return {};
}
function addToPackage(packageToSend, v) {
  if (!GetItem(v.modelType, v.id)) {
    packageToSend[v.modelType] = packageToSend[v.modelType] || { ids: [] };
    if (packageToSend[v.modelType].ids.indexOf(v.id) === -1) {
      packageToSend[v.modelType].ids.push(v.id);
    }
  }
}

function sendItems() {
  let packageToSend = createPackageToSendDefault();
  modelStorage.presend.map(v => {
    addToPackage(packageToSend, v);
  });
  if (fetchServiceFunc) {
    fetchServiceThread
      .then(() => {
        modelStorage.state = SENDING;
        if (packageToSend && Object.keys(packageToSend).length) {
          return fetchServiceFunc(packageToSend);
        }
      })
      .catch(e => {
        console.log(e);
      })
      .then(() => {
        modelStorage.presend = modelStorage.presend.filter(x => {
          return !GetItem(x.modelType, x.id);
        });
      })
      .then(() => {
        modelStorage.state = DEFAULT;
        fetchModel();
      });
  } else {
    throw "no fetch service function set";
  }
}
function collectItemsToSend() {
  let tosend = modelStorage.pending.slice(0, modelStorage.maxRequested);
  modelStorage.pending = modelStorage.pending.slice(modelStorage.maxRequested);
  modelStorage.presend = tosend;
  modelStorage.state = READY_TO_SEND;
}
function hasSomethingToFetch() {
  return !!modelStorage.pending.length;
}
export function fetchModel(modelType, id) {
  if (modelType && id) {
    addToPending(modelType, id);
  }
  switch (modelStorage.state) {
    case SENDING:
      break;
    case READY_TO_SEND:
      break;
    case DEFAULT:
      callFetchFunction();
      break;
    default:
      throw "fetching service in undefined state";
  }
}
