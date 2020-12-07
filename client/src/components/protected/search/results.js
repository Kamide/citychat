import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';

import { queryArrayHasParam, splitQuery, toQueryString } from '../../../utils/query';
import { fetchRetry, request, protectedRoute } from '../../api';
import User from '../user/user';

import blinkingEllipsis from '../../../images/blinking-ellipsis.svg';

export default function SearchResults(props) {
  const [queryValid, setQueryValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    const q = splitQuery(props.location.search);
    const valid = queryArrayHasParam(q, 'q');
    setQueryValid(valid);

    if (valid) {
      setProcessing(true);
      fetchRetry(protectedRoute('/search', toQueryString(q)), request({method: 'GET', credentials: true, signal: abortController.signal}))
        .then(data => {
          if (Object.keys(data).length) {
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
    <div aria-label="Loading results">
      <ReactSVG aria-hidden="true" src={blinkingEllipsis} />
    </div>
  );

  const renderResults = () => {
    if (results && results.length) {
      return results.map((r, index) => {
        return (
          <User key={index} user={r} showCommands={true} />
        );
      })
    }
    else {
      return <p>No results found.</p>;
    }
  };

  return (
    <div>
      <h1>Search Results</h1>
      {queryValid
        ? (processing ? loading : renderResults())
        : <p>Please enter a search term.</p>}
    </div>
  );
}
