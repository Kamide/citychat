import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { request,publicRoute } from '../../api';
import history from '../../history';

export default function Activate(props) {
  useEffect(() => {
    fetch(publicRoute('/signup/activate/', props.match.params.token), request({method: 'PATCH'}))
      .then(response => response.json())
      .then(data => history.push(data.redirect));
  }, [props.match.params.token]);

  return (
    <div>
      <h1>Account Activated</h1>
      <p>
        Thank you for confirming your email address.
      </p>
      <p>
        You may now log in to your new CityChat account with your email address.
      </p>
      <p>
        <Link to='/login'>Log In</Link>
      </p>
    </div>
  );
}
