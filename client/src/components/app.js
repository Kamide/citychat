import { Route, Router, Switch } from 'react-router-dom';

import history from './history';
import ProtectedApp from './protected/app';
import PublicApp from './public/app';

export default function App() {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/app" component={ProtectedApp} />
        <Route path="/" component={PublicApp} />
      </Switch>
    </Router>
  );
}
