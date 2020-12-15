import { useEffect, useState } from 'react';

import { Fetcher, request, protectedRoute } from '../../api';
import User from './user';

export default function Contacts() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState({});
  const [tab, setTab] = useState('Friends');

  useEffect(() => {
    const fetcher = new Fetcher();

    fetcher.retry(protectedRoute('/self/friends'),
    request({
      method: 'GET', credentials: true
    }))
      .then(data => {
        if (Fetcher.isNonEmpty(data)) {
          setFriends(data.friends);
        }
      });

    fetcher.retry(protectedRoute('/self/friends/requests'),
      request({
        method: 'GET', credentials: true
      }))
        .then(data => {
          if (Fetcher.isNonEmpty(data)) {
            setRequests(data.requests);
          }
        });

    return () => {
      fetcher.abort();
    };
  }, []);

  const renderUser = (x) => (
    <User key={x.id} user={x} showCommands={true} className="Item" />
  );

  const renderTab = () => {
    if (tab === 'Friends') {
      return (
        <div>
          <h2 className="Subheading">All</h2>
          {friends.length
            ? friends.map(x => renderUser(x))
            : <p className="Content">You haven't added any friends on CityChat yet.</p>}
        </div>
      );
    }
    else {
      return (
        <div>
          <h2 className="Subheading">Incoming</h2>
          {Object.keys(requests).length && requests.incoming.length
            ? requests.incoming.map(x => renderUser(x))
            : <p className="Content">No incoming friend requests.</p>}
          <h2 className="Subheading">Outgoing</h2>
          {Object.keys(requests).length && requests.outgoing.length
            ? requests.outgoing.map(x => renderUser(x))
            : <p className="Content">No outgoing friend requests.</p>}
        </div>
      );
    }
  };

  return (
    <main className="single secondary Grid">
      <header className="contraflow Masthead">
        <h1 className="Heading">Contacts</h1>
        <nav>
          {['Friends', 'Requests'].map(x =>
            <button
              key={x}
              className={'secondary Text Button Field ' + (tab === x && 'active')}
              onClick={() => setTab(x)}>
              {x}
            </button>
          )}
        </nav>
      </header>
      <div className="Menu">
        {renderTab()}
      </div>
    </main>
  );
}
