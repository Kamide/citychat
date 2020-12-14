import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';

import { queryArrayHasParam, splitQuery, toQueryString } from '../../../utils/query';
import { fetchRetry, request, protectedRoute } from '../../api';
import Search from './search';
import User from '../user/user';

import blinkingEllipsis from '../../../images/blinking-ellipsis.svg';

export default function SearchResults(props) {
  const [query, setQuery] = useState(false);
  const [queryValid, setQueryValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const q = splitQuery(props.location.search);
    const valid = queryArrayHasParam(q, 'q');
    setQueryValid(valid);

    if (valid) {
      setQuery(q[0][1]);
      setProcessing(true);
      fetchRetry(protectedRoute('/search', toQueryString(q)), request({method: 'GET', credentials: true, signal: abortController.signal}))
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
        <nav><Search query={query} /></nav>
      </header>
      {queryValid
        ? (processing ? loading : renderResults())
        : <p className="Content">Please enter a search term.</p>}
    </main>
  );
}
