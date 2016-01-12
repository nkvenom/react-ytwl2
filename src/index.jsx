import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

var iApp = ReactDOM.render(<App apiReady={registerListener}/>, document.getElementById('root'));
