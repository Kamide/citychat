import { Route, Switch } from 'react-router-dom';

import Dashboard from './dashboard';
import Nav from './nav';
import UserProfile from './userprofile';

export default function ProtectedApp() {
  return (
    <div className="padding--l">
      <Nav />
      <main>
        <Switch>
          <Route path="/app/user/:id" component={UserProfile} />
          <Route path="/app/dashboard" component={Dashboard} />
        </Switch>
      </main>
    </div>
  );
}
