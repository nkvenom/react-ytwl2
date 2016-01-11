import React, { Component } from 'react';
import moment from  'moment';
import { formatDuration } from './utils';


export class NavBar extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container"><ul className="nav navbar-nav">
            {this.props.children}
          </ul></div>
      </nav>
    );
  }
}
