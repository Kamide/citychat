import { useState, useEffect } from 'react';

import { UserRelation, apiFetch, fetchRetry, request, protectedRoute } from '../api';

export default function UserProfile(props) {
  const [user, setUser] = useState();
  const [isUserA, setIsUserA] = useState(false);
  const [relationship, setRelationship] = useState('');

  useEffect(() => {
    fetchRetry(protectedRoute('/user/id/', props.match.params.id),
      request({
        method: 'GET',
        credentials: true
      }))
        .then(data => {
          if (data) {
            setUser(data.user);
          }
        });

    fetchRetry(protectedRoute('/user/id/', props.match.params.id, '/relationship'),
      request({
        method: 'GET',
        credentials: true
      }))
        .then(data => {
          if (data) {
            setIsUserA(data.is_user_a);
            setRelationship(data.relationship);
          }
        });
  }, [props.match.params.id]);

  const userDNE = (
    <div>
      <p>This user does not exist.</p>
    </div>
  );

  const friendRequest = (path, method) => {
    apiFetch(protectedRoute('/user/id/', props.match.params.id, '/friend', path),
      request({
        method: method,
        credentials: true,
        csrfToken: 'access'
      }))
        .then(data => {
          if (data) {
            setRelationship(data.relationship);
          }
        });
  };

  const newCommand = (key, value, onClick) => {
    return <button key={key} type="button" onClick={onClick}>{value}</button>;
  };

  const renderCommands = () => {
    if (!relationship) {
      return null;
    }

    let commands = [];

    const friendRequestCommand = (userA) => {
      if (userA) {
        commands.push(newCommand('requestCancel', 'Cancel Friend Request',
          () => friendRequest('/request/cancel', 'DELETE')));
      }
      else {
        commands.push(newCommand('requestAccept', 'Accept Friend Request',
          () => friendRequest('/request/accept', 'PUT')));
        commands.push(newCommand('requestReject', 'Reject Friend Request',
          () => friendRequest('/request/reject', 'DELETE')));
      }
    };

    switch (relationship) {
      case UserRelation.STRANGER:
        commands.push(newCommand('requestSend', 'Send Friend Request',
          () => friendRequest('/request', 'POST')));
        break;
      case UserRelation.FRIEND_REQUEST_FROM_A_TO_B:
        friendRequestCommand(isUserA);
        break;
      case UserRelation.FRIEND_REQUEST_FROM_B_TO_A:
        friendRequestCommand(!isUserA);
        break;
      case UserRelation.FRIEND:
        commands.push(newCommand('unfriend', 'Unfriend',
          () => friendRequest('/unfriend', 'DELETE')));
        break;
      default:
        break;
    }

    if (!commands.length) {
      return null;
    }

    return (
      <div>
        {commands.map(c => c)}
      </div>
    );
  };

  const renderUser = () => (
    <div>
      <div>
        <h1>{user.name}</h1>
        {renderCommands()}
      </div>
      <p>@{user.id}</p>
    </div>
  );

  return user ? renderUser() : userDNE;
}
