import { useState, useEffect } from 'react';
import { Link, Route } from 'react-router-dom';

import { GET_OPT_JWT, apiFetch, deleteOptCSRF, protectedRoute, privateRoute } from '../api';
import User from './user';
import Search from './search';
import history from '../history';

export default function Nav() {
  const [user, setUser] = useState({});

  useEffect(() => {
    apiFetch(protectedRoute('/user/self'), GET_OPT_JWT)
      .then(data => {
        if (data) {
          setUser(data.user);
        }
      });
  }, []);

  const logout = () => {
    apiFetch(protectedRoute('/logout'), deleteOptCSRF());
    apiFetch(privateRoute('/logout'), deleteOptCSRF(true))
      .then(data => {
        if (data.blacklisted) {
          history.push('/');
        }
      });
  };

  return (
    <div className="align-items--center display--flex justify-content--space-between">
      <nav>
        <ul className="display--flex margin-right--s--child-universal zero--list-style zero--margin zero--padding">
          <li><Link to='/app/dashboard'>Dashboard</Link></li>
          <li>Messages</li>
          <li>Groups</li>
          <li>Organizations</li>
        </ul>
      </nav>
      <Route component={Search} />
      <div>
        <User user={user} />
        <button className="button" type="button" onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}
