import { useEffect, useState } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { fetchRetry, protectedRoute, request, socket } from '../../api';
import Chat from './chat';
import UnresolvedChat from './unresolved';

export default function PrivateChat() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchRetry(protectedRoute('/chat'),
      request({
        method: 'GET',
        credentials: true
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            setConversations(data.conversations);
          }
        });

    socket.open().then(io => {
      io.emit('join_chat_list');

      io.on('chat_list_update', data => {
        setConversations(prevConversations => {
          const index = prevConversations.findIndex(c => c.chat.id === data.chat.id);

          if (index < 0) {
            return [
              data,
              ...prevConversations
            ];
          }
          else if (data.latest_message.timestamp > prevConversations[index].latest_message.timestamp) {
            return [
              data,
              ...prevConversations.slice(0, index),
              ...prevConversations.slice(index + 1)
            ];
          }
          else {
            return [
              ...prevConversations.slice(0, index),
              data,
              ...prevConversations.slice(index + 1)
            ];
          }
        });
      });
    });

    return () => {
      socket.open().then(io => {
        io.off('chat_list_update');
        io.emit('leave_chat_list');
      });
    };
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
      <Switch>
        <Route exact path="/app/chat/:id" render={props =>
          <Chat {...props} chatID={props.match.params.id} />} />
        <Route exact path="/app/chat/user/:id" render={props =>
          <UnresolvedChat {...props} userID={props.match.params.id} />} />
      </Switch>
    </div>
  );
}
