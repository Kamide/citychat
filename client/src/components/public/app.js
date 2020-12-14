import { useEffect } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { request,protectedRoute } from '../api';
import Activate from './auth/activate';
import AuthForm from './auth/form';
import Logo from '../logo';
import Navigator from '../navigator';
import Pending from './auth/pending';
import history from '../history';

import '../../styles/public.css'

export default function PublicApp() {
  useEffect(() => {
    fetch(protectedRoute('/login/check'), request({method: 'GET', credentials: 'include'}))
      .then(response => response.json())
      .then(data => {
        if (data.active) {
          history.push('/app');
        }
      });
  }, []);

  const Login = () => (
    <AuthForm
      heading="Log In"
      endpoint="/login"
      request={request({
        method: 'POST',
        credentials: 'include' })} />
  );

  return (
    <div id="public" className="primary Grid">
      <div className="secondary Grid">
        <header className="primary Masthead">
          <Link to="/"><Logo /></Link>
        </header>

        <nav className="primary Menu">
          <ul className="Menu Section">
            <Route component={(props) =>
              <Navigator
                className="Item"
                destinations={[
                  ['/login', 'Log In'],
                  ['/signup', 'Sign Up'] ]}
                {...props} />} />
          </ul>
        </nav>
      </div>

      <Switch>
        <Route key="login" exact path="/login">
          {Login}
        </Route>
        <Route key="signup" exact path="/signup">
          <AuthForm heading="Sign Up" endpoint="/signup" />
        </Route>
        <Route exact path="/signup/pending" component={Pending} />
        <Route path="/signup/activate/:token" component={Activate} />
        <Route key="resend" exact path="/signup/resend">
          <AuthForm heading="Resend Confirmation Email" endpoint="/signup/resend" />
        </Route>
        <Route component={Login} />
      </Switch>
    </div>
  );
}
