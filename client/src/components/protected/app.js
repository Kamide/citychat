import { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { apiFetch, protectedRoute, request, socket } from '../api';
import ChatApp from './chat/app';
import Dashboard from './dashboard';
import Nav from './nav';
import Relationships from './user/relationships';
import SearchResults from './search/results';
import UserProfile from './user/profile';

export default function ProtectedApp() {
  const [user, setUser] = useState({});

  useEffect(() => {
    socket.open();

    apiFetch(protectedRoute('/user/self'), request({method: 'GET', credentials: true}))
      .then(data => {
        if (Object.keys(data).length) {
          setUser(data.user);
        }
      });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="padding--l">
      <Nav user={user} />
      <main>
        <Switch>
          <Route exact path="/app/dashboard" component={Dashboard} />
          <Route exact path="/app/friends" component={Relationships} />
          <Route path="/app/chat" component={ChatApp} />
          <Route path="/app/search" component={SearchResults} />
          <Route path="/app/user/:id" component={UserProfile} />
          <Route component={Dashboard} />
        </Switch>
      </main>
    </div>
  );
}
