import { Route, Router, Switch } from 'react-router-dom';

import history from './history';
import ProtectedApp from './protected/app';
import PublicApp from './public/app';

import '../styles/chat.css';
import '../styles/grid.css';
import '../styles/header.css';
import '../styles/menu.css';
import '../styles/preview.css'
import '../styles/user.css';

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
