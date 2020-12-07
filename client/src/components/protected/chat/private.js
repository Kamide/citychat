import { useEffect, useState } from 'react';
import { Link, Route } from 'react-router-dom';

import { fetchRetry, protectedRoute, request } from '../../api';
import Chat from './chat';

export default function PrivateChat() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchRetry(protectedRoute('/chat'),
      request({
        method: 'GET',
        credentials: true
      }))
        .then(data => {
          if (Object.keys(data).length) {
            setConversations(data.conversations);
          }
        });
  }, []);

  const renderSidebar = () => {
    if (!conversations.length) {
      return (
        <nav>
          <p>Your conversations with others will appear here.</p>
        </nav>
      );
    }

    return (
      <nav>
        <ul>
          {conversations.map(c => {
            const latestMessageSender = c.participants[c.latest_message.author_id].nickname || c.participants[c.latest_message.author_id].name

            return (
              <li key={c.chat.id}>
                <Link to={'/app/chat/' + c.chat.id}>{c.chat.name}</Link>
                <ul>
                  <li>{latestMessageSender}: {c.latest_message.content}</li>
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  };

  return (
    <div>
      <h1>Messages</h1>
      {renderSidebar()}
      <Route exact path="/app/chat/:id" render={props => <Chat {...props} />} />
    </div>
  );
}
