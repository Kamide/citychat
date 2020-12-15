import { useContext, useEffect, useState } from 'react';

import { Fetcher, UserRelation, apiFetch, protectedRoute, request, socket } from '../../api';
import { StoreContext } from '../../store';

export default function UserCommands(props) {
  const [state] = useContext(StoreContext);
  const [relationship, setRelationship] = useState('');
  const [fetcher] = useState(new Fetcher());

  useEffect(() => {
    if (props.userID !== undefined && String(props.userID) !== String(state.user.id)) {
      fetcher.retry(protectedRoute('/user/id/', props.userID, '/relationship'),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (Fetcher.isNonEmpty(data)) {
              setRelationship(data.relationship);
            }
          });

      socket.open().then(io => {
        io.on('relation_update', userRelationship => {
          if (UserRelation.usersHaveRelationship([props.userID, state.user.id], userRelationship)) {
            setRelationship(userRelationship.relation);
          }
        });
      });
    }
  }, [fetcher, props.userID, state.user.id]);

  if (!relationship) {
    return null;
  }

  let commands = [];

  const newCommand = (key, value, onClick) => {
    return <button className="secondary Text Button Field" key={key} onClick={onClick}>{value}</button>;
  };

  const friendRequest = (path, method) => {
    if (props.userID !== undefined) {
      fetcher.retry(protectedRoute('/user/id/', props.userID, '/relationship'),
        request({
          method: 'GET',
          credentials: true
        }))
          .then(data => {
            if (Fetcher.isNonEmpty(data)) {
              const oldRelationship = relationship;
              setRelationship(data.relationship);

              if (oldRelationship === data.relationship) {
                apiFetch(protectedRoute('/user/id/', props.userID, '/friend', path),
                  request({
                    method: method,
                    credentials: true,
                    csrfToken: 'access'
                  }))
                    .then(data => {
                      if (Fetcher.isNonEmpty(data)) {
                        setRelationship(data.relationship);
                      }
                    });
              }
            }
          });
    }
  };

  const friendRequestCommand = () => {
    if (UserRelation.userIsRequester([props.userID, state.user.id], state.user.id, relationship)) {
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
      friendRequestCommand();
      break;
    case UserRelation.FRIEND_REQUEST_FROM_B_TO_A:
      friendRequestCommand();
      break;
    case UserRelation.FRIEND:
      commands.push(newCommand('unfriend', 'Unfriend',
        () => friendRequest('/unfriend', 'DELETE')));
      break;
    default:
      break;
  }

  if (!commands.length || String(props.userID) === String(state.user.id)) {
    return null;
  }

  return (
    <span>
      {commands.map(c => c)}
    </span>
  );
}
