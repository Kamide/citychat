import { useState, useEffect } from 'react';

import { GET_OPT_JWT, apiFetch, protectedRoute } from '../api';
import User from './user';

export default function Nav() {
  const [user, setUser] = useState({});

  useEffect(() => {
    apiFetch(protectedRoute('/user/self'), GET_OPT_JWT)
      .then(data => {
        if (data) {
          console.log(JSON.stringify(data));
          setUser(data.user);
        }
      });
  }, []);

  return (
    <div className="display--flex justify-content--space-between ">
      <nav>
        <ul className="display--flex margin-right--s--child-universal zero--list-style zero--margin zero--padding">
          <li>Dashboard</li>
          <li>Friends</li>
          <li>Groups</li>
        </ul>
      </nav>
      <div>
        <User user={user} />
      </div>
    </div>
  );
}
