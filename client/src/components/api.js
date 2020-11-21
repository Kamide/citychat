const API_URL = (process.env['REACT_APP_API_URL'])
  ? process.env['REACT_APP_API_URL'].replace(/\/+$/, "")
  : 'http://localhost:5000';

export function route(path) {
  return API_URL + path;
}

export function publicRoute(path) {
  return route('/public' + path);
}

export function protectedRoute(path) {
  return route('/protected' + path);
}

export const GET_REQ = {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}

export const POST_REQ = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}

export function postReq(body) {
  return {
    ...POST_REQ,
    body: JSON.stringify(body)
  };
}

export function postReqCred(body) {
  return {
    ...postReq(body),
    credentials: 'include'
  };
}

function getCSRFToken(refresh = false) {
  const token = document.cookie.split('; ')
    .find(pair => pair.startsWith(refresh ? 'csrf_refresh_token' : 'csrf_access_token'))

  if (token) {
    return token.split('=')[1];
  }

  return '';
}

export function postReqCSRF(body, refresh = false) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCSRFToken(refresh)
    },
    body: JSON.stringify(body),
    credentials: 'include'
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
