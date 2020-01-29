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
function sendItems() {
  let packageToSend = {};
  modelStorage.presend.map(v => {
    packageToSend[v.modelType] = packageToSend[v.modelType] || [];
    packageToSend[v.modelType].push(v.id);
  });
  if (fetchServiceFunc) {
    fetchServiceThread
      .then(() => {
        modelStorage.state = SENDING;
        return fetchServiceFunc(packageToSend);
      })
      .catch(e => {
        console.log(e);
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
