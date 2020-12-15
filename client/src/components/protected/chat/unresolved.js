import { useEffect } from 'react';

import { Fetcher, protectedRoute, request } from '../../api';
import history from '../../history';

export default function UnresolvedChat(props) {
  useEffect(() => {
    const fetcher = new Fetcher();

    if (props.userID !== undefined) {
      fetcher.retry(protectedRoute('/chat/users/', props.userID),
        request({
          method: 'PUT',
          credentials: true,
          csrfToken: 'access'
        }))
          .then(data => {
            if (Fetcher.isNonEmpty(data)) {
              history.replace('/app/chat/' + data.chat_id)
            }
            else {
              history.replace('/app/chat')
            }
          });
    }

    return () => fetcher.abort();
  }, [props.userID]);

  return null;
}
