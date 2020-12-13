import { useEffect, useState } from 'react';

import { fetchRetry, request, protectedRoute } from '../../api';
import User from './user';

export default function Contacts() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({});
  const [tab, setTab] = useState('Friends');

  const fetchRelationships = () => {
    const abortController = new AbortController();

    fetchRetry(protectedRoute('/self/friends'),
      request({
        method: 'GET', credentials: true, signal: abortController.signal
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            setFriends(data.friends);
          }
        });

    fetchRetry(protectedRoute('/self/friends/requests'),
      request({
        method: 'GET', credentials: true, signal: abortController.signal
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            setRequests(data.requests);
          }
        });

    return () => {
      abortController.abort();
    };
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const renderTab = () => {
    if (tab === 'Friends') {
      return (
        <div>
          {friends.length
            ? friends.map(x => <User key={x.id} user={x} showSendMessageButton={true} showCommands={true} />)
            : <p>You haven't added any friends on CityChat yet.</p>}
        </div>
      );
    }
    else {
      return (
        <div>
          <h2>Incoming</h2>
          {Object.keys(requests).length && requests.incoming.length
            ? requests.incoming.map(x => <User key={x.id} user={x} showSendMessageButton={true} showCommands={true} />)
            : <p>No incoming friend requests.</p>}
          <h2>Outgoing</h2>
          {Object.keys(requests).length && requests.outgoing.length
            ? requests.outgoing.map(x => <User key={x.id} user={x} showSendMessageButton={true} showCommands={true} />)
            : <p>No outgoing friend requests.</p>}
        </div>
      );
    }
  };

  return (
    <div>
      <header>
        <h1>Contacts</h1>
        <nav>
          {['Friends', 'Requests'].map(x =>
            <button key={x} type="button" onClick={() => setTab(x)}>{x}</button>
          )}
        </nav>
      </header>
      <main>
        {renderTab()}
      </main>
    </div>
  );
}
