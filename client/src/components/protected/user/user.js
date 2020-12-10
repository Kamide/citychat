import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchRetry, request, protectedRoute } from '../../api';
import { StoreContext } from '../../store';
import UserCommands from './commands';
import UserTag from './tag';

export default function User(props) {
  const [state] = useContext(StoreContext);
  const [user, setUser] = useState({});
  const [relationship, setRelationship] = useState('');

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
              else {
                setUser(null)
              }
            });
      }
    }

    const userID = props.userID || (props.user && props.user.id);

    if (userID !== undefined
        && String(userID) !== String(state.user.id)
        && (props.showCommands || props.profile)) {
      fetchRetry(protectedRoute('/user/id/', userID, '/relationship'),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (data && Object.keys(data).length) {
              setRelationship(data.relationship);
            }
          });
    }
  }, [props.user, props.userID, props.showCommands, props.profile, state.user.id]);

  const placeholder = (
    <div>
      <p>CityChat User</p>
    </div>
  );

  const userDNE = (
    <div>
      <p>This user does not exist.</p>
    </div>
  );

  const renderUser = () => {
    const UserTagContainer = props.profile ? 'h1' : 'p';

    const userTag = (
      props.hideLink || props.profile
        ? <UserTag user={user} />
        : (
          <Link to={'/app/user/' + user.id}>
            <UserTag user={user} />
          </Link>
        )
    );

    const sendMessageButton = (
      props.showSendMessageButton || props.profile
        ? (
          <button type="button">
            <Link to={'/app/chat/user/' + user.id}>
              Send Message
            </Link>
          </button>
        )
        : null
    );

    const commands = (
      props.showCommands || props.profile
        ? (
          <UserCommands
            userID={user.id}
            relationship={relationship}
            setRelationship={setRelationship} />
        )
        : null
    );

    return (
      <div>
        <UserTagContainer>{userTag}</UserTagContainer>
        {sendMessageButton}
        {commands}
      </div>
    );
  };

  return user
    ? (
        Object.keys(user).length
          ? renderUser()
          : placeholder
    )
    : userDNE;
}
