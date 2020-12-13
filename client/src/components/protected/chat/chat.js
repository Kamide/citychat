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
      <blockquote className="Parent">
        <a href={'#message-' + m.parent_id}>
          {renderMessage(findMessage(m.parent_id), false, true)}
        </a>
      </blockquote>
    );
  };

  const renderMessage = (m, isLeaf, hideLink) => {
    if (!(m && Object.keys(m).length)) {
      return null;
    }

    return (
      <section key={m.id} id={'message-' + m.id} className="Message">
        <header className="Header">
          <div className="Author">
            <User user={participants[String(m.author_id)]} hideLink={hideLink} />
            <time className="Timestamp">{m.timestamp}</time>
          </div>

          {isLeaf && renderParentMessage(m)}
        </header>

        <p className={'Content' + (isLeaf ? '' : ' Preview')}>{m.content}</p>
      </section>
    );
  }

  const renderMessages = () => {
    return (
      <article className="Messages">
        {messages.map(m => renderMessage(m, true, false))}
      </article>
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
    <main className="secondary Grid">
      <header className="Masthead">
        <h1 className="Heading">{chat.name}</h1>
      </header>

      <div className="tertiary Grid Chat">
        {renderMessages()}

        <form className="Box" onSubmit={sendMessage}>
          <input type="text" id="messageText" />
          <input type="submit" value="Send" />
        </form>
      </div>
    </main>
  );
}
