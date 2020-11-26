import { useState, useEffect } from 'react';
import { Link, Route } from 'react-router-dom';

import { apiFetch, fetchRetry, options, protectedRoute, privateRoute } from '../api';
import User from './user';
import Search from './search';
import history from '../history';

export default function Nav() {
  const [user, setUser] = useState();

  useEffect(() => {
    apiFetch(protectedRoute('/user/self'), options({method: 'GET', credentials: true}))
      .then(data => {
        if (data) {
          setUser(data.user);
        }
      });
  }, []);

  const logout = () => {
    fetchRetry(protectedRoute('/logout'), options({method: 'DELETE', credentials: true, csrfToken: 'access'}));
    fetchRetry(privateRoute('/logout'), options({method: 'DELETE', credentials: true, csrfToken: 'refresh'}))
      .then(data => {
        if (data) {
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
