import AsyncStorage from '@react-native-community/async-storage';

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    // saving error
  }
}

export async function getItem(key): Promise<any> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // value previously stored

    }
    return value;
  } catch (e) {
    // error reading value
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
