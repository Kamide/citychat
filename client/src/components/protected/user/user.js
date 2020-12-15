import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { Link } from 'react-router-dom';

import { Fetcher, protectedRoute, request } from '../../api';
import { initialState } from '../../store';
import UserCommands from './commands';
import history from '../../history';

import chatIcon from '../../../images/chat-icon.svg';
import defaultProfilePicture from '../../../images/default-profile-picture.svg';

export default function User(props) {
  const [user, setUser] = useState(initialState.user);

  useEffect(() => {
    const fetcher = new Fetcher();

    if (props.user) {
      setUser(props.user);
    }
    else {
      if (props.userID !== undefined) {
        fetcher.retry(protectedRoute('/user/id/', props.userID),
          request({
            method: 'GET',
            credentials: true
          }))
            .then(data => {
              if (Fetcher.isNonEmpty(data)) {
                setUser(data.user);
              }
            });
      }
    }

    return () => fetcher.abort();
  }, [props.user, props.userID]);

  const username = props.hideLink || props.profile
    ? user.name
    : (
      <Link to={'/app/user/' + user.id}>
        {user.name}
      </Link>
    );

  const viewProfile = () => {
    if (!(props.hideLink || props.profile)) {
      history.push('/app/user/' + user.id);
    }
  };

  const sendMessage = () => {
    history.push('/app/chat/user/' + user.id);
  };

  return (
    <div className={'UserContainer ' + (props.className || '')}>
      <figure className="User" onClick={viewProfile}>
        <img className="Picture" src={defaultProfilePicture} alt={user.name} />
        <figcaption className="Name">
          {username}
        </figcaption>
      </figure>

      {
        (props.showCommands || props.profile) &&
        <div className="UserCommands">
          <button aria-label="Send message" className="primary Icon Button Field" onClick={sendMessage}>
            <ReactSVG aria-hidden="true" src={chatIcon} />
          </button>
          <UserCommands userID={user.id} />
        </div>
      }
    </div>
  );
}
