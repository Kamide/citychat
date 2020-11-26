import { Fragment, useEffect } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { request,protectedRoute } from '../api';
import Activate from './auth/activate';
import AuthForm from './auth/form';
import Landing from './landing';
import Logo from '../logo';
import Pending from './auth/pending';
import history from '../history';

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

  return (
    <Fragment>
      <div className="bg-1 padding--l stroke-bottom">
        <div className="margin-x--auto max-width--1024">
          <nav className="align-items--center display--flex justify-content--space-between margin--m--negative margin--m-r">
            <Link to="/"><Logo /></Link>

            <ul className="button--child-universal display--flex margin-right--s--child-universal zero--list-style zero--margin zero--padding">
              <li>
                <Link to="/login">Log In</Link>
              </li>
              <li className="inverse">
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <main className="margin-x--auto max-width--1024 padding--l">
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route key="login" exact path="/login">
            <AuthForm heading="Log In" endpoint="/login" request={request({method: 'POST', credentials: 'include'})} />
          </Route>
          <Route key="signup" exact path="/signup">
            <AuthForm heading="Sign Up" endpoint="/signup" />
          </Route>
          <Route exact path="/signup/pending" component={Pending} />
          <Route path="/signup/activate/:token" component={Activate} />
          <Route key="resend" exact path="/signup/resend">
            <AuthForm heading="Resend Confirmation Email" endpoint="/signup/resend" />
          </Route>
          <Route component={Landing} />
        </Switch>
      </main>
    </Fragment>
  );
}
