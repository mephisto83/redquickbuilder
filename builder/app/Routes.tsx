import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import Dashboard from './components/dashboard';
import ObjectViewer from './components/objectviewer';
import CodeViewer from './components/codeviewer';
export default () => (
	<App>
		<Switch>
			<Route path={routes.OBJECT_VIEWER} component={ObjectViewer} />
			<Route path={routes.CODE_VIEWER} component={CodeViewer} />
			<Route path={routes.HOME} component={Dashboard} />
		</Switch>
	</App>
);
