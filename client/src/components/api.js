const API_URL = (process.env['REACT_APP_API_URL'])
  ? process.env['REACT_APP_API_URL'].replace(/\/+$/, "")
  : 'http://localhost:5000';

export function route(path) {
  return API_URL + path;
}

export const GET_REQUEST = {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}

export const POST_REQUEST = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}

export function postRequest(body) {
  return {
    ...POST_REQUEST,
    body: body
  }
}

export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchRetry(url, request, limit, delay) {
  try {
    return await (await fetch(url, request)).json();
  }
  catch(e) {
    if (limit <= 0) {
      throw e;
    }

    await sleep(delay);
    return await fetchRetry(url, request, limit - 1, delay);
  }
}
