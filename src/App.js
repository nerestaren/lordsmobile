import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';

import Home from './Home'
import Gathering from './Gathering'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
          <div>
              <Route exact path="/" component={Home} />
              <Route path="/gathering" component={Gathering} />
          </div>
      </BrowserRouter>
    );
  }
}

export default App;
