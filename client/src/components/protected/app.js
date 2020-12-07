import { useContext, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { apiFetch, protectedRoute, request, socket } from '../api';
import { StoreContext } from '../store';
import ChatApp from './chat/app';
import Dashboard from './dashboard';
import Nav from './nav';
import Relationships from './user/relationships';
import SearchResults from './search/results';
import UserProfile from './user/profile';

export default function ProtectedApp() {
  const [state, dispatch] = useContext(StoreContext);

  useEffect(() => {
    socket.open();

    apiFetch(protectedRoute('/user/self'), request({method: 'GET', credentials: true}))
      .then(data => {
        if (data && Object.keys(data).length) {
          dispatch({
            type: 'SET_USER',
            payload: data.user
          });
        }
      });

    return () => socket.disconnect();
  }, [dispatch]);

  return (
    <div className="padding--l">
      <Nav user={state.user} />
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
