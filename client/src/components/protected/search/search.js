import history from '../../history';

export default function Search(props) {
  const search = (event) => {
    event.preventDefault();
    const searchQ = event.target.searchQ.value.trim();

    if (searchQ) {
      history.push(`/app/search?q=${searchQ}&context=${props.location.pathname}`);
    }
  }

  return (
    <form onSubmit={search}>
      <input aria-labelledby="searchSubmit" id="searchQ" type="search" placeholder="🔍 Search" />
      <input id="searchSubmit" type="submit" value="Search" />
    </form>
  );
}
