export function queryArrayHasParam(query, param) {
  return query.some(pair => pair.includes(param) && pair[1]);
}

export function splitQuery(query) {
  return query.substring(1)
    .toLowerCase()
    .split('&')
    .map(pair => pair.split('='));
}

export function toQueryString(queryArray) {
  return '?' + queryArray.map(pair => pair.join('=')).join('&');
}
