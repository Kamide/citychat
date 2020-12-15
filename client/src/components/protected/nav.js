import { useContext, useState } from 'react';
import { Link, Route } from 'react-router-dom';

import { Fetcher, request, protectedRoute, privateRoute } from '../api';
import { StoreContext } from '../store';
import Navigator from '../navigator';
import Search from './search/search';
import User from './user/user';
import history from '../history';

import { CityDialog } from '../cityform';

import Logo from '../logo';

export default function Nav() {
  const [state, dispatch] = useContext(StoreContext);
  const [visible, setVisible] = useState(false)

  const logout = () => {
    const fetcher = new Fetcher();
    fetcher.retry(protectedRoute('/logout'),
      request({
        method: 'DELETE',
        credentials: true,
        csrfToken: 'access'
      }));
    fetcher.retry(privateRoute('/logout'),
      request({
        method: 'DELETE',
        credentials: true,
        csrfToken: 'refresh'
      }))
        .then(data => {
          if (Fetcher.isNonEmpty(data)) {
            dispatch({ type: 'RESET_USER' });
            history.push('/');
          }
        });
    return () => fetcher.abort();
  };

  return (
    <div className="secondary Grid">
      <header className="primary Masthead">
        <Link to='/app'>
          <Logo />
        </Link>
      </header>

      <nav className="primary Menu">
        <User user={state.user} className="Section Item" />

        <ul className="Menu Section">
          <Route component={props =>
            <Navigator
              className="Item"
              destinations={[
                ['/app/chat', 'Chats'],
                ['/app/contacts', 'Contacts'] ]}
              {...props} />} />
        </ul>

        <div className="Menu Section">
          <button className="Button Field Item" onClick={() => setVisible(prevVisible => !prevVisible)}>Search</button>
          {visible &&
            <CityDialog heading="Search" setVisible={setVisible}>
              <Route component={(props) => <Search setVisible={setVisible} {...props} />} />
            </CityDialog>}
        </div>

        <button className="Button Field Item" onClick={logout}>
          Log Out
        </button>
      </nav>
    </div>
  );
}
