import { Fragment } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import Activate from './auth/activate';
import AuthForm from './auth/form';
import Landing from './landing';
import Logo from '../logo';
import Pending from './auth/pending';
import { postOptJWT } from '../api';

export default function PublicApp() {
  return (
    <Fragment>
      <div className="stroke-bottom bg-1 padding--l">
        <div className="margin-x--auto max-width--1024">
          <nav className="align-items--center display--flex justify-content--space-between margin--m-n margin--m-r">
            <Link to="/"><Logo /></Link>

            <ul className="display--flex r-btn margin-right--s-r zero--list-style zero--margin zero--padding">
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
            <AuthForm heading="Log In" endpoint="/login" options={postOptJWT}  />
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
