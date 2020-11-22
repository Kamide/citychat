import { Route, Router, Switch } from 'react-router-dom';
import history from './history';
import PublicApp from './public/app';
import ProtectedApp from './protected/app';

export default function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={PublicApp} />
        <Route exact path="/app" component={ProtectedApp} />
        <Route component={PublicApp} />
      </Switch>
    </Router>
  );
}
