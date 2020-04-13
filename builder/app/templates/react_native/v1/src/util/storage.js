import AsyncStorage from '@react-native-community/async-storage';

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e) {
    // saving error
  }
}

export async function getItem(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // value previously stored
    }
  } catch (e) {
    // error reading value
  }
}
