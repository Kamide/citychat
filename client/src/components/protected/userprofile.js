import { useState, useEffect } from 'react';

import { GET_OPT_JWT, fetchRetry, protectedRoute } from '../api';

export default function UserProfile(props) {
  const [user, setUser] = useState();

  useEffect(() => {
    fetchRetry(protectedRoute('/user/id/' + props.match.params.id), GET_OPT_JWT)
      .then(data => {
        if (data) {
          setUser(data.user);
        }
      });
  }, [props.match.params.id]);

  const userDNE = (
    <div>
      <p>This user does not exist.</p>
    </div>
  );

  const renderUser = () => (
    <div>
      <h1>{user.name}</h1>
      <p>@{user.id}</p>
    </div>
  );

  return user ? renderUser() : userDNE;
}
