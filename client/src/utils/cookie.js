export default function getCookie(key) {
  const value = document.cookie.split('; ')
    .find(pair => pair.startsWith(key));

  if (value) {
    return value.split('=')[1];
  }

  return '';
}
