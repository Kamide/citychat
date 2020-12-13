import { useContext } from 'react';
import { Link } from 'react-router-dom';

import { fetchRetry, request, protectedRoute, privateRoute } from '../api';
import { StoreContext } from '../store';
import User from './user/user';
import history from '../history';

import Logo from '../logo';

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

  const destinations = [
    ['/app/chat', 'Chats'],
    ['/app/groups', 'Groups'],
    ['/app/contacts', 'Contacts']
  ]

  return (
    <header className="secondary Grid">
      <header className="primary Masthead">
        <Logo />
      </header>

      <nav className="primary Menu">
        <div className="Section Item">
          <User user={state.user} />
          <button onClick={logout}>Log Out</button>
        </div>

        <ul className="Menu Section">
          {destinations.map((x, i) => (
            <li key={i}>
              <Link className="Item" to={x[0]}>{x[1]}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
