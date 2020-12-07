import { Route, Switch } from 'react-router-dom';

import PrivateChat from './private';

export default function ChatApp() {
  return (
    <Switch>
      <Route path="/app/chat" component={PrivateChat} />
    </Switch>
  );
}
