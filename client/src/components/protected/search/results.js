import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';

import { queryArrayToJSON, splitQuery, toQueryString } from '../../../utils/query';
import { fetchRetry, request, protectedRoute } from '../../api';
import Search from './search';
import User from '../user/user';

import blinkingEllipsis from '../../../images/blinking-ellipsis.svg';

export default function SearchResults(props) {
  const [query, setQuery] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const queryArray = splitQuery(props.location.search);
    const queryJSON = queryArrayToJSON(queryArray);
    setQuery(queryJSON);

    if (queryJSON.q) {
      setProcessing(true);
      fetchRetry(protectedRoute('/search', toQueryString(queryArray)), request({method: 'GET', credentials: true, signal: abortController.signal}))
        .then(data => {
          if (data && Object.keys(data).length) {
            setResults(data.results);
          }
          setProcessing(false);
        });
    }

    return () => {
      abortController.abort();
    };
  }, [props.location.search]);

  const loading = (
    <div aria-label="Loading results" className="Content">
      <ReactSVG aria-hidden="true" src={blinkingEllipsis} />
    </div>
  );

  const renderResults = () => {
    if (results && results.length) {
      return (
        <div className="Content">
          {results.map((r, index) => {
            return (
              <div key={index}>
                <User key={index} user={r} showCommands={true} />
              </div>
            );
          })}
        </div>
      );
    }
    else {
      return <p className="Content">No results found.</p>;
    }
  };

  return (
    <main className="single secondary Grid">
      <header className="contraflow Masthead">
        <h1 className="Heading">Search</h1>
        <nav><Search q={query.q} /></nav>
      </header>
      {query.q
        ? (processing ? loading : renderResults())
        : <p className="Content">Please enter a search term.</p>}
    </main>
  );
}
