import { Route, Switch } from 'react-router-dom';

import Dashboard from './dashboard';
import Friends from './friends';
import Nav from './nav';
import SearchResults from './searchresults';
import UserProfile from './userprofile';

export default function ProtectedApp() {
  return (
    <div className="padding--l">
      <Nav />
      <main>
        <Switch>
          <Route exact path="/app/dashboard" component={Dashboard} />
          <Route exact path="/app/friends" component={Friends} />
          <Route path="/app/search" component={SearchResults} />
          <Route path="/app/user/:id" component={UserProfile} />
          <Route component={Dashboard} />
        </Switch>
      </main>
    </div>
  );
}
