import { GetItem } from './uiactions';
const context: any = {};
export function setParameters(params: any) {
	context.params = params;
}
export function retrieveParameters() {
	return {
		...context.params || {}
	};
}
const DEFAULT = 'DEFAULT';
const READY_TO_SEND = 'READY_TO_SEND';
const SENDING = 'SENDING';
let fetchServiceFunc: Function;
const modelStorage: any = {
	state: DEFAULT,
	pending: [],
	presend: [],
	maxRequested: 50
};

function addToPending(modelType: any, id: any) {
	modelStorage.pending.push({ modelType, id });
}
function callFetchFunction() {
	if (hasSomethingToFetch()) {
		collectItemsToSend();
		sendItems();
	}
}
let fetchServiceThread = Promise.resolve();
export function setFetchServiceFunction(func: Function) {
	fetchServiceFunc = func;
}

function createPackageToSendDefault() {
	return {};
}
function addToPackage(packageToSend: { [x: string]: { ids: any[] } }, v: { modelType: string | number; id: any }) {
	if (!GetItem(v.modelType, v.id)) {
		packageToSend[v.modelType] = packageToSend[v.modelType] || { ids: [] };
		if (packageToSend[v.modelType].ids.indexOf(v.id) === -1) {
			packageToSend[v.modelType].ids.push(v.id);
		}
	}
}

function sendItems() {
	let packageToSend = createPackageToSendDefault();
	modelStorage.presend.map((v: any) => {
		addToPackage(packageToSend, v);
	});
	if (fetchServiceFunc) {
		fetchServiceThread
			.then(() => {
				modelStorage.state = SENDING;
				if (packageToSend && Object.keys(packageToSend).length) {
					return fetchServiceFunc(packageToSend);
				}
				return null;
			})
			.catch((e) => {
				console.log(e);
			})
			.then(() => {
				modelStorage.presend = modelStorage.presend.filter((x: any) => !GetItem(x.modelType, x.id));
				return null;
			})
			.then(() => {
				modelStorage.state = DEFAULT;
				fetchModel();
				return null;
			});
	} else {
		throw new Error('no fetch service function set');
	}
}
function collectItemsToSend() {
	const tosend = modelStorage.pending.slice(0, modelStorage.maxRequested);
	modelStorage.pending = modelStorage.pending.slice(modelStorage.maxRequested);
	modelStorage.presend = tosend;
	modelStorage.state = READY_TO_SEND;
}
function hasSomethingToFetch() {
	return !!modelStorage.pending.length;
}
export function fetchModel(modelType?: any, id?: any) {
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
			throw 'fetching service in undefined state';
	}
}
