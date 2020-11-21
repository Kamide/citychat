import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { fetchRetry, postReqCSRF, protectedRoute } from '../api';

export default function ProtectedApp() {
  let history = useHistory();

  useEffect(() => {
    fetchRetry(protectedRoute('/refresh'), postReqCSRF('', true), 10, 1000)
      .then(data => {
        if (data.status !== 200) {
          return history.push('/login');
        }
      });
  }, [history]);

  return (
    <div>
      <h1>Protected</h1>
    </div>
  );
}
