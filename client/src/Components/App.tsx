
import React from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Link, Redirect } from "react-router-dom";

import CamerasAndClassifications from './CamerasAndClassifications'
import Scheduler from './Scheduling/Scheduler'
import { Provider } from 'react-redux';
import store from '../store';
import DataSyncher from './DataSyncher';
import Nav from './Nav';
import PoseClassifier from './PoseClassifier';

const Index = () => <Redirect to='/pose_classifier' />

const AppRouter = () => (
  <Router>
    <Provider store={store}>
        <Nav />
        <div className="container-fluid">
          <div className='row flex-xl-nowrap'>
            <main className='col'>
              <Route path="/" exact component={Index} />
              <Route path="/pose_classifier/" component={CamerasAndClassifications} />
              <Route path="/scheduler/" component={Scheduler} />
              <DataSyncher />
              <PoseClassifier />
            </main>
          </div>
        </div>
    </Provider>
  </Router>
);

export default AppRouter
