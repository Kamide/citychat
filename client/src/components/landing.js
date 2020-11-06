import { Fragment } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import Login from './login';
import Logo from './logo';
import Signup from './signup';
import USP from './usp';

export default function Landing() {
  return (
    <Fragment>
      <div className="bg-1 p-6">
        <div className="m-auto mw-1024">
          <nav className="ai-center d-flex jc-between n-m-3 r-m-3">
            <Link to="/"><Logo /></Link>

            <ul className="d-flex r-btn r-mr-1 zero-ls zero-m zero-p">
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

      <main className="m-auto mw-1024 p-6">
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
        </Switch>
      </main>
    </Fragment>
  );
}
