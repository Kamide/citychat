import { useContext, useState } from 'react';
import { Route } from 'react-router-dom';

import { fetchRetry, request, protectedRoute, privateRoute } from '../api';
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
    <div className="secondary Grid">
      <header className="primary Masthead">
        <Logo />
      </header>

      <nav className="primary Menu">
        <div className="Section Item">
          <User user={state.user} />
          <button onClick={logout}>Log Out</button>
        </div>

        <ul className="Menu Section">
          <Route component={props =>
            <Navigator
              className="Item"
              destinations={[
                ['/app/chat', 'Chats'],
                ['/app/groups', 'Groups'],
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
      </nav>
    </div>
  );
}
