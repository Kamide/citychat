import { useEffect, useState } from 'react';

import { fetchRetry, request, protectedRoute } from '../../api';
import User from './user';

export default function Relationships() {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('Friends');

  const fetchRelationships = () => {
    const abortController = new AbortController();

    fetchRetry(protectedRoute('/user/self/relationships'),
      request({
        method: 'GET', credentials: true, signal: abortController.signal
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            setFriends(data.friends);
            setPending(data.pending);
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
          {pending.incoming.length
            ? pending.incoming.map(x => <User key={x.id} user={x} showSendMessageButton={true} showCommands={true} />)
            : <p>No incoming friend requests.</p>}
          <h2>Outgoing</h2>
          {pending.outgoing.length
            ? pending.outgoing.map(x => <User key={x.id} user={x} showSendMessageButton={true} showCommands={true} />)
            : <p>No outgoing friend requests.</p>}
        </div>
      );
    }
  };

  return (
    <div>
      <h1>{tab}</h1>
      <nav>
        {['Friends', 'Pending Friend Requests'].map(x =>
          <button key={x} type="button" onClick={() => setTab(x)}>{x}</button>
        )}
      </nav>
      {renderTab()}
    </div>
  );
}
