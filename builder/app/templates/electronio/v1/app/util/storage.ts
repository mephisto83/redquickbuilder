export async function setItem(key: any, value: any) {
	try {
		return localStorage.setItem(key, value);
	} catch (e) {
		// saving error
	}
}

export async function getItem(key: any) {
	try {
		return localStorage.getItem(key);
	} catch (e) {
		// error reading value
		console.warn(e);
	}
	return null;
}

export async function getItemJson(key: any) {
	try {
		const res: any = await getItem(key);
		return JSON.parse(res);
	} catch (e) {
		console.warn(e);
	}
	return null;
}
