
import React from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import PoseClassifier from './PoseClassifier'
import Scheduler from './Scheduler'

const Index = () => (
  <div />
);


const AppRouter = () => (
  <Router>
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
      <Route path="/pose_classifier/" component={PoseClassifier} />
      <Route path="/scheduler/" component={Scheduler} />
    </div>
  </Router>
);

export default AppRouter