import { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { route } from '../../api';

export default function Activate(props) {
  const [redirect, setRedirect] = useState('');

  useEffect(() => {
    fetch(route('/signup/activate/' + props.match.params.token))
      .then(response => response.json())
      .then(data => setRedirect(data.redirect));
  }, [props.match.params.token]);

  if (redirect) {
    return <Redirect to={redirect} />
  }

  return (
    <div className="margin-x--auto max-width--400 text-align--center">
      <h1>Account Activated</h1>
      <p>
        Thank you for confirming your email address.
      </p>
      <p>
        You may now log in to your new CityChat account with your email address.
      </p>
      <p>
        <Link to='/login' className="btn">Log In</Link>
      </p>
    </div>
  );
}
