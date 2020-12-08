import { useEffect } from 'react';

import { fetchRetry, protectedRoute, request } from '../../api';
import history from '../../history';

export default function UnresolvedChat(props) {
  useEffect(() => {
    fetchRetry(protectedRoute('/chat/user/', props.userID),
      request({
        method: 'PUT',
        credentials: true,
        csrfToken: 'access'
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            history.push('/app/chat/' + data.chat_id)
          }
          else {
            history.push('/app/chat')
          }
        });
  }, [props.userID]);

  return null;
}
