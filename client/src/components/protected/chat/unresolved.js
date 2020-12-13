import { useEffect } from 'react';

import { fetchRetry, protectedRoute, request } from '../../api';
import history from '../../history';

export default function UnresolvedChat(props) {
  useEffect(() => {
    if (props.userID !== undefined) {
      fetchRetry(protectedRoute('/chat/users/', props.userID),
        request({
          method: 'PUT',
          credentials: true,
          csrfToken: 'access'
        }))
          .then(data => {
            if (data && Object.keys(data).length) {
              history.replace('/app/chat/' + data.chat_id)
            }
            else {
              history.replace('/app/chat')
            }
          });
    }
  }, [props.userID]);

  return null;
}
