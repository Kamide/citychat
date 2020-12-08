import io from 'socket.io-client';

import getCookie from '../utils/cookie';
import history from './history';

const API_URL = (process.env['REACT_APP_API_URL'])
  ? process.env['REACT_APP_API_URL'].replace(/\/+$/, "")
  : 'http://localhost:5000';

export const socket = io(API_URL, {
  autoConnect: false,
  reconnection: true,
  transports: ['websocket', 'polling'],
  withCredentials: true
});

export function route(...path) {
  return API_URL + path.join('');
}

export function publicRoute(...path) {
  return route('/public', ...path);
}

export function protectedRoute(...path) {
  return route('/protected', ...path);
}

export function privateRoute(...path) {
  return route('/private', path);
}

export function request({method, credentials, csrfToken, body, signal}) {
  let xCsrfToken;

  if (csrfToken) {
    csrfToken = csrfToken.toLowerCase();
  }

  switch (csrfToken) {
    case 'access':
      xCsrfToken = { 'X-CSRF-TOKEN': getCookie('csrf_access_token') };
      break;
    case 'refresh':
      xCsrfToken = { 'X-CSRF-TOKEN': getCookie('csrf_refresh_token') };
      break;
    default:
      xCsrfToken = {};
  }

  return {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      ...xCsrfToken
    },
    ...(credentials ? { credentials: 'include' } : {}),
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...(signal ? { signal: signal } : {})
  }
}

export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiFetch(url, options) {
  let response = await fetch(url, options);
  let data = await response.json();

  if (response.status === 401) {
    if (data.expired_token && data.expired_token.toLowerCase() === 'access') {
      response = await fetch(privateRoute('/refresh-token'), request({method: 'POST', credentials: true, csrfToken: 'refresh'}));
    }

    if (response.status === 401) {
      history.push('/login');
      return null;
    }

    data = await (await fetch(url, options)).json();
  }

  return await data;
}

export async function fetchRetry(url, options, limit = 6, delay = 100, backoff = 2.5) {
  try {
    return await apiFetch(url, options);
  }
  catch (e) {
    if (e.name === 'AbortError') {
      return null;
    }

    if (limit <= 1) {
      throw e;
    }

    await sleep(delay);
    return await fetchRetry(url, options, limit - 1, delay * backoff, backoff);
  }
}

export const UserRelation = {
  STRANGER: 'S',
  FRIEND_REQUEST_FROM_A_TO_B: 'FX',
  FRIEND_REQUEST_FROM_B_TO_A: 'XF',
  FRIEND: 'F'
};
