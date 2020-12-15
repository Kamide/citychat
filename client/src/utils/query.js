export function queryArrayToJSON(queryArray) {
  return queryArray.reduce((json, pair) => {
    json[pair[0]] = pair[1]
    return json;
  }, {});
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
