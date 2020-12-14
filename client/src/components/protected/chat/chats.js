import { Fragment, useEffect, useState } from 'react';
import { Link, Route, Switch } from 'react-router-dom';
import { ReactSVG } from 'react-svg';

import { fetchRetry, protectedRoute, request, socket } from '../../api';
import Chat from './chat';
import Compose from './compose';
import UnresolvedChat from './unresolved';
import history from '../../history';

import newChatIcon from '../../../images/new-chat-icon.svg';

export default function Chats() {
  const [conversations, setConversations] = useState([]);
  const [visible, setVisible] = useState(false);

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

  const renderChats = () => {
    if (!conversations.length) {
      return <p className="Content">Your conversations with others will appear here.</p>;
    }

    return (
      <ul className="Chats Menu">
        {conversations.map(c => {
          const latestMessageSender = c.participants[c.latest_message.author_id].nickname || c.participants[c.latest_message.author_id].name

          return (
            <li key={c.chat.id} className="Item" onClick={() => history.push('/app/chat/' + c.chat.id)}>
              <Link className="Name" to={'/app/chat/' + c.chat.id}>
                {c.chat.name}
              </Link>
              <ul className="Preview">
                <li>
                  <span className="Author">{latestMessageSender}: </span>
                  <q>{c.latest_message.content}</q
                ></li>
              </ul>
            </li>
          );
        })}
      </ul>
    );
  };

  const toggle = () => {
    setVisible(prevVisible => !prevVisible);
  };

  return (
    <Fragment>
      <div className="secondary Grid">
        <header className="secondary Masthead">
          <h1 className="Heading">Chats</h1>
          <div>
            <button aria-label="Start a new chat" className="primary Icon Button Field" onClick={toggle}>
              <ReactSVG aria-hidden="true" src={newChatIcon} />
            </button>

            {visible && <Compose setVisible={setVisible} />}
          </div>
        </header>

        <nav className="secondary Menu">
          {renderChats()}
        </nav>
      </div>

      <Switch>
        <Route exact path="/app/chat/:id" render={props =>
          <Chat {...props} chatID={props.match.params.id} />} />
        <Route exact path="/app/chat/user/:id" render={props =>
          <UnresolvedChat {...props} userID={props.match.params.id} />} />
      </Switch>
    </Fragment>
  );
}
