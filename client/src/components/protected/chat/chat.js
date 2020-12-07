import { useEffect, useState } from 'react';

import { fetchRetry, protectedRoute, request } from '../../api';
import User from '../user/user';
import history from '../../history';

export default function Chat(props) {
  const [chatID, setChatID] = useState('');
  const [chat, setChat] = useState({});
  const [participants, setParticipants] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setChatID(String(props.chatID));
  }, [props.chatID]);

  useEffect(() => {
    if (chatID) {
      fetchRetry(protectedRoute('/chat/' + chatID),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (data && Object.keys(data).length) {
              setChat(data.chat);
              setParticipants(data.participants);
            }
            else {
              history.push('/app/chat')
            }
          });

      fetchRetry(protectedRoute('/chat/' + chatID + '/messages'),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (data && Object.keys(data).length) {
              setMessages(data.messages);
            }
          });
    }
  }, [chatID]);

  const renderMessages = () => {
    return (
      <div>
        {messages.map(m => {
          return (
            <div key={m.id}>
              <div>
                <User user={participants[String(m.author_id)]} />
                <p>{m.timestamp}</p>
              </div>
              <p>{m.content}</p>
            </div>
          )})}
      </div>
    )
  };

  return (
    <main>
      <h1>{chat.name}</h1>
      {renderMessages()}
      <div>
        <input type="text" />
        <input type="submit" value="Send" />
      </div>
    </main>
  );
}
