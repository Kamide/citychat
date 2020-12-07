import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchRetry, request, protectedRoute } from '../../api';
import UserCommands from './commands';

export default function User(props) {
  const [user, setUser] = useState({});
  const [relationship, setRelationship] = useState('');
  const [isUserA, setIsUserA] = useState(false);

  useEffect(() => {
    if (props.user) {
      setUser(props.user);
    }
    else {
      fetchRetry(protectedRoute('/user/id/', props.userID),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (Object.keys(data).length) {
              setUser(data.user);
            }
          });
    }

    if (props.showCommands) {
      const userID = props.userID || props.user.id;

      if (userID !== undefined) {
        fetchRetry(protectedRoute('/user/id/', userID, '/relationship'),
          request({
            method: 'GET',
            credentials: true
          }))
            .then(data => {
              if (Object.keys(data).length) {
                setIsUserA(data.is_user_a);
                setRelationship(data.relationship);
              }
            });
      }
    }
  }, [props.user, props.userID, props.showCommands]);

  const userDNE = (
    <div>
      <p>This user does not exist.</p>
    </div>
  );

  const renderUser = () => {
    const userTag = (
      <span>
        {user.name} <span>@{user.id}</span>
      </span>
    );
    const commands = (
      <UserCommands
        userID={user.id}
        relationship={relationship}
        setRelationship={setRelationship}
        isUserA={isUserA} />
    );

    if (props.detailed) {
      return (
        <div>
          <h1>{userTag}</h1>
          {commands}
        </div>
      );
    }
    else {
      return (
        <div>
          <p><Link to={'/app/user/' + user.id}>{userTag}</Link></p>
          {props.showCommands && commands}
        </div>
      );
    }
  };

  return user ? renderUser() : userDNE;
}
