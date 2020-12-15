import { useContext, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Fetcher, UserRelation, protectedRoute, request, socket } from '../api';

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
    const fetcher = new Fetcher();
    let id;

    fetcher.retry(protectedRoute('/self'), request({method: 'GET', credentials: true}))
      .then(data => {
        if (Fetcher.isNonEmpty(data)) {
          dispatch({
            type: 'SET_USER',
            payload: data.user
          });
          id = data.user.id;
        }
      });

    fetcher.retry(protectedRoute('/self/friends'),
    request({
      method: 'GET', credentials: true
    }))
      .then(data => {
        if (Fetcher.isNonEmpty(data)) {
          dispatch({
            type: 'SET_FRIENDS',
            payload: data.friends
          });
        }
      });

    fetcher.retry(protectedRoute('/self/friends/requests'),
      request({
        method: 'GET', credentials: true
      }))
        .then(data => {
          if (Fetcher.isNonEmpty(data)) {
            dispatch({
              type: 'SET_REQUESTS',
              payload: data.requests
            });
          }
        });

    socket.open().then(io => {
      io.on('contact_update', data => {
        if (data.relation_before === UserRelation.FRIEND) {
          dispatch({
            type: 'REMOVE_FRIEND',
            payload: data.user
          });
        }
        else if (data.relation_before === UserRelation.FRIEND_REQUEST_FROM_A_TO_B
              || data.relation_before === UserRelation.FRIEND_REQUEST_FROM_B_TO_A) {
          if (UserRelation.userIsRequester([data.user.id, id], id, data.relation_before)) {
            dispatch({
              type: 'REMOVE_OUTGOING_REQUEST',
              payload: data.user
            });
          }
          else {
            dispatch({
              type: 'REMOVE_INCOMING_REQUEST',
              payload: data.user
            });
          }
        }

        if (data.relation_after === UserRelation.FRIEND) {
          dispatch({
            type: 'ADD_FRIEND',
            payload: data.user
          });
        }
        else if (data.relation_after === UserRelation.FRIEND_REQUEST_FROM_A_TO_B
              || data.relation_after === UserRelation.FRIEND_REQUEST_FROM_B_TO_A) {
          if (UserRelation.userIsRequester([data.user.id, id], id, data.relation_after)) {
            dispatch({
              type: 'ADD_OUTGOING_REQUEST',
              payload: data.user
            });
          }
          else {
            dispatch({
              type: 'ADD_INCOMING_REQUEST',
              payload: data.user
            });
          }
        }
      });
    });

    return () => {
      socket.open().then(io => {
        io.off('contact_update');
      });
      socket.disconnect();
      fetcher.abort();
    };
  }, [dispatch]);

  return (
    <div className="primary Grid">
      <Nav />
      <Switch>
        <Route exact path="/app/contacts" component={Contacts} />
        <Route path="/app/chats" component={Chats} />
        <Route path="/app/search" component={SearchResults} />
        <Route path="/app/user/:id" component={UserProfile} />
        <Route component={Chats} />
      </Switch>
    </div>
  );
}
