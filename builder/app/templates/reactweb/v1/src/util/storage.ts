
export async function setItem(key, value) {
  try {
    return localStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
}

export async function getItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    // error reading value
    console.warn(e);
  }
  return null;
}

export async function getItemJson(key) {
  try {
    const res = await getItem(key);
    return JSON.parse(res);
  }
  catch (e) {
    console.warn(e);
  }
  return null;
}
