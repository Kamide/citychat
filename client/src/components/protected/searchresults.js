import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';

import { GET_OPT_JWT, apiFetch, protectedRoute } from '../api';
import { queryArrayHasParam, splitQuery, toQueryString } from '../../utils/query';
import User from './user';

import blinkingEllipsis from '../../images/blinking-ellipsis.svg';

export default function SearchResults(props) {
  const [queryValid, setQueryValid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const q = splitQuery(props.location.search);
    const valid = queryArrayHasParam(q, 'q');
    setQueryValid(valid);

    if (valid) {
      setProcessing(true);
      apiFetch(protectedRoute('/search' + toQueryString(q)), GET_OPT_JWT)
        .then(data => {
          if (data) {
            setResults(data.results);
          }
          setProcessing(false);
        });
    }
  }, [props.location.search]);

  const loading = (
    <div aria-label="Loading results">
      <ReactSVG aria-hidden="true" src={blinkingEllipsis} />
    </div>
  );

  const renderResults = () => {
    return results.map((r) => {
      return (
        <User user={r} showID={true} />
      );
    })
  };

  return (
    <div>
      <h1>Search Results</h1>
      {processing ? loading : renderResults()}
      {queryValid || <p>Please enter a search term.</p>}
    </div>
  )
}
