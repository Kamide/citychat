import { useContext } from 'react';
import { Link, Route } from 'react-router-dom';

import { fetchRetry, request, protectedRoute, privateRoute } from '../api';
import { StoreContext } from '../store';
import User from './user/user';
import Search from './search/search';
import history from '../history';

export default function Nav(props) {
  const [state, dispatch] = useContext(StoreContext);

  const logout = () => {
    fetchRetry(protectedRoute('/logout'),
      request({
        method: 'DELETE',
        credentials: true,
        csrfToken: 'access'
      }));
    fetchRetry(privateRoute('/logout'),
      request({
        method: 'DELETE',
        credentials: true,
        csrfToken: 'refresh'
      }))
        .then(data => {
          if (data && Object.keys(data).length) {
            dispatch({ type: 'RESET_USER' });
            history.push('/');
          }
        });
  };

  return (
    <div className="align-items--center display--flex justify-content--space-between">
      <nav>
        <ul className="display--flex margin-right--s--child-universal zero--list-style zero--margin zero--padding">
          <li><Link to='/app/dashboard'>Dashboard</Link></li>
          <li><Link to='/app/friends'>Friends</Link></li>
          <li><Link to='/app/chat'>Messages</Link></li>
          <li>Groups</li>
        </ul>
      </nav>
      <Route component={Search} />
      <div>
        <User user={state.user} />
        <button className="button" type="button" onClick={logout}>Log Out</button>
      </div>
    </div>
  );
}
