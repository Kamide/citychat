import { useEffect, useRef, useState } from 'react';
import { ReactSVG } from 'react-svg';

import { Fetcher, protectedRoute, request, socket } from '../../api';
import User from '../user/user';
import history from '../../history';

import closeIcon from '../../../images/close-icon.svg';
import replyIcon from '../../../images/reply-icon.svg';
import sendIcon from '../../../images/send-icon.svg'
import scrollUpIcon from '../../../images/scroll-up-icon.svg';

export default function Chat(props) {
  const [fetcherObj, setFetcherObj] = useState(null);

  const chatBox = useRef(null);
  const [initialChatBoxHeight, setInitialChatBoxHeight] = useState(1);
  const lastMessagePointer = useRef(null);

  const [chatID, setChatID] = useState('');
  const [chat, setChat] = useState({});
  const [participants, setParticipants] = useState({});
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState(null);

  const KEY = {
    ENTER: 13
  };

  const focusOnChatBox = () => {
    if (chatBox.current) {
      chatBox.current.focus();
    }
  }

  const resizeChatBox = () => {
    if (chatBox.current) {
      chatBox.current.style.height = initialChatBoxHeight + 'px';
      chatBox.current.rows = Math.floor(chatBox.current.scrollHeight / initialChatBoxHeight);
      chatBox.current.style.height = 'auto';
    }
  };

  const scrollToLastMessage = () => {
    if (lastMessagePointer.current) {
      lastMessagePointer.current.scrollIntoView();
    }
  };

  useEffect(() => {
    setChatID(String(props.chatID));
  }, [props.chatID]);

  useEffect(() => {
    const fetcher = new Fetcher();
    setFetcherObj(fetcher);

    if (chatBox.current) {
      chatBox.current.rows = 1;
      chatBox.current.style.height = 'auto';
      setInitialChatBoxHeight(Math.max(1, parseInt(getComputedStyle(chatBox.current).height)));
      chatBox.current.focus();
    }

    if (chatID) {
      fetcher.retry(protectedRoute('/chat/', chatID),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (Fetcher.isNonEmpty(data)) {
              setChat(data.chat);
              setParticipants(data.participants);
            }
            else {
              history.push('/app/chat')
            }
          });

      fetcher.retry(protectedRoute('/chat/' + chatID + '/messages'),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (Fetcher.isNonEmpty(data)) {
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
      fetcher.abort();
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
        {renderMessage(findMessage(m.parent_id), false, true, false)}
      </blockquote>
    );
  };

  const renderMessage = (m, isLeaf, hideLink, isReply) => {
    if (!(m && Object.keys(m).length)) {
      return null;
    }

    return (
      <section key={m.id} id={'message-' + m.id} className="Message">
        <header className="Header">
          <div className="Heading">
            <div className="Author">
              <User user={participants[String(m.author_id)]} hideLink={hideLink} />
              <time className="Timestamp">{m.timestamp}</time>
            </div>

            <div className="Commands">
              {
                isReply
                  ? <button aria-label="Cancel reply" className="tertiary Icon Button Field">
                      <ReactSVG aria-hidden="true" src={closeIcon} onClick={() => setReplyMessage(null)} />
                    </button>
                  : <button aria-label="Reply" className="tertiary Icon Button Field">
                      <ReactSVG aria-hidden="true" src={replyIcon} onClick={() => {
                        setReplyMessage(m);
                        chatBox.current.focus();
                      }} />
                    </button>
              }
              {
                !isLeaf &&
                   <a aria-label="Go to message" className="tertiary Icon Button Field" href={'#message-' + m.id}>
                    <ReactSVG aria-hidden="true" src={scrollUpIcon} />
                  </a>
              }
            </div>
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
        {messages.map(m => renderMessage(m, true, false, false))}
        <span aria-hidden="true" ref={lastMessagePointer} />
      </article>
    )
  };

  const renderReplyMessage = () => {
    if  (replyMessage && Object.keys(replyMessage).length) {
      return (
        <blockquote className="Parent">
          {renderMessage(replyMessage, false, true, true)}
        </blockquote>
      );
    }
    else {
      return null;
    }

  };

  const sendMessage = () => {
    if (!chatBox.current) {
      return;
    }

    const pid = (replyMessage && Object.keys(replyMessage).length)
      ? { parent_id: replyMessage.id }
      : {}

    const values = {
      text: chatBox.current.value,
      ...pid
    }

    if (fetcherObj !== null && values.text) {
      fetcherObj.retry(protectedRoute('/chat/', chatID, '/message/send'),
        request({
          method: 'POST',
          credentials: true,
          csrfToken: 'access',
          body: values
        }))
          .then(data => {
            if (chatBox.current && data && data.sent) {
              chatBox.current.value = '';
              chatBox.current.rows = 1;
              setReplyMessage(null);
            }
          });
    }

    focusOnChatBox();
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

        <div className="ChatBoxContainer">
          {renderReplyMessage()}

          <form onSubmit={handleSubmit}>
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
      </div>
    </main>
  );
}
