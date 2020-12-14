import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchRetry, protectedRoute, request } from '../../api';
import { initialState } from '../../store';
import UserCommands from './commands';

import defaultProfilePicture from '../../../images/default-profile-picture.svg';

export default function User(props) {
  const [user, setUser] = useState(initialState.user);

  useEffect(() => {
    if (props.user) {
      setUser(props.user);
    }
    else {
      if (props.userID !== undefined) {
        fetchRetry(protectedRoute('/user/id/', props.userID),
          request({
            method: 'GET',
            credentials: true
          }))
            .then(data => {
              if (data && Object.keys(data).length) {
                setUser(data.user);
              }
            });
      }
    }
  }, [props.user, props.userID]);

  const username = props.hideLink || props.profile
    ? user.name
    : (
      <Link to={'/app/user/' + user.id}>
        {user.name}
      </Link>
    );

  const sendMessageButton = (
    props.showSendMessageButton || props.profile
      ? (
        <button>
          <Link to={'/app/chat/user/' + user.id}>
            Send Message
          </Link>
        </button>
      )
      : null
  );

  const commands = (
    props.showCommands || props.profile
      ? <UserCommands userID={user.id} />
      : null
  );

  return (
    <Fragment>
      <figure className={'User ' + (props.className || '')}>
        <img className="Picture" src={defaultProfilePicture} alt={user.name} />
        <figcaption className="Name">
          {username}
        </figcaption>
      </figure>

      {sendMessageButton}
      {commands}
    </Fragment>
  );
}
