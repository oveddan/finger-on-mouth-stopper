import React from 'react'
import { Link, NavLink } from 'react-router-dom';

const Nav = () => (
  <header className="navbar navbar-expand-lg navbar-light bg-light">
    <a className="navbar-brand" href="#">The Self-Driving Human</a>
    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <NavLink to="/pose_classifier/" className="nav-link" activeClassName='active'>Hyper-Surveillance System</NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/scheduler/" className="nav-link" activeClassName='active'>Decision Controller</NavLink>
        </li>
      </ul>
    </div>
  </header>
)

export default Nav;
