
import React from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import PoseClassifiers from './PoseClassifiers'
import Scheduler from './Scheduler'
import { Provider } from 'react-redux';
import store from '../store';
import DataSyncher from './DataSyncher';

const Index = () => (
  <div />
);

const AppRouter = () => (
  <Router>
    <Provider store={store}>
      <div className="App container-fluid">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/pose_classifier/">Pose Classifier</Link>
            </li>
            <li>
              <Link to="/scheduler/">Scheduler</Link>
            </li>
          </ul>
        </nav>

        <Route path="/" exact component={Index} />
        <Route path="/pose_classifier/" component={PoseClassifiers} />
        <Route path="/scheduler/" component={Scheduler} />
        <DataSyncher />
      </div>
    </Provider>
  </Router>
);

export default AppRouter
