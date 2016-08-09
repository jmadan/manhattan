import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Main from './components/main';
import Home from './components/home';
import Interest from './components/interest';

const router = (
	<Router history={browserHistory}>
		<Route path="/" component={Main}>
			<IndexRoute component={Home}></IndexRoute>
			<Route path="/interest" component={Interest}></Route>
		</Route>
	</Router>
)

ReactDom.render(router, document.getElementById('root'));