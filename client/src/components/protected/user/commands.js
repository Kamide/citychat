import { UserRelation, apiFetch, fetchRetry, request, protectedRoute } from '../../api';

export default function UserCommands(props) {
  if (!props.relationship) {
    return null;
  }

  let commands = [];

  const newCommand = (key, value, onClick) => {
    return <button key={key} type="button" onClick={onClick}>{value}</button>;
  };

  const friendRequest = (path, method) => {
    fetchRetry(protectedRoute('/user/id/', props.userID, '/relationship'),
      request({
        method: 'GET',
        credentials: true
      }))
        .then(data => {
          if (data) {
            const oldRelationship = props.relationship;
            props.setRelationship(data.relationship);

            if (oldRelationship === data.relationship) {
              apiFetch(protectedRoute('/user/id/', props.userID, '/friend', path),
                request({
                  method: method,
                  credentials: true,
                  csrfToken: 'access'
                }))
                  .then(data => {
                    if (data) {
                      props.setRelationship(data.relationship);
                    }
                  });
            }
          }
        });
  };

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

  switch (props.relationship) {
    case UserRelation.STRANGER:
      commands.push(newCommand('requestSend', 'Send Friend Request',
        () => friendRequest('/request', 'POST')));
      break;
    case UserRelation.FRIEND_REQUEST_FROM_A_TO_B:
      friendRequestCommand(props.isUserA);
      break;
    case UserRelation.FRIEND_REQUEST_FROM_B_TO_A:
      friendRequestCommand(!props.isUserA);
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
    <span>
      {commands.map(c => c)}
    </span>
  );
}
