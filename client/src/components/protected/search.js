import history from '../history';

export default function Search(props) {
  const search = (event) => {
    event.preventDefault();
    const searchQ = event.target.searchQ.value.trim();

    if (searchQ) {
      history.push(`/app/search?q=${searchQ}&context=${props.location.pathname}`);
    }
  }

  return (
    <div>
      <form className="display--flex field-group" onSubmit={search}>
        <input aria-label="Search term" id="searchQ" type="search" placeholder="Search" />
        <button aria-label="Search" className="button inline" type="submit">🔍</button>
      </form>
    </div>
  );
}
