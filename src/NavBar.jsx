import React, { Component } from 'react';
import moment from  'moment';
import { formatDuration } from './utils';


export class NavBar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var { userName, picture, url } = this.props;
    console.log(userName);
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <ul className="nav navbar-nav">
              {this.props.children}
            </ul>


            <ul className="nav navbar-nav navbar-right">
              <li> <a className="roundedAvatar" href={url} alt={userName}> <img width="32" height="32" src={picture} alt={userName} /> </a></li>
            </ul>
          </div>
      </nav>
    );
  }
}
