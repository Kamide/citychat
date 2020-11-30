import { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { apiFetch, request, protectedRoute } from '../api';
import Dashboard from './dashboard';
import Relationships from './user/relationships';
import Nav from './nav';
import SearchResults from './search/results';
import UserProfile from './user/profile';

export default function ProtectedApp() {
  const [user, setUser] = useState({});

  useEffect(() => {
    apiFetch(protectedRoute('/user/self'), request({method: 'GET', credentials: true}))
      .then(data => {
        if (data) {
          setUser(data.user);
        }
      });
  }, []);

  return (
    <div className="padding--l">
      <Nav user={user} />
      <main>
        <Switch>
          <Route exact path="/app/dashboard" component={Dashboard} />
          <Route exact path="/app/friends" component={Relationships} />
          <Route path="/app/search" component={SearchResults} />
          <Route path="/app/user/:id" component={UserProfile} />
          <Route component={Dashboard} />
        </Switch>
      </main>
    </div>
  );
}
