import { useEffect, useRef, useState } from 'react';
import { ReactSVG } from 'react-svg';

import { apiFetch, fetchRetry, protectedRoute, request, socket } from '../../api';
import User from '../user/user';
import history from '../../history';

import sendIcon from '../../../images/send-icon.svg'

export default function Chat(props) {
  const chatBox = useRef(null);
  const [initialChatBoxHeight, setInitialChatBoxHeight] = useState(1);
  const lastMessagePointer = useRef(null);

  const [chatID, setChatID] = useState('');
  const [chat, setChat] = useState({});
  const [participants, setParticipants] = useState({});
  const [messages, setMessages] = useState([]);

  const KEY = {
    ENTER: 13
  };

  const resizeChatBox = () => {
    chatBox.current.style.height = initialChatBoxHeight + 'px';
    chatBox.current.rows = Math.floor(chatBox.current.scrollHeight / initialChatBoxHeight);
    chatBox.current.style.height = 'auto';
  };

  const scrollToLastMessage = () => lastMessagePointer.current.scrollIntoView();

  useEffect(() => {
    setChatID(String(props.chatID));
  }, [props.chatID]);

  useEffect(() => {
    chatBox.current.rows = 1;
    chatBox.current.style.height = 'auto';
    setInitialChatBoxHeight(Math.max(1, parseInt(getComputedStyle(chatBox.current).height)));
    chatBox.current.focus();

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
              scrollToLastMessage();
            }
          });

      socket.open().then(io => {
        io.emit('join_chat', { chat_id: chatID });
        io.on('message', message => {
          setMessages(prevMessages => prevMessages.concat([message]));
          scrollToLastMessage();
        });
      });
    }

    return () => {
      socket.open().then(io => {
        io.off('message');
      });
    };
  }, [chatID, setInitialChatBoxHeight]);

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
      <article className="MessageContainer">
        {messages.map(m => renderMessage(m, true, false))}
        <span aria-hidden="true" ref={lastMessagePointer} />
      </article>
    )
  };

  const sendMessage = () => {
    const values = {
      text: chatBox.current.value
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
              chatBox.current.value = '';
              chatBox.current.rows = 1;
            }
          });
    }

    chatBox.current.focus();
  };

  const handleShortcuts = (event) => {
    switch (event.keyCode) {
      case KEY.ENTER:
        if (!event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
        break;

      default:
        return;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  }

  return (
    <main className="secondary Grid">
      <header className="Masthead">
        <h1 className="Heading">{chat.name}</h1>
      </header>

      <div className="tertiary Grid Chat">
        {renderMessages()}

        <form className="ChatBoxContainer" onSubmit={handleSubmit}>
          <div className="Combined Field">
            <textarea
              ref={chatBox}
              id="messageText"
              className="ChatBox Input Field"
              type="text"
              placeholder={'Message ' + (chat.name || 'CityChat User')}
              onInput={resizeChatBox}
              onKeyDown={handleShortcuts}>
            </textarea>
            <button aria-label="Send message" className="primary Icon Button Field" type="submit">
              <ReactSVG aria-hidden="true" src={sendIcon} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
