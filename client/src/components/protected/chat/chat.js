import { useEffect, useState } from 'react';

import { apiFetch, fetchRetry, protectedRoute, request, socket } from '../../api';
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
      fetchRetry(protectedRoute('/chat/', chatID),
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

      socket.open().then(io => {
        io.emit('join_chat', { chat_id: chatID });
        io.on('message', message => setMessages(prevMessages => prevMessages.concat([message])));
      });
    }

    return () => {
      socket.open().then(io => {
        io.off('message');
      });
    };
  }, [chatID]);

  const findMessage = (id) => {
    return messages.find(m => m.id === id);
  };

  const renderParentMessage = (m) => {
    if (!m.parent_id) {
      return null;
    }

    return (
      <blockquote>
        <a href={'#message-' + m.parent_id}>
          {renderMessage(findMessage(m.parent_id), false, true)}
        </a>
      </blockquote>
    );
  };

  const renderMessage = (m, showParent, hideLink) => {
    if (!(m && Object.keys(m).length)) {
      return null;
    }

    return (
      <div key={m.id} id={'message-' + m.id}>
        <div>
          <User user={participants[String(m.author_id)]} hideLink={hideLink} />
          <p>{m.timestamp}</p>
          {showParent && renderParentMessage(m)}
        </div>
        <p>{m.content}</p>
      </div>
    );
  }

  const renderMessages = () => {
    return (
      <div>
        {messages.map(m => renderMessage(m, true, false))}
      </div>
    )
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const values = {
      text: event.target.messageText.value.trim()
    }

    if (values.text) {
      apiFetch(protectedRoute('/chat/', chatID, '/message/send'),
        request({
          method: 'POST',
          credentials: true,
          csrfToken: 'access',
          body: values
        }))
          .then(data => {
            if (data && data.sent) {
              event.target.messageText.value = '';
            }
          });
    }
  };

  return (
    <main>
      <h1>{chat.name}</h1>
      {renderMessages()}
      <form onSubmit={sendMessage}>
        <input type="text" id="messageText" />
        <input type="submit" value="Send" />
      </form>
    </main>
  );
}
