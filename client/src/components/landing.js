import { Fragment } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import Await from './auth/await';
import Login from './auth/login';
import Logo from './logo';
import Signup from './auth/signup';
import USP from './usp';

export default function Landing() {
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
          <Route exact path="/">
            <USP />
          </Route>
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/signup">
            <Signup />
          </Route>
          <Route exact path="/signup/await">
            <Await />
          </Route>
        </Switch>
      </main>
    </Fragment>
  );
}
