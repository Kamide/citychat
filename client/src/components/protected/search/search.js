import { useRef, useEffect } from 'react';

import history from '../../history';

export default function Search(props) {
  const searchBox = useRef(null);

  useEffect(() => {
    if (searchBox.current) {
      searchBox.current.focus();
    }
  }, []);

  useEffect(() => {
    if (props.q && searchBox.current) {
      searchBox.current.value = props.q;
    }
  }, [props.q])

  const search = (event) => {
    if (!searchBox.current) {
      return;
    }

    event.preventDefault();
    const q = searchBox.current.value.trim();

    if (q) {
      if (props.setVisible) {
        props.setVisible(false);
      }

      if (props.location) {
        history.push(`/app/search?q=${q}&context=${props.location.pathname}`);
      }
      else {
        history.push(`/app/search?q=${q}`);
      }
    }
  }

  return (
    <form className="Combined Field" onSubmit={search}>
      <input aria-labelledby="searchSubmit" ref={searchBox} className="Input Field" type="search" placeholder="🔍 Search" />
      <input id="searchSubmit" className="primary Text Button Field" type="submit" value="Search" />
    </form>
  );
}
