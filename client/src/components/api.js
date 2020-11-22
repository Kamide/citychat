import history from './history';

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

const JSON_CONTENT_TYPE = { 'Content-Type': 'application/json' };
const JSON_HEADER = { headers: {...JSON_CONTENT_TYPE} };
const INCLUDE_CREDENTIALS = { credentials: 'include' };

export const GET_OPT = {
  method: 'GET',
  ...JSON_HEADER
}

export const GET_OPT_JWT = {
  ...GET_OPT,
  ...INCLUDE_CREDENTIALS
}

export const POST_OPT = {
  method: 'POST',
  ...JSON_HEADER
}

export const PATCH_OPT = {
  method: 'PATCH',
  ...JSON_HEADER
}

export function postOpt(body) {
  return {
    ...POST_OPT,
    body: JSON.stringify(body)
  };
}

export function postOptJWT(body) {
  return {
    ...postOpt(body),
    ...INCLUDE_CREDENTIALS
  };
}

function getCSRFToken(refreshToken = false) {
  const token = document.cookie.split('; ')
    .find(pair => pair.startsWith(refreshToken ? 'csrf_refresh_token' : 'csrf_access_token'))

  if (token) {
    return token.split('=')[1];
  }

  return '';
}

export function postOptCSRF({body, refreshToken = false}) {
  return {
    method: 'POST',
    headers: {
      ...JSON_CONTENT_TYPE,
      'X-CSRF-TOKEN': getCSRFToken(refreshToken)
    },
    body: JSON.stringify(body),
    ...INCLUDE_CREDENTIALS
  }
}

export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchRetry({url, options, limit, delay}) {
  try {
    return await apiFetch(url, options);
  }
  catch(e) {
    if (limit <= 1) {
      throw e;
    }

    await sleep(delay);
    return await fetchRetry(url, options, limit - 1, delay);
  }
}

export async function apiFetch(url, options) {
  let data = await (await fetch(url, options)).json();

  if (data.jwt && data.jwt.status === 401) {
    const retry = await (await fetch(protectedRoute('/refresh'), postOptCSRF({body: '', refreshToken: true}))).json();

    if (retry.jwt && retry.jwt.status === 401) {
      history.push('/login');
      return null;
    }

    data = await (await fetch(url, options)).json();
  }

  return await data;
}
