import { BrowserRouter, Route, Switch } from 'react-router-dom';
import PublicApp from './public/app';
import ProtectedApp from './protected/app';

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={PublicApp} />
        <Route exact path="/app" component={ProtectedApp} />
        <Route component={PublicApp} />
      </Switch>
    </BrowserRouter>
  );
}
