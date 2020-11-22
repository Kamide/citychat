import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PATCH_OPT, publicRoute } from '../../api';
import history from '../../history';

export default function Activate(props) {
  useEffect(() => {
    fetch(publicRoute('/signup/activate/' + props.match.params.token), PATCH_OPT)
      .then(response => response.json())
      .then(data => history.push(data.redirect));
  }, [props.match.params.token]);

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
