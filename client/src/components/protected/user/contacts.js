import { useContext, useState } from 'react';

import { StoreContext } from '../../store';
import User from './user';

export default function Contacts() {
  const [state] = useContext(StoreContext);
  const [tab, setTab] = useState('Friends');

  const renderUser = (x) => (
    <User key={x.id} user={x} showCommands={true} className="Item" />
  );

  const renderTab = () => {
    if (tab === 'Friends') {
      return (
        <div>
          <h2 className="Subheading">All</h2>
          {state.relationships.friends.length
            ? state.relationships.friends.map(x => renderUser(x))
            : <p className="Content">You haven't added any friends on CityChat yet.</p>}
        </div>
      );
    }
    else {
      return (
        <div>
          <h2 className="Subheading">Incoming</h2>
          {Object.keys(state.relationships.requests).length && state.relationships.requests.incoming.length
            ? state.relationships.requests.incoming.map(x => renderUser(x))
            : <p className="Content">No incoming friend requests.</p>}
          <h2 className="Subheading">Outgoing</h2>
          {Object.keys(state.relationships.requests).length && state.relationships.requests.outgoing.length
            ? state.relationships.requests.outgoing.map(x => renderUser(x))
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
