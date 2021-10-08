import React, { Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Monitoring from './components/monitoring.js';
import HelloGarfish from './components/helloGarfish.js';
import RemoteComponent from './components/remoteComponent.js';
// sandbox
import SetProxyVariable from './components/sandbox/setProxyVariable.js';
import './App.css';

const LazyComponent = React.lazy(() => import('./components/lazyComponent.js'));

export default function App({ basename }) {
  return (
    <Router basename={basename}>
      <div className="ReactApp">
        <ul className="nav-bas">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/lazy-component">Lazy Component</Link>
          </li>
          <li>
            <Link to="/monitoring">monitoring Component</Link>
          </li>
          <li>
            <Link to="/remote-component">Remote Component</Link>
          </li>
        </ul>
        <ul className="nav-bas">
          <li>
            <Link to="/set-proxy-variable">sandbox set proxy variable</Link>
          </li>
        </ul>

        <Switch>
          <Route exact path="/">
            <HelloGarfish />
          </Route>
          <Route path="/lazy-component">
            <Suspense fallback={<div>Loading...</div>}>
              <LazyComponent />
            </Suspense>
          </Route>
          <Route path="/remote-component">
            <RemoteComponent />
          </Route>
          <Route path="/monitoring">
            <Monitoring />
          </Route>
          {/* sandbox */}
          <Route path="/set-proxy-variable">
            <SetProxyVariable />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}