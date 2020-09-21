import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import viewmodels from './viewmodel_keys';
import * as DC from './actions/data-chain';
import App from './containers/App';
import { setParameters } from './actions/redutils';
import * as fetchservice from './util/fetchService';
{{route_imports}}

export default () => (
  <App>
    <Switch>
{{routes}}
     {/*  <Route path={routes.COUNTER} component={CounterPage} />
      <Route path={routes.HOME} component={HomePage} /> */}
    </Switch>
  </App>
);
