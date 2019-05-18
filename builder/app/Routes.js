import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import Dashboard from './components/dashboard';
export default () => (
  <App>
    <Switch>
      <Route path={routes.HOME} component={Dashboard} />
    </Switch>
  </App>
);
