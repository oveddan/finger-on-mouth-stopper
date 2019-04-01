
import React from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import CamerasAndClassifications from './CamerasAndClassifications'
import Scheduler from './Scheduling/Scheduler'
import { Provider } from 'react-redux';
import store from '../store';
import DataSyncher from './DataSyncher';
import Nav from './Nav';
import PoseClassifier from './PoseClassifier';

const Index = () => (
  <div />
);

const AppRouter = () => (
  <Router>
    <Provider store={store}>
      <div className="App container-fluid">
        <Nav />
        <Route path="/" exact component={Index} />
        <Route path="/pose_classifier/" component={CamerasAndClassifications} />
        <Route path="/scheduler/" component={Scheduler} />
        <DataSyncher />
        <PoseClassifier />
      </div>
    </Provider>
  </Router>
);

export default AppRouter
