import { useContext, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { fetchRetry, protectedRoute, request, socket } from '../api';

import { StoreContext } from '../store';
import Chats from './chat/chats';
import Nav from './nav';
import Contacts from './user/contacts';
import SearchResults from './search/results';
import UserProfile from './user/profile';

export default function ProtectedApp() {
  // eslint-disable-next-line no-unused-vars
  const [state, dispatch] = useContext(StoreContext);

  useEffect(() => {
    socket.open();

    fetchRetry(protectedRoute('/self'), request({method: 'GET', credentials: true}))
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
    <div className="primary Grid">
      <Nav />
      <Switch>
        <Route exact path="/app/contacts" component={Contacts} />
        <Route path="/app/chat" component={Chats} />
        <Route path="/app/search" component={SearchResults} />
        <Route path="/app/user/:id" component={UserProfile} />
        <Route component={Chats} />
      </Switch>
    </div>
  );
}
