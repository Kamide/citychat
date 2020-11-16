const API_URL = (process.env['REACT_APP_API_URL'])
  ? process.env['REACT_APP_API_URL'].replace(/\/+$/, "")
  : 'http://localhost:5000';

export function route(path) {
  return API_URL + path;
}

export const POST_REQUEST = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}
